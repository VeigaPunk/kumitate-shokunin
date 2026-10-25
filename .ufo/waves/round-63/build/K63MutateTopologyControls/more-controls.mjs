#!/usr/bin/env node
/**
 * more-controls.mjs — K63MutateTopologyControls: eight ADDITIONAL single-fault topology controls
 * (round-63 C2 control-set extension probe; wave w1 seat K63MutateTopologyControls).
 *
 *   node more-controls.mjs <lane-dir> <base-rev> <out-dir>
 *
 * Reuses the honest-fixture construction of the FROZEN probe/make-topology-controls.mjs verbatim
 * (archive <base-rev>, located quotes re-found in committed captures and a live fetch, round-62
 * spotcheck readme repair) and runs the FROZEN counter .ufo/waves/round-63/probe/topology63-probe.mjs
 * UNMODIFIED on each variant. Fixture repos live in a mktemp directory; every git call names
 * -C <fixture> and the toplevel is verified before the first commit. Writes <out>/<case>.txt and
 * <out>/more-summary.txt. Never writes anywhere else.
 *
 * Cases (want = the verdict the counter SHOULD read if it enforced the control's intent):
 *   n1  duplicate cited S-id on the entry source: line (counted-twice probe)      -> HELD expected (Set dedupe is correct: claim counts distinct rows)
 *   n1b one distinct row padded by duplication (floor-gaming probe)              -> UNMET T2+T4 expected
 *   n2  bullet quote of 1-3 words (minimum-length probe)                         -> HELD = CONTROL-GAP (no minimum-length arm)
 *   n3  row URL changed to another host while the capture stays                  -> UNMET T5 expected
 *   n4  pin capture path escapes the repo (../)                                  -> UNMET T3 (+T4 cascade) expected
 *   n5  source-captures.json entry for a cited row missing                       -> UNMET T3 (+T4 cascade) expected
 *   n6  PROVINCE names a different path containing the entry path as a prefix    -> HELD = HOLE (T7 uses String.includes)
 *   n7  used-by names a different EXISTING path containing the entry path prefix -> HELD = HOLE (T2 usedBy.includes + census E11 satisfied)
 */
import { spawnSync } from 'node:child_process';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const [laneArg, baseRev, outArg] = process.argv.slice(2);
if (!laneArg || !baseRev || !outArg) { process.stderr.write('usage: more-controls.mjs <lane-dir> <base-rev> <out-dir>\n'); process.exit(64); }
const lane = resolve(laneArg);
const out = resolve(outArg);
const PROBE = join(lane, '.ufo/waves/round-63/probe/topology63-probe.mjs');
const ENTRY = 'corpus/knowledge/bounded-redelivery-budgets.md';
const OPENED = '2026-10-24';
mkdirSync(out, { recursive: true });

const sh = (args, o = {}) => spawnSync(args[0], args.slice(1), { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024, ...o });
const norm = (s) => s.toString('utf8')
  .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;|&#160;/g, ' ').replace(/\u0026amp;/g, '&').replace(/\u0026lt;/g, '<').replace(/\u0026gt;/g, '>')
  .replace(/\u0026quot;|&#34;/g, '"').replace(/&#39;|&#x27;|\u0026apos;/g, "'")
  .replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, '"').replace(/[\u2013\u2014]/g, '-')
  .replace(/\*\*|__|`/g, '').replace(/\s+/g, ' ').trim();

// ---- fixture repo from <base-rev> (verbatim honest-fixture construction of the frozen generator)
const D = mkdtempSync(join(tmpdir(), 'topology63-more.'));
sh(['git', '-C', D, 'init', '-q']);
const top = sh(['git', '-C', D, 'rev-parse', '--show-toplevel']).stdout.trim();
if (top !== D) { process.stderr.write(`fixture toplevel ${top} != ${D}\n`); process.exit(2); }
sh(['bash', '-c', `git -C "${lane}" archive "${baseRev}" | tar -x -C "${D}"`]);
const ID = ['-c', 'user.name=topology63-more-fixture', '-c', 'user.email=fixture@invalid'];
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
edit('corpus/README.md', (t) => t.replace(/^(\| `lessons\/round-62\.md` \|.*)$/m, '$1\n| `lessons/round-62-verifier-spotcheck.md` | Round-62 non-author verification (fixture row) | `corpus/lessons/round-62-verifier-spotcheck.md` |'));
edit('.ufo/pins/readme-map.json', (t) => { const j = JSON.parse(t); j.covered.push('lessons/round-62-verifier-spotcheck.md'); return `${JSON.stringify(j, null, 1)}\n`; });
const honest = commit('honest');

// ---- case runner: want = { verdict: 'HELD' | 'UNMET', arms?: [..], hole?: reason }
const cases = [];
const run = (name, want) => {
  const rev = sh(['git', '-C', D, 'rev-parse', 'HEAD']).stdout.trim();
  const r = sh(['node', PROBE, D, rev, '--entry', ENTRY, '--opened', OPENED]);
  const line = r.stdout.trim();
  const arms = want.arms || [];
  const ok = want.verdict === 'HELD'
    ? r.status === 0 && line.startsWith('TOPOLOGY63_HELD held=7/7')
    : r.status === 1 && line.startsWith('TOPOLOGY63_UNMET') && arms.every((a) => line.includes(`${a} MISS`));
  const cls = want.hole ? `HOLE: ${want.hole}` : (want.verdict === 'HELD' ? 'counter-HELD-correct' : 'caught');
  writeFileSync(join(out, `${name}.txt`), `${line}\nexit=${r.status}\nexpected=${want.verdict}${arms.length ? ` with ${arms.join('+')} MISS` : ''}\nverdict=${ok ? 'AS-EXPECTED' : 'UNEXPECTED'}\nclassification=${cls}\n`);
  cases.push([name, want, ok, line.slice(0, 220), r.status, cls]);
};
const variant = (name, want, mutate) => { reset(honest); mutate(); commit(name); run(name, want); };

// ---- n1: duplicate cited S-id on the entry's source: line (counted-twice probe)
variant('n1-dup-source-id', { verdict: 'HELD' }, () => edit(ENTRY, (t) => t.replace(/^source: S109 — /m, 'source: S109 S109 — ')));
// ---- n1b: one distinct row padded by duplication (does the >=2 floor count tokens?)
variant('n1b-dup-only-one-row', { verdict: 'UNMET', arms: ['T2', 'T4'] }, () => edit(ENTRY, (t) => t.replace(/^source:.*$/m, 'source: S109 S109')));
// ---- n2: bullet quote of 1-3 words, taken from an honest sentence so capture+live both contain it
variant('n2-short-quote', { verdict: 'HELD', hole: 'no minimum quote length: T4 only enforces <=25 words; a 2-word quote satisfies Located quotes' }, () => {
  const w = bullets[bullets.length - 1].q.split(/\s+/);
  let pair = '';
  for (let k = 2; k < w.length - 2; k += 1) {
    if (/^[A-Za-z][A-Za-z'-]*$/.test(w[k]) && /^[A-Za-z][A-Za-z'-]*$/.test(w[k + 1])) { pair = `${w[k]} ${w[k + 1]}`; break; }
  }
  if (!pair) throw new Error('no short pair found');
  edit(ENTRY, (t) => t.replace(/\n$/, `\n- ${bullets[bullets.length - 1].id} — "${pair}"\n`));
});
// ---- n3: row URL changed to another host while the capture stays
variant('n3-url-host-swap', { verdict: 'UNMET', arms: ['T5'] }, () => edit('corpus/SOURCES.md', (t) => t.split('\n').map((l) => {
  if (!/^\| S110 \|/.test(l)) return l;
  const c = l.split('|'); c[2] = c[2].replace('https://www.rabbitmq.com/docs/dlx', 'https://127.0.0.1:1/topology63-host-swap'); return c.join('|');
}).join('\n')));
// ---- n4: pin capture path escapes the repo (../)
variant('n4-capture-path-escape', { verdict: 'UNMET', arms: ['T3', 'T4'] }, () => {
  const pins = JSON.parse(readFileSync(join(D, '.ufo/pins/source-captures.json'), 'utf8'));
  pins.captures.find((x) => x.sourceId === 'S111').path = '../topology63-escape-absent.html';
  writeFileSync(join(D, '.ufo/pins/source-captures.json'), `${JSON.stringify(pins, null, 1)}\n`);
});
// ---- n5: source-captures.json entry for a cited row missing entirely
variant('n5-pin-entry-missing', { verdict: 'UNMET', arms: ['T3', 'T4'] }, () => {
  const pins = JSON.parse(readFileSync(join(D, '.ufo/pins/source-captures.json'), 'utf8'));
  pins.captures = pins.captures.filter((x) => x.sourceId !== 'S110');
  writeFileSync(join(D, '.ufo/pins/source-captures.json'), `${JSON.stringify(pins, null, 1)}\n`);
});
// ---- n6: PROVINCE names a different path that contains the entry path as a prefix
variant('n6-province-prefix-path', { verdict: 'HELD', hole: 'T7 named check is String.includes: a suffixed path still contains the entry path' }, () => edit('PROVINCE.md', (t) => t.split('corpus/knowledge/bounded-redelivery-budgets.md').join('corpus/knowledge/bounded-redelivery-budgets.md-void')));
// ---- n7: used-by names a different EXISTING path containing the entry path as a prefix
variant('n7-usedby-prefix-path-existing', { verdict: 'HELD', hole: 'T2 usedBy.includes(ENTRY) + census E11 satisfied because the suffixed file exists' }, () => {
  edit('corpus/SOURCES.md', (t) => t.split('\n').map((l) => {
    if (!/^\| S109 \|/.test(l)) return l;
    const c = l.split('|'); c[11] = c[11].replace('corpus/knowledge/bounded-redelivery-budgets.md', 'corpus/knowledge/bounded-redelivery-budgets.md.hole'); return c.join('|');
  }).join('\n'));
  cpSync(join(D, ENTRY), join(D, 'corpus/knowledge/bounded-redelivery-budgets.md.hole'));
});

const lines = cases.map(([n, w, ok, l, st, cls]) => `${ok ? 'AS-EXPECTED' : 'UNEXPECTED '} ${n} exit=${st} want=${w.verdict}${(w.arms || []).length ? ` with ${(w.arms || []).join('+')} MISS` : ''} :: ${l} :: ${cls}`);
const holes = cases.filter((c) => (c[1].hole || '') && c[4] === 0).map((c) => c[0]);
writeFileSync(join(out, 'more-summary.txt'), `${lines.join('\n')}\nhonest-bullets=${bullets.length}\nfixture-base=${baseRev}\nHELD-despite-fault=${holes.join(',') || 'none'}\n`);
process.stdout.write(`${lines.join('\n')}\nhonest-bullets=${bullets.length}\nHELD-despite-fault=${holes.join(',') || 'none'}\n`);
rmSync(D, { recursive: true, force: true });
process.exit(cases.every((c) => c[2]) ? 0 : 1);
