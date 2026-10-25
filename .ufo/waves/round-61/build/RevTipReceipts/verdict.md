# R60-V4 tip receipts — verification verdict

**Seat:** RevTipReceipts (round 61, wave w1, leaf reviewer)
**Verified at:** 2026-10-25T06:38–06:43 -03:00
**Lane HEAD during review:** `be4a820c344d4eb2f94b999c3b5d649e76ab70f1`
**Probe rev:** `a745a3b0e02253e722834ef95042d97ed92e5e53`
**Sandbox clone:** `/tmp/kumitate-r61/RevTipReceipts/sandbox` (`git clone --no-hardlinks`)

## Verdict

```
R60-V4 TIP RECEIPTS: VERIFIED
criteria 4/4 met — real observed lines, no placeholder tokens, byte-identical to a fresh
run at a745a3b0 modulo the mktemp suffix, exit codes reproduced (1 / 0)
```

The dispatch tip honestly reports `DISPATCH60_UNMET held=8/10` (not the 10/10 target). That
honesty is the point of the receipt and it is correct: both MISSes are genuine at that rev.

## Criterion results

| # | criterion | result | evidence |
|---|---|---|---|
| 1 | both tip files exist | PASS | committed at `be4a820` (`git show --stat be4a820`: 2 files, 6 insertions); worktree present, 544 B / 336 B |
| 2 | real observed lines, no `__TIP__`/`__MEASURED__` | PASS | `grep -rE '__TIP__\|__MEASURED__\|__[A-Za-z_]+__\|XXX\|TBD\|PLACEHOLDER\|TODO\|FIXME\|N/A\|\$\{\|\{\{\|<rev>\|…' close/` → rc=1 at 06:38; corroborated by the live R60 seat transcripts (below) |
| 3 | match a fresh run of the probes at `a745a3b0` | PASS | rerun in sandbox clone; identical modulo mktemp suffix; two runs each, zero drift |
| 4 | no placeholder tokens anywhere in `close/` | PASS | same broad scan over all files present; see LOW-1/LOW-2 for concurrent drift |

### Fresh-run comparison (normalized `/tmp/(a60|d60)-probe.[A-Za-z0-9]{6}` → `…RANDOM`)

```
dispatch tip  : held=8/10  A7 MISS row-absent  A10 MISS FAIL-CLOSED wave-dir-absent  exit=1
dispatch rerun: held=8/10  A7 MISS row-absent  A10 MISS FAIL-CLOSED wave-dir-absent  exit=1
doctrine tip  : held=6/6   F1..F6 PASS          exit=0
doctrine rerun: held=6/6   F1..F6 PASS          exit=0
```

`diff` after normalization: dispatch differs only by the tip's `exit=1` vs my capture label
`dispatch_exit=1`; doctrine only by `exit=0` vs `doctrine_exit=0`. Second run of each probe:
`diff` rc=0 (deterministic).

### Why the two MISSes are genuine (not a receipt defect)

- **A7** — at `a745a3b0`, `SCORECARD.md:1794` carries a `` | `dispatch-evidence` | `` capabilities
  row, but no such row contains the substring `round 60` (count 0). At HEAD the count is 1 and
  the same probe reads `A7 PASS capability-row` → `held=9/10`. So A7 is a true rev-specific
  observation that was repaired after the work commit.
- **A10** — `.ufo/waves/round-60/w1/` is not in the git archive at `a745a3b0` (0 tracked paths;
  extracted tree has no such directory). `FAIL-CLOSED wave-dir-absent` is structural, not a bug.

### Independent spot-check of the doctrine receipt (D60 checks not taken on faith)

- **F4** — all seven ids (`S126 S131 S133 S134 S135 S190 S194`) are pinned in
  `.ufo/pins/source-captures.json`; each blob's sha256 **and** byte size match the pin
  (26 captures in the file). Recomputed with `hashlib`, not read from the probe.
- **F6** — `.ufo/waves/round-60/assimilation/collisions` holds exactly `S125 S127 S136`.
- **F1** — both entry heads carry `source:` with their own ids/URLs, `verified-at: 2026-10-24`,
  `recheck: 180d` / `recheck: 90d`.

## Findings

### LOW-1 — the worktree dispatch tip is no longer pure probe output (and is dirty)

At 06:41:33 a peer rewrote `.ufo/waves/round-60/close/dispatch60-tip.txt` (457 → 544 B): new
mktemp suffix `oGUwJa` **and** an appended line

```
C1 after-state (10/10) is delivered by round 61 C1 — see .ufo/waves/round-61/plan.md
```

The committed receipt (`be4a820`) is probe output + `exit=1` only, which is the correct shape.
Two problems with the appended line: it is not observed output, and it is not yet true — a fresh
run at HEAD reads `held=9/10` (A10 still `FAIL-CLOSED registry-unreadable … dispatch-actual.json`).
The forward pointer belongs in the report or plan, not in a receipt. `git status` now shows
`M .ufo/waves/round-60/close/dispatch60-tip.txt`.

### LOW-2 — `close/dead-seats-r60.md` appeared untracked during verification

Created 06:42 (11,922 B, `??` untracked). Not a tip receipt and not mine; recorded because the
"no placeholder tokens in close/" criterion must name what it scanned. Its quoted evidence
carries `… [+539 chars]` / `… [+764 chars]` truncation markers inside backticked cells. These are
truncations of real transcript text, not unfilled placeholders, so the criterion still holds —
but a receipt-style file quoting truncated evidence is not byte-faithful evidence for the cell it
quotes. No mutation performed by this seat.

### LOW-3 — round-60's frozen expectation was wrong, not the receipt

`plan.md:62` declared "work commit → `held=9/10` with exactly A10 MISS"; the observed work-commit
state is 8/10 with A7 also MISS. The receipt is honest; the frozen expected-progression line is
stale. Round-61 `plan.md:45` already records the correct `held=8/10 … (A7 row-absent, A10
wave-dir-absent)`, so no correction is needed in the receipt.

### LOW-4 (adjacent to close/, outside the tip) — dangling close/ pointer

`corpus/lessons/round-60.md:129` states the round-end `sources-census.sh validate --root`
transcript "is committed under `.ufo/waves/round-60/close/`". `close/` has never contained it
(`git log --diff-filter=A -- .ufo/waves/round-60/close/` lists only the four probe receipts); the
transcript is `.ufo/waves/round-60/w1/ExecCensus.md` (+ `.err`, `.stream.jsonl`).

## Corroboration from the round-60 live transcripts

The same line shape was observed live during round 60, at a different mktemp suffix
(`ihmnFD`), so the tip is not a fabricated string:

- `.ufo/waves/round-60/w1/ExecDispatch60.stream.jsonl` — `DISPATCH60: DISPATCH60_UNMET held=8/10
  checks=10 rev=a745a3b0… rule=A60 … A7 MISS row-absent … A10 MISS exit=2 … EXIT=1`
- `.ufo/waves/round-60/w1/ExecDoctrine60.stream.jsonl` — `DOCTRINE60: DOCTRINE60_HELD held=6/6
  checks=6 rev=a745a3b0… rule=D60`

Three independent mktemp suffixes now exist for the same content (`P61VSt` work receipt,
`ihmnFD` live seat, `L6n7ih` committed tip, `oGUwJa` post-review worktree tip, `YgQxHa`/`RANDOM`
my reruns).

## Residual risk and verification gaps

- Byte-exact comparison is impossible by construction: the probe embeds `mkdtempSync` output in
  the A10 line. I normalized exactly that 6-char suffix. Any additional nondeterminism would have
  appeared in the two-run determinism diff (it did not).
- I cannot distinguish "tip produced by a run" from "tip transcribed from the work receipt plus
  the exit code". The differing mktemp suffix, the presence of `exit=` lines the work receipts
  lack, and content-identical independent reruns make transcription-only unlikely but not
  disprovable. Nothing in the receipt is false either way.
- `close/` was under concurrent peer edits throughout (06:38 clean 4-file set → 06:42 modified
  tip + new untracked file). All statements above are timestamped observations, not a claim about
  the final committed state.
- Probe scripts at `a745a3b0` and in the worktree are byte-identical
  (`dispatch60-probe.mjs` sha256 `31469f02…`, `doctrine60-probe.mjs` sha256 `626e1d39…`), so the
  rerun used the frozen counter, not a drifted copy.
- No tools were installed or upgraded; no `pacman` transaction was run.

## Commands used (reproducible)

```
git clone --no-hardlinks /home/vgpnk/Projects/shokunin/kumitate-shokunin \
  /tmp/kumitate-r61/RevTipReceipts/sandbox
node .ufo/waves/round-60/probe/dispatch60-probe.mjs  <clone> a745a3b0e02253e722834ef95042d97ed92e5e53
node .ufo/waves/round-60/probe/doctrine60-probe.mjs  <clone> a745a3b0e02253e722834ef95042d97ed92e5e53
```
