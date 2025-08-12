# CodeCollab - Computer Club Collaboration Platform

A modern, secure web application for computer club members to collaborate on projects, share skills, and work together effectively.

## ✨ Features

### 🔐 **Enterprise-Grade Security**
- **Dual-Token Authentication** - 15-minute access tokens + 7-day refresh tokens
- **Session Management** - Track and manage user sessions across multiple devices
- **Automatic Token Refresh** - Seamless user experience with security
- **Comprehensive Monitoring** - Real-time security event detection and logging
- **Advanced Protection** - Rate limiting, input sanitization, CORS, and more

### 👤 **User Management**
- **Rich Member Profiles** - Skills, portfolio links, experience levels, and availability status
- **Email Verification** - Secure account activation process
- **Password Security** - Session invalidation on password changes
- **Multi-Device Support** - Concurrent session limits and management

### 📋 **Project Management**
- **Full CRUD Operations** - Create, edit, delete projects with collaboration requests
- **File Upload Security** - Validated file types and secure storage
- **Access Control** - Role-based permissions and ownership validation

### 💬 **Communication & Collaboration**
- **Messaging System** - Direct member-to-member communication with inbox/sent organization
- **Comments System** - Project discussions and feedback
- **Live Updates** - Real-time data synchronization
- **Optimistic UI** - Immediate feedback with error recovery

### 🔍 **Advanced Search & Discovery**
- **Smart Search** - Find projects and members by skills, experience, and availability
- **Performance Optimized** - Intelligent caching and minimal API calls
- **Background Sync** - Data stays fresh automatically

### 📱 **Modern UX/UI**
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- **Error Boundaries** - Graceful error handling throughout the app
- **Loading States** - Smooth user experience with proper feedback

## 💬 **Messaging System Features**

### **📧 Core Messaging**
- **Send Messages** - Direct communication between team members
- **Inbox & Sent Organization** - Organized message management with tabs
- **Message Threads** - View full message details with sender information
- **Reply Functionality** - Easy conversation continuation
- **Delete Messages** - Remove unwanted messages (sender and recipient can delete)

### **🔔 Smart Notifications**
- **Unread Message Badge** - Real-time notification in navigation header
- **Message Status Tracking** - Read/unread status with timestamps
- **Automatic Read Marking** - Messages marked as read when opened

### **👥 User Integration**
- **Message from Members Page** - Direct messaging from user profiles
- **Recipient Search** - Smart user selection with autocomplete
- **Message Validation** - Character limits and content validation
- **Profile Integration** - Messages linked to user profiles with avatars

### **⚡ Performance & UX**
- **TanStack Query Integration** - Optimized caching and real-time updates
- **Optimistic Updates** - Immediate UI feedback
- **Background Sync** - Automatic message refresh
- **Error Recovery** - Graceful handling of network issues

## 🛠️ Tech Stack

### Frontend
- **React.js 18** - Modern React with hooks and functional components
- **Material-UI v5** - Comprehensive component library with modern design
- **TanStack Query v5** - Powerful data fetching, caching, and synchronization
- **React Router DOM v6** - Client-side routing and navigation
- **Axios** - HTTP client for API communication
- **Date-fns** - Modern date utility library for message timestamps

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Fast, unopinionated web framework
- **MongoDB** - NoSQL database with Mongoose ODM
- **JWT** - Dual-token authentication system
- **Nodemailer** - Email sending capability
- **Multer** - Secure file upload handling
- **Winston** - Comprehensive logging system
- **Helmet** - Security headers and protection
- **Express Rate Limit** - API abuse prevention

### DevOps & Deployment
- **Docker** - Hardened containerization with security best practices
- **Docker Compose** - Multi-container orchestration with health checks
- **Environment Validation** - Secure environment variable management
- **Non-Root Containers** - Enhanced container security
- **Resource Limits** - Memory and CPU constraints
- **Health Monitoring** - Automatic service health checks

## 📋 Prerequisites

- **Node.js** (v16 or higher recommended)
- **MongoDB** (local installation or MongoDB Atlas)
- **npm** or **yarn** package manager
- **Docker** (optional, for containerized deployment)
- **Gmail Account** (for email functionality)

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/codecollab.git
   cd codecollab
   ```

2. **Run the automated setup:**
   ```bash
   chmod +x setup.sh start.sh
   ./setup.sh
   ```
   This automatically:
   - Copies environment configuration files
   - Generates secure JWT secrets
   - Sets up Docker configuration
   - Creates necessary directories

3. **Configure email settings:**
   Edit `server/.env` and update:
   ```env
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASSWORD=your_gmail_app_password
   ```
   
   **Note**: JWT secrets are automatically generated for security. See `SECURITY.md` for details.

4. **Start the application:**
   ```bash
   ./start.sh
   ```

### Option 2: Manual Setup

1. **Clone and install dependencies:**
   ```bash
   git clone https://github.com/your-username/codecollab.git
   cd codecollab
   npm run install-all
   ```

2. **Set up environment files:**
   ```bash
   cp server/example.env server/.env
   cp client/example.env client/.env
   ```

3. **Generate secure secrets and configure environment variables in `server/.env`:**
   ```bash
   cd server && node scripts/generateSecrets.js
   ```
   Then edit `server/.env`:
   ```env
   NODE_ENV=development
   PORT=5001
   FRONTEND_URL=http://localhost:3000
   MONGODB_URI=mongodb://localhost:27017/codecollab
   JWT_SECRET=generated_secure_64_char_secret
   JWT_REFRESH_SECRET=different_64_char_secret
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASSWORD=your_gmail_app_password
   MAX_CONCURRENT_SESSIONS=3
   SESSION_TIMEOUT_MINUTES=30
   ```

4. **Start development servers:**
   ```bash
   npm start
   ```

### Option 3: Docker Setup

1. **Set up environment and start with Docker:**
   ```bash
   ./setup.sh
   docker-compose up --build
   ```

## 🌐 Application URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001/api
- **API Health Check**: http://localhost:5001/health
- **Security Logs**: `server/logs/` (see SECURITY.md for details)

## 📁 Project Structure

```
codecollab/
├── 📁 client/                    # React frontend application
│   ├── 📁 public/               # Static assets
│   ├── 📁 src/
│   │   ├── 📁 components/       # Reusable React components
│   │   │   ├── 📁 auth/         # Authentication components
│   │   │   ├── 📁 comments/     # Comment system components
│   │   │   ├── 📁 dashboard/    # Dashboard components
│   │   │   ├── 📁 layout/       # Layout components (Header, Footer)
│   │   │   ├── 📁 messaging/    # Messaging system components
│   │   │   ├── 📁 projects/     # Project-related components
│   │   │   └── 📁 routing/      # Route protection components
│   │   ├── 📁 config/           # App configuration
│   │   │   └── queryClient.js   # TanStack Query configuration
│   │   ├── 📁 hooks/            # Custom React hooks
│   │   │   ├── 📁 auth/         # Authentication hooks
│   │   │   ├── 📁 comments/     # Comment hooks
│   │   │   ├── 📁 projects/     # Project management hooks
│   │   │   └── 📁 users/        # User management & messaging hooks
│   │   ├── 📁 pages/            # Page components
│   │   ├── 📁 services/         # API service layer
│   │   ├── 📁 styles/           # Global styles
│   │   └── 📁 utils/            # Utility functions
│   ├── Dockerfile              # Client container config
│   └── package.json            # Client dependencies
├── 📁 server/                   # Express.js backend
│   ├── 📁 controllers/         # Route handlers
│   ├── 📁 middleware/          # Custom middleware (auth, security, errors)
│   ├── 📁 models/              # MongoDB schemas (User, Project, Message, Session, etc.)
│   ├── 📁 routes/              # API routes
│   ├── 📁 services/            # Business logic services (session, email)
│   ├── 📁 scripts/             # Utility scripts (secret generation)
│   ├── 📁 utils/               # Utilities (logger, env validation, tasks)
│   ├── 📁 uploads/             # File upload storage
│   ├── 📁 logs/                # Security and application logs
│   ├── example.env             # Environment template
│   └── package.json            # Server dependencies
├── 📄 docker-compose.yml       # Multi-container setup
├── 📄 setup.sh                 # Automated setup script
├── 📄 start.sh                 # Application startup script
├── 📄 SETUP.md                 # Detailed setup instructions
└── 📄 README.md                # This file
```

## 🏗️ Architecture Highlights

### 🧠 Modern State Management
- **TanStack Query v5** replaces Redux for superior data fetching and caching
- **Smart Cache Invalidation** ensures data consistency across components
- **Optimistic Updates** provide immediate user feedback
- **Background Refetching** keeps data fresh automatically
- **Intelligent Token Management** - 95% reduction in unnecessary auth calls

### 📚 Scalable Code Organization
- **Service Layer** abstracts API calls from components
- **Custom Hooks** encapsulate business logic and state management
- **Component Composition** promotes reusability and maintainability
- **TypeScript-Ready** structure for future type safety adoption
- **Modular Architecture** with clear separation of concerns

### ⚡ Performance Optimizations
- **Intelligent Caching** reduces unnecessary API calls
- **Smart Token Refresh** only when needed for critical operations
- **Error Boundaries** provide graceful error handling
- **Code Splitting** potential for lazy loading
- **Bundle Optimization** minimizes client payload
- **Lightweight API Interceptors** for non-critical requests

### 🛡️ Security Architecture
- **Dual-Token System** with automatic refresh
- **Session Tracking** across multiple devices
- **Security Event Monitoring** with real-time logging
- **Rate Limiting** and suspicious activity detection
- **Input Sanitization** and injection prevention
- **Secure Container Deployment** with hardened Docker configuration

## 🔧 Development Scripts

### Root Directory
```bash
npm start          # Start both client and server in development
npm run client     # Start only the React development server
npm run server     # Start only the Express server with nodemon
npm run install-all # Install dependencies for all parts of the app
npm test           # Run tests for both client and server
```

### Client (React)
```bash
cd client
npm start          # Start development server (http://localhost:3000)
npm run build      # Create production build
npm test           # Run Jest tests
npm run eject      # Eject from Create React App (irreversible)
```

### Server (Express)
```bash
cd server
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm run seed       # Seed database with sample data
npm run reset-users # Reset user database
npm test           # Run server tests
node scripts/generateSecrets.js  # Generate secure JWT secrets
```

## 🚀 Deployment

### Docker Deployment
```bash
# Build and start all services
docker-compose up --build

# Start in detached mode
docker-compose up -d

# Stop all services
docker-compose down
```

### Environment Configuration
- Copy `example.env` files to `.env` in respective directories
- Generate secure JWT secrets using `node scripts/generateSecrets.js`
- Update environment variables for production
- Ensure MongoDB connection string is correct
- Set up email service credentials for production
- Configure session limits and security parameters

## 🛡️ Security Features

### 🔐 **Authentication & Authorization**
- **Dual-Token JWT System** - 15-minute access + 7-day refresh tokens
- **Automatic Token Refresh** - Seamless user experience
- **Session Management** - Multi-device tracking with concurrent limits
- **Password Security** - Session invalidation on password changes
- **Email Verification** - Secure account activation

### 🛡️ **Protection & Monitoring**
- **Rate Limiting** - Configurable limits to prevent API abuse
- **Input Sanitization** - MongoDB injection and XSS prevention
- **Security Headers** - Helmet.js with CSP, HSTS, and more
- **CORS Configuration** - Strict cross-origin request policies
- **Real-time Monitoring** - Security event logging and detection
- **Suspicious Activity Detection** - Automated threat identification

### 🐳 **Container Security**
- **Non-root Containers** - All services run as unprivileged users
- **Resource Limits** - Memory and CPU constraints
- **Read-only Filesystems** - Minimal write access
- **Capability Dropping** - Reduced Linux capabilities
- **Health Monitoring** - Automatic service health checks

### 📊 **Logging & Auditing**
- **Comprehensive Logging** - Winston-based structured logging
- **Security Event Tracking** - Authentication, sessions, and violations
- **Audit Trail** - Complete record of user actions
- **Scheduled Maintenance** - Automatic cleanup and reporting

For detailed security information, see `SECURITY.md`.

## 📖 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout (current session)
- `POST /api/auth/logout-all` - Logout from all sessions
- `POST /api/auth/refresh-token` - Refresh access token
- `GET /api/auth/sessions` - Get active sessions
- `POST /api/auth/change-password` - Change user password
- `GET /api/auth/me` - Get current user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Project Endpoints
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get project by ID
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `POST /api/projects/:id/collaborate` - Request collaboration

### Comment Endpoints
- `GET /api/projects/:projectId/comments` - Get project comments
- `POST /api/projects/:projectId/comments` - Create comment
- `PUT /api/projects/:projectId/comments/:commentId` - Update comment
- `DELETE /api/projects/:projectId/comments/:commentId` - Delete comment

### User Endpoints
- `GET /api/users` - Get all users
- `GET /api/users/profile/me` - Get current user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/search` - Search users

### Messaging Endpoints
- `GET /api/users/messages` - Get user messages (inbox/sent)
- `POST /api/users/messages` - Send a message to another user
- `PUT /api/users/messages/:messageId/read` - Mark message as read
- `DELETE /api/users/messages/:messageId` - Delete a message

## 🤝 Contributing

1. **Fork the repository**
2. **Create your feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** following the existing code style
4. **Test your changes** thoroughly
5. **Commit your changes**: `git commit -m 'Add some amazing feature'`
6. **Push to the branch**: `git push origin feature/amazing-feature`
7. **Open a Pull Request** with a clear description

### Development Guidelines
- Follow the existing code structure and naming conventions
- Use TanStack Query for all data fetching and state management
- Write reusable components and custom hooks
- Add appropriate error handling and loading states
- Test your changes across different screen sizes
- Follow security best practices (see `SECURITY.md`)
- Use the provided authentication hooks and services
- Implement proper logging for security events

### Security Considerations
- Never commit `.env` files with real credentials
- Use the provided `generateSecrets.js` script for JWT secrets
- Follow the dual-token authentication pattern
- Implement proper input validation
- Use the security monitoring middleware for sensitive operations
- Log security-relevant events appropriately

## 📚 Documentation

- **README.md** - This file (overview and quick start)
- **SETUP.md** - Detailed setup instructions
- **SECURITY.md** - Comprehensive security documentation
- **API Documentation** - Available endpoints and usage

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **TanStack Query** for exceptional data synchronization
- **Material-UI** for beautiful and accessible components
- **MongoDB** for flexible data storage
- **Express.js** for robust backend framework
- **Helmet.js** for security headers and protection
- **Winston** for comprehensive logging capabilities 