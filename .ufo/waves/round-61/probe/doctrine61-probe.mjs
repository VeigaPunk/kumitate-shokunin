#!/usr/bin/env node
// kumitate round 61 C2 probe — frozen predicate DOCTRINE61_HELD (D61 v1)
// usage: node doctrine61-probe.mjs <lane> <rev> [--census-root <fleet-root>]
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const [lane, rev] = process.argv.slice(2);
const censusRoot = process.argv.includes('--census-root') ? process.argv[process.argv.indexOf('--census-root') + 1] : process.argv[2] === undefined ? undefined : null;
if (!lane || !rev) { console.error('usage: doctrine61-probe.mjs <lane> <rev>'); process.exit(64); }

const checks = [];
const add = (name, ok, detail = '') => checks.push({ name, ok, detail });

const entryPath = 'corpus/knowledge/temporal-worker-versioning-pinning.md';

// E1 — entry exists at rev
{
  const r = spawnSync('git', ['-C', lane, 'ls-tree', '-r', '--name-only', rev, '--', entryPath], { encoding: 'utf8' });
  add('E1', r.stdout.trim() === entryPath, r.stdout.trim() || 'absent');
}

// E2 — provenance trio
{
  const r = spawnSync('git', ['-C', lane, 'show', `${rev}:${entryPath}`], { encoding: 'utf8' });
  const head = r.stdout.slice(0, 1200);
  add('E2', /^source:.*S195/m.test(head) && /^verified-at: 2026-10-25/m.test(head) && /^recheck:/m.test(head),
    `src=${/^source:.*S195/m.test(head)} verified=${/^verified-at: 2026-10-25/m.test(head)} recheck=${/^recheck:/m.test(head)}`);
}

// E3 — row S195 exists, mined, opened today, used-by exact
{
  const r = spawnSync('git', ['-C', lane, 'show', `${rev}:corpus/SOURCES.md`], { encoding: 'utf8' });
  const row = r.stdout.split('\n').find(l => /^\|[[:space:]]*S195[[:space:]]*\|/.test(l));
  if (!row) { add('E3', false, 'row-absent'); }
  else {
    const cells = row.split('|').map(c => c.trim());
    // cells: [1]=id [5]=tier [9]=status [10]=opened [12]=used-by
    const ok = cells[9] === 'mined' && cells[10] === '2026-10-25' && /temporal-worker-versioning-pinning\.md/.test(cells[12] || '');
    add('E3', ok, `status=${cells[9]} opened=${cells[10]} used-by=${cells[12]}`);
  }
}

// E4 — capture exists and sha matches the row pin
{
  const cap = join(lane, '.ufo', 'waves', 'round-61', 'build', 'ScoutSourceWorkerVersioning', 'body.md');
  let sha = '';
  try { sha = createHash('sha256').update(readFileSync(cap)).digest('hex'); } catch { /* absent */ }
  const r = spawnSync('git', ['-C', lane, 'show', `${rev}:corpus/SOURCES.md`], { encoding: 'utf8' });
  const row = r.stdout.split('\n').find(l => /^\|[[:space:]]*S195[[:space:]]*\|/.test(l)) || '';
  const pin = (row.match(/sha256 [0-9a-f]{64}/) || [])[0] || '';
  add('E4', !!sha && pin.includes(sha.slice(0, 16)), `pin=${pin.slice(0, 24)} sha=${sha.slice(0, 16)}`);
}

// E5 — census validate exit 0
{
  const root = censusRoot || lane;
  const r = spawnSync('/home/vgpnk/Projects/shokunin/scripts/sources-census.sh', ['validate', '--root', root, 'kumitate'], { encoding: 'utf8' });
  add('E5', r.status === 0, `exit=${r.status}`);
}

// E6 — README map row + readme-map CLEAN
{
  const r = spawnSync('git', ['-C', lane, 'show', `${rev}:corpus/README.md`], { encoding: 'utf8' });
  const mapped = r.stdout.includes(`| \`knowledge/temporal-worker-versioning-pinning.md\` |`) || r.stdout.includes('temporal-worker-versioning-pinning.md');
  const m = spawnSync('node', [join(lane, 'scripts', 'readme-map.mjs')], { encoding: 'utf8', cwd: lane });
  const clean = m.status === 0 && /README_MAP: CLEAN/.test(m.stdout);
  add('E6', mapped && clean, `mapped=${mapped} readme-map=${m.status} ${(m.stdout.match(/README_MAP: [^\n]+/) || [''])[0]}`);
}

const misses = checks.filter(c => !c.ok);
const held = misses.length === 0;
console.log(`DOCTRINE61: ${held ? 'DOCTRINE61_HELD' : 'DOCTRINE61_UNMET'} held=${checks.length - misses.length}/${checks.length} checks=${checks.length} rev=${rev} rule=D61`);
for (const c of checks) console.log(` | ${c.name} ${c.ok ? 'PASS' : 'MISS'} ${c.detail}`);
process.exit(held ? 0 : 1);
