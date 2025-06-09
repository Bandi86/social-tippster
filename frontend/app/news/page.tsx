'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { BookOpen, ExternalLink, Globe } from 'lucide-react';
import Link from 'next/link';

export default function NewsPage() {
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
                  <BookOpen className='h-5 w-5 text-amber-500' />
                  Sport Hírek
                </CardTitle>
                <p className='text-gray-400'>A legfrissebb sporttesemények és hírek egy helyen!</p>
              </CardHeader>
            </Card>

            {/* Coming Soon Message */}
            <Card className='bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700'>
              <CardContent className='p-8 text-center'>
                <BookOpen className='h-16 w-16 mx-auto mb-4 text-amber-500' />
                <h2 className='text-2xl font-bold text-white mb-4'>Hamarosan!</h2>
                <p className='text-gray-400 mb-6 max-w-2xl mx-auto'>
                  A hírek szekció jelenleg fejlesztés alatt áll. Hamarosan megtalálhatod itt a
                  legfrissebb sport híreket, meccs előzeteswokat, eredményeket és szakértői
                  elemzéseket minden kedvenc sportágadból.
                </p>

                <div className='space-y-4'>
                  <p className='text-amber-300 mb-4'>
                    Addig is, kövesd kedvenc csapataidat a hivatalos oldalakon!
                  </p>
                  <div className='flex flex-wrap justify-center gap-4'>
                    <Button
                      variant='outline'
                      className='border-amber-500 text-amber-300 hover:bg-amber-500/10'
                    >
                      <ExternalLink className='h-4 w-4 mr-2' />
                      UEFA
                    </Button>
                    <Button
                      variant='outline'
                      className='border-amber-500 text-amber-300 hover:bg-amber-500/10'
                    >
                      <ExternalLink className='h-4 w-4 mr-2' />
                      FIFA
                    </Button>
                    <Button
                      variant='outline'
                      className='border-amber-500 text-amber-300 hover:bg-amber-500/10'
                    >
                      <ExternalLink className='h-4 w-4 mr-2' />
                      NBL
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className='lg:col-span-4 space-y-6'>
            {/* News Categories */}
            <Card className='bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700'>
              <CardHeader>
                <CardTitle className='text-white flex items-center gap-2'>
                  <Globe className='h-5 w-5 text-amber-500' />
                  Tervezett kategóriák
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='flex items-start space-x-3'>
                  <div className='h-2 w-2 bg-amber-500 rounded-full mt-2' />
                  <div>
                    <h4 className='text-white font-medium'>Labdarúgás</h4>
                    <p className='text-gray-400 text-sm'>Premier League, La Liga, Serie A</p>
                  </div>
                </div>
                <div className='flex items-start space-x-3'>
                  <div className='h-2 w-2 bg-amber-500 rounded-full mt-2' />
                  <div>
                    <h4 className='text-white font-medium'>Kosárlabda</h4>
                    <p className='text-gray-400 text-sm'>NBA, Euroleague, NBL</p>
                  </div>
                </div>
                <div className='flex items-start space-x-3'>
                  <div className='h-2 w-2 bg-amber-500 rounded-full mt-2' />
                  <div>
                    <h4 className='text-white font-medium'>Tenisz</h4>
                    <p className='text-gray-400 text-sm'>Grand Slam, ATP, WTA</p>
                  </div>
                </div>
                <div className='flex items-start space-x-3'>
                  <div className='h-2 w-2 bg-amber-500 rounded-full mt-2' />
                  <div>
                    <h4 className='text-white font-medium'>Formula 1</h4>
                    <p className='text-gray-400 text-sm'>Versenyek, hírek, eredmények</p>
                  </div>
                </div>
                <div className='flex items-start space-x-3'>
                  <div className='h-2 w-2 bg-amber-500 rounded-full mt-2' />
                  <div>
                    <h4 className='text-white font-medium'>Egyéb sportok</h4>
                    <p className='text-gray-400 text-sm'>Kézilabda, vízilabda, stb.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Features Preview */}
            <Card className='bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700'>
              <CardHeader>
                <CardTitle className='text-white'>Funkciók</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='flex items-start space-x-3'>
                  <div className='h-2 w-2 bg-amber-500 rounded-full mt-2' />
                  <div>
                    <h4 className='text-white font-medium'>Naprakész hírek</h4>
                    <p className='text-gray-400 text-sm'>Automatikus frissítések</p>
                  </div>
                </div>
                <div className='flex items-start space-x-3'>
                  <div className='h-2 w-2 bg-amber-500 rounded-full mt-2' />
                  <div>
                    <h4 className='text-white font-medium'>Személyre szabás</h4>
                    <p className='text-gray-400 text-sm'>Kedvenc csapatok követése</p>
                  </div>
                </div>
                <div className='flex items-start space-x-3'>
                  <div className='h-2 w-2 bg-amber-500 rounded-full mt-2' />
                  <div>
                    <h4 className='text-white font-medium'>Kommentelés</h4>
                    <p className='text-gray-400 text-sm'>Beszélgetés a hírekről</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Register CTA */}
            {!isAuthenticated && (
              <Card className='bg-gradient-to-br from-amber-600 to-amber-700 border-amber-500'>
                <CardContent className='p-6 text-center'>
                  <h3 className='text-white font-bold mb-2'>Ne maradj le!</h3>
                  <p className='text-amber-100 text-sm mb-4'>
                    Regisztrálj és értesülj elsőként az új hírekről
                  </p>
                  <Link href='/auth'>
                    <Button className='bg-white text-amber-700 hover:bg-gray-100'>
                      Regisztráció
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
