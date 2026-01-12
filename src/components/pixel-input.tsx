import { type InputHTMLAttributes, forwardRef } from "react"
import { cn } from "@/lib/utils"

interface PixelInputProps extends InputHTMLAttributes<HTMLInputElement> {}

export const PixelInput = forwardRef<HTMLInputElement, PixelInputProps>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        "w-full bg-background border-4 border-border px-4 py-3",
        "text-foreground text-xs font-sans",
        "focus:border-primary focus:outline-none focus:pixel-glow-purple",
        "placeholder:text-muted",
        "transition-all",
        className,
      )}
      {...props}
    />
  )
})

PixelInput.displayName = "PixelInput"
