# Stage 1: Build React static assets
FROM node:18-alpine AS build

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Serve using Nginx
FROM nginx:alpine

# Copy custom Nginx configuration mapping port 7000
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build artifacts to Nginx html directory
COPY --from=build /usr/src/app/dist /usr/share/nginx/html

# Expose custom frontend port 7000
EXPOSE 7000

CMD ["nginx", "-g", "daemon off;"]
