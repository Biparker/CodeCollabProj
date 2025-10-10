// server/verifyUser.js
const mongoose = require('mongoose');
const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongo:27017/codecollabproj';

async function verifyUser() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('🔗 Connected to MongoDB');

    // Get username from command line argument
    const username = process.argv[2];
    
    if (!username) {
      console.log('❌ Please provide a username');
      console.log('Usage: npm run verify-user <username>');
      process.exit(1);
    }

    // Find and verify the user
    const user = await User.findOne({ username: username });
    
    if (!user) {
      console.log(`❌ No user found with username: ${username}`);
      mongoose.disconnect();
      return;
    }

    if (user.isEmailVerified) {
      console.log(`ℹ️  User ${username} (${user.email}) is already verified`);
      mongoose.disconnect();
      return;
    }

    // Mark as verified
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    console.log(`✅ Successfully verified user: ${user.email} (${user.username})`);
    console.log(`🎉 ${username} can now login to the app!`);
    
    mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error verifying user:', error);
    mongoose.disconnect();
  }
}

verifyUser().catch(err => {
  console.error('❌ Script failed:', err);
  mongoose.disconnect();
});