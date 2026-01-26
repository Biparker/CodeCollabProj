import { Document, Model, Types } from 'mongoose';

// ============================================================================
// Enums and Union Types
// ============================================================================

export type UserRole = 'user' | 'moderator' | 'admin';

export type Permission =
  // User management
  | 'users.read'
  | 'users.create'
  | 'users.update'
  | 'users.delete'
  // Project management
  | 'projects.read'
  | 'projects.create'
  | 'projects.update'
  | 'projects.delete'
  | 'projects.moderate'
  // Comment management
  | 'comments.read'
  | 'comments.create'
  | 'comments.update'
  | 'comments.delete'
  | 'comments.moderate'
  // Admin functions
  | 'admin.dashboard'
  | 'admin.users'
  | 'admin.analytics'
  | 'admin.system'
  // Moderation
  | 'moderate.content'
  | 'moderate.users'
  | 'moderate.reports';

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export type Availability = 'full-time' | 'part-time' | 'weekends' | 'evenings' | 'flexible';

export type ProjectStatus = 'ideation' | 'in_progress' | 'completed';

export type CollaboratorStatus = 'pending' | 'accepted' | 'rejected';

export type IncentiveType = 'monetary' | 'equity' | 'recognition' | 'learning' | 'other';

export type SessionRevokedReason =
  | 'logout'
  | 'password_change'
  | 'admin_revoke'
  | 'security_breach'
  | 'expired'
  | 'concurrent_limit';

// ============================================================================
// User Model Types
// ============================================================================

export interface IPortfolioLink {
  name: string;
  url: string;
}

export interface ISocialLinks {
  github?: string;
  linkedin?: string;
  twitter?: string;
  website?: string;
}

export interface IUser {
  email: string;
  password: string;
  username: string;
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  firstName?: string;
  lastName?: string;
  bio?: string;
  skills: string[];
  experience: ExperienceLevel;
  location?: string;
  timezone?: string;
  availability: Availability;
  portfolioLinks: IPortfolioLink[];
  socialLinks: ISocialLinks;
  profileImage?: string;
  isProfilePublic: boolean;
  role: UserRole;
  permissions: Permission[];
  isActive: boolean;
  isSuspended: boolean;
  suspendedUntil?: Date;
  suspensionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateEmailVerificationToken(): string;
  generatePasswordResetToken(): string;
  clearPasswordResetToken(): void;
  hasRole(role: UserRole): boolean;
  hasPermission(permission: Permission): boolean;
  hasAnyPermission(permissions: Permission[]): boolean;
  addPermission(permission: Permission): this;
  removePermission(permission: Permission): this;
  setRole(role: UserRole): this;
  getDefaultPermissionsForRole(role: UserRole): Permission[];
  isAdmin(): boolean;
  isModerator(): boolean;
  canManageUsers(): boolean;
  suspend(reason: string, duration?: number | null): this;
  unsuspend(): this;
  isCurrentlySuspended(): boolean;
}

export type UserDocument = Document<Types.ObjectId, object, IUser> & IUser & IUserMethods;

export type UserModel = Model<IUser, object, IUserMethods>;

// ============================================================================
// Project Model Types
// ============================================================================

export interface ICollaborator {
  userId: Types.ObjectId;
  status: CollaboratorStatus;
}

export interface IResource {
  name: string;
  url: string;
  fileId?: Types.ObjectId;
}

export interface IIncentives {
  enabled: boolean;
  type: IncentiveType;
  description?: string;
  amount?: number;
  currency: string;
  equityPercentage?: number;
  customReward?: string;
}

export interface IProject {
  title: string;
  description: string;
  image?: string;
  technologies: string[];
  githubUrl?: string;
  liveUrl?: string;
  status: ProjectStatus;
  requiredSkills: string[];
  tags: string[];
  owner: Types.ObjectId;
  collaborators: ICollaborator[];
  resources: IResource[];
  incentives: IIncentives;
  createdAt: Date;
  updatedAt: Date;
}

export type ProjectDocument = Document<Types.ObjectId, object, IProject> & IProject;

export type ProjectModel = Model<IProject>;

// ============================================================================
// Session Model Types
// ============================================================================

export interface IDeviceInfo {
  userAgent?: string;
  ip?: string;
  platform?: string;
  browser?: string;
}

export interface ILocation {
  country?: string;
  city?: string;
  timezone?: string;
}

export interface ISession {
  userId: Types.ObjectId;
  token: string;
  refreshToken: string;
  isActive: boolean;
  deviceInfo: IDeviceInfo;
  location: ILocation;
  lastActivity: Date;
  expiresAt: Date;
  revokedAt?: Date;
  revokedReason?: SessionRevokedReason;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISessionMethods {
  revoke(reason?: SessionRevokedReason): Promise<SessionDocument>;
}

export interface ISessionStatics {
  revokeAllUserSessions(
    userId: Types.ObjectId,
    reason?: string
  ): Promise<{ modifiedCount: number }>;
  cleanExpiredSessions(): Promise<number>;
  getActiveSessionCount(userId: Types.ObjectId): Promise<number>;
}

export type SessionDocument = Document<Types.ObjectId, object, ISession> & ISession & ISessionMethods;

export type SessionModel = Model<ISession, object, ISessionMethods> & ISessionStatics;

// ============================================================================
// Comment Model Types
// ============================================================================

export interface IComment {
  projectId: Types.ObjectId;
  userId: Types.ObjectId;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export type CommentDocument = Document<Types.ObjectId, object, IComment> & IComment;

export type CommentModel = Model<IComment>;

// ============================================================================
// Message Model Types
// ============================================================================

export interface IMessage {
  sender: Types.ObjectId;
  recipient: Types.ObjectId;
  subject: string;
  content: string;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type MessageDocument = Document<Types.ObjectId, object, IMessage> & IMessage;

export type MessageModel = Model<IMessage>;

// ============================================================================
// Populated Types (for when refs are populated)
// ============================================================================

export interface IProjectPopulated extends Omit<IProject, 'owner' | 'collaborators'> {
  owner: UserDocument;
  collaborators: Array<{
    userId: UserDocument;
    status: CollaboratorStatus;
  }>;
}

export interface ICommentPopulated extends Omit<IComment, 'userId' | 'projectId'> {
  userId: UserDocument;
  projectId: ProjectDocument;
}

export interface IMessagePopulated extends Omit<IMessage, 'sender' | 'recipient'> {
  sender: UserDocument;
  recipient: UserDocument;
}

export interface ISessionPopulated extends Omit<ISession, 'userId'> {
  userId: UserDocument;
}
