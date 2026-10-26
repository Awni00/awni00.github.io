// Render preview-art sketches (stills, plus a looping WebP for animated ones).
//
//   node preview-art/lib/render.mjs [--themes paper,ink] [--anim-themes paper] [--no-anim] [--out dir] <sketch.js ...>
//   node preview-art/lib/render.mjs --all            # every sketch under preview-art/papers/
//
// Outputs go next to each sketch unless --out is given:
//   <ID>.<theme>.png     1200×900 still, one per theme
//   <ID>.<theme>.webp    800×600 looping animated WebP (animated sketches only; needs img2webp)
import { createRequire } from "node:module";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const artRoot = path.resolve(here, "..");
const require = createRequire(path.resolve(artRoot, "..", "package.json"));
const { chromium } = require("playwright");
const sharp = require("sharp");

const args = process.argv.slice(2);
let themes = ["paper", "ink"];
let animThemes = ["paper"];
let out = null;
const files = [];
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--themes") themes = args[++i].split(",");
  else if (args[i] === "--anim-themes") animThemes = args[++i].split(",");
  else if (args[i] === "--no-anim") animThemes = [];
  else if (args[i] === "--out") out = path.resolve(args[++i]);
  else if (args[i] === "--all") {
    const papers = path.join(artRoot, "papers");
    for (const d of fs.readdirSync(papers)) {
      const dir = path.join(papers, d);
      if (fs.statSync(dir).isDirectory()) for (const f of fs.readdirSync(dir)) if (f.endsWith(".js")) files.push(path.join(dir, f));
    }
  } else files.push(path.resolve(args[i]));
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
const grab = async () => Buffer.from((await page.evaluate(() => document.querySelector("canvas").toDataURL("image/png"))).split(",")[1], "base64");
let failures = 0;
for (const file of files) {
  const base = path.basename(file, ".js");
  const dest = out ?? path.dirname(file);
  fs.mkdirSync(dest, { recursive: true });
  for (const theme of themes) {
    await page.goto(pathToFileURL(path.join(here, "harness.html")).href + `?sketch=${encodeURIComponent(pathToFileURL(file).href)}&theme=${theme}`);
    await page.waitForFunction(() => window.__done === true, null, { timeout: 60000 });
    const err = await page.evaluate(() => window.__error);
    if (err) { console.error(`FAIL ${base} [${theme}]: ${err}`); failures++; continue; }
    const png = path.join(dest, `${base}.${theme}.png`);
    fs.writeFileSync(png, await grab());
    console.log(`ok ${path.relative(process.cwd(), png)} ${(fs.statSync(png).size / 1024).toFixed(0)}KB`);
    const anim = await page.evaluate(() => window.__art && window.__art.anim);
    if (anim && animThemes.includes(theme)) {
      const fps = anim.fps ?? 20, n = Math.round((anim.duration ?? 4) * fps);
      const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "preview-art-"));
      const frames = [];
      for (let k = 0; k < n; k++) {
        await page.evaluate((tt) => window.__frame(tt, false), k / n);
        const f = path.join(tmp, `f${String(k).padStart(4, "0")}.png`);
        await sharp(await grab()).resize(800, 600).png().toFile(f);
        frames.push(f);
      }
      const webp = path.join(dest, `${base}.${theme}.webp`);
      execFileSync("img2webp", ["-loop", "0", "-lossy", "-q", String(anim.quality ?? 70), "-m", "6", "-d", String(Math.round(1000 / fps)), ...frames, "-o", webp], { stdio: "ignore" });
      fs.rmSync(tmp, { recursive: true, force: true });
      console.log(`ok ${path.relative(process.cwd(), webp)} ${n} frames ${(fs.statSync(webp).size / 1024).toFixed(0)}KB`);
    }
  }
}
await browser.close();
process.exit(failures ? 1 : 0);
