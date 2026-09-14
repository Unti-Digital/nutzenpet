import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import type { SVGProps } from "react";
import { contactDetails } from "../data/contact";
import { products } from "../data/products";

const footerLink = "transition-colors duration-300 hover:text-[#FE8C05]";

function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.4" cy="6.6" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M13.7 22v-8.9h3l.5-3.5h-3.5V7.4c0-1 .3-1.7 1.8-1.7h1.9V2.6c-.3 0-1.5-.1-2.8-.1-2.8 0-4.7 1.7-4.7 4.8v2.3H6.8v3.5h3.1V22h3.8Z" />
    </svg>
  );
}

const socialLinks = [
  { label: "Instagram", href: contactDetails.instagram, icon: InstagramIcon, className: "sonar-burnt bg-[#CC632B]" },
  { label: "Facebook", href: contactDetails.facebook, icon: FacebookIcon, className: "sonar-purple bg-[#3E1255]" },
  { label: "WhatsApp", href: contactDetails.whatsapp, icon: MessageCircle, className: "sonar-green bg-[#67952F]" },
];

export function SiteFooter() {
  return (
    <footer className="bg-[#124D55] pt-12 text-white">
      <div className="mx-auto grid max-w-[1340px] gap-9 px-5 sm:grid-cols-2 sm:px-8 lg:grid-cols-[1.35fr_0.85fr_1.15fr_0.85fr_1.15fr]">
        <div><Image src="/logo/logo.png" alt="NutzenPet" width={220} height={79} className="h-11 w-auto object-contain" /><p className="mt-5 max-w-xs text-sm leading-6 text-white/70">Nutrição completa, transparente e responsável para cães e gatos.</p><div className="mt-5 flex gap-3">{socialLinks.map(({ label, href, icon: Icon, className }) => <Link key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} title={label} className={`sonar relative grid h-9 w-9 place-items-center rounded-full text-white transition-all duration-300 hover:-translate-y-1 hover:scale-95 ${className}`}><Icon className="relative z-10 h-4 w-4" /></Link>)}</div></div>
        <div><h3 className="text-sm font-black">Institucional</h3><nav className="mt-4 grid gap-2 text-xs text-white/70"><Link href="/sobre" className={footerLink}>Sobre nós</Link><Link href="/blog" className={footerLink}>Blog</Link><Link href="/conta" className={footerLink}>Minha conta</Link><Link href="/politica-de-privacidade" className={footerLink}>Política de privacidade</Link></nav></div>
        <div><h3 className="text-sm font-black">Produtos</h3><nav className="mt-4 grid gap-2 text-xs text-white/70">{products.map((product) => <Link key={product.slug} href={`/produto/${product.slug}`} className={footerLink}>{product.shortName}</Link>)}<Link href="/produto" className="mt-1 font-black text-[#B9DC80] transition-colors duration-300 hover:text-[#FE8C05]">Ver todos</Link></nav></div>
        <div><h3 className="text-sm font-black">Sua compra</h3><nav className="mt-4 grid gap-2 text-xs text-white/70"><Link href="/carrinho" className={footerLink}>Carrinho</Link><Link href="/checkout" className={footerLink}>Checkout</Link><span>Prazo e entrega</span></nav></div>
        <div><h3 className="text-sm font-black">Contato</h3><div className="mt-4 grid gap-3 text-xs text-white/70"><a href={contactDetails.phoneHref} className="flex items-center gap-2 transition-colors duration-300 hover:text-white"><Phone className="h-4 w-4 text-[#FE8C05]" /> {contactDetails.phoneDisplay}</a><a href={contactDetails.emailHref} className="flex items-center gap-2 transition-colors duration-300 hover:text-white"><Mail className="h-4 w-4 text-[#FE8C05]" /> {contactDetails.email}</a><Link href="/contato" className="flex items-center gap-2 transition-colors duration-300 hover:text-white"><MapPin className="h-4 w-4 text-[#FE8C05]" /> São Paulo - SP</Link></div></div>
      </div>
      <div className="mt-10 bg-white px-5 text-[#123F55] sm:px-8"><div className="mx-auto flex max-w-[1340px] flex-col gap-4 py-5 text-[11px] sm:flex-row sm:items-center sm:justify-between"><span>© 2026 NutzenPet. Todos os direitos reservados.</span><span className="flex items-center gap-2 text-slate-500">Dev. &amp; Design by<a href="https://www.untidigital.com.br/pt" target="_blank" rel="noopener noreferrer" aria-label="Visitar o site da Unti Digital" className="inline-flex transition-opacity duration-300 hover:opacity-75"><Image src="https://www.untidigital.com.br/images/logo-horizontal.svg" alt="Unti Digital" width={1812} height={394} unoptimized className="h-6 w-auto object-contain" /></a></span></div></div>
    </footer>
  );
}
