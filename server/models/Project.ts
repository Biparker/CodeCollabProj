import mongoose, { Schema } from 'mongoose';
import {
  IProject,
  ProjectModel,
  ProjectStatus,
  CollaboratorStatus,
  IncentiveType,
} from '../types/models';

const projectSchema = new Schema<IProject, ProjectModel>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      trim: true,
    },
    technologies: [
      {
        type: String,
        trim: true,
      },
    ],
    githubUrl: {
      type: String,
      trim: true,
    },
    liveUrl: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['ideation', 'in_progress', 'completed'] as ProjectStatus[],
      default: 'ideation',
    },
    requiredSkills: [
      {
        type: String,
        trim: true,
      },
    ],
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    collaborators: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
        status: {
          type: String,
          enum: ['pending', 'accepted', 'rejected'] as CollaboratorStatus[],
          default: 'pending',
        },
      },
    ],
    resources: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },
        url: {
          type: String,
          required: true,
          trim: true,
        },
        fileId: {
          type: Schema.Types.ObjectId,
        },
      },
    ],
    incentives: {
      enabled: {
        type: Boolean,
        default: false,
      },
      type: {
        type: String,
        enum: ['monetary', 'equity', 'recognition', 'learning', 'other'] as IncentiveType[],
        default: 'recognition',
      },
      description: {
        type: String,
        trim: true,
      },
      amount: {
        type: Number,
        min: 0,
      },
      currency: {
        type: String,
        default: 'USD',
      },
      equityPercentage: {
        type: Number,
        min: 0,
        max: 100,
      },
      customReward: {
        type: String,
        trim: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for search functionality
projectSchema.index({ title: 'text', tags: 'text' });

const Project = mongoose.model<IProject, ProjectModel>('Project', projectSchema);

module.exports = Project;
