import { Heart, Leaf, Sprout } from "lucide-react";

export function FloatingMotifs({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-0 overflow-hidden text-[#3E1255] ${className}`}>
      <Heart className="float-soft absolute left-[4%] top-[15%] h-6 w-6 rotate-[-16deg] opacity-75" strokeWidth={1.8} />
      <Leaf className="float-soft-delayed absolute right-[7%] top-[24%] h-7 w-7 rotate-[18deg] opacity-70" strokeWidth={1.8} />
      <Sprout className="float-soft absolute bottom-[11%] left-[12%] h-8 w-8 rotate-[-12deg] opacity-65" strokeWidth={1.7} />
      <Heart className="float-soft-delayed absolute bottom-[17%] right-[14%] h-5 w-5 rotate-[14deg] opacity-60" strokeWidth={1.8} />
    </div>
  );
}
