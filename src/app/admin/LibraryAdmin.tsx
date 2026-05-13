import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { FileText, Trash2, Upload } from "lucide-react";
import { api } from "../api";
import { useLibrary } from "../hooks/useLibrary";

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
      <section className="bg-zinc-900/60 border border-white/10 rounded-2xl p-6">
        <h2 className="text-lg font-light uppercase tracking-wider mb-4">Upload File</h2>
        <form onSubmit={handleUpload} className="space-y-3">
          <label className="block">
            <span className="text-xs uppercase tracking-wider text-zinc-400">File</span>
            <input
              ref={fileRef}
              type="file"
              onChange={pickFile}
              required
              className="mt-1 w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:bg-amber-600 file:text-white file:cursor-pointer"
            />
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-wider text-zinc-400">Title</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/60"
            />
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-wider text-zinc-400">Description (optional)</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-1 w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/60"
            />
          </label>

          {formError && <p className="text-sm text-red-400">{formError}</p>}

          <button
            type="submit"
            disabled={submitting || !file}
            className="w-full inline-flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-medium py-2 rounded-lg transition-colors"
          >
            <Upload className="w-4 h-4" />
            {submitting ? "Uploading…" : "Upload"}
          </button>
          <p className="text-xs text-zinc-500">Max 4 MB per file.</p>
        </form>
      </section>

      <section className="bg-zinc-900/60 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-light uppercase tracking-wider">All Files</h2>
          <button onClick={refresh} className="text-xs text-zinc-400 hover:text-amber-500 uppercase tracking-wider">
            Refresh
          </button>
        </div>
        {loading && <p className="text-zinc-400 text-sm">Loading…</p>}
        {error && <p className="text-red-400 text-sm">{error}</p>}
        {!loading && files.length === 0 && <p className="text-zinc-500 text-sm">No files yet.</p>}

        <ul className="space-y-3">
          {files.map((f) => (
            <li key={f.id} className="flex items-start gap-3 bg-black/40 border border-white/5 rounded-xl p-3">
              <div className="bg-amber-600/10 p-2 rounded-lg ring-1 ring-amber-600/20 shrink-0">
                <FileText className="w-5 h-5 text-amber-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{f.title}</p>
                {f.description && <p className="text-zinc-400 text-xs truncate">{f.description}</p>}
                <p className="text-zinc-500 text-xs mt-1">
                  {f.filename} · {formatBytes(f.size)}
                </p>
                <div className="mt-2 flex gap-3 text-xs">
                  <a href={f.url} target="_blank" rel="noopener noreferrer" className="text-amber-500 hover:text-amber-400">
                    Open
                  </a>
                  <a href={`${f.url}?download`} className="text-amber-500 hover:text-amber-400">
                    Download
                  </a>
                </div>
              </div>
              <button
                onClick={() => handleDelete(f.id)}
                className="text-zinc-500 hover:text-red-400 p-1 shrink-0"
                aria-label="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
