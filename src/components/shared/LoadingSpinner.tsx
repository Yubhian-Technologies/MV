import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  fullPage?: boolean;
}

export function LoadingSpinner({
  className,
  size = "md",
  fullPage = false,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-2",
    lg: "h-12 w-12 border-[3px]",
  };

  const spinner = (
    <div
      className={cn(
        "animate-spin rounded-full border-rose-200 border-t-rose-600",
        sizeClasses[size],
        className
      )}
    />
  );

  if (fullPage) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        {spinner}
      </div>
    );
  }

  return spinner;
}
