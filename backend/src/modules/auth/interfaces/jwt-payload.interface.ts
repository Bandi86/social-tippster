export interface JwtPayload {
  sub: string; // User ID (subject)
  email: string;
  iat?: number; // Issued at
  exp?: number; // Expiration time
  type?: 'access' | 'refresh'; // Token type
}
