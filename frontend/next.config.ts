import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    turbopackSourceMaps: true, // Enable source maps for Turbopack
    serverActions: {}, // fixed: must be an object, not boolean
  },
  // Webpack configuration to ignore archived folders
  webpack: (config, { dev, isServer }) => {
    // Ignore archived folders
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ['**/node_modules/**', '**/archived/**', 'archived/**'],
    };

    return config;
  },
};

export default nextConfig;
