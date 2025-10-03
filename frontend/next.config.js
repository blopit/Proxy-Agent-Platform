/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: []
  },
  env: {
    AGENT_API_URL: process.env.AGENT_API_URL || 'http://localhost:8000',
    NEXT_PUBLIC_AGENT_WS_URL: process.env.NEXT_PUBLIC_AGENT_WS_URL || 'ws://localhost:8000/ws',
  },
  async rewrites() {
    return [
      {
        source: '/api/agents/:path*',
        destination: `${process.env.AGENT_API_URL || 'http://localhost:8000'}/api/:path*`
      }
    ];
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
}

module.exports = nextConfig;