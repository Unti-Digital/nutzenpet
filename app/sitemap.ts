import type { MetadataRoute } from "next";
import { posts } from "./data/posts";
import { getCommerceCatalog } from "@/lib/woocommerce/products";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (process.env.FRONTEND_URL || "http://localhost:3000").replace(/\/$/, "");
  const now = new Date();
  const pages = ["", "/sobre", "/produto", "/nutzen-club", "/blog", "/contato", "/afiliados", "/seja-um-lojista-parceiro", "/politica-de-privacidade"];
  const catalog = await getCommerceCatalog();
  return [
    ...pages.map((path) => ({ url: `${base}${path}`, lastModified: now, changeFrequency: path === "" || path === "/produto" ? "weekly" as const : "monthly" as const, priority: path === "" ? 1 : 0.7 })),
    ...catalog.products.map((product) => ({ url: `${base}/produto/${product.slug}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.8 })),
    ...posts.map((post) => ({ url: `${base}/blog/${post.slug}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.6 })),
  ];
}
