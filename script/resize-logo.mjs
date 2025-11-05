// tools/convert-to-webp.mjs
import fs from "fs/promises";
import path from "path";
import sharp from "sharp";

/**
 * USAGE:
 * node tools/convert-to-webp.mjs --quality 80 --roots public public/team --overwrite --delete-originals --lossless-on-png
 *
 * Flags:
 *   --quality <0-100>         Qualité WebP (par défaut 80)
 *   --roots <dirs...>         Dossiers à traiter (par défaut: public, public/team)
 *   --overwrite               Reconvertit même si .webp existe déjà
 *   --delete-originals        Supprime .jpg/.jpeg/.png après conversion
 *   --lossless-on-png         Convertit les PNG en WebP lossless (logos/icônes)
 *   --dry-run                 Affiche ce qui serait fait, sans écrire
 */

const args = process.argv.slice(2);
const readFlag = (name, fallback = undefined) => {
  const i = args.indexOf(name);
  if (i === -1) return fallback;
  if (i === args.length - 1 || args[i + 1].startsWith("--")) return true;
  return args[i + 1];
};

const qualityArg = Number(readFlag("--quality", 80));
const overwrite = Boolean(readFlag("--overwrite", false) === true);
const deleteOriginals = Boolean(readFlag("--delete-originals", false) === true);
const losslessOnPng = Boolean(readFlag("--lossless-on-png", false) === true);
const dryRun = Boolean(readFlag("--dry-run", false) === true);

// Roots: collect all non-flag trailing values after --roots
let roots = [];
{
  const i = args.indexOf("--roots");
  if (i !== -1) {
    for (let j = i + 1; j < args.length && !args[j].startsWith("--"); j++) {
      roots.push(args[j]);
    }
  }
}
if (roots.length === 0) roots = ["public", path.join("public", "team")];

const VALID_EXTS = new Set([".jpg", ".jpeg", ".png"]);

async function exists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function* walk(dir) {
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      yield* walk(full);
    } else {
      yield full;
    }
  }
}

async function convertOne(input) {
  const ext = path.extname(input).toLowerCase();
  if (!VALID_EXTS.has(ext)) return { skipped: true, reason: "ext" };

  const out = input.slice(0, -ext.length) + ".webp";

  if (!overwrite && (await exists(out))) {
    // Skip if output is newer or same mtime
    const [statIn, statOut] = await Promise.all([fs.stat(input), fs.stat(out)]);
    if (statOut.mtimeMs >= statIn.mtimeMs) {
      return { skipped: true, reason: "up-to-date", input, out };
    }
  }

  const webpOpts = { quality: isNaN(qualityArg) ? 80 : qualityArg };
  if (losslessOnPng && ext === ".png") webpOpts.lossless = true;

  if (dryRun) {
    return { dryRun: true, input, out, webpOpts };
  }

  await sharp(input).webp(webpOpts).toFile(out);

  if (deleteOriginals) {
    await fs.unlink(input);
  }

  return { converted: true, input, out, webpOpts };
}

async function main() {
  console.log(`Roots: ${roots.join(", ")}`);
  console.log(
    `Options → quality=${qualityArg}, overwrite=${overwrite}, deleteOriginals=${deleteOriginals}, losslessOnPng=${losslessOnPng}, dryRun=${dryRun}`
  );

  let files = [];
  for (const r of roots) {
    if (await exists(r)) {
      for await (const f of walk(r)) files.push(f);
    } else {
      console.warn(`(skip) not found: ${r}`);
    }
  }

  // Simple concurrency control
  const CONC = 8;
  let idx = 0, ok = 0, skip = 0;

  async function worker() {
    while (idx < files.length) {
      const i = idx++;
      const res = await convertOne(files[i]).catch(err => ({ error: err, input: files[i] }));
      if (res?.converted) {
        ok++;
        console.log(`✔ WEBP: ${path.relative(process.cwd(), res.out)}  ←  ${path.relative(process.cwd(), res.input)} ${res.webpOpts?.lossless ? "(lossless)" : ""}`);
      } else if (res?.dryRun) {
        console.log(`(dry-run) would convert → ${path.relative(process.cwd(), res.out)} from ${path.relative(process.cwd(), res.input)}`);
      } else if (res?.skipped) {
        skip++;
      } else if (res?.error) {
        console.error(`✖ Error: ${res.input}\n   ${res.error}`);
      }
    }
  }

  const workers = Array.from({ length: CONC }, () => worker());
  await Promise.all(workers);

  console.log(`\nDone. Converted: ${ok}, Skipped: ${skip}, Total scanned: ${files.length}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
