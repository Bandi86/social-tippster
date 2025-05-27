// User-related API calls for admin panel

import { apiClient } from '@/lib/api-client';
import { User } from '@/types/index';

// Felhasználók listázása szűréssel és paginációval
export async function fetchAdminUsers(params?: {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  banned?: boolean;
}): Promise<{ users: User[]; total: number }> {
  const response = await apiClient.get('/admin/users', { params });

  // The backend returns { data: User[], meta: { total, page, ... } }
  // We need to transform it to { users: User[], total: number }
  // Also map user_id to id and other field mappings
  const responseData = response.data as { data: any[]; meta: { total: number } };
  const mappedUsers = responseData.data.map((user: any) => ({
    id: user.user_id,
    email: user.email,
    username: user.username,
    first_name: user.first_name,
    last_name: user.last_name,
    role: user.role,
    is_active: user.is_active,
    is_banned: user.banned_at !== null,
    is_verified: user.email_verified_at !== null,
    created_at: user.created_at,
    updated_at: user.updated_at,
    profile_image: user.profile_image,
    last_login: user.last_login,
  }));

  return {
    users: mappedUsers,
    total: responseData.meta?.total || 0,
  };
}

// Felhasználó részletes adatainak lekérése
export async function fetchUserById(userId: string): Promise<User> {
  const response = await apiClient.get(`/admin/users/${userId}`);
  return response.data as User;
}

// Admin statisztika lekérése
export async function fetchAdminStats(): Promise<{
  total: number;
  active: number;
  banned: number;
  unverified: number;
  admins: number;
  recentRegistrations: number;
}> {
  const response = await apiClient.get('/admin/users/stats');
  return response.data as {
    total: number;
    active: number;
    banned: number;
    unverified: number;
    admins: number;
    recentRegistrations: number;
  };
}

// Felhasználó bannolása
export async function banUser(userId: string): Promise<void> {
  await apiClient.post(`/admin/users/${userId}/ban`);
}

// Felhasználó feloldása a bannolás alól
export async function unbanUser(userId: string): Promise<void> {
  await apiClient.post(`/admin/users/${userId}/unban`);
}

// Email verifikáció
export async function verifyUserEmail(userId: string): Promise<void> {
  await apiClient.post(`/admin/users/${userId}/verify`);
}

// Email verifikáció visszavonása
export async function revokeUserEmailVerification(userId: string): Promise<void> {
  await apiClient.post(`/admin/users/${userId}/unverify`);
}

// Szerepkör módosítás (PUT, nem POST)
export async function updateUserRole(userId: string, role: string): Promise<void> {
  await apiClient.put(`/admin/users/${userId}/role`, { role });
}

// Felhasználó törlése
export async function deleteUser(userId: string): Promise<void> {
  await apiClient.delete(`/admin/users/${userId}`);
}
