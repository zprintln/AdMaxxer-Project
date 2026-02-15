/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable experimental app directory features
  experimental: {
    serverActions: true,
  },

  // Environment variables
  env: {
    BEM_API_KEY: process.env.BEM_API_KEY,
    MINIMAX_API_KEY: process.env.MINIMAX_API_KEY,
    MINIMAX_GROUP_ID: process.env.MINIMAX_GROUP_ID,
    MINIMAX_BASE_URL: process.env.MINIMAX_BASE_URL,
  },

  // Image domains for generated content
  images: {
    domains: [
      'api.minimax.chat',
      'minimax-cdn.com',
      'bem.ai',
      // Add other domains for AI-generated images
    ],
  },

  // API route configuration
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },

  // Increase API route timeout for AI generation
  serverRuntimeConfig: {
    maxDuration: 60, // 60 seconds for serverless functions
  },
};

module.exports = nextConfig;
