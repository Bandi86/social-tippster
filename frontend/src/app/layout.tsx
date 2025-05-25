import { ErrorBoundary } from '@/components/error-boundary';
import { Providers } from '@/components/providers';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    template: '%s | Social Tippster',
    default: 'Social Tippster - Share Your Knowledge with the World',
  },
  description:
    'Join our community of experts and enthusiasts to share knowledge, learn from others, and connect with like-minded people.',
  keywords: ['social media', 'tips', 'knowledge sharing', 'community', 'learning'],
  authors: [{ name: 'Social Tippster Team' }],
  creator: 'Social Tippster',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://social-tippster.com',
    siteName: 'Social Tippster',
    title: 'Social Tippster - Share Your Knowledge with the World',
    description:
      'Join our community of experts and enthusiasts to share knowledge, learn from others, and connect with like-minded people.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Social Tippster - Share Your Knowledge with the World',
    description:
      'Join our community of experts and enthusiasts to share knowledge, learn from others, and connect with like-minded people.',
    creator: '@social_tippster',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider
          attribute='class'
          defaultTheme='system'
          enableSystem
          disableTransitionOnChange
        >
          <ErrorBoundary>
            <Providers>{children}</Providers>
          </ErrorBoundary>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
