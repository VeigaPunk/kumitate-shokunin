# K85ExecGate — C1 counter-receipt v2 (lane-author advisory)

Seat K85ExecGate, round 85, lane `kumitate-shokunin`. Lane HEAD measured at
`9db0c6b5eb9111cfc5581006ba976ca2cd112792` (the freeze commit). Candidate is uncommitted
seat output at `build/K85ExecGate/counter-receipt.mjs`, sha256
`7659be6e5ea5155a386fddfd3bad7abf5147562391c415d1e8200f9151508bc1`, mode 755, zero-dependency
Node ESM. No production file, plan, probe, control, scorecard, corpus, SKILL, manifest or
other seat subtree was touched; no git/jj mutation; no installs (none needed); no model
parameter passed.

## Files written

- `.ufo/waves/round-85/build/K85ExecGate/counter-receipt.mjs` — the v2 candidate.
- `.ufo/waves/round-85/build/K85ExecGate/frozen-inputs.txt` — lane rev, candidate/probe/plan
  sha256, node version, lane-copy `cmp=0`.
- `.ufo/waves/round-85/build/K85ExecGate/probe.txt` — frozen-probe run (20/20).
- `.ufo/waves/round-85/build/K85ExecGate/selftest.txt` — full `--selftest` output (60/60).
- `.ufo/waves/round-85/build/K85ExecGate/content-variation.txt` — frozen same-path control,
  candidate reads 3/3 with three distinct sha256 (supplementary evidence, not the pre-data
  control scoring that belongs to L1).
- `.ufo/waves/round-85/build/K85ExecGate/real-task.txt` — candidate over committed r83/r84
  receipts with external `wc -c`/`sha256sum` cross-checks.
- `.ufo/waves/round-85/build/K85ExecGate/read-only.txt` — canary receipt proving no
  execution of receipt bytes, no receipt mutation, no cwd writes, no `/tmp` literal.
- `.ufo/waves/round-85/w1/K85ExecGate.md` — this report.

Scratch root `/fast/scratch/hyaku/kumitate-r85/K85ExecGate/` held the candidate first, the
scratch lane (`lane/scripts/counter-receipt.mjs`, byte-identical to the build copy,
`cmp=0`), the probe/selftest/cv work dirs, the canary and an empty cwd probe. It was
deleted after the durable receipts above were copied; the receipts keep the exact commands,
exit codes and measured revision.

## Measured claim

```
command=TMPDIR=<scratch>/tmp node <lane>/.ufo/waves/round-85/probe/probe85-c1.mjs \
  --lane <scratch>/lane --work <scratch>/probe
C85_C1: HELD held=20/20
exit=0
```

All 20 arms green, including the four `--src` arms `src-bound-clean` (0), `src-unbound`
(1, `SOURCE: sites=3 declared=3 receipt=3`), `src-arity` (1, sites=4), `src-declared`
(1, declared=2). Selftest:

```
COUNTER_RECEIPT_SELFTEST: PASS held=60/60
exit=0
```

60 arms = the full v1 grammar/CLI case set, retained, plus 10 new arms (2 CLI shapes and
8 source arms: `src-clean`, `src-no-declared`, `src-unreadable`, `src-empty`,
`src-unbound`, `src-arity`, `src-declared`, `src-after-receipt-drift`). Every arm asserts
exit + exact first line; non-USAGE arms also assert line count, and `--src` arms assert the
exact `SOURCE:` line. Same-path content variation: `HELD held=3/3 distinct_sha=true`,
exit 0.

## Real task over committed bytes

| input (committed, unmodified) | v2 result | exit | bytes / sha256 |
|---|---|---|---|
| r83 `close/c1-probe.txt` | `DRIFT ARMS_TOTAL`, `rows=28 held=27/27` | 1 | 5573 / `07690bff…` (matches external `wc -c`/`sha256sum`) |
| r83 `close/c1-repair.txt` | `CLEAN`, `rows=28 held=28/28` | 0 | 5729 / `2a327c1d…` |
| r83 `close/c2-probe.txt` | `CLEAN`, `rows=16 held=16/16` | 0 | 2678 / `ad43c857…` |
| r84 `close/history-red.txt` | `FAIL-CLOSED SUMMARY_COUNT`, `rows=0` | 2 | 224 / `78729d6f…` |
| r84 `close/history-repair.txt` | `FAIL-CLOSED SUMMARY_COUNT`, `rows=0` | 2 | 214 / `1878cabc…` |

v1 on the same five byte files prints the same first line and the same exit code in all
five cases (recorded per file in `real-task.txt`), so the two `history-*` readings are a
plan-wording ambiguity, not a v2 regression: those files are 4-line run transcripts
(`rev=`, `command=`, one verdict line, `exit=`), not arm transcripts. The DRIFT/CLEAN that
the plan attributes to them reproduces exactly on the r83 receipts their `command=` line
names. Not rewritten, per plan.

## Behavior implemented literally from the frozen contract

- CLI `--receipt FILE [--src COUNTER.mjs]`, `--selftest [--work DIR]`; any other shape is
  one-line `COUNTER_RECEIPT: USAGE`, exit 64.
- v1 grammar and precedence unchanged: metadata `k=v`, `command:`, `rev:`, `exit:` skipped,
  CRLF accepted, summary/arm regexes and the 11-way first-finding precedence identical.
- Every non-USAGE run prints
  `RECEIPT: bytes=<n> rows=<r> held=<h>/<d> findings=<token|none> sha256=<64hex|->`
  derived from the bytes actually read (`bytes` = raw buffer length, `sha256` = hash of
  that buffer; `-`/0 only when unreadable). `rows` counts well-formed arm rows only;
  `held` is the summary pair when a safe-integer summary exists, else `-/-`.
- `--src` adds `SOURCE: sites=<n> declared=<n|absent> receipt=<r>` on every non-USAGE run,
  with sites = literal `arm('<name>'` occurrences, declared = last
  `const|let|var ARMS = <int>`, receipt = receipt arm rows. Zero sites is fail-closed
  `SOURCE_ARMS_EMPTY`; then `ARM_UNBOUND`, `SOURCE_ARITY`, `SOURCE_DECLARED`.
- Precedence follows the contract's order: receipt malformed (2) → receipt drift (1) →
  source fail-closed (2) → source drift (1); a receipt finding masks the source token while
  the `SOURCE:` line still prints.
- Read-only, never executes receipt bytes; only `--selftest` writes, into explicit `--work`
  or `HYAKU_SCRATCH` (default `/fast/scratch/hyaku`), via `mkdtemp` removed in `finally`.
  No `/tmp` literal in the source (`hardcoded_tmp=no`). Canary receipt with a
  `command: touch <canary>` line: `CLEAN` exit 0, `canary_executed=no`, receipt sha256 and
  byte count identical before/after, cwd still empty afterwards.

## Ambiguities / contract notes (reported, not edited)

1. **r84 history files in the plan's real-task list.** Literally invoking any receipt tool
   on `history-red.txt`/`history-repair.txt` yields `SUMMARY_COUNT` (no arm rows); v1 and v2
   agree. The intended DRIFT/CLEAN is over the r83 files their `command=` line records.
   Not a defect in the predicate; flagging the wording so the integrated report does not
   claim a literal 5-file reproduction for those two.
2. **`SOURCE:` rendering when the source is unreadable or empty.** The contract fixes
   `sites=<n>` but not what `n` is when no parse happened. I print `sites=0` with
   `declared=absent` (unreadable) or the parsed declaration (empty), and `receipt=<rows>`;
   the frozen probe never exercises either, so selftest arms `src-unreadable`/`src-empty`
   pin the choice. If L1 expects a different spelling this is presentation, not the
   predicate's 20-case answer.
3. **Receipt-error vs source-error precedence.** The contract says "then source (2) …" after
   receipt drift, so a receipt token wins and the source token is suppressed while the
   `SOURCE:` line still prints. Pinned by `src-after-receipt-drift` (receipt `ARMS_TOTAL`
   plus unreadable source → `DRIFT ARMS_TOTAL`, exit 1, `SOURCE: sites=0 declared=absent
   receipt=1`).
4. **`held=` under `SUMMARY_COUNT`.** For a readable receipt with more than one summary the
   line still shows the first safe-integer summary pair (e.g. the probe's `two-summaries`
   expects `2/2`); for a wholly malformed summary it shows `-/-`. The contract only fixes
   the probe's cases; this generalization is the natural reading of "input-derived".
5. **Literal site scan.** `arm('…'` is matched textually (comments/strings included), per
   the frozen "literal call sites" wording; a non-literal binding therefore fails closed
   rather than reading vacuous. `declared` is whatever the last `const|let|var ARMS = <int>`
   says, including when it disagrees with sites (`SOURCE_DECLARED`).
6. **USAGE carries no RECEIPT/SOURCE lines** — exactly one line, exit 64, matching the
   probe's `usage` arm and the contract's "one line".

## Risks

- The candidate adds two output lines to v1's output. Any consumer that exact-matches the
  single v1 line (e.g. round-84's `K84ExecFixtures` driver) will see drift by design; the
  frozen round-85 contract requires the added lines, and v1's grammar cases are retained
  inside `--selftest` with first-line assertions.
- The probed lane copy and the build copy are `cmp=0` at delivery; L1 must copy this file to
  `scripts/counter-receipt.mjs` unchanged and rerun the probe once at the integrated tree.
- `SOURCE:` failure spelling (note 2) is the only unpinned presentation surface; changing it
  does not affect any of the 20 arms.
- No attributable regression was observed: v1 first lines and exit codes match on the five
  committed receipts, and the frozen probe's three pre-data controls remain outside this
  seat's scoring (L1 committed them before data).

## Blockers

None. No contract-impossible requirement found. S245/S246 unused by this seat (no source
claim here); SHONEN boxes untouched; this is lane-author advice, not the non-author closure.

## Peer audit (K85ExecSelftest, non-author)

Audited candidate sha256 `7659be6e…`: `--selftest` 60/60 PASS twice (including no-arg with
`HYAKU_SCRATCH`/`TMPDIR` redirected, no leftovers), no hardcoded `/tmp` or `/var/tmp`, one
`mkdtemp` under an explicit resolved work root, one `spawn` with `timeout:10000`, exit +
first-line assertions present, exact `SOURCE:` assertion for the 8 source arms, token
coverage 18/18, and two mutants (expected-token, checker token) killed. Independent scratch
lane copy: `C85_C1: HELD held=20/20` exit 0 and `CONTENT_VARIATION: HELD held=3/3
distinct_sha=true`.

One advisory finding, accepted and deferred: the selftest pins exit + first line (+ line
count and `SOURCE:`), but not line 2 `RECEIPT:` content, so a mutant that always prints the
constant-CLEAN stub `RECEIPT:` line still passes `--selftest` 60/60 while the frozen probe
scores it 1/20 and content-variation 0/3. That is plan-compliant (the contract asks exit +
first line only) and the probe remains the discriminator; the audited bytes are left
unchanged in this wave so the audit and integrated measurement share one sha256. Round-86
deepening candidate: per-arm assertion of the selftest's own computed
`bytes/rows/held/findings/sha256` line, which would close the vacuous class inside
`--selftest` too.
