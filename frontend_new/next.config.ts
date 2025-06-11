import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Only use standalone for production builds
  ...(process.env.NODE_ENV === 'production' && { output: 'standalone' }),

  // Webpack configuration for file watching (when not using Turbopack)
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Force polling for file watching in Docker on Windows
      config.watchOptions = {
        poll: 1000, // Poll every 1000ms
        aggregateTimeout: 300,
        ignored: /node_modules/,
      };
    }
    return config;
  },

  // React strict mode for better development experience
  reactStrictMode: true,
};

export default nextConfig;
