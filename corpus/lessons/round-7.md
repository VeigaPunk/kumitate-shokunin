# Round 7 — the corpus moved, the index did not

**What landed (commit `7a4c9a0`, 2026-09-28 17:49, 5 files, +815):**
`corpus/knowledge/distill-and-l3.md`, `local-ship.md`,
`native-transcript-ledger-seats.md`, `queue-summary.md`, `test-inventories.md`
— the `crates/ufo-core-runtime` remainder (R6/R7/R8 in `SCORECARD.md`'s surface
registry) plus the `queueSummary` projection.

**What did not land with it:** no `SKILL.md` section, no `corpus/README.md`
coverage-map row, no `LOG.md` entry, no `lessons/round-7.md`
(`git show --name-only 7a4c9a0`). The lane's round-7 report is a retirement
marker only:
`/home/vgpnk/projects/shokunin/.ufo/reports/round-7/kumitate.md` ("Fleet-1 lane
retired mid-round; corpus commits pushed (7a4c9a0). Marker so fleet-2
respawns."). Round 8 backfilled all four.

**Lesson.** A corpus entry is not a completed round: the README map is the only
discovery surface, so an unindexed note is invisible to a reader who has not
read the tree. The round-8 coverage proxy C2 (`README rows / corpus note
files`) scored **20/30** at round-8 open precisely because of this — five notes
on disk, zero rows. The map row is part of the note, not paperwork around it.

**Also worth keeping:** the five notes were written against a pinned tree
(`scripts/fleet-dispatcher.mjs` sha256 `44a3c781…`, git pin `b18e0274d`), and
round 8 re-verified 23 of their anchors — all matching. The pins held
*precisely because they are content pins*: 296 commits landed between
`b18e0274d` and HEAD `ee907f1cf` and the dispatcher file did not change a byte
(`git diff --stat b18e0274d..HEAD -- scripts/fleet-dispatcher.mjs` → empty).
Round 8 typed the two ambiguous pin sites (`reconcile-and-cycle.md:3`,
`LOG.md` r6) as `sha256` and added the git-distance fact, because a bare `rev
<hex>` reads as a git revision and silently defeats any re-verifier that only
asks git.
