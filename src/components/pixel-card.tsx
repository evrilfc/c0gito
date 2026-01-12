import type { HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

interface PixelCardProps extends HTMLAttributes<HTMLDivElement> {}

export function PixelCard({ className, children, ...props }: PixelCardProps) {
  return (
    <div
      className={cn(
        "bg-card border-4 border-border p-6 relative",
        "hover:border-primary/50 transition-all duration-300",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
