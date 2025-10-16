const mongoose = require('mongoose');
const User = require('./models/User');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/codecollabproj';

async function checkUsers() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    const adminUser = await User.findOne({email: 'admin@codecollabproj.com'});
    console.log('Admin user exists:', !!adminUser);
    
    if (adminUser) {
      console.log('Email verified:', adminUser.isEmailVerified);
    }
    
    const userCount = await User.countDocuments();
    console.log('Total users in database:', userCount);
    
    mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    mongoose.disconnect();
  }
}

checkUsers();