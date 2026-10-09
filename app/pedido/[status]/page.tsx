import Link from "next/link";
import { AlertCircle, CheckCircle2, Clock3 } from "lucide-react";
import { SiteFooter } from "../../components/site-footer";
import { SiteHeader } from "../../components/site-header";
import { MetaPurchase } from "../../components/meta-purchase";

type PaymentStatusPageProps = {
  params: Promise<{ status: string }>;
  searchParams: Promise<{ pedido?: string; valor?: string }>;
};

const statusContent = {
  aprovado: {
    icon: CheckCircle2,
    eyebrow: "Pagamento aprovado",
    title: "Pedido recebido com sucesso!",
    description: "Seu pagamento foi confirmado. Você receberá as atualizações do pedido no e-mail informado durante a compra.",
    color: "text-emerald-600",
    background: "bg-emerald-50",
  },
  pendente: {
    icon: Clock3,
    eyebrow: "Pagamento em análise",
    title: "Recebemos o seu pedido",
    description: "O Mercado Pago ainda está processando o pagamento. Assim que houver confirmação, o pedido será atualizado automaticamente.",
    color: "text-[#FE8C05]",
    background: "bg-orange-50",
  },
  falhou: {
    icon: AlertCircle,
    eyebrow: "Pagamento não concluído",
    title: "Não foi possível concluir o pagamento",
    description: "Seu carrinho continua disponível. Volte ao checkout para conferir os dados e tentar novamente.",
    color: "text-[#CC632B]",
    background: "bg-orange-50",
  },
} as const;

export default async function PaymentStatusPage({ params, searchParams }: PaymentStatusPageProps) {
  const { status } = await params;
  const { pedido = "", valor = "" } = await searchParams;
  const content = statusContent[status as keyof typeof statusContent] ?? statusContent.pendente;
  const StatusIcon = content.icon;

  return (
    <main className="min-h-screen bg-slate-50">
      {status === "aprovado" && <MetaPurchase orderId={pedido} value={valor} />}
      <SiteHeader />
      <section className="px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-2xl rounded-xl bg-white p-8 text-center shadow-[0_20px_60px_rgba(18,63,85,.1)] sm:p-12">
          <span className={`mx-auto grid h-20 w-20 place-items-center rounded-full ${content.background}`}>
            <StatusIcon className={`h-10 w-10 ${content.color}`} />
          </span>
          <p className={`mt-7 text-xs font-black uppercase tracking-[0.2em] ${content.color}`}>{content.eyebrow}</p>
          <h1 className="mt-3 text-3xl font-black text-[#123F55] sm:text-4xl">{content.title}</h1>
          <p className="mx-auto mt-5 max-w-lg text-sm leading-7 text-slate-600">{content.description}</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            {status === "falhou" && <Link href="/checkout" className="inline-flex h-12 items-center justify-center rounded-full bg-[#FE8C05] px-7 text-sm font-black text-white hover:bg-[#CC632B]">Tentar novamente</Link>}
            <Link href="/minha-conta" className="inline-flex h-12 items-center justify-center rounded-full bg-[#3E1255] px-7 text-sm font-black text-white hover:bg-[#123F55]">Acompanhar pedidos</Link>
            <Link href="/" className="inline-flex h-12 items-center justify-center rounded-full border-2 border-[#3E1255] px-7 text-sm font-black text-[#3E1255] hover:bg-[#F5EFF8]">Voltar ao início</Link>
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
