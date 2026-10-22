RESULT ReviewRegistryRow rev=4e58bb0ee48a069ac7dbd99b6e5afe70dcd36ba3 verdict=DRIFT rows=3 errors=2

Scope. Three parts of the SKILL.md Gate registry were checked against each script's argument parser, docstring and actual output: the anchor-truth row, the wave-census row, and the new parenthesis in the cite-check row. All runs used my scratch clone /fast/scratch/hyaku/kumitate-r41/seats/ReviewRegistryRow/lane, detached at 4e58bb0 and clean at the end. The only write inside the lane is this report.

## Findings

### Row errors (these make errors=2)

1. anchor-truth row, verdict set. The row lists the verdicts as `TRUTH: CLEAN|DRIFT|FAIL-CLOSED`. A successful `--write-pin` prints `TRUTH: PINNED (...)` and exits 0 (scripts/anchor-truth.mjs line 702). The row omits it. Evidence E2. Fix: add `TRUTH: PINNED` to the row.

2. cite-check row, new parenthesis. It quotes `-> survived=0/16` and nothing else. The count is correct at 4e58bb0 (E19). But the same footer prints `survived=0/16` when the unmutated control fails (E20: `control=FAIL`, exit 0). A mutant whose code snippet does not match is counted as nomatch, is never run, and is not counted as a survivor (probe lines 61-62), so a nonzero nomatch would also leave `survived=0/16` looking clean. The 0/16 only means something together with `control=PASS nomatch=0`. Fix: quote the whole footer.

### Row omissions (not errors; fix so every flag is named)

3. anchor-truth entry command leaves out `--self DIR`, `--pin FILE`, `--src DIR`, `--reviews FILE` and `--json` (parseArgs lines 559-577; docstring lines 80-81). The row also does not say that under `--open` the round-open pin must have the same origin revision as the current pin; otherwise the gate fails closed with OPEN_INVALID (line 738).

4. wave-census entry command leaves out `--root DIR` (parser line 66; docstring line 36; usage line 52).

5. cite-check entry command does not say that `--fleet` defaults to the parent of `--self` (line 272). That default decides the verdict in a scratch clone (finding 9).

### Script defects found while checking (not row errors)

6. [medium] anchor-truth `--json` is not one JSON document. Without `--open`, stdout starts with a TRUTH_WARN line, then the JSON object, then a `TRUTH:` verdict line (lines 643-645 and 741-753). Parsing the whole stdout as JSON fails (E7). cite-check `--json` is a single document. A round-38 report used `--json` and read the verdict from the last line (E26), so this mismatch is already in use.

7. [low] scripts/anchor-truth.mjs contains two raw NUL bytes (lines 543 and 548), inside the key separator of compareOpen. `file` reports binary data. The lane's ripgrep-style search returns "No matches found" for `--open` and for `TRUTH_WARN`, although both are in the file (E9). Git still treats the file as text (E10). Fix: write the escape `\0` in both template literals. The runtime string is identical and the source becomes plain ASCII.

8. [low] The anchor-truth header "Findings" list (lines 40-50) omits BASE_TRUE_LOST. The code emits it at lines 505, 506 and 524, and the header itself names it at lines 83 and 532. The header also says DEBT_GREW and CHECKED_SHRANK are `--base` only (lines 46 and 49), but the `--open` floor emits them too (compareOpen calls compareBase, line 537). The row is right on both points.

9. [medium for scratch-clone runs] The cite-check verdict depends on where the clone sits, because the default fleet root is the parent of `--self`. In my scratch clone that parent is the seat directory, so 98 references to fleet documents show FLEET_MISSING, which is error severity (line 224). Result: `CITE_CHECK: DRIFT (files=96 tokens=9342 errors=713 warnings=541)` (E23). The R40-3 receipt recorded errors=545 at the real fleet root (E24). The script is byte-identical at 68db3419 and 4e58bb0 (E25), so the 168-error gap comes from the fleet scope and the documents scanned. I did not split it further. Gate runs happen in scratch clones by protocol, so these counts are not comparable unless `--fleet` is passed explicitly.

10. [info] wave-census has no `-h/--help`. `--help` prints "unknown argument: --help" and exits 64 (E16). cite-check accepts `-h/--help`.

11. [info] The wave-census header fail-closed list (lines 33-34) leaves out the case "carries no task list" (line 97).

### Checked and correct

- anchor-truth: every flag the row names exists and is parsed as named: `--base`, `--open`, `--write-pin`, `--notes` (comma list), `--selftest` (parseArgs lines 559-577). `--base` and `--open` are exercised by selftest cases AT07, AT08 and AT39 to AT42 (E8); I did not run `--base` from the CLI.
- anchor-truth: every finding the row names is emitted: BASE_TRUE_LOST (lines 505, 506, 524), DEBT_GREW (487, 493), CHECKED_SHRANK (488), DEBT_NEW (550), REVIEW_UNBOUND (447, 673), TRUTH_WARN (644-645), ANCHOR_TRUTH_SELFTEST (1171).
- anchor-truth `--open` semantics match the row and the header. The flag comes only from the command line (568). Review records are read at that revision (635-639). The pin at that revision is read with `git show` (734), and compareOpen runs (739). With `--open` there is no TRUTH_WARN line (E4); without it there is one (E3).
- anchor-truth exit map: 0 (E3, E4), 2 (E5), 64 (E6). Exit 1 was not produced from the CLI; the 42/42 selftest includes drift cases (E8).
- wave-census: the flags `--round`, `--expect`, `--json` and `--selftest` exist and behave as named. `--root` exists (finding 4).
- wave-census: all five findings the row names are emitted (lines 108, 115, 124, 137, 140). Observed in runs: STRAY_REPORT (E12), EXPECT_MISMATCH (E13), EXPECT_UNKNOWN (E14). COUNT_MISMATCH and REGISTRY_MISMATCH are exercised by selftest cases WC05 and WC06 (E11).
- wave-census exit map: 0 (E13, E15), 1 (E12), 2 (E16), 64 (E16). The verdict word `WAVE_CENSUS: CLEAN|DRIFT` matches line 160, and the selftest label `WAVE_CENSUS_SELFTEST: n/m` matches (E11).
- The checks that give the wave-census findings teeth read real data: all seven committed v1 payloads carry `counts.spawn` and `registry.members`, equal to their task counts (E17).
- S038 identity: the pinned producer's sha256 matches the lesson (E18), and the schema string matches the row.
- cite-check row: `--src`, `--strict` and `--selftest` exist (usage lines 229-240; parser lines 260-267). The verdict word matches, and the hermetic selftest passes 75/75 (E22).
- cite-check parenthesis: the probe path exists at 4e58bb0, and its 16 IDs equal the 16 IDs in the round-40 scout file, in the same order (E21).

## Residual risk and verification gaps

- The other seven gate rows were not checked; they are outside this item.
- The real fleet root was not used (rule: do not touch the fleet repo), so the 545 versus 713 gap is open.
- `--write-pin` was run once, only in the scratch clone. The pin came out byte-identical, and the file was restored anyway.
- Negative search results on anchor-truth.mjs are unreliable because of the NUL bytes. Every negative used in this report was re-checked on a NUL-free copy.

## Suggested row text (for the lead; I did not edit the lane)

- anchor-truth verdicts: `TRUTH: CLEAN|DRIFT|FAIL-CLOSED` in check mode, and `TRUTH: PINNED` after a successful `--write-pin`. List `--src`, `--self`, `--pin`, `--reviews` and `--json`, or say the command is partial.
- cite-check parenthesis: `-> CITE_MUTANTS survived=0/16 nomatch=0 crash=0 control=PASS`. Name `--fleet` and its default.
- wave-census entry command: add `[--root DIR]`.

## Tools and changes

- No tool was installed or updated. Node v24.21.0 (already present) was used as is; git and file were already present.
- No patch file: no lane code was changed.
- No subagents, and no background jobs left running.

## Evidence (commands and output, abbreviated)

E1 `git rev-parse HEAD` in the scratch lane -> 4e58bb0ee48a069ac7dbd99b6e5afe70dcd36ba3 (detached; `git status --short` empty at start).
E2 `node scripts/anchor-truth.mjs --write-pin` (scratch clone) -> `TRUTH: PINNED (notes=4 anchors=811 true=778 debt=20 unchecked=13 src-rev=31c465f15669)`, exit 0. `git status --short` empty afterwards; restored with `git checkout -- .ufo/pins/anchor-truth.json`; 0 changed files.
E3 `node scripts/anchor-truth.mjs` -> line 1 `TRUTH_WARN review sources are bound against the lane's current HEAD (4e58bb0ee48a), not a pinned round-open revision; pass --open REV to pin the record revision`; last line `TRUTH: CLEAN (notes=4 anchors=811 true=778 debt=20 unchecked=13 src-rev=31c465f15669)`, exit 0.
E4 `node scripts/anchor-truth.mjs --open a58b7f72afc1eb44b37e438a2f8b212c658874e5` -> no TRUTH_WARN line; last line `TRUTH: CLEAN (... open=a58b7f72afc1eb44b37e438a2f8b212c658874e5 src-rev=31c465f15669)`, exit 0.
E5 `node scripts/anchor-truth.mjs --open no-such-rev-zzz` -> `TRUTH: FAIL-CLOSED (OPEN_UNREADABLE no-such-rev-zzz)`, exit 2.
E6 `--bogus` -> `anchor-truth: unknown argument --bogus`, exit 64. `--open` with no value -> `--open needs a value`, exit 64. `--write-pin --notes` with no value -> `--notes needs a value`, exit 64.
E7 `node scripts/anchor-truth.mjs --json > out` (no --open) -> three lines: a TRUTH_WARN line, the JSON object, and `TRUTH: CLEAN (...)`. JSON.parse of the whole file -> `Unexpected token 'T', "TRUTH_WARN"... is not valid JSON`. With --open the shape is JSON then TRUTH line, and parsing fails at line 2, column 1.
E8 `node scripts/anchor-truth.mjs --selftest` -> `ANCHOR_TRUTH_SELFTEST: 42/42 pass`, `VERDICT: PASS`, exit 0.
E9 `LC_ALL=C awk` over the file -> NUL bytes at lines 543 and 548. `file scripts/anchor-truth.mjs` -> `a node script executable (binary data)`. Lane search on the real file for `--open` and `TRUTH_WARN` -> "No matches found". The same patterns on a NUL-free copy match at lines 81 and 643-645.
E10 Scratch clone: one-line append, then `git diff --stat` -> `1 file changed, 1 insertion(+)`. `git grep -c TRUTH_WARN 4e58bb0... -- scripts/anchor-truth.mjs` -> `...:2`.
E11 `node scripts/wave-census.mjs --selftest` -> WC01 to WC12 all PASS; `WAVE_CENSUS_SELFTEST: 12/12 pass`, `VERDICT: PASS`, exit 0.
E12 `node scripts/wave-census.mjs --round 38 --round 39 --round 40` -> `FINDING STRAY_REPORT round=38 wave=falsify .ufo/waves/round-38/falsify/Check21-supplement.md` (also Check49, Check52, Check71); `WAVE_CENSUS: DRIFT (rounds=3 waves=7 findings=4)`, exit 1.
E13 `--round 40 --expect build:mutation-tester=4` -> `FINDING EXPECT_MISMATCH round=40 wave=build build:mutation-tester=4 payload=3`, exit 1. With `=3` -> exit 0.
E14 `--round 40 --expect residual:critic=1` -> `FINDING EXPECT_UNKNOWN round=- wave=residual residual:critic=1`, exit 1.
E15 `--round 40 --json` -> parses: contract `kumitate-wave-census-v1`, verdict CLEAN, 0 findings, exit 0.
E16 `--bogus` -> `unknown argument: --bogus`, exit 64. `--help` -> `unknown argument: --help`, exit 64. No --round -> exit 64. `--round 99` -> `fail-closed — round dir ... is missing`, exit 2. `--root /nonexistent --round 40` -> exit 2.
E17 Committed payloads, rounds 38 to 40 (seven v1 files): `counts.spawn` = number of registry members = number of tasks (round-40 build 32/32/32; round-39 falsify 37/37/37). The round-39 residual payload is bare (no counts, no registry) and is handled.
E18 Pinned producer `scripts/ufo-swarm-wave.mjs` sha256 `1d33a03ffb204bc499310589199590d305b677fbe4fb2dfdb924f7c0f5f09d0a` (matches the S038 identity in the lesson). Line 136: `SWARM_DISPATCH_SCHEMA = "ufo-swarm-wave-dispatch-v1"`.
E19 Probe at 4e58bb0 (`node --input-type=module - --lane <scratch lane> --rev 4e58bb0... < cite-verdict-mutants.mjs.txt`): `CONTROL unmutated PASS exit=0 cases=75/75`; 16 MUTANT lines, all killed; footer `CITE_MUTANTS survived=0/16 nomatch=0 crash=0 control=PASS rev=4e58bb0...`; exit 0; 15.6 s.
E20 Same probe with `KUMITATE_CITE_SELFTEST_INJECT_FAIL=1`: `CONTROL unmutated FAIL exit=1 cases=73/74 fail_lines=1`; footer `CITE_MUTANTS survived=0/16 nomatch=0 crash=0 control=FAIL rev=4e58bb0...`; exit 0.
E21 Probe file exists at 4e58bb0 (`git cat-file -e`). Its 16 IDs (probe lines 21-36) equal the 16 IDs on line 1 of `.ufo/waves/round-40/build/ScoutCiteVerdict.md`, in the same order.
E22 `node scripts/cite-check.mjs --selftest` -> `75/75 cases passed (hermetic)`, `VERDICT: PASS`, exit 0.
E23 `node scripts/cite-check.mjs --src /fast/scratch/hyaku/kumitate-pin/src` (scratch clone) -> `CITE_CHECK: DRIFT (files=96 tokens=9342 errors=713 warnings=541)`, exit 1. `--json` totals: FLEET_MISSING 98; `fleet` is the seat directory.
E24 `.ufo/waves/round-41/final/cite-receipt-r40-3.txt` lines 2-4 -> default `--fleet = the real fleet root`; `CITE_CHECK: DRIFT (files=95 tokens=9319 errors=545 warnings=474)`.
E25 `git rev-parse` of scripts/cite-check.mjs at 68db3419 and at 4e58bb0 -> the same blob 9503be8, 135405 bytes in both.
E26 `.ufo/waves/round-38/falsify/Check74.md` line 7 -> a read-only run of `anchor-truth.mjs --json`, recorded as `total=...`, `findings:[]`, `TRUTH: CLEAN`; the verdict came from the trailing line.
