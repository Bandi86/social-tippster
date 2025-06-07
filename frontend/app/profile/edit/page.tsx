'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useUsers } from '@/hooks/useUsers';
import { ArrowLeft, Camera, Lock, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface ProfileFormData {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  bio?: string;
  location?: string;
  website?: string;
  social_links?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
}

interface PasswordFormData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export default function EditProfilePage() {
  const router = useRouter();
  const { user, refreshUserData } = useAuth();
  const { toast } = useToast();

  // Zustand hooks
  const { updateProfile, changePassword, isSubmitting, error } = useUsers();

  const [profileData, setProfileData] = useState<ProfileFormData>({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    bio: '',
    location: '',
    website: '',
    social_links: {
      twitter: '',
      linkedin: '',
      github: '',
    },
  });

  const [passwordData, setPasswordData] = useState<PasswordFormData>({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  const [activeSection, setActiveSection] = useState<'profile' | 'password'>('profile');

  // Redirect if not authenticated
  useEffect(() => {
    if (user === null) {
      router.push('/auth');
      return;
    }

    if (user) {
      // Populate form with user data
      setProfileData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        username: user.username || '',
        email: user.email || '',
        bio: (user as any).bio || '',
        location: (user as any).location || '',
        website: (user as any).website || '',
        social_links: {
          twitter: (user as any).social_links?.twitter || '',
          linkedin: (user as any).social_links?.linkedin || '',
          github: (user as any).social_links?.github || '',
        },
      });
    }
  }, [user, router]);

  const handleProfileChange = (field: keyof ProfileFormData, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSocialLinkChange = (platform: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      social_links: {
        ...prev.social_links,
        [platform]: value,
      },
    }));
  };

  const handlePasswordChange = (field: keyof PasswordFormData, value: string) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const validatePassword = (): string | null => {
    if (!passwordData.current_password || !passwordData.new_password) {
      return 'Please fill in all password fields';
    }
    if (passwordData.new_password.length < 6) {
      return 'New password must be at least 6 characters long';
    }
    if (passwordData.new_password !== passwordData.confirm_password) {
      return 'New passwords do not match';
    }
    return null;
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    try {
      // Filter out empty social links
      const cleanedSocialLinks = Object.fromEntries(
        Object.entries(profileData.social_links || {}).filter(([, value]) => value && value.trim()),
      );

      const updateData = {
        ...profileData,
        social_links: Object.keys(cleanedSocialLinks).length > 0 ? cleanedSocialLinks : undefined,
      };

      await updateProfile(updateData);
      await refreshUserData(); // Refresh user data in auth context

      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const handleChangePassword = async () => {
    if (!user) return;

    const validationError = validatePassword();
    if (validationError) {
      toast({
        title: 'Validation Error',
        description: validationError,
        variant: 'destructive',
      });
      return;
    }

    try {
      await changePassword({
        oldPassword: passwordData.current_password,
        newPassword: passwordData.new_password,
      });

      // Clear password form
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });

      toast({
        title: 'Success',
        description: 'Password changed successfully',
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to change password';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  if (!user) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <div className='max-w-2xl mx-auto text-center'>
          <h2 className='text-xl font-semibold mb-2'>Please log in</h2>
          <p className='text-muted-foreground'>You need to be logged in to edit your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='max-w-4xl mx-auto space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-4'>
            <Button variant='ghost' onClick={() => router.back()} className='p-2'>
              <ArrowLeft className='h-4 w-4' />
            </Button>
            <div>
              <h1 className='text-3xl font-bold'>Edit Profile</h1>
              <p className='text-muted-foreground'>
                Update your personal information and preferences
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className='flex space-x-1 bg-muted p-1 rounded-lg'>
          <Button
            variant={activeSection === 'profile' ? 'default' : 'ghost'}
            onClick={() => setActiveSection('profile')}
            className='flex-1'
          >
            Profile Information
          </Button>
          <Button
            variant={activeSection === 'password' ? 'default' : 'ghost'}
            onClick={() => setActiveSection('password')}
            className='flex-1'
          >
            <Lock className='w-4 h-4 mr-2' />
            Password
          </Button>
        </div>

        {/* Profile Information Section */}
        {activeSection === 'profile' && (
          <div className='space-y-6'>
            {/* Profile Picture Section */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center'>
                  <Camera className='mr-2 h-5 w-5' />
                  Profile Picture
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='flex items-center space-x-6'>
                  <Avatar className='h-24 w-24'>
                    <AvatarImage src={user.profile_image} alt={user.username} />
                    <AvatarFallback className='text-lg'>
                      {user.first_name?.[0] || user.username?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className='flex-1'>
                    <h3 className='font-medium mb-2'>Upload a new profile picture</h3>
                    <p className='text-sm text-muted-foreground mb-4'>
                      JPG, PNG or GIF. Max size of 2MB.
                    </p>
                    <Button variant='outline' size='sm' disabled>
                      Upload Photo (Coming Soon)
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='first_name'>First Name</Label>
                    <Input
                      id='first_name'
                      value={profileData.first_name}
                      onChange={e => handleProfileChange('first_name', e.target.value)}
                      placeholder='Enter your first name'
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='last_name'>Last Name</Label>
                    <Input
                      id='last_name'
                      value={profileData.last_name}
                      onChange={e => handleProfileChange('last_name', e.target.value)}
                      placeholder='Enter your last name'
                    />
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='username'>Username</Label>
                  <Input
                    id='username'
                    value={profileData.username}
                    onChange={e => handleProfileChange('username', e.target.value)}
                    placeholder='Enter your username'
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='email'>Email</Label>
                  <Input
                    id='email'
                    type='email'
                    value={profileData.email}
                    onChange={e => handleProfileChange('email', e.target.value)}
                    placeholder='Enter your email'
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='bio'>Bio</Label>
                  <Textarea
                    id='bio'
                    value={profileData.bio}
                    onChange={e => handleProfileChange('bio', e.target.value)}
                    placeholder='Tell us about yourself...'
                    rows={3}
                  />
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='location'>Location</Label>
                    <Input
                      id='location'
                      value={profileData.location}
                      onChange={e => handleProfileChange('location', e.target.value)}
                      placeholder='City, Country'
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='website'>Website</Label>
                    <Input
                      id='website'
                      value={profileData.website}
                      onChange={e => handleProfileChange('website', e.target.value)}
                      placeholder='https://yourwebsite.com'
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Social Links */}
            <Card>
              <CardHeader>
                <CardTitle>Social Links</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='twitter'>Twitter</Label>
                  <Input
                    id='twitter'
                    value={profileData.social_links?.twitter || ''}
                    onChange={e => handleSocialLinkChange('twitter', e.target.value)}
                    placeholder='https://twitter.com/username'
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='linkedin'>LinkedIn</Label>
                  <Input
                    id='linkedin'
                    value={profileData.social_links?.linkedin || ''}
                    onChange={e => handleSocialLinkChange('linkedin', e.target.value)}
                    placeholder='https://linkedin.com/in/username'
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='github'>GitHub</Label>
                  <Input
                    id='github'
                    value={profileData.social_links?.github || ''}
                    onChange={e => handleSocialLinkChange('github', e.target.value)}
                    placeholder='https://github.com/username'
                  />
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className='flex justify-end'>
              <Button onClick={handleSaveProfile} disabled={isSubmitting} className='min-w-[120px]'>
                {isSubmitting ? (
                  'Saving...'
                ) : (
                  <>
                    <Save className='w-4 h-4 mr-2' />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Password Section */}
        {activeSection === 'password' && (
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center'>
                <Lock className='mr-2 h-5 w-5' />
                Change Password
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <Alert>
                <AlertDescription>
                  For your security, please enter your current password to set a new one.
                </AlertDescription>
              </Alert>

              <div className='space-y-4 max-w-md'>
                <div className='space-y-2'>
                  <Label htmlFor='current_password'>Current Password</Label>
                  <Input
                    id='current_password'
                    type='password'
                    value={passwordData.current_password}
                    onChange={e => handlePasswordChange('current_password', e.target.value)}
                    placeholder='Enter your current password'
                  />
                </div>

                <Separator />

                <div className='space-y-2'>
                  <Label htmlFor='new_password'>New Password</Label>
                  <Input
                    id='new_password'
                    type='password'
                    value={passwordData.new_password}
                    onChange={e => handlePasswordChange('new_password', e.target.value)}
                    placeholder='Enter new password (min. 6 characters)'
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='confirm_password'>Confirm New Password</Label>
                  <Input
                    id='confirm_password'
                    type='password'
                    value={passwordData.confirm_password}
                    onChange={e => handlePasswordChange('confirm_password', e.target.value)}
                    placeholder='Confirm your new password'
                  />
                </div>

                <Button onClick={handleChangePassword} disabled={isSubmitting} className='w-full'>
                  {isSubmitting ? 'Changing Password...' : 'Change Password'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
