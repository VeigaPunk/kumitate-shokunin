// gen-harm-cases.mjs — writes scripts/harm-cases.json (selftest cases, 26) and the frozen controls
// .ufo/waves/round-65/controls/harm/case-NN-<id>/{spec.json} (the first 16 cases). Round 65, kumitate.
// usage: node gen-harm-cases.mjs <lane-dir>
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const lane = process.argv[2];
if (!lane) { process.stderr.write('usage: gen-harm-cases.mjs <lane-dir>\n'); process.exit(64); }

const G = (id, extra = {}) => ({ id, argv: ['bash', `scripts/${id}.sh`], verdict: `^${id.toUpperCase()}: (\\w+)`, clean: ['CLEAN'], timeout: 5, ...extra });
const S = (id, body) => ({ [`scripts/${id}.sh`]: `${body}\n` });
const clean = (id) => S(id, `echo '${id.toUpperCase()}: CLEAN'`);
const drift = (id, tail = '') => S(id, `echo '${id.toUpperCase()}: DRIFT${tail}'; exit 1`);
const cases = [];
const add = (id, c) => cases.push({ id, ...c });

add('honest-held', { gates: [G('g1')], base: clean('g1'), tip: clean('g1'), expect: { exit: 0, rows: ['g1 HELD'], summary: 'HARM_MATRIX: CLEAN gates=1 held=1' } });
add('repaired', { gates: [G('g1')], base: drift('g1'), tip: clean('g1'), expect: { exit: 0, rows: ['g1 REPAIRED'], summary: 'repaired=1' } });
add('harm-verdict', { gates: [G('g1')], base: clean('g1'), tip: drift('g1'), expect: { exit: 1, rows: ['g1 HARM'], summary: 'HARM_MATRIX: HARM gates=1' } });
add('harm-exit-code-with-clean-line', { gates: [G('g1')], base: clean('g1'), tip: S('g1', "echo 'G1: CLEAN'; exit 3"), expect: { exit: 1, rows: ['g1 HARM'] } });
add('harm-no-verdict-line', { gates: [G('g1')], base: clean('g1'), tip: S('g1', 'echo done'), expect: { exit: 1, rows: ['g1 HARM'] } });
add('harm-gate-deleted', { gates: [G('g1')], base: clean('g1'), tip: {}, tip_delete: ['scripts/g1.sh'], expect: { exit: 1, rows: ['g1 HARM_ABSENT'], summary: 'harm_absent=1' } });
add('new-ok', { gates: [G('g1'), G('g2')], base: clean('g1'), tip: clean('g2'), expect: { exit: 0, rows: ['g1 HELD', 'g2 NEW_OK'] } });
add('new-red', { gates: [G('g1'), G('g2')], base: clean('g1'), tip: drift('g2'), expect: { exit: 1, rows: ['g1 HELD', 'g2 NEW_RED'], summary: 'new_red=1' } });
add('carried-same-line', { gates: [G('g1')], base: drift('g1', ' a=1'), tip: drift('g1', ' a=1'), expect: { exit: 0, rows: ['g1 CARRIED'] } });
add('carried-moved-line', { gates: [G('g1')], base: drift('g1', ' a=1'), tip: drift('g1', ' a=5'), expect: { exit: 0, rows: ['g1 CARRIED_MOVED'] } });
add('harm-timeout', { gates: [G('g1', { timeout: 2 })], base: clean('g1'), tip: S('g1', "sleep 30; echo 'G1: CLEAN'"), expect: { exit: 1, rows: ['g1 HARM'] } });
add('repaired-from-timeout', { gates: [G('g1', { timeout: 2 })], base: S('g1', "sleep 30; echo 'G1: CLEAN'"), tip: clean('g1'), expect: { exit: 0, rows: ['g1 REPAIRED'] } });
add('stderr-verdict-held', { gates: [G('g1')], base: S('g1', "echo 'G1: CLEAN' >&2"), tip: S('g1', "echo 'G1: CLEAN' >&2"), expect: { exit: 0, rows: ['g1 HELD'] } });
add('last-verdict-wins', { gates: [G('g1')], base: clean('g1'), tip: S('g1', "echo 'G1: CLEAN'; echo 'G1: DRIFT'"), expect: { exit: 1, rows: ['g1 HARM'] } });
add('absent-both-skipped', { gates: [G('g1'), G('g2')], base: clean('g2'), tip: clean('g2'), expect: { exit: 0, rows: ['g1 ABSENT_BOTH', 'g2 HELD'], summary: 'gates=1' } });
add('same-rev-held', { gates: [G('g1')], base: clean('g1'), tip: {}, same_rev: true, expect: { exit: 0, rows: ['g1 HELD'] } });
const frozen = cases.length; // 16
add('gone-red-gate', { gates: [G('g1')], base: drift('g1'), tip: {}, tip_delete: ['scripts/g1.sh'], expect: { exit: 0, rows: ['g1 GONE'] } });
add('mixed-three', { gates: [G('g1'), G('g2'), G('g3')], base: { ...clean('g1'), ...clean('g2'), ...drift('g3') }, tip: { ...clean('g1'), ...drift('g2'), ...clean('g3') }, expect: { exit: 1, rows: ['g1 HELD', 'g2 HARM', 'g3 REPAIRED'], summary: 'gates=3 held=1 repaired=1' } });
add('rev-unreadable', { gates: [G('g1')], base: clean('g1'), tip: clean('g1'), args: ['--base', 'deadbeefdeadbeef', '--tip', '{TIP}', '--gates', '{DIR}/gates.json'], expect: { exit: 2, rows: [], summary: 'FAIL_CLOSED reason=REV_UNREADABLE' } });
add('gates-file-malformed', { gates: [G('g1')], gates_raw: '{not json', base: clean('g1'), tip: clean('g1'), expect: { exit: 2, rows: [], summary: 'reason=GATES_UNREADABLE' } });
add('duplicate-gate-id', { gates: [G('g1'), G('g1')], base: clean('g1'), tip: clean('g1'), expect: { exit: 2, rows: [], summary: 'reason=GATES_INVALID' } });
add('only-filter', { gates: [G('g1'), G('g2')], base: { ...clean('g1'), ...clean('g2') }, tip: { ...clean('g1'), ...drift('g2') }, args: ['--base', '{BASE}', '--tip', '{TIP}', '--gates', '{DIR}/gates.json', '--only', 'g1'], expect: { exit: 0, rows: ['g1 HELD'] } });
add('all-absent-no-gates', { gates: [G('g1')], base: { 'README.txt': 'x\n' }, tip: { 'README.txt': 'y\n' }, expect: { exit: 2, rows: ['g1 ABSENT_BOTH'], summary: 'reason=NO_GATES' } });
add('ok-exit-list-honored', { gates: [G('g1', { ok_exit: [0, 3] })], base: clean('g1'), tip: S('g1', "echo 'G1: CLEAN'; exit 3"), expect: { exit: 0, rows: ['g1 HELD'] } });
add('clean-word-not-in-list', { gates: [G('g1')], base: clean('g1'), tip: S('g1', "echo 'G1: PARTIAL'"), expect: { exit: 1, rows: ['g1 HARM'] } });
add('usage-missing-base', { gates: [G('g1')], base: clean('g1'), tip: clean('g1'), args: [], expect: { exit: 64, rows: [] } });

writeFileSync(join(lane, 'scripts', 'harm-cases.json'), `${JSON.stringify({ contract: 'kumitate-harm-matrix-v1', cases }, null, 1)}\n`);
const dir = join(lane, '.ufo', 'waves', 'round-65', 'controls', 'harm');
rmSync(dir, { recursive: true, force: true });
cases.slice(0, frozen).forEach((c, i) => {
  const d = join(dir, `case-${String(i + 1).padStart(2, '0')}-${c.id}`);
  mkdirSync(d, { recursive: true });
  writeFileSync(join(d, 'spec.json'), `${JSON.stringify(c, null, 1)}\n`);
});
process.stdout.write(`cases=${cases.length} frozen_controls=${frozen}\n`);
