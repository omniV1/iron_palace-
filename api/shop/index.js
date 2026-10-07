import { sendError } from "../_lib/respond.js";

export const SHOP_URL = "https://wudaqc-iw.myshopify.com";

function formatPrice(amount) {
  const n = Number(amount);
  return Number.isFinite(n) ? `$${n.toFixed(2)}` : "";
}

function serialize(product) {
  const variants = product.variants || [];
  const prices = variants.map((v) => Number(v.price)).filter(Number.isFinite);
  const min = prices.length ? Math.min(...prices) : null;
  const max = prices.length ? Math.max(...prices) : null;
  const image = product.images?.[0];
  return {
    id: String(product.id),
    title: product.title,
    handle: product.handle,
    price: min == null ? "" : min === max ? formatPrice(min) : `From ${formatPrice(min)}`,
    available: variants.some((v) => v.available !== false),
    image: image?.src || null,
    imageAlt: image?.alt || product.title,
    url: `${SHOP_URL}/products/${product.handle}`,
  };
}

export default async function handler(req, res) {
  try {
    if (req.method !== "GET") {
      res.setHeader("Allow", "GET");
      return res.status(405).json({ error: "method not allowed" });
    }

    const upstream = await fetch(`${SHOP_URL}/products.json?limit=250`, {
      headers: { Accept: "application/json" },
    });
    if (!upstream.ok) {
      const err = new Error(`shop responded ${upstream.status}`);
      err.statusCode = 502;
      throw err;
    }
    const data = await upstream.json();
    const products = (data.products || []).map(serialize);

    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=3600");
    return res.status(200).json({ products, shopUrl: SHOP_URL });
  } catch (err) {
    return sendError(res, err, "[api/shop]");
  }
}
