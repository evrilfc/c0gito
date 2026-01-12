import type { ButtonHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

interface PixelButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "accent"
  size?: "sm" | "md" | "lg"
}

export function PixelButton({
  variant = "primary",
  size = "md",
  className,
  children,
  disabled,
  ...props
}: PixelButtonProps) {
  return (
    <button
      className={cn(
        "border-4 font-sans uppercase tracking-wide transition-all",
        "hover:scale-105 active:scale-95",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
        variant === "primary" && "bg-primary text-primary-foreground border-primary hover:pixel-glow-purple",
        variant === "secondary" && "bg-secondary text-secondary-foreground border-secondary",
        variant === "accent" && "bg-accent text-accent-foreground border-accent hover:pixel-glow-cyan",
        size === "sm" && "px-3 py-1 text-xs",
        size === "md" && "px-4 py-2 text-xs",
        size === "lg" && "px-6 py-3 text-sm",
        className,
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
