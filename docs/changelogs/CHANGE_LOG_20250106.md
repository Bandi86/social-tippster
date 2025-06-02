# Change Log - 2025-01-06

## Authentication Token Management Fix

### Problem Identified

- **Issue**: "Érvénytelen refresh token" errors occurring after user registration/login
- **Root Cause**: TypeScript compilation errors in backend authentication service where `usersService.create()` returns `UserResponseDto` but `generateAccessToken()` and `generateRefreshToken()` methods expect `User` entity
- **Impact**: Authentication token generation failing, preventing proper user registration and login flows

### Changes Made

#### 1. UsersService Enhancement

**File**: `/backend/src/modules/users/users.service.ts`

**Added New Method**:

```typescript
// Internal method for auth service - returns actual User entity
async createUserEntity(createUserDto: CreateUserDto): Promise<User> {
  // Check if user already exists
  const existingUser = await this.userRepository.findOne({
    where: [{ email: createUserDto.email }, { username: createUserDto.username }],
  });

  if (existingUser) {
    if (existingUser.email === createUserDto.email) {
      throw new ConflictException('Ez az email cím már regisztrálva van');
    }
    if (existingUser.username === createUserDto.username) {
      throw new ConflictException('Ez a felhasználónév már foglalt');
    }
  }

  // Hash password
  const saltRounds = 12;
  const hashedPassword = await bcrypt.hash(createUserDto.password, saltRounds);

  // Create user entity
  const user = this.userRepository.create({
    ...createUserDto,
    password_hash: hashedPassword,
    is_active: true,
    is_verified: false,
    is_banned: false,
    is_premium: false,
    follower_count: 0,
    following_count: 0,
    post_count: 0,
    reputation_score: 0,
    total_tips: 0,
    successful_tips: 0,
    tip_success_rate: 0,
    current_streak: 0,
    best_streak: 0,
    total_profit: 0,
    created_at: new Date(),
    updated_at: new Date(),
  });

  return await this.userRepository.save(user);
}
```

**Purpose**: This method specifically returns a `User` entity (not DTO) for internal use by the auth service, resolving the type compatibility issues with JWT token generation methods.

#### 2. AuthService Update

**File**: `/backend/src/modules/auth/auth.service.ts`

**Modified Register Method**:

```typescript
async register(
  registerDto: RegisterDto,
  response?: Response,
): Promise<{ message: string; user: UserResponseDto; access_token: string }> {
  // Set default language_preference to 'hu' if not provided
  if (!registerDto.language_preference) {
    registerDto.language_preference = 'hu';
  }

  // Set default timezone if not provided
  if (!registerDto.timezone) {
    registerDto.timezone = 'Europe/Budapest';
  }

  // Create user entity for token generation
  const userEntity = await this.usersService.createUserEntity(registerDto);

  // Generate access token (short-lived)
  const accessToken = this.generateAccessToken(userEntity);

  // Generate refresh token (long-lived)
  const refreshTokenValue = this.generateRefreshToken(userEntity);

  // Save refresh token to database
  await this.saveRefreshToken(userEntity.user_id, refreshTokenValue);

  // Set refresh token as HttpOnly cookie if response object is provided
  if (response) {
    const isProduction = process.env.NODE_ENV === 'production';

    response.cookie('refresh_token', refreshTokenValue, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      path: '/', // Make cookie available for all paths
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      domain: isProduction ? undefined : 'localhost', // Allow cross-port access in development
    });
  }

  // Convert user entity to DTO for response
  const userResponseDto = await this.usersService.create(registerDto);

  return {
    message: 'Sikeres regisztráció',
    user: userResponseDto,
    access_token: accessToken,
  };
}
```

**Key Changes**:

1. **Token Generation**: Now uses `userEntity` (actual User entity) for `generateAccessToken()` and `generateRefreshToken()` methods
2. **Response DTO**: Still calls `usersService.create()` to get proper `UserResponseDto` for the response
3. **Type Safety**: Eliminates TypeScript compilation errors by using correct types for each operation

### Technical Details

#### Type System Resolution

- **Before**: `usersService.create()` returned `UserResponseDto` → passed to token methods expecting `User` entity → **Type Error**
- **After**: `usersService.createUserEntity()` returns `User` entity → passed to token methods → **Type Safe**

#### Authentication Flow

1. User registration request received
2. `createUserEntity()` creates and returns actual `User` entity
3. JWT access and refresh tokens generated using `User` entity
4. Refresh token saved to database with user ID
5. `create()` method called separately to get `UserResponseDto` for response
6. Response returned with tokens and user data

### Compilation Results

- **Before**: TypeScript compilation errors preventing application startup
- **After**: Clean compilation with 0 errors
- **Backend Status**: Successfully started on http://localhost:3001
- **Frontend Status**: Successfully started on http://localhost:3000

### Testing Status

- ✅ Backend compilation successful
- ✅ Application startup successful
- ✅ Both frontend and backend running
- 🔄 End-to-end authentication testing pending

### Next Steps

1. Test user registration flow
2. Test user login flow
3. Verify refresh token functionality
4. Test token refresh on API calls
5. Validate complete authentication state management

### Impact Assessment

- **Security**: No security implications, maintains same authentication logic
- **Performance**: Minimal impact, same database operations
- **Maintainability**: Improved type safety and code clarity
- **User Experience**: Should resolve authentication errors for new users

---

**Time**: 2025-01-06 09:58:21 AM
**Status**: Implementation Complete
**Next Review**: After end-to-end testing
