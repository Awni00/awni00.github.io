// Export the selected preview of each paper to public/publications/<slug>.webp.
//
//   node preview-art/lib/export.mjs            # every paper in selection.json
//   node preview-art/lib/export.mjs cot-info   # just these slugs
//
// Static picks: papers/<slug>/<ID>.paper.png → 800×600 WebP.
// Animated picks: papers/<slug>/<ID>.paper.webp (already 800×600) is copied as is;
// the still stays in papers/<slug>/ as <ID>.paper.png.
// Render first with `node preview-art/lib/render.mjs --all`.
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const artRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = path.resolve(artRoot, "..");
const require = createRequire(path.join(repoRoot, "package.json"));
const sharp = require("sharp");

const LIMIT = 200 * 1024;
const outDir = path.join(repoRoot, "public", "publications");
const selection = JSON.parse(fs.readFileSync(path.join(artRoot, "selection.json"), "utf8"));
const only = process.argv.slice(2);

for (const [slug, id] of Object.entries(selection)) {
  if (only.length && !only.includes(slug)) continue;
  if (!id) { console.log(`skip ${slug}: no selection`); continue; }
  const dir = path.join(artRoot, "papers", slug);
  const anim = path.join(dir, `${id}.paper.webp`);
  const still = path.join(dir, `${id}.paper.png`);
  const out = path.join(outDir, `${slug}.webp`);
  if (fs.existsSync(anim)) {
    fs.copyFileSync(anim, out);
  } else if (fs.existsSync(still)) {
    // Lower the quality only if a busy image would exceed the size budget.
    for (const quality of [86, 80, 72, 64]) {
      await sharp(still).resize(800, 600).webp({ quality, effort: 6 }).toFile(out);
      if (fs.statSync(out).size <= LIMIT) break;
    }
  } else {
    console.error(`missing render for ${slug} ${id}; run render.mjs first`);
    process.exitCode = 1;
    continue;
  }
  const kb = Math.round(fs.statSync(out).size / 1024);
  console.log(`${kb > LIMIT / 1024 ? "OVER" : "ok"} ${path.relative(repoRoot, out)} ${id}${fs.existsSync(anim) ? " (animated)" : ""} ${kb}KB`);
}
