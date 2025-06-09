'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { BarChart3, Star, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function AnalysisPage() {
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
                  <Star className='h-5 w-5 text-amber-500' />
                  Elemzések és Statisztikák
                </CardTitle>
                <p className='text-gray-400'>
                  Professzionális elemzések és mélyreható statisztikák minden sportágból!
                </p>
              </CardHeader>
            </Card>

            {/* Coming Soon Message */}
            <Card className='bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700'>
              <CardContent className='p-8 text-center'>
                <BarChart3 className='h-16 w-16 mx-auto mb-4 text-amber-500' />
                <h2 className='text-2xl font-bold text-white mb-4'>Hamarosan!</h2>
                <p className='text-gray-400 mb-6 max-w-2xl mx-auto'>
                  Az elemzések szekció jelenleg fejlesztés alatt áll. Hamarosan részletes
                  statisztikákat, szakértői elemzéseket és prediktív modelleket találhatsz itt,
                  amelyek segítenek a legjobb döntések meghozatalában.
                </p>

                {isAuthenticated ? (
                  <div className='space-y-4'>
                    <p className='text-amber-300 mb-4'>
                      Kövesd kedvenc csapataidat és játékosaidat részletes statisztikákkal!
                    </p>
                    <Button className='bg-amber-600 hover:bg-amber-700 text-white' disabled>
                      <TrendingUp className='h-4 w-4 mr-2' />
                      Személyre szabás (hamarosan)
                    </Button>
                  </div>
                ) : (
                  <div className='space-y-4'>
                    <p className='text-amber-300 mb-4'>
                      Jelentkezz be, hogy hozzáférj a személyre szabott elemzésekhez!
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
            {/* Analysis Types */}
            <Card className='bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700'>
              <CardHeader>
                <CardTitle className='text-white flex items-center gap-2'>
                  <BarChart3 className='h-5 w-5 text-amber-500' />
                  Tervezett elemzések
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='flex items-start space-x-3'>
                  <div className='h-2 w-2 bg-amber-500 rounded-full mt-2' />
                  <div>
                    <h4 className='text-white font-medium'>Csapat statisztikák</h4>
                    <p className='text-gray-400 text-sm'>Mélyreható csapat elemzések</p>
                  </div>
                </div>
                <div className='flex items-start space-x-3'>
                  <div className='h-2 w-2 bg-amber-500 rounded-full mt-2' />
                  <div>
                    <h4 className='text-white font-medium'>Játékos teljesítmény</h4>
                    <p className='text-gray-400 text-sm'>Egyéni statisztikák</p>
                  </div>
                </div>
                <div className='flex items-start space-x-3'>
                  <div className='h-2 w-2 bg-amber-500 rounded-full mt-2' />
                  <div>
                    <h4 className='text-white font-medium'>Historikus adatok</h4>
                    <p className='text-gray-400 text-sm'>Korábbi találkozók elemzése</p>
                  </div>
                </div>
                <div className='flex items-start space-x-3'>
                  <div className='h-2 w-2 bg-amber-500 rounded-full mt-2' />
                  <div>
                    <h4 className='text-white font-medium'>Predikciós modellek</h4>
                    <p className='text-gray-400 text-sm'>AI alapú előrejelzések</p>
                  </div>
                </div>
                <div className='flex items-start space-x-3'>
                  <div className='h-2 w-2 bg-amber-500 rounded-full mt-2' />
                  <div>
                    <h4 className='text-white font-medium'>Igazolási piac</h4>
                    <p className='text-gray-400 text-sm'>Értékelések és trendek</p>
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
                    <h4 className='text-white font-medium'>Interaktív grafikonok</h4>
                    <p className='text-gray-400 text-sm'>Dinamikus vizualizációk</p>
                  </div>
                </div>
                <div className='flex items-start space-x-3'>
                  <div className='h-2 w-2 bg-amber-500 rounded-full mt-2' />
                  <div>
                    <h4 className='text-white font-medium'>Összehasonlítások</h4>
                    <p className='text-gray-400 text-sm'>Csapatok és játékosok</p>
                  </div>
                </div>
                <div className='flex items-start space-x-3'>
                  <div className='h-2 w-2 bg-amber-500 rounded-full mt-2' />
                  <div>
                    <h4 className='text-white font-medium'>Exportálás</h4>
                    <p className='text-gray-400 text-sm'>PDF és Excel formátum</p>
                  </div>
                </div>
                <div className='flex items-start space-x-3'>
                  <div className='h-2 w-2 bg-amber-500 rounded-full mt-2' />
                  <div>
                    <h4 className='text-white font-medium'>Riasztások</h4>
                    <p className='text-gray-400 text-sm'>Fontos események értesítői</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Premium Features */}
            <Card className='bg-gradient-to-br from-amber-600 to-amber-700 border-amber-500'>
              <CardContent className='p-6 text-center'>
                <Star className='h-8 w-8 mx-auto mb-3 text-white' />
                <h3 className='text-white font-bold mb-2'>Premium Elemzések</h3>
                <p className='text-amber-100 text-sm mb-4'>
                  Hozzáférés a legfejlettebb statisztikai modellekhez és szakértői elemzésekhez
                </p>
                {!isAuthenticated ? (
                  <Link href='/auth'>
                    <Button className='bg-white text-amber-700 hover:bg-gray-100'>
                      Regisztráció
                    </Button>
                  </Link>
                ) : (
                  <Button className='bg-white text-amber-700 hover:bg-gray-100' disabled>
                    Hamarosan elérhető
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
