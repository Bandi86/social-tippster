// Auth Components Export Index
// Centralized exports for all authentication-related components

export { default as AuthModal } from './AuthModal';
export { default as LoginForm } from './LoginForm';
export { default as LogoutButton } from './LogoutButton';
export { default as RegisterForm } from './RegisterForm';
export { default as UserProfile } from './UserProfile';

// Re-export auth store for convenience
export { useAuthStore } from '@/store/auth/auth.store';
export type {
  AuthError,
  LoginCredentials,
  RegisterCredentials,
  User,
} from '@/store/auth/auth.store';
