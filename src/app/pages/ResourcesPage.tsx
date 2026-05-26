import { motion } from "motion/react";
import { Download, FileText, FileImage, FileVideo, FileAudio, FileArchive } from "lucide-react";
import { useLibrary } from "../hooks/useLibrary";
import { PageShell } from "../components/PageShell";
import { SiteHeader } from "../components/SiteHeader";
import { SectionHeading } from "../components/SectionHeading";
import { GlassCard } from "../components/GlassCard";
import { IconWell } from "../components/IconWell";

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
    <PageShell>
      <SiteHeader />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <SectionHeading
            title="Resources"
            subtitle="Downloads, schedules, and other materials from the crew"
          />
        </motion.div>

        {loading && <p className="text-muted-foreground text-sm text-center">Loading…</p>}
        {error && <p className="text-destructive text-sm text-center">Couldn't load resources: {error}</p>}

        {!loading && !error && files.length === 0 && (
          <div className="text-center py-16">
            <FileText className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground text-sm">No resources have been posted yet. Check back soon.</p>
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
                className="group"
              >
                <GlassCard hover className="flex items-start gap-4 p-5">
                  <IconWell icon={Icon} />
                  <div className="flex-1 min-w-0">
                    <p className="text-lg font-medium truncate font-display">{file.title}</p>
                    {file.description && (
                      <p className="text-muted-foreground text-sm mt-1 line-clamp-2">{file.description}</p>
                    )}
                    <p className="text-muted-foreground/70 text-xs mt-2">{formatBytes(file.size)}</p>
                  </div>
                  <Download className="w-5 h-5 text-muted-foreground group-hover:text-gold-bright transition-colors shrink-0 mt-1" />
                </GlassCard>
              </motion.a>
            );
          })}
        </div>
      </main>
    </PageShell>
  );
}
