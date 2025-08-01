# CodeCollab Implementation Notes

## Project Overview
A collaborative coding platform built with React frontend and Node.js backend, using MongoDB for data storage.

## API Endpoints

### Project Endpoints
1. **Create project**: `POST /api/projects` with required headers and body structure
2. **Get all projects**: `GET /api/projects`
3. **Get project by ID**: `GET /api/projects/:projectId`
4. **Update project**: `PUT /api/projects/:projectId` with required headers and body structure
5. **Delete project**: `DELETE /api/projects/:projectId` with required headers
6. **Request collaboration**: `POST /api/projects/:projectId/collaborate` with required headers and body structure
7. **Handle collaboration request**: `PUT /api/projects/:projectId/collaborate/:requestId` with required headers and body structure
8. **Search projects**: `GET /api/projects/search?query=javascript`

### Comment Endpoints
1. **Create comment**: `POST /api/projects/:projectId/comments` with required headers and body structure
2. **Get project comments**: `GET /api/projects/:projectId/comments`
3. **Update comment**: `PUT /api/projects/:projectId/comments/:commentId` with required headers and body structure
4. **Delete comment**: `DELETE /api/projects/:projectId/comments/:commentId` with required headers

## Frontend Components

### Pages
1. **Home Page** (`/`)
   - Landing page with hero section and featured projects
   - Accessible to all users

2. **Authentication Pages**
   - Login Page (`/login`)
   - Registration Page (`/register`)

3. **Dashboard** (`/dashboard`)
   - Protected route, requires authentication
   - Shows user's projects and collaboration requests

4. **Project Pages**
   - Project List (`/projects`)
   - Project Detail (`/projects/:projectId`)
   - Create Project (`/projects/create`)
   - Edit Project (`/projects/:projectId/edit`)

5. **Profile Page** (`/profile`)
   - Protected route, requires authentication
   - Shows user information and settings

6. **Error Page**
   - 404 Not Found Page (`*`)

## Docker Setup

### Configuration Files
1. **Backend Dockerfile**
```dockerfile
FROM node:18-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

2. **Frontend Dockerfile**
```dockerfile
FROM node:18-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

3. **docker-compose.yml**
```yaml
version: '3.8'

services:
  backend:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=development
      - MONGODB_URI=mongodb://mongo:27017/codecollab
      - JWT_SECRET=your_jwt_secret
    depends_on:
      - mongo
    volumes:
      - .:/usr/src/app
      - /usr/src/app/node_modules

  frontend:
    build: ./client
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_API_URL=http://localhost:5000
    volumes:
      - ./client:/usr/src/app
      - /usr/src/app/node_modules
    depends_on:
      - backend

  mongo:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

volumes:
  mongodb_data:
```

## Running the Application

1. Start the application:
```bash
docker-compose up --build
```

2. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - MongoDB: localhost:27017

3. Stop the application:
```bash
docker-compose down
```

4. Stop and remove all data:
```bash
docker-compose down -v
```

## Features Implemented

1. **User Authentication**
   - Registration and Login
   - JWT token-based authentication
   - Protected routes

2. **Project Management**
   - CRUD operations for projects
   - Project form with validation
   - Comments system

3. **Database Integration**
   - MongoDB connection
   - Data persistence
   - Proper data models

## Testing the Application

1. **Register a new user**
   - Go to http://localhost:3000/register
   - Fill in the registration form

2. **Login**
   - Go to http://localhost:3000/login
   - Use registered credentials

3. **Create a test project**
   - Go to http://localhost:3000/projects/create
   - Fill in project details

4. **View and manage projects**
   - Browse projects at http://localhost:3000/projects
   - View project details
   - Add comments
   - Edit or delete projects 