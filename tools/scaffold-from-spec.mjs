import fs from "fs";
import path from "path";
const specPath = process.argv[2] || "llm-site-spec.json";
if (!fs.existsSync(specPath)) { console.error("Spec not found:", specPath); process.exit(1); }
const raw = fs.readFileSync(specPath, "utf8");
const text = raw.replace(/^\uFEFF/, ""); // strip BOM si present
const spec = JSON.parse(text);
const write = (p,c)=>{ fs.mkdirSync(path.dirname(p), { recursive:true }); fs.writeFileSync(p, c, "utf8"); console.log("Wrote", p); };
if (spec.layout) for (const [n,c] of Object.entries(spec.layout)) write(path.join("src","layouts",n), c);
if (spec.components) for (const [n,c] of Object.entries(spec.components)) write(path.join("src","components",n), c);
if (spec.pages) for (const [n,c] of Object.entries(spec.pages)) write(path.join("src","pages",n), c);
console.log("Done.");
