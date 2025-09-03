# CodeCollab - Computer Club Collaboration Platform

A web application for computer club members to collaborate on projects, share skills, and work together effectively.

## ✨ Features

### 👤 **User Management**
- **User Registration & Login** - Basic authentication system
- **Role-Based Access Control** - User, Moderator, and Admin roles
- **User Profiles** - Basic profile information

### 📋 **Project Management**
- **Project CRUD Operations** - Create, read, update, delete projects
- **Project Collaboration** - Request and manage collaboration
- **Project Comments** - Discussion and feedback system

### 💬 **Communication**
- **Messaging System** - Direct communication between users
- **Message Organization** - Inbox and sent message management

### 🔐 **Admin Features**
- **Admin Dashboard** - System overview and statistics
- **User Management** - View, edit roles, and manage users
- **Role Management** - Assign and modify user roles

## 🛠️ Tech Stack

### Frontend
- **React.js 18** - Modern React with hooks and functional components
- **Material-UI v5** - Component library with modern design
- **TanStack Query v5** - Data fetching, caching, and synchronization
- **React Router DOM v6** - Client-side routing and navigation
- **Axios** - HTTP client for API communication

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database with Mongoose ODM
- **JWT** - Token-based authentication system
- **Custom Logger** - Basic logging utility

## 📋 Prerequisites

- **Node.js** (v16 or higher recommended)
- **MongoDB** (local installation or MongoDB Atlas)
- **npm** or **yarn** package manager

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

3. **Start the application:**
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

3. **Configure environment variables in `server/.env`:**
   ```env
   NODE_ENV=development
   PORT=5001
   FRONTEND_URL=http://localhost:3000
   MONGODB_URI=mongodb://localhost:27017/codecollab
   JWT_SECRET=your_jwt_secret_here
   JWT_REFRESH_SECRET=your_refresh_secret_here
   ```

4. **Start development servers:**
   ```bash
   npm start
   ```

## 🌐 Application URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001/api

## 📁 Project Structure

```
codecollab/
├── 📁 client/                    # React frontend application
│   ├── 📁 src/
│   │   ├── 📁 components/        # React components
│   │   │   ├── 📁 admin/         # Admin components
│   │   │   ├── 📁 auth/          # Authentication components
│   │   │   ├── 📁 comments/      # Comment system components
│   │   │   ├── 📁 dashboard/     # Dashboard components
│   │   │   ├── 📁 layout/        # Layout components
│   │   │   ├── 📁 messaging/     # Messaging components
│   │   │   ├── 📁 projects/      # Project components
│   │   │   └── 📁 routing/       # Route protection components
│   │   ├── 📁 hooks/             # Custom React hooks
│   │   ├── 📁 pages/             # Page components
│   │   ├── 📁 services/          # API service layer
│   │   └── 📁 utils/             # Utility functions
│   └── package.json              # Client dependencies
├── 📁 server/                     # Express.js backend
│   ├── 📁 controllers/           # Route handlers
│   ├── 📁 middleware/            # Custom middleware
│   ├── 📁 models/                # MongoDB schemas
│   ├── 📁 routes/                # API routes
│   ├── 📁 utils/                 # Utilities (logger, etc.)
│   ├── example.env               # Environment template
│   └── package.json              # Server dependencies
├── 📄 setup.sh                   # Automated setup script
├── 📄 start.sh                   # Application startup script
└── 📄 README.md                  # This file
```

## 🔧 Development Scripts

### Root Directory
```bash
npm start          # Start both client and server in development
npm run client     # Start only the React development server
npm run server     # Start only the Express server with nodemon
npm run install-all # Install dependencies for all parts of the app
```

### Client (React)
```bash
cd client
npm start          # Start development server (http://localhost:3000)
npm run build      # Create production build
npm test           # Run Jest tests
```

### Server (Express)
```bash
cd server
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm run seed       # Seed database with sample data
npm test           # Run server tests
```

## 📖 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

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

### Messaging Endpoints
- `GET /api/users/messages` - Get user messages
- `POST /api/users/messages` - Send a message
- `PUT /api/users/messages/:messageId/read` - Mark message as read
- `DELETE /api/users/messages/:messageId` - Delete a message

### Admin Endpoints
- `GET /api/admin/dashboard` - Admin dashboard statistics
- `GET /api/admin/users` - User management
- `GET /api/admin/users/:id` - User details
- `PUT /api/admin/users/:id/role` - Update user role
- `PUT /api/admin/users/:id/suspension` - Suspend/unsuspend user
- `DELETE /api/admin/users/:id` - Delete user

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

## 📚 Documentation

- **README.md** - This file (overview and quick start)
- **SETUP.md** - Detailed setup instructions
- **ROLES_IMPLEMENTATION.md** - Role-based access control details

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **TanStack Query** for data synchronization
- **Material-UI** for components
- **MongoDB** for data storage
- **Express.js** for backend framework 