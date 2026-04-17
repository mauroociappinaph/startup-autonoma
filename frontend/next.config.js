/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/agents/:path*',
        destination: 'http://localhost:4000/api/agents/:path*',
      },
    ];
  },
};

export default nextConfig;
