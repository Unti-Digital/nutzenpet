"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowRight,
  ChevronDown,
  CircleUserRound,
  Menu,
  PackageCheck,
  Search,
  ShoppingBag,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useState, type MouseEvent } from "react";
import { formatCurrency, useCart } from "./cart-provider";
import { SiteSearch } from "./site-search";
import { products } from "../data/products";

const links = [
  { label: "Início", href: "/" },
  { label: "Sobre", href: "/sobre" },
  { label: "Blog", href: "/blog" },
  { label: "Contato", href: "/contato" },
  { label: "Seja um representante", href: "/contato#representante" },
];

function NavUnderline() {
  return <span className="absolute inset-x-0 -bottom-2 h-0.5 origin-left scale-x-0 bg-[#FE8C05] transition-transform duration-300 group-hover/navitem:scale-x-100" />;
}

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileProductsOpen, setMobileProductsOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();
  const { items, itemCount, subtotal } = useCart();
  const modalOpen = cartOpen || userOpen;

  useEffect(() => {
    if (!modalOpen) return;
    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setCartOpen(false);
        setUserOpen(false);
      }
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [modalOpen]);

  const openCart = () => {
    setMenuOpen(false);
    setMobileProductsOpen(false);
    setUserOpen(false);
    setCartOpen(true);
  };

  const openUser = () => {
    setMenuOpen(false);
    setMobileProductsOpen(false);
    setCartOpen(false);
    setUserOpen(true);
  };

  const openSearch = () => {
    setMenuOpen(false);
    setMobileProductsOpen(false);
    setSearchOpen(true);
  };

  const handleHomeClick = (event: MouseEvent<HTMLAnchorElement>) => {
    setMenuOpen(false);
    setMobileProductsOpen(false);
    if (pathname !== "/") return;

    event.preventDefault();
    setSearchOpen(false);
    window.history.replaceState(null, "", "/");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <header className="sticky top-0 z-50 overflow-x-clip border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
        <div className="relative mx-auto flex h-[82px] max-w-[1340px] items-center justify-between px-5 sm:px-8">
          <Link href="/" onClick={handleHomeClick} aria-label="NutzenPet - início" className="shrink-0">
            <Image src="/logo/logo.png" alt="NutzenPet" width={220} height={79} preload className="h-10 w-auto object-contain sm:h-11" />
          </Link>

          <nav className="hidden items-center gap-6 lg:flex" aria-label="Navegação principal">
            {links.slice(0, 2).map((item) => (
              <Link key={item.href} href={item.href} onClick={item.href === "/" ? handleHomeClick : undefined} className={`group/navitem relative text-sm font-bold transition-colors duration-300 hover:text-[#124D55] ${pathname === item.href ? "text-[#124D55]" : "text-slate-900"}`}>
                {item.label}<NavUnderline />
              </Link>
            ))}

            <div className="group/products relative py-7">
              <Link href="/produto" className={`group/navitem relative flex items-center gap-1 text-sm font-bold transition-colors duration-300 hover:text-[#124D55] ${pathname.startsWith("/produto") ? "text-[#124D55]" : "text-slate-900"}`}>
                Produtos <ChevronDown className="h-3.5 w-3.5 transition-transform duration-300 group-hover/products:rotate-180" /><NavUnderline />
              </Link>
              <div className="pointer-events-none absolute left-1/2 top-[70px] w-[380px] -translate-x-1/2 translate-y-2 rounded-lg bg-white p-2 opacity-0 shadow-[0_18px_50px_rgba(18,63,85,.16)] transition-all duration-300 group-hover/products:pointer-events-auto group-hover/products:translate-y-0 group-hover/products:opacity-100">
                {products.map((product) => (
                  <Link key={product.slug} href={`/produto/${product.slug}`} className="group/subitem flex min-h-20 items-center gap-4 rounded-md px-3 py-2 transition-colors duration-300 hover:bg-slate-50">
                    <span className="relative h-16 w-16 shrink-0"><Image src={product.images[0]} alt="" fill sizes="64px" className="object-contain" /></span>
                    <span className="text-sm font-black leading-5 text-slate-700 transition-colors duration-300 group-hover/subitem:text-[#124D55]">{product.name}</span>
                  </Link>
                ))}
              </div>
            </div>

            {links.slice(2).map((item) => (
              <Link key={item.href} href={item.href} className={`group/navitem relative text-sm font-bold transition-colors duration-300 hover:text-[#124D55] ${pathname === item.href ? "text-[#124D55]" : "text-slate-900"}`}>
                {item.label}<NavUnderline />
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-1 lg:flex">
            <button type="button" onClick={openSearch} aria-label="Abrir busca" className="grid h-10 w-10 place-items-center rounded-full text-slate-800 transition-all duration-300 hover:scale-90 hover:bg-slate-100 hover:text-[#FE8C05]"><Search className="h-5 w-5" /></button>
            <button type="button" onClick={openUser} aria-label="Minha conta" className="grid h-10 w-10 place-items-center rounded-full text-slate-800 transition-all duration-300 hover:scale-90 hover:bg-slate-100 hover:text-[#FE8C05]"><UserRound className="h-5 w-5" /></button>
            <button type="button" onClick={openCart} aria-label="Abrir carrinho" className="relative grid h-10 w-10 place-items-center rounded-full text-slate-800 transition-all duration-300 hover:scale-90 hover:bg-slate-100 hover:text-[#FE8C05]">
              <ShoppingBag className="h-5 w-5" />
              {itemCount > 0 && <span className="absolute right-0 top-0 grid h-4 min-w-4 place-items-center rounded-full bg-[#FE8C05] px-1 text-[9px] font-black text-white">{itemCount}</span>}
            </button>
          </div>

          <div className="flex items-center gap-0.5 lg:hidden">
            <button type="button" onClick={openSearch} aria-label="Abrir busca" className="grid h-10 w-10 place-items-center rounded-full text-[#124D55] transition-all duration-300 hover:scale-90 hover:bg-slate-100"><Search className="h-5 w-5" /></button>
            <button type="button" onClick={openUser} aria-label="Minha conta" className="hidden h-10 w-10 place-items-center rounded-full text-[#124D55] transition-all duration-300 hover:scale-90 hover:bg-slate-100 sm:grid"><UserRound className="h-5 w-5" /></button>
            <button type="button" onClick={openCart} aria-label="Abrir carrinho" className="relative grid h-10 w-10 place-items-center rounded-full text-[#124D55] transition-all duration-300 hover:scale-90 hover:bg-slate-100">
              <ShoppingBag className="h-5 w-5" />
              {itemCount > 0 && <span className="absolute right-0 top-0 grid h-4 min-w-4 place-items-center rounded-full bg-[#FE8C05] px-1 text-[9px] font-black text-white">{itemCount}</span>}
            </button>
            <button type="button" aria-label={menuOpen ? "Fechar menu" : "Abrir menu"} aria-expanded={menuOpen} onClick={() => { setMenuOpen((open) => !open); if (menuOpen) setMobileProductsOpen(false); }} className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-[#124D55] transition-all duration-300 hover:scale-90 hover:bg-slate-200">{menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
          </div>

          <SiteSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
        </div>

        <div className={`bg-white transition-all duration-300 lg:hidden ${menuOpen ? "max-h-[calc(100dvh-82px)] overflow-y-auto border-t border-slate-100 opacity-100" : "max-h-0 overflow-hidden opacity-0"}`}>
          <nav className="mx-auto grid max-w-[1340px] gap-1 px-5 py-4" aria-label="Navegação mobile">
            {links.slice(0, 2).map((item) => <Link key={item.href} href={item.href} onClick={item.href === "/" ? handleHomeClick : () => setMenuOpen(false)} className="rounded-md px-4 py-3 text-sm font-bold transition-colors duration-300 hover:bg-slate-50 hover:text-[#124D55]">{item.label}</Link>)}
            <div className="overflow-hidden rounded-md border border-slate-100">
              <div className="flex items-center">
                <Link href="/produto" onClick={() => { setMenuOpen(false); setMobileProductsOpen(false); }} className="min-w-0 flex-1 px-4 py-3 text-sm font-bold text-slate-900 transition-colors duration-300 hover:bg-slate-50 hover:text-[#124D55]">Produtos</Link>
                <button type="button" onClick={() => setMobileProductsOpen((open) => !open)} aria-label={mobileProductsOpen ? "Recolher produtos" : "Expandir produtos"} aria-expanded={mobileProductsOpen} aria-controls="mobile-products-menu" className="grid h-11 w-12 shrink-0 place-items-center border-l border-slate-100 text-[#124D55] transition-colors duration-300 hover:bg-[#F1F6E7]">
                  <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${mobileProductsOpen ? "rotate-180" : ""}`} />
                </button>
              </div>
              <div id="mobile-products-menu" className={`grid overflow-hidden bg-slate-50/70 transition-all duration-300 ${mobileProductsOpen ? "max-h-72 border-t border-slate-100 opacity-100" : "max-h-0 opacity-0"}`}>
                {products.map((product) => (
                  <Link key={product.slug} href={`/produto/${product.slug}`} onClick={() => { setMenuOpen(false); setMobileProductsOpen(false); }} className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold transition-colors duration-300 hover:bg-white hover:text-[#124D55]">
                    <span className="relative h-12 w-12 shrink-0"><Image src={product.images[0]} alt="" fill sizes="48px" className="object-contain" /></span>{product.name}
                  </Link>
                ))}
              </div>
            </div>
            {links.slice(2).map((item) => <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} className="rounded-md px-4 py-3 text-sm font-bold transition-colors duration-300 hover:bg-slate-50 hover:text-[#124D55]">{item.label}</Link>)}
            <div className="mt-2 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => { setMenuOpen(false); openUser(); }} className="flex items-center justify-center gap-2 rounded-md border border-[#124D55] px-3 py-3 text-xs font-black text-[#124D55]"><UserRound className="h-4 w-4" /> Minha conta</button>
              <button type="button" onClick={() => { setMenuOpen(false); openCart(); }} className="flex items-center justify-center gap-2 rounded-md bg-[#124D55] px-3 py-3 text-xs font-black text-white"><ShoppingBag className="h-4 w-4" /> Carrinho ({itemCount})</button>
            </div>
          </nav>
        </div>
      </header>

      {cartOpen && (
        <div className="fixed inset-0 z-[80] grid place-items-center px-4 py-8">
          <button type="button" aria-label="Fechar carrinho" onClick={() => setCartOpen(false)} className="absolute inset-0 bg-[#123F55]/55 backdrop-blur-sm" />
          <section role="dialog" aria-modal="true" aria-labelledby="cart-popup-title" className="reveal-up relative w-full max-w-lg overflow-hidden rounded-lg bg-white shadow-[0_28px_90px_rgba(18,63,85,.3)]">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#67952F]">Seu pedido</p><h2 id="cart-popup-title" className="mt-1 text-2xl font-black text-[#123F55]">Carrinho <span className="text-base text-slate-400">({itemCount})</span></h2></div>
              <button type="button" onClick={() => setCartOpen(false)} aria-label="Fechar" className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-[#124D55] transition-all duration-300 hover:scale-90 hover:bg-slate-200"><X className="h-5 w-5" /></button>
            </div>
            {items.length === 0 ? (
              <div className="px-8 py-12 text-center"><span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#F1F6E7] text-[#67952F]"><ShoppingBag className="h-7 w-7" /></span><h3 className="mt-5 text-xl font-black text-[#123F55]">Sua sacola está vazia</h3><p className="mt-2 text-sm text-slate-500">Escolha uma nutrição especial para o seu pet.</p><Link href="/produto" onClick={() => setCartOpen(false)} className="mt-6 inline-flex items-center gap-2 text-sm font-black text-[#124D55]">Ver produtos <ArrowRight className="h-4 w-4" /></Link></div>
            ) : (
              <>
                <div className="max-h-[340px] divide-y divide-slate-100 overflow-y-auto px-6">
                  {items.map(({ product, quantity }) => (
                    <div key={product.slug} className="grid grid-cols-[74px_1fr_auto] items-center gap-4 py-4">
                      <div className="relative h-20"><Image src={product.images[0]} alt={product.name} fill sizes="74px" className="object-contain" /></div>
                      <div><p className="text-xs font-black leading-4 text-[#123F55]">{product.name}</p><p className="mt-1 text-[11px] text-slate-500">{quantity} × {product.price}</p></div>
                      <strong className="text-sm font-black text-[#124D55]">{formatCurrency(product.priceValue * quantity)}</strong>
                    </div>
                  ))}
                </div>
                <div className="bg-slate-50 px-6 py-5">
                  <div className="flex items-center justify-between"><span className="text-sm font-bold text-slate-500">Subtotal</span><strong className="text-xl font-black text-[#123F55]">{formatCurrency(subtotal)}</strong></div>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <Link href="/carrinho" onClick={() => setCartOpen(false)} className="flex h-12 items-center justify-center rounded-full border-2 border-[#124D55] text-xs font-black text-[#124D55] transition-all duration-300 hover:scale-[0.97] hover:bg-white active:scale-95">Ver carrinho</Link>
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
          <section role="dialog" aria-modal="true" aria-labelledby="user-popup-title" className="reveal-up relative w-full max-w-md overflow-hidden rounded-lg bg-white shadow-[0_28px_90px_rgba(18,63,85,.3)]">
            <button type="button" onClick={() => setUserOpen(false)} aria-label="Fechar" className="absolute right-5 top-5 z-10 grid h-10 w-10 place-items-center rounded-full bg-white/80 text-[#124D55] transition-all duration-300 hover:scale-90 hover:bg-white"><X className="h-5 w-5" /></button>
            <div className="relative overflow-hidden bg-[#F1F6E7] px-7 py-8"><CircleUserRound className="h-12 w-12 text-[#67952F]" /><p className="mt-5 text-[10px] font-black uppercase tracking-[0.18em] text-[#67952F]">Área do cliente</p><h2 id="user-popup-title" className="mt-1 text-3xl font-black text-[#123F55]">Olá, que bom ter você aqui.</h2></div>
            <div className="p-7"><p className="text-sm leading-6 text-slate-500">Entre para acompanhar pedidos, atualizar seus dados e agilizar suas próximas compras.</p><Link href="/conta" onClick={() => setUserOpen(false)} className="group mt-6 flex h-12 items-center justify-center gap-2 rounded-full bg-[#FE8C05] text-sm font-black text-white transition-all duration-300 hover:scale-[0.98] hover:bg-[#CC632B] active:scale-95">Acessar minha conta <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-2" /></Link><Link href="/minha-conta#pedidos" onClick={() => setUserOpen(false)} className="mt-3 flex h-12 items-center justify-center gap-2 rounded-full border-2 border-[#124D55] text-sm font-black text-[#124D55] transition-colors duration-300 hover:bg-[#F1F6E7]"><PackageCheck className="h-4 w-4" /> Ver meus pedidos</Link></div>
          </section>
        </div>
      )}
    </>
  );
}
