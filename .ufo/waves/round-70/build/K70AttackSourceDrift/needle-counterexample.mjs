// K70AttackSourceDrift — needle-substitution counterexample (text transform only; never executes any control script).
// Usage: node needle-counterexample.mjs <scratch-dir>
// Sources: frozen c2-controls.sh bytes read from git blob 78b98d (read-only). Mutants are written only under <scratch-dir>.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';

const SCR = process.argv[2];
if (!SCR) { console.error('usage: needle-counterexample.mjs <scratch-dir>'); process.exit(64); }
const LANE = '/home/vgpnk/Projects/shokunin/kumitate-shokunin';
const REV = '78b98d762ccf3e3a0961f94c4042eaabd2bcb706';
const SRC_PATH = '.ufo/waves/round-69/probe/c2-controls.sh';
const PINNED_SHA = '679b7d9619ab8d79139cfe8e956e425f7ccbbf7e58b6eaee5cb72c3deb3a66f4';
const PRIV_W = path.join(SCR, 'priv-out');
const PRIV_S = path.join(SCR, 'priv-scratch');
const PRIV_PROBE = path.join(SCR, 'priv-probe/deprec69-probe.mjs');
const FROZEN_W_RE = /^W=.*round-69\/controls/m;      // frozen output dir still assigned
const TMP_LINE = "printf '%s\\n' '- S207 — capture 2026-10-30 — pinned' > /tmp/forge-sed.txt";

const sha = (s) => crypto.createHash('sha256').update(s).digest('hex');
const base = spawnSync('git', ['-C', LANE, 'show', `${REV}:${SRC_PATH}`], {encoding: 'utf8'});
if (base.status !== 0) { console.error('git show failed'); process.exit(2); }
const BASE = base.stdout;

// ---- naive generator: first-match string replace, no count, no pin, no refusal ----
function naive(src) {
  let t = src;
  const subs = [
    [`LANE=${LANE}`, `LANE=${PRIV_W}/lane`],
    [`PROBE="$LANE/.ufo/waves/round-69/probe/deprec69-probe.mjs"`, `PROBE="${PRIV_PROBE}"`],
    [`W="$LANE/.ufo/waves/round-69/controls"`, `W="${PRIV_W}"`],
    [`S="\${HYAKU_SCRATCH:-/fast/scratch/hyaku}/kumitate-r69/c2-controls-$MODE"`, `S="${PRIV_S}"`],
  ];
  for (const [needle, repl] of subs) t = t.replace(needle, () => repl); // silent no-op on miss
  t = t.replace(TMP_LINE + '\n', ''); // silent no-op on miss
  return {ok: true, text: t, applied: subs.length};
}

// ---- fail-closed reference generator: pin source bytes, exactly-one needle, refuse on any doubt ----
function strict(src) {
  if (sha(src) !== PINNED_SHA) return {ok: false, reason: `source sha ${sha(src).slice(0, 12)} != pinned ${PINNED_SHA.slice(0, 12)}`};
  const subs = [
    [`LANE=${LANE}`, `LANE=${PRIV_W}/lane`],
    [`PROBE="$LANE/.ufo/waves/round-69/probe/deprec69-probe.mjs"`, `PROBE="${PRIV_PROBE}"`],
    [`W="$LANE/.ufo/waves/round-69/controls"`, `W="${PRIV_W}"`],
    [`S="\${HYAKU_SCRATCH:-/fast/scratch/hyaku}/kumitate-r69/c2-controls-$MODE"`, `S="${PRIV_S}"`],
    [TMP_LINE + '\n', ''],
  ];
  let t = src;
  for (const [needle, repl] of subs) {
    const n = t.split(needle).length - 1;
    if (n !== 1) return {ok: false, reason: `needle count ${n} != 1: ${needle.slice(0, 40)}`};
    t = t.replace(needle, () => repl);
  }
  if (FROZEN_W_RE.test(t) || /\/tmp\//.test(t)) return {ok: false, reason: 'post-check: frozen W or /tmp write remains'};
  return {ok: true, text: t, applied: subs.length};
}

// ---- mutants of the frozen source (the "unexpected frozen-source edits") ----
const mutants = {
  'M0-unmodified': BASE,
  'M1-W-unquoted': BASE.replace('W="$LANE/.ufo/waves/round-69/controls"', 'W=$LANE/.ufo/waves/round-69/controls'),
  'M2-duplicate-needle-in-comment': BASE.split('\n').map((l, i) => i === 1 ? `# W="$LANE/.ufo/waves/round-69/controls" (legacy note)\n${l}` : l).join('\n'),
  'M3-tmp-line-retargeted': BASE.replace('> /tmp/forge-sed.txt', '> /var/tmp/forge-sed.txt'),
  'M4-trailing-space-on-W': BASE.replace('W="$LANE/.ufo/waves/round-69/controls"\n', 'W="$LANE/.ufo/waves/round-69/controls" \n'),
};

const rows = [];
for (const [name, text] of Object.entries(mutants)) {
  const dir = path.join(SCR, 'mutants', name);
  fs.mkdirSync(dir, {recursive: true});
  fs.writeFileSync(path.join(dir, 'c2-controls.sh'), text);
  for (const [gname, gen] of [['naive', naive], ['strict', strict]]) {
    const r = gen(text);
    let verdict, frozen = '-', tmp = '-';
    if (!r.ok) verdict = `REFUSED (${r.reason})`;
    else {
      frozen = FROZEN_W_RE.test(r.text) ? 'YES: W still round-69/controls' : 'no';
      tmp = /\/tmp\//.test(r.text) ? 'YES: /tmp write remains' : 'no';
      verdict = (frozen === 'no' && tmp === 'no') ? 'ACCEPTED-CLEAN' : 'ACCEPTED-WITH-FROZEN-WRITE';
      fs.writeFileSync(path.join(dir, `generated-${gname}.sh`), r.text);
    }
    rows.push({mutant: name, generator: gname, verdict, frozenWriteRemains: frozen, tmpWriteRemains: tmp, srcSha: sha(text).slice(0, 12)});
  }
}
for (const r of rows) console.log(JSON.stringify(r));
