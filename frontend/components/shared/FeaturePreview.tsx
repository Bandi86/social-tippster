/**
 * Funkcionalitás előnézet komponens vendég felhasználók számára
 * Feature preview component for guest users
 */

import { Button } from '@/components/ui/button';
import { PREVIEW_FEATURES } from '@/lib/quick-actions-utils';
import Link from 'next/link';

interface FeaturePreviewProps {
  className?: string;
}

export default function FeaturePreview({ className = '' }: FeaturePreviewProps) {
  return (
    <div className={`text-center text-gray-400 text-sm p-4 space-y-4 ${className}`}>
      <div className='space-y-2'>
        <p className='text-gray-300 font-medium'>Bejelentkezés után:</p>
        <div className='space-y-1 text-xs text-gray-400'>
          {PREVIEW_FEATURES.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <p key={index} className='flex items-center gap-2' title={feature.description}>
                <Icon className='h-3 w-3 flex-shrink-0' />
                <span>{feature.label}</span>
              </p>
            );
          })}
        </div>
      </div>

      <div className='space-y-2'>
        <Link href='/auth'>
          <Button className='w-full bg-amber-600 hover:bg-amber-700 mb-2'>Bejelentkezés</Button>
        </Link>
        <Link href='/auth'>
          <Button variant='outline' className='w-full border-amber-600 text-amber-400'>
            Új fiók létrehozása
          </Button>
        </Link>
      </div>
    </div>
  );
}
