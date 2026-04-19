/**
 * Fetches channel RSS on the build machine (no CORS) and writes public/youtube-videos.json.
 * Keep CHANNEL_ID in sync with src/app/hooks/useYouTubeVideos.ts
 *
 * YouTube often blocks or errors for datacenter IPs (e.g. Vercel). If fetch fails, we still
 * write an empty list and exit 0 so the build passes; the app then loads the feed in the
 * browser (user IP) via the existing fallbacks.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const CHANNEL_ID = "UC9tV0Z2xN1HtvQu5F-ERqpg";
const RSS_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "..", "public");
const outFile = join(outDir, "youtube-videos.json");

/** Browser-like headers — plain "bot" User-Agents often get 403/404 from YouTube on cloud IPs. */
const BROWSER_HEADERS = {
  Accept: "application/atom+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
  Referer: "https://www.youtube.com/",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
};

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
      entry.match(/<media:description>([\s\S]*?)<\/media:description>/i)?.[1]?.trim() ?? "";

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

async function fetchRssWithRetry() {
  const attempts = [
    { headers: BROWSER_HEADERS },
    {
      headers: {
        ...BROWSER_HEADERS,
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
      },
    },
  ];

  for (let i = 0; i < attempts.length; i++) {
    try {
      const res = await fetch(RSS_URL, {
        redirect: "follow",
        ...attempts[i],
      });
      if (!res.ok) {
        console.warn(`fetch-youtube-feed: attempt ${i + 1} HTTP ${res.status}`);
        continue;
      }
      const xml = await res.text();
      if (!xml.includes("<entry>")) {
        console.warn(`fetch-youtube-feed: attempt ${i + 1} body had no Atom entries`);
        continue;
      }
      const videos = parseYouTubeRssXml(xml);
      if (videos.length === 0) {
        console.warn(`fetch-youtube-feed: attempt ${i + 1} parsed zero videos`);
        continue;
      }
      return videos;
    } catch (err) {
      console.warn(`fetch-youtube-feed: attempt ${i + 1} error`, err?.message ?? err);
    }
  }
  return null;
}

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

const videos = await fetchRssWithRetry();

if (videos && videos.length > 0) {
  writePayload(videos);
  console.log(`fetch-youtube-feed: wrote ${videos.length} videos -> ${outFile}`);
  process.exit(0);
}

const msg =
  "RSS unreachable from this network (common on cloud build VMs). Build continues; the site will load the feed in the browser.";
console.warn(`fetch-youtube-feed: ${msg}`);
writePayload(
  [],
  "feed_unavailable_at_build — runtime will use RSS fallbacks in the browser",
);
process.exit(0);
