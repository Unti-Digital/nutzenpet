"use client";

import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Compass, FileText, PackageSearch, Search, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { contactDetails } from "../data/contact";
import { posts } from "../data/posts";
import { products } from "../data/products";

type SearchCategory = "Produtos" | "Conteúdos" | "Páginas";

type SearchResult = {
  id: string;
  category: SearchCategory;
  title: string;
  description: string;
  href: string;
  keywords: string;
  image?: string | StaticImageData;
};

const pageResults: SearchResult[] = [
  { id: "page-products", category: "Páginas", title: "Todos os produtos", description: "Conheça todas as linhas NutzenPet.", href: "/produto", keywords: "produtos racao alimentacao catalogo linhas comprar" },
  { id: "page-about", category: "Páginas", title: "Sobre a NutzenPet", description: "Nossa essência, história e diferenciais.", href: "/sobre", keywords: "sobre historia empresa essencia diferenciais quem somos" },
  { id: "page-blog", category: "Páginas", title: "Conteúdos e Blog", description: "Informação para uma rotina mais saudável.", href: "/blog", keywords: "blog artigos dicas conteudos nutricao bem estar comportamento" },
  { id: "page-contact", category: "Páginas", title: "Fale com a NutzenPet", description: "Telefone, e-mail, WhatsApp e formulário de contato.", href: "/contato", keywords: `contato fale conosco sac telefone email e-mail whatsapp mensagem atendimento ajuda instagram ${contactDetails.phoneDisplay} ${contactDetails.email}` },
  { id: "page-representative", category: "Páginas", title: "Seja um representante", description: "Leve a qualidade NutzenPet para mais famílias.", href: "/contato#representante", keywords: "representante representacao revendedor distribuidor parceria comercial quero representar" },
  { id: "page-account", category: "Páginas", title: "Minha conta", description: "Acesse sua área de cliente.", href: "/conta", keywords: "minha conta cliente entrar login cadastro pedidos" },
  { id: "page-cart", category: "Páginas", title: "Carrinho", description: "Confira os produtos da sua compra.", href: "/carrinho", keywords: "carrinho sacola compra pedido remover quantidade" },
  { id: "page-checkout", category: "Páginas", title: "Finalizar compra", description: "Informe entrega e pagamento.", href: "/checkout", keywords: "checkout finalizar compra pagamento entrega endereco" },
];

const searchIndex: SearchResult[] = [
  ...products.map((product) => ({
    id: `product-${product.slug}`,
    category: "Produtos" as const,
    title: product.name,
    description: `${product.shortName} · ${product.weight}`,
    href: `/produto/${product.slug}`,
    keywords: [
      product.description,
      product.features.join(" "),
      product.ingredients,
      "produto produtos racao alimento alimentacao",
      product.species === "dog" ? "cao caes cachorro cachorros" : "gato gatos felino felinos castrado",
    ].join(" "),
    image: product.images[0],
  })),
  ...posts.map((post) => ({
    id: `post-${post.slug}`,
    category: "Conteúdos" as const,
    title: post.title,
    description: `${post.tag} · ${post.readingTime}`,
    href: `/blog/${post.slug}`,
    keywords: [post.tag, post.description, ...post.content.flatMap((section) => [section.heading, ...section.paragraphs])].join(" "),
    image: post.image,
  })),
  ...pageResults,
];

const categoryOrder: SearchCategory[] = ["Produtos", "Conteúdos", "Páginas"];

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function getScore(result: SearchResult, query: string) {
  const title = normalize(result.title);
  const searchable = normalize(`${result.title} ${result.description} ${result.keywords}`);
  const terms = query.split(/\s+/).filter(Boolean);

  if (!terms.every((term) => searchable.includes(term))) return -1;

  let score = terms.reduce((total, term) => total + (title.includes(term) ? 12 : 3), 0);
  if (title === query) score += 100;
  else if (title.startsWith(query)) score += 50;
  else if (title.includes(query)) score += 25;
  if (result.category === "Produtos") score += 2;
  return score;
}

export function SiteSearch({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const results = useMemo(() => {
    const normalizedQuery = normalize(query);
    if (!normalizedQuery) return [];

    return searchIndex
      .map((result) => ({ result, score: getScore(result, normalizedQuery) }))
      .filter(({ score }) => score >= 0)
      .sort((first, second) => second.score - first.score)
      .slice(0, 8)
      .map(({ result }) => result);
  }, [query]);

  const orderedResults = categoryOrder.flatMap((category) => results.filter((result) => result.category === category));
  const showResults = open && query.trim().length > 0;

  const closeSearch = useCallback(() => {
    setQuery("");
    setActiveIndex(0);
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeSearch();
    };
    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) closeSearch();
    };

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [closeSearch, open]);

  function navigateTo(result: SearchResult) {
    closeSearch();
    router.push(result.href);
  }

  function handleInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!orderedResults.length) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) => (current + 1) % orderedResults.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) => (current - 1 + orderedResults.length) % orderedResults.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      navigateTo(orderedResults[Math.min(activeIndex, orderedResults.length - 1)]);
    }
  }

  return (
    <div ref={containerRef} className={`absolute inset-y-0 right-5 z-40 flex items-center transition-all duration-500 sm:right-8 ${open ? "pointer-events-auto translate-x-0 opacity-100" : "pointer-events-none translate-x-12 opacity-0"}`} aria-hidden={!open}>
      <div className="relative">
        <form onSubmit={(event) => event.preventDefault()} role="search" className="flex h-12 w-[calc(100vw-40px)] items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-4 shadow-[0_10px_30px_rgba(18,63,85,.12)] sm:w-[460px]">
          <Search className="h-5 w-5 shrink-0 text-[#124D55]" />
          <label htmlFor="site-search" className="sr-only">Buscar no site</label>
          <input
            ref={inputRef}
            id="site-search"
            type="search"
            role="combobox"
            value={query}
            onChange={(event) => { setQuery(event.target.value); setActiveIndex(0); }}
            onKeyDown={handleInputKeyDown}
            placeholder="Buscar produtos, conteúdos e páginas"
            autoComplete="off"
            aria-expanded={showResults}
            aria-controls="site-search-results"
            aria-autocomplete="list"
            aria-activedescendant={orderedResults[activeIndex] ? `search-result-${orderedResults[activeIndex].id}` : undefined}
            className="min-w-0 flex-1 appearance-none bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
            tabIndex={open ? 0 : -1}
          />
          <button type="button" onClick={closeSearch} aria-label="Fechar busca" tabIndex={open ? 0 : -1} className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-slate-500 transition-all duration-300 hover:scale-90 hover:bg-white hover:text-[#FE8C05]"><X className="h-4 w-4" /></button>
        </form>

        {showResults && (
          <div id="site-search-results" role="listbox" aria-label="Resultados da busca" className="absolute right-0 top-[58px] max-h-[min(70vh,520px)] w-full overflow-y-auto rounded-lg border border-slate-100 bg-white p-2 shadow-[0_22px_65px_rgba(18,63,85,.2)]">
            {orderedResults.length > 0 ? categoryOrder.map((category) => {
              const categoryResults = orderedResults.filter((result) => result.category === category);
              if (!categoryResults.length) return null;

              return (
                <section key={category} aria-labelledby={`search-category-${category}`} className="py-1">
                  <h2 id={`search-category-${category}`} className="px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">{category}</h2>
                  {categoryResults.map((result) => {
                    const resultIndex = orderedResults.findIndex((item) => item.id === result.id);
                    const active = resultIndex === activeIndex;
                    const ResultIcon = result.category === "Produtos" ? PackageSearch : result.category === "Conteúdos" ? FileText : Compass;

                    return (
                      <Link
                        id={`search-result-${result.id}`}
                        key={result.id}
                        href={result.href}
                        role="option"
                        aria-selected={active}
                        onClick={closeSearch}
                        onMouseEnter={() => setActiveIndex(resultIndex)}
                        className={`flex items-center gap-3 rounded-md px-3 py-2.5 transition-colors duration-200 ${active ? "bg-[#F1F6E7]" : "hover:bg-slate-50"}`}
                      >
                        {result.image ? (
                          <span className={`relative h-12 w-12 shrink-0 overflow-hidden rounded-md ${result.category === "Produtos" ? "bg-white" : "bg-slate-100"}`}>
                            <Image src={result.image} alt="" fill sizes="48px" className={result.category === "Produtos" ? "object-contain p-1" : "object-cover"} />
                          </span>
                        ) : (
                          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-md bg-[#F1F6E7] text-[#67952F]"><ResultIcon className="h-5 w-5" /></span>
                        )}
                        <span className="min-w-0 flex-1">
                          <strong className="block truncate text-sm text-[#123F55]">{result.title}</strong>
                          <span className="mt-0.5 block truncate text-[11px] text-slate-500">{result.description}</span>
                        </span>
                      </Link>
                    );
                  })}
                </section>
              );
            }) : (
              <div className="px-5 py-8 text-center">
                <Search className="mx-auto h-7 w-7 text-slate-300" />
                <p className="mt-3 text-sm font-black text-[#123F55]">Nenhum resultado encontrado</p>
                <p className="mt-1 text-xs text-slate-500">Tente buscar por produto, assunto ou atendimento.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
