# Security Guidelines for Authentication

## Overview

This document outlines the security best practices and guidelines for implementing authentication in the Social Tippster microservices architecture. These guidelines ensure robust security across all authentication-related functionalities.

## Password Security

### Password Hashing with bcrypt

#### Implementation Guidelines

```typescript
import * as bcrypt from 'bcrypt';

// Password hashing during registration
const saltRounds = 12; // Recommended: 10-12 rounds
const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

// Password verification during login
const isValid = await bcrypt.compare(plainPassword, hashedPassword);
```

#### Best Practices

- **Salt Rounds**: Use 10-12 salt rounds for optimal security/performance balance
- **Never Store Plain Passwords**: Always hash passwords before database storage
- **Regular Hash Updates**: Consider rehashing with higher rounds periodically
- **Memory Considerations**: bcrypt is memory-hard to prevent GPU-based attacks

### Password Policy Requirements

#### Minimum Requirements

- **Length**: Minimum 8 characters, recommended 12+
- **Complexity**: At least 3 of the following:
  - Uppercase letters (A-Z)
  - Lowercase letters (a-z)
  - Numbers (0-9)
  - Special characters (!@#$%^&\*)
- **Common Passwords**: Reject commonly used passwords (top 10,000 list)
- **Personal Information**: Prevent use of username, email, or personal data

#### Implementation Example

```typescript
export class PasswordValidator {
  private static readonly MIN_LENGTH = 8;
  private static readonly COMPLEXITY_REQUIREMENTS = 3;

  static validate(password: string, userInfo: UserInfo): ValidationResult {
    const checks = [
      this.checkLength(password),
      this.checkComplexity(password),
      this.checkCommonPasswords(password),
      this.checkPersonalInfo(password, userInfo),
    ];

    return {
      isValid: checks.every(check => check.passed),
      errors: checks.filter(check => !check.passed).map(check => check.message),
    };
  }
}
```

## JWT (JSON Web Token) Security

### Token Configuration

#### Signing Algorithms

```typescript
// Recommended: Asymmetric algorithms
const jwtConfig = {
  algorithm: 'RS256', // RSA with SHA-256
  // Alternative: 'ES256' (ECDSA with SHA-256)
  // Avoid: 'HS256' for production (symmetric)
};

// Key management
const privateKey = fs.readFileSync('private.pem');
const publicKey = fs.readFileSync('public.pem');
```

#### Token Structure

```typescript
interface JWTPayload {
  sub: string; // Subject (user ID)
  iat: number; // Issued at
  exp: number; // Expiration time
  aud: string; // Audience
  iss: string; // Issuer
  role: string; // User role
  permissions: string[]; // User permissions
}
```

### Token Expiration Strategy

#### Access Tokens

- **Lifetime**: 15-30 minutes for high-security applications
- **Scope**: Limited permissions and resources
- **Storage**: Memory or secure HTTP-only cookies

#### Refresh Tokens

- **Lifetime**: 7-30 days depending on security requirements
- **Storage**: Secure HTTP-only cookies or secure storage
- **Rotation**: Implement refresh token rotation for enhanced security

```typescript
export class TokenService {
  private readonly ACCESS_TOKEN_EXPIRY = '15m';
  private readonly REFRESH_TOKEN_EXPIRY = '7d';

  async generateTokens(user: User): Promise<TokenPair> {
    const accessToken = this.jwt.sign(
      { sub: user.id, role: user.role },
      { expiresIn: this.ACCESS_TOKEN_EXPIRY },
    );

    const refreshToken = await this.generateRefreshToken(user.id);

    return { accessToken, refreshToken };
  }
}
```

### Token Validation

#### Comprehensive Validation

```typescript
export class TokenValidator {
  async validate(token: string): Promise<ValidationResult> {
    try {
      // 1. Verify signature
      const decoded = this.jwt.verify(token, publicKey);

      // 2. Check expiration
      if (decoded.exp < Date.now() / 1000) {
        throw new Error('Token expired');
      }

      // 3. Check issuer and audience
      if (decoded.iss !== EXPECTED_ISSUER || decoded.aud !== EXPECTED_AUDIENCE) {
        throw new Error('Invalid token claims');
      }

      // 4. Check if token is blacklisted
      const isBlacklisted = await this.isTokenBlacklisted(decoded.jti);
      if (isBlacklisted) {
        throw new Error('Token revoked');
      }

      return { valid: true, payload: decoded };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }
}
```

## Session Management

### Session-Based Authentication

#### Redis Session Storage

```typescript
import { Redis } from 'ioredis';

export class SessionManager {
  private redis: Redis;
  private readonly SESSION_TTL = 60 * 60 * 24; // 24 hours

  async createSession(userId: string, userAgent: string): Promise<string> {
    const sessionId = this.generateSecureId();
    const sessionData = {
      userId,
      createdAt: new Date(),
      userAgent,
      lastActivity: new Date(),
    };

    await this.redis.setex(`session:${sessionId}`, this.SESSION_TTL, JSON.stringify(sessionData));

    return sessionId;
  }

  async validateSession(sessionId: string): Promise<SessionData | null> {
    const data = await this.redis.get(`session:${sessionId}`);
    if (!data) return null;

    const session = JSON.parse(data);

    // Update last activity
    session.lastActivity = new Date();
    await this.redis.setex(`session:${sessionId}`, this.SESSION_TTL, JSON.stringify(session));

    return session;
  }
}
```

#### Session Security

- **Secure Cookies**: Use `HttpOnly`, `Secure`, and `SameSite` attributes
- **Session Rotation**: Regenerate session IDs after privilege changes
- **Timeout**: Implement both idle and absolute timeouts
- **Device Tracking**: Monitor and limit concurrent sessions

### Hybrid Approach (JWT + Sessions)

```typescript
export class HybridAuthService {
  async authenticate(credentials: LoginDto): Promise<AuthResult> {
    const user = await this.validateCredentials(credentials);

    // Create short-lived JWT
    const accessToken = this.generateJWT(user, '15m');

    // Create server-side session for sensitive operations
    const sessionId = await this.sessionManager.createSession(user.id);

    return {
      accessToken,
      sessionId,
      user: this.sanitizeUser(user),
    };
  }
}
```

## OAuth2 and OpenID Connect

### Implementation Guidelines

#### OAuth2 Flow Security

```typescript
export class OAuth2Service {
  // PKCE (Proof Key for Code Exchange) for security
  generatePKCE(): PKCEPair {
    const codeVerifier = this.generateCodeVerifier();
    const codeChallenge = this.generateCodeChallenge(codeVerifier);

    return { codeVerifier, codeChallenge };
  }

  async exchangeCodeForToken(
    code: string,
    codeVerifier: string,
    clientId: string,
  ): Promise<TokenResponse> {
    // Verify PKCE challenge
    // Exchange authorization code for tokens
    // Validate tokens and extract user information
  }
}
```

#### Provider Configuration

```typescript
const oauthProviders = {
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: `${BASE_URL}/auth/oauth/google/callback`,
    scope: ['openid', 'profile', 'email'],
  },
  github: {
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    redirectUri: `${BASE_URL}/auth/oauth/github/callback`,
    scope: ['user:email'],
  },
};
```

## Passport.js Integration

### Strategy Configuration

#### Local Strategy (Username/Password)

```typescript
import { Strategy as LocalStrategy } from 'passport-local';

passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
    },
    async (email: string, password: string, done) => {
      try {
        const user = await this.userService.findByEmail(email);
        if (!user) {
          return done(null, false, { message: 'Invalid credentials' });
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
          return done(null, false, { message: 'Invalid credentials' });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    },
  ),
);
```

#### JWT Strategy

```typescript
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';

passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: publicKey,
      algorithms: ['RS256'],
    },
    async (payload, done) => {
      try {
        const user = await this.userService.findById(payload.sub);
        if (!user) {
          return done(null, false);
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    },
  ),
);
```

## Rate Limiting and Brute Force Protection

### Login Attempt Limiting

```typescript
export class BruteForceProtection {
  private readonly MAX_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

  async checkAttempts(identifier: string): Promise<boolean> {
    const key = `login_attempts:${identifier}`;
    const attempts = await this.redis.get(key);

    if (!attempts) return true;

    const data = JSON.parse(attempts);
    if (data.count >= this.MAX_ATTEMPTS) {
      const timeLeft = data.lockedUntil - Date.now();
      if (timeLeft > 0) {
        throw new TooManyAttemptsException(timeLeft);
      }
    }

    return true;
  }

  async recordAttempt(identifier: string, success: boolean): Promise<void> {
    const key = `login_attempts:${identifier}`;

    if (success) {
      await this.redis.del(key);
      return;
    }

    const existing = await this.redis.get(key);
    let data = existing ? JSON.parse(existing) : { count: 0 };

    data.count++;
    if (data.count >= this.MAX_ATTEMPTS) {
      data.lockedUntil = Date.now() + this.LOCKOUT_DURATION;
    }

    await this.redis.setex(key, this.LOCKOUT_DURATION / 1000, JSON.stringify(data));
  }
}
```

### API Rate Limiting

```typescript
import { RateLimiterRedis } from 'rate-limiter-flexible';

export class RateLimitService {
  private loginLimiter = new RateLimiterRedis({
    storeClient: this.redis,
    keyPrefix: 'login_fail',
    points: 5, // Number of attempts
    duration: 900, // Per 15 minutes
    blockDuration: 900, // Block for 15 minutes
  });

  async checkLoginLimit(ip: string): Promise<void> {
    try {
      await this.loginLimiter.consume(ip);
    } catch (rejRes) {
      const remainingTime = Math.round(rejRes.msBeforeNext / 1000);
      throw new TooManyRequestsException(
        `Too many requests. Try again in ${remainingTime} seconds.`,
      );
    }
  }
}
```

## Security Headers and CORS

### HTTP Security Headers

```typescript
import helmet from 'helmet';

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  }),
);
```

### CORS Configuration

```typescript
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400, // 24 hours
};

app.use(cors(corsOptions));
```

## Audit Logging and Monitoring

### Security Event Logging

```typescript
export class SecurityLogger {
  async logAuthEvent(event: AuthEvent): Promise<void> {
    const logEntry = {
      timestamp: new Date(),
      eventType: event.type,
      userId: event.userId,
      ip: event.ip,
      userAgent: event.userAgent,
      success: event.success,
      details: event.details,
    };

    await this.auditLog.create(logEntry);

    // Real-time alerting for critical events
    if (this.isCriticalEvent(event)) {
      await this.notificationService.sendSecurityAlert(logEntry);
    }
  }

  private isCriticalEvent(event: AuthEvent): boolean {
    return [
      'MULTIPLE_FAILED_LOGINS',
      'ACCOUNT_LOCKOUT',
      'SUSPICIOUS_LOGIN_LOCATION',
      'PRIVILEGE_ESCALATION',
    ].includes(event.type);
  }
}
```

### Performance Monitoring

```typescript
export class AuthMetrics {
  async recordAuthenticationTime(duration: number): Promise<void> {
    // Record authentication performance metrics
    await this.metricsService.recordHistogram('auth.duration', duration);
  }

  async recordTokenGeneration(type: 'access' | 'refresh'): Promise<void> {
    await this.metricsService.incrementCounter(`auth.token.${type}.generated`);
  }
}
```

## Security Checklist

### Pre-Deployment Security Review

#### Password Security

- [ ] bcrypt with appropriate salt rounds (10-12)
- [ ] Password complexity requirements implemented
- [ ] Common password validation
- [ ] Password history tracking

#### Token Security

- [ ] Asymmetric JWT signing (RS256/ES256)
- [ ] Appropriate token expiration times
- [ ] Refresh token rotation implemented
- [ ] Token blacklisting capability

#### Session Security

- [ ] Secure session storage (Redis)
- [ ] HttpOnly, Secure, SameSite cookies
- [ ] Session timeout implementation
- [ ] Concurrent session limiting

#### Rate Limiting

- [ ] Login attempt rate limiting
- [ ] API endpoint rate limiting
- [ ] Brute force protection
- [ ] IP-based blocking

#### General Security

- [ ] Security headers configured
- [ ] CORS properly configured
- [ ] Audit logging implemented
- [ ] Error handling (no information disclosure)
- [ ] Input validation and sanitization
- [ ] Dependency security scanning

### Regular Security Maintenance

#### Monthly Tasks

- [ ] Review security logs and alerts
- [ ] Update dependencies with security patches
- [ ] Review and rotate secrets/keys
- [ ] Performance and security metrics review

#### Quarterly Tasks

- [ ] Security penetration testing
- [ ] Code security audit
- [ ] Access control review
- [ ] Incident response plan testing

#### Annual Tasks

- [ ] Complete security architecture review
- [ ] Compliance audit (if applicable)
- [ ] Security training updates
- [ ] Disaster recovery testing
