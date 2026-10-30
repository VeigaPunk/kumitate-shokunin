#!/usr/bin/env node
// K70ExecTransform — exact-count transformation draft: frozen r69 control scripts -> safe private replay scripts.
// Bound ONLY to the two frozen scripts in .ufo/waves/round-69/probe. Refuses source needle drift (exit 65).
// Usage: node transform.mjs generate   (default) | node transform.mjs verify
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const HERE = path.dirname(new URL(import.meta.url).pathname);
const DIGESTS = JSON.parse(fs.readFileSync(path.join(HERE, 'frozen-digests.json'), 'utf8'));
// test-only override (drift-refusal demos); production default is the frozen lane probe dir
const SRC_DIR = process.env.R70_SRC_DIR || DIGESTS.sourceDir;
const OUT_DIR = path.join(HERE, 'private');
const sha = (b) => crypto.createHash('sha256').update(b).digest('hex');

const fail = (id, msg) => { process.stderr.write(`${id}: ${msg}\n`); process.exit(65); };

function loadFrozen(name) {
  const p = path.join(SRC_DIR, name);
  const pin = DIGESTS.frozen[name];
  let buf;
  try { buf = fs.readFileSync(p); } catch { fail('REFUSE-SOURCE-DRIFT', `unreadable frozen script: ${p}`); }
  if (buf.length !== pin.bytes) fail('REFUSE-SOURCE-DRIFT', `${name}: bytes ${buf.length} != pinned ${pin.bytes}`);
  if (sha(buf) !== pin.sha256) fail('REFUSE-SOURCE-DRIFT', `${name}: sha256 ${sha(buf)} != pinned ${pin.sha256}`);
  if (!fs.existsSync(path.join(DIGESTS.lane, pin.probe))) fail('REFUSE-SOURCE-DRIFT', `probe missing under lane: ${pin.probe}`);
  return buf.toString('utf8');
}

// exact-count single substitution; refuses on count != 1
function sub1(text, needle, repl, id) {
  let n = 0, i = -1;
  while ((i = text.indexOf(needle, i + 1)) !== -1) n++;
  if (n !== 1) fail('REFUSE-SOURCE-DRIFT', `${id}: needle count ${n} != 1 for ${JSON.stringify(needle.slice(0, 72))}`);
  return text.replace(needle, repl);
}

function identitySub(text, needle, id) { return sub1(text, needle, needle, id); } // counted, byte-identical

const PREAMBLE = [
  '# --- R70 private-replay preamble (generated draft, seat K70ExecTransform) ---',
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

function verdictFn(receiptName) {
  return [
    'replay_verdict() {',
    `  echo "$1" | tee -a "$W/${receiptName}" >/dev/null || return 73`,
    `  if ( set -o noclobber; cat "$W/${receiptName}" > "$R70_OUT" ) 2>/dev/null; then`,
    '    return 0',
    '  fi',
    '  echo "REPLAY-REFUSE output-exists: $R70_OUT" >&2',
    '  return 73',
    '}',
  ].join('\n');
}

function insertAfterLine(text, anchorLine, block, id) {
  const lines = text.split('\n');
  const idx = lines.findIndex((l) => l === anchorLine);
  if (idx === -1) fail('REFUSE-SOURCE-DRIFT', `${id}: anchor line absent: ${anchorLine}`);
  lines.splice(idx + 1, 0, ...block.split('\n'));
  return lines.join('\n');
}

function replaceTail(text, oldTail, newTail, id) {
  if (!text.endsWith(oldTail + '\n')) fail('REFUSE-SOURCE-DRIFT', `${id}: tail mismatch`);
  return text.slice(0, text.length - oldTail.length - 1) + newTail + '\n';
}

function transform(name, src) {
  const pin = DIGESTS.frozen[name];
  const fam = name[1]; // '1' | '2'
  const receipt = `${name.slice(0, 2)}-$MODE.txt`.replace('$MODE', '$MODE'); // c1-$MODE.txt / c2-$MODE.txt
  let t = src;

  // --- the four counted assignment substitutions (each exactly once; S before W) ---
  t = sub1(t, 'LANE=/home/vgpnk/Projects/shokunin/kumitate-shokunin\n',
    'LANE="${R70_LANE:?R70 lane dir required}"\n', `${name}:LANE`);
  t = identitySub(t, `PROBE="$LANE/.ufo/waves/round-69/probe/${fam === '1' ? 'ledger69' : 'deprec69'}-probe.mjs"\n`,
    `${name}:PROBE`);
  t = sub1(t,
    `W="$LANE/.ufo/waves/round-69/controls"\nS="\${HYAKU_SCRATCH:-/fast/scratch/hyaku}/kumitate-r69/c${fam}-controls-$MODE"\n`,
    `S=$(mktemp -d "\${R70_WORK:?R70 work root required}/c${fam}-controls-$MODE.XXXXXXXX")\nW="$S/w"\n`,
    `${name}:W-S-block`);

  // --- shared-path rm elimination + private tmp child ---
  t = sub1(t, 'rm -rf "$S"; mkdir -p "$S/fx"\n', 'mkdir -p "$S/fx" "$S/tmp"\n', `${name}:rm-mkdir`);

  // --- explicit fixture-root git arguments (each exactly once) ---
  t = sub1(t, 'git init -q\n', 'git -C "$S/fx" init -q\n', `${name}:git-init`);
  t = sub1(t, 'git add -A\n', 'git -C "$S/fx" add -A\n', `${name}:git-add`);
  t = sub1(t, `git -c user.name=ctl -c user.email=ctl@invalid -c commit.gpgsign=false commit -q --no-verify -m "c${fam}-$MODE fixture"\n`,
    `git -C "$S/fx" -c user.name=ctl -c user.email=ctl@invalid -c commit.gpgsign=false commit -q --no-verify -m "c${fam}-$MODE fixture"\n`, `${name}:git-commit`);
  t = sub1(t, 'REV=$(git rev-parse HEAD)\n', 'REV=$(git -C "$S/fx" rev-parse HEAD)\n', `${name}:git-revparse`);

  // --- private TMPDIR for the frozen counter ---
  const liveFlag = fam === '2' ? ' $LIVEFLAG' : '';
  t = sub1(t, `TMPDIR="\${HYAKU_SCRATCH:-/fast/scratch/hyaku}/kumitate-r69" node "$PROBE" "$S/fx" "$REV"${liveFlag} > `,
    `TMPDIR="$S/tmp" node "$PROBE" "$S/fx" "$REV"${liveFlag} > `, `${name}:tmpdir`);

  // --- preamble after set -euo pipefail ---
  t = insertAfterLine(t, 'set -euo pipefail', PREAMBLE, `${name}:preamble`);

  // --- verdict tail: CONTROL-PASS/FAIL enters the receipt; exclusive copy to R70_OUT ---
  if (fam === '1') {
    const oldTail = [
      'case "$(head -1 "$W/c1-$MODE.txt")" in',
      '  LEDGER69_UNMET*) [ "$RC" = 1 ] && { echo "CONTROL-PASS $MODE"; exit 0; } ;;',
      'esac',
      'echo "CONTROL-FAIL $MODE"',
      'exit 1',
    ].join('\n');
    const newTail = [
      verdictFn('c1-$MODE.txt'),
      'case "$(head -1 "$W/c1-$MODE.txt")" in',
      '  LEDGER69_UNMET*)',
      '    if [ "$RC" = 1 ]; then',
      '      replay_verdict "CONTROL-PASS $MODE" && exit 0',
      '      exit 73',
      '    fi ;;',
      'esac',
      'replay_verdict "CONTROL-FAIL $MODE" || true',
      'exit 1',
    ].join('\n');
    t = replaceTail(t, oldTail, newTail, `${name}:tail`);
  } else {
    // remove the known unused fixed temporary write (c2 line 80, /tmp/forge-sed.txt)
    const lines = t.split('\n');
    const idx = lines.findIndex((l) => /^\s*printf '%s\\n' '.*' > \/tmp\/forge-sed\.txt$/.test(l));
    if (idx === -1) fail('REFUSE-SOURCE-DRIFT', 'c2:line80 unused fixed temporary write not found');
    lines.splice(idx, 1);
    t = lines.join('\n');
    const oldTail = [
      'case "$(head -1 "$W/c2-$MODE.txt")" in',
      '  DEPREC69_UNMET*)',
      '    [ "$RC" = 1 ] || { echo "CONTROL-FAIL $MODE (exit $RC)"; exit 1; }',
      "    if [ \"$MODE\" = forgecapture ] && ! grep -q 'S210:origin-sha-mismatch' \"$W/c2-$MODE.txt\"; then",
      '      echo "CONTROL-FAIL $MODE (the digest arm did not bite)"; exit 1',
      '    fi',
      '    echo "CONTROL-PASS $MODE"; exit 0 ;;',
      'esac',
      'echo "CONTROL-FAIL $MODE"',
      'exit 1',
    ].join('\n');
    const newTail = [
      verdictFn('c2-$MODE.txt'),
      'case "$(head -1 "$W/c2-$MODE.txt")" in',
      '  DEPREC69_UNMET*)',
      '    [ "$RC" = 1 ] || { replay_verdict "CONTROL-FAIL $MODE (exit $RC)" || true; exit 1; }',
      "    if [ \"$MODE\" = forgecapture ] && ! grep -q 'S210:origin-sha-mismatch' \"$W/c2-$MODE.txt\"; then",
      '      replay_verdict "CONTROL-FAIL $MODE (the digest arm did not bite)" || true; exit 1',
      '    fi',
      '    replay_verdict "CONTROL-PASS $MODE" && exit 0',
      '    exit 73 ;;',
      'esac',
      'replay_verdict "CONTROL-FAIL $MODE" || true',
      'exit 1',
    ].join('\n');
    t = replaceTail(t, oldTail, newTail, `${name}:tail`);
  }
  return t;
}

function verify(name, priv) {
  const problems = [];
  const count = (s) => priv.split(s).length - 1;
  const must0 = [
    ['HYAKU_SCRATCH', 'shared scratch path'],
    ['kumitate-r69', 'r69 shared scratch namespace'],
    ['.ufo/waves/round-69/controls', 'frozen output dir'],
    ['/tmp/forge-sed', 'removed fixed temp write'],
    ['rm -rf "$S"; mkdir', 'shared-path rm preamble'],
    ['git init -q', 'bare git init'],
    ['git add -A', 'bare git add'],
    ['git rev-parse HEAD', 'bare rev-parse'],
  ];
  for (const [s, why] of must0) {
    const n = count(s);
    if (n !== 0) problems.push(`forbidden remnant ${why}: ${n}`);
  }
  const archiveNeedle = 'git -C "$LANE" archive 14057f3e3899180c95713bace088fb9c0d0046e3 | tar -x --no-same-owner --no-same-permissions -C "$S/fx"';
  const archiveCount = count(archiveNeedle);
  if (name === 'c2-controls.sh' && archiveCount !== 1) problems.push(`c2 lane-archive read altered: ${archiveCount}`);
  if (name === 'c1-controls.sh' && archiveCount !== 0) problems.push(`c1 unexpected lane-archive: ${archiveCount}`);
  if (count('git -C "$S/fx" init -q') !== 1) problems.push('git -C init count != 1');
  if (count('git -C "$S/fx" add -A') !== 1) problems.push('git -C add count != 1');
  if (count('git -C "$S/fx" -c user.name=ctl') !== 1) problems.push('git -C commit count != 1');
  if (count('git -C "$S/fx" rev-parse HEAD') !== 1) problems.push('git -C rev-parse count != 1');
  if (count('mktemp -d "${R70_WORK:?R70 work root required}/') !== 1) problems.push('private mktemp count != 1');
  if (priv.indexOf('W="$S/w"') < priv.indexOf('S=$(mktemp')) problems.push('W assigned before S');
  if (count('trap ') !== 1) problems.push('cleanup trap count != 1');
  if (count('R70_OUT') < 3) problems.push('R70_OUT wiring missing');
  if (name === 'c2-controls.sh') {
    if (count('/tmp/') !== 0) problems.push('/tmp remnant');
    if (count('forge-sed') !== 0) problems.push('forge-sed remnant');
  }
  return problems;
}

const cmd = process.argv[2] || 'generate';
fs.mkdirSync(OUT_DIR, { recursive: true });
const summary = [];
for (const name of ['c1-controls.sh', 'c2-controls.sh']) {
  const src = loadFrozen(name);
  const priv = transform(name, src);
  const out = path.join(OUT_DIR, name.replace('.sh', '.private.sh'));
  if (cmd === 'generate') {
    fs.writeFileSync(out, priv, { mode: 0o700 });
    summary.push({ frozen: name, private: path.basename(out), frozenBytes: src.length, privateBytes: priv.length });
  }
  const problems = verify(name, priv);
  if (problems.length) { process.stderr.write(`VERIFY-FAIL ${name}: ${problems.join('; ')}\n`); process.exit(65); }
  // diff stat vs frozen
  const a = src.split('\n'), b = priv.split('\n');
  let changed = 0;
  for (let i = 0; i < Math.max(a.length, b.length); i++) if (a[i] !== b[i]) changed++;
  summary.push({ verify: 'PASS', changedLineSlots: changed, frozenLines: a.length, privateLines: b.length });
}
process.stdout.write(JSON.stringify({ cmd, seat: 'K70ExecTransform', summary }, null, 2) + '\n');
