# Authentication Service Documentation

## Overview

The Authentication Service is a standalone microservice responsible for handling user authentication and authorization within the Social Tippster platform. This service operates independently and manages user login, registration, token generation, and validation.

## Core Functionality

### 1. User Registration

- Enables new user registration with data validation and storage
- Password hashing using bcrypt
- Email validation and uniqueness checks
- User role assignment (user, admin, etc.)

### 2. User Authentication

- Authenticates users based on provided credentials
- Secure password verification using bcrypt
- Account lockout protection against brute force attacks
- Login attempt tracking and monitoring

### 3. JWT Token Management

- Generates JWT (JSON Web Token) after successful login
- Token validation for incoming requests
- Token expiration and refresh logic
- Secure token signing and verification

### 4. Refresh Token System

- Long-lived refresh tokens for extended sessions
- Secure refresh token storage and management
- Automatic access token renewal
- Refresh token rotation for enhanced security

### 5. User Authorization

- Role-based access control (RBAC)
- Permission checking and validation
- User privilege management
- Resource access control

## Service Architecture

### Technology Stack

- **Framework**: NestJS with TypeScript
- **Database**: MySQL with TypeORM
- **Password Hashing**: bcrypt
- **Authentication**: JWT with refresh tokens
- **Validation**: class-validator and class-transformer
- **Optional**: Passport.js for extended authentication strategies

### Directory Structure

```
auth/
├── src/
│   ├── controllers/
│   │   └── auth.controller.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   └── jwt.service.ts
│   ├── entities/
│   │   ├── user.entity.ts
│   │   └── refresh-token.entity.ts
│   ├── dto/
│   │   ├── register.dto.ts
│   │   ├── login.dto.ts
│   │   └── token.dto.ts
│   ├── guards/
│   │   └── jwt-auth.guard.ts
│   ├── strategies/
│   │   └── jwt.strategy.ts
│   └── main.ts
├── Dockerfile
├── package.json
├── tsconfig.json
└── .env.example
```

## Authentication Flow

### Registration Flow

1. User submits registration data
2. Validate input data (email, password strength, etc.)
3. Check email uniqueness
4. Hash password with bcrypt
5. Create user record in database
6. Generate JWT access and refresh tokens
7. Return tokens and user information

### Login Flow

1. User submits login credentials
2. Validate input data
3. Find user by email/username
4. Verify password using bcrypt
5. Check account status (active, locked, etc.)
6. Generate JWT access and refresh tokens
7. Store refresh token in database
8. Return tokens and user information

### Token Refresh Flow

1. Client sends refresh token
2. Validate refresh token
3. Check token exists in database
4. Generate new access token
5. Optionally rotate refresh token
6. Return new tokens

## Session Management Options

### JWT-Based Sessions (Recommended)

- Stateless authentication
- Scalable across microservices
- Self-contained user information
- Configurable expiration times

### Server-Side Sessions (Optional)

- Session data stored on server (Redis)
- More control over session lifecycle
- Ability to invalidate sessions immediately
- Useful for sensitive applications

## Integration with Other Services

### API Gateway Integration

- Token validation middleware
- Request forwarding with user context
- Authentication status propagation

### User Service Integration

- User profile data synchronization
- Role and permission updates
- Account status changes

### Notification Service Integration

- Authentication event notifications
- Security alert triggers
- Login/logout event broadcasting

## Security Considerations

### Password Security

- Minimum password requirements
- bcrypt hashing with appropriate salt rounds
- Password history tracking
- Regular password rotation recommendations

### Token Security

- Secure JWT signing algorithms (RS256 recommended)
- Appropriate token expiration times
- Refresh token rotation
- Token blacklisting capabilities

### Rate Limiting

- Login attempt rate limiting
- Registration rate limiting
- API endpoint protection
- IP-based blocking for suspicious activity

## Configuration

### Environment Variables

```bash
# Database
DB_HOST=mysql
DB_PORT=3306
DB_USERNAME=auth_user
DB_PASSWORD=auth_password
DB_DATABASE=auth_db

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRATION=15m
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRATION=7d

# Service Configuration
AUTH_SERVICE_PORT=3001
SERVICE_NAME=auth-service

# Redis (for sessions/caching)
REDIS_HOST=redis
REDIS_PORT=6379
```

## Deployment

### Docker Configuration

The service includes a Dockerfile for containerization and is configured in the main docker-compose.yml file.

### Health Checks

- `/health` endpoint for service monitoring
- Database connectivity checks
- Redis connectivity validation

### Monitoring

- Authentication success/failure metrics
- Token generation and validation statistics
- Performance monitoring and alerting

## Future Enhancements

### OAuth2/OpenID Connect

- Integration with social login providers
- Google, Facebook, GitHub authentication
- SAML support for enterprise customers

### Multi-Factor Authentication

- SMS-based 2FA
- TOTP (Time-based One-Time Password)
- Hardware token support

### Advanced Security Features

- Biometric authentication
- Device fingerprinting
- Geolocation-based access control
- Advanced threat detection

## Testing

### Unit Tests

- Service layer testing
- Controller endpoint testing
- JWT functionality testing
- Password hashing validation

### Integration Tests

- Database integration testing
- External service integration
- End-to-end authentication flows
- Performance testing under load

## Troubleshooting

### Common Issues

- Token expiration handling
- Database connection problems
- Password reset functionality
- Account lockout scenarios

### Debugging

- Detailed logging configuration
- Error tracking and monitoring
- Performance profiling
- Security audit trails
