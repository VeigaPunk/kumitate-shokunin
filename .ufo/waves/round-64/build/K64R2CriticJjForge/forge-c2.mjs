#!/usr/bin/env node
/**
 * forge-c2.mjs — seat K64R2CriticJjForge, round 64 wave 2.
 * Regenerates the C2 forgeries against the REAL integrated tree (2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8)
 * in a sandbox clone. Never touches the lane, the fleet, jj state or the frozen artifacts.
 *
 * usage: node forge-c2.mjs <clone-dir> [variant ...]
 * Every commit is made inside <clone-dir> only, with a throwaway identity.
 */
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const LANE = '/home/vgpnk/Projects/shokunin/kumitate-shokunin';
const PROBE = join(LANE, '.ufo/waves/round-64/probe/jj64-probe.mjs');
const BASE = '2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8';
const ENTRY = 'corpus/knowledge/jj-workspace-seat-containment.md';
const C = process.argv[2];
if (!C) { console.error('usage: forge-c2.mjs <clone-dir> [variant ...]'); process.exit(64); }
const OUT = '/tmp/kumitate-r64/K64R2CriticJjForge';
const only = process.argv.slice(3);

const g = (args) => spawnSync('git', ['-C', C, ...args], { encoding: 'utf8' });
const top = g(['rev-parse', '--show-toplevel']).stdout.trim();
if (top !== C) { console.error(`refusing: toplevel ${top} != ${C}`); process.exit(65); }

const read = (rel) => readFileSync(join(C, rel), 'utf8');
const write = (rel, s) => writeFileSync(join(C, rel), s);

function fresh(name) {
  const r = g(['checkout', '-q', '-f', '-B', name, BASE]);
  if (r.status !== 0) throw new Error(`checkout ${name}: ${r.stderr}`);
}
function commit(msg) {
  let r = g(['add', '-A']);
  if (r.status !== 0) throw new Error(`add: ${r.stderr}`);
  r = spawnSync('git', ['-C', C, '-c', 'user.name=fixture', '-c', 'user.email=fixture@example.invalid', 'commit', '-q', '-m', msg], { encoding: 'utf8' });
  if (r.status !== 0) throw new Error(`commit: ${r.stderr}`);
  return g(['rev-parse', 'HEAD']).stdout.trim();
}
function rep(text, from, to) {
  const n = text.split(from).length - 1;
  if (n !== 1) throw new Error(`anchor not unique (${n}): ${from.slice(0, 60)}`);
  return text.replace(from, to);
}
function statedOf(text) {
  const at = text.search(/^##\s+Demo outcomes\s*$/m);
  const m = new Map();
  for (const l of text.slice(at).split('\n').slice(1)) {
    if (/^##\s/.test(l)) break;
    const x = /^-\s+([a-z0-9_]+)=(.*?)\s*$/.exec(l);
    if (x) m.set(x[1], x[2]);
  }
  return m;
}
function verdict(rev, cwd = OUT) {
  const r = spawnSync('node', [PROBE, C, rev], { encoding: 'utf8', cwd, timeout: 300000 });
  return `${(r.stdout || '').trim()}\nexit=${r.status}`;
}

const results = [];
function run(name, note, build, opts = {}) {
  if (only.length && !only.includes(name)) return;
  fresh(`forge-${name}`);
  build();
  const rev = commit(`forge ${name}: ${note}`);
  const line = verdict(rev, opts.cwd);
  const rec = { name, note, rev, line, extra: opts.extra ? opts.extra(rev) : '' };
  results.push(rec);
  console.log(`\n### ${name} ${rev}\n${line}${rec.extra ? `\n${rec.extra}` : ''}`);
}

// ---------------------------------------------------------------- F1: wrong prose, outcomes untouched
run('F1', 'entry body prose + decision table assert the OPPOSITE of the measured outcomes; Demo outcomes untouched', () => {
  let t = read(ENTRY);
  t = rep(t, 'It is **stale** after another workspace **abandons** that commit', 'It stays **fresh** after another workspace **abandons** that commit');
  t = rep(t, 'and it is stale after a rewrite that **changes the tree**', 'and it stays fresh after a rewrite that **changes the tree**');
  t = rep(t, 'An abandon of an\n**empty** seat head leaves the seat fresh', 'An abandon of an\n**empty** seat head leaves the seat stale');
  t = rep(t, 'the seat is stale (`rewrite_treechange_seat_state=stale`, `abandon_seat_head_seat_state=stale`)',
    'the seat stays fresh (`rewrite_treechange_seat_state=fresh`, `abandon_seat_head_seat_state=fresh`)');
  write(ENTRY, t);
}, { extra: (rev) => `prose-vs-outcomes disagreement: ${spawnSync('bash', ['-c', `cd ${C} && git show ${rev}:${ENTRY} | grep -c 'It stays \\*\\*fresh\\*\\* after another workspace'`], { encoding: 'utf8' }).stdout.trim()} flipped prose anchor(s); Demo outcomes section byte-identical to ${BASE.slice(0, 8)}: ${spawnSync('bash', ['-c', `cd ${C} && diff <(git show ${BASE}:${ENTRY} | sed -n '/^## Demo outcomes/,/^## Located quotes/p') <(git show ${rev}:${ENTRY} | sed -n '/^## Demo outcomes/,/^## Located quotes/p') >/dev/null && echo yes || echo no`], { encoding: 'utf8' }).stdout.trim()}` });

// ---------------------------------------------------------------- F2: real quotes, invented body
run('F2', 'Located quotes real (untouched), Mechanism section replaced by invented claims contradicted by the entry own outcomes', () => {
  let t = read(ENTRY);
  const invented = [
    '## Mechanism (S198, S200, S199)',
    '',
    'Each workspace keeps its own private operation log; a seat\'s snapshots never enter the default workspace\'s log,',
    'so one seat cannot observe another\'s operations (S198). jj workspaces are a filesystem sandbox: a process positioned',
    'in a seat cannot write outside its directory, and the default workspace is unreachable by absolute path (S200).',
    'A seat never goes stale, because jj re-snapshots every workspace before each command (S199).',
    '',
  ].join('\n');
  const re = /## Mechanism \(S198, S200, S199\)\n[\s\S]*?(?=## Decision table)/;
  if (!re.test(t)) throw new Error('Mechanism section anchor missing');
  t = t.replace(re, `${invented}\n`);
  write(ENTRY, t);
});

// ---------------------------------------------------------------- F3: demo echoes stated values
run('F3', 'scripts/jj-seat-demo.sh replaced by a heredoc echo of the entry stated values; no jj, no fixture; writes into caller cwd', () => {
  const stated = statedOf(read(ENTRY));
  const lines = [...stated].map(([k, v]) => `JJ_SEAT: ${k}=${v}`).join('\n');
  const demo = `#!/usr/bin/env bash\n# forged demo: prints the entry's own stated values, calls no jj\nset -u\npwd > "$PWD/demo-cwd.txt" 2>/dev/null || true\ncat <<'OUT'\n${lines}\nJJ_SEAT_DEMO: DONE jj=0.45.1-forged\nOUT\nexit 0\n`;
  write('scripts/jj-seat-demo.sh', demo);
}, {
  cwd: (() => { const d = join(OUT, 'cwdtest'); mkdirSync(d, { recursive: true }); return d; })(),
  extra: (rev) => {
    const d = spawnSync('bash', ['-c', `cd ${C} && git show ${rev}:scripts/jj-seat-demo.sh | grep -c 'jj '`], { encoding: 'utf8' }).stdout.trim();
    const cw = existsSync(join(OUT, 'cwdtest', 'demo-cwd.txt')) ? readFileSync(join(OUT, 'cwdtest', 'demo-cwd.txt'), 'utf8').trim() : '(absent)';
    return `forged demo 'jj ' occurrences=${d}; demo-cwd.txt written at ${cw} (caller cwd, not the archive)`;
  },
});

// ---------------------------------------------------------------- F3b: 12 arbitrary keys, arbitrary values
run('F3b', 'Demo outcomes reduced to 12 arbitrary key/value pairs the demo echoes; every measured outcome key dropped', () => {
  let t = read(ENTRY);
  const keys = Array.from({ length: 12 }, (_, i) => [`k${String(i + 1).padStart(2, '0')}`, `v${i + 1}`]);
  const bullets = keys.map(([k, v]) => `- ${k}=${v}`).join('\n');
  const re = /(## Demo outcomes\n\n)[\s\S]*?(?=\n## Located quotes)/;
  if (!re.test(t)) throw new Error('Demo outcomes anchor missing');
  t = t.replace(re, `$1${bullets}`);
  write(ENTRY, t);
  const demo = `#!/usr/bin/env bash\nset -u\ncat <<'OUT'\n${keys.map(([k, v]) => `JJ_SEAT: ${k}=${v}`).join('\n')}\nJJ_SEAT_DEMO: DONE jj=0.45.1-forged\nOUT\nexit 0\n`;
  write('scripts/jj-seat-demo.sh', demo);
});

// ---------------------------------------------------------------- F3c: 12 empty values
run('F3c', 'Demo outcomes reduced to 12 keys with EMPTY values; demo echoes 12 empty values', () => {
  let t = read(ENTRY);
  const keys = Array.from({ length: 12 }, (_, i) => `k${String(i + 1).padStart(2, '0')}`);
  const re = /(## Demo outcomes\n\n)[\s\S]*?(?=\n## Located quotes)/;
  t = t.replace(re, `$1${keys.map((k) => `- ${k}=`).join('\n')}`);
  write(ENTRY, t);
  const demo = `#!/usr/bin/env bash\nset -u\ncat <<'OUT'\n${keys.map((k) => `JJ_SEAT: ${k}=`).join('\n')}\nJJ_SEAT_DEMO: DONE jj=0.45.1-forged\nOUT\nexit 0\n`;
  write('scripts/jj-seat-demo.sh', demo);
});

// ---------------------------------------------------------------- F4: capture replaced by synthetic text + pin recomputed
run('F4', 'S199 capture replaced by synthetic text (not the Firefox page) holding the three cited quotes; source-captures.json pin recomputed', () => {
  const pinsRel = '.ufo/pins/source-captures.json';
  const pins = JSON.parse(read(pinsRel));
  const entryText = read(ENTRY);
  const quotes = [...entryText.matchAll(/^-\s+S199\s+[—-]\s+"(.+)"\s*$/gm)].map((m) => m[1]);
  if (quotes.length !== 3) throw new Error(`expected 3 S199 quotes, got ${quotes.length}`);
  const synth = `<html><body><h1>synthetic page, authored by the forger</h1>\n${quotes.map((q) => `<p>${q}</p>`).join('\n')}\n</body></html>\n`;
  const cap = pins.captures.find((c) => c.sourceId === 'S199');
  write(cap.path, synth);
  cap.sha256 = createHash('sha256').update(readFileSync(join(C, cap.path))).digest('hex');
  cap.bytes = readFileSync(join(C, cap.path)).length;
  write(pinsRel, `${JSON.stringify(pins, null, 1)}\n`);
}, {
  extra: (rev) => {
    const h = spawnSync('bash', ['-c', `cd ${C} && git show ${rev}:.ufo/waves/round-64/build/Capture/firefox-jujutsu.html | head -1 | cut -c1-60`], { encoding: 'utf8' }).stdout.trim();
    return `capture first line now: ${h}`;
  },
});

// ---------------------------------------------------------------- calibrations (must MISS)
run('C1', 'calibration: one stated value contradicts the honest demo (expect J6 MISS)', () => {
  let t = read(ENTRY);
  t = rep(t, '- abandon_seat_head_seat_state=stale', '- abandon_seat_head_seat_state=fresh');
  write(ENTRY, t);
});
run('C2', 'calibration: capture bytes changed, pin NOT recomputed (expect J3 MISS)', () => {
  const pins = JSON.parse(read('.ufo/pins/source-captures.json'));
  const cap = pins.captures.find((c) => c.sourceId === 'S198');
  write(cap.path, `${read(cap.path)}\n<!-- appended by forger -->\n`);
});
run('C3', 'calibration: all S199 bullets removed (expect J4 MISS)', () => {
  const t = read(ENTRY).replace(/^-\s+S199\s+[—-]\s+".+"\s*$\n?/gm, '');
  write(ENTRY, t);
});

writeFileSync(join(OUT, 'verdicts.json'), `${JSON.stringify(results, null, 1)}\n`);
console.log(`\nwrote ${join(OUT, 'verdicts.json')} (${results.length} variants)`);
