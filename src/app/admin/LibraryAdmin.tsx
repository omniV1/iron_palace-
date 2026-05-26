import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { FileText, Trash2, Upload } from "lucide-react";
import { api } from "../api";
import { useLibrary } from "../hooks/useLibrary";
import { GlassCard } from "../components/GlassCard";
import { GoldButton } from "../components/GoldButton";
import { IconWell } from "../components/IconWell";
import { inputClassName, labelClassName } from "../components/IconWell";

const MAX_BYTES = 4 * 1024 * 1024;

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "";
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  let n = bytes;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  return `${n.toFixed(n >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
}

export function LibraryAdmin() {
  const { files, loading, error, refresh, setFiles } = useLibrary();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function pickFile(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setFormError(null);
    if (f && f.size > MAX_BYTES) {
      setFormError("File is larger than 4 MB. Vercel serverless caps uploads — split or compress first.");
      setFile(null);
      return;
    }
    setFile(f);
    if (f && !title) setTitle(f.name);
  }

  async function handleUpload(e: FormEvent) {
    e.preventDefault();
    if (!file) return;
    setSubmitting(true);
    setFormError(null);
    try {
      const uploaded = await api.uploadLibrary(file, title, description);
      setFiles((prev) => [uploaded, ...prev]);
      setFile(null);
      setTitle("");
      setDescription("");
      if (fileRef.current) fileRef.current.value = "";
      refresh();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this file?")) return;
    try {
      await api.deleteLibrary(id);
      setFiles((prev) => prev.filter((f) => f.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : String(err));
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-8">
      <GlassCard className="p-6">
        <h2 className="font-display text-lg font-light uppercase tracking-wider mb-4">Upload File</h2>
        <form onSubmit={handleUpload} className="space-y-3">
          <label className="block">
            <span className={labelClassName}>File</span>
            <input
              ref={fileRef}
              type="file"
              onChange={pickFile}
              required
              className={`${inputClassName} file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:bg-primary file:text-primary-foreground file:cursor-pointer`}
            />
          </label>
          <label className="block">
            <span className={labelClassName}>Title</span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClassName} />
          </label>
          <label className="block">
            <span className={labelClassName}>Description (optional)</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className={inputClassName}
            />
          </label>

          {formError && <p className="text-sm text-destructive">{formError}</p>}

          <GoldButton type="submit" variant="flat" disabled={submitting || !file} className="w-full">
            <Upload className="w-4 h-4" />
            {submitting ? "Uploading…" : "Upload"}
          </GoldButton>
          <p className="text-xs text-muted-foreground">Max 4 MB per file.</p>
        </form>
      </GlassCard>

      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-light uppercase tracking-wider">All Files</h2>
          <button onClick={refresh} className="text-xs text-muted-foreground hover:text-gold-bright uppercase tracking-wider font-display">
            Refresh
          </button>
        </div>
        {loading && <p className="text-muted-foreground text-sm">Loading…</p>}
        {error && <p className="text-destructive text-sm">{error}</p>}
        {!loading && files.length === 0 && <p className="text-muted-foreground text-sm">No files yet.</p>}

        <ul className="space-y-3">
          {files.map((f) => (
            <li key={f.id} className="flex items-start gap-3 bg-input-background border border-border-subtle rounded-xl p-3">
              <IconWell icon={FileText} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{f.title}</p>
                {f.description && <p className="text-muted-foreground text-xs truncate">{f.description}</p>}
                <p className="text-muted-foreground/70 text-xs mt-1">
                  {f.filename} · {formatBytes(f.size)}
                </p>
                <div className="mt-2 flex gap-3 text-xs">
                  <a href={f.url} target="_blank" rel="noopener noreferrer" className="text-gold hover:text-gold-bright">
                    Open
                  </a>
                  <a href={`${f.url}?download`} className="text-gold hover:text-gold-bright">
                    Download
                  </a>
                </div>
              </div>
              <button
                onClick={() => handleDelete(f.id)}
                className="text-muted-foreground hover:text-destructive p-1 shrink-0"
                aria-label="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      </GlassCard>
    </div>
  );
}
