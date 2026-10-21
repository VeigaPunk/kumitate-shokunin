EXEC pins done files=3 revision-match=yes

# ExecPinFiles — three committed pin literals (data only, no code changes)

Authored the three pin files as exact literals in private scratch
(`/fast/scratch/kumitate-r36/w/ExecPinFiles/lane`, branch `r36-expinfiles` off
`0614092e0804aaca06642cb3a263a05c1cacc98e`), validated them, and delivered the patch
`/fast/scratch/kumitate-r36/w/ExecPinFiles.patch` (2164 bytes, +42 lines, a/b prefixes,
applies cleanly to the base commit). The production lane tree at
`/home/vgpnk/Projects/shokunin/kumitate-shokunin` was NOT touched except for this report;
integration belongs to the L1 (KumitateR36).

## .ufo/pins/origin.json
```json
{
  "contract": "kumitate-origin-pin-v1",
  "repo": "ufo-fsd-alpha",
  "revision": "31c465f15669f744848bd9f5d56191c5085670f7",
  "clone": "/fast/scratch/kumitate-r36/src",
  "recreate": "git clone --no-hardlinks file:///home/vgpnk/Projects/ufo-fsd-alpha /fast/scratch/kumitate-r36/src && git -C /fast/scratch/kumitate-r36/src checkout -q --detach 31c465f15669f744848bd9f5d56191c5085670f7 && chmod -R a-w /fast/scratch/kumitate-r36/src",
  "verified_at": "2026-10-21"
}
```

## .ufo/pins/surface-known.json
```json
{
  "contract": "kumitate-surface-known-v1",
  "revision": "31c465f15669f744848bd9f5d56191c5085670f7",
  "findings": [
    {
      "surface": "sighting",
      "kind": "VERB_UNDECLARED",
      "check": "VERB_DISPATCH",
      "subject": "surface"
    }
  ]
}
```

## .ufo/pins/fidelity-ratchet.json
```json
{
  "contract": "kumitate-fidelity-ratchet-v1",
  "revision": "31c465f15669f744848bd9f5d56191c5085670f7",
  "notes": {
    "corpus/knowledge/cost-and-profile.md": 0,
    "corpus/knowledge/distill-and-l3.md": 0,
    "corpus/knowledge/failure-telemetry.md": 0,
    "corpus/knowledge/loop-driver.md": 0,
    "corpus/knowledge/native-judge-pipeline.md": 0,
    "corpus/knowledge/native-trial-launch.md": 0,
    "corpus/knowledge/ops-watchers.md": 0,
    "corpus/knowledge/queue-and-claim.md": 0,
    "corpus/knowledge/remaining-scripts-census.md": 0,
    "corpus/knowledge/route-probe-cluster.md": 0,
    "corpus/knowledge/route-resolution.md": 0,
    "corpus/knowledge/runtime-remainder-census.md": 0,
    "corpus/knowledge/runtime-support.md": 0,
    "corpus/knowledge/sighting-wall.md": 0,
    "corpus/knowledge/swarm-wave-lifecycle.md": 0
  },
  "total": 0
}
```

## Validation (19 PASS / 0 FAIL)

Command: Python validator over the three files plus
`git -C /fast/scratch/kumitate-r36/src rev-parse HEAD`; full transcript also retained at
`/fast/scratch/kumitate-r36/w/ExecPinFiles/validation.txt`.

```
PASS PARSE origin.json :: 469 bytes
PASS PARSE surface-known.json :: 258 bytes
PASS PARSE fidelity-ratchet.json :: 859 bytes
PASS SRC_REV :: 31c465f15669f744848bd9f5d56191c5085670f7
PASS origin.contract
PASS origin.repo
PASS origin.revision==src HEAD :: 31c465f15669f744848bd9f5d56191c5085670f7
PASS origin.clone :: /fast/scratch/kumitate-r36/src
PASS origin.verified_at
PASS origin.recreate no source write :: git clone --no-hardlinks file:///home/vgpnk/Projects/ufo-fsd-alpha /fast/scratch/kumitate-r36/src && git -C /fast/scratc...
PASS known.contract
PASS known.revision==src HEAD
PASS known.findings exact :: [{"surface": "sighting", "kind": "VERB_UNDECLARED", "check": "VERB_DISPATCH", "subject": "surface"}]
PASS ratchet.contract
PASS ratchet.revision==src HEAD
PASS ratchet.notes == prototype nonok>0 set :: 15 notes; prototype 15; diff=[]
PASS ratchet.ceilings all 0 :: [0]
PASS ratchet.total :: 0
PASS ratchet note keys all .md under corpus/knowledge
```

`revision-match=yes`: all three `revision` fields equal
`git -C /fast/scratch/kumitate-r36/src rev-parse HEAD` =
`31c465f15669f744848bd9f5d56191c5085670f7`.

## Recreate one-liner test (destination substituted into scratch)

Ran the same clone/checkout/chmod chain against
`/fast/scratch/kumitate-r36/w/ExecPinFiles/recreate-test/src` (source read-only):

```
RECREATE_HEAD=31c465f15669f744848bd9f5d56191c5085670f7
RECREATE_TOP=dr-xr-xr-x
SOURCE_HEAD_MTIME_UNCHANGED=yes
CLEANED
```

Test clone removed afterwards. `file://` + `--no-hardlinks` means no hardlink shares inodes
with `/home/vgpnk/Projects/ufo-fsd-alpha`, so the final `chmod -R a-w` cannot change the source
tree's modes either. [INFERENCE] Full-history clone (not `--depth 1`) is used because the pin
commit need not be a branch tip; the clone's `.git` also ends read-only, matching the pinned
clone's `dr-xr-xr-x` `.git`/top level.

## Patch integrity

```
$ git -c diff.mnemonicPrefix=false diff --cached --binary   # in scratch lane clone
 .ufo/pins/fidelity-ratchet.json | 22 ++++++++++++++++++++++
 .ufo/pins/origin.json           |  8 ++++++++
 .ufo/pins/surface-known.json    | 12 ++++++++++++
 3 files changed, 42 insertions(+)
APPLY_CHECK_OK_AB                     # git apply --check in pristine worktree @0614092e
APPLIED_PARSE_OK                      # applied + node JSON.parse of all three files
```

Patch path: `/fast/scratch/kumitate-r36/w/ExecPinFiles.patch`.

## Ratchet derivation (prototype note list)

Prototype `.ufo/waves/round-36/baseline/fidelity-prototype-v1.txt` non-ok anchors per note
(now ceiling 0): ops-watchers 189, remaining-scripts-census 177, native-trial-launch 35,
sighting-wall 35, route-probe-cluster 31, cost-and-profile 25, failure-telemetry 22,
runtime-support 14, loop-driver 11, runtime-remainder-census 11, swarm-wave-lifecycle 10,
distill-and-l3 8, queue-and-claim 8, route-resolution 8, native-judge-pipeline 4.
TOTAL nonok=588. Notes at nonok=0 (`gate-verdict`, `native-transcript-ledger-seats`,
`test-inventories`) are intentionally absent from `notes`; per the ratchet contract absence
already requires nonok=0, and the item scoped the list to notes currently carrying non-ok
anchors.

## Risks / blockers

- None for this item; no code changed, no tool installs, no package transactions.
- [INFERENCE] These files are data for sibling items: `claims-check --pin`, `proxy-check --pin`,
  `surface-probe --pin/--known`, `claims-check --fidelity-ratchet`. If any consumer's default
  pin path differs from `.ufo/pins/origin.json`, the L1 must reconcile it; PIN v1 specifies
  `<self>/.ufo/pins/origin.json` as the default.
- Executor contract honored: no writes to the lane, fleet repo, jj state, or Git index; no
  subagent dispatch. Scratch-only artifacts:
  `/fast/scratch/kumitate-r36/w/ExecPinFiles/{lane,validation.txt}`.
