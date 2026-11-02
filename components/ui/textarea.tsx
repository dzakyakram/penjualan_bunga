import * as React from "react"
import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "glass-field flex field-sizing-content min-h-24 w-full rounded-2xl px-4 py-3 text-base transition-[background,box-shadow] outline-none placeholder:text-muted-foreground/80 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
