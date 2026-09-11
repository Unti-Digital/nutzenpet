import { ShieldCheck } from "lucide-react";
import { SiteFooter } from "../components/site-footer";
import { SiteHeader } from "../components/site-header";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#fffef9]">
      <SiteHeader />
      <section className="px-5 py-14 sm:px-8 sm:py-20">
        <article className="reveal-up mx-auto max-w-4xl">
          <ShieldCheck className="h-9 w-9 text-[#FE8C05]" />
          <p className="mt-6 text-xs font-black uppercase tracking-[0.2em] text-[#67952F]">Privacidade e transparência</p>
          <h1 className="mt-3 text-4xl font-black text-[#123F55] sm:text-5xl">Política de privacidade</h1>
          <div className="mt-10 grid gap-8 text-sm leading-7 text-slate-600">
            <section><h2 className="text-xl font-black text-[#124D55]">Dados coletados</h2><p className="mt-3">Utilizamos apenas as informações necessárias para atendimento, cadastro, processamento de pedidos e melhoria da experiência no site.</p></section>
            <section><h2 className="text-xl font-black text-[#124D55]">Uso das informações</h2><p className="mt-3">Os dados são tratados com segurança e não são comercializados. O acesso é restrito aos serviços envolvidos no atendimento e na operação da loja.</p></section>
            <section><h2 className="text-xl font-black text-[#124D55]">Seus direitos</h2><p className="mt-3">Você pode solicitar acesso, correção ou exclusão de seus dados pelos canais de contato disponíveis no rodapé.</p></section>
          </div>
        </article>
      </section>
      <SiteFooter />
    </main>
  );
}
