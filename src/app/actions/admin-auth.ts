
'use server';

import { z } from 'zod';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { cookies } from 'next/headers';
import { encrypt } from '@/lib/session';

const adminEmails = (process.env.ADMIN_EMAILS || '').split(',');
const SECRET_KEY = process.env.SESSION_SECRET;

if (!SECRET_KEY) {
  throw new Error('SESSION_SECRET is not set in the environment variables.');
}

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function signInAdmin(values: z.infer<typeof formSchema>) {
  const validatedFields = formSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: 'Campos inválidos.' };
  }
  
  const { email, password } = validatedFields.data;
  
  if (!adminEmails.includes(email)) {
    return { error: 'Acceso denegado. Este usuario no es un administrador.' };
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Create the session
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    const session = await encrypt({ userId: user.uid, email: user.email, expires });

    // Set the session cookie
    cookies().set('adminSession', session, { expires, httpOnly: true, secure: process.env.NODE_ENV === 'production' });

    return { success: true };

  } catch (error: any) {
    console.error('Admin sign-in error:', error);
    if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
        return { error: 'Las credenciales son incorrectas.' };
    }
    return { error: 'Ocurrió un error inesperado durante el inicio de sesión.' };
  }
}


export async function logoutAdmin() {
  // Destroy the session
  cookies().set('adminSession', '', { expires: new Date(0) });
}
