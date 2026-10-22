RESULT ExecProxyNoHarm rev=fae386aa9e0542710b7a893d84c8e92e86fc079b verdict=improved decreased=0

Scope: the lane's frozen scoring instrument scripts/proxy-check.mjs, run at the round-open revision a58b7f72afc1eb44b37e438a2f8b212c658874e5 and at the tip fae386aa9e0542710b7a893d84c8e92e86fc079b, then compared term by term. No lane file was edited; this report is the only write.
Scratch clones: /fast/scratch/hyaku/kumitate-r41a2/seats/ExecProxyNoHarm/lane (tip, detached fae386aa) and .../open (open, detached a58b7f72), both clean. Origin tree: /fast/scratch/hyaku/kumitate-pin/src at HEAD 31c465f15669f744848bd9f5d56191c5085670f7, the clone named in .ufo/pins/origin.json and asserted by the tool (src-rev=31c465f15669).
Usage read first: node scripts/proxy-check.mjs [--self DIR] [--scorecard FILE] [--src DIR] [--kimi-root DIR] [--pin FILE] [--json] [--strict]. --src is optional and the bare run resolves the same tree from the pin; bare and --src runs print identical summary lines at both revisions.

OPEN a58b7f72 — summary line:
$ node scripts/proxy-check.mjs --src /fast/scratch/hyaku/kumitate-pin/src
PROXY: DRIFT (C2_TOTAL_DRIFT term=C2_total declared=90 computed=91 delta=+1; AXES_DRIFT term=coverage declared=10 computed=9; PIN_UNPINNED term=scripts/anchor-truth.mjs; PIN_UNPINNED term=scripts/sources-check.mjs; src-rev=31c465f15669)
exit 1

TIP fae386aa — summary line:
$ node scripts/proxy-check.mjs --src /fast/scratch/hyaku/kumitate-pin/src
PROXY: MATCH (A=9 C=17 operability=8; C1=19/19 C2=92/92 coverage=10; S=88/88 coverage:script-layer=10; R=92/92 coverage:runtime-layer=10; K=52/52 coverage:kimi-layer=10; pins=6 match; src-rev=31c465f15669)
exit 0

TERMS, OPEN -> TIP (values read from --json at each revision):
A 8 -> 9 up | C 15 -> 17 up | operability 8 -> 8 held | C1 19 -> 19 held | C1_total 19 -> 19 held
C2 90 -> 92 up | C2_total declared 90 -> 92 up (computed 91 -> 92) | coverage 9 -> 10 up
S_members/S_sections 88/88 -> 88/88 held | coverage:script-layer 10 -> 10 held
R_members/R_sections 92/92 -> 92/92 held | coverage:runtime-layer 10 -> 10 held
C1k/C1k_total 5/5 -> 5/5 held | K_members/K_sections 52/52 -> 52/52 held | coverage:kimi-layer 10 -> 10 held
pins 6/6 -> 6/6 held (each declared digest equals the file) | terms that decreased: 0
operability held because f_O moved 23/26 -> 26/29 = 0.897; the scale needs A+C >= 27 for 9, so the tip is one honest artifact or checklist item short of operability 9.

ERROR-LEVEL FINDINGS: the open run had two, both cleared at the tip; the tip has none and exits 0.
  open C2_TOTAL_DRIFT  C2_total declared=90 computed=91 (a corpus note had no README row)
  open AXES_DRIFT      coverage: ## Axes row=10 derived=9 (that missing row held coverage at 9)
New error-level findings at the tip: none.

WARNINGS, listed separately (not errors, verdict unchanged): open 2, tip 3.
  open: PIN_UNPINNED scripts/anchor-truth.mjs; PIN_UNPINNED scripts/sources-check.mjs
  tip: those two plus PIN_UNPINNED scripts/wave-census.mjs, the one new warning of this round
Under --strict the tip exits 1 on those three warnings and no error; the open run exits 1 on two errors and two warnings.

WHY EACH TERM MOVED
A 8 -> 9: scripts/wave-census.mjs is new (lane-tree script file count 8 -> 9).
C 15 -> 17: two SKILL.md checklist items (wave census of round 40 payloads; wave-census hermetic suite); grep -c '^\s*- \[' SKILL.md reads 15 at open, 17 at tip.
C2 90 -> 92: two corpus/README.md rows (lessons/round-40-verifier-spotcheck.md, lessons/round-41.md); grep -c '^| `(knowledge|lessons)/' reads 90 at open, 92 at tip. C2_total computed 91 -> 92: one new note file, lessons/round-41.md (find corpus/knowledge corpus/lessons -name '*.md' | wc -l: 91 at open, 92 at tip). coverage 9 -> 10 follows from C2 92/92.
cite-check pin: the C1 edit changed the file, digest 9e19083226c9 -> 896f0720b7fe; sha256sum of each revision equals the pin declared in that revision, so no pin drifted. The other five pins (surface-probe, round-gate, proxy-check, claims-check, kimi-census) are byte-identical at both revisions.

CORROBORATION
node scripts/proxy-check.mjs --selftest reads 116/116 pass, exit 0, at both revisions (the instrument is unchanged: its own pin digest f9416d666d39 is the same).
node scripts/surface-probe.mjs --checklists reads CHECKLIST: 11/15 pass at open and 14/17 at tip. At open the red items were round-close artifact audit, filed-report tracking, proxy recompute and kimi-substrate census; at tip the proxy recompute item is green and the two new wave-census items pass. The three reds that remain are pre-existing and outside this round: the two round-gate items need the fleet reports directory, which a bare clone does not hold, and the kimi item is the host drift (~/.kimi-code/locks) recorded in the lesson.

NOTES AND LIMITS
The ## Axes operability evidence cell still quotes A=7, C=13, 20/23 while the live terms are A=9, C=17; that row is unchanged between the two revisions, so the gap is pre-existing and already listed in the scorecard's round-41 calibration corrections, not a finding of this seat. The tool scores A and C from the lane tree and S, R, K from the pinned origin tree and the kimi root, so the new lane script raises A but leaves the three layer scores untouched. No tooling was installed or updated by this seat.
