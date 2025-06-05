'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/hooks/useAuth';
import { Database, Mail, RefreshCw, Save, Server, Settings, Shield } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const AdminSettingsPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    siteName: 'Social Platform',
    siteDescription: 'Your premier social betting platform',
    allowRegistration: true,
    requireEmailVerification: true,
    enableNotifications: true,
    maintenanceMode: false,
    maxUsersPerPage: 50,
    sessionTimeout: 24,
    enableRateLimiting: true,
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPassword: '',
    enableSSL: true,
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const settingSections = [
    {
      title: 'General Settings',
      icon: Settings,
      description: 'Basic site configuration',
      fields: [
        { key: 'siteName', label: 'Site Name', type: 'text' },
        { key: 'siteDescription', label: 'Site Description', type: 'text' },
        { key: 'allowRegistration', label: 'Allow New Registrations', type: 'switch' },
        { key: 'requireEmailVerification', label: 'Require Email Verification', type: 'switch' },
      ],
    },
    {
      title: 'Security Settings',
      icon: Shield,
      description: 'Security and access controls',
      fields: [
        { key: 'sessionTimeout', label: 'Session Timeout (hours)', type: 'number' },
        { key: 'enableRateLimiting', label: 'Enable Rate Limiting', type: 'switch' },
        { key: 'maintenanceMode', label: 'Maintenance Mode', type: 'switch' },
      ],
    },
    {
      title: 'System Settings',
      icon: Server,
      description: 'System performance and behavior',
      fields: [
        { key: 'maxUsersPerPage', label: 'Max Users Per Page', type: 'number' },
        { key: 'enableNotifications', label: 'Enable System Notifications', type: 'switch' },
      ],
    },
    {
      title: 'Email Configuration',
      icon: Mail,
      description: 'SMTP and email settings',
      fields: [
        { key: 'smtpHost', label: 'SMTP Host', type: 'text' },
        { key: 'smtpPort', label: 'SMTP Port', type: 'number' },
        { key: 'smtpUser', label: 'SMTP Username', type: 'text' },
        { key: 'smtpPassword', label: 'SMTP Password', type: 'password' },
        { key: 'enableSSL', label: 'Enable SSL/TLS', type: 'switch' },
      ],
    },
  ];

  const handleInputChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='space-y-8'>
        {/* Header */}
        <div className='bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl border border-amber-500/20 p-8 shadow-xl backdrop-blur-sm'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-6'>
              <div className='p-4 bg-gradient-to-br from-amber-500 via-yellow-500 to-amber-600 rounded-xl shadow-lg ring-2 ring-amber-400/20'>
                <Settings className='h-10 w-10 text-black' />
              </div>
              <div>
                <h1 className='text-4xl font-bold bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent mb-2'>
                  System Settings
                </h1>
                <p className='text-gray-400'>Configure system-wide settings and preferences</p>
              </div>
            </div>
            <div className='flex items-center space-x-3'>
              <Button
                onClick={handleSave}
                disabled={loading}
                className='bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-black font-semibold px-6 py-2'
              >
                {loading ? (
                  <>
                    <RefreshCw className='h-4 w-4 mr-2 animate-spin' />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className='h-4 w-4 mr-2' />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Settings Sections */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
          {settingSections.map((section, index) => {
            const Icon = section.icon;
            return (
              <Card
                key={index}
                className='bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-amber-500/20 shadow-xl'
              >
                <CardHeader className='pb-4'>
                  <div className='flex items-center space-x-4'>
                    <div className='p-3 bg-amber-500/10 rounded-lg'>
                      <Icon className='h-6 w-6 text-amber-500' />
                    </div>
                    <div>
                      <CardTitle className='text-white text-xl'>{section.title}</CardTitle>
                      <CardDescription className='text-gray-400'>
                        {section.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className='space-y-6'>
                  {section.fields.map((field, fieldIndex) => (
                    <div key={fieldIndex} className='space-y-2'>
                      <Label className='text-amber-400 font-medium'>{field.label}</Label>
                      {field.type === 'switch' ? (
                        <div className='flex items-center space-x-3 p-3 bg-gray-800/60 rounded-lg border border-gray-700/50'>
                          <Switch
                            checked={settings[field.key as keyof typeof settings] as boolean}
                            onCheckedChange={(checked: boolean) =>
                              handleInputChange(field.key, checked)
                            }
                            className='data-[state=checked]:bg-amber-500'
                          />
                          <span className='text-gray-300 text-sm'>
                            {settings[field.key as keyof typeof settings] ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>
                      ) : (
                        <Input
                          type={field.type}
                          value={settings[field.key as keyof typeof settings] as string | number}
                          onChange={e =>
                            handleInputChange(
                              field.key,
                              field.type === 'number' ? parseInt(e.target.value) : e.target.value,
                            )
                          }
                          className='bg-gray-800/60 border-gray-700/50 text-white placeholder-gray-500 focus:border-amber-500/50 focus:ring-amber-500/20'
                          placeholder={`Enter ${field.label.toLowerCase()}`}
                        />
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* System Status */}
        <Card className='bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-amber-500/20 shadow-xl'>
          <CardHeader>
            <div className='flex items-center space-x-4'>
              <div className='p-3 bg-green-500/10 rounded-lg'>
                <Database className='h-6 w-6 text-green-500' />
              </div>
              <div>
                <CardTitle className='text-white text-xl'>System Status</CardTitle>
                <CardDescription className='text-gray-400'>
                  Current system health and status
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              <div className='p-4 bg-gray-800/60 rounded-lg border border-green-500/20'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-green-400 font-medium'>Database</p>
                    <p className='text-gray-300 text-sm'>Connected</p>
                  </div>
                  <div className='h-3 w-3 bg-green-500 rounded-full animate-pulse'></div>
                </div>
              </div>
              <div className='p-4 bg-gray-800/60 rounded-lg border border-green-500/20'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-green-400 font-medium'>API Server</p>
                    <p className='text-gray-300 text-sm'>Online</p>
                  </div>
                  <div className='h-3 w-3 bg-green-500 rounded-full animate-pulse'></div>
                </div>
              </div>
              <div className='p-4 bg-gray-800/60 rounded-lg border border-amber-500/20'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-amber-400 font-medium'>Cache</p>
                    <p className='text-gray-300 text-sm'>Active</p>
                  </div>
                  <div className='h-3 w-3 bg-amber-500 rounded-full animate-pulse'></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminSettingsPage;
