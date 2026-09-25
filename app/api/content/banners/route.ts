import { getWordPressApiUrl, isWordPressConfigured } from "@/lib/woocommerce/config";

type BannerResponse = {
  items?: Array<{
    id: number;
    title: string;
    alt: string;
    desktop_image: string;
    mobile_image: string;
    link: string;
    order: number;
  }>;
};

export async function GET() {
  if (!isWordPressConfigured()) return Response.json({ items: [] });

  try {
    const response = await fetch(getWordPressApiUrl("nutzen/v1/banners"), {
      headers: { Accept: "application/json" },
      next: { revalidate: 300, tags: ["nutzen-banners"] },
    });
    if (!response.ok) return Response.json({ items: [] });

    const payload = await response.json() as BannerResponse;
    const items = Array.isArray(payload.items)
      ? payload.items.filter((item) => item.id > 0 && Boolean(item.desktop_image))
      : [];
    return Response.json({ items });
  } catch {
    return Response.json({ items: [] });
  }
}
