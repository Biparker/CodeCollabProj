import mongoose, { Schema } from 'mongoose';
import { IComment, CommentModel } from '../types/models';

const commentSchema = new Schema<IComment, CommentModel>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create index for efficient querying of project comments
commentSchema.index({ projectId: 1 });

const Comment = mongoose.model<IComment, CommentModel>('Comment', commentSchema);

module.exports = Comment;
