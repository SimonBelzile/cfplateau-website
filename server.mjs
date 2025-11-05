// server.mjs
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const dist = path.join(__dirname, "dist");

// 1 an + immutable pour les bundles hashés (_astro/*)
app.use((req, res, next) => {
  if (req.url.startsWith("/_astro/")) {
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
  } else if (/\.(?:css|js|webp|avif|jpg|jpeg|png|svg|woff2)$/.test(req.url)) {
    // 7 jours pour les assets non hashés (images du dossier public par ex.)
    res.setHeader("Cache-Control", "public, max-age=604800");
  }
  next();
});

app.use(express.static(dist, { extensions: ["html"] }));

// fallback SPA
app.get("*", (_req, res) => res.sendFile(path.join(dist, "index.html")));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server on :${port}`));
