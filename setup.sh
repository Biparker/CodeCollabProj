#!/bin/bash

echo "🚀 CodeCollabProj Setup Script"
echo "=========================="

# Function to generate a secure JWT secret
generate_jwt_secret() {
    if command -v openssl > /dev/null 2>&1; then
        openssl rand -base64 64 | tr -d "=+/" | cut -c1-32
    else
        # Fallback if openssl is not available
        date +%s | sha256sum | base64 | head -c 32
    fi
}

# Check if required files exist
echo "📋 Checking required files..."

if [ ! -f "server/example.env" ]; then
    echo "❌ server/example.env not found!"
    exit 1
fi

if [ ! -f "client/example.env" ]; then
    echo "❌ client/example.env not found!"
    exit 1
fi

if [ ! -f "docker-compose.example.yml" ]; then
    echo "❌ docker-compose.example.yml not found!"
    exit 1
fi

echo "✅ All required example files found"

# 1. Copy environment files
echo ""
echo "📝 Setting up environment files..."

if [ ! -f "server/.env" ]; then
    echo "📄 Copying server/.env from example..."
    cp server/example.env server/.env
    
    # Generate a secure JWT secret
    JWT_SECRET=$(generate_jwt_secret)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/your_jwt_secret_here/$JWT_SECRET/" server/.env
    else
        # Linux
        sed -i "s/your_jwt_secret_here/$JWT_SECRET/" server/.env
    fi
    echo "🔐 Generated secure JWT secret"
else
    echo "⚠️  server/.env already exists, skipping..."
fi

if [ ! -f "client/.env" ]; then
    echo "📄 Copying client/.env from example..."
    cp client/example.env client/.env
else
    echo "⚠️  client/.env already exists, skipping..."
fi

# 2. Copy Docker configuration
echo ""
echo "🐳 Setting up Docker configuration..."

if [ ! -f "docker-compose.yml" ]; then
    echo "📄 Copying docker-compose.yml from example..."
    cp docker-compose.example.yml docker-compose.yml
else
    echo "⚠️  docker-compose.yml already exists, skipping..."
fi

# 3. Create uploads directory
echo ""
echo "📁 Creating uploads directory..."
mkdir -p server/uploads

echo ""
echo "✅ Setup completed!"
echo ""
echo "📋 Next steps:"
echo "1. Edit server/.env with your actual values:"
echo "   - EMAIL_USER: Your Gmail address"
echo "   - EMAIL_PASSWORD: Your Gmail app password"
echo "   - MONGODB_URI: Your MongoDB connection string (if different)"
echo ""
echo "2. Start the application:"
echo "   ./start.sh"
echo ""
echo "🔒 Security reminders:"
echo "- Never commit .env files or docker-compose.yml with real credentials"
echo "- Use Gmail App Passwords, not your regular Gmail password"
echo "- The JWT secret has been automatically generated for security"
