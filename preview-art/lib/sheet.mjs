// Contact sheet: node lib/sheet.mjs out.png renders/a.paper.png renders/b.paper.png ...
// Each image shown at 600x450 with a 96x72 and 192x144 (2x) thumbnail below.
import { createRequire } from "node:module";
const require = createRequire(new URL("../../package.json", import.meta.url));
const sharp = require("sharp");
const [out, ...files] = process.argv.slice(2);
const cw = 620, ch = 620;
const comps = [];
for (const [k, f] of files.entries()) {
  const big = await sharp(f).resize(600, 450).png().toBuffer();
  const th = await sharp(f).resize(96, 72).png().toBuffer();
  const th2 = await sharp(th).resize(192, 144, { kernel: "nearest" }).png().toBuffer();
  const x = (k % 2) * cw, y = Math.floor(k / 2) * ch;
  comps.push({ input: big, left: x + 10, top: y + 10 }, { input: th, left: x + 10, top: y + 475 }, { input: th2, left: x + 130, top: y + 465 });
}
const rows = Math.ceil(files.length / 2);
await sharp({ create: { width: cw * 2, height: ch * rows, channels: 3, background: "#9a9a9a" } }).composite(comps).png().toFile(out);
