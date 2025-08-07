import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, maxLength, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      maxLength={maxLength}
      className={cn(
          "text-black file:text-foreground placeholder:text-muted-foreground dark:bg-white border-input flex h-9 w-full min-w-0 rounded-md border bg-white px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-white file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          "selection:bg-[var(--primary-60)] selection:text-black",
          className
      )}
      {...props}
    />
  )
}

export { Input }
