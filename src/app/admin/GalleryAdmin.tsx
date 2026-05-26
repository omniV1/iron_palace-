import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { Trash2, Upload } from "lucide-react";
import { api } from "../api";
import { useGallery } from "../hooks/useGallery";
import { GlassCard } from "../components/GlassCard";
import { GoldButton } from "../components/GoldButton";
import { inputClassName, labelClassName } from "../components/IconWell";

const MAX_BYTES = 4 * 1024 * 1024;

export function GalleryAdmin() {
  const { photos, loading, error, refresh, setPhotos } = useGallery();
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
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
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-8">
      <GlassCard className="p-6">
        <h2 className="font-display text-lg font-light uppercase tracking-wider mb-4">Upload Photo</h2>
        <form onSubmit={handleUpload} className="space-y-3">
          <label className="block">
            <span className={labelClassName}>Image</span>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={pickFile}
              required
              className={`${inputClassName} file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:bg-primary file:text-primary-foreground file:cursor-pointer`}
            />
          </label>
          <label className="block">
            <span className={labelClassName}>Caption (optional)</span>
            <input
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className={inputClassName}
            />
          </label>

          {formError && <p className="text-sm text-destructive">{formError}</p>}

          <GoldButton type="submit" variant="flat" disabled={submitting || !file} className="w-full">
            <Upload className="w-4 h-4" />
            {submitting ? "Uploading…" : "Upload"}
          </GoldButton>
          <p className="text-xs text-muted-foreground">Max 4 MB. Images only.</p>
        </form>
      </GlassCard>

      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-light uppercase tracking-wider">All Photos</h2>
          <button onClick={refresh} className="text-xs text-muted-foreground hover:text-gold-bright uppercase tracking-wider font-display">
            Refresh
          </button>
        </div>
        {loading && <p className="text-muted-foreground text-sm">Loading…</p>}
        {error && <p className="text-destructive text-sm">{error}</p>}
        {!loading && photos.length === 0 && <p className="text-muted-foreground text-sm">No photos yet.</p>}

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {photos.map((photo) => (
            <div key={photo.id} className="relative group rounded-lg overflow-hidden border border-border-subtle">
              <img src={photo.url} alt={photo.caption || photo.filename} className="aspect-square w-full object-cover" />
              {photo.caption && (
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                  <p className="text-foreground text-xs truncate">{photo.caption}</p>
                </div>
              )}
              <button
                onClick={() => handleDelete(photo.id)}
                className="absolute top-1 right-1 p-1.5 rounded-full bg-background/70 text-foreground opacity-0 group-hover:opacity-100 hover:bg-destructive transition"
                aria-label="Delete"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
