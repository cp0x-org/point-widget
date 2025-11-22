import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  devIndicators: false,
webpack: (config) => {
    config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
    };
    return config;
},
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.octav.fi',
      },
    ],
  },
};

export default nextConfig;
