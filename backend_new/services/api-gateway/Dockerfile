# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Copy tsconfig and env files
COPY tsconfig.json ./
COPY .env* ./

# Copy source code and prisma
COPY src ./src
COPY prisma ./prisma

# Install dependencies and build the application
RUN npm ci && npm run build

# Development stage
FROM node:18-alpine AS dev

WORKDIR /app

# Copy package files
COPY package*.json ./

# Copy tsconfig and env files
COPY tsconfig.json ./
COPY .env* ./

# Copy source code and prisma
COPY src ./src
COPY prisma ./prisma

# Install dependencies
RUN npm ci

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start:dev"]

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Copy built application and node_modules from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# Switch to non-root user
USER node

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start the application
CMD ["node", "dist/main"]
