import { NextResponse } from "next/server";
import { getCommerceCatalog } from "@/lib/woocommerce/products";

export async function GET() {
  const catalog = await getCommerceCatalog();
  const items = catalog.products
    .filter((product) => product.wooId && product.availableForPurchase)
    .map((product) => ({ id: product.wooId, name: product.name, slug: product.slug, weight: product.weight, image: product.images[0] }));
  return NextResponse.json({ items, source: catalog.source });
}

export const dynamic = "force-dynamic";
