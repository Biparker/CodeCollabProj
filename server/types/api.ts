import { IUser, UserRole, Permission } from './models';

// ============================================================================
// Generic API Response Types
// ============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface ApiError {
  success: false;
  error: string;
  message?: string;
  statusCode?: number;
  details?: Record<string, unknown>;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// ============================================================================
// Authentication Response Types
// ============================================================================

export interface UserResponseData {
  _id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  skills: string[];
  experience: string;
  location?: string;
  timezone?: string;
  availability: string;
  portfolioLinks: Array<{ name: string; url: string }>;
  socialLinks: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
  profileImage?: string;
  isProfilePublic: boolean;
  role: UserRole;
  permissions: Permission[];
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponse extends ApiResponse<{
  user: UserResponseData;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}> {
  success: true;
}

export interface RegisterResponse extends ApiResponse<{
  user: UserResponseData;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  message: string;
}> {
  success: true;
}

export interface TokenRefreshResponse extends ApiResponse<{
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}> {
  success: true;
}

export interface LogoutResponse extends ApiResponse<null> {
  success: true;
  message: string;
}

export interface VerifyEmailResponse extends ApiResponse<{
  user: UserResponseData;
}> {
  success: true;
  message: string;
}

export interface ForgotPasswordResponse extends ApiResponse<null> {
  success: true;
  message: string;
}

export interface ResetPasswordResponse extends ApiResponse<null> {
  success: true;
  message: string;
}

export interface GetCurrentUserResponse extends ApiResponse<{
  user: UserResponseData;
}> {
  success: true;
}

// ============================================================================
// Project Response Types
// ============================================================================

export interface ProjectResponseData {
  _id: string;
  title: string;
  description: string;
  image?: string;
  technologies: string[];
  githubUrl?: string;
  liveUrl?: string;
  status: 'ideation' | 'in_progress' | 'completed';
  requiredSkills: string[];
  tags: string[];
  owner: string | UserResponseData;
  collaborators: Array<{
    userId: string | UserResponseData;
    status: 'pending' | 'accepted' | 'rejected';
  }>;
  resources: Array<{
    name: string;
    url: string;
    fileId?: string;
  }>;
  incentives: {
    enabled: boolean;
    type: 'monetary' | 'equity' | 'recognition' | 'learning' | 'other';
    description?: string;
    amount?: number;
    currency: string;
    equityPercentage?: number;
    customReward?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface GetProjectsResponse extends PaginatedResponse<ProjectResponseData> {
  success: true;
}

export interface GetProjectResponse extends ApiResponse<ProjectResponseData> {
  success: true;
}

export interface CreateProjectResponse extends ApiResponse<ProjectResponseData> {
  success: true;
  message: string;
}

export interface UpdateProjectResponse extends ApiResponse<ProjectResponseData> {
  success: true;
  message: string;
}

export interface DeleteProjectResponse extends ApiResponse<null> {
  success: true;
  message: string;
}

// ============================================================================
// Comment Response Types
// ============================================================================

export interface CommentResponseData {
  _id: string;
  projectId: string;
  userId: string | UserResponseData;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetCommentsResponse extends ApiResponse<CommentResponseData[]> {
  success: true;
}

export interface CreateCommentResponse extends ApiResponse<CommentResponseData> {
  success: true;
  message: string;
}

export interface UpdateCommentResponse extends ApiResponse<CommentResponseData> {
  success: true;
  message: string;
}

export interface DeleteCommentResponse extends ApiResponse<null> {
  success: true;
  message: string;
}

// ============================================================================
// Message Response Types
// ============================================================================

export interface MessageResponseData {
  _id: string;
  sender: string | UserResponseData;
  recipient: string | UserResponseData;
  subject: string;
  content: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetMessagesResponse extends ApiResponse<MessageResponseData[]> {
  success: true;
}

export interface GetMessageResponse extends ApiResponse<MessageResponseData> {
  success: true;
}

export interface SendMessageResponse extends ApiResponse<MessageResponseData> {
  success: true;
  message: string;
}

export interface MarkMessageReadResponse extends ApiResponse<MessageResponseData> {
  success: true;
}

export interface DeleteMessageResponse extends ApiResponse<null> {
  success: true;
  message: string;
}

export interface UnreadCountResponse extends ApiResponse<{
  unreadCount: number;
}> {
  success: true;
}

// ============================================================================
// User/Profile Response Types
// ============================================================================

export interface GetUserProfileResponse extends ApiResponse<UserResponseData> {
  success: true;
}

export interface UpdateUserProfileResponse extends ApiResponse<UserResponseData> {
  success: true;
  message: string;
}

export interface GetUserProjectsResponse extends ApiResponse<ProjectResponseData[]> {
  success: true;
}

// ============================================================================
// Session Response Types
// ============================================================================

export interface SessionResponseData {
  _id: string;
  deviceInfo: {
    userAgent?: string;
    ip?: string;
    platform?: string;
    browser?: string;
  };
  location: {
    country?: string;
    city?: string;
    timezone?: string;
  };
  lastActivity: string;
  createdAt: string;
  isActive: boolean;
  isCurrent: boolean;
}

export interface GetSessionsResponse extends ApiResponse<SessionResponseData[]> {
  success: true;
}

export interface RevokeSessionResponse extends ApiResponse<null> {
  success: true;
  message: string;
}

export interface RevokeAllSessionsResponse extends ApiResponse<{
  revokedCount: number;
}> {
  success: true;
  message: string;
}

// ============================================================================
// Admin Response Types
// ============================================================================

export interface AdminUserResponseData extends UserResponseData {
  isActive: boolean;
  isSuspended: boolean;
  suspendedUntil?: string;
  suspensionReason?: string;
}

export interface GetAdminUsersResponse extends PaginatedResponse<AdminUserResponseData> {
  success: true;
}

export interface UpdateUserRoleResponse extends ApiResponse<AdminUserResponseData> {
  success: true;
  message: string;
}

export interface SuspendUserResponse extends ApiResponse<AdminUserResponseData> {
  success: true;
  message: string;
}

export interface UnsuspendUserResponse extends ApiResponse<AdminUserResponseData> {
  success: true;
  message: string;
}

export interface AdminStatsResponse extends ApiResponse<{
  totalUsers: number;
  activeUsers: number;
  totalProjects: number;
  projectsByStatus: Record<string, number>;
  recentActivity: Array<{
    type: string;
    count: number;
    date: string;
  }>;
}> {
  success: true;
}

// ============================================================================
// Request Body Types
// ============================================================================

export interface LoginRequestBody {
  email: string;
  password: string;
}

export interface RegisterRequestBody {
  email: string;
  password: string;
  username: string;
  firstName?: string;
  lastName?: string;
}

export interface RefreshTokenRequestBody {
  refreshToken: string;
}

export interface ForgotPasswordRequestBody {
  email: string;
}

export interface ResetPasswordRequestBody {
  token: string;
  password: string;
}

export interface CreateProjectRequestBody {
  title: string;
  description: string;
  image?: string;
  technologies?: string[];
  githubUrl?: string;
  liveUrl?: string;
  status?: 'ideation' | 'in_progress' | 'completed';
  requiredSkills?: string[];
  tags?: string[];
}

export interface UpdateProjectRequestBody extends Partial<CreateProjectRequestBody> {
  collaborators?: Array<{
    userId: string;
    status: 'pending' | 'accepted' | 'rejected';
  }>;
  resources?: Array<{
    name: string;
    url: string;
    fileId?: string;
  }>;
  incentives?: {
    enabled?: boolean;
    type?: 'monetary' | 'equity' | 'recognition' | 'learning' | 'other';
    description?: string;
    amount?: number;
    currency?: string;
    equityPercentage?: number;
    customReward?: string;
  };
}

export interface CreateCommentRequestBody {
  content: string;
}

export interface UpdateCommentRequestBody {
  content: string;
}

export interface SendMessageRequestBody {
  recipientId: string;
  subject: string;
  content: string;
}

export interface UpdateProfileRequestBody {
  firstName?: string;
  lastName?: string;
  bio?: string;
  skills?: string[];
  experience?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  location?: string;
  timezone?: string;
  availability?: 'full-time' | 'part-time' | 'weekends' | 'evenings' | 'flexible';
  portfolioLinks?: Array<{ name: string; url: string }>;
  socialLinks?: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
  isProfilePublic?: boolean;
}

export interface ChangePasswordRequestBody {
  currentPassword: string;
  newPassword: string;
}

export interface AdminUpdateUserRequestBody {
  role?: UserRole;
  permissions?: Permission[];
  isActive?: boolean;
}

export interface SuspendUserRequestBody {
  reason: string;
  duration?: number;
}
