/** @type {import('next').NextConfig} */

nextConfig = {
  reactStrictMode: true,
  env: {
    BSC: process.env.BSC,
  },
};

module.exports = nextConfig;
