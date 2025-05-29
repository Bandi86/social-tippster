'use client';

import { AuthGuard } from '@/components/auth/AuthGuard';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { changeUserPassword } from '@/lib/api/users';
import { ArrowLeft, Eye, EyeOff, Lock, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface PasswordFormData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export default function ChangePasswordPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  const [passwordData, setPasswordData] = useState<PasswordFormData>({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: keyof PasswordFormData, value: string) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value,
    }));
    setError(null);
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const validatePasswords = (): boolean => {
    if (!passwordData.current_password) {
      setError('Kérjük, adja meg a jelenlegi jelszavát.');
      return false;
    }

    if (!passwordData.new_password) {
      setError('Kérjük, adja meg az új jelszót.');
      return false;
    }

    if (passwordData.new_password.length < 6) {
      setError('Az új jelszónak legalább 6 karakter hosszúnak kell lennie.');
      return false;
    }

    if (passwordData.new_password !== passwordData.confirm_password) {
      setError('Az új jelszó és a megerősítés nem egyezik.');
      return false;
    }

    if (passwordData.current_password === passwordData.new_password) {
      setError('Az új jelszó nem lehet azonos a jelenlegivel.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePasswords()) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await changeUserPassword({
        currentPassword: passwordData.current_password,
        newPassword: passwordData.new_password,
        confirmPassword: passwordData.confirm_password,
      });

      toast({
        title: 'Jelszó megváltoztatva',
        description: 'A jelszó sikeresen frissítve.',
      });

      // Reset form
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });

      // Redirect back to profile
      setTimeout(() => {
        router.push('/profile');
      }, 1000);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : 'Hiba történt a jelszó megváltoztatása során.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthGuard>
      <div className='min-h-screen bg-gray-900 text-white'>
        <div className='container mx-auto px-4 py-8'>
          {/* Header */}
          <div className='flex items-center gap-4 mb-8'>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => router.back()}
              className='text-gray-400 hover:text-white'
            >
              <ArrowLeft className='h-4 w-4 mr-2' />
              Vissza
            </Button>
            <h1 className='text-3xl font-bold'>Jelszó módosítása</h1>
          </div>

          <div className='max-w-2xl mx-auto'>
            <Card className='bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700'>
              <CardHeader>
                <CardTitle className='flex items-center gap-2 text-white'>
                  <Lock className='h-5 w-5' />
                  Új jelszó beállítása
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className='space-y-6'>
                  {/* Error Alert */}
                  {error && (
                    <Alert variant='destructive'>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {/* Current Password */}
                  <div className='space-y-2'>
                    <Label htmlFor='current_password' className='text-white'>
                      Jelenlegi jelszó
                    </Label>
                    <div className='relative'>
                      <Input
                        id='current_password'
                        type={showPasswords.current ? 'text' : 'password'}
                        value={passwordData.current_password}
                        onChange={e => handleInputChange('current_password', e.target.value)}
                        className='bg-gray-800 border-gray-600 text-white pr-10'
                        placeholder='Jelenlegi jelszó'
                        required
                      />
                      <Button
                        type='button'
                        variant='ghost'
                        size='sm'
                        className='absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white'
                        onClick={() => togglePasswordVisibility('current')}
                      >
                        {showPasswords.current ? (
                          <EyeOff className='h-4 w-4' />
                        ) : (
                          <Eye className='h-4 w-4' />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div className='space-y-2'>
                    <Label htmlFor='new_password' className='text-white'>
                      Új jelszó
                    </Label>
                    <div className='relative'>
                      <Input
                        id='new_password'
                        type={showPasswords.new ? 'text' : 'password'}
                        value={passwordData.new_password}
                        onChange={e => handleInputChange('new_password', e.target.value)}
                        className='bg-gray-800 border-gray-600 text-white pr-10'
                        placeholder='Új jelszó (min. 6 karakter)'
                        required
                        minLength={6}
                      />
                      <Button
                        type='button'
                        variant='ghost'
                        size='sm'
                        className='absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white'
                        onClick={() => togglePasswordVisibility('new')}
                      >
                        {showPasswords.new ? (
                          <EyeOff className='h-4 w-4' />
                        ) : (
                          <Eye className='h-4 w-4' />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className='space-y-2'>
                    <Label htmlFor='confirm_password' className='text-white'>
                      Új jelszó megerősítése
                    </Label>
                    <div className='relative'>
                      <Input
                        id='confirm_password'
                        type={showPasswords.confirm ? 'text' : 'password'}
                        value={passwordData.confirm_password}
                        onChange={e => handleInputChange('confirm_password', e.target.value)}
                        className='bg-gray-800 border-gray-600 text-white pr-10'
                        placeholder='Új jelszó megerősítése'
                        required
                      />
                      <Button
                        type='button'
                        variant='ghost'
                        size='sm'
                        className='absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white'
                        onClick={() => togglePasswordVisibility('confirm')}
                      >
                        {showPasswords.confirm ? (
                          <EyeOff className='h-4 w-4' />
                        ) : (
                          <Eye className='h-4 w-4' />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Password Requirements */}
                  <div className='bg-gray-800/50 p-4 rounded-lg'>
                    <h3 className='text-sm font-medium text-white mb-2'>Jelszó követelmények:</h3>
                    <ul className='text-sm text-gray-400 space-y-1'>
                      <li className={passwordData.new_password.length >= 6 ? 'text-green-400' : ''}>
                        • Legalább 6 karakter hosszú
                      </li>
                      <li
                        className={
                          passwordData.new_password !== passwordData.current_password &&
                          passwordData.new_password
                            ? 'text-green-400'
                            : ''
                        }
                      >
                        • Különbözzön a jelenlegi jelszótól
                      </li>
                      <li
                        className={
                          passwordData.new_password === passwordData.confirm_password &&
                          passwordData.new_password
                            ? 'text-green-400'
                            : ''
                        }
                      >
                        • A megerősítés egyezzen az új jelszóval
                      </li>
                    </ul>
                  </div>

                  {/* Submit Button */}
                  <div className='flex gap-4 pt-4'>
                    <Button
                      type='submit'
                      disabled={isLoading}
                      className='bg-amber-600 hover:bg-amber-700 text-white'
                    >
                      {isLoading ? (
                        'Mentés...'
                      ) : (
                        <>
                          <Save className='h-4 w-4 mr-2' />
                          Jelszó mentése
                        </>
                      )}
                    </Button>
                    <Button
                      type='button'
                      variant='outline'
                      onClick={() => router.back()}
                      className='border-gray-600 text-gray-300 hover:bg-gray-700'
                    >
                      Mégse
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
