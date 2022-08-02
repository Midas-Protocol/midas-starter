/** @type {import('next').NextConfig} */

nextConfig = {
  reactStrictMode: true,
  env: {
    BSC: process.env.BSC,
    MIN_BORROW_USD: process.env.MIN_BORROW_USD
  },
};

module.exports = nextConfig;
