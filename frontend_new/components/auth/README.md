# Authentication Components

This directory contains all authentication-related React components for the frontend application, built with Next.js, TypeScript, and Zustand for state management.

## 🏗️ Architecture

The authentication system uses:

- **Session-based authentication** with HttpOnly cookies
- **Redis caching** for performance (handled by API Gateway)
- **Zustand store** for client-side state management
- **Device fingerprinting** for enhanced security
- **Automatic session refresh** and activity tracking

## 📁 Components Overview

### Core Components

#### `LoginForm.tsx`

- Handles user login with email/password
- Real-time form validation
- Loading states and error handling
- Device fingerprint generation
- Support for switching to register mode

#### `RegisterForm.tsx`

- User registration with email, username, password
- Comprehensive validation (email format, password strength, username constraints)
- Password confirmation
- Support for switching to login mode

#### `LogoutButton.tsx`

- Flexible logout button with multiple variants
- Optional confirmation dialog
- Different sizes and styles
- Loading states
- Only shows when user is authenticated

#### `AuthModal.tsx`

- Modal wrapper for login/register forms
- Seamless switching between modes
- Backdrop click to close
- Responsive design

#### `UserProfile.tsx`

- Displays authenticated user information
- Configurable fields (email, role, last online)
- Online status indicator
- Avatar with username initial

### Utility Components

#### `index.ts`

- Centralized exports for all auth components
- Re-exports auth store types and hooks
- Simplifies imports across the application

## 🎣 Custom Hooks

### `useSession.ts` (in `/hooks`)

- Automatic session management
- Configurable auto-refresh intervals
- User activity tracking
- Session expiration warnings
- Event-driven session updates

## 🎨 Styling

Components use **TailwindCSS** with:

- Dark mode support
- Responsive design
- Consistent color schemes
- Smooth transitions and animations
- Accessibility-friendly focus states

## 🔧 Usage Examples

### Basic Login Form

```tsx
import { LoginForm } from '@/components/auth';

export default function LoginPage() {
  return <LoginForm onSuccess={() => router.push('/dashboard')} />;
}
```

### Authentication Modal

```tsx
import { AuthModal } from '@/components/auth';

export default function App() {
  const [showAuth, setShowAuth] = useState(false);

  return (
    <AuthModal
      isOpen={showAuth}
      onClose={() => setShowAuth(false)}
      initialMode='login'
      onAuthSuccess={() => setShowAuth(false)}
    />
  );
}
```

### User Profile with Session Hook

```tsx
import { UserProfile, useAuthStore } from '@/components/auth';
import { useSession } from '@/hooks/useSession';

export default function Dashboard() {
  const { isAuthenticated } = useAuthStore();
  const { formattedTimeRemaining, isNearExpiration } = useSession({
    onSessionExpired: () => router.push('/login'),
  });

  return (
    <div>
      <UserProfile showEmail showRole />
      {isNearExpiration && <div>Session expires in: {formattedTimeRemaining}</div>}
    </div>
  );
}
```

### Logout Button Variants

```tsx
import { LogoutButton } from '@/components/auth';

// Primary button with confirmation
<LogoutButton variant="primary" size="md" />

// Secondary button without confirmation
<LogoutButton
  variant="secondary"
  showConfirmDialog={false}
  onLogoutComplete={() => router.push('/')}
/>

// Minimal button for menus
<LogoutButton variant="minimal" size="sm" />
```

## 🔒 Security Features

### Device Fingerprinting

- Browser-based fingerprint generation
- Canvas fingerprinting for uniqueness
- Hardware and software characteristics
- Stored securely for session validation

### Session Management

- HttpOnly cookies prevent XSS attacks
- Automatic session extension on activity
- Configurable idle timeouts
- Server-side session validation

### Form Validation

- Client-side and server-side validation
- Password strength requirements
- Email format validation
- Username constraints
- Real-time error feedback

## 🚀 Performance Optimizations

### Store Persistence

- Safe data persistence (excludes tokens)
- Automatic hydration on app load
- Minimal storage footprint

### Network Efficiency

- Credentials included for cookie-based auth
- Minimal API calls with Redis caching
- Automatic token refresh
- Error boundary handling

### User Experience

- Loading states for all async operations
- Optimistic UI updates
- Smooth transitions
- Responsive design

## 🧪 Testing

To test the components, visit: `/auth/demo`

This demo page includes:

- All component variants
- Interactive examples
- Session information display
- Real authentication flow

## 🔄 Integration with API Gateway

The components work seamlessly with the session-based API Gateway:

1. **Login Flow**: `POST /auth/login` → Session cookie set → Redis session stored
2. **Request Flow**: Auto-include credentials → API Gateway validates session → User context forwarded
3. **Refresh Flow**: `POST /auth/refresh` → New session token → Extended expiration
4. **Logout Flow**: `POST /auth/logout` → Session invalidated → Local state cleared

## 📝 Development Notes

### State Management

- Zustand store handles all authentication state
- Persistent storage for user data (not tokens)
- Reactive updates across components

### Error Handling

- Comprehensive error boundaries
- User-friendly error messages
- Automatic retry mechanisms
- Graceful degradation

### Accessibility

- ARIA labels and roles
- Keyboard navigation support
- Focus management
- Screen reader compatibility

## 🔧 Configuration

### Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### Store Configuration

```typescript
// Idle timeout (default: 15 minutes)
idleTimeout: 15 * 60 * 1000;

// Auto-refresh interval (default: 5 minutes)
refreshInterval: 5 * 60 * 1000;
```

This authentication system provides a complete, secure, and user-friendly authentication experience with modern web standards and performance optimizations.
