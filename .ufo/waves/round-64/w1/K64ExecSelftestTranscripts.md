VERDICT: All 26 `--selftest` suites (25 at base `6825a514`, plus `report-receipt-diff.mjs` at the frozen tip `dd1a3e6`) were run in scratch `git archive` extractions and their verbatim transcripts, exit codes and tally lines are committed under `build/K64ExecSelftestTranscripts/` — every run exit 0, every tally self-consistent; of 33 present-tense prose tallies 29 MATCH and 4 MISMATCH (stale by suite growth: cap-run 10→12, receipt-attest 27→51, readme-map 14→16 twice), two further historical stamps re-run and matched, and 0 of the 33 names a committed transcript — routed defect D2 is now measured, not asserted.

## Evidence

E1 — the suite set (base vs frozen tip; `report-receipt-diff.mjs` is the only addition):

```
$ git archive 6825a514… | tar -x -C …/arch ; grep -l -- '--selftest' arch/scripts/*.mjs arch/scripts/*.sh | wc -l
25
$ grep -l -- '--selftest' arch-frozen/scripts/*.mjs arch-frozen/scripts/*.sh | wc -l
26
$ grep -rl -- '--selftest' scripts/ | wc -l          # live working tree (== dd1a3e6)
26
$ for f in scripts/*.mjs scripts/*.sh; do grep -q -- '--selftest' "$f" || echo "$f"; done
scripts/cap-spawn.mjs          # helper, declared "exercised by every routed site's --selftest" (SKILL.md:617)
scripts/jj-seat-demo.sh        # C2's demo; J6 re-runs it, it has no --selftest of its own
```

E2 — the sweep. Each script run as `(cd <arch> && node|bash scripts/<s> --selftest)` with a 900 s timeout; stdout+stderr captured verbatim to `transcripts/<s>.txt`, exit code to `transcripts/<s>.exit` and `index-base.tsv` / `index-frozen.tsv`. **All 51 sweep runs exit 0** (25 base + 26 frozen); the `e5ffcbe` re-run in E4 also exits 0. Observed tally lines (base `6825a514`; the last row is frozen-tip only):

```
anchor-truth.mjs               ANCHOR_TRUTH_SELFTEST: 44/44 pass
bind-oracle.mjs                BIND_ORACLE_SELFTEST: 7/7 pass
cap-run.mjs                    CAP_RUN_SELFTEST: 12/12 pass
cite-check.mjs                 76/76 cases passed (hermetic)
cite-sources.mjs               CITE_SOURCES_SELFTEST: PASS (8/8)
claims-check.mjs               CLAIMS_SELFTEST: 47/47 pass
counter-pins.mjs               COUNTER_PINS_SELFTEST: PASS (11/11)
counter-rerun.mjs              COUNTER_RERUN_SELFTEST: PASS
dispatch-evidence.mjs          DISPATCH_EVIDENCE_SELFTEST: PASS (8/8)
gate-mutants.mjs               GATE_MUTANTS_SELFTEST: 41/41 pass leftovers=0
inline-dispatch-evidence.mjs   INLINE_DISPATCH_SELFTEST: PASS (69/69)
kimi-census.mjs                KIMI_CENSUS_SELFTEST: 54/54 pass
make-dispatch-actual.mjs       MAKE_DISPATCH_ACTUAL_SELFTEST: PASS (11/11)
omp-census.mjs                 VERDICT: PASS (29 cases)
plan-before-ready.sh           PLAN_BEFORE_READY_SELFTEST: PASS (10/10)
proxy-check.mjs                PROXY_SELFTEST: 122/122 pass
readme-map.mjs                 README_MAP_SELFTEST: PASS (16/16)
receipt-attest.mjs             ATTEST_SELFTEST: PASS (51/51)
receipt-evidence.mjs           RECEIPT_EVIDENCE_SELFTEST: PASS (10/10)
round-gate.mjs                 ROUND_GATE_SELFTEST: 61/61 pass
source-capture.mjs             SOURCE_CAPTURE_SELFTEST: PASS (13/13)
source-dupes.mjs               SOURCE_DUPES_SELFTEST: PASS (12/12)
sources-check.mjs              SOURCES_SELFTEST: 46/46 pass
surface-probe.mjs              46/46 cases passed
wave-census.mjs                WAVE_CENSUS_SELFTEST: 32/32 pass
report-receipt-diff.mjs        REPORT_RECEIPT_SELFTEST: PASS (20/20)      [frozen tip dd1a3e6]
```

E3 — the D2 tally itself, corroborated line by line (not just by its own summary):

```
$ wc -l < transcripts/inline-dispatch-evidence.mjs.txt      → 70
$ grep -c '^PASS ' transcripts/inline-dispatch-evidence.mjs.txt → 69
$ tail -1 transcripts/inline-dispatch-evidence.mjs.txt
INLINE_DISPATCH_SELFTEST: PASS (69/69)
```

22 of the 26 suites print one line per case and in every one the case-line count equals the printed numerator, 0 `FAIL` lines. Three print only a tally carrying a count (`claims-check` 47/47, `kimi-census` 54/54, `report-receipt-diff` 20/20 — whose whole transcript is that single line); `counter-rerun` prints `PASS` with no count.

E4 — the prose audit (`calibration.tsv`, 42 rows; table rendered in `calibration.md`):

```
rows 42 {'MATCH': 31, 'MISMATCH': 4, 'STALE-IF-CURRENT': 1, 'UNFALSIFIABLE': 4, 'N/A': 2}
```

MISMATCH rows (claimed → observed, both quoted from the transcripts):

```
corpus/QUALITY.md:884  README_MAP_SELFTEST: PASS (14/14)   → README_MAP_SELFTEST: PASS (16/16)
corpus/QUALITY.md:886  "the gate's 14-case hermetic selftest" → 16 cases
SCORECARD.md:1783      CAP_RUN_SELFTEST: 10/10 pass        → CAP_RUN_SELFTEST: 12/12 pass
SCORECARD.md:1788      ATTEST_SELFTEST: PASS exit 0 (27 cases) → ATTEST_SELFTEST: PASS (51/51)
```

Historical stamp verified, not assumed: `corpus/QUALITY.md:358` and `:365` claim `GATE_MUTANTS_SELFTEST: 28/28 pass` at `e5ffcbe` — re-ran `gate-mutants --selftest` in a `git archive e5ffcbe` extraction: `GATE_MUTANTS_SELFTEST: 28/28 pass leftovers=0`, `VERDICT: PASS`, exit 0 (`transcripts/gate-mutants.mjs.at-e5ffcbe.txt`). MATCH at its stamp; the live suite is 41/41.

E5 — no lane file was touched: `git -C …/kumitate-shokunin diff --stat` is empty (0 lines); `git status --porcelain` lists only the round-64 dispatch/build paths that were already untracked before this seat started.

## Findings

**K64ExecSelftestTranscripts-1** — *MEDIUM (calibration, D2 class)*. `corpus/QUALITY.md:884` states `README_MAP_SELFTEST: PASS (14/14)` and `:886` "the gate's 14-case hermetic selftest". The suite is 16 cases at the base revision and has been since round 58 (`SCORECARD.md:2762` records "selftest 16/16"): readme-map v2 added two cases and Q48's Command line was never updated, while `SKILL.md:624` and `SCORECARD.md:1794` were. Repro: `cd …/build/K64ExecSelftestTranscripts/arch && node scripts/readme-map.mjs --selftest` → `README_MAP_SELFTEST: PASS (16/16)`.

**K64ExecSelftestTranscripts-2** — *MEDIUM (calibration; also an inter-document contradiction)*. `SCORECARD.md:1783` states `CAP_RUN_SELFTEST: 10/10 pass`; `SKILL.md:612` states 12/12; observed 12/12. The capability row is stale by the two round-50 root-bind arms and contradicts the gate registry. Repro: same command with `scripts/cap-run.mjs --selftest` → `CAP_RUN_SELFTEST: 12/12 pass`, `VERDICT: PASS`, exit 0.

**K64ExecSelftestTranscripts-3** — *MEDIUM (calibration)*. `SCORECARD.md:1788` states `ATTEST_SELFTEST: PASS exit 0 (27 cases)`; observed `PASS (51/51)`; `SKILL.md:618` states "51 hermetic cases". The row's case count froze at the round-51 figure and did not follow the round-53 v3 arms (+24). Repro: `scripts/receipt-attest.mjs --selftest`.

**K64ExecSelftestTranscripts-4** — *LOW-MEDIUM (frozen counter; reported, not patched)*. `scripts/report-receipt-diff.mjs --selftest` prints exactly one line (`:153`), and C1's check P1 accepts it by regex alone — `probe/receipt64-probe.mjs:90`: `s.status === 0 && !!m && m[1] === m[2] && Number(m[1]) >= 20`. Demonstrated: a committed one-line stub (`stubp1/report-receipt-diff.stub.mjs`) in a `/tmp` fixture repo at the frozen tree makes the frozen probe read `RECEIPT64_UNMET held=2/5 checks=5 rev=7c3c62d2… rule=R64 | P2 MISS … | P3 MISS … | P5 MISS report-not-given`, exit 1 — i.e. **P1 (and P4) pass on a tool with zero cases**. P4 passes vacuously there because both stubs "fail" only because the harness cannot run at all. So P1's `20/20` is self-asserted, and the only thing stopping this stub is P2/P3/P5 behaviour. Repro: `bash …/build/K64ExecSelftestTranscripts/rerun.sh` (recreates the fixture and the receipt `stubp1/probe-p1-stub.txt`). Ratchet proposal (strengthening, for the L1, not applied): have the tool print one line per case and make P1 count `PASS` case lines against N — the shape 22 of the 26 suites already have.

**K64ExecSelftestTranscripts-5** — *LOW (how D2's fix must be committed)*. 16 of the 25 base transcripts are byte-identical to the frozen-tip run of the same bytes; **9 are not**, differing only in `mkdtemp` names, wall-clock digits (cap-run) and one fixture commit id (`cite-check` line 7: `pin cb7b2685…` vs `pin f34b7e46…`, `resolved-by-git`). A committed transcript therefore cannot be verified by whole-file sha256 replay; bind the **tally line + exit code** (as `observed.tsv` does) or normalise `/tmp/*-selftest-*` names. Evidence: `stability.tsv`.

**K64ExecSelftestTranscripts-6** — *INFO (unfalsifiable prose)*. Four live registry rows state a placeholder instead of a tally — `SKILL.md:608` `ANCHOR_TRUTH_SELFTEST: n/m`, `:609` `WAVE_CENSUS_SELFTEST: n/m`, `:610` `GATE_MUTANTS_SELFTEST: n/m`, `:616` `BIND_ORACLE_SELFTEST: n/7 pass` — so no prose number can be wrong there. Observed: 44/44, 32/32, 41/41, 7/7.

**K64ExecSelftestTranscripts-7** — *INFO (D2 quantified)*. **0 of the 33 present-tense tallies names a committed selftest transcript.** The only three live lines that name a committed `.txt` name *counter* receipts, not suite runs: `SCORECARD.md:1782` (`.ufo/waves/round-44/final/p44-measured-d81978cd.txt`), `:1783` (`.ufo/waves/round-46/close/o2-c1.txt`), `:1787` (`r48/L1-c2-binding-ce9aee5d.txt`). The assignment's example pattern `25 -> 69` occurs in none of the five docs; `LOG.md:2304` and `SCORECARD.md:1798` state only the terminal `69-case`/`69/69`, and both MATCH. 105 further selftest-adjacent numeric lines are past-round records (LOG.md 46, SCORECARD.md 54, corpus/README.md 4, SKILL.md 1) or another lane's `drift-pins.sh` (SCORECARD.md:64/66).

## Artifacts

All under `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-64/build/K64ExecSelftestTranscripts/` (116 files hashed in `MANIFEST.sha256`):

- `transcripts/*.txt` (26, verbatim) + `transcripts/*.exit`; `transcripts-frozen/*.txt` (26) + `*.exit`
- `index-base.tsv`, `index-frozen.tsv` (script, exit, ms), `observed.tsv` (tally line + sha256 + path), `stability.tsv`
- `calibration.tsv` (42 rows), `calibration.md` (method + rendered table + aggregates)
- `stubp1/` — `report-receipt-diff.stub.mjs`, `probe-p1-stub.txt`, `fixture-rev.txt` (finding -4)
- `rerun.sh` (reproduces everything, read-only on the lane), `extract-observed.py`, `build-calibration.py`, `gen-md.py`

The two `git archive` extractions (`arch/`, `arch-frozen/`) were the run locations and were **deleted after the sweep**:
each was 176 MB because the archive carries the lane's own `.ufo/`, and both are byte-reproducible from the two commits
by `rerun.sh` steps 1–2. Total directory size is 620 KB; `MANIFEST.sha256` covers all 116 remaining files.

## Limits

- One serial run per suite per revision; no load/parallel re-run, so a flaky suite would not have shown. `cap-run`/`bind-oracle` need a user systemd manager and bwrap — both passed on this host.
- Only `e5ffcbe` was re-run among the historical stamps; the other 105 historical lines were classified, not verified at their revisions.
- The audit checks that a printed numerator equals the printed case lines, not that the cases test what they claim — that is `gate-mutants`' surface. No mutant was applied to any suite here.
- P2/P3/P5 of the frozen C1 counter were not attacked beyond the P1 stub demonstration (K64ExecReceiptForge's surface); `scripts/jj-seat-demo.sh` has no `--selftest`, so it is outside this sweep (J6 is its check).
- The archives were extractions under `build/`, not committed trees, and were removed after the sweep (see Artifacts); the transcripts, not the trees, are the evidence.
