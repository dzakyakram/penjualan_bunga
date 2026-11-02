import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex h-6 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap shadow-[inset_0_1px_0_rgb(255_255_255/0.7)] [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "border-primary/25 bg-primary/15 text-[oklch(0.42_0.18_5)]",
        secondary: "border-white/70 bg-white/55 text-secondary-foreground",
        destructive: "border-destructive/25 bg-destructive/12 text-destructive",
        outline: "border-foreground/20 bg-white/30 text-foreground",
        success: "border-leaf/30 bg-leaf/15 text-[oklch(0.38_0.1_160)]",
        warning: "border-[oklch(0.75_0.13_75)]/50 bg-[oklch(0.9_0.12_85)]/50 text-[oklch(0.4_0.09_70)]",
        info: "border-[oklch(0.6_0.12_270)]/30 bg-[oklch(0.8_0.09_280)]/35 text-[oklch(0.38_0.13_280)]",
        ghost: "border-transparent",
        link: "border-transparent text-primary underline-offset-4 hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, badgeVariants }
