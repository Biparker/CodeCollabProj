# Role-Based Access Control (RBAC) Implementation

## Overview

This document describes the comprehensive role-based access control system implemented in CodeCollabProj. The system provides three distinct user roles with granular permissions and a complete admin interface for user management.

## Role Types

### 1. **User (Default)**
- Basic collaboration features
- Can create and participate in projects
- Can comment on projects
- Limited to own content management

**Default Permissions:**
- `projects.read`
- `projects.create`
- `comments.read`
- `comments.create`

### 2. **Moderator**
- Content moderation capabilities
- Can moderate projects and comments
- Can view user information
- Enhanced content management

**Default Permissions:**
- All User permissions +
- `projects.moderate`
- `comments.moderate`
- `moderate.content`
- `users.read`

### 3. **Admin**
- Full system access
- User management capabilities
- System configuration
- All moderation powers

**Default Permissions:**
- All permissions including:
- `users.*` (create, read, update, delete)
- `projects.*` (full project management)
- `comments.*` (full comment management)
- `admin.*` (admin dashboard, analytics, system)
- `moderate.*` (all moderation powers)

## Backend Implementation

### User Model Extensions (`server/models/User.js`)

```javascript
// Added fields to User schema
role: {
  type: String,
  enum: ['user', 'moderator', 'admin'],
  default: 'user'
},
permissions: [String], // Array of permission strings
isActive: Boolean,
isSuspended: Boolean,
suspendedUntil: Date,
suspensionReason: String
```

**Key Methods:**
- `user.hasRole(role)` - Check if user has specific role
- `user.hasPermission(permission)` - Check specific permission
- `user.setRole(role)` - Update role and auto-assign permissions
- `user.suspend(reason, duration)` - Suspend user account
- `user.isCurrentlySuspended()` - Check active suspension status

### RBAC Middleware (`server/middleware/rbac.js`)

**Core Functions:**
- `requireRole(roles)` - Middleware to require specific role(s)
- `requirePermission(permissions, requireAll)` - Check specific permissions
- `requireAdmin` - Admin-only access
- `requireModerator` - Moderator or Admin access
- `requireOwnershipOrAdmin` - Resource ownership or admin access

**Example Usage:**
```javascript
// Require admin role
router.get('/admin/users', auth, requireAdmin, getUsersController);

// Require specific permission
router.post('/projects', auth, requirePermission('projects.create'), createProject);

// Multiple role options
router.get('/moderate', auth, requireRole(['moderator', 'admin']), moderateContent);
```

### Admin API Routes (`server/routes/admin.js`)

**Available Endpoints:**
- `GET /api/admin/dashboard` - System statistics
- `GET /api/admin/users` - User listing with filters
- `GET /api/admin/users/:id` - User details
- `PUT /api/admin/users/:id/role` - Update user role
- `PUT /api/admin/users/:id/suspension` - Suspend/unsuspend user
- `DELETE /api/admin/users/:id` - Delete/deactivate user
- `GET /api/admin/logs` - System logs

### Admin Controller (`server/controllers/adminController.js`)

**Key Features:**
- Dashboard statistics (users, projects, sessions)
- User management with pagination and filtering
- Role updates with permission auto-assignment
- User suspension with configurable duration
- Comprehensive audit logging

## Frontend Implementation

### Authentication Updates

**Enhanced Auth Hook (`client/src/hooks/auth/useAuth.js`):**
```javascript
// Now returns role and permission helpers
const { user, hasRole, hasPermission, isAdmin } = useAuth();

// Usage examples
if (hasRole('admin')) { /* Show admin features */ }
if (hasPermission('users.update')) { /* Show user edit */ }
```

### Admin Components

**1. Admin Layout (`client/src/components/admin/AdminLayout.js`)**
- Dedicated admin sidebar navigation
- Role-based menu visibility
- Easy navigation between admin functions

**2. Admin Dashboard (`client/src/components/admin/AdminDashboard.js`)**
- Real-time system statistics
- User role breakdown
- Content overview
- Activity summaries

**3. User Management (`client/src/components/admin/UserManagement.js`)**
- Searchable user table
- Role-based filtering
- Inline role editing
- User suspension/activation
- Bulk operations

### Route Protection

**AdminRoute Component (`client/src/components/routing/AdminRoute.js`):**
```javascript
// Protects admin routes with role checking
<AdminRoute requireRole={['admin', 'moderator']}>
  <AdminDashboard />
</AdminRoute>
```

## Security Features

### 1. **Comprehensive Logging**
- All admin actions logged with details
- Security events tracked
- User access attempts monitored
- Audit trail for compliance

### 2. **Suspension System**
- Configurable suspension duration
- Automatic session revocation
- Reason tracking
- Appeal process support

### 3. **Permission Validation**
- Server-side permission checking
- Role hierarchy enforcement
- Resource ownership validation
- Cross-cutting security concerns

### 4. **Self-Protection**
- Admins cannot demote themselves
- Protection against admin suspension
- Prevents admin account deletion
- Session management for suspended users

## Database Seeding

### Default Accounts Created

**Admin Account:**
- Email: `admin@codecollabproj.com`
- Password: `admin123!`
- Role: `admin`

**Moderator Account:**
- Email: `moderator@codecollabproj.com`
- Password: `mod123!`
- Role: `moderator`

**Regular Users:**
- Email: `user1@example.com` to `user10@example.com`
- Password: `password123`
- Role: `user`

## Usage Examples

### 1. **Checking User Permissions in Components**
```javascript
import { useAuth } from '../hooks/auth';

const ProjectActions = ({ project }) => {
  const { user, hasPermission } = useAuth();
  
  return (
    <div>
      {hasPermission('projects.update') && (
        <Button onClick={editProject}>Edit</Button>
      )}
      {hasPermission('projects.delete') && (
        <Button onClick={deleteProject}>Delete</Button>
      )}
    </div>
  );
};
```

### 2. **Protecting API Routes**
```javascript
// Require specific permission
router.put('/projects/:id', 
  auth, 
  requireResourceAccess({
    permission: 'projects.update',
    getResourceOwnerId: (req) => req.project.createdBy,
    allowOwner: true
  }),
  updateProject
);
```

### 3. **Admin User Management**
```javascript
// Update user role
await adminService.updateUserRole(userId, { role: 'moderator' });

// Suspend user for 7 days
await adminService.suspendUser(userId, {
  reason: 'Violation of community guidelines',
  duration: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
});
```

## Getting Started

### 1. **Setup**
```bash
# Run database migrations (if any)
npm run migrate

# Seed database with default accounts
npm run seed
```

### 2. **Access Admin Panel**
1. Login with admin credentials
2. Navigate to `/admin` or click "Admin" button in header
3. Manage users from the admin dashboard

### 3. **Testing Roles**
1. Create test users with different roles
2. Test permission boundaries
3. Verify route protection
4. Test admin operations

## API Documentation

### Admin Dashboard Stats
```http
GET /api/admin/dashboard
Authorization: Bearer <admin-token>

Response:
{
  "users": {
    "total": 15,
    "active": 12,
    "suspended": 1,
    "admins": 1,
    "moderators": 1,
    "newThisWeek": 3
  },
  "content": {
    "projects": {
      "total": 25,
      "active": 20,
      "newThisWeek": 5
    }
  }
}
```

### User Management
```http
GET /api/admin/users?page=1&limit=10&search=john&role=user
PUT /api/admin/users/:id/role { "role": "moderator" }
PUT /api/admin/users/:id/suspension { "suspend": true, "reason": "spam" }
```

## Future Enhancements

### Planned Features
1. **Custom Permissions** - User-specific permission overrides
2. **Role Templates** - Predefined permission sets
3. **Audit Dashboard** - Enhanced logging visualization
4. **Bulk Operations** - Mass user management
5. **API Rate Limiting** - Role-based rate limits
6. **Content Moderation** - Advanced moderation tools

### Integration Points
- **Email Notifications** - Role change notifications
- **Webhooks** - External system integration
- **Analytics** - User behavior tracking
- **Reporting** - Administrative reports

## Troubleshooting

### Common Issues

**1. Role Not Updating**
- Check user browser cache/tokens
- Verify database permissions field
- Ensure proper session refresh

**2. Admin Access Denied**
- Verify user role in database
- Check middleware chain order
- Validate JWT token claims

**3. Permission Checks Failing**
- Confirm permission string spelling
- Check role-permission mapping
- Verify middleware configuration

### Debugging
```javascript
// Enable debug headers in development
app.use('/api', addDebugHeaders);

// Check user permissions in browser
console.log(user.role, user.permissions);
```

## Conclusion

This role-based access control system provides a robust foundation for managing user permissions in CodeCollabProj. It offers flexible permission management, comprehensive security features, and an intuitive admin interface while maintaining scalability for future enhancements.

The implementation follows security best practices with server-side validation, comprehensive logging, and protection against common attack vectors. The modular design allows for easy extension and customization based on specific business requirements.
