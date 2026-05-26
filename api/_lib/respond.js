export function sendError(res, err, tag) {
  const status = err.statusCode || 500;
  if (status >= 500) console.error(tag, err);
  return res.status(status).json({ error: err.message || "server error" });
}
