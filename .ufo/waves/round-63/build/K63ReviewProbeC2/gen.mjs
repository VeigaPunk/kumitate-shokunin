// K63ReviewProbeC2 — attack battery for the frozen C2 counter (rule T63 v1).
// Fixture repos live in mktemp dirs; fixture git identity is used only inside them.
// The frozen probe is executed in place, never modified. Outputs go to the seat build dir.
import { spawn, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { chmodSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const LANE = '/home/vgpnk/Projects/shokunin/kumitate-shokunin';
const BASE = 'dfa6fca8f362e9c962f5b940025a2619380b759b';
const PROBE = join(LANE, '.ufo/waves/round-63/probe/topology63-probe.mjs');
const CENSUS = '/home/vgpnk/Projects/shokunin/scripts/sources-census.sh';
const OUT = join(LANE, '.ufo/waves/round-63/build/K63ReviewProbeC2');
const ENTRY = 'corpus/knowledge/bounded-redelivery-budgets.md';
const OPENED = '2026-10-24';
mkdirSync(OUT, { recursive: true });
const sh = (args, o = {}) => spawnSync(args[0], args.slice(1), { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024, ...o });

// Verbatim copy of the frozen counter's norm() (topology63-probe.mjs:46-53) for pre-assertions.
const norm = (s) => s.toString('utf8')
  .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;|&#160;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;|&#34;/g, '"').replace(/&#39;|&#x27;|&apos;/g, "'")
  .replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, '"').replace(/[\u2013\u2014]/g, '-')
  .replace(/\*\*|__|`/g, '').replace(/\s+/g, ' ').trim();

// ---- forged pages (served live AND committed as captures, byte-identical) ----
const P196 = `<!doctype html>
<html><head><title>Managed Coordinator Contract</title>
<script>window.analytics=4242;</script>
</head><body>
<h1>Managed Coordinator Contract</h1>
<p>The coordinator spawns at most eight bounded workers per workspace and refuses unbounded fan-out.</p>
<table><tr><td>The coordinator writes</td></tr><tr><td>one audit line per spawn event.</td></tr></table>
<p>This sentence is plainly visible to every honest reader today.</p>
<span style="display:none">A hidden audit note claims the coordinator redelivers every task reliably.</span>
</body></html>
`;
const P197 = `<!doctype html>
<html><head><title>Coordinator Scaling Study v3</title></head><body>
<h1>Coordinator Scaling Study</h1>
<p>Across 1,200 runs, throughput peaked near sixteen workers and then collapsed.</p>
<p>Prefix clause about worker budgets.</p>
<script>unrelated garbage tokens live here</script>
<p>Suffix clause about retry ceilings after failure.</p>
<p>Quality degrades when the coordinator &amp; its queue disagree \u2014 badly.</p>
</body></html>
`;
const Q = [
  ['S196', 'The coordinator spawns at most eight bounded workers per workspace and refuses unbounded fan-out.'],
  ['S196', 'The coordinator writes one audit line per spawn event.'],
  ['S196', 'A hidden audit note claims the coordinator redelivers every task reliably.'],
  ['S197', 'Across 1,200 runs, throughput peaked near sixteen workers and then collapsed.'],
  ['S197', 'Prefix clause about worker budgets. Suffix clause about retry ceilings after failure.'],
  ['S197', 'Quality degrades when the coordinator & its queue disagree - badly.'],
];

// ---- fixture repo ----
const D = mkdtempSync(join(tmpdir(), 'k63c2-attack.'));
sh(['git', '-C', D, 'init', '-q']);
const top = sh(['git', '-C', D, 'rev-parse', '--show-toplevel']).stdout.trim();
if (top !== D) { console.error(`FATAL fixture toplevel ${top} != ${D}`); process.exit(2); }
sh(['bash', '-c', `git -C "${LANE}" archive "${BASE}" | tar -x -C "${D}"`]);
const ID = ['-c', 'user.name=k63c2-fixture', '-c', 'user.email=fixture@invalid'];
const commit = (m) => { sh(['git', '-C', D, 'add', '-A']); sh(['git', '-C', D, ...ID, 'commit', '-q', '--allow-empty', '-m', m]); return sh(['git', '-C', D, 'rev-parse', 'HEAD']).stdout.trim(); };
const reset = (r) => sh(['git', '-C', D, 'reset', '-q', '--hard', r]);
const edit = (rel, fn) => { const p = join(D, rel); writeFileSync(p, fn(readFileSync(p, 'utf8'))); };
commit('base');

// pre-assertions: every forged quote must be found by norm in the page bytes (else abort honestly)
const pre = [];
for (const [id, q] of Q) {
  const page = id === 'S196' ? P196 : P197;
  const hit = norm(page).includes(norm(q));
  pre.push(`${id} "${q.slice(0, 40)}..." norm-hit=${hit}`);
  if (!hit) { console.error(`FATAL pre-assert failed for ${id}: ${q}`); console.error(pre.join('\n')); process.exit(2); }
}
writeFileSync(join(OUT, 'pre-assertions.txt'), pre.join('\n') + '\n');

// ---- local HTTP server serving the capture bytes ----
const PORT = 41000 + (process.pid % 20000);
const CAPDIR = join(D, '.ufo/pins/captures');
mkdirSync(CAPDIR, { recursive: true });
writeFileSync(join(CAPDIR, 'S196.html'), P196);
writeFileSync(join(CAPDIR, 'S197.html'), P197);
const SRV = `const http=require('http'),fs=require('fs'),path=require('path');
const root=process.argv[1],port=+process.argv[2];
http.createServer((q,s)=>{const p=path.join(root,decodeURIComponent(q.url.split('?')[0]));
fs.readFile(p,(e,b)=>{if(e){s.statusCode=404;s.end('nf');return;}s.setHeader('content-type','text/html');s.end(b);});}).listen(port,'127.0.0.1',()=>console.error('listening'));`;
const srv = spawn('node', ['-e', SRV, CAPDIR, String(PORT)], { stdio: ['ignore', 'ignore', 'inherit'] });
let ready = false;
for (let i = 0; i < 50 && !ready; i += 1) { ready = sh(['curl', '-fsS', `http://127.0.0.1:${PORT}/S196.html`]).status === 0; if (!ready) { const sl = spawnSync('sleep', ['0.1']); } }
if (!ready) { console.error('FATAL local server never became ready'); srv.kill(); process.exit(2); }

const rec = (name, predicate, expectLabel, r, extra = '') => {
  const line = (r.stdout || '').trim();
  const ok = predicate(r.status, line);
  writeFileSync(join(OUT, `${name}.txt`), `${line}\nexit=${r.status}\nexpected=${expectLabel}\nverdict=${ok ? 'AS-EXPECTED' : 'UNEXPECTED'}\n${extra}`);
  console.log(`${ok ? 'AS-EXPECTED' : 'UNEXPECTED '} ${name} exit=${r.status} :: ${line.slice(0, 210)}`);
  return ok;
};
const HELD = (st, line) => st === 0 && line.startsWith('TOPOLOGY63_HELD held=7/7');
const runProbe = (env) => {
  const rev = sh(['git', '-C', D, 'rev-parse', 'HEAD']).stdout.trim();
  return sh(['node', PROBE, D, rev, '--entry', ENTRY, '--opened', OPENED], env ? { env: { ...process.env, ...env } } : {});
};

// ---- x1: complete forgery from self-hosted pages ----
const shaOf = (p) => createHash('sha256').update(readFileSync(p)).digest('hex');
const capEntry = (id) => ({ sourceId: id, path: `.ufo/pins/captures/${id}.html`, sha256: shaOf(join(CAPDIR, `${id}.html`)), bytes: readFileSync(join(CAPDIR, `${id}.html`)).length, captured: OPENED });
edit('.ufo/pins/source-captures.json', (t) => { const j = JSON.parse(t); j.captures.push(capEntry('S196'), capEntry('S197')); return `${JSON.stringify(j, null, 1)}\n`; });
const row = (id, title, teaches) => `| ${id} | ${title} — http://127.0.0.1:${PORT}/${id}.html | docs | A | forged page served by the review-probe attack battery | §1; fetched ${OPENED} | ${teaches} | mined | ${OPENED} | 90d | ${ENTRY} |`;
edit('corpus/SOURCES.md', (t) => { const ls = t.split('\n'); const i = ls.findIndex((l) => l.startsWith('| S001 |')); ls.splice(i + 1, 0, row('S196', 'Managed Coordinator Contract (self-hosted forgery demo)', 'coordinator spawn caps, audit lines, hidden redelivery claims'), row('S197', 'Coordinator Scaling Study (self-hosted forgery demo)', 'measured throughput peak and retry ceilings')); return ls.join('\n'); });
const srcLine = `source: S196 — Managed Coordinator Contract (self-hosted forgery demo), http://127.0.0.1:${PORT}/S196.html; S197 — Coordinator Scaling Study (self-hosted forgery demo), http://127.0.0.1:${PORT}/S197.html`;
const section = `\n## Located quotes\n\n${Q.map(([id, q]) => `- ${id} — "${q}"`).join('\n')}\n`;
edit(ENTRY, (t) => t.replace(/^source:.*$/m, srcLine) + section);
edit('corpus/README.md', (t) => t.replace(/^(\| `lessons\/round-62\.md` \|.*)$/m, '$1\n| `lessons/round-62-verifier-spotcheck.md` | Round-62 non-author verification (fixture row) | `corpus/lessons/round-62-verifier-spotcheck.md` |'));
edit('.ufo/pins/readme-map.json', (t) => { const j = JSON.parse(t); j.covered.push('lessons/round-62-verifier-spotcheck.md'); return `${JSON.stringify(j, null, 1)}\n`; });
const x1 = commit('x1-full-forgery');
rec('x1-full-forgery', HELD, 'HELD 7/7 (claim forgeable with one local HTTP server)', runProbe(), `fixture-rev=${x1}\n`);

// ---- x2: used-by substring (decoy sibling path that merely contains the entry path) ----
reset(x1);
edit('corpus/SOURCES.md', (t) => t.split('\n').map((l) => (l.startsWith('| S196 |') ? l.replace(ENTRY, `${ENTRY}.license`) : l)).join('\n'));
writeFileSync(join(D, 'corpus/knowledge/bounded-redelivery-budgets.md.license'), 'sibling decoy file (exists on disk so census E11 passes)\n');
commit('x2-usedby-substring');
rec('x2-usedby-substring', HELD, 'HELD 7/7 (used-by matched by substring, never as a path)', runProbe());

// ---- x3: one-word quotes (no minimum quote length) ----
reset(x1);
const assertThe = norm(P196).includes('the') && norm(P197).includes('the');
if (!assertThe) { console.error('FATAL: "the" not in forged pages'); srv.kill(); process.exit(2); }
edit(ENTRY, (t) => t.replace(/\n## Located quotes[\s\S]*$/, '\n## Located quotes\n\n' + ['S196', 'S196', 'S196', 'S197', 'S197', 'S197'].map((i) => `- ${i} — "the"`).join('\n') + '\n'));
commit('x3-one-word-bullets');
rec('x3-one-word-bullets', HELD, 'HELD 7/7 (six one-word quotes satisfy T4+T5)', runProbe());

// ---- x8: vacuous T5 pass when the entry has no source: lines ----
reset(x1);
edit(ENTRY, (t) => t.replace(/^source:.*$/m, 'sourced-from: S196 and S197 (renamed key defeats the counter scan)'));
commit('x8-vacuous-t5');
rec('x8-vacuous-t5',
  (st, line) => st === 1 && line.includes('TOPOLOGY63_UNMET') && !line.includes('T5 MISS'),
  'UNMET but with T5 NOT in the miss list (T5 passes vacuously)',
  runProbe());

// ---- x10: T7 "frontier line" satisfied by any line containing the path + the words band/ground ----
reset(x1);
edit('PROVINCE.md', (t) => t.split('\n').map((l) => (l.includes(ENTRY) ? `archived scratch note: band ground draft of ${ENTRY} (not a frontier row)` : l)).join('\n'));
commit('x10-province-junk-line');
rec('x10-province-junk-line', HELD, 'HELD 7/7 (junk line alone satisfies the T7 naming regex)', runProbe());

// ---- x7: T6 verdict is runner-environment-sensitive (SOURCES_CENSUS env override) ----
reset(x1);
edit('corpus/SOURCES.md', (t) => { const ls = t.split('\n'); const i = ls.findIndex((l) => l.startsWith('| S196 |')); ls.splice(i + 1, 0, ls[i]); return ls.join('\n'); });
commit('x7-dup-id');
rec('x7a-dup-id-real-census', (st, line) => st === 1 && line.includes('T6 MISS'), 'UNMET with T6 MISS (census E03 duplicate id)', runProbe());
const FAKE = join(tmpdir(), 'k63c2-fake-census.sh');
writeFileSync(FAKE, '#!/usr/bin/env bash\nexit 0\n');
chmodSync(FAKE, 0o755);
rec('x7b-dup-id-fake-census-env', HELD, 'HELD 7/7 (same commit, SOURCES_CENSUS pointed at an always-exit-0 script)', runProbe({ SOURCES_CENSUS: FAKE }));

// ---- d1: HTML comment channel (expected CLOSED) ----
{
  const probe = '<p>before</p><!--hidden comment words live here--><p>after</p>';
  const hit = norm(probe).includes('hidden comment words');
  writeFileSync(join(OUT, 'd1-comment-channel.txt'), `comment content found by norm: ${hit}\nexpected: false (norm strips <!--...--> whole)\n`);
  console.log(`d1-comment-channel hit=${hit} (expected false)`);
}

// ---- d2: escaped pipe in a row cell — census vs counter NF parity ----
{
  const mini = join(tmpdir(), 'k63c2-ep.md');
  writeFileSync(mini, [
    '# R', '', '## Registry', '',
    '| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |',
    '|---|---|---|---|---|---|---|---|---|---|---|',
    '| S901 | Escaped pipe docs — https://ep.example/a | docs | B | ep | §1 | teaches with \\| pipe | queued | 2026-10-01 | 90d | — |',
    '', '',
  ].join('\n'));
  const c = sh(['bash', CENSUS, 'validate', '--file', mini]);
  const nf = readFileSync(mini, 'utf8').split('\n').find((l) => l.startsWith('| S901')).replace(/^ {0,3}/, '').split('|').length;
  writeFileSync(join(OUT, 'd2-escaped-pipe.txt'), `census exit=${c.status}\n${(c.stdout || '').trim()}\nprobe cells() NF=${nf} (T2 requires exactly 13 -> MISS NF=${nf})\n`);
  console.log(`d2-escaped-pipe census-exit=${c.status} probe-NF=${nf}`);
}

srv.kill();
writeFileSync(join(OUT, 'summary.txt'), `fixture-base=${BASE}\nx1-full-forgery-rev=${x1}\nport=${PORT}\n`);
rmSync(D, { recursive: true, force: true });
console.log('DONE');
