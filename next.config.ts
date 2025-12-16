import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: "standalone",
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
      },
      // Allow loading images from the backend server IP used in your environment
      {
        protocol: "http",
        hostname: "168.231.79.28",
      },
      {
        protocol: "https",
        hostname: "api.lordevs.com",
      },
      {
        protocol: "https",
        hostname: "api.cartwrightking.work",
      },
      // Optional: allow any numeric IP on http (use with caution)
      {
        protocol: "http",
        hostname: "[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+",
      },
    ],
  },
};

export default nextConfig;
