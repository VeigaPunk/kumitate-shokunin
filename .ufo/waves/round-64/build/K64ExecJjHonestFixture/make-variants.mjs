// make-variants.mjs — build single-fault variants of the honest J64 fixture.
//   node make-variants.mjs <fixture-repo> <honest-rev>
// Reads the committed bytes at <honest-rev> (`git show <rev>:<path>`), applies exactly one textual fault, writes the
// changed file(s) under variants/<name>/<lane-relative path>. Each mutation asserts its anchor exists, so a silent
// no-op is impossible. One variant (j5-live-missing) is server-side and has no repo delta: see doctor-captures.mjs.
import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const [, , REPO, REV] = process.argv;
if (!REPO || !REV) { console.error('usage: make-variants.mjs <repo> <rev>'); process.exit(64); }
const OUT = join(dirname(new URL(import.meta.url).pathname), 'variants');
const ENTRY = 'corpus/knowledge/jj-workspace-seat-containment.md';
const SRC = 'corpus/SOURCES.md';
const PROV = 'PROVINCE.md';
const README = 'corpus/README.md';
const PINS = '.ufo/pins/source-captures.json';
const SUBS = 'corpus/knowledge/agent-isolation-substrates.md';

const read = (p) => {
  const r = spawnSync('git', ['-C', REPO, 'show', `${REV}:${p}`], { encoding: 'utf8' });
  if (r.status !== 0) { console.error(`unreadable ${p}: ${r.stderr}`); process.exit(2); }
  return r.stdout;
};
const must = (text, from, to, label) => {
  const n = text.split(from).length - 1;
  if (n !== 1) { console.error(`${label}: anchor count ${n} for ${JSON.stringify(from.slice(0, 60))}`); process.exit(2); }
  return text.replace(from, to);
};
const put = (name, rel, text) => {
  const p = join(OUT, name, rel);
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, text);
  console.log(`${name}: ${rel} ${text.length} bytes`);
};

// 1. stale demo value — one outcome value differs from the live demo run (J6)
{
  const t = must(read(ENTRY), '- workspaces_after_add=2', '- workspaces_after_add=3', 'stale-demo-value');
  put('stale-demo-value', ENTRY, t);
}
// 2. missing demo key — one stated key removed (J6)
{
  const t = must(read(ENTRY), '- seat_dir_after_forget=present\n', '', 'missing-demo-key');
  put('missing-demo-key', ENTRY, t);
}
// 3. quote not in capture — one located quote altered (J4, and J5 by the same bytes)
{
  const t = must(read(ENTRY), 'You can have multiple working copies backed by a single repo.',
    'You can have multiple working copies backed by two repos.', 'quote-not-in-capture');
  put('quote-not-in-capture', ENTRY, t);
}
// 4. capture bytes edited after pinning (J3, and J4 because the pin no longer binds)
{
  const p = 'corpus/captures/jj-workspace-seat-containment/S199.html';
  const t = `${read(p)}\n<!-- fixture variant: capture bytes edited after the pin was written -->\n`;
  put('capture-bytes-edited', p, t);
}
// 5. row status queued (J2)
{
  const t = read(SRC).split('\n').map((l) => (l.startsWith('| S199 |')
    ? must(l, '| mined | 2026-10-25 |', '| queued | 2026-10-25 |', 'row-status-queued') : l)).join('\n');
  put('row-status-queued', SRC, t);
}
// 6. wrong opened date (J2)
{
  const t = read(SRC).split('\n').map((l) => (l.startsWith('| S200 |')
    ? must(l, '| mined | 2026-10-25 | 90d |', '| mined | 2026-10-24 | 90d |', 'wrong-opened-date') : l)).join('\n');
  put('wrong-opened-date', SRC, t);
}
// 7. PROVINCE frontier line removed (J7 province arm)
{
  const lines = read(PROV).split('\n');
  const keep = lines.filter((l) => !(l.includes(ENTRY) && /frontier|ground|first entry/i.test(l)));
  if (keep.length !== lines.length - 1) { console.error(`province-line-removed: removed ${lines.length - keep.length} lines`); process.exit(2); }
  put('province-line-removed', PROV, keep.join('\n'));
}
// 8. amendment rewritten in place — one base-revision word changed (J8)
{
  const t = must(read(SUBS), 'M7 — jj workspaces share one repository.', 'M7 — jj workspaces share a repository.',
    'amendment-rewritten-in-place');
  put('amendment-rewritten-in-place', SUBS, t);
}
// 9. verified-at stale (J1 alone)
{
  put('j1-verified-at', ENTRY, must(read(ENTRY), 'verified-at: 2026-10-25', 'verified-at: 2026-10-24', 'j1-verified-at'));
}
// 10. a located quote over 25 words that IS in the capture (J4 alone)
{
  const long = "Removing the current workspace works on Unix, but Windows won't remove a directory that a process is running in; run the command from another directory using jj -R instead.";
  if (long.trim().split(/\s+/).length <= 25) { console.error('j4-over-25-words: quote is not over 25 words'); process.exit(2); }
  put('j4-over-25-words', ENTRY, must(read(ENTRY), '- S198 — "The workspace directory and files are left on disk."',
    `- S198 — "The workspace directory and files are left on disk."\n- S198 — "${long}"`, 'j4-over-25-words'));
}
// 11. a cited row unbound from its capture pin (J3, and J4 for that row)
{
  const doc = JSON.parse(read(PINS));
  const before = doc.captures.length;
  doc.captures = doc.captures.filter((c) => c.sourceId !== 'S200');
  if (doc.captures.length !== before - 1) { console.error('j3-unbound: no S200 capture found'); process.exit(2); }
  put('j3-unbound', PINS, `${JSON.stringify(doc, null, 1)}\n`);
}
// 12. the entry's README row removed (J7 readme-map arm)
{
  const lines = read(README).split('\n');
  const keep = lines.filter((l) => !l.startsWith('| `knowledge/jj-workspace-seat-containment.md` |'));
  if (keep.length !== lines.length - 1) { console.error(`j7-readme-row-removed: removed ${lines.length - keep.length} rows`); process.exit(2); }
  put('j7-readme-row-removed', README, keep.join('\n'));
}
// 13. used-by names a different (existing) entry (J2 used-by arm; census E11 stays clean)
{
  const t = read(SRC).split('\n').map((l) => (l.startsWith('| S198 |')
    ? must(l, '| 90d | corpus/knowledge/jj-workspace-seat-containment.md |',
      '| 90d | corpus/knowledge/omp-task-contract.md |', 'j2-used-by') : l)).join('\n');
  put('j2-used-by', SRC, t);
}
// 14. a duplicate registry id elsewhere in ## Registry (J7 census arm; cited rows untouched)
{
  const lines = read(SRC).split('\n');
  let i = -1;
  for (let k = 0; k < lines.length; k += 1) if (/^\| S\d{3,} \|/.test(lines[k])) i = k;
  if (i < 0) { console.error('j7-census-duplicate-id: no registry row'); process.exit(2); }
  lines.splice(i + 1, 0, lines[i]);
  put('j7-census-duplicate-id', SRC, lines.join('\n'));
}
// 15. the base's readme-map DRIFT left unrepaired (J7 readme-map arm; the base state, one logical fault in two files)
{
  const rows = read(README).split('\n').filter((l) => !l.startsWith('| `lessons/round-63-verifier-spotcheck.md` |'));
  put('j7-readme-repair-removed', README, rows.join('\n'));
  const doc = JSON.parse(read(PINS.replace('source-captures', 'readme-map')));
  doc.covered = doc.covered.filter((p) => p !== 'lessons/round-63-verifier-spotcheck.md');
  put('j7-readme-repair-removed', '.ufo/pins/readme-map.json', `${JSON.stringify(doc, null, 1)}\n`);
}
// 16. FORGERY PROBE: the demo script replaced by a stub that prints the stated outcomes and never runs jj.
//     If the counter reads HELD, J6 cannot tell a measured demo from a printed transcript (hole; fix proposed in report).
{
  const entry = read(ENTRY);
  const at = entry.search(/^##\s+Demo outcomes\s*$/m);
  const stated = [];
  for (const l of entry.slice(at).split('\n').slice(1)) {
    if (/^##\s/.test(l)) break;
    const m = /^-\s+([a-z0-9_]+)=(.*?)\s*$/.exec(l);
    if (m) stated.push(`JJ_SEAT: ${m[1]}=${m[2]}`);
  }
  if (stated.length < 12) { console.error(`demo-script-stubbed: ${stated.length} stated keys`); process.exit(2); }
  const stub = ['#!/usr/bin/env bash', '# fixture variant: stub — prints the entry\'s stated outcomes, runs nothing', ...stated.map((l) => `echo '${l}'`), 'echo \'JJ_SEAT_DEMO: DONE jj=0.45.1-7c41cdeb16b6b321c64e789a966b6adf723816a5\'', 'exit 0', ''].join('\n');
  put('demo-script-stubbed', 'scripts/jj-seat-demo.sh', stub);
}
// 17. FORGERY PROBE: the PROVINCE line moved out of the Frontier band into the Adjacent section.
//     If the counter reads HELD, J7's province arm accepts a line that is not on a frontier line (hole).
{
  const lines = read(PROV).split('\n');
  const i = lines.findIndex((l) => l.includes(ENTRY) && /frontier|ground|first entry/i.test(l));
  if (i < 0) { console.error('province-line-misplaced: no province line'); process.exit(2); }
  const [line] = lines.splice(i, 1);
  lines.push(line);
  put('province-line-misplaced', PROV, lines.join('\n'));
}
