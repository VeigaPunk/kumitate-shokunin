# RevTipReceipts — R60-V4 tip receipts (round 61, w1)

**Verdict: VERIFIED (4/4 criteria).** Full evidence: `.ufo/waves/round-61/build/RevTipReceipts/verdict.md`.
Verified 2026-10-25T06:38–06:43 -03:00 at lane HEAD `be4a820c`, probe rev `a745a3b0`.

## What was checked

1. **Both files exist** — `close/dispatch60-tip.txt`, `close/doctrine60-tip.txt`, committed at
   `be4a820` (2 files, 6 insertions).
2. **Real observed lines, no `__TIP__`/`__MEASURED__`** — broad token scan over `close/` returned
   no matches; line shape corroborated by the live R60 transcripts
   (`w1/ExecDispatch60.stream.jsonl`, `w1/ExecDoctrine60.stream.jsonl`), which observed the same
   `held=8/10` (A7+A10 MISS) and `held=6/6` at the same rev.
3. **Match a fresh run at `a745a3b0`** — rerun in a `--no-hardlinks` sandbox clone
   (`/tmp/kumitate-r61/RevTipReceipts/sandbox`), with the probes confirmed byte-identical to the
   rev (`31469f02…`, `626e1d39…`). After normalizing only the `mkdtemp` suffix, dispatch and
   doctrine reproduce exactly, `exit=1` and `exit=0` included; two runs each, zero drift.
4. **No placeholder tokens anywhere in `close/`** — clean over the 4-file committed set; see LOW-2
   for a peer's untracked file that arrived mid-review.

**The receipt's 8/10 is honest and the MISSes are real:** A7 — `SCORECARD.md:1794` has a
`dispatch-evidence` row but none containing `round 60` (count 0 at the rev, 1 at HEAD → probe
reads 9/10 there). A10 — `.ufo/waves/round-60/w1/` is absent from the git archive at the rev
(0 tracked paths), so `FAIL-CLOSED wave-dir-absent` is structural.

**Doctrine spot-checked off-probe:** F4 — all 7 ids pinned with matching sha256 **and** byte size
(26 captures, recomputed with `hashlib`); F6 — collisions exactly `S125 S127 S136`; F1 — entry
heads carry `source:`/`verified-at: 2026-10-24`/`recheck:`.

## Findings (all LOW)

- **LOW-1** `close/dispatch60-tip.txt` was rewritten in the worktree at 06:41 (457→544 B): new
  mktemp suffix plus an appended non-probe line *"C1 after-state (10/10) is delivered by round 61
  C1 — see .ufo/waves/round-61/plan.md"*. Not observed output, and not yet true (HEAD reads
  9/10). The committed receipt is correctly shaped; the file is now `M`.
- **LOW-2** untracked `close/dead-seats-r60.md` appeared at 06:42 (11,922 B). Its quoted evidence
  carries `… [+N chars]` truncation markers — truncations, not placeholders; the criterion holds,
  but truncated quotes are not byte-faithful evidence. Not edited by this seat.
- **LOW-3** `round-60/plan.md:62` expected "work commit → `held=9/10`, exactly A10 MISS"; observed
  is 8/10 with A7 too. The receipt is honest, the frozen expectation is stale (R61 `plan.md:45`
  already records 8/10).
- **LOW-4** (adjacent) `corpus/lessons/round-60.md:129` points the census transcript at `close/`;
  `close/` never held it — it is `w1/ExecCensus.md` (+ `.err`, `.stream.jsonl`).

## Residual risk

- The mktemp suffix makes byte-exact comparison impossible; only that 6-char token was normalized,
  and the determinism diff was clean.
- A run cannot be distinguished from a transcription of the work receipt plus exit code; the
  differing suffixes (`P61VSt` work, `ihmnFD` live, `L6n7ih` committed tip, `oGUwJa` post-review)
  and the content-identical reruns make transcription-only unlikely, and nothing in the receipt is
  false either way.
- `close/` was under concurrent peer edits for the whole review; statements are timestamped
  observations.

## Tooling

No installs or upgrades; no `pacman` transaction run.
