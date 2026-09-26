require('dotenv').config();

const readline = require('readline');
const mongoose = require('mongoose');
const User = require('./models/User.model');
const { hashToken } = require('./utils/jwt.util');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (text) =>
  new Promise((resolve) => rl.question(text, resolve));

async function resetPasswordFromTerminal() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log('\n=================================');
    console.log('     LandEstateX Password Reset');
    console.log('=================================\n');

    const email = await question('Enter email: ');
    const resetToken = await question('Enter reset token: ');
    const newPassword = await question('Enter new password: ');
    const confirmPassword = await question('Confirm new password: ');

    if (newPassword !== confirmPassword) {
      console.log('\n❌ Passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      console.log('\n❌ Password must be at least 6 characters.');
      return;
    }

    const tokenHash = hashToken(resetToken.trim());

    const user = await User.findOne({
      email: email.trim(),
      password_reset_token: tokenHash,
      password_reset_expires: { $gt: new Date() },
    }).select('+password_reset_token +password_reset_expires');

    if (!user) {
      console.log('\n❌ Invalid or expired reset token.');
      return;
    }

    user.password = newPassword;
    user.password_reset_token = undefined;
    user.password_reset_expires = undefined;
    user.refresh_tokens = [];

    await user.save();

    console.log('\n✅ Password changed successfully!');
    console.log('You can now log in with the new password.\n');

  } catch (error) {
    console.error('\n❌ Password reset failed:', error.message);
  } finally {
    await mongoose.disconnect();
    rl.close();
  }
}

resetPasswordFromTerminal();