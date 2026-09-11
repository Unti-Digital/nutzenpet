import Image from "next/image";
import Link from "next/link";
import { Camera, Mail, MapPin, MessageCircle, Phone, Play } from "lucide-react";
import { products } from "../data/products";

const footerLink = "transition-colors duration-300 hover:text-[#FE8C05]";

export function SiteFooter() {
  return (
    <footer className="bg-[#124D55] pt-12 text-white">
      <div className="mx-auto grid max-w-[1340px] gap-9 px-5 sm:grid-cols-2 sm:px-8 lg:grid-cols-[1.35fr_0.85fr_1.15fr_0.85fr_1.15fr]">
        <div><Image src="/logo/logo.png" alt="NutzenPet" width={220} height={79} className="h-11 w-auto object-contain" /><p className="mt-5 max-w-xs text-sm leading-6 text-white/70">Nutrição completa, transparente e responsável para cães e gatos.</p><div className="mt-5 flex gap-2">{[Camera, MessageCircle, Play].map((Icon, index) => <a key={index} href="/contato" aria-label={["Instagram", "Facebook", "YouTube"][index]} className="grid h-9 w-9 place-items-center rounded-full bg-white/10 transition-all duration-300 hover:scale-90 hover:bg-[#FE8C05]"><Icon className="h-4 w-4" /></a>)}</div></div>
        <div><h3 className="text-sm font-black">Institucional</h3><nav className="mt-4 grid gap-2 text-xs text-white/70"><Link href="/sobre" className={footerLink}>Sobre nós</Link><Link href="/blog" className={footerLink}>Blog</Link><Link href="/conta" className={footerLink}>Minha conta</Link><Link href="/politica-de-privacidade" className={footerLink}>Política de privacidade</Link></nav></div>
        <div><h3 className="text-sm font-black">Produtos</h3><nav className="mt-4 grid gap-2 text-xs text-white/70">{products.map((product) => <Link key={product.slug} href={`/produto/${product.slug}`} className={footerLink}>{product.shortName}</Link>)}<Link href="/produto" className="mt-1 font-black text-[#B9DC80] transition-colors duration-300 hover:text-[#FE8C05]">Ver todos</Link></nav></div>
        <div><h3 className="text-sm font-black">Sua compra</h3><nav className="mt-4 grid gap-2 text-xs text-white/70"><Link href="/carrinho" className={footerLink}>Carrinho</Link><Link href="/checkout" className={footerLink}>Checkout</Link><span>Prazo e entrega</span></nav></div>
        <div><h3 className="text-sm font-black">Contato</h3><div className="mt-4 grid gap-3 text-xs text-white/70"><a href="tel:+5511999999999" className="flex items-center gap-2 transition-colors duration-300 hover:text-white"><Phone className="h-4 w-4 text-[#FE8C05]" /> (11) 99999-9999</a><a href="mailto:contato@nutzenpet.com.br" className="flex items-center gap-2 transition-colors duration-300 hover:text-white"><Mail className="h-4 w-4 text-[#FE8C05]" /> contato@nutzenpet.com.br</a><Link href="/contato" className="flex items-center gap-2 transition-colors duration-300 hover:text-white"><MapPin className="h-4 w-4 text-[#FE8C05]" /> São Paulo - SP</Link></div></div>
      </div>
      <div className="mt-10 bg-white px-5 text-[#123F55] sm:px-8"><div className="mx-auto flex max-w-[1340px] flex-col gap-4 py-5 text-[11px] sm:flex-row sm:items-center sm:justify-between"><span>© 2026 NutzenPet. Todos os direitos reservados.</span><span className="flex items-center gap-2 text-slate-500">Dev. &amp; Design by<a href="https://www.untidigital.com.br/pt" target="_blank" rel="noopener noreferrer" aria-label="Visitar o site da Unti Digital" className="inline-flex transition-opacity duration-300 hover:opacity-75"><Image src="https://www.untidigital.com.br/images/logo-horizontal.svg" alt="Unti Digital" width={1812} height={394} unoptimized className="h-6 w-auto object-contain" /></a></span></div></div>
    </footer>
  );
}
