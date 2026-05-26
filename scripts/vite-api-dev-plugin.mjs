import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { loadEnv } from "vite";

const API_ROOT = path.resolve(process.cwd(), "api");

function wrapResponse(res) {
  let statusCode = 200;
  res.status = (code) => {
    statusCode = code;
    return res;
  };
  res.json = (data) => {
    if (!res.headersSent) {
      res.statusCode = statusCode;
      res.setHeader("Content-Type", "application/json");
    }
    res.end(JSON.stringify(data));
  };
  res.send = (data) => {
    res.statusCode = statusCode;
    res.end(data);
  };
  return res;
}

function resolveApiRoute(urlPath) {
  const pathname = urlPath.split("?")[0];
  const segments = pathname.replace(/^\/api\/?/, "").split("/").filter(Boolean);
  if (segments.length === 0) return null;

  const singleFile = path.join(API_ROOT, `${segments.join("/")}.js`);
  if (fs.existsSync(singleFile)) {
    return { file: singleFile, id: null };
  }

  const indexFile = path.join(API_ROOT, ...segments, "index.js");
  if (fs.existsSync(indexFile)) {
    return { file: indexFile, id: null };
  }

  // Optional catch-all [[...slug]].js: e.g. /api/day-stones, /api/day-stones/:id/photo
  if (segments.length >= 1) {
    const optionalCatchAll = path.join(API_ROOT, segments[0], "[[...slug]].js");
    if (fs.existsSync(optionalCatchAll)) {
      return { file: optionalCatchAll, slug: segments.slice(1) };
    }
  }

  // Dynamic [id].js: e.g. /api/events/:id
  if (segments.length >= 2) {
    const id = segments[segments.length - 1];
    const dynamicFile = path.join(API_ROOT, ...segments.slice(0, -1), "[id].js");
    if (fs.existsSync(dynamicFile)) {
      return { file: dynamicFile, id };
    }
  }

  // Catch-all [...path].js: e.g. /api/day-stones/:entryId/photo
  if (segments.length >= 2) {
    const catchAllFile = path.join(API_ROOT, segments[0], "[...path].js");
    if (fs.existsSync(catchAllFile)) {
      return { file: catchAllFile, path: segments.slice(1) };
    }
  }

  return null;
}

/**
 * Run Vercel-style /api handlers during `vite dev`. Without this, Vite serves
 * the raw .js source (which breaks JSON parsing in the frontend).
 */
export function apiDevPlugin() {
  Object.assign(process.env, loadEnv("development", process.cwd(), ""));

  return {
    name: "iron-palace-api-dev",
    enforce: "pre",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url ?? "";
        const pathname = url.split("?")[0];

        if (!pathname.startsWith("/api/") || pathname.startsWith("/api/youtube-feed")) {
          return next();
        }

        const route = resolveApiRoute(pathname);
        if (!route) {
          return next();
        }

        try {
          const mod = await import(`${pathToFileURL(route.file).href}?t=${Date.now()}`);
          const handler = mod.default;
          if (typeof handler !== "function") {
            return next();
          }

          const requestUrl = new URL(url, "http://localhost");
          const query = Object.fromEntries(requestUrl.searchParams);
          if (route.id) query.id = route.id;
          if (route.path) query.path = route.path;
          if (route.slug !== undefined) query.slug = route.slug;

          wrapResponse(res);
          req.query = query;

          await handler(req, res);
        } catch (err) {
          console.error("[api-dev]", pathname, err);
          if (!res.headersSent) {
            res.statusCode = err.statusCode || 500;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: err.message || "server error" }));
          }
        }
      });
    },
  };
}
