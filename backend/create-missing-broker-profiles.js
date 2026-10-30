
require('dotenv').config();

const mongoose = require('mongoose');
const User = require('./src/models/User.model');
const Broker = require('./src/models/Broker.model');

async function createMissingBrokerProfiles() {
  try {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
  throw new Error(
    'MONGO_URI nahi mila. Backend .env file mein variable check karo.'
  );
}

    await mongoose.connect(mongoUri);
    console.log('MongoDB connected successfully');

    const users = await User.find({ role: 'broker' }).select(
      '_id full_name'
    );

    let created = 0;

    for (const user of users) {
      const profile = await Broker.findOne({
        user_id: user._id,
      });

      if (!profile) {
        await Broker.create({
          user_id: user._id,
        });

        console.log(`Profile created for ${user.full_name}`);
        created++;
      }
    }

    console.log(`Finished. Profiles created: ${created}`);
  } catch (error) {
    console.error('Error:', error.message);
    process.exitCode = 1;
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }
}

createMissingBrokerProfiles();
