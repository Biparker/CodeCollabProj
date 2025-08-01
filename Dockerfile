FROM node:18-alpine

WORKDIR /usr/src/app

COPY server/.env ./
# Copy server package files
COPY server/package*.json ./

RUN npm install

# Copy server source code
COPY server/ .

EXPOSE 5001

CMD ["node", "index.js"]