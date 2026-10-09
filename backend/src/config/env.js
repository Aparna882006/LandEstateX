require('dotenv').config();

const env = {
  port: process.env.PORT || 5000,

  mongoUri: process.env.MONGO_URI,

  brevoApiKey: process.env.BREVO_API_KEY,
  brevoSenderEmail: process.env.BREVO_SENDER_EMAIL,
  brevoSenderName: process.env.BREVO_SENDER_NAME || 'LandEstateX',
};

module.exports = env;