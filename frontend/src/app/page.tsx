import BaseLayout from '@/components/layout/base-layout';
import { Button } from '@/components/ui/button';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Social Tippster - Share Your Knowledge with the World',
  description:
    'Join our community of experts and enthusiasts to share knowledge, learn from others, and connect with like-minded people.',
  keywords: ['social media', 'tips', 'knowledge sharing', 'community', 'learning'],
  openGraph: {
    title: 'Social Tippster - Share Your Knowledge with the World',
    description:
      'Join our community of experts and enthusiasts to share knowledge, learn from others, and connect with like-minded people.',
    type: 'website',
    url: 'https://social-tippster.com',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Social Tippster - Share Your Knowledge with the World',
    description:
      'Join our community of experts and enthusiasts to share knowledge, learn from others, and connect with like-minded people.',
  },
};

export default function Home() {
  return (
    <BaseLayout>
      {/* Hero Section */}
      <section className='py-12 sm:py-16 md:py-20 lg:py-24'>
        <div className='grid md:grid-cols-2 gap-12 items-center'>
          <div className='space-y-6'>
            <h1 className='text-4xl sm:text-5xl font-bold tracking-tight text-gray-900'>
              Share Your Best Tips With The World
            </h1>
            <p className='text-xl text-gray-600'>
              Join our community of experts and enthusiasts to share knowledge, learn from others,
              and connect with like-minded people.
            </p>
            <div className='flex flex-col sm:flex-row gap-4 pt-4'>
              <Link href='/register'>
                <Button size='lg' className='w-full sm:w-auto'>
                  Get Started
                </Button>
              </Link>
              <Link href='/login'>
                <Button size='lg' variant='outline' className='w-full sm:w-auto'>
                  Login
                </Button>
              </Link>
            </div>
          </div>
          <div className='flex justify-center'>
            <div className='relative w-full max-w-md aspect-square'>
              <Image
                src='/globe.svg'
                alt='Connect with the world'
                width={400}
                height={400}
                priority
                className='object-contain'
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className='py-16 bg-gray-50 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8'>
        <div className='max-w-7xl mx-auto'>
          <div className='text-center mb-12'>
            <h2 className='text-3xl font-bold'>Why Join Social Tippster?</h2>
            <p className='mt-4 text-lg text-gray-600'>
              Our platform offers a unique space to connect, share, and grow
            </p>
          </div>
          <div className='grid md:grid-cols-3 gap-8'>
            <div className='bg-white p-6 rounded-lg shadow-sm'>
              <div className='w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                  className='w-6 h-6 text-blue-600'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'
                  />
                </svg>
              </div>
              <h3 className='text-xl font-semibold mb-2'>Share Knowledge</h3>
              <p className='text-gray-600'>
                Create posts with your best tips and advice on any topic you're passionate about.
              </p>
            </div>
            <div className='bg-white p-6 rounded-lg shadow-sm'>
              <div className='w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                  className='w-6 h-6 text-green-600'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
                  />
                </svg>
              </div>
              <h3 className='text-xl font-semibold mb-2'>Connect with Others</h3>
              <p className='text-gray-600'>
                Build connections with people who share your interests or have expertise in areas
                you want to learn about.
              </p>
            </div>
            <div className='bg-white p-6 rounded-lg shadow-sm'>
              <div className='w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                  className='w-6 h-6 text-purple-600'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M13 7h8m0 0v8m0-8l-8 8-4-4-6 6'
                  />
                </svg>
              </div>
              <h3 className='text-xl font-semibold mb-2'>Grow Your Skills</h3>
              <p className='text-gray-600'>
                Learn from others' experiences and insights to improve yourself personally and
                professionally.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className='py-16'>
        <div className='bg-blue-600 rounded-xl text-white p-8 md:p-12 text-center'>
          <h2 className='text-3xl font-bold mb-4'>Ready to Join Our Community?</h2>
          <p className='text-blue-100 text-lg max-w-2xl mx-auto mb-8'>
            Create an account today and start sharing your tips with the world. It only takes a
            minute to get started.
          </p>
          <Link href='/register'>
            <Button size='lg' className='bg-white text-blue-600 hover:bg-blue-50'>
              Sign Up Now
            </Button>
          </Link>
        </div>
      </section>
    </BaseLayout>
  );
}
