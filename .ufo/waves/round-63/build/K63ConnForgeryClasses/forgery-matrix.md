# Forgery / do-nothing class matrix — round 63 frozen counters (INLINE63 I1..I6, TOPOLOGY63 T1..T7)

Legend: `✓` = the arm kills this class (a clean run of the arm cannot be produced by that class alone).
`✗` = the arm does NOT kill it (accepts the class). `·` = arm not applicable / class outside that arm's read set.
`∆` = kills only the naive variant; a refined variant of the same class survives (see class notes).

| # | class | I1 | I2 | I3 | I4 | I5 | I6 | T1 | T2 | T3 | T4 | T5 | T6 | T7 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| A | worktree-vs-revision read (R61-V2 root cause) | · | ✓ | ✓ | ✓ | ✓ | ✓ | · | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ |
| B | substring/count-only checks | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| C | hand-written progress/results wave files (no runtime trace) | · | ✓ | · | ✓ | · | ✓ | · | · | · | · | · | · | · |
| D | phantom row outside `## Registry` | · | · | · | · | · | · | · | ✓ | · | · | ✓ | ✓ | · |
| E | fabricated capture (invented bytes, self-pinned) | · | · | · | · | · | · | · | · | ✗ | ✗ | ∆ | · | · |
| F | forged capture with recomputed pin | · | · | · | · | · | · | · | · | ✗ | ✗ | ∆ | · | · |
| G | unsatisfiable honest row shape | · | · | · | · | · | · | · | · | · | · | · | · | · |
| H | mixed-state reads (live host / live fetch at scoring time) | · | ✗ | · | ✗ | · | ✗ | · | · | · | · | ✗ | · | · |
| I | self-authored receipt | · | · | · | · | · | ✗ | · | · | · | · | · | · | · |
| J | circular tip receipt (echo of gate's own lines) | · | · | · | · | · | ✗ | · | · | · | · | · | · | · |
| K | host-record forgery (write session JSONL + dispatcher lines) | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | · | · | · | · | · | · | · |
| L | control-fit / test-aware gate implementation (hollow gate) | ✗ | ✗ | ✗ | · | · | · | · | · | · | · | · | · | · |
| M | synthetic attacker-controlled live source (T5 bypass) | · | · | · | · | · | · | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| N | provenance laundering (rewrite `opened` cell, reuse old capture/row) | · | · | · | · | · | · | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| O | dead-seat tolerance (CLEAN with dead seats, no finding) | · | ✗ | · | · | · | · | · | · | · | · | · | · | · |

## How each ✓/✗ is grounded

- **A**: both probes materialise the measured revision with `git archive <M>` / `git show M:path` only
  (inline63-probe.mjs:46,62,116,124; topology63-probe.mjs:53,55). The inline gate additionally proves
  rev-mode ignores worktree edits (selftest cases `rev-mode-ignores-worktree-edit`, exit 0). T5 is the
  only arm that intentionally reads live bytes (fresh fetch), so it cannot kill any read-source class.
- **B**: every arm is a regex/substring/cell-equality assertion. The claims' *work* is done by the gate
  (I2) and the live fetch (T5); the other arms are presence/format checks that a do-nothing author
  satisfy by construction. None of them can distinguish "content arrived from the claimed activity" from
  "content written by the claimant".
- **C**: a do-nothing lane alone (no host records) is killed by I2 (session/log cross-check) and I4
  (minimal pair forced `NOT_A_DISPATCH`/`SPAWN_LOG_ABSENT`); class C survives only when combined with K.
- **D**: f2-phantom-row receipt: `T2 MISS S110:not-in-registry` + `T5 MISS S110:no-url` + `T6 MISS
  census-exit=1` — the row outside `## Registry` cannot satisfy T2, and T5 cannot resolve its URL.
- **E/F**: f1-forged-capture receipt: `held=6/7 … | T5 MISS S110:quote-not-live(…)` — T3 passes under a
  recomputed pin (hash+size self-consistent), T4 passes (quotes inside the capture), only T5 rejects the
  naive variant whose quotes are not on the live page. If the forger instead writes quotes that ARE live
  (i.e. quotes the real page), T5 passes too → `∆`.
- **G**: fixed this round: c0-honest reads `TOPOLOGY63_HELD held=7/7` under the 11-cell contract
  (NF=13, indices 8/9/11); the D61 misindexing/POSIX-class bug is gone. No surviving attack class.
- **H**: I2/I4/I6 read `~/.omp/agent/sessions` and `/fast/scratch/hyaku-run7/dispatcher.log` live at
  scoring time (gate defaults, inline-dispatch-evidence.mjs:42,52); T5 curls the row URL live. Same M
  can flip verdicts across wall-times (sessions pruned, log rotated, page changed). No arm snapshots any
  host state.
- **I/J**: I6 only checks the tip receipt exists at T, `rev=<M>`, and substrings the CLEAN lines the
  probe itself just produced (inline63-probe.mjs:123-129). The receipt is authored by the claimant after
  seeing the gate output — an echo, no independent attestation.
- **K**: demonstrated live (see evidence): a fully hand-written fixture — lane files + 3 session JSONL
  files + a 2-line dispatcher log — reads `INLINE_DISPATCH: CLEAN` exit 0. The sessions root and the
  dispatcher log are owned by the same UID as the lane processes (vgpnk), so a seat/L1 process can write
  the. This is the plan's stated limit; no arm addresses it.
- **L**: the 14 I3 controls and the 25-case selftest are public at freeze; a gate implementation can
  special-case exactly those inputs (or merely reproduce the discriminants) and still pass I1/I3 — and
  I2 if the real wave's transcripts match the same patterns. The controls bound inputs, not the
  implementation; no arm can detect a hollow gate.
- **M**: T2 needs only an `https?://` URL; T3 pins a capture the claimant writes; T4/T5 search quotes in
  that capture and in a live fetch of the *claimant-chosen* URL. A page the claimant controls (gist /
  paste / own site) can host the quotes; no arm checks source authority or third-party control. All seven
  T-arms pass.
- **N**: T2 compares cell values only — `status=mined`, `opened==2026-10-25`, `used-by` contains the
  entry path. Rewriting an older row's `opened` cell (and appending `used-by`) makes it pass T2; T3/T4
  keep passing because the capture bytes and pins are untouched and the quotes are still live (f4 proves
  the arm detects only the *wrong* date, not the act of rewriting). Census validates format, not
  provenance.
- **O**: the gate counts dead seats into the summary line but emits no finding for them unless
  `--report` is passed (inline-dispatch-evidence.mjs:250-261); the probe's I2 invocation never passes
  `--report`, and its regex only requires `CLEAN (seats=N …`. A wave with genuinely dead seats still
  reads CLEAN.

## Classes no arm kills (survivors) — concrete cheap forgeries

1. **K — host-record forgery**: craft, for each dispatched seat, a `<Seat>.jsonl` under
   `~/.omp/agent/sessions` containing 5 lines (session row with `id`; `model_change` role
   `subagent:<Seat>`; user message containing `# Seat <Seat>\n` + first 200 chars of the dispatch
   context + last 120 chars of the task; assistant toolCall `yield`; custom `session_exit` kind
   `normal`); append one `spawned <lane> 63 w1 40` line and one `done <lane> w1 …/round-63/w1-results.json`
   line to `/fast/scratch/hyaku-run7/dispatcher.log`; commit the wave files at M. Repro:
   `node scripts/inline-dispatch-evidence.mjs --root build/K63ConnForgeryClasses/demo-fixture/lane --round 7 --wave w1 --sessions-root build/K63ConnForgeryClasses/demo-fixture/sessions --dispatcher-log build/K63ConnForgeryClasses/demo-fixture/dispatcher.log` → `CLEAN`, exit 0.
2. **M — synthetic source**: open a row whose URL points to a page the claimant controls (or a paste
   service), fetch it verbatim into the capture, pin it, write ≥6 short quotes from that page into the
   entry's `## Located quotes`; T1–T7 all pass, with no third-party source involved.
3. **N — provenance laundering**: take an existing pinned row/capture (e.g. S195's Temporal capture),
   rewrite the row's `opened` cell to `2026-10-25` and append the entry path to `used-by`; reuse the
   existing capture and its live-true quotes. T2/T3/T4/T5 all pass; the "two rows opened this round"
   claim is satisfied without any new mining or fetch.
4. **L — hollow gate**: implement `inspect()` as a decision tree over the exact 14 frozen fixture
   shapes (plus the selftest's own expectations); I1 (25/25) and I3 (14/14) pass, and any other input
   shape returns CLEAN if it trivially satisfies the same checks — i.e. the gate is green even though it
   verifies nothing the controls don't already enumerate.
5. **J — circular receipt**: after an I2 CLEAN run, write `close/inline63-tip.txt` with first line
   `rev=<M>` and the run's own lines; I6 passes by construction. No arm makes the receipt attest to
   anything besides the probe's own output.
6. **H — same-M flip**: measure M at two wall-times; after the harness prunes/rotates session or log
   files (or a live page changes), the identical M goes HELD → UNMET with no repo change. No arm pins
   or snapshots the host state.
7. **O — dead-seat wave**: let ≥1 seat's transcript exit non-`normal` (or abort); the gate still emits
   `CLEAN (seats=N … dead=k)` with no finding; the probe accepts it (I2 regex needs only `CLEAN` and
   `seats>=32`).
