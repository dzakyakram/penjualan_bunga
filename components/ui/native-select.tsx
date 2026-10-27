import * as React from "react"
import { cn } from "@/lib/utils"

/** <select> bawaan browser dengan gaya kaca; aman dipakai di form server action. */
function NativeSelect({ className, ...props }: React.ComponentProps<"select">) {
  return (
    <select
      data-slot="native-select"
      className={cn(
        "glass-field h-11 w-full min-w-0 cursor-pointer rounded-2xl px-4 text-base outline-none md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { NativeSelect }
