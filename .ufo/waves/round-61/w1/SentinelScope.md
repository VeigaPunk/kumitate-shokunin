# SentinelScope — write-scope sentinel, kumitate round 61 / wave w1

**Verdict: IN SCOPE.** No seat wrote outside its declared paths, no seat committed, no seat moved a
ref, and no seat touched the fleet repo, a sibling lane, the campaign tree, `.ufo/state/`,
`.scratch/`, `templates/`, fleet `scripts/` or `MANIFEST.json`. One state-mutation finding
(F1, jj auto-snapshot: LOW-MEDIUM) and five LOW / four INFO findings are recorded in
`.ufo/waves/round-61/build/SentinelScope/findings.md`; none is a content breach.

Axes: operability (is the write scope clean end-to-end?), fidelity (no false clears).

## Check 1 — lane repo, start vs end

Start, 06:40:55, before any seat had written:

```
?? .ufo/waves/round-61/w1/
```

End, 06:50:12 (HEAD unchanged at `be4a820c344d4eb2f94b999c3b5d649e76ab70f1`):

```
 M .ufo/pins/readme-map.json          ExecReadmeMapFix (step 2)
 M .ufo/pins/source-captures.json     L1 integrator (S195 pin, sha 8ef2ee5f…/9645 B)
 M corpus/QUALITY.md                  ExecQualCriterion (Q52-Q55, append-only)
 M corpus/README.md                   ExecReadmeMapFix (R60-V8 row) + L1 (C2 map row)
 M corpus/SOURCES.md                  L1 integrator (S195 row; ScribeSourcesRows drafted only)
?? .ufo/waves/round-60/close/dead-seats-r60.md   ExecDeadSeatTable
?? .ufo/waves/round-61/{build,w1}/               seat build dirs + 32 seat reports (31 peers + this one)
?? .ufo/waves/round-61/controls/ctl-c{1,2}-critic-*.txt  CritControlC1/C2 (step 3)
?? .ufo/waves/round-61/probe/counters.sh         ExecCountersPack
?? corpus/knowledge/temporal-worker-versioning-pinning.md  L1 integrator (C2 E1)
?? scripts/make-dispatch-actual.mjs               ExecDispatchSchemaTool
```

Every path maps to a dispatched `# Target` (verified path-by-path against
`w1-dispatch.json` and the 32 registry names); every `build/<X>/` and `w1/<X>.md` carries a seat
name; no non-seat directory, no symlink under `round-61/`, no empty report, no duplicated report.

**No jj/git index mutation by a seat in content terms:** `git diff --cached` empty, 10465 tracked
files, `refs/heads/master` untouched (mtime 06:39:08), HEAD `be4a820c`. `.git/index` mtime advances
only from `git status` stat refresh. jj *state* did move — F1.

## Check 2 — fleet-root misroot candidates

`git -C /home/vgpnk/Projects/shokunin status --porcelain -uall`: 6 untracked, 17 tracked-modified.
Untracked entries naming this lane/round in path: **0**. The only lane-naming content is
`.scratch/goal-20261025-hyaku-12h.md` (orchestrator-owned, mtime 06:19:57, names `kumitate` once at
L63 in the next-block schedule) — pre-existing, **not** a misroot. `.ufo/waves/round-24/w2/…` is a
near-miss (its `w1` hits are round-23). ExecSweepMisroot's independent sweep reaches the same result
on the same six files.

## Check 3 — protected paths

| path | result |
|---|---|
| `shokuknow` | one write in window, `lanes/tabi/round8/.work/ratelimit-series.tsv` (rate-limit TSV, 0 kumitate mentions) — tabi lane, not a kumitate seat |
| fleet `.scratch/` | untouched (only the 06:19 orchestrator goal file) |
| fleet `.ufo/state/` | untouched (`find -newermt 06:39:10` empty) |
| fleet `templates/` | untouched (newest 2026-10-19) |
| fleet `scripts/` | `scripts/hyaku/lane-addendum.md` rewritten at 06:47 **by the hyaku orchestrator** (run-6 directives; 0 kumitate mentions in the diff); `hyaku.env` untouched |
| `MANIFEST.json` | untouched, sha256 `4af1c7e8…`, mtime 06:33:34 |
| sibling lanes | writes exist in tameshi/chousa/souji repos — each its own round; no r61 seat targets them |
| `~` outside Projects | only agent-runtime files; no tool installs (matches every seat's report) |

## Findings (detail + exploit path + remediation in `build/SentinelScope/findings.md`)

- **F1 LOW-MEDIUM** — two jj `snapshot working copy` ops (06:42:02, 06:42:43) written by seats'
  read-looking `jj log` (ScoutProxyFull discloses its own; ScoutRoundGates ran the `@-` variant).
  Working-copy commit `@` (change-id `wpmzqrut`) rewritten twice; trees `0676c99…` → `9cf8a2d…`,
  containing only the three declared tracked edits. No untracked scratch was auto-tracked (verified
  in `.jj/working_copy/tree_state` and by `git ls-tree` of both trees: 15 round-61 paths, all
  pre-wave), no ref moved. **Remediation:** any jj invocation in a wave must use
  `--config 'snapshot.auto-track="none()"'` (the L1's own push form) or use git.
- **F4 LOW** — CritControlC1's task says "scratch only, no lane writes" and then names
  `controls/ctl-c1-critic-*.txt` as the write path; the seat followed the explicit path (8 files),
  as did CritControlC2 (7). Fix the header in `build-spec.mjs`.
- **F5 LOW** — the L1 reverted ExecTipReceipts' task-mandated appended note in
  `.ufo/waves/round-60/close/dispatch60-tip.txt` at 06:43:48 (`edit … CUT 4.=4`); the file now
  equals HEAD, and `w1/ExecTipReceipts.md` still describes the note version. Record the revert in
  the round-60 erratum.
- **F6 LOW** — the tip receipt embeds an ephemeral `/tmp/a60-probe.*` path, so it is not
  byte-reproducible across runs; strip or hash the suffix in the probe.
- **F8 LOW** — `scripts/make-dispatch-actual.mjs` writes to `resolve(--out || dirname(--registry))`
  with no lane confinement; `--registry`/`--out` can point at the fleet root. Assert the out dir is
  `<root>/.ufo/waves/round-<N>/<wave>`.
- **F2/F3/F7/F9/F10 INFO** — sentinel's own jj lock churn (no op written); git index stat refresh;
  wave artifacts still untracked (P2 depends on L1 staging); no out-of-lane tooling writes; the
  fleet-scripts/`.ufo` mtimes are the orchestrator's, not a seat's.

## Hand-off for the L1

1. Stage exactly the declared set above; do **not** sweep `.ufo/waves/round-61/build/` scratch into
   the commit unless the round's convention wants it (P2 only needs `w1/`).
2. Re-run `node scripts/readme-map.mjs` after the C2 map row (it was CLEAN at 06:42, before that row).
3. Avoid bare `jj` commands; if a jj commit is needed, use `--config 'snapshot.auto-track="none()"'`
   so `@`'s snapshot does not fold the working tree in.
4. Carry F5 and F6 into the round-60 erratum / lesson.

## Limits

Attribution is by path + declared target + report admission; a write-then-restore would leave only an
mtime (F5 is the one such case, attributed from the L1 transcript). Concurrent non-kumitate activity
in the fleet root and campaign tree is recorded, not judged. No tools installed; no pacman
transaction attempted.
