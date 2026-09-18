import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, Heart } from "lucide-react";
import { FloatingMotifs } from "../components/floating-motifs";
import { SiteFooter } from "../components/site-footer";
import { SiteHeader } from "../components/site-header";
import { posts } from "../data/posts";

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-[#fffef9]">
      <SiteHeader />
      <section className="relative overflow-hidden bg-[#F5EFF8] px-5 py-16 sm:px-8 sm:py-20">
        <FloatingMotifs />
        <div className="reveal-up relative mx-auto max-w-[1240px] text-center"><p className="flex items-center justify-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-[#3E1255]"><BookOpen className="h-4 w-4" /> Conteúdo para cuidar melhor</p><h1 className="mx-auto mt-4 max-w-3xl text-4xl font-black leading-tight text-[#123F55] sm:text-6xl">Dicas para uma vida mais feliz e saudável</h1><p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-slate-600">Informação simples e responsável sobre nutrição, bem-estar e comportamento.</p></div>
      </section>
      <section className="bg-white px-5 py-14 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-[1240px]"><div className="flex items-end justify-between gap-5"><div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#3E1255]">Todos os conteúdos</p><h2 className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">Blog NutzenPet</h2></div><Heart className="h-7 w-7 text-[#8A5AA0]" /></div>
          <div className="mt-10 grid gap-x-7 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, index) => (
              <article key={post.slug} className="reveal-up group transition-transform duration-300 hover:-translate-y-2" style={{ animationDelay: `${(index % 3) * 90}ms` }}>
                <Link href={`/blog/${post.slug}`} className="block"><div className="relative aspect-[4/3] rounded-lg shadow-[0_8px_22px_rgba(18,63,85,.12)] transition-shadow duration-300 group-hover:shadow-xl"><Image src={post.image} alt={post.title} fill sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 400px" className="rounded-lg object-cover" /></div><div className="pt-5"><div className="flex items-center justify-between gap-4 text-[10px] font-black uppercase tracking-[0.14em] text-[#3E1255]"><span>{post.tag}</span><span className="text-slate-400">{post.readingTime}</span></div><h3 className="mt-3 text-xl font-black leading-tight text-[#123F55] transition-colors duration-300 group-hover:text-[#FE8C05]">{post.title}</h3><p className="mt-3 text-sm leading-6 text-slate-500">{post.description}</p><span className="mt-5 flex items-center gap-2 text-xs font-black text-[#3E1255]">Ler artigo <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-2" /></span></div></Link>
              </article>
            ))}
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
