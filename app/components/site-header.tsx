"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowRight,
  AtSign,
  ChevronDown,
  CircleUserRound,
  Mail,
  Menu,
  PackageCheck,
  Phone,
  Search,
  ShoppingBag,
  Truck,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { formatCurrency, useCart } from "./cart-provider";
import { SiteSearch } from "./site-search";
import { featuredProducts } from "../data/products";
import { contactDetails } from "../data/contact";

const links = [
  { label: "Início", href: "/" },
  { label: "Sobre", href: "/sobre" },
  { label: "Nutzen Club", href: "/nutzen-club" },
  { label: "Blog", href: "/blog" },
  { label: "Contato", href: "/contato" },
];

const partnershipLinks = [
  { label: "Seja um lojista parceiro", href: "/seja-um-lojista-parceiro" },
  { label: "Programa de afiliados", href: "/afiliados" },
];

function NavUnderline() {
  return <span className="absolute inset-x-0 -bottom-2 h-0.5 origin-left scale-x-0 bg-[#FE8C05] transition-transform duration-300 group-hover/navitem:scale-x-100" />;
}

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileProductsOpen, setMobileProductsOpen] = useState(false);
  const [mobilePartnershipsOpen, setMobilePartnershipsOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const cartDialogRef = useRef<HTMLElement>(null);
  const userDialogRef = useRef<HTMLElement>(null);
  const pathname = usePathname();
  const { items, itemCount, subtotal } = useCart();
  const modalOpen = cartOpen || userOpen;

  useEffect(() => {
    if (!modalOpen) return;
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement as HTMLElement | null;
    const dialog = cartOpen ? cartDialogRef.current : userDialogRef.current;
    const focusableSelector = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const focusableElements = dialog ? Array.from(dialog.querySelectorAll<HTMLElement>(focusableSelector)) : [];
    const focusFrame = window.requestAnimationFrame(() => (focusableElements[0] ?? dialog)?.focus());

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setCartOpen(false);
        setUserOpen(false);
        return;
      }

      if (event.key === "Tab" && focusableElements.length > 0) {
        const first = focusableElements[0];
        const last = focusableElements[focusableElements.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      previousFocus?.focus();
    };
  }, [cartOpen, modalOpen]);

  const openCart = () => {
    setMenuOpen(false);
    setMobileProductsOpen(false);
    setMobilePartnershipsOpen(false);
    setUserOpen(false);
    setCartOpen(true);
  };

  const openUser = () => {
    setMenuOpen(false);
    setMobileProductsOpen(false);
    setMobilePartnershipsOpen(false);
    setCartOpen(false);
    setUserOpen(true);
  };

  const openSearch = () => {
    setMenuOpen(false);
    setMobileProductsOpen(false);
    setMobilePartnershipsOpen(false);
    setSearchOpen(true);
  };

  const handleHomeClick = (event: MouseEvent<HTMLAnchorElement>) => {
    setMenuOpen(false);
    setMobileProductsOpen(false);
    setMobilePartnershipsOpen(false);
    if (pathname !== "/") return;

    event.preventDefault();
    setSearchOpen(false);
    window.history.replaceState(null, "", "/");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <header className="sticky top-0 z-50 overflow-x-clip border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
        <div className="bg-[#3E1255] text-white">
          <div className="mx-auto flex h-8 max-w-[1340px] items-center justify-between gap-4 px-5 text-[10px] font-bold sm:px-8">
            <div className="flex min-w-0 items-center gap-4 sm:gap-6">
              <a href={contactDetails.phoneHref} className="flex shrink-0 items-center gap-1.5 text-white/85 transition-colors duration-300 hover:text-white">
                <Phone className="h-3 w-3 text-[#FE8C05]" />
                <span>{contactDetails.phoneDisplay}</span>
              </a>
              <a href={contactDetails.emailHref} aria-label={`Enviar e-mail para ${contactDetails.email}`} className="flex min-w-0 items-center gap-1.5 text-white/85 transition-colors duration-300 hover:text-white">
                <Mail className="h-3 w-3 shrink-0 text-[#FE8C05]" />
                <span className="hidden truncate sm:inline">{contactDetails.email}</span>
              </a>
            </div>
            <div className="flex shrink-0 items-center gap-5">
              <span className="hidden items-center gap-1.5 text-white/70 lg:flex"><Truck className="h-3 w-3 text-[#FE8C05]" /> Entrega para todo o Brasil</span>
              <a href={contactDetails.instagram} target="_blank" rel="noopener noreferrer" className="hidden items-center gap-1.5 text-white/80 transition-colors duration-300 hover:text-white sm:flex"><AtSign className="h-3 w-3 text-[#FE8C05]" /> nutzenpet</a>
              <Link href="/nutzen-club" className="text-[#FFD39C] transition-colors duration-300 hover:text-white">Nutzen Club</Link>
            </div>
          </div>
        </div>

        <div className="relative mx-auto flex h-[78px] max-w-[1340px] items-center justify-between px-5 sm:px-8">
          <Link href="/" onClick={handleHomeClick} aria-label="NutzenPet - início" className="shrink-0">
            <Image src="/logo/logo.png" alt="NutzenPet" width={220} height={79} preload className="h-10 w-auto object-contain sm:h-11" />
          </Link>

          <nav className="hidden items-center gap-5 xl:flex" aria-label="Navegação principal">
            {links.slice(0, 2).map((item) => (
              <Link key={item.href} href={item.href} onClick={item.href === "/" ? handleHomeClick : undefined} className={`group/navitem relative text-sm font-bold transition-colors duration-300 hover:text-[#3E1255] ${pathname === item.href ? "text-[#3E1255]" : "text-slate-900"}`}>
                {item.label}<NavUnderline />
              </Link>
            ))}

            <div className="group/products relative py-7">
              <Link href="/produto" className={`group/navitem relative flex items-center gap-1 text-sm font-bold transition-colors duration-300 hover:text-[#3E1255] ${pathname.startsWith("/produto") ? "text-[#3E1255]" : "text-slate-900"}`}>
                Produtos <ChevronDown className="h-3.5 w-3.5 transition-transform duration-300 group-hover/products:rotate-180" /><NavUnderline />
              </Link>
              <div className="pointer-events-none absolute left-1/2 top-[70px] w-[380px] -translate-x-1/2 translate-y-2 rounded-lg bg-white p-2 opacity-0 shadow-[0_18px_50px_rgba(18,63,85,.16)] transition-all duration-300 group-hover/products:pointer-events-auto group-hover/products:translate-y-0 group-hover/products:opacity-100">
                {featuredProducts.map((product) => (
                  <Link key={product.slug} href={`/produto/${product.slug}`} className="group/subitem flex min-h-20 items-center gap-4 rounded-md px-3 py-2 transition-colors duration-300 hover:bg-slate-50">
                    <span className="relative h-16 w-16 shrink-0"><Image src={product.images[0]} alt="" fill sizes="64px" className="object-contain" /></span>
                    <span className="text-sm font-black leading-5 text-slate-700 transition-colors duration-300 group-hover/subitem:text-[#3E1255]">{product.name}</span>
                  </Link>
                ))}
              </div>
            </div>

            {links.slice(2).map((item) => (
              <Link key={item.href} href={item.href} className={`group/navitem relative text-sm font-bold transition-colors duration-300 hover:text-[#3E1255] ${pathname === item.href ? "text-[#3E1255]" : "text-slate-900"}`}>
                {item.label}<NavUnderline />
              </Link>
            ))}

            <div className="group/partnerships relative py-7">
              <button type="button" className={`group/navitem relative flex items-center gap-1 text-sm font-bold transition-colors duration-300 hover:text-[#3E1255] ${pathname === "/afiliados" || pathname === "/seja-um-lojista-parceiro" ? "text-[#3E1255]" : "text-slate-900"}`}>
                Parcerias <ChevronDown className="h-3.5 w-3.5 transition-transform duration-300 group-hover/partnerships:rotate-180" /><NavUnderline />
              </button>
              <div className="pointer-events-none absolute right-0 top-[70px] w-64 translate-y-2 rounded-lg bg-white p-2 opacity-0 shadow-[0_18px_50px_rgba(18,63,85,.16)] transition-all duration-300 group-hover/partnerships:pointer-events-auto group-hover/partnerships:translate-y-0 group-hover/partnerships:opacity-100">
                {partnershipLinks.map((item) => <Link key={item.href} href={item.href} className="block rounded-md px-4 py-3 text-sm font-bold text-slate-700 transition-colors duration-300 hover:bg-[#F5EFF8] hover:text-[#3E1255]">{item.label}</Link>)}
              </div>
            </div>
          </nav>

          <div className="hidden items-center gap-1 xl:flex">
            <button type="button" onClick={openSearch} aria-label="Abrir busca" className="grid h-10 w-10 place-items-center rounded-full text-slate-800 transition-all duration-300 hover:scale-90 hover:bg-slate-100 hover:text-[#FE8C05]"><Search className="h-5 w-5" /></button>
            <button type="button" onClick={openUser} aria-label="Minha conta" className="grid h-10 w-10 place-items-center rounded-full text-slate-800 transition-all duration-300 hover:scale-90 hover:bg-slate-100 hover:text-[#FE8C05]"><UserRound className="h-5 w-5" /></button>
            <button type="button" onClick={openCart} aria-label="Abrir carrinho" className="relative grid h-10 w-10 place-items-center rounded-full text-slate-800 transition-all duration-300 hover:scale-90 hover:bg-slate-100 hover:text-[#FE8C05]">
              <ShoppingBag className="h-5 w-5" />
              {itemCount > 0 && <span className="sonar sonar-active sonar-orange absolute right-0 top-0 grid h-4 min-w-4 place-items-center rounded-full bg-[#FE8C05] px-1 text-[9px] font-black text-white">{itemCount}</span>}
            </button>
          </div>

          <div className="flex items-center gap-0.5 xl:hidden">
            <button type="button" onClick={openSearch} aria-label="Abrir busca" className="grid h-10 w-10 place-items-center rounded-full text-[#3E1255] transition-all duration-300 hover:scale-90 hover:bg-slate-100"><Search className="h-5 w-5" /></button>
            <button type="button" onClick={openUser} aria-label="Minha conta" className="hidden h-10 w-10 place-items-center rounded-full text-[#3E1255] transition-all duration-300 hover:scale-90 hover:bg-slate-100 sm:grid"><UserRound className="h-5 w-5" /></button>
            <button type="button" onClick={openCart} aria-label="Abrir carrinho" className="relative grid h-10 w-10 place-items-center rounded-full text-[#3E1255] transition-all duration-300 hover:scale-90 hover:bg-slate-100">
              <ShoppingBag className="h-5 w-5" />
              {itemCount > 0 && <span className="sonar sonar-active sonar-orange absolute right-0 top-0 grid h-4 min-w-4 place-items-center rounded-full bg-[#FE8C05] px-1 text-[9px] font-black text-white">{itemCount}</span>}
            </button>
            <button type="button" aria-label={menuOpen ? "Fechar menu" : "Abrir menu"} aria-expanded={menuOpen} onClick={() => { setMenuOpen((open) => !open); if (menuOpen) { setMobileProductsOpen(false); setMobilePartnershipsOpen(false); } }} className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-[#3E1255] transition-all duration-300 hover:scale-90 hover:bg-slate-200">{menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
          </div>

          <SiteSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
        </div>

        <div className={`bg-white transition-all duration-300 xl:hidden ${menuOpen ? "max-h-[calc(100dvh-110px)] overflow-y-auto border-t border-slate-100 opacity-100" : "max-h-0 overflow-hidden opacity-0"}`}>
          <nav className="mx-auto grid max-w-[1340px] gap-1 px-5 py-4" aria-label="Navegação mobile">
            {links.slice(0, 2).map((item) => <Link key={item.href} href={item.href} onClick={item.href === "/" ? handleHomeClick : () => setMenuOpen(false)} className="rounded-md px-4 py-3 text-sm font-bold transition-colors duration-300 hover:bg-slate-50 hover:text-[#3E1255]">{item.label}</Link>)}
            <div className="overflow-hidden rounded-md border border-slate-100">
              <div className="flex items-center">
                <Link href="/produto" onClick={() => { setMenuOpen(false); setMobileProductsOpen(false); }} className="min-w-0 flex-1 px-4 py-3 text-sm font-bold text-slate-900 transition-colors duration-300 hover:bg-slate-50 hover:text-[#3E1255]">Produtos</Link>
                <button type="button" onClick={() => setMobileProductsOpen((open) => !open)} aria-label={mobileProductsOpen ? "Recolher produtos" : "Expandir produtos"} aria-expanded={mobileProductsOpen} aria-controls="mobile-products-menu" className="grid h-11 w-12 shrink-0 place-items-center border-l border-slate-100 text-[#3E1255] transition-colors duration-300 hover:bg-[#F5EFF8]">
                  <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${mobileProductsOpen ? "rotate-180" : ""}`} />
                </button>
              </div>
              <div id="mobile-products-menu" className={`grid overflow-hidden bg-slate-50/70 transition-all duration-300 ${mobileProductsOpen ? "max-h-72 border-t border-slate-100 opacity-100" : "max-h-0 opacity-0"}`}>
                {featuredProducts.map((product) => (
                  <Link key={product.slug} href={`/produto/${product.slug}`} onClick={() => { setMenuOpen(false); setMobileProductsOpen(false); }} className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold transition-colors duration-300 hover:bg-white hover:text-[#3E1255]">
                    <span className="relative h-12 w-12 shrink-0"><Image src={product.images[0]} alt="" fill sizes="48px" className="object-contain" /></span>{product.name}
                  </Link>
                ))}
              </div>
            </div>
            {links.slice(2).map((item) => <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} className="rounded-md px-4 py-3 text-sm font-bold transition-colors duration-300 hover:bg-slate-50 hover:text-[#3E1255]">{item.label}</Link>)}
            <div className="overflow-hidden rounded-md border border-slate-100">
              <button type="button" onClick={() => setMobilePartnershipsOpen((open) => !open)} aria-expanded={mobilePartnershipsOpen} aria-controls="mobile-partnerships-menu" className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-bold text-slate-900 transition-colors duration-300 hover:bg-slate-50 hover:text-[#3E1255]">
                Parcerias <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${mobilePartnershipsOpen ? "rotate-180" : ""}`} />
              </button>
              <div id="mobile-partnerships-menu" className={`grid overflow-hidden bg-slate-50/70 transition-all duration-300 ${mobilePartnershipsOpen ? "max-h-32 border-t border-slate-100 opacity-100" : "max-h-0 opacity-0"}`}>
                {partnershipLinks.map((item) => <Link key={item.href} href={item.href} onClick={() => { setMenuOpen(false); setMobilePartnershipsOpen(false); }} className="px-4 py-3 text-sm font-bold transition-colors duration-300 hover:bg-white hover:text-[#3E1255]">{item.label}</Link>)}
              </div>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => { setMenuOpen(false); openUser(); }} className="flex items-center justify-center gap-2 rounded-md border border-[#3E1255] px-3 py-3 text-xs font-black text-[#3E1255]"><UserRound className="h-4 w-4" /> Minha conta</button>
              <button type="button" onClick={() => { setMenuOpen(false); openCart(); }} className="flex items-center justify-center gap-2 rounded-md bg-[#3E1255] px-3 py-3 text-xs font-black text-white"><ShoppingBag className="h-4 w-4" /> Carrinho ({itemCount})</button>
            </div>
          </nav>
        </div>
      </header>

      {cartOpen && (
        <div className="fixed inset-0 z-[80] grid place-items-center px-4 py-8">
          <button type="button" aria-label="Fechar carrinho" onClick={() => setCartOpen(false)} className="absolute inset-0 bg-[#123F55]/55 backdrop-blur-sm" />
          <section ref={cartDialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="cart-popup-title" className="reveal-up relative w-full max-w-lg overflow-hidden rounded-lg bg-white shadow-[0_28px_90px_rgba(18,63,85,.3)]">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#3E1255]">Seu pedido</p><h2 id="cart-popup-title" className="mt-1 text-2xl font-black text-[#123F55]">Carrinho <span className="text-base text-slate-400">({itemCount})</span></h2></div>
              <button type="button" onClick={() => setCartOpen(false)} aria-label="Fechar" className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-[#3E1255] transition-all duration-300 hover:scale-90 hover:bg-slate-200"><X className="h-5 w-5" /></button>
            </div>
            {items.length === 0 ? (
              <div className="px-8 py-12 text-center"><span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#F5EFF8] text-[#3E1255]"><ShoppingBag className="h-7 w-7" /></span><h3 className="mt-5 text-xl font-black text-[#123F55]">Sua sacola está vazia</h3><p className="mt-2 text-sm text-slate-500">Escolha uma nutrição especial para o seu pet.</p><Link href="/produto" onClick={() => setCartOpen(false)} className="mt-6 inline-flex items-center gap-2 text-sm font-black text-[#3E1255]">Ver produtos <ArrowRight className="h-4 w-4" /></Link></div>
            ) : (
              <>
                <div className="max-h-[340px] divide-y divide-slate-100 overflow-y-auto px-6">
                  {items.map(({ product, quantity }) => (
                    <div key={product.slug} className="grid grid-cols-[74px_1fr_auto] items-center gap-4 py-4">
                      <div className="relative h-20"><Image src={product.images[0]} alt={product.name} fill sizes="74px" className="object-contain" /></div>
                      <div><p className="text-xs font-black leading-4 text-[#123F55]">{product.name}</p><p className="mt-1 text-[11px] text-slate-500">{quantity} × {product.price}</p></div>
                      <strong className="text-sm font-black text-[#3E1255]">{formatCurrency(product.priceValue * quantity)}</strong>
                    </div>
                  ))}
                </div>
                <div className="bg-slate-50 px-6 py-5">
                  <div className="flex items-center justify-between"><span className="text-sm font-bold text-slate-500">Subtotal</span><strong className="text-xl font-black text-[#123F55]">{formatCurrency(subtotal)}</strong></div>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <Link href="/carrinho" onClick={() => setCartOpen(false)} className="flex h-12 items-center justify-center rounded-full border-2 border-[#3E1255] text-xs font-black text-[#3E1255] transition-all duration-300 hover:scale-[0.97] hover:bg-white active:scale-95">Ver carrinho</Link>
                    <Link href="/checkout" onClick={() => setCartOpen(false)} className="group flex h-12 items-center justify-center gap-2 rounded-full bg-[#FE8C05] text-xs font-black text-white transition-all duration-300 hover:scale-[0.97] hover:bg-[#CC632B] active:scale-95">Finalizar compra <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-2" /></Link>
                  </div>
                </div>
              </>
            )}
          </section>
        </div>
      )}

      {userOpen && (
        <div className="fixed inset-0 z-[80] grid place-items-center px-4 py-8">
          <button type="button" aria-label="Fechar acesso à conta" onClick={() => setUserOpen(false)} className="absolute inset-0 bg-[#123F55]/55 backdrop-blur-sm" />
          <section ref={userDialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="user-popup-title" className="reveal-up relative w-full max-w-md overflow-hidden rounded-lg bg-white shadow-[0_28px_90px_rgba(18,63,85,.3)]">
            <button type="button" onClick={() => setUserOpen(false)} aria-label="Fechar" className="absolute right-5 top-5 z-10 grid h-10 w-10 place-items-center rounded-full bg-white/80 text-[#3E1255] transition-all duration-300 hover:scale-90 hover:bg-white"><X className="h-5 w-5" /></button>
            <div className="relative overflow-hidden bg-[#F5EFF8] px-7 py-8"><CircleUserRound className="h-12 w-12 text-[#3E1255]" /><p className="mt-5 text-[10px] font-black uppercase tracking-[0.18em] text-[#3E1255]">Área do cliente</p><h2 id="user-popup-title" className="mt-1 text-3xl font-black text-[#123F55]">Olá, que bom ter você aqui.</h2></div>
            <div className="p-7"><p className="text-sm leading-6 text-slate-500">Entre para acompanhar pedidos, atualizar seus dados e agilizar suas próximas compras.</p><Link href="/conta" onClick={() => setUserOpen(false)} className="group mt-6 flex h-12 items-center justify-center gap-2 rounded-full bg-[#FE8C05] text-sm font-black text-white transition-all duration-300 hover:scale-[0.98] hover:bg-[#CC632B] active:scale-95">Acessar minha conta <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-2" /></Link><Link href="/minha-conta#pedidos" onClick={() => setUserOpen(false)} className="mt-3 flex h-12 items-center justify-center gap-2 rounded-full border-2 border-[#3E1255] text-sm font-black text-[#3E1255] transition-colors duration-300 hover:bg-[#F5EFF8]"><PackageCheck className="h-4 w-4" /> Ver meus pedidos</Link></div>
          </section>
        </div>
      )}
    </>
  );
}
