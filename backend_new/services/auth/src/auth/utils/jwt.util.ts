import * as jwt from 'jsonwebtoken';

export interface JwtPayload {
  userId: string;
  iat?: number;
  exp?: number;
}

export const generateAccessToken = (userId: string): string => {
  if (!process.env.ACCESS_TOKEN_SECRET) {
    throw new Error('ACCESS_TOKEN_SECRET is not defined');
  }

  return jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
};

export const generateRefreshToken = (userId: string): string => {
  if (!process.env.REFRESH_TOKEN_SECRET) {
    throw new Error('REFRESH_TOKEN_SECRET is not defined');
  }

  return jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
};

export const verifyAccessToken = (token: string): JwtPayload | null => {
  try {
    if (!process.env.ACCESS_TOKEN_SECRET) {
      throw new Error('ACCESS_TOKEN_SECRET is not defined');
    }

    return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET) as JwtPayload;
  } catch (error) {
    console.error('Access token verification failed:', error.message);
    return null;
  }
};

export const verifyRefreshToken = (token: string): JwtPayload | null => {
  try {
    if (!process.env.REFRESH_TOKEN_SECRET) {
      throw new Error('REFRESH_TOKEN_SECRET is not defined');
    }

    return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET) as JwtPayload;
  } catch (error) {
    console.error('Refresh token verification failed:', error.message);
    return null;
  }
};

export const decodeToken = (token: string): JwtPayload | null => {
  try {
    return jwt.decode(token) as JwtPayload;
  } catch (error) {
    console.error('Token decode failed:', error.message);
    return null;
  }
};
