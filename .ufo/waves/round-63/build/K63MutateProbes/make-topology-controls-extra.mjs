#!/usr/bin/env node
/**
 * make-topology-controls.mjs — round-63 C2 controls: one honest fixture and eleven forged/broken
 * variants, each scored by the FROZEN counter topology63-probe.mjs.
 *
 *   node .ufo/waves/round-63/probe/make-topology-controls.mjs <lane-dir> <base-rev> <out-dir>
 *
 * The honest fixture is the lane at <base-rev> plus one `## Located quotes` section appended to an
 * existing admitted entry (bounded-redelivery-budgets.md, rows S109/S110/S111, opened 2026-10-24),
 * its quotes chosen from the committed captures and re-found in a live fetch. Each variant breaks
 * exactly one thing the counter claims to check. Fixture repositories live in a mktemp directory;
 * every git call names `-C <fixture>` and the fixture toplevel is verified before the first commit.
 * Writes <out-dir>/<case>.txt (verdict line + exit code) and <out-dir>/summary.txt.
 */
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';

const [laneArg, baseRev, outArg] = process.argv.slice(2);
if (!laneArg || !baseRev || !outArg) { process.stderr.write('usage: make-topology-controls.mjs <lane> <base-rev> <out-dir>\n'); process.exit(64); }
const lane = resolve(laneArg);
const out = resolve(outArg);
const PROBE = join(lane, '.ufo/waves/round-63/probe/topology63-probe.mjs');
const ENTRY = 'corpus/knowledge/bounded-redelivery-budgets.md';
const OPENED = '2026-10-24';
mkdirSync(out, { recursive: true });

const sh = (args, o = {}) => spawnSync(args[0], args.slice(1), { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024, ...o });
const norm = (s) => s.toString('utf8')
  .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;|&#160;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;|&#34;/g, '"').replace(/&#39;|&#x27;|&apos;/g, "'")
  .replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, '"').replace(/[\u2013\u2014]/g, '-')
  .replace(/\*\*|__|`/g, '').replace(/\s+/g, ' ').trim();

// ---- fixture repo from <base-rev>
const D = mkdtempSync(join(tmpdir(), 'topology63-ctl.'));
sh(['git', '-C', D, 'init', '-q']);
const top = sh(['git', '-C', D, 'rev-parse', '--show-toplevel']).stdout.trim();
if (top !== D) { process.stderr.write(`fixture toplevel ${top} != ${D}\n`); process.exit(2); }
sh(['bash', '-c', `git -C "${lane}" archive "${baseRev}" | tar -x -C "${D}"`]);
const ID = ['-c', 'user.name=topology63-fixture', '-c', 'user.email=fixture@invalid'];
const commit = (msg) => { sh(['git', '-C', D, 'add', '-A']); sh(['git', '-C', D, ...ID, 'commit', '-q', '--allow-empty', '-m', msg]); return sh(['git', '-C', D, 'rev-parse', 'HEAD']).stdout.trim(); };
const reset = (rev) => sh(['git', '-C', D, 'reset', '-q', '--hard', rev]);
commit('base');
const edit = (rel, fn) => { const p = join(D, rel); writeFileSync(p, fn(readFileSync(p, 'utf8'))); };

// ---- honest quotes: sentences present in both the committed capture and a live fetch
const caps = JSON.parse(readFileSync(join(D, '.ufo/pins/source-captures.json'), 'utf8')).captures;
const regLines = readFileSync(join(D, 'corpus/SOURCES.md'), 'utf8').split('\n');
const urlOf = (id) => { const l = regLines.find((x) => new RegExp(`^\\| ${id} \\|`).test(x)); return /(https?:\/\/[^\s|)]+)/.exec(l.split('|')[2])[1]; };
const bullets = [];
for (const id of ['S109', 'S110', 'S111']) {
  const c = caps.find((x) => x.sourceId === id);
  const capT = norm(readFileSync(join(D, c.path)));
  const live = sh(['curl', '-fsSL', '--max-time', '90', '--retry', '2', '-A', 'Mozilla/5.0 (kumitate-topology63)', urlOf(id)], { encoding: 'buffer' });
  const liveT = live.status === 0 ? norm(live.stdout) : '';
  const sentences = capT.split(/(?<=[.!?])\s+/).filter((s) => { const w = s.split(' ').length; return w >= 9 && w <= 22 && /^[A-Z]/.test(s) && /[a-z]{4}/.test(s) && !/[{}<>|=\\]/.test(s); });
  const picked = sentences.filter((s) => liveT.includes(s)).filter((s) => /deliver|retry|dead|timeout|redeliver|commit|offset|budget/i.test(s)).slice(0, 2);
  for (const s of picked) bullets.push({ id, q: s });
}
if (bullets.length < 6) { process.stderr.write(`only ${bullets.length} honest bullets found\n`); process.exit(2); }
const section = (bs) => `\n## Located quotes\n\n${bs.map((b) => `- ${b.id} — "${b.q}"`).join('\n')}\n`;
const entryPath = join(D, ENTRY);
const entry0 = readFileSync(entryPath, 'utf8');
writeFileSync(entryPath, entry0.replace(/\n+$/, '\n') + section(bullets));
// The base lane carries one known readme-map defect (round-62 verifier spot-check has no map row / covered pin).
// The honest fixture repairs it so the counter's global readme-map arm is judged on the entry, not on that defect.
edit('corpus/README.md', (t) => t.replace(/^(\| `lessons\/round-62\.md` \|.*)$/m, '$1\n| `lessons/round-62-verifier-spotcheck.md` | Round-62 non-author verification (fixture row) | `corpus/lessons/round-62-verifier-spotcheck.md` |'));
edit('.ufo/pins/readme-map.json', (t) => { const j = JSON.parse(t); j.covered.push('lessons/round-62-verifier-spotcheck.md'); return `${JSON.stringify(j, null, 1)}\n`; });
const honest = commit('honest');

const cases = [];
const run = (name, expectMiss) => { if (process.env.K63_ONLY && !process.env.K63_ONLY.split(",").includes(name)) return;
  const rev = sh(['git', '-C', D, 'rev-parse', 'HEAD']).stdout.trim();
  const r = sh(['node', PROBE, D, rev, '--entry', ENTRY, '--opened', OPENED]);
  const line = r.stdout.trim();
  const ok = expectMiss === null ? r.status === 0 && line.startsWith('TOPOLOGY63_HELD held=7/7') : r.status === 1 && line.startsWith('TOPOLOGY63_UNMET') && line.includes(`${expectMiss} MISS`);
  writeFileSync(join(out, `${name}.txt`), `${line}\nexit=${r.status}\nexpected=${expectMiss === null ? 'HELD' : `UNMET with ${expectMiss} MISS`}\nverdict=${ok ? 'AS-EXPECTED' : 'UNEXPECTED'}\n`);
  cases.push([name, expectMiss, ok, line.slice(0, 220), r.status]);
};
const variant = (name, expectMiss, mutate) => { reset(honest); mutate(); commit(name); run(name, expectMiss); };

reset(honest);
run('c0-honest', null);

variant('f1-forged-capture', 'T5', () => {
  const c = caps.find((x) => x.sourceId === 'S110');
  const q1 = 'The broker redelivers a rejected message to a hallucinated queue exactly seventeen times before parking it.';
  const q2 = 'A delivery limit of seventeen is the documented default for every quorum queue in this fabricated page.';
  const fake = Buffer.from(`<html><body><p>Fabricated page. ${q1}</p><p>${q2}</p></body></html>\n`);
  writeFileSync(join(D, c.path), fake);
  const pins = JSON.parse(readFileSync(join(D, '.ufo/pins/source-captures.json'), 'utf8'));
  const row = pins.captures.find((x) => x.sourceId === 'S110');
  row.sha256 = createHash('sha256').update(fake).digest('hex'); row.bytes = fake.length;
  writeFileSync(join(D, '.ufo/pins/source-captures.json'), `${JSON.stringify(pins, null, 1)}\n`);
  edit(ENTRY, (t) => `${t.split('\n').filter((l) => !l.startsWith('- S110 — "')).join('\n').replace(/\n+$/, '\n')}- S110 — "${q1}"\n- S110 — "${q2}"\n`);
});
variant('f2-phantom-row', 'T2', () => {
  edit('corpus/SOURCES.md', (t) => {
    const lines = t.split('\n');
    const i = lines.findIndex((l) => /^\| S110 \|/.test(l));
    const row = lines.splice(i, 1)[0];
    return `${lines.join('\n').replace(/\n+$/, '\n')}\n## Phantom\n\n${row}\n`;
  });
});
variant('f3-wrong-quote', 'T4', () => edit(ENTRY, (t) => t.replace(/^(- S109 — ")(.*)(")$/m, '$1A sentence that appears in no page anywhere at all today.$3')));
variant('f4-stale-opened', 'T2', () => edit('corpus/SOURCES.md', (t) => t.replace(/^(\| S111 \|.*\| mined \| )2026-10-24( \|)/m, '$12026-10-23$2')));
variant('f5-no-recheck', 'T1', () => edit(ENTRY, (t) => t.replace(/^recheck:.*\n/m, '')));
variant('f6-capture-edited', 'T3', () => { const c = caps.find((x) => x.sourceId === 'S109'); writeFileSync(join(D, c.path), `${readFileSync(join(D, c.path), 'utf8')} `); });
variant('f7-duplicate-id', 'T6', () => edit('corpus/SOURCES.md', (t) => { const lines = t.split('\n'); const i = lines.findIndex((l) => /^\| S110 \|/.test(l)); lines.splice(i + 1, 0, lines[i]); return lines.join('\n'); }));
variant('f8-used-by-lacks-entry', 'T2', () => edit('corpus/SOURCES.md', (t) => t.replace(/^(\| S109 \|.*\| )corpus\/knowledge\/bounded-redelivery-budgets\.md(, )?/m, '$1')));
variant('f9-province-unnamed', 'T7', () => edit('PROVINCE.md', (t) => t.split('\n').map((l) => l.split('corpus/knowledge/bounded-redelivery-budgets.md').join('corpus/knowledge/other.md')).join('\n')));
variant('f10-readme-row-removed', 'T7', () => edit('corpus/README.md', (t) => t.split('\n').filter((l) => !l.startsWith('| `knowledge/bounded-redelivery-budgets.md` |')).join('\n')));
variant('f11-five-bullets', 'T4', () => edit(ENTRY, (t) => { const lines = t.split('\n'); const i = lines.map((l, k) => (l.startsWith('- S1') && l.includes(' — "') ? k : -1)).filter((k) => k >= 0).pop(); lines.splice(i, 1); return lines.join('\n'); }));

if (process.env.K63_EXTRA === '1') {
  variant('p1-no-located-quotes', 'T4', () => edit(ENTRY, (t) => `${t.split('\n## Located quotes')[0]}\n`));
  variant('p2-over-25-words', 'T4', () => edit(ENTRY, (t) => { const m = /^- (S\d+) — "([^"]+)"$/m.exec(t); const id = m[1]; const c = caps.find((x) => x.sourceId === id); const capT = norm(readFileSync(join(D, c.path))); const at = capT.indexOf(norm(m[2])); const long = capT.slice(at, at + 240); return t.replace(m[0], () => `- ${id} — "${long}"`); }));
  variant('p3-row-without-bullet', 'T4', () => edit(ENTRY, (t) => { const ls = t.split('\n'); const b = ls.map((l, k) => (l.startsWith('- S109 — ') ? k : -1)).filter((k) => k >= 0); const s = ls.filter((l) => l.startsWith('- S110 — ')); b.forEach((k, i) => { ls[k] = s[i] || ls[k]; }); return ls.join('\n'); }));
  variant('p4-stale-verified-at', 'T1', () => edit(ENTRY, (t) => t.replace(/^verified-at: 2026-10-24/m, 'verified-at: 2026-10-23')));
  variant('p5-single-cited-row', 'T2', () => edit(ENTRY, (t) => t.replace(/^source:.*$/m, 'source: S109 — Apache Kafka 4.3 documentation, Design §Message delivery semantics, https://kafka.apache.org/43/design/design/')));
  variant('p6-province-nonfrontier', 'T7', () => edit('PROVINCE.md', (t) => t.split('\n').map((l) => (l.includes('corpus/knowledge/bounded-redelivery-budgets.md') ? 'see corpus/knowledge/bounded-redelivery-budgets.md (retired note)' : l)).join('\n')));
  variant('p7-row-12-cells', 'T2', () => edit('corpus/SOURCES.md', (t) => { const ls = t.split('\n'); const i = ls.findIndex((l) => l.startsWith('| S110 |')); const c = ls[i].split('|'); c.splice(7, 1); ls[i] = c.join('|'); return ls.join('\n'); }));
}

const lines = cases.map(([n, e, ok, l, st]) => `${ok ? 'AS-EXPECTED' : 'UNEXPECTED '} ${n} exit=${st} expect=${e === null ? 'HELD' : `${e} MISS`} :: ${l}`);
writeFileSync(join(out, 'summary.txt'), `${lines.join('\n')}\nhonest-bullets=${bullets.length}\nfixture-base=${baseRev}\n`);
process.stdout.write(`${lines.join('\n')}\n`);
rmSync(D, { recursive: true, force: true });
process.exit(cases.every((c) => c[2]) ? 0 : 1);
