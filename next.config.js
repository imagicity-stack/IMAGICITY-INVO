/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/((?!_next/|static/|public/|api/|legacy$|.*\\..*).*)',
        destination: '/',
      },
    ];
  },
};

module.exports = nextConfig;
