VERDICT: 30 single-point mutants of `harm-matrix.mjs` v2 (transition classifier, verdict-line parsing, sandbox setup, exit mapping): 23 killed by the frozen 114-case selftest, 5 coverage-gap survivors each killed by a new case (clean strengthening — pristine reads `PASS (119/119)` with all 5 appended), and 2 equivalent mutants (dead defensive code, no killing case constructible).
## Evidence

Baseline (pristine scratch copy, byte-identical to lane):

```
S=/fast/scratch/hyaku/kumitate-r66/K66MutHarmMatrix
cp scripts/{harm-matrix.mjs,harm-cases.json,harm-matrix-gates.json} $S/pristine/
sha256sum → ab123486e2fd753fc2df10d207b2d92a3759838bd3f31370402717de493f7c38 harm-matrix.mjs
             c964502d488a409d23ad860c730cbe5b204b8fc599ad12709449dc93b15d3365 harm-cases.json
cd $S/pristine && TMPDIR=$S/tmp0 node harm-matrix.mjs --selftest
→ exit=0, `HARM_MATRIX_SELFTEST: PASS (114/114)`, 114× `CASE ok`, 170s (build/K66MutHarmMatrix/baseline-selftest.log)
```

Mutants: 30 exact single-point source replacements (definitions + sha256 per mutant in `build/K66MutHarmMatrix/mutants-manifest.json`, unified diffs in `mutant-diffs.txt`), each in its own dir with a copy of `harm-cases.json`; one selftest run each (`TMPDIR=<own> node harm-matrix.mjs --selftest --cases harm-cases.json`), 3 concurrent, 1702s total:

```
exit=1 (KILLED, 23): E1-no-harmabsent E2-always-exit0 E3-allunmeasured-dead E4-nogates-dead
  E5-strict-gone-dead E9-text-clip-12 F1-loader-skip-dead S3-needs-escape-ok S4-dir-needs-ok
  S5-mkdtemp-outside-tmpdir T1-held-harm-swap T2-gone-harmabsent-swap T3-new-ok-dead T4-carried-swap
  T5-absentboth-dead T6-repaired-to-gone T7-harm-to-moved T8-newok-fallthrough V1-first-hit
  V2-no-hyphen-extend V3-earlier-bad-dead V4-utf8-check-dead V5-noverdict-notclean
exit=0 (SURVIVED, 7): E6-timeout-read-as-error S1-no-origin-removal S2-clean-keeps-ignored
  S6-stale-check-dead V6-signal-ignored V7-no-trailing-trim V9-tail-clip-3   (each `PASS (114/114)`)
```

Flake audit: no mutant's only failures are `ms=` (max_ms) failures — every kill is substantive.

Survivor killing (each: new case run standalone on pristine → `CASE ok` + `PASS (1/1)`; on the mutant → `CASE FAIL` + `FAIL (0/1)`; logs `kc-p-*` / `kc-m-*` in the build dir):

```
S1 ← kc-origin-removed            mutant rows=["g1 CARRIED"] want=["g1 HELD"] (gate saw the kept origin → LEAKED)
S2 ← kc-clean-x-ignored-leftovers mutant rows=["g1 HELD","g2 CARRIED"] (ignored/ state survived clean -qfd → g2 STALE)
V6 ← kc-signal-fail-closed        mutant text(g1) lacks "signal=SIGKILL" (verdict read despite SIGKILL death)
V7 ← kc-trailing-ws-trim          mutant exit=1 rows=["g1 HARM"] (trailing spaces defeated `^G1: (CLEAN)$` → no-verdict)
V9 ← kc-noverdict-tail-kept       mutant text(g1) lacks "last=\\\"G9-long-tail-abcdef\\\"" (tail line clipped to 3 chars)
```

Strengthening check — all 5 cases appended to the frozen corpus, pristine:

```
combined cases=119 → exit=0, 5× `CASE ok kc-*`, `HARM_MATRIX_SELFTEST: PASS (119/119)`
(log: combined-119-pristine.log; cases: survivor-killing-cases.json / combined-119-cases.json)
```

Restoration: lane `scripts/harm-matrix.mjs` and `scripts/harm-cases.json` re-hashed after all work — unchanged (`ab123486…`, `c964502d…`); scratch dir deleted. No tool installs or upgrades were needed (node v24.21.0 preexisting; no pacman/uv/npm usage).

## Findings

1. **K66MutHarmMatrix-1** (severity: medium, coverage) — selftest never checks that the sandbox clone's `origin` remote is removed (`grep -c remote scripts/harm-cases.json` → 0). Mutant S1 (drop `git(dir, ['remote','remove','origin'])`, harm-matrix.mjs:157) passes 114/114: gates run with the origin pointing at the lane. Killed by `kc-origin-removed` (gate: `git remote get-url origin && echo 'G1: LEAKED' || echo 'G1: CLEAN'`; mutant reads CARRIED/LEAKED, pristine HELD/CLEAN). Repro: apply the `S1-no-origin-removal` diff from `mutant-diffs.txt` to a scratch copy; `node harm-matrix.mjs --selftest` → PASS (114/114); `node harm-matrix.mjs --selftest --cases survivor-killing-cases.json` → FAIL on kc-origin-removed.
2. **K66MutHarmMatrix-2** (severity: medium, coverage) — the `-x` of `git clean -qfdx` (ignored-file removal between gate runs, harm-matrix.mjs:170/172) is untested. Mutant S2 (`-qfdx`→`-qfd`, both occurrences) passes 114/114: gate A's ignored leftovers leak into gate B's reading on the same revision clone (false CARRIED/STALE). Killed by `kc-clean-x-ignored-leftovers` (`.gitignore: ignored/`, g1 writes `ignored/state`, g2's verdict depends on its absence; mutant: g2 CARRIED). Repro: as finding 1 with the `S2-clean-keeps-ignored` diff.
3. **K66MutHarmMatrix-3** (severity: medium, coverage) — signal death is never exercised (`grep -c signal scripts/harm-cases.json` → 0). Mutant V6 (drop the `if (signal)` FAIL_CLOSED in `readingOf`, harm-matrix.mjs:210) passes 114/114: a gate that prints a verdict and dies by signal reads as NOT_CLEAN instead of FAIL_CLOSED (unmeasured accounting blind to it). Killed by `kc-signal-fail-closed` (tip gate: `echo 'G1: CLEAN'; kill -9 $$`; timeout(1) propagates SIGKILL; expect.text `signal=SIGKILL`). Repro: as finding 1 with the `V6-signal-ignored` diff.
4. **K66MutHarmMatrix-4** (severity: medium, coverage) — the trailing-whitespace trim (`replace(/\s+$/,'')`, harm-matrix.mjs:199) is untested for `$`-anchored verdict regexes. Mutant V7 (drop the trim) passes 114/114: `printf 'G1: CLEAN   '` defeats `^G1: (CLEAN)$` → no-verdict FAIL_CLOSED → **false HARM (exit 1)** — a false positive, not just mislabeled text. Killed by `kc-trailing-ws-trim`. Repro: as finding 1 with the `V7-no-trailing-trim` diff.
5. **K66MutHarmMatrix-5** (severity: low, coverage) — the no-verdict diagnostic tail (`tailLine`, sliced 120, harm-matrix.mjs:205) is untested. Mutant V9 (slice→3) passes 114/114: `no-verdict … last="…"` diagnostics truncate to uselessness. Killed by `kc-noverdict-tail-kept` (expect `last=\"G9-long-tail-abcdef\"` — note the row text is JSON-embedded, so the case must match the escaped form). Repro: as finding 1 with the `V9-tail-clip-3` diff.
6. **K66MutHarmMatrix-6** (severity: info, equivalent mutant) — S6 removes the `stale-checkout` guard (harm-matrix.mjs:161); no fixture can distinguish it: `revParse` resolves to a full commit hash and `checkout -q --detach <hash>` yields `HEAD == rev` by construction, so the guard is defensive dead code. Survivor, no killing case possible; not a coverage gap.
7. **K66MutHarmMatrix-7** (severity: info, equivalent mutant) — E6 reroutes the spawnSync `ETIMEDOUT` branch to FAIL_CLOSED (harm-matrix.mjs:231); unreachable for any gate: `timeout -k 2 T` bounds the direct child to ~T+2s, under the (T+8)s outer deadline, and ordinary timeouts exit via the rc 124/137 branch (harm-matrix.mjs:234) which the suite exercises. Survivor, no fixture-reachable killing case. The pipe-holder cases cover pipe stall, not this branch.
8. **K66MutHarmMatrix-8** (severity: info, positive) — 23/30 killed, including all 8 transition-classifier mutants and 5/8 verdict-parsing mutants: the frozen detector is strong on transition and exit mapping; the five gaps above are the residue.

## Artifacts

- `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-66/w1/K66MutHarmMatrix.md` (this report)
- `…/round-66/build/K66MutHarmMatrix/`: `survivor-killing-cases.json` (the 5 killing cases, harm-cases.json shape, appendable), `mutants-manifest.json` (30 mutants: area, exact old→new, sha256), `mutant-diffs.txt`, `mutant-results.tsv`, `kill-evidence.txt`, `combined-119-cases.json`, `combined-119-pristine.log`, `baseline-selftest.log`, `pristine-hashes.txt`, `restoration-evidence.txt`, `kc-p-*/kc-m-*` logs (pristine/mutant per killing case)

## Limits

- Not mutated (planned, dropped for runtime scope; each is a plausible further survivor): verdict regex `ok_exit` use (V8), rc-124 drop (E7), LOW_DISK check (E8; `low-disk-fails-closed` case exists so likely killed), ancestor flag (E10), registry digest length (E11; `registry=` appears in no case summary → probable survivor class), usage exit code (E12), `-`-skip in `deriveNeeds` (F2), unionRegistry and normText.
- The selftest harness itself was not mutated (it is the detector); mutants are runtime code only.
- Killing cases were verified standalone (pristine PASS, mutant FAIL) plus as one appended set on pristine (119/119); I did not re-run each mutant against the full 119-case file.
- Equivalence of S6/E6 is argued from git/timeout(1) semantics, not proven against pathological schedulable states (e.g. a D-state gate).
- The 2 `max_ms` cases are timing-sensitive; audit found no ms-only kills in this run, but a heavily loaded host could vary a re-run.
- Round-freeze counter/controls untouched; no lane write outside this seat's report and build paths.
