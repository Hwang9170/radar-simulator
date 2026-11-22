// Drives docs/sim with a fake clock and records, for every frame, a hash of each scene object
// (world matrix, visibility, material, geometry and instance buffers) plus the visible DOM text.
// Usage: node capture.mjs <docsDir> <outDir>
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';
import { PNG } from 'pngjs';
import { SCENARIOS as ALL, FRAMES as F, DT_MS, GL_EVERY, SHOT_EVERY, VIEWPORT } from './scenarios.mjs';
const SCENARIOS = process.env.ONLY ? ALL.filter(s => process.env.ONLY.split(',').includes(s.name)) : ALL;
const FRAMES = +process.env.FRAMES || F;

const [docsDir, outDir] = process.argv.slice(2).map(p => path.resolve(p));
if (!docsDir || !outDir) { console.error('usage: node capture.mjs <docsDir> <outDir>'); process.exit(2); }
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const CACHE = path.join(path.dirname(fileURLToPath(import.meta.url)), '.cache');

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.css': 'text/css', '.jpg': 'image/jpeg' };
const server = http.createServer((req, res) => {
  const file = path.join(docsDir, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!file.startsWith(docsDir) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}`;

// Runs in the page before any page script.
function init(storage) {
  for (const [k, v] of Object.entries(storage)) localStorage.setItem(k, v);
  let seed = 12345;
  Math.random = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  let now = 0, raf = [], timers = [], tid = 0;
  const realRAF = window.requestAnimationFrame.bind(window);
  window.__presented = () => new Promise(r => realRAF(() => realRAF(r))); // the compositor has shown the last draw
  performance.now = () => now;
  window.requestAnimationFrame = cb => { raf.push(cb); return raf.length; };
  window.setTimeout = (fn, ms) => { timers.push({ id: ++tid, at: now + (+ms || 0), fn }); return tid; };
  window.clearTimeout = id => { timers = timers.filter(t => t.id !== id); };
  window.setInterval = () => 0;
  // __step(ms, draw): advance the clock, fire due timers, run one animation frame. GPU drawing happens only when draw is true.
  window.__draw = false;
  window.__step = (ms, draw) => {
    now += ms; window.__draw = draw;
    const due = timers.filter(t => t.at <= now).sort((a, b) => a.at - b.at || a.id - b.id);
    timers = timers.filter(t => t.at > now);
    due.forEach(t => { try { typeof t.fn === 'function' && t.fn(); } catch (e) { console.error(e); } });
    const cbs = raf; raf = [];
    cbs.forEach(cb => cb(now));
  };
  // The sim assigns window.RADR_MAIN after three.js has loaded and calls it from boot. Wrap the renderer it is about
  // to create, so every render call records the scene and camera and only touches the GPU on screenshot frames.
  let main;
  Object.defineProperty(window, 'RADR_MAIN', { configurable: true, get: () => main, set(f) {
    const Orig = THREE.WebGLRenderer;
    THREE.WebGLRenderer = function (...a) {
      const r = new Orig(...a), render = r.render.bind(r);
      r.render = (scene, cam) => {
        window.__scene = scene; window.__cam = cam;
        if (window.__draw) { render(scene, cam); window.__gl = r.domElement.toDataURL('image/png'); } // read back before compositing
      };
      return r;
    };
    THREE.WebGLRenderer.prototype = Orig.prototype;
    main = f;
  } });
  window.__digest = () => {
    const f64 = new Float64Array(1), u32 = new Uint32Array(f64.buffer);
    const h = (arr, n) => { let x = 0x811c9dc5; const len = n ?? arr.length; for (let i = 0; i < len; i++) { f64[0] = arr[i]; x = Math.imul(x ^ u32[0], 16777619); x = Math.imul(x ^ u32[1], 16777619); } return (x >>> 0).toString(16); };
    const hs = s => { let x = 0x811c9dc5; for (let i = 0; i < s.length; i++) x = Math.imul(x ^ s.charCodeAt(i), 16777619); return (x >>> 0).toString(16); };
    const cache = window.__attrCache || (window.__attrCache = new WeakMap());
    const attr = a => { if (!a) return '-'; const c = cache.get(a); if (c && c.v === a.version) return c.h; const r = h(a.array); cache.set(a, { v: a.version, h: r }); return r; };
    const objs = [];
    window.__scene.traverse(o => {
      const parts = [o.type, o.visible ? 1 : 0, h(o.matrixWorld.elements), o.renderOrder];
      if (o.geometry) { const g = o.geometry; parts.push(Object.keys(g.attributes).sort().map(k => k + ':' + attr(g.attributes[k])).join(','), g.drawRange.start, g.drawRange.count); }
      if (o.isInstancedMesh) parts.push(o.count, attr(o.instanceMatrix), attr(o.instanceColor));
      const mats = o.material ? [].concat(o.material) : [];
      mats.forEach(m => parts.push(m.color ? m.color.getHexString() : '', m.opacity, m.visible ? 1 : 0, m.rotation ?? '', m.emissiveIntensity ?? ''));
      if (o.isLight) parts.push(o.intensity, o.color.getHexString());
      objs.push(hs(parts.join('|')));
    });
    const cam = window.__cam;
    const dom = [...document.body.children].filter(e => e.tagName !== 'SCRIPT').map(e => e.outerHTML).join('\n'); // rendered DOM, not page source
    return { objs, cam: h([...cam.matrixWorld.elements, ...cam.projectionMatrix.elements]), dom: hs(dom), text: hs(document.body.innerText) };
  };
}

async function fetchCached(url) {
  fs.mkdirSync(CACHE, { recursive: true });
  const f = path.join(CACHE, encodeURIComponent(url));
  if (!fs.existsSync(f)) { const r = await fetch(url); if (!r.ok) throw new Error(url + ' ' + r.status); fs.writeFileSync(f, Buffer.from(await r.arrayBuffer())); }
  return fs.readFileSync(f);
}

const browser = await puppeteer.launch({
  executablePath: CHROME, headless: true,
  args: [...(process.env.GL === 'gpu' ? [] : ['--use-angle=swiftshader', '--enable-unsafe-swiftshader']), '--disable-gpu-rasterization', '--run-all-compositor-stages-before-draw', '--disable-checker-imaging', '--disable-threaded-animation', '--disable-partial-raster', '--force-color-profile=srgb', '--hide-scrollbars', '--mute-audio', '--autoplay-policy=user-gesture-required'],
});

// Headless Chrome can hand back an older composited frame under load. A corner marker encodes the frame number;
// retake until the screenshot shows this frame's marker.
const mark = f => [f & 255, (f >> 8) & 255, 77];
async function freshShot(page, f) {
  await page.evaluate(([r, g, b]) => {
    let m = document.getElementById('__mark');
    if (!m) { m = document.createElement('div'); m.id = '__mark'; m.style.cssText = 'position:fixed;right:0;bottom:0;width:6px;height:6px;z-index:2147483647;pointer-events:none'; document.documentElement.appendChild(m); }
    m.style.background = `rgb(${r},${g},${b})`;
  }, mark(f));
  let prev = null;
  for (let i = 0; i < 40; i++) {
    await page.evaluate(() => window.__presented());
    const buf = Buffer.from(await page.screenshot({ captureBeyondViewport: false }));
    const png = PNG.sync.read(buf), o = ((png.height - 2) * png.width + png.width - 2) * 4;
    const current = mark(f).every((v, c) => png.data[o + c] === v);
    if (current && prev && prev.equals(buf)) return buf; // marker is current and two captures in a row agree
    prev = current ? buf : null;
  }
  throw new Error(`frame ${f}: screenshot never caught up with the page`);
}

async function run(sc) {
  const dir = path.join(outDir, sc.name); fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
  const ctx = await browser.createBrowserContext();
  const page = await ctx.newPage();
  await page.setViewport(VIEWPORT);
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.setRequestInterception(true);
  page.on('request', async req => {
    const u = req.url();
    if (u.startsWith(base)) return req.continue();
    if (/fonts\.(googleapis|gstatic)\.com/.test(u)) return req.respond({ status: 200, contentType: 'text/css', body: '' }); // fallback fonts in both runs
    try { const body = await fetchCached(u); req.respond({ status: 200, contentType: 'text/javascript', body }); } catch (e) { errors.push(String(e)); req.abort(); }
  });
  await page.evaluateOnNewDocument(init, sc.storage || {});
  await page.goto(`${base}/sim/index.html${sc.query || ''}`, { waitUntil: 'load' });
  await page.addStyleTag({ content: '*,*::before,*::after{transition:none!important;animation:none!important;caret-color:transparent!important}' });
  const lines = [];let tS = 0, tD = 0;
  for (let f = 0; f < FRAMES; f++) {
    let t0 = Date.now();
    const draw = f % GL_EVERY === 0, shot = f % SHOT_EVERY === 0;
    await page.evaluate((ms, d) => window.__step(ms, d), f === 0 ? 0 : DT_MS, draw);
    tS += Date.now() - t0; t0 = Date.now();
    const d = await page.evaluate(() => window.__digest());
    tD += Date.now() - t0;
    lines.push(JSON.stringify(d));
    const name = `f${String(f).padStart(4, '0')}`;
    if (draw) fs.writeFileSync(path.join(dir, `${name}-gl.png`), Buffer.from((await page.evaluate(() => window.__gl)).split(',')[1], 'base64'));
    if (shot) fs.writeFileSync(path.join(dir, `${name}-screen.png`), await freshShot(page, f));
  }
  fs.writeFileSync(path.join(dir, 'frames.jsonl'), lines.join('\n') + '\n');
  fs.writeFileSync(path.join(dir, 'errors.json'), JSON.stringify(errors, null, 1));
  await ctx.close();
  console.log(`${sc.name}: ${FRAMES} frames, ${errors.length} page errors, step ${tS} ms, digest ${tD} ms`);
}

try { await Promise.all(SCENARIOS.map(run)); } finally { await browser.close(); server.close(); }
