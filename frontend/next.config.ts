import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    turbopackSourceMaps: true, // Enable source maps for Turbopack
    serverActions: {}, // fixed: must be an object, not boolean
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/**',
      },
    ],
  },
  // Proxy uploads to backend
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: 'http://localhost:3001/uploads/:path*',
      },
    ];
  },
  // Webpack configuration to ignore archived folders
  webpack: config => {
    // Ignore archived folders
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ['**/node_modules/**', '**/archived/**', 'archived/**'],
    };

    return config;
  },
};

export default nextConfig;
