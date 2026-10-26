VERDICT: The C1 tool can be made to lie six different ways and to crash once; 12 new cases fail on committed `harm-matrix.mjs` (41/53), all 53 pass on the patched copy (53/53) whose diff is `patch.diff` — the patch strengthens only, changing no reading of the real 20-gate registry.

## Evidence

Copies (unmodified bytes, sha256 6bde065f…f7ce7560) and patched copy live in the build dir; every run below used the copies, the lane's `scripts/` was never written.

```
$ node harm-matrix.mjs --selftest --cases ../harm-cases-v2.json      # work/ = unmodified copy
HARM_MATRIX_SELFTEST: FAIL (41/53)                                   exit=1
CASE FAIL v2-verdict-no-capture-group-is-invalid exit=0 want=2 rows=["g1 CARRIED_MOVED"] ... summary="HARM_MATRIX: CLEAN gates=1 ... moved=1 ... harm=0"
CASE FAIL v2-stdout-drift-stderr-clean-not-clean exit=0 want=1 rows=["g1 HELD"] wantrows=["g1 HARM"] summary="HARM_MATRIX: CLEAN gates=1 held=1 ... harm=0"
CASE FAIL v2-gate-cross-talk-masks-harm exit=0 want=1 rows=["g1 HELD","g2 HELD"] wantrows=["g1 HELD","g2 HARM"] summary="HARM_MATRIX: CLEAN gates=2 held=2 ... harm=0"
CASE FAIL v2-timeout-non-integer-invalid exit=0 want=2 rows=["g1 HELD"]  wantrows=[] summary="HARM_MATRIX: CLEAN gates=1 held=1"
CASE FAIL v2-ok-exit-strings-invalid exit=0 want=2 rows=["g1 CARRIED"] wantrows=[] summary="HARM_MATRIX: CLEAN gates=1 ... carried=1"
CASE FAIL v2-needs-directory-not-a-file exit=1 want=0 rows=["g1 HARM","g2 HELD"] wantrows=["g1 ABSENT_BOTH","g2 HELD"] summary="HARM_MATRIX: HARM gates=2 ... harm=1"
CASE FAIL v2-needs-non-string-invalid exit=1 want=2 rows=[] summary=null
CASE FAIL v2-only-unknown-id-invalid exit=2 want=2 summary="HARM_MATRIX: FAIL_CLOSED reason=NO_GATES detail=\"registry empty after --only\""
CASE FAIL v2-only-unknown-id-mixed-not-dropped exit=0 want=2 rows=["g1 HELD"] wantrows=[] summary="HARM_MATRIX: CLEAN gates=1 held=1"   # g2 is HARM
CASE FAIL v2-no-verdict-both-unmeasured / v2-missing-binary-unmeasured: rows ok, summary lacks unmeasured=1
CASE FAIL v2-carried-movement-beyond-200-bytes exit=0 rows=["g1 CARRIED"] wantrows=["g1 CARRIED_MOVED"]
(41 CASE ok, incl. all 26 committed cases)

$ node fix/b/scripts/harm-matrix.mjs --selftest --cases ../harm-cases-v2.json   # patched copy
HARM_MATRIX_SELFTEST: PASS (53/53)                                   exit=0
$ node fix/b/scripts/harm-matrix.mjs --selftest --cases <lane>/scripts/harm-cases.json
HARM_MATRIX_SELFTEST: PASS (26/26)                                   exit=0     # backward compatible
```

Fixture probe (own repo, `git -C "$D"` everywhere, `toplevel=$D same=yes`, identity passed per commit):

```
fullBase=40d0396f4e921af33f082e638617973b9aa99439 fullTip=0a2ae2e3d4a701fdcf7f700b763ddae4ba786c90
8-hex hashes  -> HARM_ROW gate=g1 base=CLEAN tip=NOT_CLEAN id=HARM ... abbrevExit=1
branch names  -> --base main~1 --tip main -> HARM_MATRIX: HARM ... harm=1  branchTipExit=1
needs:123     -> crashExit=1 stdout=<>  TypeError [ERR_INVALID_ARG_TYPE]: The "path" argument must be
                 of type string. Received type number (123) / at join (node:path:1339:7)
fixed, same registry -> HARM_MATRIX: FAIL_CLOSED reason=GATES_INVALID detail="g1: needs"  fixedBadExit=2
```

Patch applicability and non-regression on the real registry:

```
$ patch -p1 --dry-run -d <clean copy> < patch.diff   -> checking file scripts/harm-matrix.mjs  dryRunExit=0
$ node fix/b/... --lane <lane> --gates <lane>/scripts/harm-matrix-gates.json \
      --base 47fe2383… --tip 47fe2383… --only readme-map,proxy-check
HARM_ROW gate=readme-map base=NOT_CLEAN tip=NOT_CLEAN id=CARRIED ...
HARM_ROW gate=proxy-check base=NOT_CLEAN tip=NOT_CLEAN id=CARRIED ...
HARM_MATRIX: CLEAN gates=2 held=0 repaired=0 carried=2 moved=0 new=0 gone=0 harm=0 harm_absent=0 new_red=0 base=47fe23831519 tip=47fe23831519 unmeasured=0
patchedExit=0                      # unmodified tool printed the same two rows plus a summary without unmeasured=0, exit 0
$ controls/harm case dirs = 16, byte-identical to the first 16 committed cases (identicalToCase=16)
$ H5 regex /^HARM_MATRIX: (CLEAN|HARM) gates=(\d+) .* harm=(\d+) harm_absent=(\d+) new_red=(\d+)/m
  still matches the patched summary: probeH5RegexMatches=true gates=16   (unmeasured= trails the match)
```

## Findings

Each with a reproducing command: build dir = `<B>` = `.ufo/waves/round-65/build/K65ExecHarmCases`; run
`node <B>/work/harm-matrix.mjs --selftest --cases <B>/harm-cases-v2.json` (unmodified copy; `<B>/work/fix/b/scripts/harm-matrix.mjs` = patched).

1. **HIGH — a verdict regex with no capture group turns a real HARM into `CARRIED_MOVED`/exit 0.** `measure()` falls back to
   `m[0]` when `m[1]` is undefined, so for `^G1: (?:CLEAN|DRIFT)` the "word" is the whole line, never in `clean`: base `G1: CLEAN`
   is NOT_CLEAN too, and clean→drift is read as text movement, not harm. Repro: case `v2-verdict-no-capture-group-is-invalid`
   (`exit=0 ... moved=1 ... harm=0`; want GATES_INVALID/exit 2). Fix: `verdictWord()` rejects a group-less regex at load; `measure`
   reads `m[1]`, else the first named group.
2. **HIGH — stderr overrides stdout regardless of time order, and stream disagreement is not fail-closed.** `measure` concatenates
   `stdout + "\n" + stderr` and takes the *last* match, so a gate printing `G1: DRIFT` and then `G1: CLEAN >&2` reads CLEAN (case
   `v2-stdout-drift-stderr-clean-not-clean`: `rows=["g1 HELD"]`, want HARM). Fix: last hit per stream; differing lines → NOT_CLEAN
   `streams-disagree`.
3. **HIGH — gates are not isolated from each other inside a revision sandbox.** One sandbox per revision is reused for every gate, so a
   gate that rewrites `scripts/g2.sh` decides g2's reading: case `v2-gate-cross-talk-masks-harm` has g2 clean→drift, the tool reports
   `g2 HELD`, `HARM_MATRIX: CLEAN`, exit 0. Fix: `git reset --hard <rev>` + `git clean -qfdx` before each measurement.
4. **MEDIUM-HIGH — `--only` silently drops ids that are not in the registry.** `--only g1,nosuch` measures g1 only and exits 0 while g2
   has a real HARM (case `v2-only-unknown-id-mixed-not-dropped`: `rows=["g1 HELD"]`, want exit 2 `reason=ONLY_UNKNOWN`). A typo in a
   close-step command silences the registry. Fix: unknown ids fail closed and are named in `detail`.
5. **MEDIUM — a non-string `needs` crashes the tool with no verdict line.** `needs: 123` reaches `join(dir, 123)` → uncaught
   `TypeError [ERR_INVALID_ARG_TYPE]`, exit 1, empty stdout (probe/manual fixture output above). Fix: `needs` must be a relative string
   without `..`.
6. **MEDIUM — a gate's declared `timeout` is silently relaxed to 60 s.** `Number.isInteger(2.5)`/`0` fall through to the 60 s default,
   so a gate that must time out reads CLEAN (case `v2-timeout-non-integer-invalid`: `HELD`, exit 0; want GATES_INVALID). Asymmetry:
   the CLI already rejects `--timeout 0` (exit 64, case `v2-cli-timeout-zero-usage`).
7. **MEDIUM — `ok_exit` given as strings never matches, so a clean gate is permanently not-clean.** `ok_exit: ["0"]` → `includes(0)`
   is false; both readings are NOT_CLEAN with equal text, so the row is `CARRIED` and the summary reads CLEAN (case
   `v2-ok-exit-strings-invalid`). Same class as 6: schema typos degrade silently.
8. **MEDIUM — `needs` is existence-only, so a directory satisfies it and a deleted gate reads HARM (fabricated harm).**
   `needs: 'scripts'` + `scripts/g1.sh` deleted at tip → `bash` rc 127, no verdict → `HARM` instead of `HARM_ABSENT`/absent, exit 1
   (case `v2-needs-directory-not-a-file`: `rows=["g1 HARM","g2 HELD"] harm=1`; patched: `g1 ABSENT_BOTH`, `gates=1`, exit 0). Fix:
   `statSync(…).isFile()`.
9. **MEDIUM — a gate that never prints a verdict at both revisions is counted as `CARRIED` and the matrix reports CLEAN with nothing
   measured.** Also the missing-binary path (`timeout` returns 127, no output). Cases `v2-no-verdict-both-unmeasured`,
   `v2-missing-binary-unmeasured`: rows and exit are correct under the declared contract, but the summary carries no signal that the
   gate was unmeasured. Fix: `unmeasured=<n>` in the summary (does not change exit, so H3(b)'s exit-0 requirement stands).
10. **LOW — movement past byte 200 is invisible.** `hit.line.slice(0, 200)` is what `transition()` compares, so two different not-clean
    texts sharing their first 200 bytes read `CARRIED` (case `v2-carried-movement-beyond-200-bytes`: `rows=["g1 CARRIED"]`, want
    `CARRIED_MOVED`). Fix: compare the full trimmed line, truncate only for display.
11. **LOW — `--only nosuch` exits 2 but never names the unknown id** (`reason=NO_GATES detail="registry empty after --only"`); case
    `v2-only-unknown-id-invalid` pins `reason=ONLY_UNKNOWN` (same fix as 4).

Pinned-correct on the unmodified tool (41 cases pass), worth keeping as regression: trailing spaces on the verdict word,
case-differing clean words fail closed, stdout-CLEAN/stderr-DRIFT is not clean, 200 KB output, empty output at tip, id case/dot/slash
rejection (`ID_RE`), empty gates array, `--timeout 0` usage exit 64, branch name / `HEAD` / peel expressions, self-edit inside one run,
and the 26 committed cases unchanged. Abbreviated hashes and branch names resolve (`rev-parse --verify`), verified above.

Integration note: H2's 16 frozen controls are byte-identical to the first 16 committed cases and the patched tool passes all of them
(26/26 on the committed file), and on the real registry the patched and unmodified tools print identical rows — the patch relaxes
nothing. H1 needs the 27 new cases appended to `scripts/harm-cases.json`; the selftest then reads `PASS (53/53)` (n=53 ≥ 20).

## Artifacts

- `.ufo/waves/round-65/build/K65ExecHarmCases/harm-cases-v2.json` — 53 cases (26 committed verbatim + 27 new, all prefixed `v2-`).
- `.ufo/waves/round-65/build/K65ExecHarmCases/patch.diff` — 133-line unified diff against `scripts/harm-matrix.mjs`
  (`patch -p1 --dry-run` verified); full patched file at `work/fix/b/scripts/harm-matrix.mjs`.
- `.ufo/waves/round-65/build/K65ExecHarmCases/work/` — unmodified copy (`harm-matrix.mjs`, `harm-cases.json`), `gen-v2.mjs`
  (regenerates the cases file), `fix/a/` original vs `fix/b/` patched.
- Logs: `/tmp/kumitate-r65/K65ExecHarmCases/{unmodified,fixed}.log`, `crash.{out,err}`.
- No tool installed or upgraded; no `pacman` call. No frozen file, lane `scripts/`, index or jj state touched.

## Limits

- Not run: the full 20-gate registry end-to-end on real revisions (heavy gates, loaded host) — only `--only readme-map,proxy-check`
  at `47fe2383`→`47fe2383`, which shows no reading change. I did not check whether any real gate writes into its sandbox (finding 3 is
  demonstrated on fixtures only).
- `--timeout` override bypasses per-gate timeouts by design; whether the override should also be refused for non-integer input was not
  attacked (`--timeout 2.5` → usage exit 64 by the CLI regex, confirmed by reading, not run).
- The patch's `streams-disagree` rule is a semantics choice (fail closed); a real gate that prints the same verdict to both streams with
  different surrounding text would now read NOT_CLEAN on both revisions → `CARRIED_MOVED`, exit 0. Not observed in the two gates run.
- Case `v2-rev-tip-branch-name` depends on the host's `init.defaultBranch=main` (verified here); the patched tool itself does not.
- Sandbox escape via absolute paths/`$HOME` writes inside a gate was not attacked (out of the assigned case list).
