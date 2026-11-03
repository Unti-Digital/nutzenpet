import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Redefinir senha | NutzenPet",
  robots: { index: false, follow: false },
};

export default function ResetPasswordLayout({ children }: LayoutProps<"/conta/redefinir-senha">) {
  return children;
}
