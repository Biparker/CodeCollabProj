const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true
});

// Create index for efficient querying of project comments
commentSchema.index({ projectId: 1 });

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment; 