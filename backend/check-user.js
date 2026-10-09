require('dotenv').config();

console.log('CHECK SCRIPT STARTED');

const mongoose = require('mongoose');
const User = require('./src/models/User.model');

async function checkUser() {
  try {
    console.log('Connecting to MongoDB...');

    await mongoose.connect(process.env.MONGO_URI);

    console.log('MongoDB connected');

    const users = await User.find({}).select('email phone_number is_verified').lean();

    console.log('Total users:', users.length);

    console.log(users);

    await mongoose.disconnect();

    console.log('CHECK SCRIPT FINISHED');
  } catch (error) {
    console.error('CHECK SCRIPT ERROR:', error);
  }
}

checkUser();