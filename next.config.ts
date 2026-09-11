import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.untidigital.com.br",
        pathname: "/images/logo-horizontal.svg",
      },
    ],
  },
};

export default nextConfig;
