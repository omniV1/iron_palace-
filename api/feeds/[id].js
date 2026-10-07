/**
 * Public read-only feeds, combined into one function to stay under
 * Vercel's serverless function limit:
 *   GET /api/feeds/shop     — Shopify products
 *   GET /api/feeds/youtube  — latest uploads as { videos, shorts, live }
 */
import { SHOP_URL, fetchShopProducts } from "../_lib/shop.js";
import { CHANNEL_ID, fetchLatestFeed } from "../_lib/youtube.js";
import { sendError } from "../_lib/respond.js";

async function shop(req, res) {
  const products = await fetchShopProducts();
  res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=3600");
  return res.status(200).json({ products, shopUrl: SHOP_URL });
}

/** Last good feed on this warm instance, served if YouTube has a hiccup. */
let lastGoodFeed = null;

async function youtube(req, res) {
  // ?debug=1 shows how each upload was sorted; never cached.
  if (req.query.debug) {
    const { feed, notes } = await fetchLatestFeed({ debug: true });
    res.setHeader("Cache-Control", "no-store");
    return res.status(feed ? 200 : 502).json({ ...feed, details: notes });
  }

  const { feed, notes } = await fetchLatestFeed();
  if (feed) {
    lastGoodFeed = { channelId: CHANNEL_ID, fetchedAt: new Date().toISOString(), ...feed };
  } else {
    console.warn("[api/feeds/youtube]", notes.join(" | "));
  }

  if (!lastGoodFeed) {
    res.setHeader("Cache-Control", "no-store");
    return res.status(502).json({ error: "youtube feed unavailable", details: notes });
  }

  // CDN keeps it for 10 minutes and serves the last good copy while refreshing,
  // so new uploads show up within minutes without hammering YouTube. A stale copy
  // is only cached briefly so the next request retries YouTube.
  res.setHeader(
    "Cache-Control",
    feed ? "s-maxage=600, stale-while-revalidate=86400" : "s-maxage=60",
  );
  return res.status(200).json(feed ? lastGoodFeed : { ...lastGoodFeed, stale: true, details: notes });
}

const feeds = { shop, youtube };

export default async function handler(req, res) {
  try {
    if (req.method !== "GET") {
      res.setHeader("Allow", "GET");
      return res.status(405).json({ error: "method not allowed" });
    }
    const feed = feeds[req.query.id];
    if (!feed) return res.status(404).json({ error: "unknown feed" });
    return await feed(req, res);
  } catch (err) {
    return sendError(res, err, "[api/feeds]");
  }
}
