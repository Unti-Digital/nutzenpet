import { getCommerceCatalog } from "@/lib/woocommerce/products";
import { isWordPressConfigured } from "@/lib/woocommerce/config";

export async function GET() {
  const catalog = await getCommerceCatalog();
  return Response.json(catalog, {
    headers: {
      "X-Commerce-Source": catalog.source,
      "X-WordPress-Configured": String(isWordPressConfigured()),
    },
  });
}
