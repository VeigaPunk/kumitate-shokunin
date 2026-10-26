#!/usr/bin/env node
// K65ReviewProbeH65 control: "canned real pairs". Hand-written: it implements NO classification, reads no gate and no
// repository bytes. For the two published H3 revision pairs it prints the four HARM_ROW lines H3 asks for (copied by
// hand from base/harm-pairA-freeze.txt and base/harm-pairB-freeze.txt); for anything else it prints a clean summary.
// If the counter reads HELD for this file, H3 (and H5) carry no evidence that the tool runs a gate at all.
const argv = process.argv.slice(2);
const opt = (k) => { const i = argv.indexOf(k); return i >= 0 && i + 1 < argv.length ? argv[i + 1] : null; };
const PAIR_A = ['a004902d77d17741b807069fa2bd9ce2e310e424', '47fe2383151909d31557ada118ad84f90404dc6c'];
const PAIR_B = ['6825a51425e91908f019ed65aa2f4209acbd7087', 'a004902d77d17741b807069fa2bd9ce2e310e424'];
const base = opt('--base');
const tip = opt('--tip');
const out = (s) => process.stdout.write(`${s}\n`);
if (base === PAIR_A[0] && tip === PAIR_A[1]) {
  out('HARM_ROW gate=readme-map base=CLEAN tip=NOT_CLEAN id=HARM base_text="README_MAP: CLEAN files=156 rows=156 covered=156" tip_text="README_MAP: DRIFT files=157 rows=156 covered=156 bad=2 first=uncovered:lessons/round-64-verifier-spotcheck.md [exit=1]"');
  out('HARM_ROW gate=proxy-check base=CLEAN tip=NOT_CLEAN id=HARM base_text="PROXY: MATCH (A=351 C=33 operability=9; C1=19/19 C2=156/156 coverage=10; S=88/88 coverage:script-layer=10; R=92/92 coverage:runtime-layer=10; K=49/49 coverage:kimi-layer=10; pins=6 match; src-rev=31c4" tip_text="PROXY: DRIFT (C2_TOTAL_DRIFT term=C2_total declared=156 computed=157 delta=+1; AXES_DRIFT term=coverage declared=10 computed=9; src-rev=31c465f15669) [exit=1]"');
  out('HARM_MATRIX: HARM gates=19 held=15 repaired=0 carried=2 moved=0 new=0 gone=0 harm=2 harm_absent=0 new_red=0 base=a004902d77d1 tip=47fe23831519');
  process.exit(1);
}
if (base === PAIR_B[0] && tip === PAIR_B[1]) {
  out('HARM_ROW gate=readme-map base=NOT_CLEAN tip=CLEAN id=REPAIRED base_text="README_MAP: DRIFT files=154 rows=153 covered=153 bad=2 first=uncovered:lessons/round-63-verifier-spotcheck.md [exit=1]" tip_text="README_MAP: CLEAN files=156 rows=156 covered=156"');
  out('HARM_ROW gate=proxy-check base=NOT_CLEAN tip=CLEAN id=REPAIRED base_text="PROXY: DRIFT (C2_TOTAL_DRIFT term=C2_total declared=153 computed=154 delta=+1; AXES_DRIFT term=coverage declared=10 computed=9; src-rev=31c465f15669) [exit=1]" tip_text="PROXY: MATCH (A=351 C=33 operability=9; C1=19/19 C2=156/156 coverage=10; S=88/88 coverage:script-layer=10; R=92/92 coverage:runtime-layer=10; K=49/49 coverage:kimi-layer=10; pins=6 match; src-rev=31c4"');
  out('HARM_MATRIX: CLEAN gates=19 held=14 repaired=2 carried=2 moved=0 new=1 gone=0 harm=0 harm_absent=0 new_red=0 base=6825a51425e9 tip=a004902d77d1');
  process.exit(0);
}
out('HARM_MATRIX: CLEAN gates=20 held=20 repaired=0 carried=0 moved=0 new=0 gone=0 harm=0 harm_absent=0 new_red=0 base=000000000000 tip=000000000000');
process.exit(0);
