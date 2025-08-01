# CodeCollab - Computer Club Collaboration Platform

A web application for computer club members to collaborate on projects, share skills, and work together effectively.

## Features

- User authentication and authorization
- Member profiles with skills and portfolio links
- Project management and collaboration
- Real-time updates and comments
- Search functionality for projects and members
- Responsive design for all devices

## Tech Stack

- Frontend: React.js with Material-UI
- Backend: Node.js with Express.js
- Database: MongoDB
- Authentication: JWT
- State Management: Redux Toolkit

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/codecollab.git
   cd codecollab
   ```

2. Install dependencies:
   ```bash
   npm run install-all
   ```

3. Create a .env file in the server directory with the following variables:
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   PORT=5000
   ```

4. Start the development servers:
   ```bash
   npm start
   ```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## Project Structure

```
/codecollab
├── /client (React frontend)
│   ├── /src
│   │   ├── /components
│   │   ├── /pages
│   │   ├── /styles
│   │   └── /utils
├── /server (Express backend)
│   ├── /controllers
│   ├── /models
│   ├── /routes
│   ├── /middleware
│   └── /config
└── /docs
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 