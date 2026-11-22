// Editor parity: every editor tab renders the same DOM, and the exported standalone simulator replays the same frames.
// Usage: node editor-check.mjs <docsA> <docsB> <outDir>
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';
import { SCENARIOS } from './scenarios.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const [docsA, docsB, outDir] = process.argv.slice(2).map(p => path.resolve(p));
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const DRAFTS = { default: null, custom: SCENARIOS.find(s => s.name === 'custom').storage['radr.cfg'] };

function serve(dir) {
  const s = http.createServer((req, res) => {
    const file = path.join(dir, decodeURIComponent(new URL(req.url, 'http://x').pathname));
    if (!file.startsWith(dir) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'content-type': file.endsWith('.html') ? 'text/html' : 'text/javascript' });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise(r => s.listen(0, '127.0.0.1', () => r(s)));
}

async function inspect(browser, docs, draft) {
  const server = await serve(docs);
  const ctx = await browser.createBrowserContext();
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  await page.evaluateOnNewDocument(d => {
    if (d) localStorage.setItem('radr.editor.draft', d);
    const orig = URL.createObjectURL;
    URL.createObjectURL = b => { window.__blob = b; return orig(b); };
  }, draft);
  await page.setRequestInterception(true);
  page.on('request', r => /fonts\.(googleapis|gstatic)\.com/.test(r.url()) ? r.respond({ status: 200, contentType: 'text/css', body: '' }) : r.continue());
  await page.goto(`http://127.0.0.1:${server.address().port}/editor/index.html`, { waitUntil: 'load' });
  const tabs = {};
  const n = await page.$$eval('#nav button', b => b.length);
  for (let i = 0; i < n; i++) {
    await page.evaluate(i => document.querySelectorAll('#nav button')[i].click(), i);
    const t = await page.evaluate(() => ({ name: document.querySelector('#nav .cur').lastChild.textContent /* tab name without its number */, html: document.getElementById('main').innerHTML, status: document.getElementById('status').textContent }));
    tabs[t.name] = t.html + '\n' + t.status;
  }
  await page.evaluate(() => document.getElementById('hExport').click());
  await page.waitForFunction(() => window.__blob, { timeout: 15000 });
  // The export bakes in the site URL (here a random local port); put back the relative path the sim ships with.
  const standalone = (await page.evaluate(() => window.__blob.text())).replaceAll(`http://127.0.0.1:${server.address().port}/`, '../');
  await ctx.close(); server.close();
  return { tabs, standalone, errors };
}

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--mute-audio'] });
let bad = 0;
try {
  for (const [name, draft] of Object.entries(DRAFTS)) {
    const [A, B] = [await inspect(browser, docsA, draft), await inspect(browser, docsB, draft)];
    const tabDiff = Object.keys(A.tabs).filter(k => A.tabs[k] !== B.tabs[k]);
    const added = Object.keys(B.tabs).filter(k => !(k in A.tabs));
    const msgs = [];
    if (tabDiff.length) msgs.push(`tabs render differently: ${tabDiff.join(', ')}`);
    if (B.errors.length) msgs.push(`page errors: ${B.errors.join(' | ').slice(0, 300)}`);
    // Replay both exported standalone files through the frame capture.
    for (const [tag, html] of [['a', A.standalone], ['b', B.standalone]]) {
      const d = path.join(outDir, `standalone-${name}-${tag}`, 'docs', 'sim');
      fs.mkdirSync(d, { recursive: true }); fs.writeFileSync(path.join(d, 'index.html'), html);
      fs.copyFileSync(path.join(docsB, 'favicon.svg'), path.join(d, '..', 'favicon.svg'));
    }
    const env = { ...process.env, ONLY: 'medium', FRAMES: '400' };
    for (const tag of ['a', 'b']) execFileSync(process.execPath, ['capture.mjs', path.join(outDir, `standalone-${name}-${tag}`, 'docs'), path.join(outDir, `standalone-${name}-${tag}`, 'cap')], { cwd: here, env, stdio: 'ignore' });
    try { execFileSync(process.execPath, ['compare.mjs', path.join(outDir, `standalone-${name}-a`, 'cap'), path.join(outDir, `standalone-${name}-b`, 'cap')], { cwd: here, env, stdio: 'pipe' }); }
    catch (e) { msgs.push('standalone export replays differently:\n' + e.stdout); }
    console.log(`${msgs.length ? 'FAIL' : 'ok  '} editor (${name} draft): ${Object.keys(A.tabs).length} tabs identical${added.length ? ` (new: ${added.join(', ')})` : ''}, standalone export replays 400 frames identically${msgs.length ? '\n     ' + msgs.join('\n     ') : ''}`);
    if (msgs.length) bad++;
  }
} finally { await browser.close(); }
process.exit(bad ? 1 : 0);
