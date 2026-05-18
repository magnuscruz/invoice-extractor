# Use a specific Node.js version
FROM node:20-slim

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Set environment to production
ENV NODE_ENV=production

# Start the application
CMD [ "npm", "start" ]
