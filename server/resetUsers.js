// server/resetUsers.js
const mongoose = require('mongoose');
const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongo:27017/codecollabproj';

async function resetUserVerification() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('🔗 Connected to MongoDB');

    // Find all users
    const users = await User.find({});
    console.log(`👥 Found ${users.length} users`);

    let resetCount = 0;

    // Reset each user's verification status
    for (const user of users) {
      // Set as unverified
      user.isEmailVerified = false;
      
      // Generate new verification token
      const verificationToken = user.generateEmailVerificationToken();
      
      await user.save();
      
      console.log(`✅ Reset user: ${user.email} - New token: ${verificationToken}`);
      resetCount++;
    }

    console.log(`🎉 Successfully reset ${resetCount} users to unverified status`);
    console.log('📧 All users now have new verification tokens that expire in 24 hours');
    
    mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error resetting users:', error);
    mongoose.disconnect();
  }
}

resetUserVerification().catch(err => {
  console.error('❌ Script failed:', err);
  mongoose.disconnect();
});