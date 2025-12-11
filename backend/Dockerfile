# Build stage
FROM node:20-alpine AS build

WORKDIR /opt/sentinelforge/backend

# Install build dependencies for native modules (bcrypt)
RUN apk add --no-cache python3 make g++ libc6-compat \
    && ln -sf python3 /usr/bin/python

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Compile TypeScript
RUN npm run build

# Production stage
FROM node:20-alpine AS release

WORKDIR /opt/sentinelforge/backend

# Install PostgreSQL client and build deps needed during npm install
RUN apk add --no-cache postgresql-client python3 make g++ libc6-compat \
    && ln -sf python3 /usr/bin/python

# Install production dependencies only
COPY package*.json ./
RUN npm ci --only=production \
    && npm install --no-save ts-node typescript

# Copy compiled code from build stage
COPY --from=build /opt/sentinelforge/backend/dist ./dist

# Copy necessary files
COPY knexfile.ts ./
COPY tsconfig.json ./
COPY tsconfig.knex.json ./
COPY migrations ./migrations
COPY seeds ./seeds

# Create non-root user
RUN addgroup -g 1001 -S sentinelforge && \
    adduser -u 1001 -S sentinelforge -G sentinelforge && \
    mkdir -p /var/log/sentinelforge && \
    chown -R sentinelforge:sentinelforge /opt/sentinelforge /var/log/sentinelforge

# Copy entrypoint script
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

USER sentinelforge

EXPOSE 3000

ENTRYPOINT ["./docker-entrypoint.sh"]
