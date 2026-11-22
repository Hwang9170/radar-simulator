// Pixel diff between two PNGs: count, bounding box, max channel delta. Writes a red mask when a third path is given.
import fs from 'node:fs';
import { PNG } from 'pngjs';
const [pa, pb, outPath] = process.argv.slice(2);
const a = PNG.sync.read(fs.readFileSync(pa)), b = PNG.sync.read(fs.readFileSync(pb));
let n = 0, x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1, mx = 0;
const m = new PNG({ width: a.width, height: a.height });
for (let i = 0; i < a.data.length; i += 4) {
  const d = Math.max(...[0, 1, 2].map(c => Math.abs(a.data[i + c] - b.data[i + c])));
  const g = a.data[i] * 0.3 | 0; m.data.set(d ? [255, 0, 0, 255] : [g, g, g, 255], i);
  if (!d) continue;
  n++; mx = Math.max(mx, d); const p = i / 4, x = p % a.width, y = (p / a.width) | 0;
  x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
}
console.log(JSON.stringify({ pixels: n, bbox: n ? [x0, y0, x1, y1] : null, maxDelta: mx }));
if (outPath) fs.writeFileSync(outPath, PNG.sync.write(m));
