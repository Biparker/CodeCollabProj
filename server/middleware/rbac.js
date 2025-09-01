const logger = require('../utils/logger');

/**
 * Role-Based Access Control (RBAC) Middleware
 * Provides flexible permission checking for routes
 */

/**
 * Check if user has required role(s)
 * @param {string|string[]} requiredRoles - Single role or array of roles
 * @returns {Function} Express middleware
 */
const requireRole = (requiredRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        logger.securityEvent('RBAC_NO_USER', {
          ip: req.ip,
          path: req.path,
          userAgent: req.get('User-Agent')
        });
        return res.status(401).json({ message: 'Authentication required' });
      }

      // Handle account suspension
      if (req.user.isCurrentlySuspended()) {
        logger.securityEvent('SUSPENDED_USER_ACCESS_ATTEMPT', {
          userId: req.user._id,
          email: req.user.email,
          ip: req.ip,
          path: req.path,
          suspensionReason: req.user.suspensionReason
        });
        return res.status(403).json({ 
          message: 'Account suspended', 
          reason: req.user.suspensionReason,
          suspendedUntil: req.user.suspendedUntil
        });
      }

      // Check if account is active
      if (!req.user.isActive) {
        logger.securityEvent('INACTIVE_USER_ACCESS_ATTEMPT', {
          userId: req.user._id,
          email: req.user.email,
          ip: req.ip,
          path: req.path
        });
        return res.status(403).json({ message: 'Account deactivated' });
      }

      const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
      const hasRole = roles.includes(req.user.role);

      if (!hasRole) {
        logger.securityEvent('RBAC_ROLE_DENIED', {
          userId: req.user._id,
          userRole: req.user.role,
          requiredRoles: roles,
          ip: req.ip,
          path: req.path,
          userAgent: req.get('User-Agent')
        });
        return res.status(403).json({ 
          message: 'Insufficient privileges',
          required: roles,
          current: req.user.role
        });
      }

      next();
    } catch (error) {
      logger.error('RBAC role check error', { 
        error: error.message,
        userId: req.user?._id,
        path: req.path
      });
      res.status(500).json({ message: 'Authorization check failed' });
    }
  };
};

/**
 * Check if user has required permission(s)
 * @param {string|string[]} requiredPermissions - Single permission or array of permissions
 * @param {boolean} requireAll - If true, user must have ALL permissions. If false, user needs ANY permission
 * @returns {Function} Express middleware
 */
const requirePermission = (requiredPermissions, requireAll = false) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        logger.securityEvent('RBAC_NO_USER', {
          ip: req.ip,
          path: req.path,
          userAgent: req.get('User-Agent')
        });
        return res.status(401).json({ message: 'Authentication required' });
      }

      // Handle account suspension
      if (req.user.isCurrentlySuspended()) {
        logger.securityEvent('SUSPENDED_USER_ACCESS_ATTEMPT', {
          userId: req.user._id,
          email: req.user.email,
          ip: req.ip,
          path: req.path,
          suspensionReason: req.user.suspensionReason
        });
        return res.status(403).json({ 
          message: 'Account suspended', 
          reason: req.user.suspensionReason,
          suspendedUntil: req.user.suspendedUntil
        });
      }

      // Check if account is active
      if (!req.user.isActive) {
        logger.securityEvent('INACTIVE_USER_ACCESS_ATTEMPT', {
          userId: req.user._id,
          email: req.user.email,
          ip: req.ip,
          path: req.path
        });
        return res.status(403).json({ message: 'Account deactivated' });
      }

      const permissions = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions];
      
      let hasPermission;
      if (requireAll) {
        hasPermission = permissions.every(permission => req.user.hasPermission(permission));
      } else {
        hasPermission = req.user.hasAnyPermission(permissions);
      }

      if (!hasPermission) {
        logger.securityEvent('RBAC_PERMISSION_DENIED', {
          userId: req.user._id,
          userPermissions: req.user.permissions,
          requiredPermissions: permissions,
          requireAll,
          ip: req.ip,
          path: req.path,
          userAgent: req.get('User-Agent')
        });
        return res.status(403).json({ 
          message: 'Insufficient permissions',
          required: permissions,
          requireAll,
          current: req.user.permissions
        });
      }

      next();
    } catch (error) {
      logger.error('RBAC permission check error', { 
        error: error.message,
        userId: req.user?._id,
        path: req.path
      });
      res.status(500).json({ message: 'Permission check failed' });
    }
  };
};

/**
 * Admin-only access middleware
 */
const requireAdmin = requireRole('admin');

/**
 * Moderator or Admin access middleware
 */
const requireModerator = requireRole(['moderator', 'admin']);

/**
 * Resource ownership check - allows access if user owns the resource or is admin
 * @param {Function} getResourceOwnerId - Function that returns the resource owner ID from req
 * @returns {Function} Express middleware
 */
const requireOwnershipOrAdmin = (getResourceOwnerId) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      // Admin can access anything
      if (req.user.isAdmin()) {
        return next();
      }

      // Check ownership
      const resourceOwnerId = getResourceOwnerId(req);
      if (req.user._id.toString() === resourceOwnerId?.toString()) {
        return next();
      }

      logger.securityEvent('RBAC_OWNERSHIP_DENIED', {
        userId: req.user._id,
        resourceOwnerId,
        ip: req.ip,
        path: req.path,
        userAgent: req.get('User-Agent')
      });

      return res.status(403).json({ 
        message: 'Access denied. You can only access your own resources.' 
      });
    } catch (error) {
      logger.error('RBAC ownership check error', { 
        error: error.message,
        userId: req.user?._id,
        path: req.path
      });
      res.status(500).json({ message: 'Ownership check failed' });
    }
  };
};

/**
 * Check if user can perform action on specific resource
 * @param {Object} options - Configuration object
 * @param {string} options.permission - Required permission
 * @param {Function} options.getResourceOwnerId - Function to get resource owner ID
 * @param {boolean} options.allowOwner - Allow resource owner even without permission
 * @returns {Function} Express middleware
 */
const requireResourceAccess = (options) => {
  const { permission, getResourceOwnerId, allowOwner = true } = options;
  
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      // Check if user has the required permission
      if (req.user.hasPermission(permission)) {
        return next();
      }

      // Check ownership if allowed
      if (allowOwner && getResourceOwnerId) {
        const resourceOwnerId = getResourceOwnerId(req);
        if (req.user._id.toString() === resourceOwnerId?.toString()) {
          return next();
        }
      }

      logger.securityEvent('RBAC_RESOURCE_ACCESS_DENIED', {
        userId: req.user._id,
        permission,
        allowOwner,
        ip: req.ip,
        path: req.path,
        userAgent: req.get('User-Agent')
      });

      return res.status(403).json({ 
        message: 'Insufficient permissions for this resource',
        required: permission
      });
    } catch (error) {
      logger.error('RBAC resource access check error', { 
        error: error.message,
        userId: req.user?._id,
        path: req.path
      });
      res.status(500).json({ message: 'Resource access check failed' });
    }
  };
};

/**
 * Middleware to add user role and permission info to response headers (for debugging)
 * Only in development mode
 */
const addDebugHeaders = (req, res, next) => {
  if (process.env.NODE_ENV === 'development' && req.user) {
    res.set({
      'X-User-Role': req.user.role,
      'X-User-Permissions': req.user.permissions.join(','),
      'X-User-ID': req.user._id.toString()
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
  addDebugHeaders
};
