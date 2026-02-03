import { Request, Response, NextFunction, RequestHandler } from 'express';
import { UserRole, Permission, UserDocument } from '../types/models';

const logger = require('../utils/logger');

/**
 * Type for functions that extract resource owner ID from request
 */
type GetResourceOwnerIdFn = (req: Request) => string | undefined;

/**
 * Options for resource access middleware
 */
interface ResourceAccessOptions {
  permission: Permission;
  getResourceOwnerId?: GetResourceOwnerIdFn;
  allowOwner?: boolean;
}

/**
 * Role-Based Access Control (RBAC) Middleware
 * Provides flexible permission checking for routes
 */

/**
 * Check if user has required role(s)
 * @param requiredRoles - Single role or array of roles
 * @returns Express middleware
 */
const requireRole = (requiredRoles: UserRole | UserRole[]): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        logger.securityEvent('RBAC_NO_USER', {
          ip: req.ip,
          path: req.path,
          userAgent: req.get('User-Agent'),
        });
        res.status(401).json({ message: 'Authentication required' });
        return;
      }

      const user = req.user as UserDocument;

      // Handle account suspension
      if (user.isCurrentlySuspended()) {
        logger.securityEvent('SUSPENDED_USER_ACCESS_ATTEMPT', {
          userId: user._id,
          email: user.email,
          ip: req.ip,
          path: req.path,
          suspensionReason: user.suspensionReason,
        });
        res.status(403).json({
          message: 'Account suspended',
          reason: user.suspensionReason,
          suspendedUntil: user.suspendedUntil,
        });
        return;
      }

      // Check if account is active
      if (!user.isActive) {
        logger.securityEvent('INACTIVE_USER_ACCESS_ATTEMPT', {
          userId: user._id,
          email: user.email,
          ip: req.ip,
          path: req.path,
        });
        res.status(403).json({ message: 'Account deactivated' });
        return;
      }

      const roles: UserRole[] = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
      const hasRole = roles.includes(user.role);

      if (!hasRole) {
        logger.securityEvent('RBAC_ROLE_DENIED', {
          userId: user._id,
          userRole: user.role,
          requiredRoles: roles,
          ip: req.ip,
          path: req.path,
          userAgent: req.get('User-Agent'),
        });
        res.status(403).json({
          message: 'Insufficient privileges',
          required: roles,
          current: user.role,
        });
        return;
      }

      next();
    } catch (error) {
      const err = error as Error;
      logger.error('RBAC role check error', {
        error: err.message,
        userId: req.user?._id,
        path: req.path,
      });
      res.status(500).json({ message: 'Authorization check failed' });
    }
  };
};

/**
 * Check if user has required permission(s)
 * @param requiredPermissions - Single permission or array of permissions
 * @param requireAll - If true, user must have ALL permissions. If false, user needs ANY permission
 * @returns Express middleware
 */
const requirePermission = (
  requiredPermissions: Permission | Permission[],
  requireAll: boolean = false
): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        logger.securityEvent('RBAC_NO_USER', {
          ip: req.ip,
          path: req.path,
          userAgent: req.get('User-Agent'),
        });
        res.status(401).json({ message: 'Authentication required' });
        return;
      }

      const user = req.user as UserDocument;

      // Handle account suspension
      if (user.isCurrentlySuspended()) {
        logger.securityEvent('SUSPENDED_USER_ACCESS_ATTEMPT', {
          userId: user._id,
          email: user.email,
          ip: req.ip,
          path: req.path,
          suspensionReason: user.suspensionReason,
        });
        res.status(403).json({
          message: 'Account suspended',
          reason: user.suspensionReason,
          suspendedUntil: user.suspendedUntil,
        });
        return;
      }

      // Check if account is active
      if (!user.isActive) {
        logger.securityEvent('INACTIVE_USER_ACCESS_ATTEMPT', {
          userId: user._id,
          email: user.email,
          ip: req.ip,
          path: req.path,
        });
        res.status(403).json({ message: 'Account deactivated' });
        return;
      }

      const permissions: Permission[] = Array.isArray(requiredPermissions)
        ? requiredPermissions
        : [requiredPermissions];

      let hasPermission: boolean;
      if (requireAll) {
        hasPermission = permissions.every((permission) => user.hasPermission(permission));
      } else {
        hasPermission = user.hasAnyPermission(permissions);
      }

      if (!hasPermission) {
        logger.securityEvent('RBAC_PERMISSION_DENIED', {
          userId: user._id,
          userPermissions: user.permissions,
          requiredPermissions: permissions,
          requireAll,
          ip: req.ip,
          path: req.path,
          userAgent: req.get('User-Agent'),
        });
        res.status(403).json({
          message: 'Insufficient permissions',
          required: permissions,
          requireAll,
          current: user.permissions,
        });
        return;
      }

      next();
    } catch (error) {
      const err = error as Error;
      logger.error('RBAC permission check error', {
        error: err.message,
        userId: req.user?._id,
        path: req.path,
      });
      res.status(500).json({ message: 'Permission check failed' });
    }
  };
};

/**
 * Admin-only access middleware
 */
const requireAdmin: RequestHandler = requireRole('admin');

/**
 * Moderator or Admin access middleware
 */
const requireModerator: RequestHandler = requireRole(['moderator', 'admin']);

/**
 * Resource ownership check - allows access if user owns the resource or is admin
 * @param getResourceOwnerId - Function that returns the resource owner ID from req
 * @returns Express middleware
 */
const requireOwnershipOrAdmin = (getResourceOwnerId: GetResourceOwnerIdFn): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Authentication required' });
        return;
      }

      const user = req.user as UserDocument;

      // Admin can access anything
      if (user.isAdmin()) {
        next();
        return;
      }

      // Check ownership
      const resourceOwnerId = getResourceOwnerId(req);
      if (user._id.toString() === resourceOwnerId?.toString()) {
        next();
        return;
      }

      logger.securityEvent('RBAC_OWNERSHIP_DENIED', {
        userId: user._id,
        resourceOwnerId,
        ip: req.ip,
        path: req.path,
        userAgent: req.get('User-Agent'),
      });

      res.status(403).json({
        message: 'Access denied. You can only access your own resources.',
      });
    } catch (error) {
      const err = error as Error;
      logger.error('RBAC ownership check error', {
        error: err.message,
        userId: req.user?._id,
        path: req.path,
      });
      res.status(500).json({ message: 'Ownership check failed' });
    }
  };
};

/**
 * Check if user can perform action on specific resource
 * @param options - Configuration object
 * @param options.permission - Required permission
 * @param options.getResourceOwnerId - Function to get resource owner ID
 * @param options.allowOwner - Allow resource owner even without permission
 * @returns Express middleware
 */
const requireResourceAccess = (options: ResourceAccessOptions): RequestHandler => {
  const { permission, getResourceOwnerId, allowOwner = true } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        res.status(401).json({ message: 'Authentication required' });
        return;
      }

      const user = req.user as UserDocument;

      // Check if user has the required permission
      if (user.hasPermission(permission)) {
        next();
        return;
      }

      // Check ownership if allowed
      if (allowOwner && getResourceOwnerId) {
        const resourceOwnerId = getResourceOwnerId(req);
        if (user._id.toString() === resourceOwnerId?.toString()) {
          next();
          return;
        }
      }

      logger.securityEvent('RBAC_RESOURCE_ACCESS_DENIED', {
        userId: user._id,
        permission,
        allowOwner,
        ip: req.ip,
        path: req.path,
        userAgent: req.get('User-Agent'),
      });

      res.status(403).json({
        message: 'Insufficient permissions for this resource',
        required: permission,
      });
    } catch (error) {
      const err = error as Error;
      logger.error('RBAC resource access check error', {
        error: err.message,
        userId: req.user?._id,
        path: req.path,
      });
      res.status(500).json({ message: 'Resource access check failed' });
    }
  };
};

/**
 * Middleware to add user role and permission info to response headers (for debugging)
 * Only in development mode
 */
const addDebugHeaders: RequestHandler = (req: Request, res: Response, next: NextFunction): void => {
  if (process.env.NODE_ENV === 'development' && req.user) {
    const user = req.user as UserDocument;
    res.set({
      'X-User-Role': user.role,
      'X-User-Permissions': user.permissions.join(','),
      'X-User-ID': user._id.toString(),
    });
  }
  next();
};

module.exports = {
  requireRole,
  requirePermission,
  requireAdmin,
  requireModerator,
  requireOwnershipOrAdmin,
  requireResourceAccess,
  addDebugHeaders,
};

export {
  requireRole,
  requirePermission,
  requireAdmin,
  requireModerator,
  requireOwnershipOrAdmin,
  requireResourceAccess,
  addDebugHeaders,
  GetResourceOwnerIdFn,
  ResourceAccessOptions,
};
