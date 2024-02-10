const packageJson = require('./package.json');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  output: "standalone",
  env: {
    APP_VERSION: packageJson.version,
  },
};

module.exports = nextConfig;
