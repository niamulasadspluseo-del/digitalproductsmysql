import nodemailer from 'nodemailer';

function getTransporter() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST) return null;
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

const from = () => process.env.SMTP_FROM || 'PixelMart <noreply@pixelmart.com>';

async function send(email: string, subject: string, html: string) {
  const transporter = getTransporter();
  if (transporter) {
    await transporter.sendMail({ from: from(), to: email, subject, html });
  } else {
    console.log(`\n========================================`);
    console.log(`To: ${email}`);
    console.log(`Subject: ${subject}`);
    console.log(html.replace(/<[^>]+>/g, ''));
    console.log(`========================================\n`);
  }
}

export async function sendPasswordResetEmail(email: string, link: string): Promise<void> {
  await send(email, 'Reset your PixelMart password',
    `<p>Click here to reset your password:</p><p><a href="${link}">${link}</a></p>`);
}

export async function sendSignupEmail(email: string, name: string, origin: string, verifyLink: string): Promise<void> {
  await send(email, 'Welcome to PixelMart!',
    `<p>Hi ${name},</p><p>Thank you for signing up!</p><p>Please verify your email:<br><a href="${verifyLink}">${verifyLink}</a></p><p>Start exploring: <a href="${origin}/shop">${origin}/shop</a></p><p>Happy shopping!<br>PixelMart Team</p>`);
}
