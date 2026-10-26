VERDICT: the round-64 LOG entry is drafted with every number tied to a command I ran myself; the integrated tree is honest on both counters (C2 8/8 exit 0, C1 4/5 exit 1 with P5 awaiting the round report), but five defects stand — a frozen P2 floor that was unreachable at freeze, a disclosure whose cited receipt carries only half its tally, a plan command naming a script the lane lacks, a "before" receipt produced by a non-hermetic script, and C1's closure depending on a document that does not exist at wave time.

# Seat K64R2ScribeLogFinal — final LOG.md entry (append-only)

Lane `kumitate-shokunin` at `2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8`; scratch `/tmp/kumitate-r64/K64R2ScribeLogFinal/`.

## Evidence

```
$ git log --oneline -3
2ed8a5f round-64: C2 entry jj-workspace-seat-containment, rows S198-S200, captures, amendment, PROVINCE/README, lesson, Q60/Q61, plan-before-ready map arm
d92cf1f round-64: wave 1 landed — report-receipt-diff v2, jj-seat-demo v2, 21 ratchet controls, wave-1 reports and builds
dd1a3e6 round-64: freeze plan, counters R64/J64, controls, base receipts, report-receipt-diff v1, jj-seat-demo
$ node .ufo/waves/round-64/probe/receipt64-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin 2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8
RECEIPT64_UNMET held=4/5 checks=5 rev=2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8 rule=R64 | P5 MISS report-not-given      exit=1
$ node .ufo/waves/round-64/probe/jj64-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin 2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8
JJ64_HELD held=8/8 checks=8 rev=2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8 rule=J64      exit=0
$ node scripts/report-receipt-diff.mjs --selftest → REPORT_RECEIPT_SELFTEST: PASS (52/52) exit=0   (freeze: PASS (20/20))
$ bash scripts/jj-seat-demo.sh → 21 'JJ_SEAT:' keys, JJ_SEAT_DEMO: DONE jj=0.45.1-7c41cdeb16b6b321c64e789a966b6adf723816a5, exit=0
   base/jj-seat-demo-freeze.txt → 15 keys, seat_has_git_dir=no
$ ls -d .ufo/waves/round-64/controls/receipt/*/ | wc -l → 37 ; ls -d .../k*/ | wc -l → 20
$ cat .../*/expect | tr ' ' '\n' | grep -E '^[A-Z][A-Z_]+$' | sort -u
CLEAN HASH_DEAD PLACEHOLDER RECEIPT_EMPTY RECEIPT_MISSING SECTION_MISSING SHONEN_COUNT TALLY_CHECKS_MISMATCH TALLY_UNRECEIPTED
$ git archive dd1a3e6f .ufo/waves/round-64/controls/receipt | tar -x -C /tmp/.../freeze
$ ls -d /tmp/.../freeze/.../receipt/*/ | wc -l → 16 ; cat /tmp/.../freeze/.../*/expect | ... | sort -u | grep -v CLEAN → 6 ids
$ D=$(mktemp -d) && git -C "$D" init -q && test "$(git -C "$D" rev-parse --show-toplevel)" = "$D"
$ TMPDIR="$D" bash /tmp/.../freeze/scripts/jj-seat-demo.sh | grep seat_has_git_dir → JJ_SEAT: seat_has_git_dir=yes   (v1, frozen)
$ TMPDIR="$D" bash scripts/jj-seat-demo.sh | grep seat_has_git_dir → JJ_SEAT: seat_has_git_dir=no                      (v2, shipped)
$ bash /home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --file corpus/SOURCES.md → exit=0, 7 lines, 6 W04
$ node scripts/sources-check.mjs
SOURCES_CHECK: CLEAN (rows=139 tiers=A:116,B:15,C:8 status=queued:13,mined:107,rejected:19 entries_with_source=21 legacy=38)  exit=0
   base: SOURCES_CHECK: CLEAN (rows=136 ...) — .ufo/waves/round-64/base/sources-check-before.txt
$ grep -c '^| S' corpus/SOURCES.md → 139 ; node scripts/readme-map.mjs → README_MAP: CLEAN files=156 rows=156 covered=156 exit=0
$ bash scripts/plan-before-ready.sh --round 64
PLAN_BEFORE_READY: PASS rev=2ed8a5f... round=64 ... plan=dd1a3e6f... marker=d92cf1f... map=SKIP reason=MAP_PRE_EPOCH_ROUND  exit=0
$ ls .ufo/waves/round-64/w1/*.md | wc -l → 41 (w1-dispatch total=41) ; ls .ufo/waves/round-64/w2/*.md | wc -l → 5 (w2-dispatch total=39)
$ for n in $(seq 40 63); do test -f /home/vgpnk/Projects/shokunin/.ufo/reports/round-$n/kumitate.md && echo $n; done | wc -l → 24
$ wc -l .ufo/waves/round-64/controls/real-reports-v2.txt → 11 ; grep -c CLEAN <same> → 0
$ grep -c 'FAIL forge/k' .ufo/waves/round-64/w1/K64ExecReceiptForge.md → 20
$ grep -E 'rewrite_seat_head_seat_state|abandon_seat_head_seat_state|update_stale' <demo run>
rewrite_seat_head_seat_state=fresh / abandon_seat_head_seat_state=stale / update_stale_recovers=yes
```

## Findings

**K64R2ScribeLogFinal-1 — medium — the round's own disclosure cites a receipt that carries half its tally.**
`controls/CHANGES-AFTER-FREEZE.md:31` states "over all 24 real reports of rounds 40–63 the v2 tool reads 13 CLEAN
and 11 DRIFT (`controls/real-reports-v2.txt`, `--rev master` at the integration commit)". The cited file holds 11
lines, every one a DRIFT row; no CLEAN row, no `13`, no 24-row table. The arithmetic is consistent (24 = 11 DRIFT
+ 13 unlisted CLEAN) but the CLEAN half is a subtraction the reader must perform, not a receipted datum — the
`unreceipted-tally` class Q61 exists to catch, inside the round's own disclosure. Reproduce: `wc -l
.ufo/waves/round-64/controls/real-reports-v2.txt` → `11`; `grep -c CLEAN …` → `0`; `for n in $(seq 40 63); do test
-f /home/vgpnk/Projects/shokunin/.ufo/reports/round-$n/kumitate.md && echo $n; done | wc -l` → `24`. Fix (L1; the
file is append-only — append, never rewrite): list the 13 CLEAN rounds by name with the command that produced them,
or append a sentence stating the file holds DRIFT rows only and 13 CLEAN = 24 − 11.

**K64R2ScribeLogFinal-2 — medium — the frozen counter could not read HELD at the freeze (P2's floor was unreachable).**
Plan §C1 P2 requires "`>= 8` distinct finding ids are exercised" while the 16 frozen cases exercise 6, and
`HASH_ORPHAN` is unreachable from a plain-directory control lane. At `dd1a3e6f` the claim's own counter had no
revision at which it could pass; the ratchet supplied the two missing ids post hoc and
`CHANGES-AFTER-FREEZE.md:14-15` names eight seats that found this independently. The repair is a strengthening and
the floor stayed 8, so the claim is not voided — but the plan was frozen without the "can the committed controls
meet every numeric floor of the rule" check that the round then had to perform under attack. Reproduce: the two
counts in Evidence. Fix (round 65): make that a freeze precondition, checked by a script reading the rule text and
the `expect` files, not by prose.

**K64R2ScribeLogFinal-3 — medium — C1's closure is structurally last-in: P5 needs a document that does not exist at
wave time.** The probe at the integrated tree reads `held=4/5 … P5 MISS report-not-given`, exit 1; the round-64
report is a close artifact, so no seat can re-run the claim's counting command to 5/5 before the L1 files it, and
any wave-2 seat quoting "5/5" would be inventing a number. The LOG entry carries **UNMEASURED** with the filling
command. Not a counter bug — a claim shape whose final arm is unobservable to the seats attacking it. Reproduce:
Evidence §2. Fix (round 65): split into P5a (the tool over the *previous* round's filed report at the current
revision, measurable now) and P5b (this round's report, measured at close).

**K64R2ScribeLogFinal-4 — low — the plan and the lesson name a lane script that does not exist.** Plan §C1/J7 and
`corpus/lessons/round-64.md` both write `bash scripts/sources-census.sh …` as a lane command; the lane has none
(`ls scripts | grep -i census` → `kimi-census.mjs`, `omp-census.mjs`, `wave-census.mjs`), and the command exits 127.
The probe resolves a fleet path and lets the caller override it: `jj64-probe.mjs:34`
`const CENSUS = process.env.SOURCES_CENSUS || '/home/vgpnk/Projects/shokunin/scripts/sources-census.sh'` — so the
census arm depends on a fleet-repo path and an environment variable, a lane-external dependency inside a lane
claim (the env override is disclosed as a limit; the missing lane path is not). Reproduce: `bash
scripts/sources-census.sh` in the lane → `bash: scripts/sources-census.sh: No such file or directory`, exit 127;
`grep -n SOURCES_CENSUS .ufo/waves/round-64/probe/jj64-probe.mjs`. Fix (L1): write the fleet path in the plan/lesson
text, or commit a thin lane wrapper that execs it.

**K64R2ScribeLogFinal-5 — low — the plan's "before" demo receipt was produced by the non-hermetic v1.**
`seat_has_git_dir` flips with `TMPDIR` ancestry on the frozen bytes (`yes` under a git-repo `TMPDIR`, `no` under
`/tmp`). `base/jj-seat-demo-freeze.txt` records `seat_has_git_dir=no` — honest for the run that produced it, but not
re-derivable by a third party whose `TMPDIR` sits inside a repository, so the "before" half of the plan's own
comparison is environment-dependent. The shipped v2 holds `no` under both, so the subject is repaired; the frozen
base receipt cannot be. Reproduce: Evidence. No fix proposed (frozen receipt); the LOG entry states the 15→21 key
growth without claiming the base keys are re-derivable.

## Artifacts

- `.ufo/waves/round-64/build/K64R2ScribeLogFinal/log-entry.md` — the final LOG entry draft: the append-only bullet
  (claims, counters, the three commits, wave-1 findings, controls/ratchet, assimilation admit/reject, considerthese
  ideas 1–2, the mined mistake, honest limits, open L0 questions), a provenance table mapping every number to its
  command, and a "do not write into this bullet" section.
- `/tmp/kumitate-r64/K64R2ScribeLogFinal/{c1.txt,c2.txt,census.txt,sources-check-after.txt,demo.txt,freeze/}` — raw
  probe/demo/census output and the `git archive dd1a3e6f` extraction used for the frozen-control counts.
- 0 `.mjs/.js/.sh/.py` files added under the lane tree by this seat (0 of the 15-file allowance used); LOG.md,
  SCORECARD.md, SKILL.md, `scripts/`, `corpus/`, `.ufo/pins/` untouched.

## Limits

- Wave-2 seat count and `node scripts/proxy-check.mjs --strict` at the close tip are **UNMEASURED** here: siblings
  are writing build files and the proxy's `A` term counts every `.mjs/.js/.sh/.py` under the lane, so any reading
  now is invalidated mid-flight. The entry carries both as UNMEASURED with their commands.
- C1's 5/5 was not observed and is not claimed: the round-64 report does not exist yet.
- I did not re-run the 37 controls end-to-end (wave-2 executors own that); the case/id counts are read from the
  committed `expect` files, and `CHANGES-AFTER-FREEZE.md`'s "all 37 exit as their `expect`" is quoted as a claim.
- I did not re-open S198/S199/S200 or re-fetch their captures; the lesson's `## Gate` table and J3/J5 are the
  evidence (J5's live fetch is exercised by the C2 run above, exit 0).
- LOG.md was not edited (I read `:2304` as its last non-empty line); no tool installs or updates were needed.
