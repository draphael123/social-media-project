/** @type {import('next').NextConfig} */
const nextConfig = {
  // Suppress Edge Runtime warnings for Supabase (these are non-blocking)
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      }
    }
    return config
  },
  // Suppress warnings about Edge Runtime (Supabase works fine despite warnings)
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
}

module.exports = nextConfig

