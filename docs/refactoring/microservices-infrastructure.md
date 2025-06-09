# Microservices Infrastructure Documentation

## Overview

This document describes the infrastructure setup for the Social Tippster microservices architecture, including Docker configuration, database setup, messaging systems, and deployment guidelines.

## Infrastructure Components

### Core Services

1. **API Gateway** (Port 3000) - Central entry point for all services
2. **Auth Service** (Port 3001) - Authentication and authorization
3. **User Service** (Port 3002) - User profile management
4. **Post Service** (Port 3003) - Post creation and management
5. **Tipp Service** (Port 3004) - Betting and predictions
6. **Comment Service** (Port 3005) - Comments and discussions
7. **Notification Service** (Port 3006) - Real-time notifications
8. **Upload Service** (Port 3007) - File upload and management
9. **Image Analysis Service** (Port 3008) - AI-based image analysis
10. **Admin Service** (Port 3009) - Administration interface
11. **Chat Service** (Port 3010) - Chat functionality
12. **Live Service** (Port 3011) - Live events and streaming
13. **Data Service** (Port 3012) - Football data and statistics

### Infrastructure Services

- **Redis** (Port 6379) - Caching and session storage
- **RabbitMQ** (Port 5672, Management UI: 15672) - Message queuing
- **MySQL** (Port 3306) - Database cluster

## Docker Setup

### Docker Compose Configuration

The entire microservices ecosystem is orchestrated using Docker Compose. The main configuration includes:

```yaml
version: '3.8'

services:
  # Infrastructure Services
  mysql:
    image: mysql:8.0
    container_name: social-tippster-mysql
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: social_tippster
    ports:
      - '3306:3306'
    volumes:
      - mysql_data:/var/lib/mysql
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - microservices-network

  redis:
    image: redis:7-alpine
    container_name: social-tippster-redis
    ports:
      - '6379:6379'
    volumes:
      - redis_data:/data
    networks:
      - microservices-network

  rabbitmq:
    image: rabbitmq:3-management
    container_name: social-tippster-rabbitmq
    environment:
      RABBITMQ_DEFAULT_USER: admin
      RABBITMQ_DEFAULT_PASS: admin123
    ports:
      - '5672:5672'
      - '15672:15672'
    volumes:
      - rabbitmq_data:/var/lib/rabbitmq
    networks:
      - microservices-network

  # Microservices (example)
  api-gateway:
    build: ./services/api-gateway
    container_name: api-gateway
    ports:
      - '3000:3000'
    environment:
      - NODE_ENV=production
    depends_on:
      - redis
      - auth-service
    networks:
      - microservices-network

volumes:
  mysql_data:
  redis_data:
  rabbitmq_data:

networks:
  microservices-network:
    driver: bridge
```

### Database Initialization

The `init.sql` script creates separate databases for each microservice:

```sql
-- Create databases for each microservice
CREATE DATABASE IF NOT EXISTS auth_db;
CREATE DATABASE IF NOT EXISTS user_db;
CREATE DATABASE IF NOT EXISTS post_db;
CREATE DATABASE IF NOT EXISTS tipp_db;
CREATE DATABASE IF NOT EXISTS comment_db;
CREATE DATABASE IF NOT EXISTS notification_db;
CREATE DATABASE IF NOT EXISTS upload_db;
CREATE DATABASE IF NOT EXISTS image_analysis_db;
CREATE DATABASE IF NOT EXISTS admin_db;
CREATE DATABASE IF NOT EXISTS chat_db;
CREATE DATABASE IF NOT EXISTS live_db;
CREATE DATABASE IF NOT EXISTS data_db;

-- Create users for each service
CREATE USER IF NOT EXISTS 'auth_user'@'%' IDENTIFIED BY 'auth_password';
CREATE USER IF NOT EXISTS 'user_user'@'%' IDENTIFIED BY 'user_password';
-- ... (additional users)

-- Grant permissions
GRANT ALL PRIVILEGES ON auth_db.* TO 'auth_user'@'%';
GRANT ALL PRIVILEGES ON user_db.* TO 'user_user'@'%';
-- ... (additional permissions)

FLUSH PRIVILEGES;
```

## Quick Start with Docker

### 1. Clone the Repository

```bash
git clone <repository-url>
cd social-tippster/backend_new
```

### 2. Start All Services

```bash
docker-compose up -d
```

### 3. Check Service Health

```bash
# API Gateway health
curl http://localhost:3000/health

# Auth Service health
curl http://localhost:3001/health

# User Service health
curl http://localhost:3002/health

# Post Service health
curl http://localhost:3003/health

# Additional services...
```

### 4. Access Services

- API Gateway: [http://localhost:3000](http://localhost:3000)
- Auth Service: [http://localhost:3001](http://localhost:3001)
- User Service: [http://localhost:3002](http://localhost:3002)
- RabbitMQ Management: [http://localhost:15672](http://localhost:15672) (admin/admin123)

## Directory Structure

```
backend_new/
├── services/
│   ├── api-gateway/          # API Gateway service
│   ├── auth/                 # Authentication service
│   ├── user/                 # User management service
│   ├── post/                 # Post management service
│   ├── tipp/                 # Betting/tip service
│   ├── comment/              # Comment/discussion service
│   ├── notification/         # Notification service
│   ├── upload/               # File upload service
│   ├── image-analysis/       # Image analysis service
│   ├── admin/                # Administration service
│   ├── chat/                 # Chat service
│   ├── live/                 # Live events service
│   └── data/                 # Football data service
├── docker-compose.yml        # Container orchestration
├── init.sql                  # Database initialization
└── README.md                 # Main documentation
```

## Service Configuration

### Individual Service Structure

Each microservice follows a consistent structure:

```
service-name/
├── src/
│   ├── controllers/
│   ├── services/
│   ├── entities/
│   ├── dto/
│   ├── guards/
│   └── main.ts
├── Dockerfile
├── package.json
├── tsconfig.json
└── .env.example
```

### Environment Configuration

Each service has its own environment configuration:

```bash
# Service-specific variables
SERVICE_NAME=auth-service
SERVICE_PORT=3001
NODE_ENV=production

# Database configuration
DB_HOST=mysql
DB_PORT=3306
DB_USERNAME=auth_user
DB_PASSWORD=auth_password
DB_DATABASE=auth_db

# Redis configuration
REDIS_HOST=redis
REDIS_PORT=6379

# RabbitMQ configuration
RABBITMQ_HOST=rabbitmq
RABBITMQ_PORT=5672
RABBITMQ_USER=admin
RABBITMQ_PASS=admin123
```

## Infrastructure Services

### Redis Configuration

- **Purpose**: Caching, session storage, pub/sub messaging
- **Configuration**: Default Redis configuration with persistence
- **Usage**: Session management, temporary data storage, real-time features

### RabbitMQ Configuration

- **Purpose**: Message queuing between microservices
- **Configuration**: Management interface enabled
- **Usage**: Asynchronous communication, event-driven architecture

### MySQL Configuration

- **Purpose**: Primary data storage for all microservices
- **Configuration**: Separate databases per service
- **Usage**: Persistent data storage, relational data management

## Networking

### Container Network

- All services communicate through the `microservices-network`
- Service discovery using container names
- Internal communication without exposing ports externally

### Port Mapping

```
External -> Internal
3000 -> api-gateway:3000
3001 -> auth-service:3001
3002 -> user-service:3002
...
6379 -> redis:6379
5672/15672 -> rabbitmq:5672/15672
3306 -> mysql:3306
```

## Monitoring and Health Checks

### Health Check Endpoints

Each service provides a `/health` endpoint that returns:

```json
{
  "status": "ok",
  "service": "auth-service",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "dependencies": {
    "database": "ok",
    "redis": "ok",
    "rabbitmq": "ok"
  }
}
```

### Log Management

- Centralized logging using Docker logs
- Log aggregation with ELK stack (future enhancement)
- Structured JSON logging format

## Scaling and Load Balancing

### Horizontal Scaling

```bash
# Scale specific service
docker-compose up -d --scale auth-service=3

# Scale multiple services
docker-compose up -d --scale user-service=2 --scale post-service=2
```

### Load Balancer Configuration

- API Gateway handles load balancing
- Round-robin distribution
- Health check integration

## Security

### Network Security

- Internal communication through private network
- Minimal port exposure
- Service-to-service authentication

### Database Security

- Separate user credentials per service
- Principle of least privilege
- Connection encryption

## Backup and Recovery

### Database Backup

```bash
# Create backup
docker exec social-tippster-mysql mysqldump -u root -p social_tippster > backup.sql

# Restore backup
docker exec -i social-tippster-mysql mysql -u root -p social_tippster < backup.sql
```

### Volume Management

- Persistent volumes for data retention
- Regular backup scheduling
- Disaster recovery procedures

## Troubleshooting

### Common Issues

1. **Port conflicts**: Check if ports are already in use
2. **Database connection**: Verify credentials and network connectivity
3. **Memory issues**: Monitor container resource usage
4. **Service discovery**: Ensure proper network configuration

### Debugging Commands

```bash
# Check service logs
docker-compose logs service-name

# Access service container
docker exec -it container-name bash

# Monitor resource usage
docker stats

# Network inspection
docker network inspect microservices-network
```

## Future Enhancements

### Kubernetes Migration

- Helm charts for service deployment
- ConfigMaps and Secrets management
- Horizontal Pod Autoscaling

### Service Mesh

- Istio integration for advanced networking
- Traffic management and security policies
- Observability and monitoring

### CI/CD Pipeline

- Automated testing and deployment
- Container registry integration
- Blue-green deployment strategies
