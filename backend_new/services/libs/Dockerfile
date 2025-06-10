# Development Dockerfile for NestJS microservice
FROM node:20-alpine AS dev
WORKDIR /app
COPY package*.json ./
COPY tsconfig.json ./
COPY .env* ./
RUN npm install --legacy-peer-deps
COPY . .
EXPOSE 3000
CMD ["npm", "run", "start:dev"]

# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY tsconfig.json ./
COPY .env* ./
COPY src ./src
RUN npm install --legacy-peer_deps && npm run build

# Production stage
FROM node:20-alpine AS production
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
USER node
EXPOSE 3000
CMD ["node", "dist/main"]
