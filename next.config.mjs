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
  swcMinify: true,
  compiler: {
    styledComponents: false,
  },
  transpilePackages: ['culqi-node'],
  env: {
    // Variables de entorno para MercadoPago
    NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY: process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY,
    MERCADOPAGO_ACCESS_TOKEN: process.env.MERCADOPAGO_ACCESS_TOKEN,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    
    // Mantener Culqi para compatibilidad (deprecado)
    NEXT_PUBLIC_CULQI_PUBLIC_KEY: process.env.NEXT_PUBLIC_CULQI_PUBLIC_KEY,
    CULQI_SECRET_KEY: process.env.CULQI_SECRET_KEY,
  },
}

export default nextConfig
