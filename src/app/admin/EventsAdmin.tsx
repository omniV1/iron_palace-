import { useState, type FormEvent } from "react";
import { Calendar, Trash2 } from "lucide-react";
import { api, type EventRecord } from "../api";
import { useEvents } from "../hooks/useEvents";

const empty = { title: "", date: "", time: "", location: "", description: "" };

export function EventsAdmin() {
  const { events, loading, error, refresh, setEvents } = useEvents();
  const [draft, setDraft] = useState(empty);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    try {
      const created = await api.createEvent(draft);
      setEvents((prev) => [...prev, created]);
      setDraft(empty);
      refresh();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this event?")) return;
    try {
      await api.deleteEvent(id);
      setEvents((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : String(err));
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-8">
      <section className="bg-zinc-900/60 border border-white/10 rounded-2xl p-6">
        <h2 className="text-lg font-light uppercase tracking-wider mb-4">Add Event</h2>
        <form onSubmit={handleCreate} className="space-y-3">
          <Field label="Title" value={draft.title} onChange={(v) => setDraft({ ...draft, title: v })} required />
          <Field label="Date" value={draft.date} onChange={(v) => setDraft({ ...draft, date: v })} placeholder="April 22, 2026" required />
          <Field label="Time" value={draft.time} onChange={(v) => setDraft({ ...draft, time: v })} placeholder="7:00 PM EST" />
          <Field label="Location" value={draft.location} onChange={(v) => setDraft({ ...draft, location: v })} />
          <Field label="Description" value={draft.description ?? ""} onChange={(v) => setDraft({ ...draft, description: v })} textarea />

          {formError && <p className="text-sm text-red-400">{formError}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-medium py-2 rounded-lg transition-colors"
          >
            {submitting ? "Saving…" : "Add Event"}
          </button>
        </form>
      </section>

      <section className="bg-zinc-900/60 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-light uppercase tracking-wider">All Events</h2>
          <button onClick={refresh} className="text-xs text-zinc-400 hover:text-amber-500 uppercase tracking-wider">
            Refresh
          </button>
        </div>

        {loading && <p className="text-zinc-400 text-sm">Loading…</p>}
        {error && <p className="text-red-400 text-sm">{error}</p>}
        {!loading && events.length === 0 && (
          <p className="text-zinc-500 text-sm">No events yet.</p>
        )}

        <ul className="space-y-3">
          {events.map((event) => (
            <EventRow key={event.id} event={event} onDelete={() => handleDelete(event.id)} />
          ))}
        </ul>
      </section>
    </div>
  );
}

function EventRow({ event, onDelete }: { event: EventRecord; onDelete: () => void }) {
  return (
    <li className="flex items-start gap-3 bg-black/40 border border-white/5 rounded-xl p-3">
      <div className="bg-amber-600/10 p-2 rounded-lg ring-1 ring-amber-600/20 shrink-0">
        <Calendar className="w-5 h-5 text-amber-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{event.title}</p>
        <p className="text-zinc-400 text-xs">{event.date}{event.time ? ` · ${event.time}` : ""}</p>
        {event.location && <p className="text-zinc-500 text-xs">{event.location}</p>}
        {event.description && <p className="text-zinc-400 text-xs mt-1 whitespace-pre-line">{event.description}</p>}
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
