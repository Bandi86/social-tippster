'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className='flex items-center space-x-2'>
      <Sun className='h-4 w-4 text-amber-500' />
      <Switch
        checked={theme === 'dark'}
        onCheckedChange={checked => setTheme(checked ? 'dark' : 'light')}
        aria-label='Toggle theme'
        className='data-[state=checked]:bg-slate-700 data-[state=unchecked]:bg-amber-200'
      />
      <Moon className='h-4 w-4 text-slate-700 dark:text-slate-100' />
    </div>
  );
}

export function ThemeToggleButton() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div style={{ width: 40, height: 40 }} />;
  }

  const isDark =
    theme === 'dark' ||
    (theme === 'system' &&
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <Button
      variant='outline'
      size='icon'
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={`relative overflow-hidden border-2 border-border bg-background hover:bg-muted text-foreground rounded-full p-2 transition-all duration-300 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background`}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        <Sun className='h-[1.2rem] w-[1.2rem] text-amber-400' />
      ) : (
        <Moon className='h-[1.2rem] w-[1.2rem] text-slate-700' />
      )}
      <span className='sr-only'>Toggle theme</span>
    </Button>
  );
}
