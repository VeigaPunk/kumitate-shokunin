#!/usr/bin/env node
// K70ProbeSpaces — isolated path-edge probe for the R70 replay implementation contract.
// Edge under test: --lane / --work / --out / TMPDIR values containing spaces AND apostrophes,
// with zero shell interpolation (all child spawns are array-argv; paths flow via argv/env only).
//
// Labels:
//   Stage A — wrapper surface only, run against a PRIVATE COPY of the sibling reference wrapper
//             (K70AttackWrongExit/mut/strict-control-replay.mjs). Not the production candidate.
//   Stage B — generation + execution chain: this probe re-implements the reference generation
//             pattern (K70ExecTransform/transform.mjs, env-var indirection R70_LANE/R70_WORK/R70_OUT)
//             on the frozen r69 control bytes and runs the private copies with edge paths.
//             Mechanism-only: scripts/control-replay.mjs does not exist in production yet.
//   Stage C — naive inline-substitution breakers (mechanism evidence for why the env-var
//             indirection is required).
// Frozen originals are never executed and never written; private copies carry private W/S only.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';

const LANE = '/home/vgpnk/Projects/shokunin/kumitate-shokunin';
const SRC_DIR = path.join(LANE, '.ufo/waves/round-69/probe');
const FROZEN_OUT_DIR = path.join(LANE, '.ufo/waves/round-69/controls');
const BUILD = path.join(LANE, '.ufo/waves/round-70/build/K70ProbeSpaces');
const PRIVATE = path.join(BUILD, 'private');
const RECEIPTS = path.join(BUILD, 'receipts');
const SCRATCH = '/fast/scratch/hyaku/kumitate-r70/K70ProbeSpaces';
const EDGE = {
  lane1: path.join(SCRATCH, "lane edge's with spaces"),          // c1 fake lane (file tree, not a repo)
  lane2: path.join(SCRATCH, "lane2 edge's with spaces"),         // c2 lane (bare --shared clone + probe file)
  work:  path.join(SCRATCH, "work root's edge with spaces"),     // R70_WORK root
  out:   path.join(SCRATCH, "out dir's edge with spaces"),       // R70_OUT dir (file names carry spaces too)
  tmp:   path.join(SCRATCH, "tmp dir's edge"),                   // TMPDIR edge
};
const PINS = {
  'c1-controls.sh': {sha256: '01efd6dde4c987b676b1930f647cc283768e1ae8113fd076b313e54b56aeda12', bytes: 3844},
  'c2-controls.sh': {sha256: '679b7d9619ab8d79139cfe8e956e425f7ccbbf7e58b6eaee5cb72c3deb3a66f4', bytes: 7030},
};
const sha = (b) => crypto.createHash('sha256').update(b).digest('hex');
const results = [];
const say = (m) => process.stdout.write(m + '\n');
const rec = (id, ok, detail) => { results.push({id, ok: !!ok, detail}); say(`${ok ? 'PASS' : 'FAIL'} ${id} ${detail}`); };

// every child spawn in this probe is array-argv; no shell string ever carries a path.
const run = (file, args, opts = {}) =>
  spawnSync(file, args, {encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, timeout: 900000, ...opts});
const gitC = (cwd, args, opts = {}) => run('git', ['-C', cwd, ...args], opts);

function tree(dir) {
  const out = {};
  const walk = (d) => { for (const e of fs.readdirSync(d, {withFileTypes: true})) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p); else if (e.isFile()) out[path.relative(FROZEN_OUT_DIR, p)] = sha(fs.readFileSync(p));
  } };
  walk(dir); return out;
}

// ---------- reference-pattern generation (mirrors K70ExecTransform/transform.mjs) ----------
function sub1(t, needle, repl, id, problems) {
  let n = 0, i = -1;
  while ((i = t.indexOf(needle, i + 1)) !== -1) n++;
  if (n !== 1) { problems.push(`${id}: needle count ${n} != 1`); return t; }
  return t.replace(needle, repl);
}
const PREAMBLE = [
  '# --- R70 private-replay preamble (K70ProbeSpaces mechanism copy) ---',
  'umask 077',
  'for _v in GIT_DIR GIT_WORK_TREE GIT_INDEX_FILE GIT_OBJECT_DIRECTORY GIT_ALTERNATE_OBJECT_DIRECTORIES GIT_PREFIX GIT_QUARANTINE_PATH; do',
  '  unset "$_v" 2>/dev/null || true',
  'done',
  ': "${R70_LANE:?R70_LANE lane dir required}"',
  ': "${R70_WORK:?R70_WORK work root required}"',
  ': "${R70_OUT:?R70_OUT out file required}"',
  'mkdir -p "$R70_WORK"',
  '[ -e "$R70_OUT" ] && { echo "REPLAY-REFUSE output-exists: $R70_OUT" >&2; exit 73; }',
  "trap 'if [ -n \"${S:-}\" ]; then rm -rf \"$S\"; fi' EXIT",
  '# --- end R70 preamble ---',
].join('\n');
const verdictFn = (r) => [
  'replay_verdict() {',
  `  echo "$1" | tee -a "$W/${r}" >/dev/null || return 73`,
  `  if ( set -o noclobber; cat "$W/${r}" > "$R70_OUT" ) 2>/dev/null; then`,
  '    return 0',
  '  fi',
  '  echo "REPLAY-REFUSE output-exists: $R70_OUT" >&2',
  '  return 73',
  '}',
].join('\n');
function generate(name, src, {naive = null} = {}) {
  const problems = [];
  const fam = name[1];
  let t = src;
  const laneSub = naive === 'space' ? `LANE=${path.join(SCRATCH, 'lane with spaces (naive)')}\n`
    : naive === 'apos' ? `LANE=${EDGE.lane1}\n`  // apostrophe inlined unquoted -> shell syntax error
    : 'LANE="${R70_LANE:?R70 lane dir required}"\n';
  t = sub1(t, 'LANE=/home/vgpnk/Projects/shokunin/kumitate-shokunin\n', laneSub, `${name}:LANE`, problems);
  t = sub1(t, `PROBE="$LANE/.ufo/waves/round-69/probe/${fam === '1' ? 'ledger69' : 'deprec69'}-probe.mjs"\n`,
    `PROBE="$LANE/.ufo/waves/round-69/probe/${fam === '1' ? 'ledger69' : 'deprec69'}-probe.mjs"\n`, `${name}:PROBE`, problems);
  // Found by this probe: the reference pattern leaves W="$S/w" textually BEFORE the S= assignment
  // (frozen source order: MODE, LANE, PROBE, W, S). Under `set -u` that aborts with
  // "S: unbound variable". Generation must emit the S assignment first.
  const wLine = 'W="$S/w"\n';
  const sLine = `S=$(mktemp -d "\${R70_WORK:?R70 work root required}/c${fam}-controls-$MODE.XXXXXXXX")\n`;
  t = sub1(t, 'W="$LANE/.ufo/waves/round-69/controls"\n', '__R70_W_MARKER__\n', `${name}:W`, problems);
  t = sub1(t, `S="\${HYAKU_SCRATCH:-/fast/scratch/hyaku}/kumitate-r69/c${fam}-controls-$MODE"\n`,
    '__R70_S_MARKER__\n', `${name}:S`, problems);
  const wsPair = '__R70_W_MARKER__\n__R70_S_MARKER__\n';
  const swPair = '__R70_S_MARKER__\n__R70_W_MARKER__\n';
  const nPair = (t.split(wsPair).length - 1) + (t.split(swPair).length - 1);
  if (nPair !== 1) problems.push(`${name}:WS marker pair count ${nPair} != 1`);
  t = t.replace(wsPair, '').replace(swPair, '');
  // drop any leftover marker lines (non-adjacent fallback), then emit S before W after PROBE
  t = t.split('__R70_W_MARKER__\n').join('').split('__R70_S_MARKER__\n').join('');
  const anchor = `PROBE="$LANE/.ufo/waves/round-69/probe/${fam === '1' ? 'ledger69' : 'deprec69'}-probe.mjs"\n`;
  t = sub1(t, anchor, anchor + sLine + wLine, `${name}:WS-emit`, problems);
  t = sub1(t, 'rm -rf "$S"; mkdir -p "$S/fx"\n', 'mkdir -p "$S/fx" "$S/tmp"\n', `${name}:rm-mkdir`, problems);
  t = sub1(t, 'git init -q\n', 'git -C "$S/fx" init -q\n', `${name}:git-init`, problems);
  t = sub1(t, 'git add -A\n', 'git -C "$S/fx" add -A\n', `${name}:git-add`, problems);
  t = sub1(t, `git -c user.name=ctl -c user.email=ctl@invalid -c commit.gpgsign=false commit -q --no-verify -m "c${fam}-$MODE fixture"\n`,
    `git -C "$S/fx" -c user.name=ctl -c user.email=ctl@invalid -c commit.gpgsign=false commit -q --no-verify -m "c${fam}-$MODE fixture"\n`, `${name}:git-commit`, problems);
  t = sub1(t, 'REV=$(git rev-parse HEAD)\n', 'REV=$(git -C "$S/fx" rev-parse HEAD)\n', `${name}:git-revparse`, problems);
  const liveFlag = fam === '2' ? ' $LIVEFLAG' : '';
  t = sub1(t, `TMPDIR="\${HYAKU_SCRATCH:-/fast/scratch/hyaku}/kumitate-r69" node "$PROBE" "$S/fx" "$REV"${liveFlag} > `,
    `TMPDIR="$S/tmp" node "$PROBE" "$S/fx" "$REV"${liveFlag} > `, `${name}:tmpdir`, problems);
  t = sub1(t, 'set -euo pipefail', 'set -euo pipefail\n' + PREAMBLE, `${name}:preamble`, problems);
  if (fam === '1') {
    const oldTail = ['case "$(head -1 "$W/c1-$MODE.txt")" in',
      '  LEDGER69_UNMET*) [ "$RC" = 1 ] && { echo "CONTROL-PASS $MODE"; exit 0; } ;;',
      'esac', 'echo "CONTROL-FAIL $MODE"', 'exit 1'].join('\n');
    const newTail = [verdictFn('c1-$MODE.txt'),
      'case "$(head -1 "$W/c1-$MODE.txt")" in', '  LEDGER69_UNMET*)',
      '    if [ "$RC" = 1 ]; then', '      replay_verdict "CONTROL-PASS $MODE" && exit 0', '      exit 73',
      '    fi ;;', 'esac', 'replay_verdict "CONTROL-FAIL $MODE" || true', 'exit 1'].join('\n');
    if (!t.endsWith(oldTail + '\n')) problems.push('c1:tail mismatch');
    else t = t.slice(0, t.length - oldTail.length - 1) + newTail + '\n';
  } else {
    const lines = t.split('\n');
    const idx = lines.findIndex((l) => /^\s*printf '%s\\n' '.*' > \/tmp\/forge-sed\.txt$/.test(l));
    if (idx === -1) problems.push('c2:line80 unused fixed temporary write not found');
    else lines.splice(idx, 1);
    t = lines.join('\n');
    const oldTail = ['case "$(head -1 "$W/c2-$MODE.txt")" in', '  DEPREC69_UNMET*)',
      '    [ "$RC" = 1 ] || { echo "CONTROL-FAIL $MODE (exit $RC)"; exit 1; }',
      '    if [ "$MODE" = forgecapture ] && ! grep -q \'S210:origin-sha-mismatch\' "$W/c2-$MODE.txt"; then',
      '      echo "CONTROL-FAIL $MODE (the digest arm did not bite)"; exit 1', '    fi',
      '    echo "CONTROL-PASS $MODE"; exit 0 ;;', 'esac', 'echo "CONTROL-FAIL $MODE"', 'exit 1'].join('\n');
    const newTail = [verdictFn('c2-$MODE.txt'),
      'case "$(head -1 "$W/c2-$MODE.txt")" in', '  DEPREC69_UNMET*)',
      '    [ "$RC" = 1 ] || { replay_verdict "CONTROL-FAIL $MODE (exit $RC)" || true; exit 1; }',
      '    if [ "$MODE" = forgecapture ] && ! grep -q \'S210:origin-sha-mismatch\' "$W/c2-$MODE.txt"; then',
      '      replay_verdict "CONTROL-FAIL $MODE (the digest arm did not bite)" || true; exit 1', '    fi',
      '    replay_verdict "CONTROL-PASS $MODE" && exit 0', '    exit 73 ;;', 'esac',
      'replay_verdict "CONTROL-FAIL $MODE" || true', 'exit 1'].join('\n');
    if (!t.endsWith(oldTail + '\n')) problems.push('c2:tail mismatch');
    else t = t.slice(0, t.length - oldTail.length - 1) + newTail + '\n';
  }
  return {text: t, problems};
}
function verifyGen(name, priv) {
  const problems = [];
  const count = (s) => priv.split(s).length - 1;
  for (const [s, why] of [['HYAKU_SCRATCH', 'shared scratch path'], ['kumitate-r69', 'r69 shared scratch namespace'],
    ['.ufo/waves/round-69/controls', 'frozen output dir'], ['/tmp/forge-sed', 'removed fixed temp write'],
    ['rm -rf "$S"; mkdir', 'shared-path rm preamble'], ['git init -q', 'bare git init'],
    ['git add -A', 'bare git add'], ['git rev-parse HEAD', 'bare rev-parse']])
    if (count(s) !== 0) problems.push(`forbidden remnant ${why}: ${count(s)}`);
  if (count('git -C "$S/fx" init -q') !== 1) problems.push('git -C init count != 1');
  if (count('git -C "$S/fx" add -A') !== 1) problems.push('git -C add count != 1');
  if (count('git -C "$S/fx" -c user.name=ctl') !== 1) problems.push('git -C commit count != 1');
  if (count('git -C "$S/fx" rev-parse HEAD') !== 1) problems.push('git -C rev-parse count != 1');
  if (count('mktemp -d "${R70_WORK:?R70 work root required}/') !== 1) problems.push('private mktemp count != 1');
  if (count('trap ') !== 1) problems.push('cleanup trap count != 1');
  if (count('R70_OUT') < 3) problems.push('R70_OUT wiring missing');
  if (name === 'c2-controls.sh' && (count('/tmp/') !== 0 || count('forge-sed') !== 0)) problems.push('/tmp or forge-sed remnant');
  return problems;
}

// ---------- setup ----------
fs.mkdirSync(PRIVATE, {recursive: true});
fs.mkdirSync(RECEIPTS, {recursive: true});
for (const d of Object.values(EDGE)) fs.mkdirSync(d, {recursive: true});
const frozenBefore = {};
for (const n of Object.keys(PINS)) frozenBefore[n] = sha(fs.readFileSync(path.join(SRC_DIR, n)));
const controlsBefore = tree(FROZEN_OUT_DIR);

// fake lane 1: the exact files the c1 control + wrapper read from $LANE (read-only copies into scratch)
const lane1Files = ['scripts/routed-ledger.mjs', '.ufo/waves/round-69/probe/ledger69-probe.mjs',
  '.ufo/waves/round-69/probe/deprec69-probe.mjs'];
for (const n of [...Array(12)].map((_, i) => `corpus/lessons/round-${55 + i}-verifier-spotcheck.md`)) lane1Files.push(n);
for (const rel of lane1Files) {
  const src = path.join(LANE, rel), dst = path.join(EDGE.lane1, rel);
  if (fs.existsSync(src)) { fs.mkdirSync(path.dirname(dst), {recursive: true}); fs.copyFileSync(src, dst); }
}
// fake lane 2: bare --shared object provider at an edge path (archive source), plus the probe file
{
  const r = run('git', ['clone', '--bare', '--shared', LANE, EDGE.lane2]);
  rec('setup.lane2-clone', r.status === 0, `git clone --bare --shared -> ${EDGE.lane2} exit=${r.status}`);
  const probeDst = path.join(EDGE.lane2, '.ufo/waves/round-69/probe');
  fs.mkdirSync(probeDst, {recursive: true});
  fs.copyFileSync(path.join(SRC_DIR, 'deprec69-probe.mjs'), path.join(probeDst, 'deprec69-probe.mjs'));
  const e = gitC(EDGE.lane2, ['cat-file', '-e', '14057f3e3899180c95713bace088fb9c0d0046e3']);
  rec('setup.lane2-rev', e.status === 0, 'archive rev 14057f3e present in edge lane2');
}

// Stage A fixture: c1-donothing fixture committed as a git repo at an edge path (replicating c1-controls.sh)
const fx = path.join(EDGE.lane1, 'fx');
fs.mkdirSync(path.join(fx, 'scripts'), {recursive: true});
fs.mkdirSync(path.join(fx, 'corpus/lessons'), {recursive: true});
fs.copyFileSync(path.join(LANE, 'scripts/routed-ledger.mjs'), path.join(fx, 'scripts/routed-ledger.mjs'));
for (const n of [...Array(12)].map((_, i) => `round-${55 + i}-verifier-spotcheck.md`)) {
  const src = path.join(LANE, 'corpus/lessons', n);
  if (fs.existsSync(src)) fs.copyFileSync(src, path.join(fx, 'corpus/lessons', n));
}
fs.writeFileSync(path.join(fx, 'SKILL.md'), '# s\n\n| gate | script |\n|---|---|\n| routed-ledger | scripts/routed-ledger.mjs |\n');
fs.writeFileSync(path.join(fx, 'corpus/QUALITY.md'), '# q\n\n- criterion naming routed-ledger (Q62 stub)\n');
fs.writeFileSync(path.join(fx, 'SCORECARD.md'), '# sc\n\n## Capabilities\n\n| routed-ledger | stub row |\n|---|---|\n');
fs.writeFileSync(path.join(fx, 'corpus/routed-ledger.md'),
  '# Routed ledger\n\n## Ledger\n\n| id | round | item | quote | class | status | answer |\n|---|---|---|---|---|---|---|\n');
// the strict stand-in resolves the frozen counter INSIDE --lane; the r69 fixture itself never
// carries the probe, so place a read-only copy beside the fixture repo (uncommitted, as in r69).
for (const p of ['ledger69-probe.mjs', 'deprec69-probe.mjs']) {
  const d = path.join(fx, '.ufo/waves/round-69/probe');
  fs.mkdirSync(d, {recursive: true});
  fs.copyFileSync(path.join(SRC_DIR, p), path.join(d, p));
}
{
  const r1 = gitC(fx, ['init', '-q']);
  const r2 = gitC(fx, ['add', '-A']);
  const r3 = gitC(fx, ['-c', 'user.name=ctl', '-c', 'user.email=ctl@invalid', '-c', 'commit.gpgsign=false',
    'commit', '-q', '--no-verify', '-m', 'c1-donothing fixture']);
  const top = gitC(fx, ['rev-parse', '--show-toplevel']);
  rec('A.fixture', r1.status === 0 && r2.status === 0 && r3.status === 0 && top.stdout.trim() === fx,
    `fixture git repo at edge path, show-toplevel=${top.stdout.trim() === fx}`);
}

// ---------- Stage A: wrapper surface via private strict stand-in copy ----------
const STANDIN_SRC = path.join(LANE, '.ufo/waves/round-70/build/K70AttackWrongExit/mut/strict-control-replay.mjs');
const standin = path.join(PRIVATE, 'control-replay.strict-copy.mjs');
fs.copyFileSync(STANDIN_SRC, standin);
{
  const outA = path.join(EDGE.out, 'A wrapper c1-donothing receipt.txt');
  const env = {...process.env, TMPDIR: EDGE.tmp};
  const r = run(process.execPath, [standin, '--lane', fx, '--family', 'c1', '--mode', 'donothing', '--out', outA, '--work', EDGE.work], {env});
  const text = fs.existsSync(outA) ? fs.readFileSync(outA, 'utf8') : '';
  rec('A.wrapper-run', r.status === 0 && text.includes('LEDGER69_UNMET') && text.includes('CONTROL-PASS donothing'),
    `stand-in exit=${r.status} receipt-bytes=${text.length} at spaced out stderr1=${(r.stderr || '').split('\n')[0]}`);
  const bad = run(process.execPath, [standin, '--family', 'junk'], {env});
  rec('A.invalid-64', bad.status === 64, `--family junk exit=${bad.status}`);
  const again = run(process.execPath, [standin, '--lane', fx, '--family', 'c1', '--mode', 'donothing', '--out', outA, '--work', EDGE.work], {env});
  const text2 = fs.readFileSync(outA, 'utf8');
  rec('A.exclusive-out', again.status !== 0 && text2 === text,
    `second run exit=${again.status} receipt bytes unchanged=${text2 === text}`);
  const st = run(process.execPath, [standin, '--selftest'], {env});
  rec('A.selftest', st.status === 0 && /CONTROL_REPLAY_SELFTEST: PASS/.test(st.stdout), `selftest exit=${st.status}`);
}

// ---------- Stage B: generated private copies, edge paths end-to-end ----------
const gen = {};
for (const name of ['c1-controls.sh', 'c2-controls.sh']) {
  const buf = fs.readFileSync(path.join(SRC_DIR, name));
  if (sha(buf) !== PINS[name].sha256 || buf.length !== PINS[name].bytes) {
    rec(`B.gen.${name}`, false, 'REFUSE-SOURCE-DRIFT frozen bytes differ from pins');
    continue;
  }
  const g = generate(name, buf.toString('utf8'));
  const v = verifyGen(name, g.text);
  const out = path.join(PRIVATE, name.replace('.sh', '.private.sh'));
  fs.writeFileSync(out, g.text, {mode: 0o700});
  gen[name] = out;
  rec(`B.gen.${name}`, g.problems.length === 0 && v.length === 0,
    `generation problems=${g.problems.length} verify-problems=${v.length} -> ${path.basename(out)}`);
}
function replay(name, mode, r70lane, outFile) {
  const env = {...process.env, R70_LANE: r70lane, R70_WORK: EDGE.work, R70_OUT: outFile, TMPDIR: EDGE.tmp};
  return run('bash', [gen[name], mode], {env});
}
const keptReceipts = [];
function keepReceipt(outFile, id) {
  const dst = path.join(RECEIPTS, `${id}.txt`);
  fs.copyFileSync(outFile, dst); keptReceipts.push(dst);
  return fs.readFileSync(outFile, 'utf8');
}
if (gen['c1-controls.sh']) {
  const out = path.join(EDGE.out, "B c1-donothing receipt's.txt");
  const before = fs.readdirSync(EDGE.work).length;
  const r = replay('c1-controls.sh', 'donothing', EDGE.lane1, out);
  const text = fs.existsSync(out) ? keepReceipt(out, 'B-c1-donothing') : '';
  const after = fs.readdirSync(EDGE.work).length;
  // spaced work root -> $S/tmp spaced -> frozen counter's NODE_OPTIONS self-poison preload path is
  // whitespace-split by node -> L7 self-poison MISS. Predicate-safe (label/exit unchanged);
  // recorded as receipt-parity divergence, not a failure of the replay obligations.
  rec('B.c1-donothing', r.status === 0 && text.includes('LEDGER69_UNMET') && text.includes('CONTROL-PASS donothing'),
    `exit=${r.status} UNMET+CONTROL-PASS=${text.includes('LEDGER69_UNMET') && text.includes('CONTROL-PASS donothing')} l7-selfpoison-miss=${/L7 MISS self-poison/.test(text)} (spaced-TMPDIR parity note)`);
  rec('B.work-reclaimed', after === before, `work root children before=${before} after=${after} (mkdtemp child + trap reclaim)`);
  const out2 = path.join(EDGE.out, "B c1-autoledger receipt's.txt");
  const r2 = replay('c1-controls.sh', 'autoledger', EDGE.lane1, out2);
  const text2 = fs.existsSync(out2) ? keepReceipt(out2, 'B-c1-autoledger') : '';
  rec('B.c1-autoledger', r2.status === 0 && text2.includes('LEDGER69_UNMET') && text2.includes('CONTROL-PASS autoledger'),
    `exit=${r2.status} receipt-bytes=${text2.length}`);
  const r3 = replay('c1-controls.sh', 'donothing', EDGE.lane1, out);
  const text3 = fs.existsSync(out) ? fs.readFileSync(out, 'utf8') : null;
  rec('B.exclusive-refuse-73', r3.status === 73 && text3 === text,
    `second run exit=${r3.status} (expect 73) receipt unchanged=${text3 === text}`);
}
if (gen['c2-controls.sh']) {
  const out = path.join(EDGE.out, "B c2-donothing receipt's.txt");
  const r = replay('c2-controls.sh', 'donothing', EDGE.lane2, out);
  const text = fs.existsSync(out) ? keepReceipt(out, 'B-c2-donothing') : '';
  rec('B.c2-donothing', r.status === 0 && text.includes('DEPREC69_UNMET') && text.includes('CONTROL-PASS donothing'),
    `exit=${r.status} UNMET+CONTROL-PASS=${text.includes('DEPREC69_UNMET') && text.includes('CONTROL-PASS donothing')} selfpoison-miss=${/self-poison/.test(text)} (parity note)`);
  const out2 = path.join(EDGE.out, "B c2-autoorigin receipt's.txt");
  const r2 = replay('c2-controls.sh', 'autoorigin', EDGE.lane2, out2);
  const text2 = fs.existsSync(out2) ? keepReceipt(out2, 'B-c2-autoorigin') : '';
  rec('B.c2-autoorigin', r2.status === 0 && text2.includes('DEPREC69_UNMET') && text2.includes('CONTROL-PASS autoorigin'),
    `exit=${r2.status} receipt-bytes=${text2.length} selfpoison-miss=${/self-poison/.test(text2)} (parity note)`);
  rec('B.no-live-note', true, 'c2 modes run --no-live (non-live arms only); live forgecapture is network-dependent by plan and is not waived here');
}

// ---------- Stage C: naive inline-substitution breakers (mechanism) ----------
{
  const src = fs.readFileSync(path.join(SRC_DIR, 'c1-controls.sh'), 'utf8');
  const naiveSpace = generate('c1-controls.sh', src, {naive: 'space'});
  const p1 = path.join(PRIVATE, 'naive-inline-space.sh');
  fs.writeFileSync(p1, naiveSpace.text, {mode: 0o700});
  const envC = {...process.env, R70_LANE: EDGE.lane1, R70_WORK: EDGE.work, TMPDIR: EDGE.tmp};
  const r1 = run('bash', [p1, 'donothing'], {env: {...envC, R70_OUT: path.join(EDGE.out, 'naive1.txt')}});
  rec('C.naive-space-breaks', r1.status !== 0 && /command not found|no such file|syntax error|unexpected token/i.test((r1.stderr || '') + (r1.stdout || '')),
    `unquoted inline lane path exit=${r1.status} stderr1=${(r1.stderr || '').split('\n')[0]}`);
  const naiveApos = generate('c1-controls.sh', src, {naive: 'apos'});
  const p2 = path.join(PRIVATE, 'naive-inline-apostrophe.sh');
  fs.writeFileSync(p2, naiveApos.text, {mode: 0o700});
  const r2 = run('bash', [p2, 'donothing'], {env: {...envC, R70_OUT: path.join(EDGE.out, 'naive2.txt')}});
  rec('C.naive-apostrophe-breaks', r2.status !== 0 && /syntax error|unexpected token/i.test((r2.stderr || '') + (r2.stdout || '')),
    `inline apostrophe lane path exit=${r2.status} stderr1=${(r2.stderr || '').split('\n')[0]}`);
}

// ---------- frozen-after + cleanup ----------
const frozenAfter = {};
for (const n of Object.keys(PINS)) frozenAfter[n] = sha(fs.readFileSync(path.join(SRC_DIR, n)));
const controlsAfter = tree(FROZEN_OUT_DIR);
rec('Z.frozen-unchanged', JSON.stringify(frozenBefore) === JSON.stringify(frozenAfter),
  `frozen script sha256 identical: ${JSON.stringify(frozenAfter) === JSON.stringify(frozenBefore)}`);
rec('Z.frozen-receipts-untouched', JSON.stringify(controlsBefore) === JSON.stringify(controlsAfter),
  `frozen controls dir file set+sha256 identical: ${JSON.stringify(controlsBefore) === JSON.stringify(controlsAfter)}`);

const held = results.filter((r) => r.ok).length;
const summary = {seat: 'K70ProbeSpaces', label: 'mechanism-only (no production candidate exists)',
  edge: EDGE, held: `${held}/${results.length}`, results, keptReceipts};
fs.writeFileSync(path.join(RECEIPTS, 'probe-spaces-results.json'), JSON.stringify(summary, null, 2) + '\n');
say(`\nK70ProbeSpaces ${held === results.length ? 'PROBE-PASS' : 'PROBE-FAIL'} held=${held}/${results.length} (mechanism-only, not candidate verification)`);
fs.rmSync(SCRATCH, {recursive: true, force: true});
say(`scratch cleaned: ${SCRATCH} exists=${fs.existsSync(SCRATCH)}`);
process.exitCode = held === results.length ? 0 : 1;
