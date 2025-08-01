// server/unverifyUser.js
const mongoose = require('mongoose');
const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongo:27017/codecollab';

async function unverifyUser() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('🔗 Connected to MongoDB');

    // Get username from command line argument
    const username = process.argv[2];
    
    if (!username) {
      console.log('❌ Please provide a username');
      console.log('Usage: npm run unverify-user <username>');
      process.exit(1);
    }

    // Find the user
    const user = await User.findOne({ username: username });
    
    if (!user) {
      console.log(`❌ No user found with username: ${username}`);
      mongoose.disconnect();
      return;
    }

    if (!user.isEmailVerified) {
      console.log(`ℹ️  User ${username} (${user.email}) is already unverified`);
      mongoose.disconnect();
      return;
    }

    // Mark as unverified and generate new verification token
    user.isEmailVerified = false;
    const verificationToken = user.generateEmailVerificationToken();
    await user.save();

    console.log(`✅ Successfully unverified user: ${user.email} (${user.username})`);
    console.log(`🔐 New verification token: ${verificationToken}`);
    console.log(`📧 User will need to verify email before logging in`);
    console.log(`⏰ Token expires: ${new Date(user.emailVerificationExpires).toLocaleString()}`);
    
    mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error unverifying user:', error);
    mongoose.disconnect();
  }
}

unverifyUser().catch(err => {
  console.error('❌ Script failed:', err);
  mongoose.disconnect();
});