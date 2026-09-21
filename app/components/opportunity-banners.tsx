import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeDollarSign,
  BarChart3,
  CalendarDays,
  Gift,
  Heart,
  PawPrint,
  Percent,
  Truck,
  Users,
} from "lucide-react";
import clubPets from "../../fotos-extras/card-01.png";
import affiliateCat from "../../fotos-extras/card-02.png";

export function OpportunityBanners({
  id = "oportunidades",
  className = "",
}: {
  id?: string;
  className?: string;
}) {
  return (
    <section id={id} aria-label="Programas NutzenPet" className={`scroll-mt-28 bg-white px-5 py-12 sm:px-8 sm:py-16 ${className}`}>
      <div className="mx-auto grid min-w-0 max-w-[1380px] gap-6 xl:grid-cols-2">
        <article className="reveal-up group relative flex min-h-[560px] min-w-0 flex-col overflow-hidden rounded-lg border border-[#E7DAED] bg-[#F5EFF8] shadow-[0_18px_48px_rgba(62,18,85,.1)] transition-transform duration-300 hover:-translate-y-1 sm:min-h-[520px] md:min-h-[430px]">
          <span className="absolute -right-16 -top-24 h-52 w-64 rotate-12 rounded-[45%] bg-[#8A5AA0]" aria-hidden="true" />
          <span className="absolute left-[43%] top-8 h-52 w-52 rounded-full bg-white/65 blur-[1px]" aria-hidden="true" />
          <PawPrint className="absolute right-8 top-8 h-8 w-8 rotate-12 text-white/65" aria-hidden="true" />

          <div className="relative z-20 min-w-0 p-6 pb-0 sm:p-8 sm:pb-0 md:w-[62%] md:p-9">
            <div className="flex items-center gap-4">
              <span className="sonar sonar-active sonar-orange relative grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#FE8C05] text-white shadow-[0_10px_26px_rgba(254,140,5,.28)]"><CalendarDays className="relative z-10 h-5 w-5" /></span>
              <div><p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#3E1255]">Nutzen Club</p><p className="mt-1 text-[9px] font-bold uppercase tracking-[0.28em] text-[#8A5AA0]">Assinatura</p></div>
            </div>
            <h2 className="mt-6 max-w-md text-3xl font-black leading-[1.06] text-[#3E1255] sm:text-4xl">Cuidado programado, <span className="text-[#FE8C05]">mês após mês.</span></h2>
            <p className="mt-4 max-w-md text-sm leading-6 text-slate-600">Organize a recorrência, receba seus produtos favoritos e acompanhe tudo pela sua conta.</p>

            <div className="mt-6 grid max-w-md grid-cols-3 gap-2 border-y border-[#D9C7E3] py-4 sm:gap-3">
              {[[Truck, "Entrega programada"], [Percent, "Condições exclusivas"], [Heart, "Mais saúde para o pet"]].map(([Icon, label]) => {
                const BenefitIcon = Icon as typeof Truck;
                return <div key={label as string} className="flex min-w-0 flex-col items-center gap-2 text-center text-[9px] font-bold leading-4 text-[#3E1255] sm:flex-row sm:text-left sm:text-[10px]"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white text-[#3E1255] shadow-sm"><BenefitIcon className="h-4 w-4" /></span><span className="max-w-[78px] break-words">{label as string}</span></div>;
              })}
            </div>
            <Link href="/nutzen-club" className="group/link mt-6 flex min-h-12 w-fit items-center gap-3 rounded-full bg-[#FE8C05] px-7 text-sm font-black text-white transition-colors duration-300 hover:bg-[#CC632B]">Conhecer o clube <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/link:translate-x-2" /></Link>
          </div>

          <div className="relative z-10 mt-auto h-[245px] w-full sm:h-[270px] md:absolute md:bottom-0 md:right-0 md:h-[80%] md:w-[58%]">
            <Image src={clubPets} alt="Cachorro e gato representando o Nutzen Club" fill quality={90} sizes="(max-width: 767px) 100vw, (max-width: 1279px) 58vw, 430px" className="object-contain object-bottom drop-shadow-[0_18px_20px_rgba(62,18,85,.2)] transition-transform duration-500 group-hover:scale-[1.02]" />
          </div>
        </article>

        <article className="reveal-up group relative flex min-h-[560px] min-w-0 flex-col overflow-hidden rounded-lg bg-[#3E1255] text-white shadow-[0_18px_48px_rgba(62,18,85,.18)] transition-transform duration-300 hover:-translate-y-1 sm:min-h-[520px] md:min-h-[430px]" style={{ animationDelay: "100ms" }}>
          <span className="absolute -bottom-24 right-[-35%] h-[58%] w-[130%] rounded-[48%] bg-[#FFD27A] md:-right-40 md:-top-28 md:bottom-auto md:h-[125%] md:w-[52%] md:rotate-6 xl:-right-24 xl:w-[58%]" aria-hidden="true" />
          <span className="absolute -bottom-20 right-[8%] h-[50%] w-[84%] rounded-[45%] bg-[#FFF1D2] md:bottom-auto md:right-[-5%] md:top-[6%] md:h-[78%] md:w-[40%] xl:right-[5%] xl:w-[44%]" aria-hidden="true" />
          <Heart className="absolute right-6 top-7 h-6 w-6 rotate-12 text-[#FE8C05]" aria-hidden="true" />

          <div className="relative z-20 min-w-0 p-6 pb-0 sm:p-8 sm:pb-0 md:w-[62%] md:p-9">
            <div className="flex items-center gap-4">
              <span className="sonar sonar-active sonar-orange relative grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#FE8C05] text-white shadow-[0_10px_26px_rgba(254,140,5,.25)]"><BadgeDollarSign className="relative z-10 h-5 w-5" /></span>
              <div><p className="text-[11px] font-black uppercase tracking-[0.2em] text-white">Programa de afiliados</p><p className="mt-1 text-[9px] font-bold uppercase tracking-[0.24em] text-[#D9C7E3]">Para amantes de pets</p></div>
            </div>
            <h2 className="mt-6 max-w-[270px] text-3xl font-black leading-[1.06] sm:max-w-md sm:text-4xl">Compartilhe cuidado. Cresça com a <span className="text-[#FE8C05]">NutzenPet.</span></h2>
            <p className="mt-4 max-w-[285px] text-sm leading-6 text-white/70 sm:max-w-md">Indique a marca, acompanhe resultados e receba comissões.</p>

            <div className="mt-6 grid max-w-md grid-cols-3 gap-2 border-y border-white/15 py-4 sm:gap-3">
              {[[Users, "Cadastro simples"], [BarChart3, "Acompanhe resultados"], [Gift, "Receba comissões"]].map(([Icon, label]) => {
                const BenefitIcon = Icon as typeof Users;
                return <div key={label as string} className="flex min-w-0 flex-col items-center gap-2 text-center text-[9px] font-bold leading-4 text-white/80 sm:flex-row sm:text-left sm:text-[10px]"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/10 text-white"><BenefitIcon className="h-4 w-4" /></span><span className="max-w-[78px] break-words">{label as string}</span></div>;
              })}
            </div>
            <Link href="/afiliados" className="group/link mt-6 flex min-h-12 w-fit items-center gap-3 rounded-full bg-[#FE8C05] px-7 text-sm font-black text-white transition-colors duration-300 hover:bg-[#CC632B]">Conhecer o programa <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/link:translate-x-2" /></Link>
          </div>

          <div className="relative z-10 mt-auto h-[245px] w-full sm:h-[270px] md:absolute md:bottom-0 md:right-0 md:h-[88%] md:w-[52%]">
            <Image src={affiliateCat} alt="Gato representando o programa de afiliados" fill quality={90} sizes="(max-width: 767px) 100vw, (max-width: 1279px) 52vw, 390px" className="object-contain object-bottom drop-shadow-[0_18px_20px_rgba(62,18,85,.22)] transition-transform duration-500 group-hover:scale-[1.02]" />
          </div>
        </article>
      </div>
    </section>
  );
}
