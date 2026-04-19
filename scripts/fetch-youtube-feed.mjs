/**
 * Fetches channel RSS on the build machine (no CORS) and writes public/youtube-videos.json.
 * Keep CHANNEL_ID in sync with src/app/hooks/useYouTubeVideos.ts
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const CHANNEL_ID = "UC9tV0Z2xN1HtvQu5F-ERqpg";
const RSS_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "..", "public");
const outFile = join(outDir, "youtube-videos.json");

/** Mirrors the browser parseRSS logic enough for our UI (Atom + YouTube namespaces). */
function parseYouTubeRssXml(xml) {
  const videos = [];
  const chunks = xml.split("<entry>");
  for (let i = 1; i < chunks.length; i++) {
    const entry = chunks[i].split("</entry>")[0];
    let videoId =
      entry.match(/<yt:videoId>([^<]*)<\/yt:videoId>/i)?.[1]?.trim() ??
      entry.match(/<[^:]*:videoId>([^<]*)<\/[^:]*:videoId>/i)?.[1]?.trim();
    if (!videoId) {
      const idTag = entry.match(/<id>[^<]*:video:([^<]+)<\/id>/i);
      videoId = idTag?.[1]?.trim();
    }
    if (!videoId) continue;

    const title =
      entry.match(/<media:title>([^<]*)<\/media:title>/i)?.[1]?.trim() ??
      entry.match(/<title>([^<]*)<\/title>/i)?.[1]?.trim() ??
      "";

    const published = entry.match(/<published>([^<]*)<\/published>/i)?.[1]?.trim() ?? "";

    const thumbUrl =
      entry.match(/<media:thumbnail[^>]*url="([^"]+)"/i)?.[1] ??
      `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

    const description =
      entry.match(/<media:description>([\s\S]*?)<\/media:description>/i)?.[1]?.trim() ??
      "";

    const viewsMatch = entry.match(/views="(\d+)"/i);
    const views = viewsMatch ? parseInt(viewsMatch[1], 10) : 0;

    videos.push({
      videoId,
      title,
      published,
      thumbnail: thumbUrl,
      description,
      views: Number.isFinite(views) ? views : 0,
    });
  }
  return videos;
}

const res = await fetch(RSS_URL, {
  headers: {
    Accept: "application/atom+xml, application/xml, text/xml, */*",
    "User-Agent": "IronPalacePodcast/1.0 (build; +https://www.youtube.com/)",
  },
});

if (!res.ok) {
  console.error(`fetch-youtube-feed: RSS HTTP ${res.status}`);
  process.exit(1);
}

const xml = await res.text();
if (!xml.includes("<entry>")) {
  console.error("fetch-youtube-feed: unexpected RSS body (no entries)");
  process.exit(1);
}

const videos = parseYouTubeRssXml(xml);
if (videos.length === 0) {
  console.error("fetch-youtube-feed: parsed zero videos");
  process.exit(1);
}

mkdirSync(outDir, { recursive: true });
const payload = {
  channelId: CHANNEL_ID,
  fetchedAt: new Date().toISOString(),
  videos,
};
writeFileSync(outFile, JSON.stringify(payload, null, 2), "utf8");
console.log(`fetch-youtube-feed: wrote ${videos.length} videos -> ${outFile}`);
