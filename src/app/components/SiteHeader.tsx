import type { ReactNode } from "react";
import { cn } from "./ui/utils";
import imgNewLogo from "../../assets/feef32863d06775804f6af6bbe43f8df154b97b4.png?w=500&format=webp&quality=85";

type SiteHeaderProps = {
  variant?: "subpage" | "admin";
  title?: string;
  children?: ReactNode;
};

export function SiteHeader({ variant = "subpage", title, children }: SiteHeaderProps) {
  return (
    <header className="border-b border-border-subtle bg-background/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <a
          href="/"
          className="flex items-center gap-3 text-muted-foreground hover:text-gold-bright transition-colors shrink-0 w-24"
        >
          {variant === "subpage" && (
            <span className="text-xs uppercase tracking-wider font-display">← Home</span>
          )}
        </a>

        <a href="/" className="absolute left-1/2 -translate-x-1/2">
          <img src={imgNewLogo} alt="The Iron Palace Podcast" className="h-12 w-auto" />
        </a>

        <div className="flex items-center gap-3 shrink-0 w-24 justify-end">
          {variant === "admin" && title && (
            <span className="text-xs uppercase tracking-wider text-muted-foreground font-display hidden sm:inline">
              {title}
            </span>
          )}
          {children}
        </div>
      </div>
    </header>
  );
}
