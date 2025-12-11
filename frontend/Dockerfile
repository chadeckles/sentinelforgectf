# Build stage
FROM node:18-alpine AS build

# Accept build arg for API URL
ARG VITE_API_URL=http://localhost:3000/api/v1
ENV VITE_API_URL=$VITE_API_URL

WORKDIR /opt/sentinelforge/frontend

# Copy package files
COPY package*.json ./
COPY vite.config.js ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build for production
RUN npm run build

# Production stage - serve with nginx
FROM nginx:alpine AS release

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from build stage (vite outputs to build/ not dist/)
COPY --from=build /opt/sentinelforge/frontend/build /usr/share/nginx/html

# Run as root for Azure Container Instances (port 80 requires root)
# In production with proper orchestration, use non-root user

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
