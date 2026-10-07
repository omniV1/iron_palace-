/**
 * Writes public/youtube-videos.json at build time. This is only a fallback snapshot:
 * the site loads the live list from /api/feeds/youtube at runtime, and uses this file
 * only if that endpoint is unavailable.
 *
 * YouTube often blocks or errors for datacenter IPs (e.g. Vercel). If fetch fails, we still
 * write an empty list and exit 0 so the build passes.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { CHANNEL_ID, fetchLatestVideos } from "../api/_lib/youtube.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "..", "public");
const outFile = join(outDir, "youtube-videos.json");

function writePayload(videos, warning) {
  mkdirSync(outDir, { recursive: true });
  const payload = {
    channelId: CHANNEL_ID,
    fetchedAt: new Date().toISOString(),
    videos,
    ...(warning ? { _warning: warning } : {}),
  };
  writeFileSync(outFile, JSON.stringify(payload, null, 2), "utf8");
}

const videos = await fetchLatestVideos();

if (videos && videos.length > 0) {
  writePayload(videos);
  console.log(`fetch-youtube-feed: wrote ${videos.length} videos -> ${outFile}`);
  process.exit(0);
}

console.warn(
  "fetch-youtube-feed: feed unreachable from this network (common on cloud build VMs). Build continues; the site loads /api/feeds/youtube at runtime.",
);
writePayload([], "feed_unavailable_at_build — runtime uses /api/feeds/youtube");
process.exit(0);
