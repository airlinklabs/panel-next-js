/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      enabled: true
    },
    turbo: {
      resolveAlias: {
        'bcrypt': require.resolve('bcryptjs')
      }
    }
  },
  // Webpack configuration (used as fallback)
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "bcrypt": require.resolve("bcryptjs")
    }
    return config
  }
}

module.exports = nextConfig 