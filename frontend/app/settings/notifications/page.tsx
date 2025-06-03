// Notification Preferences Settings Page
'use client';

import { Switch } from '@/components/ui/switch';
import axios from '@/lib/axios';
import { useUsersStore } from '@/store/users';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const NOTIFICATION_TYPES = [
  { key: 'comment', label: 'Kommentek' },
  { key: 'mention', label: 'Említések' },
  { key: 'follow', label: 'Követések' },
];
const CHANNELS = [
  { key: 'in_app', label: 'Alkalmazásban' },
  { key: 'email', label: 'Email' },
  { key: 'push', label: 'Push' },
];

// Helper for axiosWithAuth
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('authToken');
}
async function axiosWithAuth(config: any) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(config.headers || {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  try {
    const response = await axios({ ...config, headers });
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }
    throw error;
  }
}

export default function NotificationPreferencesPage() {
  const { currentUser } = useUsersStore();
  const [prefs, setPrefs] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser) return;
    setLoading(true);
    axiosWithAuth({ url: '/users/me/notification-preferences', method: 'GET' })
      .then(res => setPrefs(res.notification_preferences))
      .catch(() => setError('Nem sikerült betölteni a beállításokat'))
      .finally(() => setLoading(false));
  }, [currentUser]);

  const handleToggle = (type: string, channel: string) => {
    if (!prefs) return;
    setPrefs((prev: any) => ({
      ...prev,
      [type]: { ...prev[type], [channel]: !prev[type][channel] },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await axiosWithAuth({
        url: '/users/me/notification-preferences',
        method: 'PUT',
        data: { notification_preferences: prefs },
      });
    } catch {
      setError('Nem sikerült menteni a beállításokat');
    } finally {
      setSaving(false);
    }
  };

  if (!currentUser) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold mb-2'>Beállítások</h1>
          <p>Jelentkezz be a beállítások eléréséhez.</p>
          <Link href='/auth/login' className='text-blue-600 underline'>
            Bejelentkezés
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center py-10'>
      <div className='w-full max-w-xl bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8'>
        <h1 className='text-2xl font-bold mb-6 text-gray-900 dark:text-white'>
          Értesítési beállítások
        </h1>
        {loading ? (
          <div className='flex justify-center items-center h-32'>
            <Loader2 className='animate-spin' />
          </div>
        ) : error ? (
          <div className='text-red-500 mb-4'>{error}</div>
        ) : (
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSave();
            }}
          >
            <table className='w-full mb-6'>
              <thead>
                <tr>
                  <th className='text-left py-2'>Típus</th>
                  {CHANNELS.map(channel => (
                    <th key={channel.key} className='text-center py-2'>
                      {channel.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {NOTIFICATION_TYPES.map(type => (
                  <tr key={type.key}>
                    <td className='py-2 font-medium'>{type.label}</td>
                    {CHANNELS.map(channel => (
                      <td key={channel.key} className='text-center'>
                        <Switch
                          checked={!!prefs?.[type.key]?.[channel.key]}
                          onCheckedChange={() => handleToggle(type.key, channel.key)}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              type='submit'
              className='px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium disabled:opacity-60'
              disabled={saving}
            >
              {saving ? 'Mentés...' : 'Mentés'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
