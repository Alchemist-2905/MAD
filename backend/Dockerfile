# Use lightweight official NodeJS image
FROM node:18-alpine

# Set directory inside container
WORKDIR /usr/src/app

# Copy files detailing packages
COPY package*.json ./

# Install npm production tools
RUN npm ci --only=production

# Copy remaining source code
COPY . .

# Expose backend REST API port
EXPOSE 5000

# Start server.js entry point
CMD ["node", "server.js"]
