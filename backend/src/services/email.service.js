const {
  brevoApiKey,
  brevoSenderEmail,
  brevoSenderName,
} = require('../config/env');

const sendEmail = async ({ to, subject, htmlContent, textContent }) => {
  if (!brevoApiKey) {
    throw new Error('BREVO_API_KEY is not configured');
  }

  if (!brevoSenderEmail) {
    throw new Error('BREVO_SENDER_EMAIL is not configured');
  }

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'api-key': brevoApiKey,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      sender: {
        name: brevoSenderName || 'LandEstateX',
        email: brevoSenderEmail,
      },
      to: [
        {
          email: to,
        },
      ],
      subject,
      htmlContent,
      ...(textContent ? { textContent } : {}),
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    console.error('[EMAIL SERVICE] Brevo error:', {
      status: response.status,
      message: data?.message,
    });

    throw new Error('Unable to send email');
  }

  console.log('[EMAIL SERVICE] Email sent successfully:', {
    to,
    messageId: data?.messageId,
  });

  return data;
};

const sendVerificationEmail = async ({ to, name, otp }) => {
  return sendEmail({
    to,
    subject: 'Verify your LandEstateX account',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h2>Welcome to LandEstateX, ${name || 'User'}!</h2>

        <p>Thank you for creating your account.</p>

        <p>Your email verification OTP is:</p>

        <div style="
          font-size: 32px;
          font-weight: bold;
          letter-spacing: 8px;
          margin: 20px 0;
        ">
          ${otp}
        </div>

        <p>This OTP will expire in <strong>10 minutes</strong>.</p>

        <p>If you did not create this account, you can ignore this email.</p>

        <hr />

        <p style="color: #666;">
          Regards,<br />
          LandEstateX Team
        </p>
      </div>
    `,
    textContent: `
Welcome to LandEstateX!

Your email verification OTP is: ${otp}

This OTP will expire in 10 minutes.

Regards,
LandEstateX Team
    `,
  });
};

module.exports = {
  sendEmail,
  sendVerificationEmail,
};