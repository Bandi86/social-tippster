/**
 * Bejelentkezésre buzdító komponens
 * Authentication call-to-action component
 */

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AUTH_CTA } from '@/lib/post-creation-utils';
import Link from 'next/link';

interface AuthCtaProps {
  title?: string;
  description?: string;
  showNote?: boolean;
  className?: string;
}

export default function AuthCta({
  title = AUTH_CTA.title,
  description = AUTH_CTA.description,
  showNote = true,
  className = '',
}: AuthCtaProps) {
  return (
    <Card className={`bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 ${className}`}>
      <CardContent className='p-6 text-center'>
        <h3 className='text-xl font-semibold text-white mb-2'>{title}</h3>
        <p className='text-gray-400 mb-4'>{description}</p>

        <div className='flex gap-3 justify-center'>
          <Link href='/auth'>
            <Button className='bg-amber-600 hover:bg-amber-700'>{AUTH_CTA.loginButton}</Button>
          </Link>
          <Link href='/auth'>
            <Button
              variant='outline'
              className='border-amber-600 text-amber-400 hover:bg-amber-900/20'
            >
              {AUTH_CTA.registerButton}
            </Button>
          </Link>
        </div>

        {showNote && (
          <div className='mt-4 text-xs text-gray-500'>
            <p>{AUTH_CTA.note}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
