import { useRef, useState, useEffect, type ChangeEvent, type FormEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Upload, X } from "lucide-react";
import { api, type DayStoneEntry } from "../api";
import { useDayStones } from "../hooks/useDayStones";
import { DayStoneEntryCard } from "../components/DayStoneEntryCard";
import { CollapsiblePanel } from "../components/CollapsiblePanel";
import { CrimsonButton } from "../components/CrimsonButton";
import { inputClassName, labelClassName } from "../components/IconWell";
import { CATEGORY_LABELS, MAX_PHOTO_BYTES } from "../dayStones/constants";
import { splitByCategory } from "../dayStones/utils";
import { fadeInUpSm } from "../motion/variants";
import {
  AdminDeleteButton,
  AdminField,
  AdminForm,
  AdminFormCard,
  AdminFormError,
  AdminGroupHeading,
  AdminListCard,
  AdminPageGrid,
  adminFileInputClassName,
} from "./AdminPrimitives";

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
  const [createPhotoPreview, setCreatePhotoPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [photoOpen, setPhotoOpen] = useState(false);
  const createPhotoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!createPhoto) {
      setCreatePhotoPreview(null);
      return;
    }
    const url = URL.createObjectURL(createPhoto);
    setCreatePhotoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [createPhoto]);

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
        try {
          finalEntry = await api.uploadDayStonePhoto(created.id, createPhoto);
        } catch (photoErr) {
          setFormError(
            `Lifter saved, but photo upload failed: ${photoErr instanceof Error ? photoErr.message : String(photoErr)}`,
          );
        }
      }
      setEntries((prev) => [...prev, finalEntry]);
      setDraft(empty);
      setCreatePhoto(null);
      setPhotoOpen(false);
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
    <AdminPageGrid>
      <AdminFormCard title="Add Lifter">
        <AdminForm onSubmit={handleCreate}>
          <AdminField label="Name" value={draft.name} onChange={(v) => setDraft({ ...draft, name: v })} required />

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

          <AdminField
            label="Date Lifted"
            value={draft.liftedAt}
            onChange={(v) => setDraft({ ...draft, liftedAt: v })}
            placeholder="April 22, 2026"
            required
          />
          <AdminField
            label="Notes"
            value={draft.notes ?? ""}
            onChange={(v) => setDraft({ ...draft, notes: v })}
            textarea
          />

          <CollapsiblePanel
            label="Photo (optional)"
            hint={createPhoto ? createPhoto.name : "Tap to add"}
            open={photoOpen}
            onOpenChange={setPhotoOpen}
          >
            <div className="space-y-2">
              <input
                ref={createPhotoRef}
                type="file"
                accept="image/*"
                onChange={pickCreatePhoto}
                className={adminFileInputClassName}
              />
              {createPhotoPreview && (
                <img
                  src={createPhotoPreview}
                  alt="Selected lifter photo preview"
                  className="w-20 h-20 rounded-lg object-cover ring-1 ring-crimson/30"
                />
              )}
            </div>
          </CollapsiblePanel>

          <AdminFormError message={formError} />

          <CrimsonButton type="submit" variant="flat" disabled={submitting} className="w-full">
            {submitting ? "Saving…" : "Add to Record Book"}
          </CrimsonButton>
        </AdminForm>
      </AdminFormCard>

      <AdminListCard
        title="All Entries"
        onRefresh={refresh}
        loading={loading}
        error={error}
        empty="No lifters recorded yet."
        isEmpty={entries.length === 0}
      >
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
      </AdminListCard>
    </AdminPageGrid>
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
      <AdminGroupHeading>{title}</AdminGroupHeading>
      <div className="space-y-3" role="list">
        <AnimatePresence initial={false}>
          {entries.map((entry) => (
            <motion.div
              key={entry.id}
              role="listitem"
              layout
              variants={fadeInUpSm}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, x: -12, transition: { duration: 0.2 } }}
            >
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
            </motion.div>
          ))}
        </AnimatePresence>
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
  const [photoOpen, setPhotoOpen] = useState(false);

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
    <div className="flex flex-col items-end gap-2 w-full sm:w-auto">
      <CollapsiblePanel
        label="Photo"
        hint={entry.photoUrl ? "Attached" : "Tap to add"}
        open={photoOpen}
        onOpenChange={setPhotoOpen}
        compact
      >
        <div className="space-y-2">
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={pickFile} />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-1 text-xs uppercase tracking-wider text-crimson hover:text-crimson-bright font-display"
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
        </div>
      </CollapsiblePanel>

      <AdminDeleteButton onClick={onDelete} />
    </div>
  );
}
