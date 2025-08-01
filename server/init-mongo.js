// MongoDB initialization script
// This script will be run when the MongoDB container starts

db = db.getSiblingDB('codecollab');

// Create collections
db.createCollection('users');
db.createCollection('projects');
db.createCollection('comments');

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "username": 1 }, { unique: true });
db.projects.createIndex({ "title": 1 });
db.projects.createIndex({ "owner": 1 });
db.comments.createIndex({ "projectId": 1 });
db.comments.createIndex({ "author": 1 });

print('MongoDB initialized successfully'); 