import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
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
