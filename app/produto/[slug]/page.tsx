import Image from "next/image";
import { notFound } from "next/navigation";
import { FloatingMotifs } from "../../components/floating-motifs";
import { ProductDetail } from "../../components/product-detail";
import { SiteFooter } from "../../components/site-footer";
import { SiteHeader } from "../../components/site-header";
import { getProduct, getProductBanner, products } from "../../data/products";

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export default async function ProductPage({ params }: PageProps<"/produto/[slug]">) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();
  const banner = getProductBanner(product);

  return (
    <main className="min-h-screen bg-white">
      <SiteHeader />
      <section className="relative overflow-hidden border-b border-[#E2D4E9]" style={{ backgroundColor: product.soft }}>
        <FloatingMotifs className="z-10 opacity-35" />
        <div className="relative mx-auto grid min-h-[560px] max-w-[1440px] md:min-h-[440px] md:grid-cols-[1.02fr_0.98fr] lg:min-h-[500px]">
          <div className="reveal-up relative z-20 flex flex-col justify-center px-5 py-14 sm:px-8 md:px-12 lg:px-20">
            <p className="text-[11px] font-black uppercase tracking-[0.2em]" style={{ color: product.accent }}>{banner.eyebrow}</p>
            <h1 className="mt-4 max-w-2xl text-4xl font-black leading-tight text-[#123F55] sm:text-5xl lg:text-6xl">{banner.title}</h1>
            <div className="mt-7 flex items-center gap-3 text-xs font-black uppercase tracking-[0.14em] text-[#3E1255]">
              <span className="h-px w-10" style={{ backgroundColor: product.accent }} />
              {product.name}
            </div>
          </div>
          <div className="relative min-h-[300px] overflow-hidden md:min-h-full">
            <Image
              src={banner.image}
              alt={banner.imageAlt}
              fill
              preload
              quality={92}
              sizes="(max-width: 767px) 100vw, 50vw"
              className="object-cover transition-transform duration-700 hover:scale-[1.02]"
              style={{ objectPosition: banner.imagePosition }}
            />
            <span className="absolute inset-y-0 left-0 hidden w-1 md:block" style={{ backgroundColor: product.accent }} aria-hidden="true" />
          </div>
        </div>
      </section>
      <section className="px-5 py-12 sm:px-8 sm:py-20"><div className="mx-auto max-w-[1240px]"><ProductDetail product={product} /></div></section>
      <SiteFooter />
    </main>
  );
}
