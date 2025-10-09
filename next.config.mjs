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

  transpilePackages: [
    'lucide-react', 
    'geist',
    'input-otp', 
    'react-day-picker', 
    'sonner'
  ],
}

export default nextConfig
