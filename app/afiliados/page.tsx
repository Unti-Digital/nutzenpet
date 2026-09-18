import Link from "next/link";
import { ArrowRight, BadgeCheck, HeartHandshake, Megaphone, MousePointerClick, Sparkles, Users } from "lucide-react";
import { FloatingMotifs } from "../components/floating-motifs";
import { SiteFooter } from "../components/site-footer";
import { SiteHeader } from "../components/site-header";

const steps = [
  { icon: HeartHandshake, title: "Faça parte", text: "Apresente seu interesse e conte um pouco sobre o seu trabalho e sua comunidade." },
  { icon: Megaphone, title: "Compartilhe", text: "Leve conteúdo e produtos NutzenPet para pessoas que também cuidam de cães e gatos." },
  { icon: MousePointerClick, title: "Acompanhe", text: "Tenha uma experiência organizada para acompanhar sua participação no programa." },
];

export default function AffiliatesPage() {
  return (
    <main className="min-h-screen bg-[#fffef9]">
      <SiteHeader />
      <section className="relative overflow-hidden bg-[#3E1255] px-5 py-16 text-white sm:px-8 sm:py-24">
        <FloatingMotifs className="text-white opacity-10" />
        <div className="relative mx-auto max-w-[1120px] text-center"><p className="flex items-center justify-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-[#D9C7E3]"><Sparkles className="h-4 w-4" /> Programa de Afiliados NutzenPet</p><h1 className="mx-auto mt-4 max-w-4xl text-4xl font-black leading-tight sm:text-6xl">Compartilhe cuidado. Construa novas conexões.</h1><p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-white/75">Um espaço pensado para criadores, profissionais e parceiros que desejam apresentar a NutzenPet às suas comunidades.</p><Link href="/contato" className="group mt-8 inline-flex min-h-12 items-center gap-3 rounded-full bg-[#FE8C05] px-7 text-sm font-black text-white transition-colors duration-300 hover:bg-[#CC632B]">Quero ser afiliado <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-2" /></Link></div>
      </section>

      <section className="px-5 py-14 sm:px-8 sm:py-20"><div className="mx-auto max-w-[1120px]"><div className="text-center"><p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#3E1255]">Uma parceria com propósito</p><h2 className="mt-3 text-3xl font-black text-[#123F55] sm:text-4xl">Como será a jornada</h2></div><div className="mt-10 grid gap-8 md:grid-cols-3">{steps.map(({ icon: Icon, title, text }, index) => <article key={title} className="reveal-up border-t-2 border-[#3E1255] pt-6" style={{ animationDelay: `${index * 100}ms` }}><span className="sonar sonar-purple relative grid h-12 w-12 place-items-center rounded-full bg-[#3E1255] text-white"><Icon className="relative z-10 h-5 w-5" /></span><h3 className="mt-5 text-xl font-black text-[#123F55]">{title}</h3><p className="mt-3 text-sm leading-7 text-slate-600">{text}</p></article>)}</div></div></section>

      <section className="bg-[#F5EFF8] px-5 py-14 sm:px-8 sm:py-20"><div className="mx-auto grid max-w-[1120px] items-center gap-10 lg:grid-cols-2"><div><Users className="h-10 w-10 text-[#3E1255]" /><h2 className="mt-5 text-3xl font-black text-[#123F55] sm:text-4xl">Afiliado ou representante?</h2><p className="mt-4 text-sm leading-7 text-slate-600">O programa de afiliados é voltado à divulgação e à conexão com comunidades. A representação atende quem deseja conversar sobre atuação comercial e distribuição.</p></div><div className="grid gap-4"><div className="flex items-start gap-4 bg-white p-6"><BadgeCheck className="mt-0.5 h-6 w-6 shrink-0 text-[#3E1255]" /><div><h3 className="font-black text-[#123F55]">Quero ser afiliado</h3><p className="mt-2 text-sm leading-6 text-slate-500">Fale com a equipe pelo formulário de contato.</p></div></div><div className="flex items-start gap-4 bg-white p-6"><BadgeCheck className="mt-0.5 h-6 w-6 shrink-0 text-[#FE8C05]" /><div><h3 className="font-black text-[#123F55]">Quero representar</h3><p className="mt-2 text-sm leading-6 text-slate-500">Conheça o canal dedicado a representantes.</p></div></div><div className="flex flex-wrap gap-3"><Link href="/contato" className="group flex min-h-12 items-center gap-2 rounded-full bg-[#3E1255] px-6 text-sm font-black text-white">Falar sobre afiliação <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-2" /></Link><Link href="/representante" className="group flex min-h-12 items-center gap-2 rounded-full border-2 border-[#3E1255] px-6 text-sm font-black text-[#3E1255]">Ser representante <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-2" /></Link></div></div></div></section>
      <SiteFooter />
    </main>
  );
}
