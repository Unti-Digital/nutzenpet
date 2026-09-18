import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "./components/cart-provider";
import { WhatsAppIcon } from "./components/whatsapp-icon";
import { contactDetails } from "./data/contact";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NutzenPet | Nutrição de verdade",
  description:
    "Nutrição completa e responsável para cães e gatos em todas as fases da vida.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <CartProvider>
          {children}
          <a
            href={contactDetails.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Falar com a NutzenPet pelo WhatsApp"
            title="Falar pelo WhatsApp"
            className="sonar sonar-whatsapp fixed bottom-5 right-5 z-[70] grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white transition-all duration-300 hover:scale-90 hover:bg-[#1FAD54] active:scale-95 sm:bottom-8 sm:right-8 sm:h-16 sm:w-16"
          >
            <WhatsAppIcon className="relative z-10 h-7 w-7 sm:h-8 sm:w-8" />
          </a>
        </CartProvider>
      </body>
    </html>
  );
}
