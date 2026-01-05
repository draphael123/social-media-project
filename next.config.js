/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure for Edge Runtime compatibility
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js'],
  },
}

module.exports = nextConfig

