import Image from "next/image";
import { PawPrint } from "lucide-react";
import { BrandButton } from "./components/brand-button";
import { FloatingMotifs } from "./components/floating-motifs";
import { SiteFooter } from "./components/site-footer";
import { SiteHeader } from "./components/site-header";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col bg-[#fffef9]">
      <SiteHeader />

      <section className="relative flex flex-1 items-center overflow-hidden px-5 py-12 sm:px-8 sm:py-16">
        <FloatingMotifs className="opacity-45" />
        <div className="relative mx-auto grid w-full max-w-[1240px] items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="reveal-up relative z-10 text-center lg:text-left">
            <p className="flex items-center justify-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-[#3E1255] lg:justify-start">
              <PawPrint className="h-4 w-4" /> Página não encontrada
            </p>
            <p className="mt-3 text-7xl font-black leading-none text-[#FE8C05] sm:text-8xl" aria-hidden="true">404</p>
            <h1 className="mx-auto mt-4 max-w-xl text-4xl font-black leading-tight text-[#123F55] sm:text-5xl lg:mx-0">
              Essa página saiu para passear.
            </h1>
            <p className="mx-auto mt-5 max-w-lg text-sm leading-7 text-slate-600 lg:mx-0">
              O endereço pode ter mudado ou não está disponível. Escolha um caminho para continuar cuidando de quem faz parte da família.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
              <BrandButton href="/" variant="teal">Voltar para a Home</BrandButton>
              <BrandButton href="/produto" variant="orange">Explorar produtos</BrandButton>
            </div>
          </div>

          <div className="reveal-up relative mx-auto h-[330px] w-full max-w-[620px] sm:h-[440px] lg:h-[520px]" style={{ animationDelay: "120ms" }}>
            <span className="absolute bottom-[5%] left-1/2 h-[82%] w-[78%] -translate-x-1/2 rounded-full bg-[#F1E8F5]" aria-hidden="true" />
            <span className="absolute bottom-[2%] left-1/2 h-4 w-[62%] -translate-x-1/2 rounded-[50%] bg-[#123F55]/10 blur-md" aria-hidden="true" />
            <Image
              src="/images/hero-pets-v3.png"
              alt="Cachorro e gato da NutzenPet"
              fill
              preload
              sizes="(max-width: 1024px) 90vw, 620px"
              className="relative object-contain object-bottom"
            />
            <span className="sonar sonar-orange absolute right-[8%] top-[12%] z-10 grid h-12 w-12 place-items-center rounded-full bg-[#FE8C05] text-white">
              <PawPrint className="relative z-10 h-5 w-5" />
            </span>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
