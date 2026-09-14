import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    localPatterns: [
      {
        pathname: "/produtos/**",
        search: "?v=2",
      },
      {
        pathname: "/images/**",
        search: "",
      },
      {
        pathname: "/logo/**",
        search: "",
      },
    ],
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
