import transporter from "../config/mailer.js";
import { env } from "../config/env.js";

export const sendOtpEmail = async (email: string, name: string, otp: string) => {
  
  await transporter.sendMail({
    from: `"Vehicle Rental" <${env.smtpFrom}>`,
    to: email,
    subject: "Your verification OTP",

    text: `Hi ${name},

  Your verification OTP is ${otp}.

  This OTP will expire in 5 minutes.

  If you did not request this OTP, you can safely ignore this email.

  Thanks,
  Vehicle Rental Team`,

      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>Email Verification</h2>

          <p>Hi ${name},</p>

          <p>Your verification OTP is:</p>

          <h1 style="letter-spacing: 8px;">
            ${otp}
          </h1>

          <p>
            This OTP will expire in <strong>5 minutes</strong>.
          </p>

          <p>
            If you did not request this OTP,
            you can safely ignore this email.
          </p>

          <p>
            Thanks,<br />
            Vehicle Rental Team
          </p>
        </div>
      `,
  });
};