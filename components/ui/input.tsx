import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"
import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "glass-field h-11 w-full min-w-0 rounded-2xl px-4 py-1 text-base transition-[background,box-shadow] outline-none file:mr-3 file:inline-flex file:h-7 file:rounded-full file:border-0 file:bg-white/70 file:px-3 file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground/80 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Input }
