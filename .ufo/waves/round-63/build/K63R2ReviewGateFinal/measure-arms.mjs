// K63R2ReviewGateFinal — re-measure the gate's shape arms over the whole host session store
// using the gate's OWN parseTranscript/shapeFindings (vm-extracted verbatim from the
// committed bytes), plus a per-seat detail mode. Read-only.
//   node measure-arms.mjs            → census summary
//   node measure-arms.mjs --detail   → one line per finished seat failing any arm
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import vm from 'node:vm';

const src = fs.readFileSync('/tmp/kumitate-r63/K63R2ReviewGateFinal/gate-new.mjs', 'utf8');
const a = src.indexOf('function userText');
const b = src.indexOf('const tail =');
const sandbox = {
  statSync: fs.statSync, readFileSync: fs.readFileSync, basename: path.basename,
  createHash: crypto.createHash, SHAPE: { rows: 10, assistants: 2, spanSec: 120, distinctTs: 8 },
  sha: (x) => crypto.createHash('sha256').update(x).digest('hex'),
};
vm.runInContext(src.slice(a, b), vm.createContext(sandbox));
const { parseTranscript, shapeFindings } = sandbox;
const root = path.join(os.homedir(), '.omp', 'agent', 'sessions');
let files = 0, finished = 0, marker = 0, armFail = 0, normCollide = 0;
const min = { rows: 1e9, span: 1e9, dist: 1e9, assist: 1e9 };
const normSeen = new Map();
const detail = process.argv.includes('--detail');
const walk = (d, depth) => {
  let ents = [];
  try { ents = fs.readdirSync(d, { withFileTypes: true }); } catch { return; }
  for (const e of ents) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) { if (depth < 3) walk(p, depth + 1); } else if (e.name.endsWith('.jsonl')) {
      files += 1;
      const t = parseTranscript(p);
      if (!t) continue;
      if (!(t.yielded && (t.exitKind === null || t.exitKind === 'normal'))) continue;
      finished += 1;
      if (t.user.includes('# Seat ')) marker += 1;
      min.rows = Math.min(min.rows, t.rows); min.span = Math.min(min.span, t.spanSec);
      min.dist = Math.min(min.dist, t.tsDistinct); min.assist = Math.min(min.assist, t.assistants);
      const f = shapeFindings(t);
      if (f.length) {
        armFail += 1;
        if (detail) console.log(`${path.basename(p)} exit=${t.exitKind} rows=${t.rows} span=${t.spanSec} dist=${t.tsDistinct} fails=${f.join(',')}`);
      }
      if (t.norm) { if (normSeen.has(t.norm)) normCollide += 1; else normSeen.set(t.norm, path.basename(p)); }
    }
  }
};
walk(root, 0);
console.log(JSON.stringify({ files, finished, marker, armFail, normCollide, ...min, maxSizeMB: 10.3 }));
