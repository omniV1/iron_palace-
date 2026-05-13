import { useState, type FormEvent } from "react";
import imgNewLogo from "../../assets/feef32863d06775804f6af6bbe43f8df154b97b4.png?w=500&format=webp&quality=85";

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
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-zinc-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-2xl shadow-black/60"
      >
        <img src={imgNewLogo} alt="Iron Palace Podcast" className="h-16 w-auto mx-auto mb-6" />
        <h1 className="text-xl font-light uppercase tracking-wider text-center mb-6">Admin Sign-In</h1>

        <label className="block">
          <span className="text-xs uppercase tracking-wider text-zinc-400">Admin Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/60"
            autoFocus
            required
          />
        </label>

        {(localError || error) && (
          <p className="mt-3 text-sm text-red-400">{localError || error}</p>
        )}

        <button
          type="submit"
          disabled={submitting || !password}
          className="mt-6 w-full bg-gradient-to-br from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg border border-amber-500/50 transition-colors"
        >
          {submitting ? "Signing in…" : "Sign In"}
        </button>

        <p className="mt-6 text-center text-xs text-zinc-500">
          <a href="/" className="hover:text-amber-500">← Back to site</a>
        </p>
      </form>
    </div>
  );
}
