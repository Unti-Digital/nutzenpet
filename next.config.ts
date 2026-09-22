import type { NextConfig } from "next";

const wordpressOrigin = process.env.WORDPRESS_URL ? new URL(process.env.WORDPRESS_URL) : null;
const wordpressUploads = wordpressOrigin
  ? {
      protocol: wordpressOrigin.protocol.replace(":", "") as "http" | "https",
      hostname: wordpressOrigin.hostname,
      port: wordpressOrigin.port,
      pathname: `${wordpressOrigin.pathname.replace(/\/$/, "")}/wp-content/uploads/**`,
    }
  : null;

const localWordPressUploads = [
  {
    protocol: "http" as const,
    hostname: "localhost",
    port: "",
    pathname: "/nutzen-wp/wp-content/uploads/**",
    search: "",
  },
  {
    protocol: "http" as const,
    hostname: "127.0.0.1",
    port: "",
    pathname: "/nutzen-wp/wp-content/uploads/**",
    search: "",
  },
];

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/representante",
        destination: "/seja-um-lojista-parceiro",
        permanent: true,
      },
      {
        source: "/produto/racas-medias-grandes",
        destination: "/produto/racas-medias-grandes-15kg",
        permanent: true,
      },
      {
        source: "/produto/racas-pequenas",
        destination: "/produto/racas-pequenas-10kg",
        permanent: true,
      },
      {
        source: "/produto/gatos-castrados",
        destination: "/produto/gatos-castrados-10-1kg",
        permanent: true,
      },
    ];
  },
  images: {
    dangerouslyAllowLocalIP: process.env.NODE_ENV === "development",
    qualities: [75, 88, 90, 92],
    localPatterns: [
      {
        pathname: "/produtos/**",
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
      ...localWordPressUploads,
      ...(wordpressUploads ? [wordpressUploads] : []),
    ],
  },
};

export default nextConfig;
