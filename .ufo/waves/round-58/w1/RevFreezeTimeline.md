# RevFreezeTimeline — kumitate round 58

Axes: operability (reproducible revision evidence) and coverage (the complete freeze-to-R1 path set).

**Observed result: independently corroborated.** The explicit-revision Git evidence shows the direct chain base → freeze → R1. The required freeze-to-R1 diff for both counters and both tools is empty, and each named file has the same Git blob ID at both revisions. `readme-map` is v1 at base and v2 at freeze. R1 changes exactly the 16 paths enumerated below.

This is a scoped timeline/byte-stability observation, not an `ATTEST58_HELD` or `DOCTRINE58_HELD` verdict. Neither counter was executed by this seat.

## Timeline

Revisions:

- Base: `c49f2a8dc1e6e5e4341e15ac279185aab7e0be37`
- Freeze: `50548ae5b4a47bb8d8cdc62212ec0648aa3776ee`; parent is the base.
- R1: `6affb9ebde37b7d663658f1959d64f0f0b68f480`; parent is the freeze.

The requested command exited 0 with empty stderr:

```sh
git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin log --oneline c49f2a8d..6affb9ebde37b7d663658f1959d64f0f0b68f480
```

Observed stdout (newest first):

```text
6affb9e round-58: R1 integration — lesson, SKILL item 28, QUALITY Q49, entry clause bindings, S123 capture, controls, assimilation scratch, SCORECARD stanza+pins+rows, LOG
50548ae round-58: freeze — counters+base receipts+scratch-HELD witness (A58/D58), receipt-evidence tool, readme-map v2, pins
```

`git merge-base --is-ancestor 50548ae5b4a47bb8d8cdc62212ec0648aa3776ee 6affb9ebde37b7d663658f1959d64f0f0b68f480` exited 0 with no stdout. The reverse full log records freeze's parent as base and R1's parent as freeze, so precedence is topological rather than inferred from timestamps.

Evidence: `01-log-range.*`, `05-reverse-full-log.*`, and `06-freeze-is-ancestor.*` under `.ufo/waves/round-58/build/RevFreezeTimeline/`.

## Frozen counters and tools

The exact requested scoped command exited 0; both stdout and stderr were empty:

```sh
git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin diff --stat 50548ae5b4a47bb8d8cdc62212ec0648aa3776ee 6affb9ebde37b7d663658f1959d64f0f0b68f480 -- .ufo/waves/round-58/probe scripts/receipt-evidence.mjs scripts/readme-map.mjs
```

An additional `git diff --exit-code` over the same revisions and pathspec also exited 0 with empty stdout. Independent `git ls-tree` readings found these identical modes and blob IDs at freeze and R1:

| Path | Mode at both revisions | Blob at both revisions |
|---|---:|---|
| `.ufo/waves/round-58/probe/attest58-probe.mjs` | `100755` | `bd62df0506fe427fcc9aa418e50f596526e10fd2` |
| `.ufo/waves/round-58/probe/doctrine58-probe.mjs` | `100755` | `8453a9fed5f585f76d1bf755180738862097a2a0` |
| `scripts/receipt-evidence.mjs` | `100755` | `1ac42eb1debf6ed9e42d92a768d2e7e8f0aef6ba` |
| `scripts/readme-map.mjs` | `100755` | `1b4d5bbfbb1364488c20ca3637f4a0a90466c21a` |

Thus no content or mode changed for either counter, the receipt-evidence tool, or the readme-map gate between freeze and R1.

The base-to-freeze scoped diff independently locates their introduction/update at freeze:

```text
A	.ufo/waves/round-58/probe/attest58-probe.mjs
A	.ufo/waves/round-58/probe/doctrine58-probe.mjs
M	scripts/readme-map.mjs
A	scripts/receipt-evidence.mjs
```

Direct object reads show `kumitate-readme-map-v1` in the base file header and `kumitate-readme-map-v2` in the freeze file header. Evidence: `02-frozen-paths-diff-stat.*`, `07-base-to-freeze-frozen-paths.*`, `08-freeze-blobs.*`, `09-r1-blobs.*`, `11-frozen-paths-exit-code.*`, `13-freeze-readme-map.*`, and `14-base-readme-map.*`.

## Exactly what changed from freeze to R1

Full-tree `git diff --name-status` and `git diff --numstat` each exited 0 and reported the same 16 paths. `A` means added and `M` means modified; line counts below are additions/deletions from numstat. No deletions or renames were reported.

| Status | Path | Added lines | Deleted lines |
|---|---|---:|---:|
| A | `.ufo/waves/round-58/assimilation/collisions` | 0 | 0 |
| A | `.ufo/waves/round-58/assimilation/quarantine-slice` | 9 | 0 |
| A | `.ufo/waves/round-58/assimilation/reg-ids` | 123 | 0 |
| A | `.ufo/waves/round-58/assimilation/staged-ids` | 119 | 0 |
| A | `.ufo/waves/round-58/build/ScoutLangGraph/body.html` | 1859 | 0 |
| A | `.ufo/waves/round-58/controls/CtlForgedReceipt.txt` | 1 | 0 |
| A | `.ufo/waves/round-58/controls/CtlNoCoverage.txt` | 1 | 0 |
| A | `.ufo/waves/round-58/controls/CtlUnparseableRev.txt` | 1 | 0 |
| A | `.ufo/waves/round-58/controls/MutCounter58.txt` | 1 | 0 |
| A | `.ufo/waves/round-58/controls/MutDoctrine58.txt` | 1 | 0 |
| M | `LOG.md` | 31 | 0 |
| M | `SCORECARD.md` | 99 | 7 |
| M | `SKILL.md` | 7 | 5 |
| M | `corpus/QUALITY.md` | 7 | 0 |
| M | `corpus/knowledge/failure-recovery-replay.md` | 15 | 63 |
| A | `corpus/lessons/round-58.md` | 117 | 0 |

Observed aggregate: **16 files changed, 2,391 insertions, 75 deletions**. The `collisions` addition is an empty file. None of the four frozen paths appears in this delta.

Evidence: `03-freeze-to-r1-name-status.*`, `04-freeze-to-r1-full-stat.*`, and `12-freeze-to-r1-numstat.*`. The complete patch, including full blob indices, is captured at `.ufo/waves/round-58/build/RevFreezeTimeline/10-freeze-to-r1-full-patch.stdout.txt` with its command, stderr, and exit status beside it.

## Evidence and boundaries

Every executed measurement has a `.command.txt`, `.stdout.txt`, `.stderr.txt`, and `.exit.txt` capture under `.ufo/waves/round-58/build/RevFreezeTimeline/`. Conclusions above use explicit commit objects, not working-tree file contents. No source was assessed, no tool was installed, and this seat made no commit, push, HEAD movement, or mutating Git/Jujutsu operation.

Report: .ufo/waves/round-58/w1/RevFreezeTimeline.md
