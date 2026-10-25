VERDICT: 61 round-63 statements re-derived: 56 MATCH, 3 MISMATCH (the `-2` stem count, a control count attributed to the wrong commit, an undisclosed plan-floor miss), 2 UNDERIVABLE (both time-indexed to the host session store); no claim verdict, receipt line, commit hash or axis number drifts.

## Evidence

Scope: report `git -C /home/vgpnk/Projects/shokunin show 8fd46e61:.ufo/reports/round-63/kumitate.md` (79 lines). Table: `.ufo/waves/round-64/build/K64ExecR63Counts/counts.tsv` (61 rows, one per statement). Every number below was derived, not quoted.

Seats, roles, mix (source `w1-dispatch.json` / `w2-dispatch.json` `counts` + `registry.members`, cross-checked against `*-results.json`, `w1/*.md`, `w2/*.md`):
```
w1 counts={"spawn":40,"resume":0,"total":40}  roles={scout:5,connector:3,executor:13,scribe:6,simplifier:1,reviewer:4,critic:3,mutation-tester:3,sentinel:1,revenger:1}
w2 counts={"spawn":39,"resume":0,"total":39}  roles={reviewer:12,critic:5,mutation-tester:3,executor:11,scribe:3,connector:2,scout:2,simplifier:1}
w1/w2 report stems == dispatch taskCall names (diff exit 0 both); attack 10/40=25.0% · 20/39=51.3% · 30/79=38%
m_flash loose 45/79=56.96% (57%) · strict 35/79=44.30% (44.3%)
```
Answering models (`~/.omp/agent/sessions/-Projects-shokunin/2026-10-25T16-43-09-760Z_01a173f1-…/`, `model_change` with `role=subagent:<seat>`; exact stem, else `<stem>-2`):
```
w1 {"opencode-go/deepseek-v4.1-flash":25,"zai/glm-5.3-flash":7,"minimax-code/MiniMax-M3.1-Flash":5,"google-antigravity/gemini-3.8-flash":3} sum=40
w2 {"opencode-go/deepseek-v4.1-flash":20,"zai/glm-5.3-flash":15,"google-antigravity/gemini-3.8-flash":2,"minimax-code/MiniMax-M3.1-Flash":2} sum=39
```
Provider errors (`message.errorStatus`): `w1 {"402":25,"429":9}` on 34/40 seats · `w2 {"402":20,"429":24}` on 35/39 seats.

Commits / gates / receipts (all verbatim):
```
git log --oneline dfa6fca8..bb184a90 | wc -l -> 9   (all nine hashes equal the report's list, in the report's order)
git ls-remote origin refs/heads/master -> dd1a3e6f (round-64 base); git merge-base --is-ancestor bb184a90 dd1a3e6f -> exit 0
  => "pushed; ls-remote prints the same hash" held at filing and bb184a90 is still an ancestor of the remote tip
b38a2065 gate --selftest -> PASS (25/25) ; 05b31769 -> (48/48) ; 144f11f5 -> (69/69) ; tip worktree -> INLINE_DISPATCH_SELFTEST: PASS (69/69) exit 0
controls/inline case dirs: b38a2065=14  05b31769=45  a9531c8e=44  144f11f5=75  bb184a90=75
topology summary.txt at freeze: grep -c ^AS-EXPECTED -> 12 ; counter-pins.json round===63 -> 4 (inline63-probe, topology63-probe, make-inline-controls, make-topology-controls)
git archive bb184a90 | tar -x ; node scripts/proxy-check.mjs      -> PROXY: MATCH (A=257 C=30 operability=9; C1=19/19 C2=153/153 coverage=10; S=88/88; R=92/92; K=49/49; pins=6 match; src-rev=31c465f15669) exit 0
same with --strict                                                -> identical line, exit 0
git show c8cb1bb:SCORECARD.md | grep ^A=                          -> A=258
node scripts/inline-dispatch-evidence.mjs --root <archive> --round 63 --wave w1 -> INLINE_DISPATCH: CLEAN (seats=40 sessions=40 done=40 reports=40 dead=0) exit 0
                                                                  --wave w2 -> INLINE_DISPATCH: CLEAN (seats=39 sessions=39 done=39 reports=39 dead=0) exit 0
node scripts/readme-map.mjs (archive)                             -> README_MAP: CLEAN files=153 rows=153 covered=153 exit 0
node scripts/sources-check.mjs                                    -> SOURCES_CHECK: CLEAN (rows=136 tiers=A:113,B:15,C:8 …) exit 0
bash scripts/plan-before-ready.sh --round 62                      -> PLAN_BEFORE_READY: FAIL rev=dd1a3e6f… round=62 reason=NO_PLAN exit 1
cat base/inline63-base.txt -> INLINE63_UNMET held=0/6 … exit=1 ; base/topology63-base.txt -> TOPOLOGY63_UNMET held=1/7 … exit=1
cat close/inline63-probe-at-T.txt -> INLINE63_HELD held=6/6 checks=6 rev=d37e7d0a… rule=I63
cat close/topology63-measured.txt -> TOPOLOGY63_HELD held=7/7 checks=7 rev=d37e7d0a… rule=T63  (exit=0)
census before/after: same six W04 (S034 S068 S084 S095 S123 S126) + "ok", EXIT=0 both
base/proxy-before.txt -> PROXY: FAIL-CLOSED (GATE_PIN_KEY_UNKNOWN) line 330 … EXIT=2
```
Registry: rows `134 -> 136`; tier tally by field 5 `A 111/B 15/C 8 -> A 113/B 15/C 8` (both added rows tier A: docs 79→80, paper 8→9); `git diff --stat dfa6fca8..bb184a90 -- corpus/SOURCES.md` = `2 insertions(+)`; `grep -c coordinator` on PROVINCE 0 (base) → 1 (tip). Assimilation: `reg-ids`=134, `staged-ids`=155, `collisions`=`S195`, `quarantine-slice`=9 and `w1/K63ScoutQuarantine.md:1` = `9/9 PRESENT, 0 ABSENT …, 0 UNVERIFIABLE`. Tree: `git ls-tree -r -l bb184a90 .ufo/waves/round-63` = 11,307,180 B (10.8 MiB), 2895 files.

## Findings

**K64ExecR63Counts-1 — MEDIUM — the `-2` stem count is three, not one.** Attacks: the report's "Name collision" sentence ("one w2 label landed as `K63R2ConnRoutedDefects-2` … the gate resolves `-N` stems"). Derived three (`K63R2ConnRoutedDefects-2`, `K63R2ScoutHostRecords-2`, `K63R2ScoutLeftovers-2`); those are exactly the three w2 seats whose model/error counts are invisible without `-N` resolution (my first pass lost them: 36/39 transcripts). The wave verdicts survive (`seats=39` CLEAN); only the prose undercounts. Round-63's own spot-check already routed this as D3, so this is independent confirmation, not a new class. Repro:
```
ls ~/.omp/agent/sessions/-Projects-shokunin/2026-10-25T16-43-09-760Z_01a173f1-d040-72cd-9542-6011673d5d9b/ | grep -E '^K63.*-[0-9]+\.jsonl$' | wc -l   # 3
```
Round-64 must append an erratum (never rewrite) naming three stems.

**K64ExecR63Counts-2 — LOW — "44 controls" is attributed to the commit that carried 45.** Attacks: the landed-changes bullet for `05b31769` ("wave 1 landed: gate ratchet, 44 controls, …"). At `05b31769` the inline control set is 45; 44 is `a9531c8e`, the next commit ("drop rev-mode-only control"). The commit's own subject also says 45, so the report contradicts both the tree and the message it cites. Repro:
```
git -C …/kumitate-shokunin ls-tree -r -d --name-only 05b31769 .ufo/waves/round-63/controls/inline | awk -F/ 'NF==6' | wc -l   # 45
git -C …/kumitate-shokunin ls-tree -r -d --name-only a9531c8e .ufo/waves/round-63/controls/inline | awk -F/ 'NF==6' | wc -l   # 44
```
The 14 → 75 endpoints and the "+31 in wave 2" arithmetic are unaffected (44 is the correct pre-wave-2 base).

**K64ExecR63Counts-3 — LOW — the plan's wave-2 floor was missed and not disclosed.** Attacks: "Round shape and seat accounting", which discloses the plan's 80–100 round-total miss by one but is silent on `plan.md:137` "Wave 2 (>= 40 seats, only if wave 1 yields >= 32 distinct attack items)" while dispatching 39. The number 39 itself is correct everywhere it appears; the omission is the disclosure asymmetry. Repro: `git show b38a2065:.ufo/waves/round-63/plan.md | sed -n '135,139p'` vs `w2-dispatch.json counts.spawn=39`.

**K64ExecR63Counts-4 — LOW — "1466 real finished seats" is a code comment, not a receipt, and the lane carries three different Ns for the same measurement.** Attacks: the gate-ratchet sentence ("five shape arms … measured on 1466 real finished seats, 0 violations"). `1466` appears in the lane only at `scripts/inline-dispatch-evidence.mjs:43,53`, where the same comment states `415` marker-scoped seats, and `w1/K63ExecGateForgery.md:1` reports `458/458`. None of the three is committed as a transcript (the same class as routed defect D2). Not re-derivable today: the store is append-only and now holds 5145 finished transcripts, so 1466 cannot be reconstructed. Repro:
```
grep -rn '1466\|all 415' /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/inline-dispatch-evidence.mjs
```
No verdict depends on it (the arms' pass property, not the N, is what the ratchet claims).

No other drift: all nine commit hashes, both frozen-counter verdict lines, both base receipts, both wave gate verdicts (re-run from the archive, not read), `PROXY: MATCH`/`--strict`, A=257 / A=258 / C2=153 / K=49, `README_MAP: CLEAN files=153`, `SOURCES_CHECK: CLEAN rows=136`, rows 134→136, the tier histogram, the 25/7/5/3 and 20/15/2/2 model splits, the 402/429 tallies, the seat/role vectors, all three attack shares and both m_flash shares, 25→69, 14→75, 12 topology controls, 31 wave-2 controls, 21 wave-2 selftest cases, 4 counter pins, 9/9 quarantine, 134/155/S195, `PLAN_BEFORE_READY: PASS` / round-62 `FAIL reason=NO_PLAN`, `grep -c coordinator` 0→1, the two-insertion SOURCES diff, and the pushed-tip claim (`bb184a90` still an ancestor of the remote master) reproduce exactly as filed.

## Artifacts

- `.ufo/waves/round-64/build/K64ExecR63Counts/counts.tsv` — 61 statements, 4 columns (statement, claimed, derived command, verdict).
- `/tmp/kumitate-r64/K64ExecR63Counts/` — `r63-report.md` (report bytes), `models.mjs`, `models2.mjs` (`-N`-resolving), `errors2.mjs`, `shape.mjs`, `yieldnoexit.mjs`, `tip/` (bb184a90 archive, 10.8 MiB), `selftest/gate-<rev>.mjs`, `w{1,2}-seats.txt`, `w{1,2}-report-stems.txt`.

## Limits

- `1466` real finished seats and "six w1 seats had a yield and no `session_exit` row" are time-indexed to a store that only grows: today 0 w1 transcripts show yield-without-exit and the store holds 5145 finished transcripts. Both marked UNDERIVABLE, not MATCH — SCORECARD:2972 ("six session_exit rows landed after the wave settled") is corroboration, not derivation.
- I did not re-run the two frozen probes (I63/T63) end to end; their verdict lines were read from the committed receipts, while the gate behind I63 was re-run twice from the archive.
- I did not audit prose without a number (entry wording, lesson narrative) and did not re-open S196/S197 live; the round-63 spot-check file does that (`corpus/lessons/round-63-verifier-spotcheck.md`).
- `~12 MB` is an approximation: derived 10.8 MiB / 11.3 MB. Scored MATCH (approximate).
- Session-store derivation reads only `model_change`/`errorStatus`/`session_exit` shapes; it does not judge whether a seat's work was sound.
- Tool installs: none (node v24.21.0 pre-existing; no pacman/uv/npx).
