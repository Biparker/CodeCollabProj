// Quick script to verify all users in the database
const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function verifyAllUsers() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    
    if (!MONGODB_URI) {
      console.error('❌ MONGODB_URI not found in environment variables');
      process.exit(1);
    }

    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Update all users to be verified
    const result = await User.updateMany(
      {}, 
      { 
        $set: { 
          isEmailVerified: true,
          emailVerificationToken: undefined,
          emailVerificationExpires: undefined
        } 
      }
    );

    console.log(`✅ Verified ${result.modifiedCount} users`);
    
    // List all users
    const users = await User.find({}, 'email username isEmailVerified');
    console.log('\n📋 All users:');
    users.forEach(user => {
      console.log(`  - ${user.email} (${user.username}) - Verified: ${user.isEmailVerified}`);
    });

    await mongoose.disconnect();
    console.log('\n✅ Done!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

verifyAllUsers();

