import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/api/buyer/:path*",
        destination: "/api/v1/buyer/:path*",
        permanent: true,
      },
      {
        source: "/api/confirm/:path*",
        destination: "/api/v1/confirm/:path*",
        permanent: true,
      },
      {
        source: "/api/generate",
        destination: "/api/v1/generate",
        permanent: true,
      },
      {
        source: "/api/journey/:path*",
        destination: "/api/v1/journey/:path*",
        permanent: true,
      },
      {
        source: "/api/waitlist",
        destination: "/api/v1/waitlist",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
