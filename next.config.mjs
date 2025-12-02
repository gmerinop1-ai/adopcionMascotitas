/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_CULQI_PUBLIC_KEY: process.env.NEXT_PUBLIC_CULQI_PUBLIC_KEY,
    CULQI_SECRET_KEY: process.env.CULQI_SECRET_KEY,
  },
}

export default nextConfig
