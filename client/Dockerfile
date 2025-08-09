FROM node:18-alpine

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Set default environment variables for React
ENV REACT_APP_API_URL=http://localhost:5001/api
ENV WATCHPACK_POLLING=true
ENV FAST_REFRESH=true
ENV CHOKIDAR_USEPOLLING=true

EXPOSE 3000

CMD ["npm", "start"] 