RESULT ReviewLesson rev=1530a75521345e0f4516ed7146180e65f788e017 verdict=defects defects=9

## Scope and basis

- The lesson file is absent at 1530a755. It exists at master 0004ae3102c595338c269e56e3a6f5e0d4a28307, the docs commit on top of 1530a755. That commit changes 10 files: the lesson, SCORECARD.md, SKILL.md, LOG.md, corpus/README.md, the falsify spec and dispatch JSON, two measured receipts and one mutant ledger. It changes no script, pin, note or source. Line numbers below refer to the lesson at 0004ae31. Receipts were read at 1530a755.
- Scratch clone: /fast/scratch/hyaku/kumitate-r40/seats/ReviewLesson/lane (detached checkouts). In the lane I ran only read-only queries (git rev-parse, git branch -a, file reads) and wrote only this report.
- Tool: uv (already at ~/.local/bin/uv) with `uv run --no-project --with jsonschema==4.25.1`, an ephemeral PyPI environment, used only to validate ledgers against the S036 schema. No system or project change. curl, openssl and tar were already present. No pacman transaction.

## Defects (severity order; lines in corpus/lessons/round-40.md at 0004ae31)

1. [medium-high] Lines 96-99, Mistakes row 4 (landing). The cited evidence, .ufo/waves/round-40/evidence/seat-gate.txt, is 12 lines. It records the acquire at 14:00:57Z and "Spawned 32 background agents" and has no release line. `grep -i release` on that file returns 0 hits, and `grep 15:16` across round-40 returns 0 hits. So the 15:16Z release, "after the last wave-1 seat had returned" and "the gap held 32 seats" are not supported. The fix is a procedure note with no check and no red-before receipt, so it is not shown able to fail.
2. [medium] Lines 51-53 (C1 red-before). The new selftest cases fail for a flag reason, not because the floor logic is missing. AT31 and AT34 call `tool(d, ['--open', openRev])` and require exit 1 (final/ExecReviewBind.patch.txt:298-299 and :333-336). The open-revision gate has no --open parser: `git show f69817e:scripts/anchor-truth.mjs | grep -c open` returns 0, and unknown arguments exit 64 (scripts/anchor-truth.mjs:402, :445 at f69817e). build/ExecNewDebtIdentity.md:19 says this outright for AT39-AT42: "open logic rejects `--open` with exit 64 and has no DEBT_NEW/DEBT_GREW@open". Separately, no measured mutant is killed by AT31-AT42 (final/mutants-measured-1530a755.txt, KILLEDBY column: only AT23-AT30 and AT43-AT45 appear). So the new --open code has no mutation evidence. Fix: rerun the red-before against a gate that accepts --open but lacks the new check, state the cause, and add mutants for REVIEW_UNBOUND and DEBT_NEW.
3. [medium] Line 98, Mistakes row 3 (vacuous control). The "benign 8/10" run the row relies on appears in no receipt: `grep -rn "8/10\|benign 8\|benign_clean=8" .ufo/waves/round-40` returns nothing. The cited receipt final/floor-probe2-integration-c3d9547.txt is the post-fix run (benign 10/10). The fix itself checks out: the seat probe cites scripts/local-helper.mjs:12 (probe/floor-probe-v2.seat.mjs.txt:447, :456), the final probe cites :11 (probe/floor-probe-v2.mjs.txt:455, :464), and the pinned source has MAX_N_PREDICT on line 11. The failing run that shows the fix could fail is missing.
4. [medium] Line 97, Mistakes row 2 (attribution). The fix is a prose correction and cites no red-before receipt. The nearest evidence exists but is not cited: build/ScribeLessonDraft.md section 1 (validate run) and section 2 (status set to rejected still prints W04; supersedes variants). The evidence pointer "round-39 report line 176" omits the path. It is /home/vgpnk/Projects/shokunin/.ufo/reports/round-39/kumitate.md:176, in the fleet root.
5. [medium-low] Lines 75-77 (R39-8). "Checklist 8/15 -> 15/15 on the lane tree before the measured commit" has no 15/15 receipt in round-40; the only checklist receipt is 8/15 at open (open/receipts.txt:26). A scratch clone at 1530a755 gives `CHECKLIST: 13/15 pass` (SKILL.md:657 and :658 exit 2). Both failing items run `scripts/round-gate.mjs --tracked`, whose default main repo comes from the script's own location (round-gate.mjs:142). In a scratch clone that is the wrong place, and the lane's own .ufo/reports holds only round-33. I did not check the real lane path, because the default there is the fleet root. Fix: record the run with its path, flags and output, or drop the number.
6. [low] Line 96, Mistakes row 1 (wording). "the same mutant now fails 63/64" inverts the count. The receipt reads "63/64 cases passed (hermetic)" with "VERDICT: FAIL" (final/cite-zero-resolved-red-before.txt:304-339). Write "passes 63/64 and exits 1".
7. [low] Lines 145-146 (open limits). The measurement that 2000 no-symbol anchors read CLEAN belongs to CritRedHeadroom (build/CritRedHeadroom.md:17). build/ReviewR39Routing.md:40-41 only cites it. Fix the attribution.
8. [low] Lines 103-114 (Gate, new rows). Old-to-new logging is missing for the three new rows: S035 status "— -> mined" and used-by "— -> corpus/knowledge/kimi-skills-plugins.md" (corpus/SOURCES.md:48); S036 and S037 "— -> queued" (SOURCES.md:49-50). "They stay queued" implies a prior state. The S012 entry (lines 115-120) is logged correctly and matches the registry diff: status queued -> mined, used-by — -> corpus/knowledge/kimi-lane-definitions.md.
9. [low] Lines 104-105 ("no secret file read"). build/ScribeKimiSkillNote.md:160-161 records that ~/.kimi-webbridge/identity.json was touched shape-only (one key name read, no value). Say so.

## Notes (not counted as defects)

- Lines 9-11 name .ufo/waves/round-40/falsify/. That directory is not in git at 0004ae31; wave-2 seats populate it in the working tree, so the pointer resolves only after integration.
- Lines 47-50 (direct entry): no receipt path is given. I reproduced it at 1530a755 (see E4 below).
- Lines 81-90 (R39-6 correction) are accurate. Precision nit: the W04 arrays are per registry file (row_pass runs once per file, sources-census.sh:717), so "intra-lane" holds only because kumitate has one registry. Say "intra-registry-file (kumitate has one)".
- corpus/SOURCES.md:48 (S035 teaches) says "User over Extra" with no source for skill precedence. The one precedence source in the registry (S012, SOURCES.md:25) orders Extra above User. Outside the lesson text; flag for the L1.

## Verified (matches receipts or my reruns)

- C1: open 20/26 accepted, benign 10/10, setup 0 (final/floor-probe2-open.txt:109-111). Measured 0/26, 10/10, 0 (final/floor-probe2-measured-1530a755.txt:121-123). My rerun at 1530a755 gave the same 0/26, 10/10, 0 in 29.75 s. Selftest 30/30 at open (open/receipts.txt:20) and 41/41 at 1530a755 (my run; mutants-measured file line 3).
- C2 (coverage:kimi-layer): open PROXY DRIFT with five error rows, exit 1 (open/receipts.txt:9-10). At 1530a755: PROXY MATCH with C2=89/89, coverage=10, K=52/52, coverage:kimi-layer=10, pins=6 match, 0 error rows, exit 0 (my run). Census CLEAN with members=52, and census selftest 48/48. `ls -A ~/.kimi-code/skills | wc -l` gives 7 on 2026-10-22. K2 section at corpus/knowledge/kimi-skills-plugins.md:218 and "Errata (round 40)" at :551. Host SKILL.md:2 name and :6 version 2.0.26; managed plugin SKILL.md:6 version 1.11.3.
- R39-4: 23 killed and 3 survived at open; 26 killed at 1530a755. Survivors killed by AT43, AT44, AT45. Measured ledger validates against the S036 schema with 0 errors (E10).
- R39-5: 62/62 at open; 64/64 with the two cases. Mutant M1 fails the suite (63/64, exit 1). E4 (filesScanned >= 0) survives as an equivalent mutant (build/ExecCiteZeroResolved.md:79-83).
- R39-7: receipt-fleet totals 643, 639, 659; realfleet 501, 494, 510 (final/cite-receipts/). The +20 at open is the round-39 closure file: the open receipt-fleet run has 20 ERROR lines from that file.
- R39-8: pin tree identical to the round-39 closure clone (both 1815a679...). Commit 8eea560 exists.
- Gate: S012 quote present in the live page (HTTP 200 today). S036 file HTTP 200, sha256 matches the row, line 92 enum matches. S037 tarball HTTP 200, sha512 matches the row, line 41 required matches. S035 lines 2 and 6 match. Access dates match the rows.
- R39-6: fleet sources-census.sh lines 644-645, 651-653 and 717 match the description. The round-39 report quote matches line 176. My validate run reproduces the W04 line, the ok line and exit 0. shared mode lists the Stryker URL for kumitate, kama and tameshi, the cross-lane fact. S023 opened 2026-10-20 and S034 opened 2026-10-22; round-35 cites S023, Q19 cites S034, and the round-39 S034 admit omits S023.
- Mistakes row 1: the receipt covers the pre-fix 62/62, the post-fix 64/64 and the mutant run (cite-zero-resolved-red-before.txt:87, :295, :304-346). Row 1 passes apart from the wording in defect 6.
- Open limits: 16 of 22 verdict conditions unpinned (build/ScoutCiteVerdict.md:8); three census arms survive (build/MutKimiCensusArms.md:9-11); four census citations re-pinned (kimi-residue-files.md diff).

## Residual risk and verification gaps

- I did not rerun the open-revision probe (f69817e); I used its receipt.
- I did not run the 26-mutant runner or the 17 recipes. I relied on receipts and the killed-by column.
- The new --open code has no mutant coverage (defect 2). A deleted REVIEW_UNBOUND or DEBT_NEW check would be caught only if AT31-AT42 happen to fail, and their red-before does not prove that.
- The checklist (defect 5) was not run at the real lane path, because the default main repo there is the fleet root, which I was told not to touch.
- External sources were fetched with plain HTTP today. No challenge page appeared.

## Evidence (revision noted; commands condensed)

- E1 rev 1530a755, probe rerun: `node --input-type=module - --lane <scratch clone> --rev 1530a755... --src /fast/scratch/hyaku/kumitate-pin/src --base e18ff1af... < .ufo/waves/round-40/probe/floor-probe-v2.mjs.txt` gives FLOOR_PROBE2 attacks_accepted=0/26, benign_clean=10/10, setup_errors=0, open-supported=true; exit 0; 29.75 s.
- E2 rev 1530a755: `node scripts/proxy-check.mjs --src .../kumitate-pin/src` gives `PROXY: MATCH (A=8 C=15 operability=8; C1=19/19 C2=89/89 coverage=10; ... K=52/52 coverage:kimi-layer=10; pins=6 match; src-rev=31c465f15669)`; error rows 0; exit 0.
- E3 rev 1530a755 selftests: anchor-truth `ANCHOR_TRUTH_SELFTEST: 41/41 pass`; cite-check `64/64 cases passed (hermetic)`; kimi-census `KIMI_CENSUS: CLEAN (members=52 checked=52 chain=7 info=4)`.
- E4 rev 1530a755, direct entry: `node scripts/anchor-truth.mjs --base e18ff1af... --open f69817ed... --src .../kumitate-pin/src` gives `TRUTH: CLEAN (notes=4 anchors=811 true=778 debt=20 unchecked=13 ...)`; exit 0.
- E5 rev 0004ae3 (master): proxy MATCH with C2=90/90 (the docs commit adds one lesson row); error rows 0; exit 0.
- E6 W04 validate in a scratch root (copy of shokunin.conf; symlink kumitate-shokunin to my clone at master): `kumitate W04 S034 duplicate url stryker-mutator.io/docs/mutation-testing-elements/mutant-states-and-metrics across scopes`; `kumitate ok .../corpus/SOURCES.md`; exit 0.
- E7 same root, shared mode: `stryker-mutator.io/docs/mutation-testing-elements/mutant-states-and-metrics shared kumitate,kama,tameshi`.
- E8 rev 1530a755 checklist: `node scripts/surface-probe.mjs --checklists` gives FAIL SKILL.md:657 exit=2 (Round-close artifact audit), FAIL SKILL.md:658 exit=2 (Filed-report tracking), `CHECKLIST: 13/15 pass`, `VERDICT: FAIL`.
- E9 scratch clone round gate: `--tracked` gives REPORTS_DIR_MISSING (default directory), NO_FILED_REPORTS (lane reports directory, round-33 only) or MAIN_REPO_NOT_GIT (wrong main repo). `node scripts/round-gate.mjs --reports-dir <lane reports>` gives `ROUND_GATE: CLEAN (round=33 lane=kumitate checks=10 errors=0 warnings=0)`.
- E10 ledger schema: `uv run --no-project --with jsonschema==4.25.1 python3 validate_ledger.py S036.json .../mutants-measured-1530a755-ledger.json` gives `ERRORS 0`; open ledger also `ERRORS 0`.
- E11 S036 fetch: HTTP 200; sha256 404575e9264686dbf85c399f6531fdb489bebc3146e7e1d793b8083bc6a041ae (matches row); line 92 `"enum": ["Killed", "Survived", "NoCoverage", "CompileError", "RuntimeError", "Timeout", "Ignored", "Pending"]`.
- E12 S037 fetch: HTTP 200; sha512 in base64 28CobrcLdQm35zySemaLMKrUpVccLMA1DekUGtfezOSmnI0Xq8oJisixYnO0BQYIwKCkKL7+AE71/uWq/vFSJQ== (matches row); line 41 `"required": ["id", "mutatorName", "location", "status"],`.
- E13 S012 fetch: HTTP 200; page text "more specific scopes take higher priority: Explicit (--agent-file) > Project > Extra > User > Plugin > Built-in".
- E14 host (names and front matter only): ~/.kimi-code/skills/kimi-webbridge/SKILL.md:2 `name: kimi-webbridge`, :6 `version: "2.0.26"`; managed plugin SKILL.md:6 `version: "1.11.3"`; `ls -A ~/.kimi-code/skills` lists 7 entries.
- E15 pin tree: kumitate-r39/src and kumitate-pin/src both 1815a679d954f4e12624e522847641e84b25fdd8.
- E16 mutants: open `mutants=26 killed=23 survived=3`; measured `mutants=26 killed=26 survived=0`; measured KILLEDBY values AT23-AT30 and AT43-AT45 only.
- E17 red-before: build/ExecNewDebtIdentity.md:19 (exit 64 on --open for AT39-AT42); build/ExecReviewBind.md:19 (30/34 with AT31-AT34 failing).
- E18 row 4 evidence: seat-gate.txt has 12 lines; no "release" text; no "15:16" anywhere in round-40.
