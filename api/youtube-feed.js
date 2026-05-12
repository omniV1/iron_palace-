/**
 * Vercel Serverless Function — proxies YouTube channel RSS server-side so the browser
 * never hits CORS. Same path as Vite’s dev proxy (`/api/youtube-feed`).
 *
 * RSS from YouTube often fails from cloud IPs (502). This handler retries with different
 * browser User-Agents, then optionally uses YouTube Data API v3 if `YOUTUBE_API_KEY` is set
 * in the project environment (recommended for production).
 *
 * @see https://vercel.com/docs/functions/serverless-functions
 */
const CHANNEL_ID = "UC9tV0Z2xN1HtvQu5F-ERqpg";

const RSS_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(CHANNEL_ID)}`;

const FETCH_ATTEMPTS = [
  {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  },
  {
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
  },
];

async function fetchRssOnce(headers) {
  const upstream = await fetch(RSS_URL, {
    redirect: "follow",
    headers: {
      Accept: "application/atom+xml,application/xml,text/xml,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
      Referer: "https://www.youtube.com/",
      ...headers,
    },
  });
  const text = await upstream.text();
  return { upstream, text };
}

async function fetchRssWithRetries() {
  for (let i = 0; i < FETCH_ATTEMPTS.length; i++) {
    try {
      const { upstream, text } = await fetchRssOnce(FETCH_ATTEMPTS[i]);
      if (upstream.ok && text.includes("<entry>")) {
        return { ok: true, text };
      }
      console.warn(`[api/youtube-feed] RSS attempt ${i + 1} HTTP ${upstream.status} validBody=${text.includes("<entry>")}`);
    } catch (err) {
      console.warn(`[api/youtube-feed] RSS attempt ${i + 1}`, err?.message ?? err);
    }
    if (i < FETCH_ATTEMPTS.length - 1) {
      await new Promise((r) => setTimeout(r, 400));
    }
  }
  return { ok: false, text: "" };
}

/** Uploads playlist id for a channel id UC… → UU… */
function uploadsPlaylistId(channelId) {
  if (channelId.startsWith("UC")) return `UU${channelId.slice(2)}`;
  return channelId;
}

async function fetchViaDataApi(apiKey) {
  const playlistId = uploadsPlaylistId(CHANNEL_ID);
  const url = new URL("https://www.googleapis.com/youtube/v3/playlistItems");
  url.searchParams.set("part", "snippet,contentDetails");
  url.searchParams.set("maxResults", "50");
  url.searchParams.set("playlistId", playlistId);
  url.searchParams.set("key", apiKey);

  const res = await fetch(url);
  const data = await res.json();

  if (!res.ok) {
    console.error("[api/youtube-feed] Data API error", res.status, data?.error?.message ?? data);
    return null;
  }

  const videos = (data.items ?? [])
    .map((item) => {
      const sn = item.snippet;
      const vid = sn?.resourceId?.videoId ?? "";
      if (!vid) return null;
      const thumbs = sn.thumbnails;
      const thumb =
        thumbs?.high?.url ??
        thumbs?.medium?.url ??
        thumbs?.default?.url ??
        `https://i.ytimg.com/vi/${vid}/hqdefault.jpg`;
      return {
        videoId: vid,
        title: sn.title ?? "",
        published: sn.publishedAt ?? "",
        thumbnail: thumb,
        description: sn.description ?? "",
        views: 0,
      };
    })
    .filter(Boolean);

  if (videos.length === 0) return null;

  return {
    channelId: CHANNEL_ID,
    fetchedAt: new Date().toISOString(),
    videos,
  };
}

export default async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.setHeader("Allow", "GET, HEAD");
    return res.status(405).send("Method Not Allowed");
  }

  if (req.method === "HEAD") {
    return res.status(200).end();
  }

  try {
    const rss = await fetchRssWithRetries();
    if (rss.ok) {
      res.setHeader("Content-Type", "application/atom+xml; charset=utf-8");
      res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
      return res.status(200).send(rss.text);
    }

    const apiKey = process.env.YOUTUBE_API_KEY || process.env.YOUTUBE_DATA_API_KEY;
    if (apiKey) {
      const payload = await fetchViaDataApi(apiKey);
      if (payload) {
        res.setHeader("Content-Type", "application/json; charset=utf-8");
        res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
        return res.status(200).send(JSON.stringify(payload));
      }
    }

    console.error("[api/youtube-feed] RSS and Data API (if configured) both failed");
    return res.status(502).send("RSS fetch failed");
  } catch (err) {
    console.error("[api/youtube-feed]", err);
    return res.status(502).send("RSS fetch failed");
  }
}
