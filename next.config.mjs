/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Required for Prisma to work correctly on Vercel serverless
  serverExternalPackages: ["@prisma/client", "prisma"],
};

export default nextConfig;
