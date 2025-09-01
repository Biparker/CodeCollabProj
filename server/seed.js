// server/seed.js
const mongoose = require('mongoose');
const User = require('./models/User');
const Project = require('./models/Project');
const bcrypt = require('bcryptjs');

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/codecollab';

async function seed() {
  await mongoose.connect(MONGO_URI);

  // Clear existing data
  await User.deleteMany({});
  await Project.deleteMany({});

  // Create admin user first
  const adminUser = {
    username: 'admin',
    email: 'admin@codecollab.com',
    password: await bcrypt.hash('admin123!', 10),
    isEmailVerified: true,
    role: 'admin',
    firstName: 'System',
    lastName: 'Administrator',
    bio: 'System administrator with full access to manage the platform.',
    skills: ['System Administration', 'User Management', 'Security'],
    socialLinks: {}
  };

  // Create moderator user
  const moderatorUser = {
    username: 'moderator',
    email: 'moderator@codecollab.com',
    password: await bcrypt.hash('mod123!', 10),
    isEmailVerified: true,
    role: 'moderator',
    firstName: 'Content',
    lastName: 'Moderator',
    bio: 'Content moderator helping maintain community standards.',
    skills: ['Content Moderation', 'Community Management'],
    socialLinks: {}
  };

  // Create 10 regular users with skills and github
  const userData = [adminUser, moderatorUser];
  const skillsList = [
    'JavaScript', 'Python', 'React', 'Node.js', 'MongoDB',
    'Docker', 'CSS', 'HTML', 'Express', 'TypeScript',
    'GraphQL', 'Redux', 'C++', 'Java', 'Go'
  ];
  
  for (let i = 1; i <= 10; i++) {
    userData.push({
      username: `user${i}`,
      email: `user${i}@example.com`,
      password: await bcrypt.hash('password123', 10),
      isEmailVerified: true,
      role: 'user', // Explicitly set role
      skills: [
        skillsList[(i * 2) % skillsList.length],
        skillsList[(i * 3) % skillsList.length],
        skillsList[(i * 5) % skillsList.length]
      ],
      socialLinks: {
        github: `https://github.com/user${i}`
      }
    });
  }
  const users = await User.insertMany(userData);

  // Create 10 projects
  const techList = [
    'React', 'Node.js', 'MongoDB', 'Express', 'Docker',
    'Redux', 'GraphQL', 'TypeScript', 'HTML', 'CSS'
  ];
  const projectData = [];
  for (let i = 1; i <= 10; i++) {
    // Pick an owner
    const owner = users[i - 1];
    // Pick random technologies
    const techs = [
      techList[(i * 2) % techList.length],
      techList[(i * 3) % techList.length]
    ];
    // For projects 6-10, add 2-3 collaborators (not the owner)
    let collaborators = [];
    if (i > 5) {
      // Pick 2-3 unique users who are not the owner
      const collaboratorIndexes = [];
      while (collaboratorIndexes.length < 3) {
        const idx = Math.floor(Math.random() * 10);
        if (idx !== (i - 1) && !collaboratorIndexes.includes(idx)) {
          collaboratorIndexes.push(idx);
        }
      }
      collaborators = collaboratorIndexes.slice(0, Math.floor(Math.random() * 2) + 2).map(idx => ({
        userId: users[idx]._id,
        status: 'accepted'
      }));
    }
    projectData.push({
      title: `Project ${i}`,
      description: `This is the description for Project ${i}.`,
      technologies: techs,
      owner: owner._id,
      collaborators,
      githubUrl: `https://github.com/user${i}/project${i}`
    });
  }
  await Project.insertMany(projectData);

  console.log('✅ Seed data inserted successfully!');
  console.log('\n🔐 Admin Credentials:');
  console.log('Email: admin@codecollab.com');
  console.log('Password: admin123!');
  console.log('\n👮 Moderator Credentials:');
  console.log('Email: moderator@codecollab.com');
  console.log('Password: mod123!');
  console.log('\n👤 Regular Users:');
  console.log('Email: user1@example.com to user10@example.com');
  console.log('Password: password123');
  
  mongoose.disconnect();
}

seed().catch(err => {
  console.error(err);
  mongoose.disconnect();
});