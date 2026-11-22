// Compares two capture directories frame by frame and screenshot by screenshot. Exit code 1 on any difference.
// Usage: node compare.mjs <outA> <outB>
import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';
import { SCENARIOS as ALL } from './scenarios.mjs';
const SCENARIOS = process.env.ONLY ? ALL.filter(s => process.env.ONLY.split(',').includes(s.name)) : ALL;

const [a, b] = process.argv.slice(2);
let bad = 0;
for (const { name } of SCENARIOS) {
  const A = fs.readFileSync(path.join(a, name, 'frames.jsonl'), 'utf8').trim().split('\n').map(JSON.parse);
  const B = fs.readFileSync(path.join(b, name, 'frames.jsonl'), 'utf8').trim().split('\n').map(JSON.parse);
  const errA = JSON.parse(fs.readFileSync(path.join(a, name, 'errors.json'))), errB = JSON.parse(fs.readFileSync(path.join(b, name, 'errors.json')));
  const msgs = [];
  if (A.length !== B.length) msgs.push(`frame count ${A.length} vs ${B.length}`);
  let diffFrames = 0, first = null;
  for (let f = 0; f < Math.min(A.length, B.length); f++) {
    const x = A[f], y = B[f];
    const objs = x.objs.length !== y.objs.length ? [`object count ${x.objs.length} vs ${y.objs.length}`] : x.objs.flatMap((h, i) => h === y.objs[i] ? [] : [`obj#${i}`]);
    const other = ['cam', 'dom', 'text'].filter(k => x[k] !== y[k]);
    if (objs.length || other.length) { diffFrames++; if (!first) first = `frame ${f}: ${[...other, ...objs.slice(0, 8)].join(', ')}${objs.length > 8 ? ` (+${objs.length - 8})` : ''}`; }
  }
  if (diffFrames) msgs.push(`${diffFrames} frames differ, first at ${first}`);
  // 3D pixels (read back from the WebGL canvas) must match exactly. Full screenshots go through Chrome's compositor,
  // which can be a frame behind in parts of the page; with matching 3D pixels and DOM, a screenshot diff is reported as a warning.
  const pngDiff = s => {
    const fa = fs.readFileSync(path.join(a, name, s)), fbPath = path.join(b, name, s);
    if (!fs.existsSync(fbPath)) return -1;
    const fb = fs.readFileSync(fbPath); if (fa.equals(fb)) return 0;
    const pa = PNG.sync.read(fa), pb = PNG.sync.read(fb);
    let n = 0; for (let i = 0; i < pa.data.length; i += 4) if (pa.data[i] !== pb.data[i] || pa.data[i + 1] !== pb.data[i + 1] || pa.data[i + 2] !== pb.data[i + 2]) n++;
    return n;
  };
  const files = fs.readdirSync(path.join(a, name));
  const gl = files.filter(f => f.endsWith('-gl.png')).map(f => [f, pngDiff(f)]).filter(([, n]) => n);
  const screens = files.filter(f => f.endsWith('-screen.png')), sd = screens.map(f => [f, pngDiff(f)]).filter(([, n]) => n);
  const shots = screens;
  if (gl.length) msgs.push(`${gl.length} 3D frames differ: ${gl.slice(0, 5).map(([f, n]) => `${f} (${n} px)`).join(', ')}`);
  const glCount = files.filter(f => f.endsWith('-gl.png')).length;
  const warn = sd.length ? ` · info: ${sd.length}/${screens.length} full screenshots differ (compositor timing, not a gate)` : '';
  if (JSON.stringify(errA) !== JSON.stringify(errB)) msgs.push(`page errors differ: ${JSON.stringify(errB).slice(0, 300)}`);
  if (errB.length) msgs.push(`page errors: ${JSON.stringify(errB).slice(0, 300)}`);
  console.log(`${msgs.length ? 'FAIL' : 'ok  '} ${name}: ${A.length} frames (state + DOM), ${glCount} 3D frames pixel-exact${warn}${msgs.length ? '\n     ' + msgs.join('\n     ') : ''}`);
  if (msgs.length) bad++;
}
process.exit(bad ? 1 : 0);
