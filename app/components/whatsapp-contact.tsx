"use client";

import { ArrowRight, Mail, Phone, UserRound, X } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { contactDetails } from "../data/contact";
import { WhatsAppIcon } from "./whatsapp-icon";

const fieldClass = "h-11 w-full rounded-md border border-[#D9C7E3] bg-white px-4 text-sm text-slate-700 outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-[#3E1255] focus:shadow-[0_0_0_3px_rgba(62,18,85,.1)] user-invalid:border-[#CC632B]";

export function WhatsAppContact() {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    const trigger = triggerRef.current;
    const panel = panelRef.current;
    const focusableSelector = 'button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const focusableElements = panel ? Array.from(panel.querySelectorAll<HTMLElement>(focusableSelector)) : [];
    const focusFrame = window.requestAnimationFrame(() => nameRef.current?.focus());
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
      if (event.key !== "Tab" || focusableElements.length === 0) return;

      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      trigger?.focus();
    };
  }, [open]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const message = [
      "Olá! Vim pelo site da NutzenPet.",
      "",
      `Nome: ${form.get("name")}`,
      `Telefone: ${form.get("phone")}`,
      `E-mail: ${form.get("email")}`,
      `Motivo do contato: ${form.get("reason")}`,
    ].join("\n");
    const whatsappBase = contactDetails.whatsapp.split("?")[0];

    window.open(`${whatsappBase}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
    event.currentTarget.reset();
    setOpen(false);
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Iniciar atendimento pelo WhatsApp"
        aria-expanded={open}
        aria-controls="whatsapp-contact-dialog"
        title="Falar pelo WhatsApp"
        className="sonar sonar-active sonar-whatsapp fixed bottom-4 right-4 z-[70] grid h-12 w-12 place-items-center rounded-full bg-[#25D366] text-white transition-all duration-300 hover:scale-90 hover:bg-[#1FAD54] active:scale-95 sm:bottom-8 sm:right-8 sm:h-16 sm:w-16"
      >
        <WhatsAppIcon className="relative z-10 h-6 w-6 sm:h-8 sm:w-8" />
      </button>

      {open && (
        <>
          <button type="button" aria-label="Fechar atendimento" onClick={() => setOpen(false)} className="fixed inset-0 z-[80] bg-[#123F55]/45 backdrop-blur-[2px]" />
          <section
            ref={panelRef}
            id="whatsapp-contact-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="whatsapp-contact-title"
            tabIndex={-1}
            className="reveal-up fixed bottom-4 left-4 z-[90] max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-[390px] overflow-y-auto rounded-lg bg-white shadow-[0_28px_90px_rgba(18,63,85,.3)] sm:bottom-28 sm:left-auto sm:right-8"
          >
            <div className="relative overflow-hidden bg-[#3E1255] px-6 py-5 text-white">
              <button type="button" onClick={() => setOpen(false)} aria-label="Fechar" className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-white/10 transition-colors duration-300 hover:bg-white/20"><X className="h-4 w-4" /></button>
              <span className="grid h-11 w-11 place-items-center rounded-full bg-[#25D366] shadow-[0_8px_22px_rgba(37,211,102,.24)]"><WhatsAppIcon className="h-5 w-5" /></span>
              <div className="mt-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#D9C7E3]"><span className="h-2 w-2 rounded-full bg-[#25D366]" /> Atendimento NutzenPet</div>
              <h2 id="whatsapp-contact-title" className="mt-2 pr-10 text-2xl font-black">Olá! Como podemos ajudar?</h2>
              <p className="mt-2 text-xs leading-5 text-white/70">Preencha os dados abaixo para iniciarmos a conversa já com o contexto certo.</p>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-4 p-6">
              <label className="grid gap-2 text-xs font-bold text-slate-600">Nome
                <div className="relative"><UserRound className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input ref={nameRef} name="name" required autoComplete="name" placeholder="Como podemos chamar você?" className={`${fieldClass} pl-11`} /></div>
              </label>
              <label className="grid gap-2 text-xs font-bold text-slate-600">Telefone
                <div className="relative"><Phone className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input name="phone" required type="tel" autoComplete="tel" placeholder="(00) 00000-0000" className={`${fieldClass} pl-11`} /></div>
              </label>
              <label className="grid gap-2 text-xs font-bold text-slate-600">E-mail
                <div className="relative"><Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input name="email" required type="email" autoComplete="email" placeholder="seuemail@exemplo.com" className={`${fieldClass} pl-11`} /></div>
              </label>
              <label className="grid gap-2 text-xs font-bold text-slate-600">Motivo do contato
                <select name="reason" required defaultValue="" className={fieldClass}>
                  <option value="" disabled>Selecione uma opção</option>
                  <option>Produtos e alimentação</option>
                  <option>Pedido e entrega</option>
                  <option>Nutzen Club</option>
                  <option>Quero ser lojista parceiro</option>
                  <option>Programa de afiliados</option>
                  <option>Outro assunto</option>
                </select>
              </label>
              <button type="submit" className="group mt-1 flex h-12 items-center justify-center gap-3 rounded-full bg-[#25D366] px-6 text-sm font-black text-white transition-all duration-300 hover:bg-[#1FAD54] active:scale-95">Continuar no WhatsApp <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-2" /></button>
              <p className="text-center text-[10px] leading-4 text-slate-400">Nenhum dado é armazenado neste protótipo.</p>
            </form>
          </section>
        </>
      )}
    </>
  );
}
