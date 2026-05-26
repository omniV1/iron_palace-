import { useState, type FormEvent } from "react";
import imgNewLogo from "../../assets/feef32863d06775804f6af6bbe43f8df154b97b4.png?w=500&format=webp&quality=85";
import { PageShell } from "../components/PageShell";
import { GlassCard } from "../components/GlassCard";
import { GoldButton } from "../components/GoldButton";
import { inputClassName, labelClassName } from "../components/IconWell";

type Props = {
  onLogin: (password: string) => Promise<boolean>;
  error: string | null;
};

export function LoginPage({ onLogin, error }: Props) {
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setLocalError(null);
    const ok = await onLogin(password);
    setSubmitting(false);
    if (!ok) setLocalError("Wrong password.");
  }

  return (
    <PageShell className="flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm">
        <GlassCard className="p-8 shadow-2xl shadow-black/60">
          <img src={imgNewLogo} alt="Iron Palace Podcast" className="h-16 w-auto mx-auto mb-6" />
          <h1 className="font-display text-xl font-light uppercase tracking-wider text-center mb-6">
            Admin Sign-In
          </h1>

          <label className="block">
            <span className={labelClassName}>Admin Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClassName}
              autoFocus
              required
            />
          </label>

          {(localError || error) && (
            <p className="mt-3 text-sm text-destructive">{localError || error}</p>
          )}

          <GoldButton
            type="submit"
            variant="flat"
            disabled={submitting || !password}
            className="mt-6 w-full"
          >
            {submitting ? "Signing in…" : "Sign In"}
          </GoldButton>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            <a href="/" className="hover:text-gold-bright">← Back to site</a>
          </p>
        </GlassCard>
      </form>
    </PageShell>
  );
}
