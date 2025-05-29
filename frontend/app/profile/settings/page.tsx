'use client';

import { AuthGuard } from '@/components/auth/AuthGuard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, Bell, Eye, Lock, Mail, Shield, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SettingsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    profileVisible: true,
    showEmail: false,
    showLastSeen: true,
    twoFactorAuth: false,
  });

  const handleSettingChange = (setting: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value,
    }));

    toast({
      title: 'Beállítás mentve',
      description: 'A beállítás sikeresen frissítve.',
    });
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
            <h1 className='text-3xl font-bold'>Beállítások</h1>
          </div>

          <div className='max-w-4xl mx-auto space-y-6'>
            {/* Account Settings */}
            <Card className='bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700'>
              <CardHeader>
                <CardTitle className='flex items-center gap-2 text-white'>
                  <Shield className='h-5 w-5' />
                  Fiók beállítások
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-6'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <Button
                    asChild
                    variant='outline'
                    className='border-gray-600 text-gray-300 hover:bg-gray-700'
                  >
                    <Link href='/profile/edit'>
                      <Mail className='h-4 w-4 mr-2' />
                      Profil szerkesztése
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant='outline'
                    className='border-gray-600 text-gray-300 hover:bg-gray-700'
                  >
                    <Link href='/profile/change-password'>
                      <Lock className='h-4 w-4 mr-2' />
                      Jelszó módosítása
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant='outline'
                    className='border-gray-600 text-gray-300 hover:bg-gray-700'
                  >
                    <Link href='/profile/change-email'>
                      <Mail className='h-4 w-4 mr-2' />
                      Email módosítása
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Privacy Settings */}
            <Card className='bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700'>
              <CardHeader>
                <CardTitle className='flex items-center gap-2 text-white'>
                  <Eye className='h-5 w-5' />
                  Adatvédelem
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-6'>
                <div className='flex items-center justify-between'>
                  <div className='space-y-0.5'>
                    <Label htmlFor='profile-visible' className='text-base font-medium text-white'>
                      Profil láthatósága
                    </Label>
                    <p className='text-sm text-gray-400'>Mások megtekinthetik a profilodat</p>
                  </div>
                  <Switch
                    id='profile-visible'
                    checked={settings.profileVisible}
                    onCheckedChange={value => handleSettingChange('profileVisible', value)}
                  />
                </div>

                <Separator className='bg-gray-700' />

                <div className='flex items-center justify-between'>
                  <div className='space-y-0.5'>
                    <Label htmlFor='show-email' className='text-base font-medium text-white'>
                      Email cím megjelenítése
                    </Label>
                    <p className='text-sm text-gray-400'>
                      Az email címed látható lesz mások számára
                    </p>
                  </div>
                  <Switch
                    id='show-email'
                    checked={settings.showEmail}
                    onCheckedChange={value => handleSettingChange('showEmail', value)}
                  />
                </div>

                <Separator className='bg-gray-700' />

                <div className='flex items-center justify-between'>
                  <div className='space-y-0.5'>
                    <Label htmlFor='show-last-seen' className='text-base font-medium text-white'>
                      Utolsó belépés megjelenítése
                    </Label>
                    <p className='text-sm text-gray-400'>
                      Mások láthatják mikor voltál utoljára online
                    </p>
                  </div>
                  <Switch
                    id='show-last-seen'
                    checked={settings.showLastSeen}
                    onCheckedChange={value => handleSettingChange('showLastSeen', value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card className='bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700'>
              <CardHeader>
                <CardTitle className='flex items-center gap-2 text-white'>
                  <Bell className='h-5 w-5' />
                  Értesítések
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-6'>
                <div className='flex items-center justify-between'>
                  <div className='space-y-0.5'>
                    <Label
                      htmlFor='email-notifications'
                      className='text-base font-medium text-white'
                    >
                      Email értesítések
                    </Label>
                    <p className='text-sm text-gray-400'>Fontos értesítések fogadása emailben</p>
                  </div>
                  <Switch
                    id='email-notifications'
                    checked={settings.emailNotifications}
                    onCheckedChange={value => handleSettingChange('emailNotifications', value)}
                  />
                </div>

                <Separator className='bg-gray-700' />

                <div className='flex items-center justify-between'>
                  <div className='space-y-0.5'>
                    <Label
                      htmlFor='push-notifications'
                      className='text-base font-medium text-white'
                    >
                      Push értesítések
                    </Label>
                    <p className='text-sm text-gray-400'>Azonnali értesítések a böngészőben</p>
                  </div>
                  <Switch
                    id='push-notifications'
                    checked={settings.pushNotifications}
                    onCheckedChange={value => handleSettingChange('pushNotifications', value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card className='bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700'>
              <CardHeader>
                <CardTitle className='flex items-center gap-2 text-white'>
                  <Lock className='h-5 w-5' />
                  Biztonság
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-6'>
                <div className='flex items-center justify-between'>
                  <div className='space-y-0.5'>
                    <Label htmlFor='two-factor' className='text-base font-medium text-white'>
                      Kétfaktoros hitelesítés
                    </Label>
                    <p className='text-sm text-gray-400'>
                      További biztonság az SMS kóddal (hamarosan)
                    </p>
                  </div>
                  <Switch
                    id='two-factor'
                    checked={settings.twoFactorAuth}
                    onCheckedChange={value => handleSettingChange('twoFactorAuth', value)}
                    disabled
                  />
                </div>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className='bg-gradient-to-br from-red-900/20 to-red-800/20 border-red-700/50'>
              <CardHeader>
                <CardTitle className='flex items-center gap-2 text-red-400'>
                  <Trash2 className='h-5 w-5' />
                  Veszélyes műveletek
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  variant='destructive'
                  className='bg-red-600 hover:bg-red-700'
                  onClick={() => {
                    toast({
                      title: 'Hamarosan',
                      description: 'A fiók törlési funkció hamarosan elérhető lesz.',
                    });
                  }}
                >
                  <Trash2 className='h-4 w-4 mr-2' />
                  Fiók törlése
                </Button>
                <p className='text-sm text-gray-400 mt-2'>
                  Ez a művelet visszafordíthatatlan. Minden adat véglegesen törlődik.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
