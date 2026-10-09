require('dotenv').config();

async function testBrevo() {
  console.log('Testing Brevo email service...');
  console.log('Sender:', process.env.BREVO_SENDER_EMAIL);
  console.log('Recipient: aparnasingh8822@gmail.com');
  console.log('API key loaded:', !!process.env.BREVO_API_KEY);

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'api-key': process.env.BREVO_API_KEY,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      sender: {
        name: process.env.BREVO_SENDER_NAME || 'LandEstateX',
        email: process.env.BREVO_SENDER_EMAIL,
      },
      to: [
        {
          email: 'aparnasingh8822@gmail.com',
        },
      ],
      subject: 'LandEstateX Brevo Test',
      htmlContent: `
        <h2>LandEstateX Email Test</h2>
        <p>If you received this email, Brevo email sending is working.</p>
      `,
      textContent:
        'LandEstateX Email Test - Brevo email sending is working.',
    }),
  });

  const data = await response.json().catch(() => ({}));

  console.log('Brevo HTTP status:', response.status);
  console.log('Brevo response:', data);

  if (!response.ok) {
    throw new Error(data?.message || 'Brevo email failed');
  }

  console.log('BREVO EMAIL ACCEPTED');
}

testBrevo().catch((err) => {
  console.error('BREVO TEST FAILED:', err.message);
  process.exit(1);
});