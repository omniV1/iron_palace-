import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { FileText, Upload } from "lucide-react";
import { api } from "../api";
import { useLibrary } from "../hooks/useLibrary";
import { CollapsiblePanel } from "../components/CollapsiblePanel";
import { GoldButton } from "../components/GoldButton";
import { IconWell } from "../components/IconWell";
import { inputClassName, labelClassName } from "../components/IconWell";
import {
  AdminDeleteButton,
  AdminForm,
  AdminFormCard,
  AdminFormError,
  AdminFormHint,
  AdminListCard,
  AdminListItem,
  AdminPageGrid,
  adminFileInputClassName,
} from "./AdminPrimitives";

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
  const [uploadOpen, setUploadOpen] = useState(false);
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
    if (!confirm("Delete this file?")) return;
    try {
      await api.deleteLibrary(id);
      setFiles((prev) => prev.filter((f) => f.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : String(err));
    }
  }

  return (
    <AdminPageGrid>
      <AdminFormCard title="Upload File">
        <AdminForm onSubmit={handleUpload}>
          <CollapsiblePanel
            label="File"
            hint={file ? file.name : "Tap to choose"}
            open={uploadOpen}
            onOpenChange={setUploadOpen}
          >
            <div className="space-y-2">
              <input ref={fileRef} type="file" onChange={pickFile} required={!file} className={adminFileInputClassName} />
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
            </div>
          </CollapsiblePanel>

          <AdminFormError message={formError} />

          <GoldButton type="submit" variant="flat" disabled={submitting || !file} className="w-full">
            <Upload className="w-4 h-4" />
            {submitting ? "Uploading…" : "Upload"}
          </GoldButton>
          <AdminFormHint>Max 4 MB per file.</AdminFormHint>
        </AdminForm>
      </AdminFormCard>

      <AdminListCard
        title="All Files"
        onRefresh={refresh}
        loading={loading}
        error={error}
        empty="No files yet."
        isEmpty={files.length === 0}
      >
        <ul className="space-y-3">
          {files.map((f) => (
            <li key={f.id}>
              <AdminListItem>
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
                <AdminDeleteButton onClick={() => handleDelete(f.id)} />
              </AdminListItem>
            </li>
          ))}
        </ul>
      </AdminListCard>
    </AdminPageGrid>
  );
}
