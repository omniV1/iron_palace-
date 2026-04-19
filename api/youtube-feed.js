/**
 * Vercel Serverless Function — proxies YouTube channel RSS server-side so the browser
 * never hits CORS. Same path as Vite’s dev proxy (`/api/youtube-feed`).
 *
 * @see https://vercel.com/docs/functions/serverless-functions
 */
const CHANNEL_ID = "UC9tV0Z2xN1HtvQu5F-ERqpg";

export default async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.setHeader("Allow", "GET, HEAD");
    return res.status(405).send("Method Not Allowed");
  }

  const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(CHANNEL_ID)}`;

  try {
    const upstream = await fetch(rssUrl, {
      redirect: "follow",
      headers: {
        Accept: "application/atom+xml,application/xml,text/xml,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        Referer: "https://www.youtube.com/",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      },
    });

    const text = await upstream.text();

    if (!upstream.ok) {
      return res.status(502).send(`Upstream RSS HTTP ${upstream.status}`);
    }

    if (!text.includes("<entry>")) {
      return res.status(502).send("Upstream RSS body invalid");
    }

    res.setHeader("Content-Type", "application/atom+xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
    return res.status(200).send(text);
  } catch (err) {
    console.error("[api/youtube-feed]", err);
    return res.status(502).send("RSS fetch failed");
  }
}
