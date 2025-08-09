const mongoose = require('mongoose');
const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/codecollab';

async function testLogin() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Test user1
    const user = await User.findOne({ email: 'user1@example.com' });
    if (!user) {
      console.log('❌ User1 not found');
      return;
    }

    console.log('👤 Found user:', {
      email: user.email,
      username: user.username,
      isEmailVerified: user.isEmailVerified,
      hasPassword: !!user.password
    });

    // Test password comparison
    const isMatch = await user.comparePassword('password123');
    console.log('🔐 Password match:', isMatch);

    if (isMatch) {
      console.log('✅ Login test passed! User1 can login with password123');
    } else {
      console.log('❌ Login test failed! Password does not match');
    }

    mongoose.disconnect();
  } catch (error) {
    console.error('❌ Test error:', error);
    mongoose.disconnect();
  }
}

testLogin();
