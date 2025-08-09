FROM node:18-alpine

WORKDIR /usr/src/app

# Copy server package files
COPY server/package*.json ./

RUN npm install

# Copy server source code
COPY server/ .

# Create uploads directory
RUN mkdir -p uploads

EXPOSE 5001

CMD ["node", "index.js"]