'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { MessageSquare, Plus, Users } from 'lucide-react';
import Link from 'next/link';

export default function DiscussionsPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'>
      <div className='container mx-auto px-4 py-6'>
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-6'>
          {/* Main Content */}
          <div className='lg:col-span-8 space-y-6'>
            {/* Header */}
            <Card className='bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700'>
              <CardHeader>
                <CardTitle className='text-white flex items-center gap-2'>
                  <MessageSquare className='h-5 w-5 text-amber-500' />
                  Beszélgetések
                </CardTitle>
                <p className='text-gray-400'>
                  Csatlakozz a közösséghez és beszélgess más tippelőkkel!
                </p>
              </CardHeader>
            </Card>

            {/* Coming Soon Message */}
            <Card className='bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700'>
              <CardContent className='p-8 text-center'>
                <MessageSquare className='h-16 w-16 mx-auto mb-4 text-amber-500' />
                <h2 className='text-2xl font-bold text-white mb-4'>Hamarosan!</h2>
                <p className='text-gray-400 mb-6 max-w-2xl mx-auto'>
                  A beszélgetések funkció jelenleg fejlesztés alatt áll. Hamarosan lehetőséged lesz
                  valós időben chattelni más felhasználókkal, beszélgetéseket indítani kedvenc
                  témáidról, és csatlakozni már meglévő beszélgetésekhez.
                </p>

                {isAuthenticated ? (
                  <div className='space-y-4'>
                    <Button className='bg-amber-600 hover:bg-amber-700 text-white' disabled>
                      <Plus className='h-4 w-4 mr-2' />
                      Új beszélgetés (hamarosan)
                    </Button>
                  </div>
                ) : (
                  <div className='space-y-4'>
                    <p className='text-amber-300 mb-4'>
                      Jelentkezz be, hogy részt vehess a beszélgetésekben!
                    </p>
                    <Link href='/auth'>
                      <Button className='bg-amber-600 hover:bg-amber-700 text-white'>
                        Belépés
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className='lg:col-span-4 space-y-6'>
            {/* Features Preview */}
            <Card className='bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700'>
              <CardHeader>
                <CardTitle className='text-white flex items-center gap-2'>
                  <Users className='h-5 w-5 text-amber-500' />
                  Tervezett funkciók
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='flex items-start space-x-3'>
                  <div className='h-2 w-2 bg-amber-500 rounded-full mt-2' />
                  <div>
                    <h4 className='text-white font-medium'>Valós idejű chat</h4>
                    <p className='text-gray-400 text-sm'>Azonnali üzenetküldés</p>
                  </div>
                </div>
                <div className='flex items-start space-x-3'>
                  <div className='h-2 w-2 bg-amber-500 rounded-full mt-2' />
                  <div>
                    <h4 className='text-white font-medium'>Témák szerinti csoportok</h4>
                    <p className='text-gray-400 text-sm'>Sportágak és ligák szerint</p>
                  </div>
                </div>
                <div className='flex items-start space-x-3'>
                  <div className='h-2 w-2 bg-amber-500 rounded-full mt-2' />
                  <div>
                    <h4 className='text-white font-medium'>Privát üzenetek</h4>
                    <p className='text-gray-400 text-sm'>Közvetlen kapcsolat</p>
                  </div>
                </div>
                <div className='flex items-start space-x-3'>
                  <div className='h-2 w-2 bg-amber-500 rounded-full mt-2' />
                  <div>
                    <h4 className='text-white font-medium'>Értesítések</h4>
                    <p className='text-gray-400 text-sm'>Ne maradj le semmiről</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Join Community */}
            <Card className='bg-gradient-to-br from-amber-600 to-amber-700 border-amber-500'>
              <CardContent className='p-6 text-center'>
                <h3 className='text-white font-bold mb-2'>Csatlakozz a közösséghez!</h3>
                <p className='text-amber-100 text-sm mb-4'>
                  Több mint 1000 aktív tippelő várja a beszélgetések indulását
                </p>
                {!isAuthenticated && (
                  <Link href='/auth'>
                    <Button className='bg-white text-amber-700 hover:bg-gray-100'>
                      Regisztráció
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
