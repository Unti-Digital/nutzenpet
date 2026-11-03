"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { Heart, KeyRound, LockKeyhole, LogIn, Mail, PackageCheck, ShieldCheck, UserPlus, UserRound } from "lucide-react";
import { FloatingMotifs } from "../components/floating-motifs";
import { SiteFooter } from "../components/site-footer";
import { SiteHeader } from "../components/site-header";
import { PasswordField } from "../components/password-field";

const fieldClass = "h-12 rounded-md border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition-all duration-300 focus:border-[#3E1255] focus:bg-white focus:shadow-[0_0_0_3px_rgba(62,18,85,.1)] user-invalid:border-[#CC632B]";

function getSafeReturnPath() {
  if (typeof window === "undefined") return "/minha-conta";
  return new URLSearchParams(window.location.search).get("retorno") === "/checkout" ? "/checkout" : "/minha-conta";
}

export default function AccountPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register" | "recover">("login");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"success" | "error">("error");
  const [returningToCheckout, setReturningToCheckout] = useState(false);

  useEffect(() => {
    const modeFrame = window.requestAnimationFrame(() => {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get("modo") === "cadastro") setMode("register");
      setReturningToCheckout(searchParams.get("retorno") === "/checkout");
    });
    const controller = new AbortController();
    void fetch("/api/auth/me", { cache: "no-store", signal: controller.signal })
      .then((response) => {
        if (response.ok) router.replace(getSafeReturnPath());
      })
      .catch(() => undefined);
    return () => {
      window.cancelAnimationFrame(modeFrame);
      controller.abort();
    };
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage(null);
    const form = new FormData(event.currentTarget);
    const action = mode === "recover" ? "forgot-password" : mode;
    const response = await fetch(`/api/auth/${action}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.get("name"), email: form.get("email"), password: form.get("password") }),
    });
    const payload = await response.json().catch(() => null) as { message?: string; user?: { name?: string } } | null;
    setPending(false);
    if (!response.ok) {
      setMessageType("error");
      setMessage(payload?.message ?? "Não foi possível acessar sua conta.");
      return;
    }
    if (mode === "recover") {
      setMessageType("success");
      setMessage(payload?.message ?? "Se existir uma conta com esse e-mail, enviaremos as instruções de recuperação.");
      return;
    }
    router.push(getSafeReturnPath());
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-[#fffef9]">
      <SiteHeader />
      <section className="relative overflow-hidden px-5 py-14 sm:px-8 sm:py-20"><FloatingMotifs className="opacity-35" /><div className="relative mx-auto grid max-w-[1080px] overflow-hidden rounded-lg bg-white shadow-[0_22px_65px_rgba(18,63,85,.1)] lg:grid-cols-[0.86fr_1.14fr]">
        <div className="relative flex min-h-[390px] flex-col justify-between overflow-hidden bg-[#3E1255] p-8 text-white sm:p-10"><FloatingMotifs className="text-[#D9C7E3] opacity-35" /><div className="relative"><span className="grid h-12 w-12 place-items-center rounded-full bg-white/10 text-[#D9C7E3]"><UserRound className="h-6 w-6" /></span><p className="mt-8 text-[10px] font-black uppercase tracking-[0.18em] text-[#D9C7E3]">Área do cliente</p><h1 className="mt-3 text-4xl font-black leading-tight">Tudo do seu pet em um só lugar.</h1></div><div className="relative mt-8 grid gap-4 text-sm text-white/75"><span className="flex items-center gap-3"><PackageCheck className="h-5 w-5 text-[#FE8C05]" /> Acompanhe seus pedidos</span><span className="flex items-center gap-3"><Heart className="h-5 w-5 text-[#FE8C05]" /> Gerencie suas assinaturas</span><span className="flex items-center gap-3"><ShieldCheck className="h-5 w-5 text-[#FE8C05]" /> Mantenha seus dados protegidos</span></div></div>
        <form onSubmit={handleSubmit} className="reveal-up p-8 sm:p-10">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#3E1255]">{mode === "login" ? "Bem-vindo de volta" : mode === "register" ? "Novo cliente" : "Recuperação de acesso"}</p>
          <h2 className="mt-3 text-3xl font-black text-[#123F55]">{mode === "login" ? "Acesse sua conta" : mode === "register" ? "Crie sua conta" : "Esqueceu sua senha?"}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">{mode === "recover" ? "Informe seu e-mail para receber um link seguro de redefinição." : "Consulte pedidos, endereços, assinaturas e indicações."}</p>
          {returningToCheckout && mode !== "recover" && <p className="mt-3 rounded-md bg-[#F5EFF8] p-3 text-sm font-bold text-[#3E1255]">Entre ou crie sua conta para finalizar a compra.</p>}
          {mode === "register" && <label className="mt-7 grid gap-2 text-xs font-bold text-slate-600">Nome completo<input name="name" autoComplete="name" required className={fieldClass} /></label>}
          <label className={`${mode === "login" ? "mt-7" : "mt-4"} grid gap-2 text-xs font-bold text-slate-600`}>E-mail<input name="email" type="email" autoComplete="email" required className={fieldClass} /></label>
          {mode !== "recover" && <label className="mt-4 grid gap-2 text-xs font-bold text-slate-600">Senha<PasswordField name="password" minLength={mode === "register" ? 10 : undefined} autoComplete={mode === "login" ? "current-password" : "new-password"} required inputClassName={`${fieldClass} w-full`} /></label>}
          {mode === "login" && <button type="button" onClick={() => { setMode("recover"); setMessage(null); }} className="mt-3 flex items-center gap-2 text-xs font-black text-[#3E1255] hover:text-[#FE8C05]"><KeyRound className="h-3.5 w-3.5" />Esqueci minha senha</button>}
          {message && <p role={messageType === "error" ? "alert" : "status"} className={`mt-5 rounded-md p-4 text-sm font-bold ${messageType === "error" ? "bg-orange-50 text-[#CC632B]" : "bg-[#F5EFF8] text-[#3E1255]"}`}>{message}</p>}
          <button type="submit" disabled={pending} className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#FE8C05] text-sm font-black text-white transition-colors duration-300 hover:bg-[#CC632B] disabled:opacity-50">{mode === "login" ? <LogIn className="h-4 w-4" /> : mode === "register" ? <UserPlus className="h-4 w-4" /> : <Mail className="h-4 w-4" />}{pending ? "Aguarde..." : mode === "login" ? "Entrar" : mode === "register" ? "Criar conta" : "Enviar link de recuperação"}</button>
          <div className="my-6 flex items-center gap-3 text-[10px] uppercase tracking-[0.16em] text-slate-400"><span className="h-px flex-1 bg-slate-200" /> ou <span className="h-px flex-1 bg-slate-200" /></div>
          <button type="button" onClick={() => { setMode((current) => current === "login" ? "register" : "login"); setMessage(null); setMessageType("error"); }} className="flex h-12 w-full items-center justify-center gap-2 rounded-full border-2 border-[#3E1255] text-sm font-black text-[#3E1255] transition-colors duration-300 hover:bg-[#F5EFF8]">{mode === "login" ? <><UserPlus className="h-4 w-4" /> Criar nova conta</> : <><LogIn className="h-4 w-4" /> {mode === "recover" ? "Voltar ao login" : "Já tenho uma conta"}</>}</button>
          <p className="mt-5 flex items-center justify-center gap-2 text-[10px] text-slate-400"><LockKeyhole className="h-3.5 w-3.5" /> Sessão protegida em cookie HttpOnly</p>
        </form>
      </div></section>
      <SiteFooter />
    </main>
  );
}
