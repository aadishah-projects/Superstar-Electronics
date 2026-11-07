import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  reactCompiler: true,
  experimental: {
    cpus: 2,
    serverActions: {
      bodySizeLimit: "30mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "qualitycomputer.com.np",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "www.superstarelectronics.com.np",
          },
        ],
        destination: "https://superstarelectronics.com.np/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
