import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  // Only use standalone for production builds
  ...(process.env.NODE_ENV === 'production' && { output: 'standalone' }),
  
  // Turbopack configuration (now stable)
  experimental: {
    // No longer need experimental turbo config since it's stable
  },
  
  // Turbopack-specific configuration
  turbo: {
    // Turbopack configuration options can go here
    rules: {
      // Custom rules for Turbopack can be added here if needed
    },
  },
  
  // Only apply webpack config when NOT using Turbopack
  // Check for Turbopack usage via the --turbopack flag
  ...(!process.argv.includes('--turbopack') && {
    webpack: (config, { dev, isServer }) => {
      if (dev && !isServer) {
        config.watchOptions = {
          poll: 1000,
          aggregateTimeout: 300,
        };
      }
      return config;
    },
  }),
};

export default nextConfig;
