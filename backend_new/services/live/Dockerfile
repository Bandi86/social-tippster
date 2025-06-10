# Dockerfile for live microservice
FROM node:20-alpine AS base

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps --only=production
COPY . .
RUN npm run build

EXPOSE 3011

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3011/health || exit 1

CMD ["node", "dist/main"]

# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY tsconfig.json ./
COPY .env* ./
COPY src ./src
COPY prisma ./prisma
RUN npm install --legacy-peer-deps && npm run build

# Development stage
FROM node:20-alpine AS dev
WORKDIR /app
COPY package*.json ./
COPY tsconfig.json ./
COPY .env* ./
COPY src ./src
COPY prisma ./prisma
# Install dependencies
RUN npm install --legacy-peer-deps
EXPOSE 3011
CMD ["npm", "run", "start:dev"]

# Production stage
FROM node:20-alpine AS production
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
USER node
EXPOSE 3011
CMD ["node", "dist/main"]
