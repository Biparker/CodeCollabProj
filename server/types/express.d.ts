import { IUser, UserRole, Permission } from './models';
import { HydratedDocument, Types } from 'mongoose';

/**
 * Extended user object attached to requests
 */
export interface RequestUser {
  _id: Types.ObjectId;
  id: string;
  email: string;
  username: string;
  role: UserRole;
  permissions: Permission[];
  isEmailVerified: boolean;
  isSuspended: boolean;
  isActive: boolean;
}

/**
 * Extend Express Request to include custom properties
 */
declare global {
  namespace Express {
    interface Request {
      /**
       * User object attached by auth middleware
       */
      user?: RequestUser;

      /**
       * JWT access token from request
       */
      token?: string;

      /**
       * Session ID from JWT payload
       */
      sessionId?: string;
    }
  }
}

export {};
