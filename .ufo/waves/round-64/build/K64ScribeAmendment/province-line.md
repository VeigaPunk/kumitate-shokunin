# PROVINCE.md — Frontier bullet replacement (round 64)

Target: `PROVINCE.md:21`, inside `### Frontier — named ground, entered by sourced entries, not yet gated`.
The file is not append-only; J7 requires the entry path on a line that also reads `frontier|band|ground|first entry`
(case-insensitive). The replacement keeps the round-45 attribution and corrects only the jj clause, which the round-64
entry falsifies (`jj workspaces are not demonstrated`).

Replace the whole of line 21 with this ONE line (no internal newline):

<!-- PROVINCE:BEGIN -->
- Isolation substrates for parallel agents (git worktrees, harness isolation backends, jj workspaces) — first entry `corpus/knowledge/agent-isolation-substrates.md` (round 45, exploratory): seat-containment rules derived from their mechanisms with demos; harness isolation is off on this host; jj workspaces advanced in round 64 by `corpus/knowledge/jj-workspace-seat-containment.md` — the first demonstrated jj-workspace seat-containment ground (mechanism M7 measured: one shared operation log, staleness on abandon, `update-stale` recovery, no filesystem boundary), appended to the round-45 entry as `Amendment 2026-10-25`.
<!-- PROVINCE:END -->

## J7 line test (replicated from `.ufo/waves/round-64/probe/jj64-probe.mjs:210-213`)

`l.includes('corpus/knowledge/jj-workspace-seat-containment.md') && /frontier|band|ground|first entry/i.test(l)`
→ both true for the line above (`ground` and `first entry` both match).

## Why not a second bullet

The bullet is the frontier band's own statement of that ground; a second bullet naming the same band would leave the
first one asserting the falsified clause. Only line 21 changes; lines 1–20 and 22–29 stand.
