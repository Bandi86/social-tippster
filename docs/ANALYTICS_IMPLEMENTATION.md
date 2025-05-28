# Analytics Implementation

This document describes the analytics system implemented for Social Tippster platform.

## Analytics Entities

The analytics system uses the following database entities:

### User Logins

Tracks each user login event with detailed information:

```typescript
@Entity('user_logins')
export class UserLogin {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @CreateDateColumn({ type: 'timestamp' })
  login_date: Date;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ip_address: string;

  @Column({ type: 'text', nullable: true })
  user_agent: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  device_type: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  browser: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  location: string;

  @Column({ type: 'boolean', default: true })
  is_successful: boolean;
}
```

### Daily Stats

Aggregates platform metrics on a daily basis:

```typescript
@Entity('daily_stats')
export class DailyStats {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date', unique: true })
  date: Date;

  // User metrics
  @Column({ type: 'int', default: 0 })
  new_users: number;

  @Column({ type: 'int', default: 0 })
  active_users: number;

  @Column({ type: 'int', default: 0 })
  total_logins: number;

  // Content metrics
  @Column({ type: 'int', default: 0 })
  new_posts: number;

  @Column({ type: 'int', default: 0 })
  new_comments: number;

  // More metrics...
}
```

### Monthly Stats

Aggregates platform metrics on a monthly basis.

### System Metrics

Tracks system performance and usage metrics.

## Analytics Service

The `AnalyticsService` provides methods to:

1. Track user logins
2. Generate admin dashboard statistics
3. Update daily and monthly stats
4. Query user growth trends
5. Track platform activity

## Integration with Auth Flow

User logins are automatically tracked in the `AuthService` through:

```typescript
async login(loginDto: LoginDto, request?: any, response?: Response): Promise<LoginResponseDto> {
  // Authentication logic...

  // Track login after successful authentication
  if (authenticatedUser && request) {
    try {
      await this.analyticsService.trackUserLogin(
        authenticatedUser.user_id,
        request.ip || request.connection?.remoteAddress,
        request.headers?.['user-agent'],
        this.getDeviceType(request.headers?.['user-agent']),
        this.getBrowser(request.headers?.['user-agent']),
      );
    } catch (error) {
      // Don't fail login if analytics tracking fails
      console.error('Failed to track user login:', error);
    }
  }

  // Return login response...
}
```

## Admin Analytics Dashboard

The analytics data is presented in the admin dashboard through:

1. Post statistics
2. User statistics
3. Comment statistics
4. User growth charts
5. Activity data visualization

## Implementation Date

Analytics system implemented on May 28, 2025.
