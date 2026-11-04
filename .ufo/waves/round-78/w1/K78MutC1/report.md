# K78MutC1 — C1 literal mutation battery

Axes: operability + coverage:kimi-layer.

## Result

`MUTANTS78_C1: ALL-KILLED killed=8/8`, exit 0, 204.14 seconds.
The same twelve-arm counter ran on pristine bytes, each single-literal mutant, and each exact restoration. Pristine and all eight restorations returned `C78_C1: HELD held=12/12`, exit 0. All eight mutants returned exit 1. The counter's selftests arm runs both tools' `--selftest`; no custom assertion serves as the detector.

Evidence, relative to the lane:
- `.ufo/waves/round-78/build/K78MutC1/mutants-c1.mjs` — eight frozen literal edits, `--lane DIR`, unique-anchor checks, detector digest guard, exact restoration and scratch-copy cleanup.
- `.ufo/waves/round-78/build/K78MutC1/battery-standin.txt` — actual pristine/mutated/restored outputs and before/mutated/after hashes.
- `.ufo/waves/round-78/build/K78MutC1/standin-evidence.tar` — stand-in census, proxy and scorecard bytes.
- `.ufo/waves/round-78/build/K78MutC1/counter-digest-refusal.txt` — initial refusal when the named frozen counter changed externally.

## Counter qualification

The task initially named SHA256 `aa00be37a46afdf02b68f47ed774094eb9297dbc5707089313e2915da9e652cf`. That digest was observed before running. The canonical counter subsequently changed externally to `5e9d9d4f237cbcb470f27d442b4c014e3ec359b1bdef7b2fa120421c3d19c4ed`: `checkAxesCrosscheck` now selects `f.key === 'coverage_kimi'` rather than `f.term === 'coverage_kimi'`. The runner refused the initial attempt, exit 2, before applying any mutation. This was routed to Main. Its expected digest was then changed externally to the latter digest. The successful battery above measures **the corrected counter**, not the original aa00be37 counter; do not cite this as an aa00be37 result. This seat did not edit either probe.

## Stand-in construction

Archived scaffolding commit `ad2630d0566a561ee078f47fade5644a22c10621` into owned scratch, copied the executor's then-current census/proxy implementations read-only, and added `K_findings=0` plus matching script pins to the stand-in scorecard only. This is a provisional executor snapshot, not a claim about final integrated bytes. No lane source, sibling build, probe, git index or commit was modified by this seat.

Unmutated census SHA256: `7ea6b793028e2918ca920f0a5d225382bf687740d4cbee4545db963e50572439`.
Unmutated proxy SHA256: `12391b3e090c0d0773cc6db44795703a23d602d8255b83a8bdd037a7df947013`.
Each after hash equalled its corresponding unmutated hash exactly.

| Mutant | Mutated held | Representative semantic detector | Mutated SHA256 |
|---|---|---|---|
| findings-zero | 6/12 | mode/stray/missing terms report findings 0 rather than 1 | `3c091b88caa1e577647d5607f723168a5242c9f9e213d410ad9dd787778df699` |
| drop-findings-factor | 6/12 | old sections numerator yields coverage 10 instead of 9 | `0231f52e70c1aeb7f0274887cabe767a6c7b2655889eaf9cdb60cf0eb9c11167` |
| members-numerator | 6/12 | members numerator yields coverage 10 instead of 9 | `2fac65c02bfc79460e84cdd1e390f4c735c007e44d2b1d918e963c95e353f0a5` |
| census-no-findings | 5/12 | mode census incorrectly exits 0; proxy findings vanish | `f39d8281a912a6e03e0d7a38abe3ecda7c36bc0d70019b6e77cb48a5e8f64181` |
| private-member-rule | 6/12 | single-derivation sees K_MEMBER_RULES; clean member count becomes 56 | `727f1f1bc672d827ff810416ebb3195fd6763605ee9ba2ef29bc1e382c0960bb` |
| stanza-findings-no-delta | 7/12 | stanza-tamper lacks K_FINDINGS_DRIFT; selftest finding-kind coverage fails | `7eadb9a51d01f0dbeff3575fe017514922251d03eb20363edb1cbc693ef5f8ec` |
| ignore-mode-floor | 7/12 | mode census exits 0; proxy computes findings 0 / coverage 10 | `7f9573fbbafb717979119ce3c3a9f2695fae626d5ac35638d92a2179dcde1ec0` |
| hardcoded-members-55 | 8/12 | missing-region arm reports 55 members instead of 54 | `cd4e061b443a46c7f599ed4ec6dae4ac964b3f2927289cd93dc3f6f562f1e7c5` |

All verdicts: killed. No survivor, nomatch or detector crash in the completed battery. Pin drift also rejects mutated script bytes, but every mutant additionally fails a relevant semantic arm, as recorded above; the evidence is not solely a hash-pin kill.

## Re-run on final bytes

`node .ufo/waves/round-78/build/K78MutC1/mutants-c1.mjs --lane /absolute/path/to/final-lane`

The runner accepts only the corrected digest above. Different final implementation literals produce `nomatch`, not a kill; baseline/restoration failure produces an explicitly inconclusive `crash`. Scratch is isolated under `/fast/scratch/hyaku/kumitate-r78/K78MutC1/`; fixtures are created only by the unchanged counter/tool selftests. Main must re-run the same list on final bytes. No tools installed or updated.

Self-evaluation: accuracy 4 (corrected counter qualification is essential); completeness 4 (stand-in measured, final integration belongs to Main); clarity 4 (raw receipt is intentionally verbose); actionability 5 (ready re-run command and frozen anchors); conciseness 4 (hash table retained for restoration evidence). No release or invariant judgment is made.
