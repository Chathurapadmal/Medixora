import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendOtpEmail(
  to: string,
  otp: string
): Promise<void> {
  const from = `"MediStock" <${process.env.SMTP_USER}>`;

  await transporter.sendMail({
    from,
    to,
    subject: "Password Reset OTP - MediStock",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <div style="background: #0b56d1; padding: 24px; text-align: center;">
          <h1 style="color: #fff; margin: 0; font-size: 24px;">MediStock</h1>
        </div>
        <div style="padding: 32px 24px; border: 1px solid #e4e7ef; border-top: 0;">
          <h2 style="color: #232736; font-size: 20px; margin: 0 0 12px;">Password Reset Request</h2>
          <p style="color: #4f5565; font-size: 15px; line-height: 1.6; margin: 0 0 20px;">
            Use the OTP below to reset your password. This code expires in <strong>10 minutes</strong>.
          </p>
          <div style="background: #f4f3fb; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 20px;">
            <span style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #0b56d1;">${otp}</span>
          </div>
          <p style="color: #8f95a5; font-size: 13px; margin: 0;">
            If you did not request this, please ignore this email.
          </p>
        </div>
      </div>
    `,
  });
}
