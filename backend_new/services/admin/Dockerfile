# Development Dockerfile for NestJS microservice
FROM node:20-alpine AS dev
WORKDIR /app
# Install dependencies
COPY package*.json ./
COPY tsconfig.json ./
COPY .env* ./
RUN npm install --legacy-peer-deps

# Copy Prisma schema and generate client
COPY prisma ./prisma
RUN npx prisma generate

# Copy source files
COPY . .

# Expose port (admin service: 3013)
EXPOSE 3013

# Start command
CMD ["npm", "run", "start:dev"]

# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY tsconfig.json ./
COPY .env* ./
COPY src ./src
COPY prisma ./prisma
RUN npm install --legacy-peer-deps && npm run build

# Production stage
FROM node:20-alpine AS production
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
USER node
EXPOSE 3013
CMD ["node", "dist/main"]
