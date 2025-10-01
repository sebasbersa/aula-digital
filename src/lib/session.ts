
'use server';
import { SignJWT, jwtVerify } from 'jose';

const secretKey = process.env.SESSION_SECRET;
const key = new TextEncoder().encode(secretKey);

export async function encrypt(payload: any) {
  if (!secretKey) {
    throw new Error('SESSION_SECRET is not set in the environment variables.');
  }
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(key);
}

export async function decrypt(input: string | undefined): Promise<any> {
  if (!input) {
    return null;
  }
  if (!secretKey) {
    console.error('SESSION_SECRET is not set for decryption.');
    return null;
  }
  try {
    const { payload } = await jwtVerify(input, key, {
      algorithms: ['HS256'],
    });
    return payload;
  } catch (error) {
    // This will happen if the token is invalid or expired
    console.error('Failed to decrypt session:', error);
    return null;
  }
}
