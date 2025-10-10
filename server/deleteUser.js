// server/deleteUser.js
const mongoose = require('mongoose');
const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongo:27017/codecollabproj';

async function deleteUser() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('🔗 Connected to MongoDB');

    // Get email from command line argument
    const email = process.argv[2];
    
    if (!email) {
      console.log('❌ Please provide an email address');
      console.log('Usage: npm run delete-user <email>');
      process.exit(1);
    }

    // Find and delete the user
    const deletedUser = await User.findOneAndDelete({ email: email });
    
    if (deletedUser) {
      console.log(`✅ Successfully deleted user: ${deletedUser.email} (${deletedUser.username})`);
    } else {
      console.log(`❌ No user found with email: ${email}`);
    }
    
    mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error deleting user:', error);
    mongoose.disconnect();
  }
}

deleteUser().catch(err => {
  console.error('❌ Script failed:', err);
  mongoose.disconnect();
});