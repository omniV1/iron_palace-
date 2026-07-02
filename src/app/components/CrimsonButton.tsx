import type { ComponentProps } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./ui/utils";

const crimsonButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-display uppercase tracking-wider text-sm transition-[transform,box-shadow,filter] duration-200 ease-out hover:scale-[1.02] active:scale-[0.96] disabled:opacity-50 disabled:pointer-events-none disabled:hover:scale-100",
  {
    variants: {
      variant: {
        gradient:
          "relative overflow-hidden rounded-lg bg-gradient-to-b from-crimson to-primary text-primary-foreground px-6 py-3 shadow-[0_4px_20px_rgba(220,38,38,0.35)] hover:shadow-[0_8px_28px_rgba(220,38,38,0.45)] hover:brightness-110",
        flat:
          "rounded-lg bg-primary hover:bg-crimson-bright text-primary-foreground font-medium py-2 px-4 normal-case tracking-normal",
        outline:
          "rounded-lg border border-border-crimson text-crimson-bright hover:bg-crimson-muted py-2 px-4 normal-case tracking-normal",
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

type CrimsonButtonProps = ComponentProps<"button"> &
  VariantProps<typeof crimsonButtonVariants> & {
    asChild?: false;
  };

export function CrimsonButton({
  className,
  variant,
  size,
  children,
  ...props
}: CrimsonButtonProps) {
  return (
    <button
      className={cn(crimsonButtonVariants({ variant, size }), className)}
      {...props}
    >
      {children}
    </button>
  );
}

export { crimsonButtonVariants };
