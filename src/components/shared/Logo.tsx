import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  href?: string;
}

export function Logo({ className, size = "md", href = "/" }: LogoProps) {
  const sizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };

  return (
    <Link href={href} className={cn("flex items-center gap-2 font-bold", className)}>
      <span className="text-2xl">💍</span>
      <span className={cn(sizeClasses[size])}>
        <span className="text-rose-600">Marriage</span>
        <span className="text-slate-800">Verse</span>
      </span>
    </Link>
  );
}
