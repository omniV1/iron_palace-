import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { Trash2, Upload, X } from "lucide-react";
import { api, type DayStoneEntry } from "../api";
import { useDayStones } from "../hooks/useDayStones";
import { DayStoneEntryCard } from "../components/DayStoneEntryCard";
import { GlassCard } from "../components/GlassCard";
import { GoldButton } from "../components/GoldButton";
import { inputClassName, labelClassName } from "../components/IconWell";
import { CATEGORY_LABELS, MAX_PHOTO_BYTES } from "../dayStones/constants";
import { splitByCategory } from "../dayStones/utils";

const empty = {
  name: "",
  category: "straps" as DayStoneEntry["category"],
  liftedAt: "",
  notes: "",
};

export function DayStonesAdmin() {
  const { entries, loading, error, refresh, setEntries } = useDayStones();
  const [draft, setDraft] = useState(empty);
  const [createPhoto, setCreatePhoto] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const createPhotoRef = useRef<HTMLInputElement>(null);

  function replaceEntry(updated: DayStoneEntry) {
    setEntries((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    try {
      const created = await api.createDayStone(draft);
      let finalEntry = created;
      if (createPhoto) {
        finalEntry = await api.uploadDayStonePhoto(created.id, createPhoto);
      }
      setEntries((prev) => [...prev, finalEntry]);
      setDraft(empty);
      setCreatePhoto(null);
      if (createPhotoRef.current) createPhotoRef.current.value = "";
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

  async function handlePhotoUpload(entryId: string, file: File) {
    try {
      const updated = await api.uploadDayStonePhoto(entryId, file);
      replaceEntry(updated);
    } catch (err) {
      alert(err instanceof Error ? err.message : String(err));
    }
  }

  async function handlePhotoRemove(entryId: string) {
    if (!confirm("Remove this lifter's photo?")) return;
    try {
      const updated = await api.deleteDayStonePhoto(entryId);
      replaceEntry(updated);
    } catch (err) {
      alert(err instanceof Error ? err.message : String(err));
    }
  }

  function pickCreatePhoto(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setFormError(null);
    if (f && f.size > MAX_PHOTO_BYTES) {
      setFormError("Photo is larger than 4 MB. Resize and try again.");
      setCreatePhoto(null);
      return;
    }
    setCreatePhoto(f);
  }

  const { withStraps, withoutStraps } = splitByCategory(entries);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-8">
      <GlassCard className="p-6">
        <h2 className="font-display text-lg font-light uppercase tracking-wider mb-4">Add Lifter</h2>
        <form onSubmit={handleCreate} className="space-y-3">
          <Field label="Name" value={draft.name} onChange={(v) => setDraft({ ...draft, name: v })} required />

          <label className="block">
            <span className={labelClassName}>Category *</span>
            <select
              value={draft.category}
              onChange={(e) => setDraft({ ...draft, category: e.target.value as DayStoneEntry["category"] })}
              className={inputClassName}
            >
              <option value="straps">{CATEGORY_LABELS.straps}</option>
              <option value="no_straps">{CATEGORY_LABELS.no_straps}</option>
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

          <label className="block">
            <span className={labelClassName}>Photo (optional)</span>
            <input
              ref={createPhotoRef}
              type="file"
              accept="image/*"
              onChange={pickCreatePhoto}
              className={`${inputClassName} file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-primary file:text-primary-foreground file:text-xs file:uppercase file:tracking-wider`}
            />
            {createPhoto && (
              <p className="text-muted-foreground text-xs mt-1">{createPhoto.name}</p>
            )}
          </label>

          {formError && <p className="text-sm text-destructive">{formError}</p>}

          <GoldButton type="submit" variant="flat" disabled={submitting} className="w-full">
            {submitting ? "Saving…" : "Add to Record Book"}
          </GoldButton>
        </form>
      </GlassCard>

      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-light uppercase tracking-wider">All Entries</h2>
          <button onClick={refresh} className="text-xs text-muted-foreground hover:text-gold-bright uppercase tracking-wider font-display">
            Refresh
          </button>
        </div>

        {loading && <p className="text-muted-foreground text-sm">Loading…</p>}
        {error && <p className="text-destructive text-sm">{error}</p>}
        {!loading && entries.length === 0 && (
          <p className="text-muted-foreground text-sm">No lifters recorded yet.</p>
        )}

        <div className="space-y-6">
          <EntryGroup
            title={CATEGORY_LABELS.straps}
            entries={withStraps}
            onDelete={handleDelete}
            onPhotoUpload={handlePhotoUpload}
            onPhotoRemove={handlePhotoRemove}
          />
          <EntryGroup
            title={CATEGORY_LABELS.no_straps}
            entries={withoutStraps}
            onDelete={handleDelete}
            onPhotoUpload={handlePhotoUpload}
            onPhotoRemove={handlePhotoRemove}
          />
        </div>
      </GlassCard>
    </div>
  );
}

function EntryGroup({
  title,
  entries,
  onDelete,
  onPhotoUpload,
  onPhotoRemove,
}: {
  title: string;
  entries: DayStoneEntry[];
  onDelete: (id: string) => void;
  onPhotoUpload: (id: string, file: File) => void;
  onPhotoRemove: (id: string) => void;
}) {
  if (entries.length === 0) return null;

  return (
    <div>
      <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-2 font-display">{title}</h3>
      <div className="space-y-3" role="list">
        {entries.map((entry) => (
          <div key={entry.id} role="listitem">
            <DayStoneEntryCard
              entry={entry}
              variant="admin"
              actions={
                <EntryActions
                  entry={entry}
                  onDelete={() => onDelete(entry.id)}
                  onPhotoUpload={(file) => onPhotoUpload(entry.id, file)}
                  onPhotoRemove={() => onPhotoRemove(entry.id)}
                />
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function EntryActions({
  entry,
  onDelete,
  onPhotoUpload,
  onPhotoRemove,
}: {
  entry: DayStoneEntry;
  onDelete: () => void;
  onPhotoUpload: (file: File) => void;
  onPhotoRemove: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  function pickFile(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > MAX_PHOTO_BYTES) {
      alert("Photo is larger than 4 MB. Resize and try again.");
      return;
    }
    onPhotoUpload(f);
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={pickFile}
      />
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="inline-flex items-center gap-1 text-xs uppercase tracking-wider text-gold hover:text-gold-bright font-display"
      >
        <Upload className="w-3.5 h-3.5" />
        {entry.photoUrl ? "Change photo" : "Add photo"}
      </button>
      {entry.photoUrl && (
        <button
          type="button"
          onClick={onPhotoRemove}
          className="inline-flex items-center gap-1 text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground font-display"
        >
          <X className="w-3.5 h-3.5" />
          Remove photo
        </button>
      )}
      <button
        type="button"
        onClick={onDelete}
        className="inline-flex items-center gap-1 text-xs uppercase tracking-wider text-muted-foreground hover:text-destructive font-display"
      >
        <Trash2 className="w-3.5 h-3.5" />
        Delete
      </button>
    </>
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
