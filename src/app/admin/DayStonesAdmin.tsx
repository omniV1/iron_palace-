import { useState, type FormEvent } from "react";
import { Dumbbell, Trash2 } from "lucide-react";
import { api, type DayStoneEntry } from "../api";
import { useDayStones } from "../hooks/useDayStones";

const empty = {
  name: "",
  category: "straps" as DayStoneEntry["category"],
  liftedAt: "",
  notes: "",
};

const categoryLabels: Record<DayStoneEntry["category"], string> = {
  straps: "With Straps",
  no_straps: "Without Straps",
};

export function DayStonesAdmin() {
  const { entries, loading, error, refresh, setEntries } = useDayStones();
  const [draft, setDraft] = useState(empty);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    try {
      const created = await api.createDayStone(draft);
      setEntries((prev) => [...prev, created]);
      setDraft(empty);
      refresh();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this lifter from the record book?")) return;
    try {
      await api.deleteDayStone(id);
      setEntries((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : String(err));
    }
  }

  const withStraps = entries.filter((e) => e.category === "straps");
  const withoutStraps = entries.filter((e) => e.category === "no_straps");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-8">
      <section className="bg-zinc-900/60 border border-white/10 rounded-2xl p-6">
        <h2 className="text-lg font-light uppercase tracking-wider mb-4">Add Lifter</h2>
        <form onSubmit={handleCreate} className="space-y-3">
          <Field label="Name" value={draft.name} onChange={(v) => setDraft({ ...draft, name: v })} required />

          <label className="block">
            <span className="text-xs uppercase tracking-wider text-zinc-400">Category *</span>
            <select
              value={draft.category}
              onChange={(e) => setDraft({ ...draft, category: e.target.value as DayStoneEntry["category"] })}
              className="mt-1 w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500/60"
            >
              <option value="straps">With Straps</option>
              <option value="no_straps">Without Straps</option>
            </select>
          </label>

          <Field
            label="Date Lifted"
            value={draft.liftedAt}
            onChange={(v) => setDraft({ ...draft, liftedAt: v })}
            placeholder="April 22, 2026"
            required
          />
          <Field
            label="Notes"
            value={draft.notes ?? ""}
            onChange={(v) => setDraft({ ...draft, notes: v })}
            textarea
          />

          {formError && <p className="text-sm text-red-400">{formError}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-medium py-2 rounded-lg transition-colors"
          >
            {submitting ? "Saving…" : "Add to Record Book"}
          </button>
        </form>
      </section>

      <section className="bg-zinc-900/60 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-light uppercase tracking-wider">All Entries</h2>
          <button onClick={refresh} className="text-xs text-zinc-400 hover:text-amber-500 uppercase tracking-wider">
            Refresh
          </button>
        </div>

        {loading && <p className="text-zinc-400 text-sm">Loading…</p>}
        {error && <p className="text-red-400 text-sm">{error}</p>}
        {!loading && entries.length === 0 && (
          <p className="text-zinc-500 text-sm">No lifters recorded yet.</p>
        )}

        <div className="space-y-6">
          <EntryGroup title="With Straps" entries={withStraps} onDelete={handleDelete} />
          <EntryGroup title="Without Straps" entries={withoutStraps} onDelete={handleDelete} />
        </div>
      </section>
    </div>
  );
}

function EntryGroup({
  title,
  entries,
  onDelete,
}: {
  title: string;
  entries: DayStoneEntry[];
  onDelete: (id: string) => void;
}) {
  if (entries.length === 0) return null;

  return (
    <div>
      <h3 className="text-xs uppercase tracking-wider text-zinc-400 mb-2">{title}</h3>
      <ul className="space-y-3">
        {entries.map((entry) => (
          <EntryRow key={entry.id} entry={entry} onDelete={() => onDelete(entry.id)} />
        ))}
      </ul>
    </div>
  );
}

function EntryRow({ entry, onDelete }: { entry: DayStoneEntry; onDelete: () => void }) {
  return (
    <li className="flex items-start gap-3 bg-black/40 border border-white/5 rounded-xl p-3">
      <div className="bg-amber-600/10 p-2 rounded-lg ring-1 ring-amber-600/20 shrink-0">
        <Dumbbell className="w-5 h-5 text-amber-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{entry.name}</p>
        <p className="text-zinc-400 text-xs">{entry.liftedAt}</p>
        <p className="text-zinc-500 text-xs">{categoryLabels[entry.category]}</p>
        {entry.notes && <p className="text-zinc-400 text-xs mt-1 whitespace-pre-line">{entry.notes}</p>}
      </div>
      <button
        onClick={onDelete}
        className="text-zinc-500 hover:text-red-400 p-1 shrink-0"
        aria-label="Delete"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </li>
  );
}

function Field({
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
  const common = "mt-1 w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/60";
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-wider text-zinc-400">{label}{required ? " *" : ""}</span>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className={common}
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className={common}
        />
      )}
    </label>
  );
}
