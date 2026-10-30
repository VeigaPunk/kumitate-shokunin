#!/usr/bin/env node
// Candidate-shaped private-copy generator for the frozen c2-controls.sh (r69, base
// 78b98d76). Applies exactly the transformation the round-70 implementation contract
// describes: substitute the LANE/PROBE/W/S assignment lines exactly once each, and
// optionally remove the known unused fixed temporary write (line 80,
// `printf ... > /tmp/forge-sed.txt`). The frozen original is only ever read.
import fs from 'node:fs';

const arg = {}; const argv = process.argv.slice(2);
for (let i = 0; i < argv.length; i += 2) arg[argv[i].replace(/^--/, '')] = argv[i + 1];
const { lane, strip, out, stub, wdir, sdir } = arg;
const SRC = `${lane}/.ufo/waves/round-69/probe/c2-controls.sh`;
const lines = fs.readFileSync(SRC, 'utf8').split('\n');

const ANCHORS = {
  laneLine: 'LANE=/home/vgpnk/Projects/shokunin/kumitate-shokunin',
  probeLine: 'PROBE="$LANE/.ufo/waves/round-69/probe/deprec69-probe.mjs"',
  wLine: 'W="$LANE/.ufo/waves/round-69/controls"',
  sLine: 'S="${HYAKU_SCRATCH:-/fast/scratch/hyaku}/kumitate-r69/c2-controls-$MODE"',
};
const TMP_WRITE = "    printf '%s\\n' '- S207 — capture 2026-10-30 — pinned' > /tmp/forge-sed.txt";
const NEXT_COMMENT = '    # the forge declares every row pinned (no mirrors): the tampered S210 is content-pinned already';
const HEREDOC_OPEN = "    python3 - <<'PY'";

const idx = {};
for (const [k, v] of Object.entries(ANCHORS)) {
  const hit = lines.reduce((a, l, i) => (l === v ? a.concat(i) : a), []);
  if (hit.length !== 1) throw new Error(`anchor ${k} found ${hit.length} times (need exactly 1)`);
  idx[k] = hit[0];
}
const tmpIdx = lines.indexOf(TMP_WRITE);
if (tmpIdx === -1) throw new Error('tmp-write line not found');

// exact-once substitutions
lines[idx.probeLine] = `PROBE="${stub}"`;
lines[idx.wLine] = `W="${wdir}"`;
lines[idx.sLine] = `S="${sdir}"`;
// LANE anchor intentionally left unchanged: the private copy still reads the pinned
// round-69 archive from the lane (read-only `git -C "$LANE" archive`).

let removed = [];
if (strip === 'line') {
  removed = lines.splice(tmpIdx, 1);
} else if (strip === 'range') {
  // over-removal fault model: a remover that range-deletes from the write line through
  // the next heredoc opener also eats the comment and the `python3 - <<'PY'` line.
  if (lines[tmpIdx + 1] !== NEXT_COMMENT || lines[tmpIdx + 2] !== HEREDOC_OPEN)
    throw new Error('range model assumption broken');
  removed = lines.splice(tmpIdx, 3);
} else if (strip !== 'none') {
  throw new Error(`unknown --strip ${strip}`);
}

fs.writeFileSync(out, lines.join('\n'));
console.log(JSON.stringify({ out, strip, removedLines: removed }));
