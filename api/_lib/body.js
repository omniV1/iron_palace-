/**
 * Helpers to read request bodies. Vercel parses JSON for us when the
 * Content-Type is application/json, but binary uploads need the raw stream.
 */

export async function readRawBody(req, maxBytes = 25 * 1024 * 1024) {
  const chunks = [];
  let received = 0;
  for await (const chunk of req) {
    received += chunk.length;
    if (received > maxBytes) {
      const err = new Error("payload too large");
      err.statusCode = 413;
      throw err;
    }
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

export function readJsonBody(req) {
  if (req.body && typeof req.body === "object") return Promise.resolve(req.body);
  return readRawBody(req).then((buf) => {
    if (!buf.length) return {};
    try {
      return JSON.parse(buf.toString("utf8"));
    } catch {
      const err = new Error("invalid JSON");
      err.statusCode = 400;
      throw err;
    }
  });
}
