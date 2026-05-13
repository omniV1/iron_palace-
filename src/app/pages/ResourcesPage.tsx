import { motion } from "motion/react";
import { ArrowLeft, Download, FileText, FileImage, FileVideo, FileAudio, FileArchive } from "lucide-react";
import { useLibrary } from "../hooks/useLibrary";
import imgNewLogo from "../../assets/feef32863d06775804f6af6bbe43f8df154b97b4.png?w=500&format=webp&quality=85";

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

function iconFor(contentType: string) {
  if (contentType.startsWith("image/")) return FileImage;
  if (contentType.startsWith("video/")) return FileVideo;
  if (contentType.startsWith("audio/")) return FileAudio;
  if (contentType.includes("zip") || contentType.includes("compressed") || contentType.includes("archive")) {
    return FileArchive;
  }
  return FileText;
}

export default function ResourcesPage() {
  const { files, loading, error } = useLibrary();

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-white/10 bg-black/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3 text-zinc-400 hover:text-amber-500 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wider">Back to site</span>
          </a>
          <a href="/" className="absolute left-1/2 -translate-x-1/2">
            <img src={imgNewLogo} alt="Iron Palace Podcast" className="h-12 w-auto" />
          </a>
          <div className="w-24" />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-light tracking-wide uppercase mb-4">Resources</h1>
          <p className="text-zinc-400 text-sm">Downloads, schedules, and other materials from the crew</p>
        </motion.div>

        {loading && <p className="text-zinc-400 text-sm text-center">Loading…</p>}
        {error && <p className="text-red-400 text-sm text-center">Couldn't load resources: {error}</p>}

        {!loading && !error && files.length === 0 && (
          <div className="text-center py-16">
            <FileText className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
            <p className="text-zinc-500 text-sm">No resources have been posted yet. Check back soon.</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {files.map((file, idx) => {
            const Icon = iconFor(file.contentType);
            return (
              <motion.a
                key={file.id}
                href={`${file.url}?download`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ y: -2 }}
                className="group flex items-start gap-4 bg-zinc-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-5 hover:border-amber-500/50 hover:bg-zinc-900/80 transition-all"
              >
                <div className="bg-amber-600/10 p-3 rounded-xl ring-1 ring-amber-600/20 shrink-0 group-hover:bg-amber-600/20 transition-colors">
                  <Icon className="w-6 h-6 text-amber-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-medium truncate">{file.title}</p>
                  {file.description && (
                    <p className="text-zinc-400 text-sm mt-1 line-clamp-2">{file.description}</p>
                  )}
                  <p className="text-zinc-500 text-xs mt-2">{formatBytes(file.size)}</p>
                </div>
                <Download className="w-5 h-5 text-zinc-400 group-hover:text-amber-500 transition-colors shrink-0 mt-1" />
              </motion.a>
            );
          })}
        </div>
      </main>
    </div>
  );
}
