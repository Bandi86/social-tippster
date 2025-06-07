// Admin Users API functions
import { User } from '@/types/index';
import apiClient from '../../api-client';

// Fetch specific user by ID
export async function fetchUserById(id: string): Promise<User> {
  try {
    const response = await apiClient.get(`/admin/users/${id}`);
    return response.data as User;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to fetch user: ${message}`);
  }
}

// Ban user
export async function banUser(id: string, reason?: string): Promise<User> {
  try {
    const response = await apiClient.post(`/admin/users/${id}/ban`, {
      reason: reason || 'Admin action',
    });
    return response.data as User;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to ban user: ${message}`);
  }
}

// Unban user
export async function unbanUser(id: string): Promise<User> {
  try {
    const response = await apiClient.post(`/admin/users/${id}/unban`);
    return response.data as User;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to unban user: ${message}`);
  }
}

// Update user role
export async function updateUserRole(id: string, role: string): Promise<User> {
  try {
    const response = await apiClient.patch(`/admin/users/${id}/role`, { role });
    return response.data as User;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to update user role: ${message}`);
  }
}

// Verify user email
export async function verifyUserEmail(id: string): Promise<User> {
  try {
    const response = await apiClient.post(`/admin/users/${id}/verify-email`);
    return response.data as User;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to verify user email: ${message}`);
  }
}

// Revoke user email verification
export async function revokeUserEmailVerification(id: string): Promise<User> {
  try {
    const response = await apiClient.post(`/admin/users/${id}/revoke-email-verification`);
    return response.data as User;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to revoke user email verification: ${message}`);
  }
}
