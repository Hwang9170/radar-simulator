// Golden check: captures docs/ at a git ref and the working tree, then compares them.
// Usage: node check.mjs [ref]   (default: the commit recorded in GOLDEN_REF)
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = execFileSync('git', ['rev-parse', '--show-toplevel'], { cwd: here, encoding: 'utf8' }).trim();
const ref = process.argv[2] || fs.readFileSync(path.join(here, 'GOLDEN_REF'), 'utf8').trim();
const sha = execFileSync('git', ['rev-parse', ref], { cwd: root, encoding: 'utf8' }).trim();
const out = path.join(here, 'out');
const goldDocs = path.join(out, `src-${sha.slice(0, 10)}`), gold = path.join(out, `gold-${sha.slice(0, 10)}`), work = path.join(out, 'work');
const node = (...a) => execFileSync(process.execPath, a, { cwd: here, stdio: 'inherit' });

if (!fs.existsSync(path.join(gold, 'done'))) {
  fs.rmSync(goldDocs, { recursive: true, force: true }); fs.mkdirSync(goldDocs, { recursive: true });
  execFileSync('sh', ['-c', `git archive ${sha} docs | tar -x -C "${goldDocs}"`], { cwd: root });
  console.log(`capturing golden ${sha.slice(0, 10)}`);
  node('capture.mjs', path.join(goldDocs, 'docs'), gold);
  fs.writeFileSync(path.join(gold, 'done'), sha);
}
console.log('capturing working tree');
node('capture.mjs', path.join(root, 'docs'), work);
try { node('compare.mjs', gold, work); node('editor-check.mjs', path.join(goldDocs, 'docs'), path.join(root, 'docs'), path.join(out, 'editor')); console.log(`golden check passed against ${sha.slice(0, 10)}`); }
catch { console.error(`golden check FAILED against ${sha.slice(0, 10)}`); process.exit(1); }
