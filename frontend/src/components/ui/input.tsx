import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        // 10px radius per the system's shape rule. Focus is a brand-amber ring
        // with an offset, which is the one place the accent appears on a form.
        // Placeholder sits at muted-foreground, which clears WCAG AA on paper;
        // it is never used as a label.
        "flex h-11 w-full rounded-[10px] border border-input bg-card px-3.5 py-2 text-base text-foreground transition-[border-color,box-shadow] placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-[var(--brand)] focus-visible:ring-2 focus-visible:ring-[var(--brand-soft)] disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-destructive md:text-sm",
        className
      )}
      ref={ref}
      {...props}
    />
  )
)
Input.displayName = "Input"

export { Input }
