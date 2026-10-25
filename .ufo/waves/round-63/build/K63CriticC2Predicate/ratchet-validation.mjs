#!/usr/bin/env node
// Generates patched copies of the FROZEN probe (never edited) and runs a matrix:
//   P1 = T63 v1 + R2 (block-contiguity) + R3 (distinct document) + R4 (arXiv version) + R5 (per-row bullet floor 2)
//   P2 = P1 + R1 (row-host allowlist)
// Fixtures: this seat's 7 revs, plus the eleven committed controls regenerated with the committed generator.
import { spawnSync } from 'node:child_process';
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const LANE = '/home/vgpnk/Projects/shokunin/kumitate-shokunin';
const S = '/tmp/kumitate-r63/K63CriticC2Predicate';
const SRC = readFileSync(join(LANE, '.ufo/waves/round-63/probe/topology63-probe.mjs'), 'utf8');
const sh = (a, o = {}) => spawnSync(a[0], a.slice(1), { encoding: 'utf8', maxBuffer: 512 * 1024 * 1024, ...o });

// ---- R2: block-level close tags become a sentinel so a quote cannot span blocks
let p1 = SRC.replace(
  "  .replace(/<[^>]+>/g, ' ')",
  "  .replace(/<\\/(?:p|div|li|ul|ol|dl|dd|dt|tr|td|th|h[1-6]|section|article|header|footer|nav|blockquote|pre|table|thead|tbody|main|aside|form)\\s*>/gi, '\\u0000')\n  .replace(/<br\\s*\\/?>/gi, '\\u0000')\n  .replace(/<[^>]+>/g, ' ')",
);
if (p1 === SRC) throw new Error('R2 anchor missed');

// ---- R3: distinct-document arm inside T2
p1 = p1.replace(
  "  if (ids.length < 2) bad.push(`cites-${ids.length}-rows`);",
  `  if (ids.length < 2) bad.push(\`cites-\${ids.length}-rows\`);
  const docKey = (u) => { const m = /^https?:\\/\\/(?:www\\.)?arxiv\\.org\\/(?:abs|pdf|html)\\/(\\d{4}\\.\\d{4,5})(?:v\\d+)?/.exec(u); if (m) return \`arxiv:\${m[1]}\`; return u.replace(/^https?:\\/\\//, '').replace(/^www\\./, '').replace(/[?#].*$/, '').replace(/\\/+$/, '').toLowerCase(); };
  const citedUrls = ids.map((id) => { const l = rows.get(id); return l ? /(https?:\\/\\/[^\\s|)]+)/.exec(cells(l)[2] || '')?.[1] : null; }).filter(Boolean);
  if (new Set(citedUrls.map(docKey)).size < 2) bad.push(\`one-document-\${new Set(citedUrls.map(docKey)).size}\`);`,
);

// ---- R4: arXiv version provenance (capture says "this version, vN" matching the row URL; entry assertion agrees)
p1 = p1.replace(
  "  check('T3', ids.length > 0 && bad.length === 0, ids.length ? bad.join(',') : 'no-rows');",
  `  const vbad = [];
  const entryAll = entryRaw ? entryRaw.toString('utf8') : '';
  for (const id of ids) {
    const l = rows.get(id);
    const u = l ? /(https?:\\/\\/[^\\s|)]+)/.exec(cells(l)[2] || '')?.[1] : null;
    const m = u ? /arxiv\\.org\\/abs\\/\\d{4}\\.\\d{4,5}(v\\d+)/.exec(u) : null;
    if (!m) continue;
    const want = \`this version, \${m[1]}\`;
    if (!capText.get(id)?.includes(want)) vbad.push(\`\${id}:capture-not-\${m[1]}\`);
    const asserted = [...new Set(entryAll.split('\\n').filter((x) => x.includes(id) && !/^- S\\d{3,} — "/.test(x)).flatMap((x) => [...x.matchAll(/\\bv(\\d+)\\b/g)].map((k) => \`v\${k[1]}\`)))];
    if (asserted.length && !asserted.every((v) => v === m[1])) vbad.push(\`\${id}:asserted-\${asserted.join('+')}-url-\${m[1]}\`);
  }
  bad.push(...vbad);
  check('T3', ids.length > 0 && bad.length === 0, ids.length ? bad.join(',') : 'no-rows');`,
);

// ---- R5: per cited row >= 2 bullets (was >= 1)
p1 = p1.replace(
  "  for (const id of ids) if (!bullets.some((b) => b.id === id)) bad.push(`${id}:no-bullet`);",
  "  for (const id of ids) { const n = bullets.filter((b) => b.id === id).length; if (n < 2) bad.push(`${id}:bullets=${n}`); }",
);
if (p1 === SRC) throw new Error('R5 anchor missed');

// ---- R1 (P2 only): row host must be in an allowlist (inline here; integration would pin .ufo/pins/source-hosts.json)
const p2 = p1.replace(
  "  check('T5', bullets.length > 0 && bad.length === 0, bullets.length ? bad.slice(0, 6).join(';') : 'no-bullets');",
  `  const HOSTS = new Set(['arxiv.org', 'www.anthropic.com']);
  for (const id of ids) {
    const l = rows.get(id);
    const u = l ? /(https?:\\/\\/[^\\s|)]+)/.exec(cells(l)[2] || '')?.[1] : null;
    if (!u) continue;
    let host = '';
    try { host = new URL(u).host; } catch { host = ''; }
    if (!HOSTS.has(host)) bad.push(\`\${id}:host-not-allowed(\${host})\`);
  }
  check('T5', bullets.length > 0 && bad.length === 0, bullets.length ? bad.slice(0, 6).join(';') : 'no-bullets');`,
);
if (p2 === p1) throw new Error('R1 anchor missed');

mkdirSync(S, { recursive: true });
writeFileSync(join(S, 'probe-r2-r5.mjs'), p1);
writeFileSync(join(S, 'probe-r1-r5.mjs'), p2);

// ---- matrix over this seat's fixture revs
const res = JSON.parse(readFileSync(join(S, 'results.json'), 'utf8'));
const rows = [];
const one = (probe, rev) => {
  const r = sh(['node', probe, join(S, 'fix'), rev]);
  return { exit: r.status, line: (r.stdout || '').trim().split('\n').pop() };
};
for (const c of res.cases) {
  const a = one(join(S, 'probe-r2-r5.mjs'), c.rev);
  const b = one(join(S, 'probe-r1-r5.mjs'), c.rev);
  rows.push(`${c.label.padEnd(24)} P1 exit=${a.exit} :: ${a.line}\n${''.padEnd(24)} P2 exit=${b.exit} :: ${b.line}`);
}
writeFileSync(join(S, 'ratchet-matrix.txt'), rows.join('\n') + '\n');
process.stdout.write(rows.join('\n') + '\n');
