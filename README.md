# CodeCollab - Computer Club Collaboration Platform

A modern web application for computer club members to collaborate on projects, share skills, and work together effectively.

## ✨ Features

- 🔐 **User Authentication & Authorization** - Secure JWT-based auth with email verification
- 👤 **Rich Member Profiles** - Skills, portfolio links, experience levels, and availability status
- 📋 **Project Management** - Create, edit, delete projects with collaboration requests
- 💬 **Comments System** - Real-time project discussions and feedback
- 🔍 **Advanced Search** - Find projects and members by skills, experience, and availability
- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- 📧 **Email Integration** - Password reset and email verification
- 🚀 **Performance Optimized** - Smart caching, background updates, and error recovery

## 🛠️ Tech Stack

### Frontend
- **React.js 18** - Modern React with hooks and functional components
- **Material-UI v5** - Comprehensive component library with modern design
- **TanStack Query v5** - Powerful data fetching, caching, and synchronization
- **React Router DOM v6** - Client-side routing and navigation
- **Axios** - HTTP client for API communication

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Fast, unopinionated web framework
- **MongoDB** - NoSQL database with Mongoose ODM
- **JWT** - JSON Web Tokens for authentication
- **Nodemailer** - Email sending capability
- **Multer** - File upload handling

### DevOps & Deployment
- **Docker** - Containerization for consistent deployments
- **Docker Compose** - Multi-container application orchestration
- **Environment Configuration** - Secure environment variable management

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

3. **Configure environment variables in `server/.env`:**
   ```env
   NODE_ENV=development
   PORT=5001
   FRONTEND_URL=http://localhost:3000
   MONGODB_URI=mongodb://localhost:27017/codecollab
   JWT_SECRET=your_secure_jwt_secret_here
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASSWORD=your_gmail_app_password
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
- **Backend API**: http://localhost:5001
- **API Health Check**: http://localhost:5001/health

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
│   │   │   ├── 📁 projects/     # Project-related components
│   │   │   └── 📁 routing/      # Route protection components
│   │   ├── 📁 config/           # App configuration
│   │   │   └── queryClient.js   # TanStack Query configuration
│   │   ├── 📁 hooks/            # Custom React hooks
│   │   │   ├── 📁 auth/         # Authentication hooks
│   │   │   ├── 📁 comments/     # Comment hooks
│   │   │   ├── 📁 projects/     # Project management hooks
│   │   │   └── 📁 users/        # User management hooks
│   │   ├── 📁 pages/            # Page components
│   │   ├── 📁 services/         # API service layer
│   │   ├── 📁 styles/           # Global styles
│   │   └── 📁 utils/            # Utility functions
│   ├── Dockerfile              # Client container config
│   └── package.json            # Client dependencies
├── 📁 server/                   # Express.js backend
│   ├── 📁 controllers/         # Route handlers
│   ├── 📁 middleware/          # Custom middleware
│   ├── 📁 models/              # MongoDB schemas
│   ├── 📁 routes/              # API routes
│   ├── 📁 services/            # Business logic services
│   ├── 📁 uploads/             # File upload storage
│   ├── example.env             # Environment template
│   └── package.json            # Server dependencies
├── 📄 docker-compose.yml       # Multi-container setup
├── 📄 setup.sh                 # Automated setup script
├── 📄 start.sh                 # Application startup script
├── 📄 SETUP.md                 # Detailed setup instructions
└── 📄 README.md                # This file
```

## 🏗️ Architecture Highlights

### Modern State Management
- **TanStack Query v5** replaces Redux for superior data fetching and caching
- **Smart Cache Invalidation** ensures data consistency across components
- **Optimistic Updates** provide immediate user feedback
- **Background Refetching** keeps data fresh automatically

### Scalable Code Organization
- **Service Layer** abstracts API calls from components
- **Custom Hooks** encapsulate business logic and state management
- **Component Composition** promotes reusability and maintainability
- **TypeScript-Ready** structure for future type safety adoption

### Performance Optimizations
- **Intelligent Caching** reduces unnecessary API calls
- **Error Boundaries** provide graceful error handling
- **Code Splitting** potential for lazy loading
- **Bundle Optimization** minimizes client payload

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
- Update environment variables for production
- Ensure MongoDB connection string is correct
- Set up email service credentials for production

## 🛡️ Security Features

- **JWT Authentication** with secure token handling
- **Password Hashing** using bcryptjs
- **Input Validation** with express-validator
- **Rate Limiting** to prevent abuse
- **CORS Configuration** for secure cross-origin requests
- **Environment Variables** for sensitive configuration

## 📖 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
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

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **TanStack Query** for exceptional data synchronization
- **Material-UI** for beautiful and accessible components
- **MongoDB** for flexible data storage
- **Express.js** for robust backend framework 