import { notFound } from "next/navigation";
import { ProductDetail } from "../../components/product-detail";
import { SiteFooter } from "../../components/site-footer";
import { SiteHeader } from "../../components/site-header";
import { getProduct, products } from "../../data/products";

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export default async function ProductPage({ params }: PageProps<"/produto/[slug]">) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  return (
    <main className="min-h-screen bg-white">
      <SiteHeader />
      <section className="px-5 py-12 sm:px-8 sm:py-20"><div className="mx-auto max-w-[1240px]"><ProductDetail product={product} /></div></section>
      <SiteFooter />
    </main>
  );
}
