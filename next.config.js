/** @type {import('next').NextConfig} */
const nextConfig = {
  // Suppress hydration warnings in development
  experimental: {
    suppressHydrationWarning: true,
  },
  
  // Enable webpack 5 for better performance
  webpack: (config, { dev, isServer }) => {
    // Suppress specific warnings in development
    if (dev) {
      config.infrastructureLogging = {
        level: 'error',
      };
      
      // Handle browser extension interference
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    return config;
  },

  // Configure headers for better security and hydration
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'unsafe-none',
          },
        ],
      },
    ];
  },

  // Environment variables configuration
  env: {
    CUSTOM_KEY: 'luxplay-production',
  },

  // Image optimization
  images: {
    domains: ['localhost', 'luxplay.io'],
    formats: ['image/webp', 'image/avif'],
  },

  // Disable x-powered-by header
  poweredByHeader: false,

  // Enable strict mode for better React performance
  reactStrictMode: false, // Disable to prevent double mounting in dev

  // Enable SWC minification for better performance
  swcMinify: true,
  
  // Custom dev server configuration
  ...(process.env.NODE_ENV === 'development' && {
    onDemandEntries: {
      // Period (in ms) where the server will keep pages in the buffer
      maxInactiveAge: 25 * 1000,
      // Number of pages that should be kept simultaneously without being disposed
      pagesBufferLength: 2,
    },
  }),
};

module.exports = nextConfig;