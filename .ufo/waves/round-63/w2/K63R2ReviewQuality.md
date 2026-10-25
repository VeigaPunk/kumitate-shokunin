VERDICT: Q58/Q59 are real, runnable gates whose headline commands reproduce exactly as written (Q58: r62 FAIL NO_PLAN, r63 PASS at a9531c8, selftest 10/10; Q59: w1 CLEAN 40/40, selftest 48/48, 44/44 controls conform) — but Q58 hides an early-dispatch blind spot its own script already solves with `--earliest-marker`, cites two fixture hashes that resolve in no repo, and understates the --all NA set, while Q59's dead-seat-naming arm is substring-only and its Fails-when omits failure classes its own controls demonstrate.

## Evidence

All commands ran in the lane at measured rev a9531c8e617338fd16cb69c61344ef8f17711117 (= worktree for scripts/ and corpus/; only untracked w2 files differ). Q58 criterion at `corpus/QUALITY.md:952-985`, Q59 at `:991-996`; both carry all six required fields (Grounding/Who/Command/Fails-when/Shown/Limit).

**Q58 command, as the criterion claims (:967-979):**
```
$ bash scripts/plan-before-ready.sh --round 62 --rev dfa6fca8f362e9c962f5b940025a2619380b759b
PLAN_BEFORE_READY: FAIL rev=dfa6fca8… round=62 … reason=NO_PLAN plan=- marker=6d8faede281e509a2201de504ffcb0f7781256fe marker_kind=dispatch marker_ct=1792935222 marker_path=.ufo/waves/round-62/w2-dispatch.json   → exit 1  ✓ matches :976-978 verbatim
$ bash scripts/plan-before-ready.sh --round 63 --rev a9531c8e617338fd16cb69c61344ef8f17711117
PLAN_BEFORE_READY: PASS … round=63 plan=b38a2065ab8ac5b198f6569b9013d04411c3d40d marker=05b3176915de4175bb211b4b1422d8e56cf16888 marker_kind=ready marker_path=.ufo/waves/round-63/w1.ready  → exit 0
$ bash scripts/plan-before-ready.sh --round 63 --rev b38a2065ab8ac5b198f6569b9013d04411c3d40d
PLAN_BEFORE_READY: NA … reason=NO_MARKER …  → exit 2  ✓ matches :973-975
$ bash scripts/plan-before-ready.sh --selftest → PLAN_BEFORE_READY_SELFTEST: PASS (10/10)  exit 0  ✓ matches :968-970
```
`:(glob)` pathspecs confirmed in script (judge_round, 3 uses); nested-marker-ignored selftest case passes. `--all` at b38a206: `PLAN_BEFORE_READY_SUMMARY: pass=11 fail=7 na=11 rounds=all(29) … exit=1 failed=35,36,37,38,39,40,62 na_rounds=49,52,53,54,55,56,57,58,59,60,63` — the failed list matches :978-979 verbatim.

**Q59 command, as the criterion claims (:993):**
```
$ node scripts/inline-dispatch-evidence.mjs --root <lane> --rev a9531c8… --round 63 --wave w1 --report /dev/null
INLINE_DISPATCH: CLEAN (seats=40 sessions=40 done=40 reports=40 dead=0)   exit 0  ✓ format and content match :993
$ node scripts/inline-dispatch-evidence.mjs --selftest → INLINE_DISPATCH_SELFTEST: PASS (48/48) exit 0 (≥25 per plan I1);
  includes PASS dead-unnamed-in-report … [DEAD_UNNAMED] and PASS dead-named-in-report … CLEAN dead=1 ✓ matches :996
```
All 44 committed controls (`git ls-tree a9531c8:.ufo/waves/round-63/controls/inline | wc -l` → 44) exit as their `expect` files name (exit code + finding id; the two CLEAN cases have no FINDING lines). Spot-verified against the criterion's six named cases: honest 0/CLEAN, forged-no-sessions 1/NOT_A_DISPATCH, cheap-40-seats 1/SESSION_TOOL_JOIN (dispatch really holds 40 seats), session-id-dup 1/SESSION_ID_DUP, reports-28-bytes 1/REPORT_TINY, results-name-swap 1/RESULTS_MISMATCH. Real-host sweep re-run (2 of 18 lines, byte-match with `controls/inline-real-hosts.txt`): kengaku r35 build → `CLEAN (seats=32 … dead=0)`; tameshi r45 w1 → `DRIFT … FINDING SESSION_AMBIGUOUS:ExecRows01-03`.

**Citations resolve.** `corpus/lessons/round-60-verifier-spotcheck.md:181-191` = R60-V5/V6 verbatim ("NOT_A_DISPATCH", "27/32 seats settled `exit=-9 session=null`", "The report names no dead seat") ✓; `considerthese/2026-10-25.md:64` = "3. **Audit seat deaths.**" ✓; `controls/CHANGES-AFTER-FREEZE.md` discloses 14→44 (+5 K63ReviewGateCode, +13 K63ExecGateForgery, +12 K63MutateInlineGate) ✓; 34fccc17… = round 41's plan (first committed plan.md, per --all) ✓; 5b0de268… = round 50 plan+marker same commit ✓; 6d8faede… ✓; 7b0581ed resolves in the fleet repo (cited as fleet commit) ✓. No unfilled `__X__` token in QUALITY.md (only rule-text examples at :910 and citations about round-60's report).

**Q52 hex sweep (57 distinct 7-40-hex tokens in QUALITY.md):** 47 resolve as lane commits; `7b0581ed` resolves in the fleet; `c7f7c401`/`0c1f9b22`/`03a258d6`/`6faa34ab`/`d6068d1b`/`3a32dd34` are sha256/receipt-content prefixes (labeled as such in context); `0011223344556677`/`aabbccddeeff0011` are command-example seeds. **Unresolvable anywhere: `59a40c84`, `34a9aee0` (Q58 :977-978) and `9237a72` (Q51 :903 — 0 hits in `git log --all` and `git fsck --lost-found`; also absent from the fleet ODB).**

**Attack fixtures (scratch, /tmp/kumitate-r63/K63R2ReviewQuality/):**
```
# early-dispatch order: dispatch.json @t0 → plan @t1 → w1.ready @t2 (fresh mktemp git fixture)
$ plan-before-ready.sh --repo $D --round 9                 → PLAN_BEFORE_READY: PASS … plan_ct=1000000100 marker_kind=ready marker_ct=1000000200  exit 0
$ plan-before-ready.sh --repo $D --round 9 --earliest-marker → PLAN_BEFORE_READY: FAIL … reason=PLAN_NOT_ANCESTOR … marker_kind=dispatch marker_ct=1000000000  exit 1
# dead-seat demo: honest control, one transcript's yield call renamed + session_exit row removed
$ gate … (no --report)          → INLINE_DISPATCH: CLEAN (seats=3 sessions=3 done=2 reports=3 dead=1)  exit 0
$ gate … --report roster.md     → INLINE_DISPATCH: CLEAN (seats=3 sessions=3 done=2 reports=3 dead=1)  exit 0   (roster says "all seats completed successfully")
$ gate … --report /dev/null     → INLINE_DISPATCH: DRIFT … FINDING DEAD_UNNAMED:K63AlphaOne  exit 1
# dead seat whose report file is also removed, no --report:
→ INLINE_DISPATCH: CLEAN (seats=3 sessions=3 done=2 reports=2 dead=1)  exit 0
```

## Findings

1. **K63R2ReviewQuality-1 — medium-high (Q58).** The Field's marker rule (:962-966, `.ready` else dispatch-fallback) ignores a `*-dispatch.json` committed *before* plan.md once any later `.ready` exists, so a lane that dispatches first and freezes the plan afterwards — the exact round-62 failure Q58 mines — PASSes the criterion's command. The script already ships the strict reading (`--earliest-marker`, FAIL PLAN_NOT_ANCESTOR on the same fixture) but the Command (:967) doesn't use it and the Limit (:983-985) states only the same-commit, committer-time and history-rewrite holes. Repro: fixture recipe + both verdict lines above.
2. **K63R2ReviewQuality-2 — medium (Q58, Q52 violation).** Shown-able-to-fail (:977-978) cites `.ready` commit `59a40c84` and plan commit `34a9aee0` of a "wrong-order fixture"; both are `fatal: Not a valid object name` in the lane and the fleet — they are commits of wave-1 seat K63ExecQualityCommand's throwaway scratch repo `fix-wrong.l2dx2m` (its report :51-55, build `fixtures.txt:8-10`), unreproducible by a non-author. The reproducible equivalent already exists: selftest case `wrong-order-ready-first` (want=1 got=1). The criterion should cite the selftest case, not dead hashes.
3. **K63R2ReviewQuality-3 — medium (Q58).** The Epoch paragraph (:980-982) discloses only rounds 35-40 (`NO_PLAN` by design); the same `--all` run reads `na_rounds=49,52,53,54,55,56,57,58,59,60` — nine closed rounds whose waves ran (round-52 tree at base holds `w1-taskcall.json`/`w1-registry.json`, no top-level `*-dispatch.json`) and whose ordering is therefore never judged. Wave-1's K63ExecQualityCommand-4 proposed the companion arm ("closed round with reports and no marker = FAIL"); the landed criterion carries only the interpretation sentence "Exit 2 is not a pass for a closed round" (:972-975), no check. Repro: `bash scripts/plan-before-ready.sh --rev b38a2065… --all` (summary line above).
4. **K63R2ReviewQuality-4 — medium (Q59).** The dead-seat-naming arm is substring-only: the gate checks `rep.includes(name)` on a file read live from the filesystem (`readFileSync(reportFile)`, not `git show REV:`), so a report that names a dead seat anywhere — e.g. a success roster — passes, while :993 claims "every name appears in the report beside its last error text". Observed: roster report → `CLEAN … dead=1` exit 0; `/dev/null` → `DRIFT [DEAD_UNNAMED]` exit 1. The Limit (:996) discloses that the arm is selftest-only but not that it is substring-only (extends wave-1 K63ScribeQuality-3).
5. **K63R2ReviewQuality-5 — medium-low (Q59).** Fails-when (:994) omits failure classes the gate emits and the criterion's own Shown-able-to-fail demonstrates: `RESULTS_MISMATCH` (its `results-name-swap` control), the five shape arms (`cheap-40-seats` → `SESSION_TOOL_JOIN`), plus `READY_MISMATCH`, `DISPATCH_MISMATCH`, `PARENT_MISMATCH`, `SESSION_CORRUPT`, `DONE_LOG_MISMATCH` (>1 done line), and fail-closed `DISPATCH_UNREADABLE`/`RESULTS_UNREADABLE`/`SESSIONS_ROOT_ABSENT`/`LOG_UNREADABLE`. A reader implementing from Fails-when alone under-builds the gate.
6. **K63R2ReviewQuality-6 — low (Q59).** Dead-seat/report interaction is stricter in prose than in code: `REPORT_ABSENT` is suppressed for dead seats (`if (!b) { if (!s.dead && s.session) … }`), observed — dead seat with its report removed, no `--report` → `CLEAN (… reports=2 dead=1)` exit 0, while :994 says "a seat report is absent" unconditionally. Also, no control or selftest case locks the `finished()` relaxation (yielded + no `session_exit` row → done; the header comment defines dead as "no clean `session_exit`"; the inline comment justifies it via K63 w1's 6-of-40) — a future gate edit flipping it survives all 44 controls.
7. **K63R2ReviewQuality-7 — low (Q58, quote fidelity).** The grounding (:953-959) quotes round 62 reading "the dispatched prompt contains no claim sentences"; the lesson's actual words (`corpus/lessons/round-62-verifier-spotcheck.md:15`) are "no 1–3 frozen claim sentences or counting predicates", and that text sits under §Conformance (:15) and the routed list (:57, item 1 — "routed defect 1" does resolve), while §Verdict (:63) carries only the `rejected-honest-stop` line. Paraphrase presented in quotation marks; section pointer imprecise.
8. **K63R2ReviewQuality-8 — low (Q59 vs Q54).** Not a duplicate: Q54 binds the launcher-era record (`dispatch-actual.json` schema, dead set from `launcher-progress.tsv`), Q59 binds inline-era host records the lane does not author (transcripts + dispatcher log + committed bytes + shape arms) — a fully fabricated inline wave reads `NOT_A_DISPATCH` under Q59's gate while Q54's gate has no launcher record to read. But the dead-seat clause ("every dead seat named in the report with its last error text") is duplicated nearly verbatim and both criteria ground on the same lesson lines (:181-191); one should cross-reference the other.
9. **K63R2ReviewQuality-9 — low (Q52 sweep, outside my two criteria).** Q51's grounding (:903) cites r49 commit `9237a72`, which resolves in neither the lane nor the fleet ODB (its companions `01b70bb`, `c432cc9` resolve). Dead citation in a landed criterion.

## Artifacts
- `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-63/w2/K63R2ReviewQuality.md` — this report.
- `/tmp/kumitate-r63/K63R2ReviewQuality/` — scratch: early-dispatch git fixture, `deadfix/` control copy, `hex-tokens.txt` (57 tokens + resolution). No lane file outside the report was written; no tool installed or upgraded (none needed).

## Limits
- Re-ran 2 of 18 real-host sweep lines (kengaku r35 build, tameshi r45 w1); the other 16 are quoted from the committed sweep file. In those two piped reruns the printed `exit=` is sed's, not the gate's; the verdict lines are the evidence (direct unpiped exits were observed for the w1 and control runs).
- Did not attack the C1 counter (`probe/inline63-probe.mjs`), C2, or the topology entry — other seats' scope. Did not verify the 44 controls' `expect` files against the generator's intent beyond conformance of actual exits.
- The early-dispatch and dead-seat fixtures are ephemeral (/tmp); repro commands included, nothing committed (write scope). The two merge commits in lane history add no plan/marker paths, so `oldest_add`'s merge-blindness is unexercised.
- Q59's Command's fleet report path (`/home/vgpnk/.ufo/reports/round-63/kumitate.md`) does not exist yet (round not closed); the `--report` arm against a real fleet report is untested. `--rev` mode was exercised on w1 (CLEAN) and via selftest; a forged-worktree-vs-rev divergence on real w1 bytes was not constructed.
