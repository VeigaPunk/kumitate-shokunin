#!/usr/bin/env node
/**
 * verify-drafts.mjs — self-check of this seat's round-64 drafts against the frozen checks they must satisfy.
 * Read-only on the lane: every mutation happens in a mkdtemp sandbox. Nothing here is a lane gate.
 *
 * Checks:
 *   A. amendment: J8's three assertions on base bytes + the drafted tail (prefix, heading, entry path, M7).
 *   B. amendment: every `| \`key\` | \`value\` |` row equals the live `bash scripts/jj-seat-demo.sh` output.
 *   C. province line: J7's `includes(entry) && /frontier|band|ground|first entry/i` test.
 *   D. README rows: sandbox readme-map run, registry unchanged (must stay DRIFT) and registry + additions (must be CLEAN).
 */
import { spawnSync } from 'node:child_process';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const LANE = '/home/vgpnk/Projects/shokunin/kumitate-shokunin';
const BUILD = join(LANE, '.ufo/waves/round-64/build/K64ScribeAmendment');
const BASE = '6825a51425e91908f019ed65aa2f4209acbd7087';
const ENTRY = 'corpus/knowledge/jj-workspace-seat-containment.md';
const P = 'corpus/knowledge/agent-isolation-substrates.md';

let fails = 0;
const say = (ok, label, detail = '') => {
  if (!ok) fails += 1;
  process.stdout.write(`DRAFT_${ok ? 'PASS' : 'FAIL'} ${label}${detail ? ` ${detail}` : ''}\n`);
};
const between = (file, begin, end) => {
  const text = readFileSync(join(BUILD, file), 'utf8');
  const at = text.indexOf(begin);
  const to = text.indexOf(end);
  if (at < 0 || to < 0 || to < at) throw new Error(`markers missing in ${file}`);
  return text.slice(at + begin.length, to).trim();
};

// ---- A. J8
const baseBytes = spawnSync('git', ['-C', LANE, 'show', `${BASE}:${P}`], { encoding: 'buffer', maxBuffer: 64 * 1024 * 1024 });
if (baseBytes.status !== 0) { say(false, 'j8-base-read', `exit=${baseBytes.status}`); } else {
  const now = Buffer.concat([baseBytes.stdout, readFileSync(join(BUILD, 'amendment.md'))]);
  const tail = now.subarray(baseBytes.stdout.length).toString('utf8');
  const prefixOk = now.subarray(0, baseBytes.stdout.length).equals(baseBytes.stdout);
  const headOk = /^#{1,3}\s.*Amendment 2026-10-25/m.test(tail);
  const tokOk = tail.includes(ENTRY) && /\bM7\b/.test(tail);
  say(prefixOk, 'j8-base-bytes-are-prefix', `base=${baseBytes.stdout.length}B tail=${Buffer.byteLength(tail)}B`);
  say(headOk, 'j8-amendment-heading');
  say(tokOk, 'j8-entry-path-and-M7');
}

// ---- B. amendment table vs live demo
const demo = spawnSync('bash', [join(LANE, 'scripts', 'jj-seat-demo.sh')], { encoding: 'utf8', timeout: 120000 });
say(demo.status === 0, 'demo-exit', `exit=${demo.status}`);
const live = new Map();
for (const l of (demo.stdout || '').split('\n')) {
  const m = /^JJ_SEAT: ([a-z0-9_]+)=(.*)$/.exec(l);
  if (m) live.set(m[1], m[2]);
}
const stated = new Map();
for (const l of readFileSync(join(BUILD, 'amendment.md'), 'utf8').split('\n')) {
  const m = /^\|\s*`([a-z0-9_]+)`\s*\|\s*`([^`]*)`\s*\|/.exec(l);
  if (m) stated.set(m[1], m[2]);
}
const bad = [];
for (const [k, v] of live) if (stated.get(k) !== v) bad.push(`${k}:stated=${stated.get(k)}:live=${v}`);
for (const k of stated.keys()) if (!live.has(k)) bad.push(`${k}:stated-not-live`);
say(live.size === 15 && stated.size === 15 && bad.length === 0, 'amendment-keys-equal-live',
  `live=${live.size} stated=${stated.size}${bad.length ? ` ${bad.slice(0, 4).join(';')}` : ''}`);

// ---- C. J7 province line
const provLine = between('province-line.md', '<!-- PROVINCE:BEGIN -->', '<!-- PROVINCE:END -->');
const provOk = provLine.includes(ENTRY) && /frontier|band|ground|first entry/i.test(provLine);
say(provOk && !provLine.includes('\n'), 'j7-province-line', `len=${provLine.length}`);

// ---- D. readme-map sandbox
const rows = between('readme-rows.md', '<!-- ROWS:BEGIN -->', '<!-- ROWS:END -->').split('\n').filter((l) => l.startsWith('| `'));
const bullet = between('readme-rows.md', '<!-- BULLET:BEGIN -->', '<!-- BULLET:END -->');
const add = JSON.parse(readFileSync(join(BUILD, 'readme-map-covered-additions.json'), 'utf8')).additions;
const sim = mkdtempSync('/tmp/kumitate-r64/K64ScribeAmendment/sim-');
try {
  cpSync(join(LANE, 'corpus/knowledge'), join(sim, 'knowledge'), { recursive: true });
  cpSync(join(LANE, 'corpus/lessons'), join(sim, 'lessons'), { recursive: true });
  writeFileSync(join(sim, 'knowledge/jj-workspace-seat-containment.md'), 'source: S198\n');
  writeFileSync(join(sim, 'lessons/round-64.md'), '# Round 64\n');
  const readmeLines = readFileSync(join(LANE, 'corpus/README.md'), 'utf8').split('\n');
  const at = readmeLines.findIndex((l) => l.startsWith('| `lessons/round-63.md`'));
  const bt = readmeLines.findIndex((l) => l.startsWith('- **Isolation substrates for parallel agents:**'));
  if (at < 0 || bt < 0) throw new Error('README anchors not found');
  readmeLines.splice(at + 1, 0, ...rows);
  readmeLines[readmeLines.findIndex((l) => l.startsWith('- **Isolation substrates for parallel agents:**'))] = bullet;
  writeFileSync(join(sim, 'README.md'), readmeLines.join('\n'));
  const pin = JSON.parse(readFileSync(join(LANE, '.ufo/pins/readme-map.json'), 'utf8'));
  writeFileSync(join(sim, 'reg0.json'), JSON.stringify(pin));
  writeFileSync(join(sim, 'reg1.json'), JSON.stringify({ version: 2, covered: [...pin.covered, ...add] }));
  const run = (reg) => spawnSync('node', [join(LANE, 'scripts/readme-map.mjs'), '--registry', join(sim, reg),
    '--readme', join(sim, 'README.md'), '--corpus', join(sim, 'knowledge'), '--corpus', join(sim, 'lessons')], { encoding: 'utf8' });
  const r0 = run('reg0.json');
  const r1 = run('reg1.json');
  process.stdout.write(`  rows-only  : exit=${r0.status} ${r0.stdout.trim().split('\n').pop()}\n`);
  process.stdout.write(`  rows+pins  : exit=${r1.status} ${r1.stdout.trim()}\n`);
  say(r0.status === 1 && /DRIFT/.test(r0.stdout) && /unpinned:knowledge\/jj-workspace-seat-containment\.md/.test(r0.stdout),
    'readme-rows-alone-stay-drift');
  say(r1.status === 0 && /README_MAP: CLEAN files=156 rows=156 covered=156/.test(r1.stdout), 'readme-rows-plus-pins-clean');
} finally {
  rmSync(sim, { recursive: true, force: true });
}

process.stdout.write(`DRAFT_VERDICT: ${fails === 0 ? 'PASS' : `FAIL fails=${fails}`}\n`);
process.exit(fails === 0 ? 0 : 1);
