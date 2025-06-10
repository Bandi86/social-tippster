# Dockerfile for chat microservice
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
RUN npm install --legacy-peer-deps
EXPOSE 3008
CMD ["npm", "run", "start:dev"]

# Production stage
FROM node:20-alpine AS production
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
USER node
EXPOSE 3008
CMD ["node", "dist/main"]
