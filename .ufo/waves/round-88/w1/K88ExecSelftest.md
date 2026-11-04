# K88ExecSelftest — receipt-bind v2 selftest extension (round 88, w1)

Seat: executor, leaf. Lane HEAD at run time `8e4ea5f6503e4dccced9ffcfbf95c6882b7cc29b`; integrated
instrument `scripts/receipt-bind.mjs` at `0ff3562f15c18d0ca01dc6a76c9f827d30c26950`
(sha256 `098a6713e663cbb9444ea6ec1da503cbf4bba5690c492b5ec9e73f9ee6cace4d`, equals the worktree file).
Nothing committed, no lane/fleet history touched, no tools installed.

## Files changed (all under `.ufo/waves/round-88/build/K88ExecSelftest/`)

| file | what |
|---|---|
| `receipt-bind.mjs` | candidate, sha256 `1f11f124198fdb894265dc69a75efeca5fbf43d931209d227b2bc1b29e5880ea` |
| `make-mutants.mjs` | generates one mutant per v2 boundary (boundary line reverted to its exact v1 `7ac24afa` form) |
| `mutants/mutant-{no-escapes-lane,no-symlink-dir,no-too-large,no-ambiguous-field}.mjs` | generated mutants |
| `candidate-worktree-twin.mjs` | `controls/make-worktree-variant.mjs` applied to the candidate |
| `receipt.sh` | receipt wrapper (`rev=` lane HEAD, `tool_sha256=` sha256 of cmd token 2, `cmd=`, output, `exit=`, `signal=`) |
| `*.txt` | receipts (below) |
| `bind-build-dir-at-head.out` | receipt-bind over this build dir at HEAD (see Risks) |

## Behaviour

Only `runSelftest` changed: one inserted block of 65 lines (diff hunk `512a513,577`, 0 deletions;
receipt `diff-vs-integrated.txt`, `diff` exit=1 = files differ). `bind()`, `blobAt()`, `selftest()`,
USAGE, main and the output contract are byte-identical. Selftest goes from 39 to **59 arms** (+20):

- ESCAPES_LANE: `escapes-lane-relative` (`bash ../outside/tool.sh` → FAIL-CLOSED ESCAPES_LANE),
  `escapes-lane-interior-dotdot` (`scripts/../../outside/tool.sh`), `escapes-lane-among-clean`
  (one escaping receipt beside a clean one); twins `escapes-lane-twin-absolute-external` (same file,
  absolute token → `CLEAN matched=1 … external=1`), `escapes-lane-twin-dotdot-inside`
  (`scripts/../scripts/alpha.mjs` → `CLEAN external=0`).
- SYMLINK_DIR: `symlink-dir`, `symlink-dir-trailing-slash` (`link/`); twin `symlink-dir-twin-real-target` → CLEAN.
- RECEIPT_TOO_LARGE: `receipt-too-large` (1048577 bytes), `receipt-too-large-before-parse`
  (1048577 bytes that also carry a duplicate `cmd=` → size token wins, i.e. refused before parse);
  twin `receipt-too-large-twin-at-limit` (exactly 1048576 bytes → `CLEAN matched=1`). Sizes are
  asserted by lstat inside the selftest (fixture failure otherwise).
- AMBIGUOUS_FIELD: `ambiguous-cmd-differing`, `ambiguous-cmd-equal`, `ambiguous-tool-sha256`,
  `ambiguous-rev-equal`, `ambiguous-rev-differing`, `ambiguous-cmd-not-unchecked` (dup `cmd=` with
  no digest is AMBIGUOUS, not DRIFT unchecked), `ambiguous-among-clean`, `json-ambiguous-field`
  (`--json` token); twin `ambiguous-twin-single-fields` → `CLEAN matched=2`.

## Evidence (receipts in the build dir; scratch `/fast/scratch/hyaku/kumitate-r88/K88ExecSelftest`)

| receipt | command | result |
|---|---|---|
| `selftest-candidate.txt` | `node <B>/receipt-bind.mjs --selftest --work $S/st` | `RECEIPT_BIND_SELFTEST: PASS held=59/59` exit=0 |
| `selftest-integrated.txt` | `node <L>/scripts/receipt-bind.mjs --selftest --work $S/st-int` | `PASS held=39/39` exit=0 (baseline) |
| `probe-candidate.txt` | `node <L>/.ufo/waves/round-88/probe/probe88-c1.mjs --lane <L> --work $S/probe --rev 0ff3562f… --tool <B>/receipt-bind.mjs` | `C88_C1: HELD held=20/20` exit=0 |
| `selftest-mutant-no-escapes-lane.txt` | mutant selftest | `FAIL held=56/59` exit=1 (the 3 ESCAPES_LANE negatives read CLEAN; twins still ok) |
| `selftest-mutant-no-symlink-dir.txt` | mutant selftest | `FAIL held=57/59` exit=1 (both SYMLINK_DIR negatives read CLEAN) |
| `selftest-mutant-no-too-large.txt` | mutant selftest | `FAIL held=57/59` exit=1 (oversize → CLEAN; oversize+dup → AMBIGUOUS_FIELD) |
| `selftest-mutant-no-ambiguous-field.txt` | mutant selftest | `FAIL held=51/59` exit=1 (all 8 ambiguity arms fail; twin ok) |
| `probe-candidate-worktree-twin.txt` | frozen probe, `--tool <B>/candidate-worktree-twin.mjs` | `C88_C1: UNMET held=11/20` exit=1 — below the kill line |
| `diff-vs-integrated.txt` | `diff <L>/scripts/receipt-bind.mjs <B>/receipt-bind.mjs` | exit=1, 65 `>` lines, 0 `<` lines |
| `obs-parent-symlink-dir.txt`, `obs-dir-itself-symlink.txt` | see Risks | exit=0 CLEAN / exit=2 SYMLINK_DIR |

`<L>` = `/home/vgpnk/Projects/shokunin/kumitate-shokunin`, `<B>` = `<L>/.ufo/waves/round-88/build/K88ExecSelftest`.
Every receipt carries exactly one `rev=`, one `cmd=`, one `tool_sha256=` (checked by grep count).
Each mutant's positive twins still hold, so each twin is independent of the boundary it pairs with
and each negative is what kills its mutant.

## Risks / observations (no bind() change made)

1. **Build-dir receipts do not yet bind.** `rev=` is the lane HEAD at run time (`8e4ea5f6…`), where
   the candidate, mutants and twin are untracked; `receipt-bind --dir <B> --rev HEAD` reads
   `FAIL-CLOSED UNRESOLVED selftest-candidate.txt instrument absent at 8e4ea5f6…`
   (`bind-build-dir-at-head.out`, exit 2). That is the correct verdict for untracked instruments, not
   a defect. The `tool_sha256=` values equal `sha256sum` of the committed files once the L1 commits
   them, but a receipt's own `rev=` pins HEAD, so these receipts must not be fed to the close
   battery's bind as-is; only `selftest-integrated.txt`, `probe-candidate.txt`, `diff-vs-integrated.txt`
   and the two `obs-*` receipts name instruments present at `8e4ea5f6`.
2. **SYMLINK_DIR covers only the final path component** (as the plan's wording, "`--dir` is itself a
   symlink", defines it). Repro: `real/rc/a.txt` a valid receipt, `plink -> real`;
   `receipt-bind --dir plink/rc` → `CLEAN matched=1` exit 0 (`obs-parent-symlink-dir.txt`), while
   `--dir plink` → `FAIL-CLOSED SYMLINK_DIR` (`obs-dir-itself-symlink.txt`). Declared-limit
   candidate for the doc header, not a contract violation; I did not add a selftest arm asserting
   either behaviour.
3. Fields are matched only at column 0 (`^cmd=`); an indented ` cmd=` line is neither a field nor a
   duplicate. Consistent with v1, noted only.

## Checks for the L1 after integration

`node <L>/scripts/receipt-bind.mjs --selftest --work <S>` (expect `PASS held=59/59`), the frozen probe
at M (expect 20/20), the worktree twin at M (expect < 20/20), and the census validate.

Scratch `/fast/scratch/hyaku/kumitate-r88/K88ExecSelftest` removed before yield.
