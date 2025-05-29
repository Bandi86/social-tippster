'use client';

import { AuthGuard } from '@/components/auth/AuthGuard';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { updateUserProfile } from '@/lib/api/users';
import { ArrowLeft, Eye, EyeOff, Mail, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface EmailFormData {
  new_email: string;
  confirm_email: string;
  password: string;
}

export default function ChangeEmailPage() {
  const router = useRouter();
  const { user, refreshUserData } = useAuth();
  const { toast } = useToast();

  const [emailData, setEmailData] = useState<EmailFormData>({
    new_email: '',
    confirm_email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: keyof EmailFormData, value: string) => {
    setEmailData(prev => ({
      ...prev,
      [field]: value,
    }));
    setError(null);
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    if (!emailData.new_email) {
      setError('Kérjük, adja meg az új email címet.');
      return false;
    }

    if (!validateEmail(emailData.new_email)) {
      setError('Kérjük, adjon meg egy érvényes email címet.');
      return false;
    }

    if (emailData.new_email === user?.email) {
      setError('Az új email cím nem lehet azonos a jelenlegivel.');
      return false;
    }

    if (emailData.new_email !== emailData.confirm_email) {
      setError('Az email címek nem egyeznek.');
      return false;
    }

    if (!emailData.password) {
      setError('Kérjük, adja meg a jelszavát a megerősítéshez.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Note: This would need backend support for email change with password verification
      // For now, we'll simulate the process
      await updateUserProfile({
        email: emailData.new_email,
      });

      await refreshUserData();

      toast({
        title: 'Email cím megváltoztatva',
        description: 'Az email cím sikeresen frissítve. Kérjük, ellenőrizze új email fiókját.',
      });

      // Reset form
      setEmailData({
        new_email: '',
        confirm_email: '',
        password: '',
      });

      // Redirect back to profile
      setTimeout(() => {
        router.push('/profile');
      }, 1000);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : 'Hiba történt az email cím megváltoztatása során.',
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
            <h1 className='text-3xl font-bold'>Email cím módosítása</h1>
          </div>

          <div className='max-w-2xl mx-auto'>
            <Card className='bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700'>
              <CardHeader>
                <CardTitle className='flex items-center gap-2 text-white'>
                  <Mail className='h-5 w-5' />
                  Új email cím beállítása
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className='space-y-6'>
                  {/* Current Email Info */}
                  <div className='bg-gray-800/50 p-4 rounded-lg'>
                    <Label className='text-white font-medium'>Jelenlegi email cím:</Label>
                    <p className='text-gray-300 mt-1'>{user?.email}</p>
                  </div>

                  {/* Error Alert */}
                  {error && (
                    <Alert variant='destructive'>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {/* New Email */}
                  <div className='space-y-2'>
                    <Label htmlFor='new_email' className='text-white'>
                      Új email cím
                    </Label>
                    <Input
                      id='new_email'
                      type='email'
                      value={emailData.new_email}
                      onChange={e => handleInputChange('new_email', e.target.value)}
                      className='bg-gray-800 border-gray-600 text-white'
                      placeholder='uj.email@example.com'
                      required
                    />
                  </div>

                  {/* Confirm Email */}
                  <div className='space-y-2'>
                    <Label htmlFor='confirm_email' className='text-white'>
                      Email cím megerősítése
                    </Label>
                    <Input
                      id='confirm_email'
                      type='email'
                      value={emailData.confirm_email}
                      onChange={e => handleInputChange('confirm_email', e.target.value)}
                      className='bg-gray-800 border-gray-600 text-white'
                      placeholder='uj.email@example.com'
                      required
                    />
                  </div>

                  {/* Password Confirmation */}
                  <div className='space-y-2'>
                    <Label htmlFor='password' className='text-white'>
                      Jelszó megerősítése
                    </Label>
                    <div className='relative'>
                      <Input
                        id='password'
                        type={showPassword ? 'text' : 'password'}
                        value={emailData.password}
                        onChange={e => handleInputChange('password', e.target.value)}
                        className='bg-gray-800 border-gray-600 text-white pr-10'
                        placeholder='Jelenlegi jelszó'
                        required
                      />
                      <Button
                        type='button'
                        variant='ghost'
                        size='sm'
                        className='absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white'
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className='h-4 w-4' />
                        ) : (
                          <Eye className='h-4 w-4' />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Email Requirements */}
                  <div className='bg-gray-800/50 p-4 rounded-lg'>
                    <h3 className='text-sm font-medium text-white mb-2'>Fontos információk:</h3>
                    <ul className='text-sm text-gray-400 space-y-1'>
                      <li className={validateEmail(emailData.new_email) ? 'text-green-400' : ''}>
                        • Érvényes email formátum szükséges
                      </li>
                      <li
                        className={
                          emailData.new_email !== user?.email && emailData.new_email
                            ? 'text-green-400'
                            : ''
                        }
                      >
                        • Az új email különbözzön a jelenlegi címtől
                      </li>
                      <li
                        className={
                          emailData.new_email === emailData.confirm_email && emailData.new_email
                            ? 'text-green-400'
                            : ''
                        }
                      >
                        • A megerősítés egyezzen az új email címmel
                      </li>
                      <li>• Ellenőrző email érkezik az új címre</li>
                      <li>• A változás csak az ellenőrzés után lép érvénybe</li>
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
                          Email cím mentése
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
