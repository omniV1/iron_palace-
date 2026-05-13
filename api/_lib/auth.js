/**
 * Tiny stateless auth: a single shared admin password unlocks a signed cookie.
 *
 * The cookie value is `<expISO>.<hmac>`. Server re-computes the HMAC with
 * ADMIN_SESSION_SECRET to verify. No DB lookup, no JWT library.
 */
import crypto from "node:crypto";

const COOKIE_NAME = "ipa_session";
const DEFAULT_TTL_DAYS = 30;
const SECRET = process.env.ADMIN_SESSION_SECRET || "";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";

if (!SECRET) {
  console.warn("[api/auth] ADMIN_SESSION_SECRET is not set — admin login will not work until configured.");
}
if (!ADMIN_PASSWORD) {
  console.warn("[api/auth] ADMIN_PASSWORD is not set — admin login will not work until configured.");
}

function sign(value) {
  return crypto.createHmac("sha256", SECRET).update(value).digest("hex");
}

function constantTimeEqual(a, b) {
  const aBuf = Buffer.from(a, "utf8");
  const bBuf = Buffer.from(b, "utf8");
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

export function makeSessionCookie(ttlDays = DEFAULT_TTL_DAYS) {
  if (!SECRET) throw new Error("ADMIN_SESSION_SECRET not configured");
  const exp = new Date(Date.now() + ttlDays * 86_400_000).toISOString();
  const sig = sign(exp);
  const value = `${exp}.${sig}`;
  const maxAge = ttlDays * 86_400;
  return `${COOKIE_NAME}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=${maxAge}`;
}

export function clearSessionCookie() {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=0`;
}

function parseCookies(req) {
  const header = req.headers?.cookie;
  if (!header) return {};
  const out = {};
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx < 0) continue;
    const k = part.slice(0, idx).trim();
    const v = part.slice(idx + 1).trim();
    if (k) out[k] = decodeURIComponent(v);
  }
  return out;
}

export function isAuthenticated(req) {
  if (!SECRET) return false;
  const cookies = parseCookies(req);
  const raw = cookies[COOKIE_NAME];
  if (!raw) return false;
  const dot = raw.lastIndexOf(".");
  if (dot < 0) return false;
  const exp = raw.slice(0, dot);
  const sig = raw.slice(dot + 1);
  const expected = sign(exp);
  if (!constantTimeEqual(sig, expected)) return false;
  const expMs = Date.parse(exp);
  if (!Number.isFinite(expMs) || expMs < Date.now()) return false;
  return true;
}

export function verifyPassword(candidate) {
  if (!ADMIN_PASSWORD) return false;
  if (typeof candidate !== "string") return false;
  return constantTimeEqual(candidate, ADMIN_PASSWORD);
}

/**
 * Use as: `if (!requireAdmin(req, res)) return;`
 * Writes a 401 + JSON body if not authenticated.
 */
export function requireAdmin(req, res) {
  if (isAuthenticated(req)) return true;
  res.status(401).json({ error: "unauthorized" });
  return false;
}
