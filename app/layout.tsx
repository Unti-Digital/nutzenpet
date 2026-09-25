import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "./components/cart-provider";
import { RouteScrollManager } from "./components/route-scroll-manager";
import { ScrollRevealObserver } from "./components/scroll-reveal-observer";
import { WhatsAppContact } from "./components/whatsapp-contact";
import { AffiliateAttribution } from "./components/affiliate-attribution";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.FRONTEND_URL || "http://localhost:3000"),
  title: { default: "NutzenPet | Nutrição de verdade", template: "%s | NutzenPet" },
  description:
    "Nutrição completa e responsável para cães e gatos em todas as fases da vida.",
  applicationName: "NutzenPet",
  category: "Pet food",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "NutzenPet",
    title: "NutzenPet | Nutrição de verdade",
    description: "Nutrição completa e responsável para cães e gatos em todas as fases da vida.",
  },
  twitter: { card: "summary_large_image", title: "NutzenPet | Nutrição de verdade", description: "Nutrição completa e responsável para cães e gatos em todas as fases da vida." },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <CartProvider>
          <RouteScrollManager />
          <AffiliateAttribution />
          <ScrollRevealObserver />
          {children}
          <WhatsAppContact />
        </CartProvider>
      </body>
    </html>
  );
}
