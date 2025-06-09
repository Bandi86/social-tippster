# Social Tippster Microservices Architecture

This document describes the microservices architecture implementation for the Social Tippster application.

## Overview

The application has been refactored from a monolithic architecture to a microservices architecture to improve scalability, maintainability, and performance. The system now consists of the following services:

### Core Services

1. **API Gateway** (Port 3000) - Central entry point for all client requests
2. **Auth Service** (Port 3001) - Authentication and authorization
3. **User Service** (Port 3002) - User profile management
4. **Post Service** (Port 3003) - Post creation and management
5. **Tipp Service** (Port 3004) - Betting tips and predictions
6. **Comment Service** (Port 3005) - Comments and discussions
7. **Notification Service** (Port 3006) - Real-time notifications
8. **Upload Service** (Port 3007) - File upload and management
9. **Image Analysis Service** (Port 3008) - AI-powered image analysis

### Infrastructure

- **Redis** (Port 6379) - Caching and session storage
- **RabbitMQ** (Port 5672, Management UI: 15672) - Message queuing
- **MySQL** (Port 3306) - Database cluster

## Directory Structure

```
backend_new/
├── services/
│   ├── api-gateway/          # API Gateway service
│   ├── auth/                 # Authentication service
│   ├── user/                 # User management service
│   ├── post/                 # Post management service
│   ├── bet/                  # Tipp/betting service
│   ├── chat/                 # Comment/chat service
│   ├── notifications/        # Notification service
│   ├── data/                 # Upload service
│   ├── live/                 # Image analysis service
│   └── libs/                 # Shared libraries
├── docker-compose.yml        # Container orchestration
├── init.sql                  # Database initialization
└── README.md                 # This file
```

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- MySQL 8.0+ (if running without Docker)

### Quick Start with Docker

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd social-tippster/backend_new
   ```

2. **Start all services**

   ```bash
   docker-compose up -d
   ```

3. **Check service health**

   ```bash
   # API Gateway health
   curl http://localhost:3000/health

   # Auth Service health
   curl http://localhost:3001/health

   # User Service health
   curl http://localhost:3002/health
   ```

4. **Access services**
   - API Gateway: http://localhost:3000
   - API Documentation: http://localhost:3000/api/docs
   - RabbitMQ Management: http://localhost:15672 (admin/admin123)

### Local Development

Each service can be run independently for development:

1. **Install dependencies**

   ```bash
   cd services/auth
   npm install
   ```

2. **Set up environment**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Run the service**
   ```bash
   npm run start:dev
   ```

## Service Communication

### API Gateway Routes

The API Gateway forwards requests to appropriate microservices:

- `/api/auth/*` → Auth Service
- `/api/users/*` → User Service
- `/api/posts/*` → Post Service
- `/api/tipps/*` → Tipp Service
- `/api/comments/*` → Comment Service
- `/api/notifications/*` → Notification Service
- `/api/uploads/*` → Upload Service
- `/api/image-analysis/*` → Image Analysis Service

### Authentication Flow

1. Client sends login request to `/api/auth/login`
2. API Gateway forwards to Auth Service
3. Auth Service validates credentials and returns JWT
4. Client includes JWT in subsequent requests
5. API Gateway validates JWT with Auth Service
6. Valid requests are forwarded to target services

### Message Queue Events

Services communicate asynchronously via RabbitMQ:

- **User Events**: `user.created`, `user.updated`, `user.deleted`
- **Post Events**: `post.created`, `post.updated`, `post.deleted`
- **Tipp Events**: `tipp.created`, `tipp.result_updated`
- **Comment Events**: `comment.created`, `comment.moderated`
- **Notification Events**: `notification.send`, `notification.delivered`

## Database Schema

Each service maintains its own database:

- `social_tippster_auth` - User authentication data
- `social_tippster_users` - User profile data
- `social_tippster_posts` - Post content and metadata
- `social_tippster_tipps` - Betting tips and results
- `social_tippster_comments` - Comments and discussions
- `social_tippster_notifications` - Notification history
- `social_tippster_uploads` - File metadata
- `social_tippster_analytics` - Analytics and metrics

## Environment Variables

### Common Variables (All Services)

```bash
NODE_ENV=development|production
PORT=<service-port>
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=password
DB_NAME=<service-database>
REDIS_URL=redis://localhost:6379
RABBITMQ_URL=amqp://localhost:5672
```

### Auth Service Specific

```bash
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d
```

## API Documentation

Each service provides Swagger documentation:

- API Gateway: http://localhost:3000/api/docs
- Auth Service: http://localhost:3001/api/docs
- User Service: http://localhost:3002/api/docs
- etc.

## Monitoring and Health Checks

All services provide health check endpoints:

- Individual service: `GET /<service>/health`
- All services via Gateway: `GET /health/services`

Health check responses include:

- Service status
- Database connectivity
- Redis connectivity
- Timestamp
- Version information

## Migration from Monolith

The migration process is designed to be incremental:

1. **Phase 1**: Set up infrastructure (Redis, RabbitMQ, MySQL)
2. **Phase 2**: Deploy API Gateway and Auth Service
3. **Phase 3**: Migrate User and Post services
4. **Phase 4**: Migrate remaining services
5. **Phase 5**: Decommission monolith

During migration, both systems can run in parallel with gradual traffic shifting.

## Security Considerations

- JWT tokens for authentication
- API Gateway handles CORS and security headers
- Rate limiting on API Gateway
- Service-to-service authentication via shared secrets
- Database encryption at rest
- TLS encryption in transit

## Performance Considerations

- Redis caching for frequently accessed data
- Database connection pooling
- Horizontal scaling with load balancers
- Async processing with RabbitMQ
- CDN for static assets

## Development Guidelines

1. **Service Independence**: Each service should be deployable independently
2. **Database Per Service**: No shared databases between services
3. **API Versioning**: Use versioned APIs for backward compatibility
4. **Error Handling**: Consistent error responses across services
5. **Logging**: Structured logging with correlation IDs
6. **Testing**: Unit, integration, and contract tests for each service

## Troubleshooting

### Common Issues

1. **Service Discovery**: Ensure services can reach each other
2. **Database Connections**: Check database credentials and network
3. **Message Queue**: Verify RabbitMQ is running and accessible
4. **JWT Validation**: Ensure JWT secrets are consistent

### Debugging Tools

- Docker logs: `docker-compose logs <service-name>`
- Service health: `curl http://localhost:<port>/health`
- RabbitMQ management UI for message inspection
- Redis CLI for cache inspection

## Contributing

1. Create feature branches for new services
2. Follow NestJS conventions
3. Add comprehensive tests
4. Update documentation
5. Ensure Docker builds work

## License

This project is licensed under the terms specified in the main repository.
