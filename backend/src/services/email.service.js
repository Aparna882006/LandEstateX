const {
  brevoApiKey,
  brevoSenderEmail,
  brevoSenderName,
  frontendUrl,
} = require('../config/env');

const escapeHtml = (value = '') =>
  String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[char]);

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
      to: [{ email: to }],
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
  const safeName = escapeHtml(name || 'User');

  return sendEmail({
    to,
    subject: 'Verify your LandEstateX account',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h2>Welcome to LandEstateX, ${safeName}!</h2>
        <p>Thank you for creating your account.</p>
        <p>Your email verification OTP is:</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 20px 0;">
          ${escapeHtml(otp)}
        </div>
        <p>This OTP will expire in <strong>10 minutes</strong>.</p>
        <p>If you did not create this account, you can ignore this email.</p>
        <hr />
        <p style="color: #666;">Regards,<br />LandEstateX Team</p>
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

const sendPasswordResetEmail = async ({ to, name, resetToken }) => {
  const resetUrl = new URL('/reset-password', frontendUrl);
  resetUrl.searchParams.set('token', resetToken);

  const safeName = escapeHtml(name || 'User');
  const safeUrl = escapeHtml(resetUrl.toString());

  return sendEmail({
    to,
    subject: 'Reset your LandEstateX password',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 30px auto; padding: 30px; border: 1px solid #e5e7eb; border-radius: 12px;">
        <h2 style="color: #172554;">Password Reset Request</h2>

        <p>Hello ${safeName},</p>

        <p>We received a request to reset your LandEstateX account password.</p>

        <p>Click the button below to choose a new password:</p>

        <div style="margin: 30px 0;">
          <a href="${safeUrl}"
             style="background: #172554; color: #ffffff; padding: 14px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Reset Password
          </a>
        </div>

        <p>This link will expire in <strong>30 minutes</strong>.</p>

        <p>If you did not request a password reset, please ignore this email. Your password will remain unchanged.</p>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 25px 0;" />

        <p style="color: #666;">Regards,<br />LandEstateX Team</p>
      </div>
    `,
    textContent: `
Hello ${name || 'User'},

We received a request to reset your LandEstateX password.

Open this link to reset your password:
${resetUrl.toString()}

This link will expire in 30 minutes.

If you did not request this, please ignore this email.

Regards,
LandEstateX Team
    `,
  });
};

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
};