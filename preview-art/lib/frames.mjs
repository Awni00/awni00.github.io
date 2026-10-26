// Frame strip for an animated sketch, to check motion and loop seams.
// node lib/frames.mjs out.png sketches/<base>.js [n=8]
// Row 1: the still (left) + frames t = 0, 1/n, …; each 400×300, plus a 96×72 of the still.
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
const require = createRequire(new URL("../../package.json", import.meta.url));
const { chromium } = require("playwright");
const sharp = require("sharp");

const here = path.dirname(fileURLToPath(import.meta.url));
const [outFile, sketch, nArg] = process.argv.slice(2);
const n = Number(nArg || 8);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
await page.goto(pathToFileURL(path.join(here, "harness.html")).href + `?sketch=${encodeURIComponent(pathToFileURL(path.resolve(sketch)).href)}&theme=paper`);
await page.waitForFunction(() => window.__done === true, null, { timeout: 60000 });
const err = await page.evaluate(() => window.__error);
if (err) { console.error(err); process.exit(1); }
const grab = () => page.evaluate(() => document.querySelector("canvas").toDataURL("image/png")).then((d) => Buffer.from(d.split(",")[1], "base64"));
const tiles = [{ buf: await grab(), cap: "still" }];
for (let k = 0; k <= n; k++) {
  await page.evaluate((tt) => window.__frame(tt, false), k / n);
  tiles.push({ buf: await grab(), cap: k === n ? "t=1 (must equal t=0)" : `t=${k}/${n}` });
}
await browser.close();
const cols = 4, w = 400, h = 300, pad = 12, capH = 22;
const rows = Math.ceil(tiles.length / cols);
const comps = [];
for (let i = 0; i < tiles.length; i++) {
  const x = pad + (i % cols) * (w + pad), y = pad + Math.floor(i / cols) * (h + capH + pad);
  comps.push({ input: await sharp(tiles[i].buf).resize(w, h).png().toBuffer(), left: x, top: y + capH });
  comps.push({ input: Buffer.from(`<svg width="${w}" height="${capH}"><text x="2" y="16" font-family="Menlo" font-size="13" fill="#555">${tiles[i].cap}</text></svg>`), left: x, top: y });
}
comps.push({ input: await sharp(tiles[0].buf).resize(96, 72).png().toBuffer(), left: pad, top: pad + rows * (h + capH + pad) });
await sharp({ create: { width: pad + cols * (w + pad), height: pad + rows * (h + capH + pad) + 72 + pad, channels: 3, background: "#e9e8e5" } }).composite(comps).png().toFile(outFile);
console.log("wrote", outFile);
