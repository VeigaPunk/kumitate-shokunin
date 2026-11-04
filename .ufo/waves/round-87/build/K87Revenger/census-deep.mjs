#!/usr/bin/env node
// deep census: what is recoverable from a close receipt that carries no cmd=/tool_sha256=?
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';

const lane = '/home/vgpnk/Projects/shokunin/kumitate-shokunin';
const rounds = process.argv.slice(2);
const gitShow = (rev, rel) => {
  const g = spawnSync('git', ['-C', lane, 'show', `${rev}:${rel}`], { maxBuffer: 64 << 20 });
  return g.status === 0 ? g.stdout.toString('utf8') : null;
};
const listAt = (rev, dir) => {
  const g = spawnSync('git', ['-C', lane, 'ls-tree', '-r', '--name-only', rev], { maxBuffer: 64 << 20 });
  return g.status === 0 ? g.stdout.split('\n').filter((p) => p.startsWith(dir)) : [];
};

const rows = [];
for (const r of rounds) {
  const dir = join(lane, '.ufo/waves', r, 'close');
  if (!existsSync(dir)) continue;
  for (const f of readdirSync(dir).sort()) {
    if (!f.endsWith('.txt')) continue;
    const text = readFileSync(join(dir, f), 'utf8');
    const rev = (text.match(/^rev=([a-f0-9]{40})$/m) || [])[1] || null;
    const hasCmd = /^cmd=/m.test(text);
    const hasTool = /^tool_sha256=/m.test(text);
    if (hasCmd || hasTool) { rows.push({ r, f, rev, hasCmd, hasTool, skip: true }); continue; }
    // labels: verdict-shaped lines
    const labels = [...new Set(text.split('\n').map((l) => (l.match(/^([A-Z][A-Z0-9_]{2,}):/) || [])[1]).filter(Boolean))];
    // contract strings
    const contracts = [...new Set((text.match(/kumitate-[a-z0-9-]+-v[0-9]+/g) || []))];
    // any script path mentioned in the body
    const paths = [...new Set((text.match(/(?:\.{0,2}\/)?(?:scripts|\.ufo)\/[A-Za-z0-9._\/-]+\.(?:mjs|sh|js|py)/g) || []))];
    rows.push({ r, f, rev, hasCmd, hasTool, labels, contracts, paths });
  }
}
const unbound = rows.filter((x) => !x.skip);
const out = {
  total: rows.length,
  unbound: unbound.length,
  unboundWithRev: unbound.filter((x) => x.rev).length,
  unboundNoRev: unbound.filter((x) => !x.rev).length,
  unboundWithLabel: unbound.filter((x) => x.labels.length).length,
  unboundWithContract: unbound.filter((x) => x.contracts.length).length,
  unboundWithPath: unbound.filter((x) => x.paths.length).length,
};
console.log(JSON.stringify(out, null, 2));
console.log('--- label/path samples (unbound, first 40) ---');
for (const x of unbound.slice(0, 40)) {
  console.log([x.r, x.f, x.rev ? 'rev' : 'NOREV', `labels=${x.labels.join(',')}`, `contracts=${x.contracts.join(',')}`, `paths=${x.paths.join(',')}`].join(' | '));
}
console.log('--- all unbound with NO label and NO path ---');
const bare = unbound.filter((x) => !x.labels.length && !x.paths.length);
console.log(bare.length, bare.slice(0, 25).map((x) => `${x.r}/${x.f}${x.rev ? '' : '(norev)'}`).join(' '));
// filename -> scripts/<stem>.mjs existence at the receipt rev (or at base if no rev)
console.log('--- filename convention hit rate ---');
let hit = 0, miss = [], noRev = 0;
for (const x of unbound) {
  const stem = x.f.replace(/\.txt$/, '');
  const cand = `scripts/${stem}.mjs`;
  if (!x.rev) { noRev++; miss.push(`${x.r}/${x.f}(norev)`); continue; }
  if (gitShow(x.rev, cand) !== null) hit++; else miss.push(`${x.r}/${x.f}->${cand}`);
}
console.log(`stem-hit=${hit} miss=${miss.length} norev=${noRev}`);
console.log('miss list:', miss.slice(0, 80).join(' '));
