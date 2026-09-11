import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function BrandButton({
  href,
  children,
  variant = "orange",
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "orange" | "teal" | "outline";
  className?: string;
}) {
  const variants = {
    orange: "bg-[#FE8C05] text-white hover:bg-[#CC632B]",
    teal: "bg-[#124D55] text-white hover:bg-[#123F55]",
    outline: "border-2 border-[#124D55] bg-white text-[#124D55] hover:bg-slate-50",
  };

  return (
    <Link
      href={href}
      className={`group inline-flex min-h-12 items-center justify-center gap-3 rounded-full px-7 text-sm font-black transition-all duration-300 hover:scale-[0.98] active:scale-95 ${variants[variant]} ${className}`}
    >
      <span>{children}</span>
      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-2" />
    </Link>
  );
}
