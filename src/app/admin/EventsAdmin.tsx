import { useState, type FormEvent } from "react";
import { Calendar, Trash2 } from "lucide-react";
import { api, type EventRecord } from "../api";
import { useEvents } from "../hooks/useEvents";
import { GlassCard } from "../components/GlassCard";
import { GoldButton } from "../components/GoldButton";
import { IconWell, inputClassName, labelClassName } from "../components/IconWell";

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
      <GlassCard className="p-6">
        <h2 className="font-display text-lg font-light uppercase tracking-wider mb-4">Add Event</h2>
        <form onSubmit={handleCreate} className="space-y-3">
          <Field label="Title" value={draft.title} onChange={(v) => setDraft({ ...draft, title: v })} required />
          <Field label="Date" value={draft.date} onChange={(v) => setDraft({ ...draft, date: v })} placeholder="April 22, 2026" required />
          <Field label="Time" value={draft.time} onChange={(v) => setDraft({ ...draft, time: v })} placeholder="7:00 PM EST" />
          <Field label="Location" value={draft.location} onChange={(v) => setDraft({ ...draft, location: v })} />
          <Field label="Description" value={draft.description ?? ""} onChange={(v) => setDraft({ ...draft, description: v })} textarea />

          {formError && <p className="text-sm text-destructive">{formError}</p>}

          <GoldButton type="submit" variant="flat" disabled={submitting} className="w-full">
            {submitting ? "Saving…" : "Add Event"}
          </GoldButton>
        </form>
      </GlassCard>

      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-light uppercase tracking-wider">All Events</h2>
          <button onClick={refresh} className="text-xs text-muted-foreground hover:text-gold-bright uppercase tracking-wider font-display">
            Refresh
          </button>
        </div>

        {loading && <p className="text-muted-foreground text-sm">Loading…</p>}
        {error && <p className="text-destructive text-sm">{error}</p>}
        {!loading && events.length === 0 && (
          <p className="text-muted-foreground text-sm">No events yet.</p>
        )}

        <ul className="space-y-3">
          {events.map((event) => (
            <EventRow key={event.id} event={event} onDelete={() => handleDelete(event.id)} />
          ))}
        </ul>
      </GlassCard>
    </div>
  );
}

function EventRow({ event, onDelete }: { event: EventRecord; onDelete: () => void }) {
  return (
    <li className="flex items-start gap-3 bg-input-background border border-border-subtle rounded-xl p-3">
      <IconWell icon={Calendar} size="sm" />
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{event.title}</p>
        <p className="text-muted-foreground text-xs">{event.date}{event.time ? ` · ${event.time}` : ""}</p>
        {event.location && <p className="text-muted-foreground/70 text-xs">{event.location}</p>}
        {event.description && <p className="text-muted-foreground text-xs mt-1 whitespace-pre-line">{event.description}</p>}
      </div>
      <button
        onClick={onDelete}
        className="text-muted-foreground hover:text-destructive p-1 shrink-0"
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
  return (
    <label className="block">
      <span className={labelClassName}>{label}{required ? " *" : ""}</span>
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
