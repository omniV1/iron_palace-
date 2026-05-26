import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { Upload } from "lucide-react";
import { api } from "../api";
import { useGallery } from "../hooks/useGallery";
import { CollapsiblePanel } from "../components/CollapsiblePanel";
import { GoldButton } from "../components/GoldButton";
import { inputClassName, labelClassName } from "../components/IconWell";
import {
  AdminDeleteButton,
  AdminForm,
  AdminFormCard,
  AdminFormError,
  AdminFormHint,
  AdminListCard,
  AdminPageGrid,
  adminFileInputClassName,
} from "./AdminPrimitives";

const MAX_BYTES = 4 * 1024 * 1024;

export function GalleryAdmin() {
  const { photos, loading, error, refresh, setPhotos } = useGallery();
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function pickFile(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setFormError(null);
    if (f && f.size > MAX_BYTES) {
      setFormError("File is larger than 4 MB. Resize and try again.");
      setFile(null);
      return;
    }
    setFile(f);
  }

  async function handleUpload(e: FormEvent) {
    e.preventDefault();
    if (!file) return;
    setSubmitting(true);
    setFormError(null);
    try {
      const photo = await api.uploadGallery(file, caption);
      setPhotos((prev) => [photo, ...prev]);
      setFile(null);
      setCaption("");
      setUploadOpen(false);
      if (fileRef.current) fileRef.current.value = "";
      refresh();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this photo?")) return;
    try {
      await api.deleteGallery(id);
      setPhotos((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : String(err));
    }
  }

  return (
    <AdminPageGrid>
      <AdminFormCard title="Upload Photo">
        <AdminForm onSubmit={handleUpload}>
          <CollapsiblePanel
            label="Image"
            hint={file ? file.name : "Tap to choose"}
            open={uploadOpen}
            onOpenChange={setUploadOpen}
          >
            <div className="space-y-2">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={pickFile}
                required={!file}
                className={adminFileInputClassName}
              />
              <label className="block">
                <span className={labelClassName}>Caption (optional)</span>
                <input value={caption} onChange={(e) => setCaption(e.target.value)} className={inputClassName} />
              </label>
            </div>
          </CollapsiblePanel>

          <AdminFormError message={formError} />

          <GoldButton type="submit" variant="flat" disabled={submitting || !file} className="w-full">
            <Upload className="w-4 h-4" />
            {submitting ? "Uploading…" : "Upload"}
          </GoldButton>
          <AdminFormHint>Max 4 MB. Images only.</AdminFormHint>
        </AdminForm>
      </AdminFormCard>

      <AdminListCard
        title="All Photos"
        onRefresh={refresh}
        loading={loading}
        error={error}
        empty="No photos yet."
        isEmpty={photos.length === 0}
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {photos.map((photo) => (
            <div key={photo.id} className="relative group rounded-lg overflow-hidden border border-border-subtle">
              <img src={photo.url} alt={photo.caption || photo.filename} className="aspect-square w-full object-cover" />
              {photo.caption && (
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                  <p className="text-foreground text-xs truncate">{photo.caption}</p>
                </div>
              )}
              <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <AdminDeleteButton onClick={() => handleDelete(photo.id)} compact />
              </div>
            </div>
          ))}
        </div>
      </AdminListCard>
    </AdminPageGrid>
  );
}
