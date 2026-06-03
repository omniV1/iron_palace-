import type { ComponentProps } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./ui/utils";

const goldButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-display uppercase tracking-wider text-sm transition-all disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        gradient:
          "relative overflow-hidden rounded-lg bg-gradient-to-b from-gold to-primary text-primary-foreground px-6 py-3 shadow-[0_4px_20px_rgba(220,38,38,0.35)] hover:brightness-110",
        flat:
          "rounded-lg bg-primary hover:bg-gold-bright text-primary-foreground font-medium py-2 px-4 normal-case tracking-normal",
      },
      size: {
        default: "",
        sm: "text-xs px-4 py-2",
        lg: "text-base px-8 py-4",
      },
    },
    defaultVariants: {
      variant: "gradient",
      size: "default",
    },
  }
);

type GoldButtonProps = ComponentProps<"button"> &
  VariantProps<typeof goldButtonVariants> & {
    asChild?: false;
  };

export function GoldButton({
  className,
  variant,
  size,
  children,
  ...props
}: GoldButtonProps) {
  return (
    <button
      className={cn(goldButtonVariants({ variant, size }), className)}
      {...props}
    >
      {children}
    </button>
  );
}

export { goldButtonVariants };
