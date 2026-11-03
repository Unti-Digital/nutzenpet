"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { AlertCircle, CheckCircle2, KeyRound, LoaderCircle, LogIn, ShieldCheck } from "lucide-react";
import { FloatingMotifs } from "../../components/floating-motifs";
import { PasswordField } from "../../components/password-field";
import { SiteFooter } from "../../components/site-footer";
import { SiteHeader } from "../../components/site-header";

const fieldClass = "h-12 w-full rounded-md border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition-all duration-300 focus:border-[#3E1255] focus:bg-white focus:shadow-[0_0_0_3px_rgba(62,18,85,.1)] user-invalid:border-[#CC632B]";

export function ResetPasswordForm({ hasValidLink }: { hasValidLink: boolean }) {
  const [pending, setPending] = useState(false);
  const [complete, setComplete] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    window.history.replaceState(null, "", "/conta/redefinir-senha");
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    const confirmation = String(form.get("password_confirmation") ?? "");
    if (password !== confirmation) {
      setMessage("As senhas informadas não são iguais.");
      return;
    }

    setPending(true);
    const response = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const payload = await response.json().catch(() => null) as { message?: string } | null;
    setPending(false);
    if (!response.ok) {
      setMessage(payload?.message ?? "Não foi possível redefinir a senha.");
      return;
    }
    setComplete(true);
    setMessage(payload?.message ?? "Senha redefinida com sucesso.");
  }

  return (
    <main className="min-h-screen bg-[#fffef9]">
      <SiteHeader />
      <section className="relative overflow-hidden px-5 py-14 sm:px-8 sm:py-20">
        <FloatingMotifs className="opacity-35" />
        <div className="relative mx-auto max-w-[620px] overflow-hidden rounded-lg bg-white shadow-[0_22px_65px_rgba(18,63,85,.1)]">
          <div className="bg-[#3E1255] p-8 text-white sm:p-10">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-white/10 text-[#D9C7E3]"><KeyRound className="h-6 w-6" /></span>
            <p className="mt-7 text-[10px] font-black uppercase tracking-[0.18em] text-[#D9C7E3]">Segurança da conta</p>
            <h1 className="mt-3 text-3xl font-black">Crie uma nova senha</h1>
            <p className="mt-3 text-sm leading-6 text-white/70">Use pelo menos 10 caracteres. Ao concluir, suas sessões anteriores serão encerradas.</p>
          </div>

          <div className="p-8 sm:p-10">
            {complete ? (
              <div>
                <CheckCircle2 className="h-10 w-10 text-emerald-600" />
                <h2 className="mt-5 text-2xl font-black text-[#123F55]">Senha atualizada</h2>
                <p role="status" className="mt-3 text-sm leading-6 text-slate-600">{message}</p>
                <Link href="/conta" className="mt-7 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#FE8C05] text-sm font-black text-white hover:bg-[#CC632B]"><LogIn className="h-4 w-4" />Entrar com a nova senha</Link>
              </div>
            ) : !hasValidLink ? (
              <div>
                <AlertCircle className="h-10 w-10 text-[#CC632B]" />
                <h2 className="mt-5 text-2xl font-black text-[#123F55]">Link inválido</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">Solicite um novo link de recuperação para continuar.</p>
                <Link href="/conta" className="mt-7 flex h-12 w-full items-center justify-center rounded-full border-2 border-[#3E1255] text-sm font-black text-[#3E1255] hover:bg-[#F5EFF8]">Solicitar novo link</Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <label className="grid gap-2 text-xs font-bold text-slate-600">Nova senha<PasswordField name="password" minLength={10} autoComplete="new-password" required inputClassName={fieldClass} /></label>
                <label className="mt-4 grid gap-2 text-xs font-bold text-slate-600">Confirme a nova senha<PasswordField name="password_confirmation" minLength={10} autoComplete="new-password" required inputClassName={fieldClass} /></label>
                {message && <p role="alert" className="mt-5 rounded-md bg-orange-50 p-4 text-sm font-bold text-[#CC632B]">{message}</p>}
                <button type="submit" disabled={pending} className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#FE8C05] text-sm font-black text-white hover:bg-[#CC632B] disabled:opacity-50">{pending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}{pending ? "Atualizando..." : "Redefinir senha"}</button>
              </form>
            )}
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
