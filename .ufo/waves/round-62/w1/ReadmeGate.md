# ReadmeGate — round-62 corpus README / map / pin update prescription (scout, reports-only)

Scout: `L1Kumitate62.ReadmeGate`. Round 62, wave 1. No files modified; all evidence below is
read-only (tool reads, `git rev-parse`/`git status`, sha256 witnesses, and one run of the
read-only gate `node scripts/readme-map.mjs`).

## 1. Current gate state (observed)

At worktree HEAD `0cbe0d75e5a08718e2256408329692908c837766` (porcelain shows only untracked
`.ufo/waves/round-61/controls/r61-c2-full-forgery.bundle` and `.ufo/waves/round-62/`):

```
$ node scripts/readme-map.mjs
README_MAP: note unpinned:lessons/round-61-verifier-spotcheck.md
README_MAP: DRIFT files=149 rows=148 covered=148 bad=2 first=uncovered:lessons/round-61-verifier-spotcheck.md
exit=1
```

Independent recomputation (registry `covered` v2, README row parse mirroring `loadRows`, on-disk
`*.md` under `corpus/knowledge` + `corpus/lessons`):

- files = 149, rows = 148, covered = 148
- `uncovered:lessons/round-61-verifier-spotcheck.md` — file exists (sha256
  `ab60a3cd1bf5b19d76c1d3b316157695f43c73af612731fe98eb4f1c34b11163`), no README row
- `unpinned:lessons/round-61-verifier-spotcheck.md` — file absent from `.ufo/pins/readme-map.json` `covered`
- no orphan rows, no duplicate rows, no `format-unmapped`, no `stale-covered`

This is the **r61-V5 carry** (round-61 verifier spot-check §6): the round-61 non-author closure
file (`.ufo/reports/round-61/kumitate.md`, fleet commit `88b2c21f…`) landed without its row+pin.
The same round explicitly routed the repair: "Run this in the same change as this file's README
row and its `covered` pin, or `readme-map` opens in DRIFT again (seventh recurrence of the
R56-V3 class)." It also routed the proxy stanza refresh (see §4).

## 2. The gate's contract (what a new corpus file must satisfy)

`scripts/readme-map.mjs` (contract `kumitate-readme-map-v2`, round 58/R57-V3; script sha256
`b1c8bf97eb01fdb2ebfd46521c8e805fa2c36f8e10ce9740531162cd0b8ee74e` = `counter-pins.json`
round-58 `readme-map` entry = SCORECARD line 326 `pin.readme-map`):

- Every `*.md` under `corpus/knowledge` + `corpus/lessons` must carry exactly one coverage-map row
  in `corpus/README.md` whose first cell is a single backticked `knowledge/…` or `lessons/…`
  path: `| `lessons/round-62.md` | … |`.
- Every such row must name a live file (`orphan-row` otherwise).
- Every live file must be pinned in `.ufo/pins/readme-map.json` `covered` (v2, lstat regular-file
  semantics) — `unpinned` otherwise.
- `covered` entries must match `COVERED_RE = /^(knowledge|lessons)\/[A-Za-z0-9._-]+\.md$/`
  (no spaces/unicode in new filenames) and be unique.
- Verdict: `CLEAN files=<n> rows=<n> covered=<n>` exit 0; any bad item is DRIFT exit 1;
  malformed registry/README/missing corpus dir is FAIL-CLOSED exit 2. Selftest: 16/16 PASS.
- The gate never writes. Registry doc rule: "the pin grows by append when a file lands; the
  registry is never rewritten" — order inside `covered` is not scored (currently append-ordered,
  not sorted; `sorted? False`).

## 3. Exact updates required when adding the round-62 lesson and new notes

For **each** new corpus file (the round-62 lesson `corpus/lessons/round-62.md`, plus any new
`corpus/knowledge/<name>.md` note), three edits in **one change** (Q48 / R56-V3 rule):

1. Create the file. Filename must match `[A-Za-z0-9._-]` (gate `COVERED_RE`).
2. Add exactly one README coverage-map row under `## Coverage map` in `corpus/README.md`.
   - Row shape: `| \`lessons/round-62.md\` | <short lesson summary> | <sources/refs> |`
   - Insertion anchor: after the `lessons/round-61.md` row (README **line 183**, verified by
     `grep -n`); the round-61 spot-check row goes immediately after line 183, then the round-62
     row. (Row order is not scored; keep topical grouping.)
3. Append the path to `.ufo/pins/readme-map.json` `covered`.
   - Current tail: `… "lessons/round-9.md"` (line 151), then `]` (line 152), `}` (line 153).
   - Append `"lessons/round-61-verifier-spotcheck.md"` and `"lessons/round-62.md"` (plus any
     new `knowledge/…` ids) before the closing `]`, with trailing commas per JSON.
   - Ids to add (exact strings):
     - `lessons/round-61-verifier-spotcheck.md` (pending R61-V5 repair — required before round-62
       close, else the gate stays DRIFT)
     - `lessons/round-62.md` (round-62 lesson)
     - any new note id, e.g. `knowledge/<name>.md` if a knowledge note lands

Undo-safe verification after the change:

```
$ node scripts/readme-map.mjs
README_MAP: CLEAN files=<n> rows=<n> covered=<n>     # exit 0
$ node scripts/readme-map.mjs --selftest            # README_MAP_SELFTEST: PASS (16/16), exit 0
```

Expected counts: after repairing the round-61 spot-check row+pin → 149/149/149; after adding
`lessons/round-62.md` (and no other notes) → **150/150/150**; `+N` for each additional new note.

## 4. Pin and counter updates in the same change

- **No registry-byte pin exists.** `pin.readme-map` (SCORECARD line 326) and the
  `counter-pins.json` `readme-map` entry pin only `scripts/readme-map.mjs`, which is unchanged —
  appending to `covered` does not invalidate any hash pin. (`readme-map-pin` in probes = the B5
  check on that counter-pins entry, same value.)
- **SCORECARD `kumitate-proxy-v1` stanza (lines 287–311) must be refreshed in place** (R61-V5,
  SCORECARD §Round 61 correction lines 2888–2896). Current stale block: `A=105 C=30 C2=145
  C2_total=145`; the round-61 correction already records the authoritative measured values
  `A=115, C=30, C2=148, C2_total=148` at tip `019a844c` and defers the in-place refresh to this
  round. After the round-62 edits the stanza should read the **computed** values
  (`node scripts/proxy-check.mjs --strict`), i.e. C2 = C2_total = row count = 150 (+N notes);
  refresh A only if new runnable files land (round-62 probes under `.ufo/waves/round-62/` count
  into A — current computed A=115).
- **Add `pin.make-dispatch-actual`** to `kumitate-gate-pins-v1` (SCORECARD ~line 312+) for
  `scripts/make-dispatch-actual.mjs`: sha256
  `f0194314e98e87e86eb1329f36411e249911f9a0120aa4feb702562a54bf3dc9` (routed R61-V5; currently
  `PIN_UNPINNED`).
- Do NOT touch frozen historical receipts/prose (e.g. "CLEAN files=138 rows=138 covered=138" in
  the round-58 claim block) — those are frozen records; only the live stanza is refreshed.

## 5. Adjacent gates to keep green (if new notes open sources)

- If the round-62 lesson/new notes cite a 3+-digit S-id, the S row must exist in
  `corpus/SOURCES.md` `## Registry` (11-cell contract row, `NF=13`, cells for status/opened/used-by;
  see the R61 C2 findings) — otherwise `node scripts/cite-sources.mjs` reports DRIFT
  (`ghosts=1`). If a new source is opened, run
  `sources-census.sh validate --root /home/vgpnk/Projects/shokunin kumitate` → exit 0.
- `node scripts/proxy-check.mjs --strict` must read `PROXY: MATCH` (stanza §4) and
  `node scripts/counter-pins.mjs` must pass (readme-map script pin unchanged).

## 6. Evidence

- Gate run + git state: HEAD `0cbe0d75…`, `README_MAP: DRIFT files=149 rows=148 covered=148 bad=2`, exit 1.
- Worktree sha256: `scripts/readme-map.mjs` `b1c8bf97…`; `scripts/make-dispatch-actual.mjs`
  `f0194314…`; `.ufo/pins/readme-map.json` `551e7bc5…`; `corpus/README.md` `97c59527…`;
  `corpus/lessons/round-61-verifier-spotcheck.md` `ab60a3cd…`.
- Round-61 verifier spot-check file confirms non-author authorship and the R61-V1..V6 routings;
  R61-V5 (§6) carries the row+pin+stanza repair obligation.
- SCORECARD: stanza block lines 287–311; `pin.readme-map` line 326; round-61 correction lines
  2888–2896 (A=115/C=30/C2=148/C2_total=148 measured, deferral to next round).
- `counter-pins.json`: 17 entries incl. round-58 `readme-map` → `scripts/readme-map.mjs`
  `b1c8bf97…`; no registry-file pin.
