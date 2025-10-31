

import nodemailer from 'nodemailer';

export async function sendEmail(to: string, subject: string, message: string) {
  try {
    // Configura el transporte
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS, 
      },
    });


    // Envía el correo
    await transporter.sendMail({
      from: `"Tu App" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html: `<p>${message}</p>`,
    });

    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error };
  }
}