# Setup Instructions

## Environment Configuration

1. **Copy environment files:**
   ```bash
   cp server/example.env server/.env
   cp client/example.env client/.env
   ```

2. **Copy Docker configuration:**
   ```bash
   cp docker-compose.example.yml docker-compose.yml
   ```

3. **Update environment variables:**
   - Edit `server/.env` with your actual values:
     - `JWT_SECRET`: Generate a secure random string
     - `EMAIL_USER`: Your Gmail address (for sending emails)
     - `EMAIL_PASSWORD`: Your Gmail app password (not your regular password)
     - `MONGODB_URI`: Your MongoDB connection string

4. **Start the application:**
   ```bash
   docker-compose up --build
   ```

## Important Security Notes

- Never commit actual `.env` files or `docker-compose.yml` with real credentials
- Use Gmail App Passwords, not your regular Gmail password
- Generate a strong JWT secret (32+ random characters)
- The `.env` and `docker-compose.yml` files are ignored by git for security

## File Structure

```
project/
├── server/
│   ├── example.env          # Server environment template
│   └── .env                 # Your actual server config (ignored by git)
├── client/
│   ├── example.env          # Client environment template
│   └── .env                 # Your actual client config (ignored by git)
├── docker-compose.example.yml  # Docker template
└── docker-compose.yml      # Your actual Docker config (ignored by git)
```
