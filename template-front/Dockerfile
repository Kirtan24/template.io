# Stage 1: Build React app
FROM node:22 AS build

# Set working directory
WORKDIR /app

# Install dependencies
COPY package.json ./
RUN npm install

# Copy the rest of the source code
COPY . .

# Build the production-ready React app
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy React build
COPY --from=build /app/build /usr/share/nginx/html

# Copy custom Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
