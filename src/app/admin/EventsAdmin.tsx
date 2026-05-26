import { useState, type FormEvent } from "react";
import { Calendar } from "lucide-react";
import { api, type EventRecord } from "../api";
import { useEvents } from "../hooks/useEvents";
import { GoldButton } from "../components/GoldButton";
import { IconWell } from "../components/IconWell";
import {
  AdminDeleteButton,
  AdminField,
  AdminForm,
  AdminFormCard,
  AdminFormError,
  AdminListCard,
  AdminListItem,
  AdminPageGrid,
} from "./AdminPrimitives";

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
    <AdminPageGrid>
      <AdminFormCard title="Add Event">
        <AdminForm onSubmit={handleCreate}>
          <AdminField label="Title" value={draft.title} onChange={(v) => setDraft({ ...draft, title: v })} required />
          <AdminField
            label="Date"
            value={draft.date}
            onChange={(v) => setDraft({ ...draft, date: v })}
            placeholder="April 22, 2026"
            required
          />
          <AdminField
            label="Time"
            value={draft.time}
            onChange={(v) => setDraft({ ...draft, time: v })}
            placeholder="7:00 PM EST"
          />
          <AdminField label="Location" value={draft.location} onChange={(v) => setDraft({ ...draft, location: v })} />
          <AdminField
            label="Description"
            value={draft.description ?? ""}
            onChange={(v) => setDraft({ ...draft, description: v })}
            textarea
          />

          <AdminFormError message={formError} />

          <GoldButton type="submit" variant="flat" disabled={submitting} className="w-full">
            {submitting ? "Saving…" : "Add Event"}
          </GoldButton>
        </AdminForm>
      </AdminFormCard>

      <AdminListCard
        title="All Events"
        onRefresh={refresh}
        loading={loading}
        error={error}
        empty="No events yet."
        isEmpty={events.length === 0}
      >
        <ul className="space-y-3">
          {events.map((event) => (
            <EventRow key={event.id} event={event} onDelete={() => handleDelete(event.id)} />
          ))}
        </ul>
      </AdminListCard>
    </AdminPageGrid>
  );
}

function EventRow({ event, onDelete }: { event: EventRecord; onDelete: () => void }) {
  return (
    <li>
      <AdminListItem>
        <IconWell icon={Calendar} size="sm" />
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{event.title}</p>
          <p className="text-muted-foreground text-xs">
            {event.date}
            {event.time ? ` · ${event.time}` : ""}
          </p>
          {event.location && <p className="text-muted-foreground/70 text-xs">{event.location}</p>}
          {event.description && (
            <p className="text-muted-foreground text-xs mt-1 whitespace-pre-line">{event.description}</p>
          )}
        </div>
        <AdminDeleteButton onClick={onDelete} />
      </AdminListItem>
    </li>
  );
}
