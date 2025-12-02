# Use Node.js base image
FROM node:22

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json ./
RUN npm install --build-from-source bcrypt

# Copy the rest of the source code
COPY . .

# Expose the backend port
EXPOSE 5000

# Set environment
ENV NODE_ENV=production

# Run MongoDB backup before starting the server
CMD ["node", "server.js"]
# CMD ["sh", "-c", "node waste/backup.js || echo '⚠️ Backup failed or skipped'; node server.js"]




# # Use Node.js base image
# FROM node:22

# # Set working directory
# WORKDIR /app

# # Copy package.json and package-lock.json first (for caching)
# COPY package.json ./

# # Install dependencies inside container
# RUN npm install --build-from-source bcrypt

# # Copy rest of the source code (but not local node_modules)
# COPY . .

# # Expose the backend port
# EXPOSE 8000

# # Set environment
# ENV NODE_ENV=production

# # Start server
# CMD ["node", "server.js"]
