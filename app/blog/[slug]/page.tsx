import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CalendarDays, Clock, Heart } from "lucide-react";
import { FloatingMotifs } from "../../components/floating-motifs";
import { SiteFooter } from "../../components/site-footer";
import { SiteHeader } from "../../components/site-header";
import { getPost, posts } from "../../data/posts";

export function generateStaticParams() { return posts.map((post) => ({ slug: post.slug })); }

export default async function BlogPostPage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();
  const related = posts.filter((item) => item.slug !== post.slug).slice(0, 2);

  return (
    <main className="min-h-screen bg-[#fffef9]">
      <SiteHeader />
      <section className="relative overflow-hidden bg-[#F5EFF8] px-5 py-12 sm:px-8 sm:py-16"><FloatingMotifs className="opacity-55" /><div className="reveal-up relative mx-auto max-w-4xl text-center"><Link href="/blog" className="group inline-flex items-center gap-2 text-xs font-black text-[#3E1255]"><ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-2" /> Voltar ao blog</Link><p className="mt-8 text-[11px] font-black uppercase tracking-[0.2em] text-[#3E1255]">{post.tag}</p><h1 className="mx-auto mt-4 max-w-3xl text-4xl font-black leading-tight text-[#123F55] sm:text-6xl">{post.title}</h1><div className="mt-6 flex flex-wrap items-center justify-center gap-5 text-xs text-slate-500"><span className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-[#FE8C05]" /> {post.date}</span><span className="flex items-center gap-2"><Clock className="h-4 w-4 text-[#FE8C05]" /> {post.readingTime}</span></div></div></section>
      <article className="px-5 py-12 sm:px-8 sm:py-16"><div className="mx-auto max-w-4xl"><div className="relative aspect-[16/9] rounded-lg shadow-[0_18px_50px_rgba(18,63,85,.14)]"><Image src={post.image} alt={post.title} fill preload sizes="(max-width: 900px) 100vw, 900px" className="rounded-lg object-cover" /></div><p className="mx-auto mt-10 max-w-3xl text-xl font-bold leading-8 text-[#123F55]">{post.description}</p><div className="mx-auto mt-10 max-w-3xl space-y-10">{post.content.map((section) => <section key={section.heading}><h2 className="text-2xl font-black text-[#123F55] sm:text-3xl">{section.heading}</h2><div className="mt-4 space-y-4">{section.paragraphs.map((paragraph) => <p key={paragraph} className="text-base leading-8 text-slate-600">{paragraph}</p>)}</div></section>)}</div><div className="mx-auto mt-12 flex max-w-3xl items-center gap-4 border-y border-slate-200 py-6 text-sm font-bold text-[#3E1255]"><Heart className="h-5 w-5" /> Cuidar também é aprender todos os dias.</div></div></article>
      <section className="bg-white px-5 py-14 sm:px-8"><div className="mx-auto max-w-[1000px]"><h2 className="text-3xl font-black text-[#123F55]">Continue lendo</h2><div className="mt-8 grid gap-8 md:grid-cols-2">{related.map((item) => <Link key={item.slug} href={`/blog/${item.slug}`} className="group grid grid-cols-[120px_1fr] items-center gap-5"><div className="relative aspect-square rounded-lg shadow-md"><Image src={item.image} alt="" fill sizes="120px" className="rounded-lg object-cover" /></div><div><p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#3E1255]">{item.tag}</p><h3 className="mt-2 font-black leading-5 text-[#123F55] group-hover:text-[#FE8C05]">{item.title}</h3><span className="mt-3 flex items-center gap-1 text-xs font-black text-[#3E1255]">Ler mais <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-2" /></span></div></Link>)}</div></div></section>
      <SiteFooter />
    </main>
  );
}
