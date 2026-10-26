// gen-v2.mjs — builds harm-cases-v2.json: the 26 committed cases verbatim + 26 new attack cases.
// usage: node gen-v2.mjs <lane-scripts-dir> <out.json>
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const [, , scriptsDir, outFile] = process.argv;
if (!scriptsDir || !outFile) { process.stderr.write('usage: gen-v2.mjs <scripts-dir> <out.json>\n'); process.exit(64); }
const orig = JSON.parse(readFileSync(join(scriptsDir, 'harm-cases.json'), 'utf8'));
const cases = [...orig.cases];

const G = (id, extra = {}) => ({ id, argv: ['bash', `scripts/${id}.sh`], verdict: `^${id.toUpperCase()}: (\\w+)`, clean: ['CLEAN'], timeout: 5, ...extra });
const S = (id, body) => ({ [`scripts/${id}.sh`]: `${body}\n` });
const clean = (id) => S(id, `echo '${id.toUpperCase()}: CLEAN'`);
const drift = (id) => S(id, `echo '${id.toUpperCase()}: DRIFT'; exit 1`);
const add = (id, c) => cases.push({ id: `v2-${id}`, ...c });

// --- pinned behaviour: verdict surface
add('verdict-trailing-spaces-held', { gates: [G('g1')], base: clean('g1'), tip: S('g1', "echo 'G1: CLEAN    '"), expect: { exit: 0, rows: ['g1 HELD'], summary: 'HARM_MATRIX: CLEAN gates=1 held=1' } });
add('verdict-no-capture-group-is-invalid', { gates: [G('g1', { verdict: '^G1: (?:CLEAN|DRIFT)' })], base: clean('g1'), tip: drift('g1'), expect: { exit: 2, rows: [], summary: 'reason=GATES_INVALID' } });
add('verdict-named-group-read', { gates: [G('g1', { verdict: '^G1: (?<word>CLEAN|DRIFT)' })], base: clean('g1'), tip: drift('g1'), expect: { exit: 1, rows: ['g1 HARM'], summary: 'harm=1' } });
add('clean-word-case-mismatch-harms', { gates: [G('g1')], base: clean('g1'), tip: S('g1', "echo 'G1: clean'"), expect: { exit: 1, rows: ['g1 HARM'] } });
add('stdout-drift-stderr-clean-not-clean', { gates: [G('g1')], base: clean('g1'), tip: S('g1', "echo 'G1: DRIFT'; echo 'G1: CLEAN' >&2"), expect: { exit: 1, rows: ['g1 HARM'], summary: 'harm=1' } });
add('stdout-clean-stderr-drift-not-clean', { gates: [G('g1')], base: clean('g1'), tip: S('g1', "echo 'G1: CLEAN'; echo 'G1: DRIFT' >&2"), expect: { exit: 1, rows: ['g1 HARM'] } });

// --- long / empty / missing output
add('long-output-200k-held', { gates: [G('g1')], base: clean('g1'), tip: S('g1', `node -e 'for(let i=0;i<4000;i++)console.log("x".repeat(50));console.log("G1: CLEAN")'`), expect: { exit: 0, rows: ['g1 HELD'], summary: 'HARM_MATRIX: CLEAN gates=1 held=1' } });
add('empty-output-exit-0-tip-harms', { gates: [G('g1')], base: clean('g1'), tip: S('g1', ':'), expect: { exit: 1, rows: ['g1 HARM'] } });
add('no-verdict-both-unmeasured', { gates: [G('g1')], base: S('g1', ':'), tip: S('g1', 'exit 0'), expect: { exit: 0, rows: ['g1 CARRIED'], summary: 'unmeasured=1' } });
add('missing-binary-unmeasured', { gates: [{ id: 'g1', argv: ['nosuch-binary-xyz-65'], verdict: '^G1: (\\w+)', clean: ['CLEAN'], timeout: 5 }], base: {}, tip: {}, expect: { exit: 0, rows: ['g1 CARRIED'], summary: 'unmeasured=1' } });

// --- sandbox isolation
add('gate-cross-talk-masks-harm', { gates: [G('g1'), G('g2')], base: { ...S('g1', `printf '#!/bin/sh\\necho "G2: CLEAN"\\n' > scripts/g2.sh; echo 'G1: CLEAN'`), ...clean('g2') }, tip: { ...S('g1', `printf '#!/bin/sh\\necho "G2: CLEAN"\\n' > scripts/g2.sh; echo 'G1: CLEAN'`), ...drift('g2') }, expect: { exit: 1, rows: ['g1 HELD', 'g2 HARM'], summary: 'harm=1' } });
add('gate-self-edit-cannot-retcon', { gates: [G('g1')], base: clean('g1'), tip: S('g1', `printf '#!/bin/sh\\necho "G1: CLEAN"\\n' > "$0"; echo 'G1: DRIFT'; exit 1`), expect: { exit: 1, rows: ['g1 HARM'] } });

// --- registry id shape
add('gate-id-case-collision-invalid', { gates: [G('g1'), G('G1')], base: clean('g1'), tip: clean('g1'), expect: { exit: 2, rows: [], summary: 'reason=GATES_INVALID' } });
add('gate-id-dot-invalid', { gates: [G('g1.2')], base: { ...clean('g1') }, tip: { ...clean('g1') }, expect: { exit: 2, rows: [], summary: 'reason=GATES_INVALID' } });
add('gate-id-slash-invalid', { gates: [G('g/1')], base: { ...clean('g1') }, tip: { ...clean('g1') }, expect: { exit: 2, rows: [], summary: 'reason=GATES_INVALID' } });

// --- field validation
add('timeout-non-integer-invalid', { gates: [G('g1', { timeout: 2.5 })], base: clean('g1'), tip: S('g1', "sleep 3; echo 'G1: CLEAN'"), expect: { exit: 2, rows: [], summary: 'reason=GATES_INVALID' } });
add('ok-exit-strings-invalid', { gates: [G('g1', { ok_exit: ['0'] })], base: clean('g1'), tip: clean('g1'), expect: { exit: 2, rows: [], summary: 'reason=GATES_INVALID' } });
add('gates-empty-array-invalid', { gates: [], gates_raw: '{"gates":[]}', base: clean('g1'), tip: clean('g1'), expect: { exit: 2, rows: [], summary: 'reason=GATES_INVALID' } });
add('needs-directory-not-a-file', { gates: [G('g1', { needs: 'scripts' }), G('g2')], base: { ...clean('g1'), 'scripts/keep.sh': 'echo keep\n', ...clean('g2') }, tip: { 'scripts/keep.sh': 'echo keep\n', ...clean('g2') }, tip_delete: ['scripts/g1.sh'], expect: { exit: 0, rows: ['g1 ABSENT_BOTH', 'g2 HELD'], summary: 'gates=1 held=1' } });
add('needs-non-string-invalid', { gates: [G('g1', { needs: 123 })], base: clean('g1'), tip: clean('g1'), expect: { exit: 2, rows: [], summary: 'reason=GATES_INVALID' } });

// --- only / timeout argv / revisions
add('only-unknown-id-invalid', { gates: [G('g1')], base: clean('g1'), tip: clean('g1'), args: ['--base', '{BASE}', '--tip', '{TIP}', '--gates', '{DIR}/gates.json', '--only', 'nosuch'], expect: { exit: 2, rows: [], summary: 'reason=ONLY_UNKNOWN' } });
add('only-unknown-id-mixed-not-dropped', { gates: [G('g1'), G('g2')], base: { ...clean('g1'), ...clean('g2') }, tip: { ...clean('g1'), ...drift('g2') }, args: ['--base', '{BASE}', '--tip', '{TIP}', '--gates', '{DIR}/gates.json', '--only', 'g1,nosuch'], expect: { exit: 2, rows: [], summary: 'reason=ONLY_UNKNOWN' } });
add('cli-timeout-zero-usage', { gates: [G('g1')], base: clean('g1'), tip: clean('g1'), args: ['--base', '{BASE}', '--tip', '{TIP}', '--gates', '{DIR}/gates.json', '--timeout', '0'], expect: { exit: 64, rows: [] } });
add('rev-tip-branch-name', { gates: [G('g1')], base: clean('g1'), tip: drift('g1'), args: ['--base', '{BASE}', '--tip', 'main', '--gates', '{DIR}/gates.json'], expect: { exit: 1, rows: ['g1 HARM'] } });
add('rev-head-symbolic', { gates: [G('g1')], base: clean('g1'), tip: drift('g1'), args: ['--base', '{BASE}', '--tip', 'HEAD', '--gates', '{DIR}/gates.json'], expect: { exit: 1, rows: ['g1 HARM'] } });
add('rev-peel-expressions', { gates: [G('g1')], base: clean('g1'), tip: drift('g1'), args: ['--base', '{BASE}^0', '--tip', '{TIP}^{commit}', '--gates', '{DIR}/gates.json'], expect: { exit: 1, rows: ['g1 HARM'] } });

// --- movement comparison
add('carried-movement-beyond-200-bytes', { gates: [G('g1')], base: S('g1', `echo "G1: DRIFT ${'a'.repeat(200)} A"; exit 1`), tip: S('g1', `echo "G1: DRIFT ${'a'.repeat(200)} B"; exit 1`), expect: { exit: 0, rows: ['g1 CARRIED_MOVED'] } });

writeFileSync(outFile, `${JSON.stringify({ contract: 'kumitate-harm-matrix-v1', cases }, null, 1)}\n`);
process.stdout.write(`originals=${orig.cases.length} new=${cases.length - orig.cases.length} total=${cases.length}\n`);
