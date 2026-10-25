#!/usr/bin/env node
// draft-entry-probe.mjs — K64ExecRowsDraft: simulate the frozen J64 checks J1-J5 against the
// MIRROR registry + a DRAFT entry header, using the probe's own regexes and normaliser
// (copied from .ufo/waves/round-64/probe/jj64-probe.mjs:55-63, 83-190). This is a simulation,
// not the frozen counter: J6-J8 need the demo, PROVINCE and readme-map and are out of scope here.
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ENTRY = 'corpus/knowledge/jj-workspace-seat-containment.md';
const OPENED = '2026-10-25';
const MIRROR = join(HERE, 'validate');

// draft entry header + located quotes (the scribe owns the prose; this is the header contract)
const ENTRY_TEXT = `source: S198 https://docs.jj-vcs.dev/latest/technical/concurrency/ · S199 https://firefox-source-docs.mozilla.org/contributing/jujutsu.html · S200 https://docs.jj-vcs.dev/latest/working-copy/
verified-at: ${OPENED} draft header for the K64ExecRowsDraft simulation
recheck: 180d

# jj workspace seat containment

## Located quotes

- S198 — "The most important piece in the lock-free design is the "operation log". That is what allows us to detect and merge divergent operations."
- S198 — "The view object contains the set of visible head commits, bookmarks, tags, and the working-copy commit in each workspace."
- S198 — "When a command starts, it loads the repo at the latest operation."
- S199 — "A workspace becomes stale when a commit it depends on is rewritten from another workspace, for example by rebasing, editing, or squashing."
- S199 — "We recommend this default because some mach commands invoke jj and can fail, sometimes silently, if the working copy is stale."
- S200 — "Use jj workspace remove to forget a workspace and remove its directory from disk."
- S200 — "Tracked changes are snapshotted before the directory is removed, but ignored files in that directory are deleted."
- S200 — "The main workspace cannot be removed."
`;

const PINS = [
  { sourceId: 'S198', path: '.ufo/waves/round-64/build/K64ExecRowsDraft/concurrency-latest.html', sha256: '5e2f757641748faf15df032f51e14435ddd579b13c30ab54fea0d40ce2e00bf6', bytes: 48988 },
  { sourceId: 'S199', path: '.ufo/waves/round-64/build/K64ExecRowsDraft/firefox-jujutsu.html', sha256: 'abbe47cfa45e809694b224d0db0ea7d6b00e9846b94086d077aea0604db7b3d2', bytes: 53233 },
  { sourceId: 'S200', path: '.ufo/waves/round-64/build/K64ExecRowsDraft/working-copy-latest.html', sha256: '947d0c56c02f9c10b4c14e8aaa8cc3f435f7650536ab9386ef6a52f1d64ff3c7', bytes: 47694 },
];

const argv = process.argv.slice(2);
const entryFile = argv.includes('--entry-file') ? argv[argv.indexOf('--entry-file') + 1] : null;
const ENTRY_SRC = entryFile ? readFileSync(entryFile, 'utf8') : null;

const norm = (s) => s.toString('utf8')
  .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;|&#160;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;|&#34;/g, '"').replace(/&#39;|&#x27;|&apos;/g, "'")
  .replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, '"').replace(/[\u2013\u2014]/g, '-')
  .replace(/\*\*|__|`/g, '')
  .replace(/\s+/g, ' ').trim();

const miss = [];
const check = (id, ok, why) => { if (!ok) miss.push(`${id} MISS ${why}`); console.log(`${id} ${ok ? 'PASS' : 'MISS'}${ok ? '' : ` ${why}`}`); };

// ---- J1
const head = (ENTRY_SRC ?? ENTRY_TEXT).split('\n').slice(0, 14).join('\n');
const ids = [...new Set([...head.matchAll(/^source:[^\n]*/gm)].flatMap((l) => [...l[0].matchAll(/\bS\d{3,}\b/g)].map((m) => m[0])))];
check('J1', /^source:\s*S\d{3,}/m.test(head) && new RegExp(`^verified-at:\\s*${OPENED}`, 'm').test(head) && /^recheck:\s*\S+/m.test(head), 'trio');

// ---- J2 (mirror registry)
const lines = readFileSync(join(MIRROR, 'corpus/SOURCES.md'), 'utf8').split('\n');
const start = lines.findIndex((l) => /^ {0,3}##\s+Registry\b/.test(l));
let end = lines.length;
for (let i = start + 1; i < lines.length && start >= 0; i += 1) if (/^ {0,3}##\s/.test(lines[i])) { end = i; break; }
const rows = new Map();
for (let i = start + 1; i < end; i += 1) { const m = /^ {0,3}\|\s*(S\d{3,})\s*\|/.exec(lines[i]); if (m) rows.set(m[1], lines[i]); }
const cells = (line) => line.replace(/^ {0,3}/, '').split('|').map((c) => c.trim());
const bad2 = [];
if (ids.length < 2) bad2.push(`cites-${ids.length}-rows`);
for (const id of ids) {
  const line = rows.get(id);
  if (!line) { bad2.push(`${id}:not-in-registry`); continue; }
  const c = cells(line);
  if (c.length !== 13) { bad2.push(`${id}:NF=${c.length}`); continue; }
  const [, , source, , tier, , , , status, opened, , usedBy] = c;
  if (status !== 'mined') bad2.push(`${id}:status=${status}`);
  if (opened !== OPENED) bad2.push(`${id}:opened=${opened}`);
  if (!usedBy.includes(ENTRY)) bad2.push(`${id}:used-by-lacks-entry`);
  if (!/https?:\/\//.test(source)) bad2.push(`${id}:no-url`);
  if (tier === '') bad2.push(`${id}:no-tier`);
}
check('J2', bad2.length === 0, bad2.join(','));

// ---- J3 (capture pins, sha256 + bytes, path relative to the lane root)
const capText = new Map();
const bad3 = [];
for (const id of ids) {
  const c = PINS.find((p) => p.sourceId === id);
  if (!c) { bad3.push(`${id}:unbound`); continue; }
  let b;
  try { b = readFileSync(join(HERE, c.path.split('/').pop())); } catch { bad3.push(`${id}:capture-absent`); continue; }
  if (createHash('sha256').update(b).digest('hex') !== c.sha256 || b.length !== c.bytes) bad3.push(`${id}:hash-or-size`);
  else capText.set(id, norm(b));
}
check('J3', ids.length > 0 && bad3.length === 0, ids.length ? bad3.join(',') : 'no-rows');

// ---- J4
const bullets = [];
const at = (ENTRY_SRC ?? ENTRY_TEXT).search(/^##\s+Located quotes\s*$/m);
if (at >= 0) for (const l of (ENTRY_SRC ?? ENTRY_TEXT).slice(at).split('\n').slice(1)) {
  if (/^##\s/.test(l)) break;
  const m = /^-\s+(S\d{3,})\s+[—-]\s+"(.+)"\s*$/.exec(l);
  if (m) bullets.push({ id: m[1], q: m[2] });
}
const bad4 = [];
if (bullets.length < 4) bad4.push(`bullets=${bullets.length}`);
for (const id of ids) if (!bullets.some((b) => b.id === id)) bad4.push(`${id}:no-bullet`);
for (const b of bullets) {
  if (b.q.trim().split(/\s+/).length > 25) bad4.push(`${b.id}:over-25-words`);
  if (!ids.includes(b.id)) { bad4.push(`${b.id}:not-a-source`); continue; }
  const t = capText.get(b.id);
  if (!t || !t.includes(norm(b.q))) bad4.push(`${b.id}:quote-not-in-capture(${b.q.slice(0, 30)})`);
}
check('J4', bad4.length === 0, bad4.slice(0, 6).join(';'));

// ---- J5 (live, the probe's exact curl argv)
const bad5 = [];
const live = new Map();
for (const id of ids) {
  const url = /(https?:\/\/[^\s|)]+)/.exec(cells(rows.get(id))[2] || '');
  if (!url) { bad5.push(`${id}:no-url`); continue; }
  const r = spawnSync('curl', ['-fsSL', '--max-time', '90', '--retry', '2', '-A', 'Mozilla/5.0 (kumitate-jj64)', url[1]], { maxBuffer: 128 * 1024 * 1024 });
  if (r.status !== 0) { bad5.push(`${id}:live-unreachable`); continue; }
  live.set(id, norm(r.stdout));
}
for (const b of bullets) {
  const t = live.get(b.id);
  if (!t) continue;
  if (!t.includes(norm(b.q))) bad5.push(`${b.id}:quote-not-live(${b.q.slice(0, 30)})`);
}
check('J5', bullets.length > 0 && bad5.length === 0, bullets.length ? bad5.slice(0, 6).join(';') : 'no-bullets');

console.log(`DRAFT_J1_J5: ${miss.length === 0 ? 'PASS' : 'MISS'} checks=5 ids=${ids.join(',')} bullets=${bullets.length}`);
process.exit(miss.length === 0 ? 0 : 1);
