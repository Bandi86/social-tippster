import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    // Ignore archived folders during build and development
    turbo: {
      rules: {
        '**/*': {
          loaders: ['raw-loader'],
          exclude: {
            '**/archived/**': { loaders: [] },
          },
        },
      },
    },
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
