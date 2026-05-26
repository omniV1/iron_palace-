import type { FormEvent, ReactNode } from "react";
import { Trash2 } from "lucide-react";
import { GlassCard } from "../components/GlassCard";
import { inputClassName, labelClassName } from "../components/IconWell";
import { cn } from "../components/ui/utils";

export const adminFileInputClassName = `${inputClassName} file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-primary file:text-primary-foreground file:text-xs file:uppercase file:tracking-wider file:cursor-pointer`;

export function AdminPageGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-8">{children}</div>;
}

export function AdminFormCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <GlassCard className="p-6">
      <h2 className="font-display text-lg font-light uppercase tracking-wider mb-4">{title}</h2>
      {children}
    </GlassCard>
  );
}

export function AdminListCard({
  title,
  onRefresh,
  loading,
  error,
  empty,
  isEmpty,
  children,
}: {
  title: string;
  onRefresh: () => void;
  loading: boolean;
  error: string | null;
  empty: string;
  isEmpty: boolean;
  children: ReactNode;
}) {
  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-lg font-light uppercase tracking-wider">{title}</h2>
        <AdminRefreshButton onClick={onRefresh} />
      </div>

      {loading && <p className="text-muted-foreground text-sm">Loading…</p>}
      {error && <p className="text-destructive text-sm">{error}</p>}
      {!loading && isEmpty && <p className="text-muted-foreground text-sm">{empty}</p>}

      {children}
    </GlassCard>
  );
}

export function AdminRefreshButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-xs text-muted-foreground hover:text-gold-bright uppercase tracking-wider font-display"
    >
      Refresh
    </button>
  );
}

export function AdminDeleteButton({
  onClick,
  label = "Delete",
  compact = false,
}: {
  onClick: () => void;
  label?: string;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="text-muted-foreground hover:text-destructive p-1 shrink-0"
        aria-label={label}
      >
        <Trash2 className="w-4 h-4" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 text-xs uppercase tracking-wider text-muted-foreground hover:text-destructive font-display shrink-0"
    >
      <Trash2 className="w-3.5 h-3.5" />
      {label}
    </button>
  );
}

export function AdminForm({
  onSubmit,
  children,
  className,
}: {
  onSubmit: (e: FormEvent) => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <form onSubmit={onSubmit} className={cn("space-y-3", className)}>
      {children}
    </form>
  );
}

export function AdminField({
  label,
  value,
  onChange,
  placeholder,
  required,
  textarea,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  textarea?: boolean;
}) {
  return (
    <label className="block">
      <span className={labelClassName}>
        {label}
        {required ? " *" : ""}
      </span>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className={inputClassName}
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className={inputClassName}
        />
      )}
    </label>
  );
}

export function AdminFormError({ message }: { message: string | null }) {
  if (!message) return null;
  return <p className="text-sm text-destructive">{message}</p>;
}

export function AdminFormHint({ children }: { children: ReactNode }) {
  return <p className="text-xs text-muted-foreground">{children}</p>;
}

export function AdminListItem({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-3 bg-input-background border border-border-subtle rounded-xl p-3">
      {children}
    </div>
  );
}

export function AdminGroupHeading({ children }: { children: ReactNode }) {
  return (
    <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-2 font-display">{children}</h3>
  );
}
