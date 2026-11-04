# K85ExecFixture — independent regression driver for C1 (`counter-receipt` v2)

Seat: executor (leaf). Lane `kumitate-shokunin`; measured at freeze
`9db0c6b5eb9111cfc5581006ba976ca2cd112792` (lane HEAD, unchanged through every run; each receipt
names `tool_head`). Base `a5d3e7549501ae76dbd86a6f81c5e858f1f92446` and repair
`6663b3beb4b5bd30e766e9c01f6ba4db24f5c5e8` were read-only references. No installs. No production
file, frozen plan/probe, control, SCORECARD/LOG/corpus edit; no build, lint or test on the shared
tree; no git/jj mutation.

## Deliverable

`build/K85ExecFixture/independent-cases.mjs` (sha256
`9944fb5d2eed3143543a7b7c7ddf10c3b554221efcacf5c83466dffca898b594`), **41 cases**, interface
`node independent-cases.mjs --tool FILE --work DIR`; exit 0 all held, 1 any red, 3 tool absent
(`INDEPENDENT_CASES: SKIPPED tool-absent`), 64 usage. Fixtures are written only under `--work`
(mkdtemp, removed in `finally`); receipt bytes are never executed; the driver prints the tool's
byte sha256 and `git rev-parse HEAD` of the tool's directory as the measured revision.

Expectation model, derived from the plan's `kumitate-counter-receipt-v2` contract, not from the
probe table: every body is written immediately before the run with a per-run **and per-case**
`nonce=<32hex>` metadata line; the expected
`RECEIPT: bytes=… rows=… held=… findings=… sha256=…` is computed from those written bytes. Per
case the driver asserts exit code, first line (`CLEAN` / `DRIFT <TOKEN>` / `FAIL-CLOSED <TOKEN>` /
`USAGE`), the exact RECEIPT line, the exact line count (2 without `--src`, 3 with it, 1 for USAGE)
and, where `--src` is named, the SOURCE line. `rows` = well-formed arm rows parsed; `held` =
summary `h/d`, `-/-` when no summary parses (both probe-pinned classes).

Case inventory: metadata that mimics arms/summaries/commands and post-summary metadata (4), CRLF
and CRLF+metadata (2), leading zero, safe-max, unsafe, fraction, exponent, negative counts (6),
two summaries, no summary, malformed name/status/prefix, zero arms, honest UNMET red, wrong
verdict, summary-before-arms, total/held drift, duplicate arm, foreign prefix (13), missing file,
directory as receipt (2), CLI refusals: none, unknown flag, duplicate flag, missing value, `--src`
without `--receipt`, `--selftest` mixed with `--receipt` (6), source arms: bound clean, unbound
name, arity mismatch, declared mismatch, no sites, missing source, last-declaration-wins,
declared-absent (8).

Two deliberate tolerances, documented in the file header, both where the frozen plan fixes no
rendering (run lines echo `held_render=` / `source_render=` for the observed value):
- `heldAny` on `leading-zero`, `unsafe-held`, `fraction-total`, `exponent-held`, `negative-held`
  — acceptance (`CLEAN` / `SUMMARY_COUNT`) and bytes/rows/findings/sha256 stay exact; only the
  `held=` digits render are free.
- `sourcePattern` on `src-missing` — SOURCE line shape asserted
  (`^SOURCE: sites=\S+ declared=\S+ receipt=3$`), unreadable-source numbers not pinned.

## Retained evidence

| command (all `node`, cwd `/fast/scratch/hyaku/kumitate-r85/K85ExecFixture`) | exit | result |
|---|---|---|
| `independent-cases.mjs --tool …/build/K85ExecGate/counter-receipt.mjs --work $S/candidate` | 0 | **`HELD held=41/41`**, `tool_sha256=7659be6e5ea5155a386fddfd3bad7abf5147562391c415d1e8200f9151508bc1`, `tool_head=9db0c6b5…` (`independent-candidate.txt`) |
| `probe85-c1.mjs --lane $S/cand-lane --work $S/probe-cand` (scratch copy of the same candidate bytes, copy sha256 re-checked `7659be6e…`) | 0 | `C85_C1: HELD held=20/20`, 20/20 arms ok (`independent-candidate-probe.txt`) |
| `independent-cases.mjs --tool …/controls/base/scripts/counter-receipt.mjs --work $S/base` | 1 | `UNMET held=6/41`; the six accepts are exactly `cli-none, cli-unknown, cli-duplicate, cli-missing-value, cli-src-only, cli-mixed` (v1 shares those exit codes); every receipt-derived case reds on the missing RECEIPT line |
| `independent-cases.mjs --tool …/controls/stub/scripts/counter-receipt.mjs --work $S/stub` | 1 | `UNMET held=0/41` |
| `independent-cases.mjs --tool …/controls/noreader/scripts/counter-receipt.mjs --work $S/noreader` | 1 | `UNMET held=0/41` (per-case nonce defeats the label-keyed canned answers) |
| `probe85-c1.mjs --lane $S/ref --work $S/probe-ref` (scratch reference, deleted) | 0 | `C85_C1: HELD held=20/20` |
| `independent-cases.mjs --tool $S/ref/scripts/counter-receipt.mjs --work $S/ref-run` | 0 | `HELD held=41/41` |

The last two rows are a **driver-validity check**, not candidate evidence: a scratch-only
reference implementation (sha256
`0230ba360c6217dab0f9101648136843ad4df550b8853f21365ea9007dd7d1e6`, never copied into the lane,
deleted with the scratch root) satisfied both the frozen probe (20/20) and this driver (41/41),
showing the 41 expectations are jointly satisfiable and consistent with the frozen predicate
rather than an over-specified table no candidate can meet.

Timeline note: at 15:56 the candidate did not exist and the driver printed
`INDEPENDENT_CASES: SKIPPED tool-absent …` with exit 3; that capture was superseded at 15:58 by
the real run above after `build/K85ExecGate/counter-receipt.mjs` appeared (sha256 `7659be6e…`,
16845 bytes). Receipts retained: `independent-candidate.txt`,
`independent-candidate-probe.txt`, `independent-base-control.txt`,
`independent-stub-control.txt`, `independent-noreader-control.txt`, `independent-reference.txt`,
`independent-reference-probe.txt`.

## Observed renders the plan leaves free (candidate at `7659be6e…`)

- `leading-zero`: `held=2/2` (normalized).
- `unsafe-held`, `fraction-total`, `exponent-held`, `negative-held`: `held=-/-`.
- `src-missing`: `SOURCE: sites=0 declared=absent receipt=3`.
- `src-no-sites`: exact `SOURCE: sites=0 declared=3 receipt=3`, `FAIL-CLOSED SOURCE_ARMS_EMPTY`
  exit 2.

## Findings for L1 (advisory, not closure)

1. **Candidate measured, not integrated.** The gate artifact at
   `build/K85ExecGate/counter-receipt.mjs` (sha256 `7659be6e…`) passes this independent driver
   41/41 and the frozen probe 20/20 when run from a scratch copy of its bytes. L1 still owns the
   single integrated-tree run; if the integrated bytes differ, rerun the driver for a fresh
   receipt (the receipt names sha256 + HEAD).
2. **Plan under-specification (not a tool defect):** the RECEIPT `held=` digits for leading-zero
   and malformed-summary receipts are unpinned; the candidate normalizes to `2/2` and `-/-`, which
   is the reading the driver accepts. Pinning one canonical render belongs in the plan.
3. **Beyond the frozen predicate (one class):** no probe case exercises the SOURCE line on a
   fail-closed source arm. I assert it from the fixed output shape ("then — only with `--src` —
   `SOURCE: …`"): `src-no-sites` at exit 2 and `src-missing` at exit 2. The candidate prints the
   line in both; if a future candidate suppresses it, that is a finding against the plan text, not
   a reason to narrow the probe.
4. **Derived but defensible:** `src-last-declared` (explicit "the last `const|let|var ARMS`") and
   `src-declared-absent` (`declared=<n|absent>` makes absence legal, so 3 sites / 3 rows cannot
   trigger a comparative drift). Both green.
5. **CLI refusals** `cli-duplicate`, `cli-src-only`, `cli-mixed` rest on "unchanged v1 CLI" (v1
   selftest pins those three as `USAGE`); the probe does not re-derive them.

Scratch `/fast/scratch/hyaku/kumitate-r85/K85ExecFixture/` was deleted after the receipts above
were copied into `build/K85ExecFixture/`.

Working-tree disclosure: `git -C <lane> status --porcelain` during the run reported
`M .ufo/pins/readme-map.json` and `M SCORECARD.md`. Neither path was read or written by this
seat — this seat's only writes are `build/K85ExecFixture/**` and `w1/K85ExecFixture.md` — so those
modifications belong to a sibling/L1 and were left untouched for integration.
