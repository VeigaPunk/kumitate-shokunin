S8WRITER sections=60 errors=1 patch=/fast/scratch/kumitate-r35/w/ExecS8Writer.patch

## Result

- Changed only `corpus/knowledge/remaining-scripts-census.md` in the private clone at `/fast/scratch/kumitate-r35/w/ExecS8Writer/lane`.
- Re-censused the pinned `31c465f15669f744848bd9f5d56191c5085670f7`: script layer 88, S1–S7 28, S8 60; current S8 table totals 33,367 lines (22 suites, 30 tools, 3 shims, 4 assets, 1 doc).
- Added `omp-route-grammar.mjs` (207 L, tool) with `parseRoute` / `MAX_CHAIN_LENGTH` anchors, and `ufo-swarm-registry.mjs` (173 L, tool) with `SWARM_REGISTRY_SCHEMA` / `loadRegistryDocument` anchors. Updated current table line counts against the pin, removed all five deleted paths from the table and member sections, and appended their `964f443e` / deletion-commit / old-primary-symbol history as bullets.
- Kept 2026-10-14 `964f443e` values dated as history; updated the current title, membership arithmetic, and probe-arm counts to 60.
- Final note evidence: `corpus/knowledge/remaining-scripts-census.md:1` title; `:95-107` current census; `:142` and `:174` new table rows; `:641-643` and `:828-830` new member sections; `:233-239` Arm 1 output; `:333-338` Arm 2 output; `:844-850` departed-member bullets.

## Commands and retained outputs

Pinned source identity:

```text
$ git -C /fast/scratch/kumitate-r35/src rev-parse --short=8 HEAD && git -C /fast/scratch/kumitate-r35/src rev-parse HEAD
31c465f1
31c465f15669f744848bd9f5d56191c5085670f7
```

Added-file line counts and source deletion log:

```text
$ wc -l /fast/scratch/kumitate-r35/src/scripts/omp-route-grammar.mjs /fast/scratch/kumitate-r35/src/scripts/ufo-swarm-registry.mjs
  207 /fast/scratch/kumitate-r35/src/scripts/omp-route-grammar.mjs
  173 /fast/scratch/kumitate-r35/src/scripts/ufo-swarm-registry.mjs
  380 total
$ git -C /fast/scratch/kumitate-r35/src log --diff-filter=D --format='%h %cs %s' 964f443e..31c465f1 -- scripts
87e6ab3 2026-10-19 swarm: one registry authority, producer-derived collect bounds, run-proven state (P0 F2 F3 F4 F6 F12)
2a04baf 2026-10-19 self-refine: delete PrimeAgent ledger stack; fix charter-scribe paths, telemetry, unit
```

Pinned membership computation (top-level `*.mjs` plus recursive `scripts/*/` files, subtracting the note's S1–S7 list) returned:

```text
S_members layer: 88
S1-S7 live listed: 28
S8 member list: 60
{
  "S8": 60,
  "lines": 33367,
  "classes": { "suite": 22, "tool": 30, "shim": 3, "asset": 4, "doc": 1 },
  "mjs": 52,
  "topLevel": 51,
  "subdir": 1
}
```

The JSON `subdir` field counts only nested `.mjs` files; the note's `subdir in S8` count, which includes all member file types, is 9.

Arm 1 used the note's exact heading regex via Node (rather than shell `grep`), then sorted both inputs and ran `comm -3`:

```text
$ wc -l < /fast/scratch/kumitate-r35/w/ExecS8Writer/members-live.txt
60
$ comm -3 /fast/scratch/kumitate-r35/w/ExecS8Writer/members-sorted.txt /fast/scratch/kumitate-r35/w/ExecS8Writer/headings-sorted.txt
# no output: 0 differences
```

Arm 2, copied from the note's embedded `member-probe.mjs` and run against the pinned source:

```text
HEADINGS: 60  MEMBERS: 60  DUPLICATE: 0
MEMBER_PROBE: 60/60 ok
```

Assigned acceptance command:

```text
$ node scripts/claims-check.mjs --src /fast/scratch/kumitate-r35/src --row S8
ROWS: 1  YES: 1  NOTES: 1  SECTIONS: 60
ROW S8   form=section   notes=1 sections=60 adv=0
CLAIMS  error MEMBER_COUNT_DRIFT       row=S8  declared 63 members, found 60 distinct sections
SUMMARY: errors=1 warnings=0
CLAIMS: DRIFT (MEMBER_COUNT_DRIFT row=S8 declared 63 members, found 60 distinct sections)
```

Blocker: `SCORECARD.md:126` still declares `63 members`; `corpus/knowledge/remaining-scripts-census.md:438-440` records that the parent owns the registry cell. I did not edit the scorecard or other notes. The requested zero-error gate requires the parent to change the S8 registry count to 60 and rerun the acceptance command.

Patch artifact:

```text
$ git -C /fast/scratch/kumitate-r35/w/ExecS8Writer/lane diff 1770305fae20826b39905a8251ddeca6b4957ac4 > /fast/scratch/kumitate-r35/w/ExecS8Writer.patch && wc -l -c /fast/scratch/kumitate-r35/w/ExecS8Writer.patch
  375 27212 /fast/scratch/kumitate-r35/w/ExecS8Writer.patch
```

## Safety / cleanup

A first patch attempt was accidentally routed to the shared note path. It was restored from the unmodified private clone before implementation continued; `sha256sum` then matched both copies at `c3930a8937de82f651285a0fe4d3544a44b6002a6151de1cd52ea47cbf7ab957`. All final edits and the patch are in the private clone/scratch path. No tools were installed and no tests, builds, linters, or formatters were run.