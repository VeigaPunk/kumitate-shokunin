# ConnectorSiblings — round 61 cross-axis overlap scan (read-only)

Seat: `L1Kumitate61.ConnectorSiblings` (connector, leaf). Judged on adjacency.
Scope: read-only. No lane writes outside this file and the seat report; no fleet-repo,
sibling-lane, `.ufo/state/`, `MANIFEST.json`, template/script or campaign-tree writes.
No tool installed or upgraded.

Surfaces scanned (the round's five, as briefed): dispatch/wave-record evidence ·
Temporal worker versioning · SOURCES census mechanics · readme-map maintenance ·
capability-table practice.

Sources read: sibling `*-shokunin/corpus/lessons/` newest-by-mtime files and the specific
lessons cited below (mori r44, kaidoku r16/r18/r19, tameshi r42, kotodama r69, chousa
r25–r36, audio r101, game-dev-3d r105/r108, kagi r13/r14/r27, kama r10/r30/r35, souji r23);
fleet `.ufo/reports/` round directories enumerated by name only (round-23/24/25/31/38/44/99),
with `round-60/kumitate.md` read in full; the campaign package under
`/home/vgpnk/Projects/shokuknow/merge/kumitate/`; and this round's own record
(`.ufo/waves/round-61/{plan.md,w1-dispatch.json,w1/}`).

## 1. Contested scope (each with the sibling pointer)

### C1 — `S195` is already reserved by the campaign package for a different source

**Contradiction, stated plainly.**

| side | claim | pointer |
|---|---|---|
| this round, frozen | the Temporal entry's `source:` cites **S195**; S195 is mined / opened 2026-10-25 / `used-by` names exactly that entry | `.ufo/waves/round-61/plan.md:66` (E3), `:89`, `:144` |
| campaign package (out of lane) | "lane registry currently holds **133** rows; **first staged id is S195**" — and its first staged row **S195 = MCP Architecture overview**, `https://modelcontextprotocol.io/docs/2026-07-28/learn/architecture` | `/home/vgpnk/Projects/shokuknow/merge/kumitate/MERGE-REPORT.md:9`; `SOURCES.append.md:7` |
| same package | the **Temporal — Worker Versioning** row for the very URL this round opens is staged as **S217**, `https://docs.temporal.io/worker-versioning.md`, mined 2026-10-23, `used-by` `corpus/knowledge/temporal-worker-versioning-pinning.md`; the staged entry's header reads `source: S217` | `SOURCES.append.md:29`; `knowledge/corpus/knowledge/temporal-worker-versioning-pinning.md:2` |

Lane registry now: 133 rows, ids `S195`, `S196`, `S217` all absent
(`grep -cE '^\| S[0-9]{3} \|' corpus/SOURCES.md` → 133; `^\| S19[0-9] ` → S190, S194 only).

Consequences the census already defines:
- `E03 duplicate id` — `scripts/sources-census.sh:25` — fires if the campaign block is
  appended verbatim after this round takes S195 (its own S195 = MCP). That turns E5 red
  for **every later round**, not just this one.
- `E04 duplicate URL+scope` vs `W04 same URL across scopes` — `scripts/sources-census.sh:645-649`:
  identical URL **and** scope is fatal; identical URL with a *different* scope cell is a warning.
  The two rows' scopes are honestly different (2026-10-25 re-grounded read vs the package's
  2026-10-23 read), so verbatim append lands in W04 territory — but only if the scope cells
  do not converge.
- The package also stages the **same knowledge file** as `new-file`
  (`MERGE-REPORT.md` "Knowledge files to add" row for
  `corpus/knowledge/temporal-worker-versioning-pinning.md`, round3). The two entries in that
  table marked "target already exists — append, do not replace" are *other* files; this one is
  `new-file`, so a merge applier has no instruction not to overwrite this round's re-grounding
  (E2's 2026-10-25 `verified-at` and E4's sha256 pin would be lost).
- The staged S217 row carries **no body sha256** — only a `recheck:` curl/grep command — so
  E4 cannot be satisfied by the staged row in any case; this round must write a fresh row.

**Coordination note:** the campaign tree is read-only for every seat here. The reconciliation
belongs to whoever applies `merge/kumitate/` later; this round can only record the reservation.

### C2 — README-map row grammar is lane-specific; the sibling's shape fails this lane's gate

- This lane: a coverage row is a table line whose **first cell** is a single backticked
  `knowledge/…` or `lessons/…` path; a corpus-shaped first cell that does not parse is
  DRIFT `format-unmapped`, and a `corpus/`-prefixed cell is *not* a row at all → the file
  reads `uncovered` (`scripts/readme-map.mjs` header, "Row rule" + "Findings").
- mori r44: `count-c3.py:150-152` is a **substring** test of the entry path in the README body,
  and its M6 repair made the row name `corpus/knowledge/pid-probe-conclusion-r44.md`
  verbatim (`mori-shokunin/corpus/lessons/round-44.md`, M6 row; the string appears in prose at
  `mori-shokunin/corpus/README.md:639`). mori's own map rows elsewhere use the
  corpus-relative shape (`corpus/README.md:7-8`) — the two shapes coexist in one lane, which is
  exactly why M6 could pass there and would DRIFT here.
- Consequence for E6: a seat copying a sibling row shape (or the staged entry's own
  `coverage-map:` wording) lands `uncovered`/`format-unmapped` here. The row must be
  `` | `knowledge/temporal-worker-versioning-pinning.md` | … | `` **and** the path must be
  appended to `.ufo/pins/readme-map.json` `covered` (v2, append-only): currently
  `covered=146`, files `56 + 90 = 146`, no temporal member
  (`node -e` over `.ufo/pins/readme-map.json`). `ExecReadmeMapFix` already inserted one member
  this wave (`.ufo/waves/round-61/w1/ExecReadmeMapFix.md`), so the new entry is a **second
  append to the same two files**.

### C3 — Census mechanics: the sibling's known defect is this round's correct form

- mori M3 (`corpus/lessons/round-44.md`, M3 row): `count-c3.py:132-145` stages the registry as
  `$TMPDIR/c3-*/SOURCES.md` and calls the census with `--file`; the census resolves
  `dirname(file)/..` → E11 on every `used-by` → exit 1. The fix is `--root` + lane.
- This round's E5 already uses that form (`plan.md:72`: `--root /home/vgpnk/Projects/shokunin kumitate`).
  **Do not regress to `--file`** in any seat's harness, and do not stage a registry copy.
- mori `SentTools` (same lesson) records that the C3 census default "is a fleet file not in the
  lane" — the same class as this round's hard-coded fleet path. It is a **replay limit**, not a
  defect: the gate cannot run off-host. Worth one clause in the capability row, not a change.
- Current state, re-derived read-only just now:
  `scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin kumitate` →
  `kumitate ok …/corpus/SOURCES.md`, `exit=0`, with six pre-existing `W04` lines
  (S034, S068, S084, S095, S123, S126). `scripts/sources-census.sh shared --root …` reports
  **no** `docs.temporal.io` URL shared with any lane (`grep -i temporal` → no match).

### C4 — Dispatch/wave-record evidence: no sibling holds this format; the closest prior art is kaidoku's `ufo-wave-outcomes-v1`

- Fleet-wide, `launcher-progress.tsv` and `dispatch-actual.json` exist **only** in this lane
  (`find . -maxdepth 4` from the fleet root, excluding `.ufo`): r58 progress, r59 progress +
  actual, r60 progress only. No sibling lane produces either file → no schema conflict, and no
  shared contract to inherit. This round's C1 is the first *general* gate over that pair.
- Closest prior art, and it is close:
  - `kaidoku-shokunin/.ufo/waves/round-19/evidence/wave-outcomes/r18-w2-outcomes.json`,
    schema `ufo-wave-outcomes-v1`, rule as recorded:
    `report_present=<report-dir>/<name>.md exists as a regular file with size>0`,
    `cause=causes[<name>|<agentId>]` non-empty, `exit 1 iff any seat with report_present=false
    has cause null`.
  - `kaidoku-shokunin/.ufo/waves/round-18/w2/WaveEvidenceComplete.md` **G1**: the
    dispatch-declared registry stayed `0/89` `agentId: null` while `record` wrote a side file
    with 89 ids; the canonical collector then reads 0/89 by default. **This round's
    `w1/swarm-registry.json` is `0/32` null** (32 members, `updatedAt 09:41:05Z`) — G1 absent.
  - Same file, **G2/G3**: no settled-outcome record, and 88/89 seats ended normally with one
    aborted. kaidoku r16 states the rule this round must keep: "the dead-seat counts are
    observed session outcomes, not a lane-script inference from missing reports"
    (`kaidoku-shokunin/corpus/lessons/round-16.md:160,174`). This round's `dead` term is
    `exit !== 0 || !session` from the launcher's own rows
    (`scripts/dispatch-evidence.mjs:114`) — **compliant**; the report-presence term is separate
    and is not used to infer death. Say so in the seat report; it is the one place a reviewer
    from kaidoku's precedent would look for a defect and find none.
  - `tameshi-shokunin/corpus/lessons/round-42.md:135`: `report_exists: false` for an *existing*
    seat report — the report-presence class this gate must survive. This round's own selftest
    has `dead-seat-credited` and `dead-mismatch` arms (`dispatch-evidence.mjs:218,254`); the
    analogue is a report present but unreadable/empty (`statSync(...).size > 0`, `:120`) — a
    zero-byte report is already `REPORT_ABSENT`, a *directory* named `<seat>.md` would throw and
    also read absent. No change needed; named as the class a mutant should probe.
- `w1-dispatch.json` declares 32 spawn / 0 resume and a filled registry; `w1/` holds 7 seat
  reports at scan time and **no** `launcher-progress.tsv` yet, so a gate run right now reads
  `FAIL-CLOSED progress-absent` (exit 2) — correct, and the same shape as the C1 control.
- r59's actual record is the honest-dead precedent:
  `{planned:32, sessions:31, exit0:31, reports:31, dead:["SentinelBounds"]}`. r61's frozen CLEAN
  line expects `dead=0`; a mutant fixture that borrows r59's dead-seat shape must not be
  confused with the real wave record.

### C5 — Capability-table practice: the fleet's header is uniform; this lane's rows already drift

- Header is identical across lanes (`| Capability | What it can now do | Evidence pointer |
  First-working round |`) — audio `SCORECARD.md:1083`, chousa `:463`, kumitate `:1774`. No
  format question; the practice question is what the pointer must carry.
- chousa's precedent for a *claim without a row*: `chousa-shokunin/SCORECARD.md:1305` reconciles
  eight `LOG.md` "Capabilities +1" claims into rows with historical first-working rounds,
  re-run at a named revision. This round's P3 is the mirror case (a row for a capability whose
  round-60 predecessor had none).
- kotodama's precedent for honesty in the row: `kotodama-shokunin/corpus/lessons/round-69-verifier-spotcheck.md:70-90`
  — before/after with a **stamped revision and tree**, the counting command, an explicit
  "Ceiling, stated by the lane", and an evidence class.
- This lane's own drift class is already in its errata: the `sources-registry` row quotes
  `SOURCES_CHECK: CLEAN (rows=20 …)` while the same row's evidence reads `rows=38` at r41
  (`SCORECARD.md:2090`) and `rows=45` at r42 (`:2127`), and the r43 capability row is
  explicitly withdrawn as unreproducible at the open revision (`:2171-2177`). A new
  `dispatch-evidence` row that quotes a bare CLEAN line inherits exactly that class. The
  counters already print a revision (`PROXY … src-rev=31c465f15669`); the row should carry it.

### C6 — Gate-registry standard: a new gate without a `SKILL.md` row repeats a named fleet defect

- kotodama r69 **D7**: counters have no gate-registry row; PROTOCOL §Gate standard *Registry*
  unmet (`SKILL.md:619` has 13 rows, none for the counters).
- mori r44 `ExecGateInventory`: 33 gate/probe tools, 18 PASS / 15 FAIL, `REGISTRY=unmet`
  fleet-wide (`corpus/lessons/round-44.md`, wave table).
- This round adds `scripts/dispatch-evidence.mjs`; the frozen predicate P1–P4 has **no registry
  arm**, and the lane's own `sources-registry` row already claims "separate `SKILL.md`
  gate-registry row". Not a contradiction with the frozen bytes — a standard left unmet by
  silence.

### Not contested — a name collision only

game-dev-3d r105 "README mapping" (`game-dev-3d-shokunin/reports/round-105/pc/ruling-draft.md:10`)
is the **card/label** mapping (proven vs `unproven-runtime`), not `corpus/README.md` coverage
rows. Same words, different object; do not cite it as prior art for E6.

## 2. Negative findings (searched, absent)

- No sibling lane registers `https://docs.temporal.io/worker-versioning.md`
  (`grep -rli temporal --include=SOURCES.md` outside this lane returns lore S009/S020 (temporal
  *ordering*), kengaku S081 (contamination taxonomy), mori r38 prose, kotodama S022 (PeriodO) —
  none is Temporal-the-product). `sources-census.sh shared` confirms: no shared temporal URL.
- No sibling knowledge entry covers worker versioning / code pinning
  (`grep -rli 'worker.versioning' --include=*.md` outside this lane → 0 hits).
- The campaign package routes `temporal-worker-versioning-pinning.md` to this lane only
  (`grep -rl` over `merge/` → kumitate paths only).
- No sibling holds a `dispatch-actual.json`/`launcher-progress.tsv` gate, and none has a
  capability row named `dispatch-evidence` (`grep -riE '^\| .*(dispatch|wave|seat).*(evidence|record|gate)' */SCORECARD.md`
  outside this lane → no such row).

## 3. Coordination notes (in-lane, not sibling lanes)

1. `ScribeSourcesRows` owns the `S195` row and `ScoutSourceWorkerVersioning` owns the capture at
   `.ufo/waves/round-61/build/ScoutSourceWorkerVersioning/body.md` (E4's sha256 pin). Neither may
   write the other's file; the row's `used-by` must name the entry exactly.
2. `ScribeSourcesRows` and `ExecReadmeMapFix` both append to `corpus/README.md` and
   `.ufo/pins/readme-map.json` — append-only, `version: 2`, the R60-V8 row and its `covered`
   member stay. Two appends, no rewrite.
3. `MutDispatchGate` must not stage fixtures under `.ufo/waves/round-61/w1/` (the gate's own
   scan directory) — a fixture `dispatch-actual.json` there would be read as the real record.
4. `ExecDispatchSchemaTool` and `ExecTipReceipts` both touch the C1 surface; the frozen P2 line
   (`dead=0`) must be quoted verbatim from the gate, never retyped.

## 4. One bounded move (see seat report §4)

Record the `S195`/`S217` reservation in the row's `scope` cell and one post-header line of the
entry. Rationale and verification are in `.ufo/waves/round-61/w1/ConnectorSiblings.md`.
