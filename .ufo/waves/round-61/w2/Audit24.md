# Audit24 — Round 61 Wave 2: sibling-overlap scan recheck (reviewer)

Seat: `L1Kumitate61.Audit24` (reviewer, leaf). Axes: operability, coverage.
Target artifact: `.ufo/waves/round-61/build/ConnectorSiblings/scan.md` and its
seat report `.ufo/waves/round-61/w1/ConnectorSiblings.md`. Verdict on the task:
the scan is accurate on every negative it ran, but it **missed same-surface
lane/quality entries on four of its five surfaces**, and one of its two
"bounded move" recommendations was not carried into the production rows.

All greps below are literal re-runs performed for this audit; no lane production
file, gate script, SOURCES row, lesson or scorecard was edited.

## Findings

### F1 (high, operability) — the mirror C1 "bounded move" was not recorded; the staged merge block collides with the registry on nearly every staged source

The scan's §4 proposed recording the reservation in the S195 `scope` cell and a
`campaign-row:` line after the entry header. Post-landing state:

- `grep -c 'campaign\|shokuknow\|renumber' corpus/SOURCES.md` → `0`;
  `corpus/knowledge/temporal-worker-versioning-pinning.md` → `0`. Neither the row
  nor the entry carries the note. `ScribeSourcesRows.md:86` shows the seat saw
  the collision and deliberately preserved the draft; the reservation note was
  the connector's recommendation, not an implemented edit.
- The staged block (`/home/vgpnk/Projects/shokuknow/merge/kumitate/SOURCES.append.md`)
  is a full re-key that collides with the current lane registry on **nearly every
  staged row**: by id (E03) and by URL (E04/W04). Mapped by URL/scope:

| staged id | staged source | lane row it duplicates |
|---|---|---|
| S195 | MCP Architecture overview | S125 (same URL, same scope class) |
| S196 | Temporal — Detecting Activity failures | S126 (supersedes S117) |
| S197 | MCP Tasks ext spec | S127 |
| S200 | Bailian managed-agents-multiagent | (new; no lane row) |
| S201 | Bailian managed-agents-introduction | S131 (same URL) |
| S203 | Stop Means Stop | S133 |
| S205 | CyberAgent Durable Execution | S135 |
| S206 | Zenn MCP stateless | S136 |
| S211 | Where Does Exactly-Once Live? (bis) | S134 |
| S217 | Temporal Worker Versioning | S195 (this round's row) |

So the E03-for-S195 case the scan described is real but **not the only
collision**: a verbatim append trips `E03 duplicate id` on ~11 staged rows and
`E04/W04` on the same set. Because the note was not recorded, the merge applier
has no in-file marker forcing renumbering; the collision class will be
silent until the applier runs the census.

### F2 (medium, coverage) — dispatch/wave-record evidence: three sibling gates and one standing lesson are missed prior art

Scan §2's negative ("no sibling holds a `dispatch-actual.json`/`launcher-progress.tsv`
gate") is literally true, but the surface is broader. Missed same-surface entries:

- **tameshi r22** — `tools/wave-accounting.py` is a durable, root-level, committed
  gate (`wave-accounting-v1` schema, digest-pinned bundle, `TOTAL_MISMATCH`
  checks, `failed-with-report` seats stay failed), registered in `SKILL.md:1997`,
  with a capability row `callback-authoritative wave accounting` in
  `SCORECARD.md:1523` and a knowledge entry
  `corpus/knowledge/callback-authoritative-accounting.md`. It implements exactly
  the dead-seat/report-presence rule the scan ascribes to kaidoku r16 — and its
  grounding is tameshi's **QUALITY43/45** lesson rows (`round-21.md:79`,
  `round-22.md:46`): "QUALITY43 forbids dispatch-as-completion … both
  failed-with-report seats remain failed". That is the same-surface **quality
  entry** the scan's own C4 doctrine cites but never locates.
- **kake r51/r52** — `build_wave_evidence.py` and `c51_wave_ledger.py`/
  `c52_wave_ledger.py` derive committed `settlement.json`, `wave-timing.json`,
  `round-time-accounting.json` and arbitrate L1/L2/L3 checks against
  `dispatch-command.txt`; capability rows `SCORECARD.md:4207,4249`, gate rows
  `SKILL.md:1214`.
- **mori r20** — `tools/mori-wave-settlement.py` (gate row `SKILL.md:188`,
  knowledge `corpus/knowledge/wave-settlement-r20.md`): a wave-level settlement
  scan with `partial`/`unsettled`/`unavailable` states.
- **kaidoku** — `corpus/lessons/2026-10-18-wave-dispatch-counting.md` (parent
  counting defect, "freeze the roster before you record it") is a standing lesson
  on the same surface; the scan cites kaidoku r16/r18 but not this file.

### F3 (medium, coverage) — SOURCES census mechanics: chousa r41's W04 disposition gate is the exact precedent for E5's six W04 lines

Scan C3 handles the `--file`/`--root` regression and lists the six pre-existing
W04 lines, but misses that **chousa r41** already built a disposition gate over
this exact class: `W04_DISPOSITIONED=5/5` with a committed
`corpus/evidence/round41/w04-dispositions.tsv` (`round-41.md:10-51`,
`evidence/round41/claims.md:87-114`, `SKILL.md:106`). E5's stated W04 set and
the staged block's W04 candidates are precisely the input that gate consumes.
Also present but unrecorded: kagi's per-lane `corpus/sources-census.sh` (gate
row `SKILL.md:701,754`) and kama's `tools/sources-append-only.py` (append-only
registry variant between revisions).

### F4 (medium, coverage) — readme-map maintenance: the scan undercounts the sibling surface

Scan C2 frames the divergence as "mori r44 M6 vs. this lane's gate". The actual
landscape: kaidoku (`corpus/README.md` `## Coverage map`, counted 116/116 at a
pinned revision via "command A", `SCORECARD.md:23,46`), audio, chousa,
game-dev-2d, game-dev-3d all maintain `## Coverage map` sections; kagi keeps no
per-file row table at all. The row-shape rule is lane-specific, but the scan's
"closest prior art" for E6 is narrowed to mori M6's single row, and the
index-integrity counting precedent (kaidoku) is absent.

### F5 (low, coverage) — fleet report lineage for the Temporal surface was not cited

The scan's §2 "No sibling knowledge entry covers worker versioning" holds
(re-verified: sibling hits are false positives — e.g. `game-dev-3d` materials
pinning, `kaidoku` REA skill contract, `kotodama` timeline identity). But the
fleet-side lineage of this lane's own Temporal theme is in the enumerated-by-name
report dirs it never read: `.ufo/reports/round-55/kumitate.md:148` (S112
rejected, Event-History/Replay), `round-56/kumitate.md:153` (S116 rejected), 
round-57/kumitate.md:195` (S117 admitted), `.ufo/waves/kaika-w1/kumitate-art.md:173`
(workflow-versioning/patching leads). S195's scope cell ("the registry has not
held this concepts page before") is accurate, but a reader of the scan gets no
pointer to the prior reject/admit history.

## Verified-clean (scan claims that survived re-run)

- `grep -rliE 'temporal' --include='SOURCES.md' */corpus/SOURCES.md` outside this
  lane → only non-product temporal hits (lore S009/S020, kengaku S081, kotodama
  S022, mori r38 prose, chousa S089 temporal leakage). No lane registers
  `docs.temporal.io/worker-versioning.md`.
- No sibling knowledge file covers worker versioning/code pinning (false-positive
  greps confirmed above).
- Campaign package routes `temporal-worker-versioning-pinning.md` to kumitate
  only (`grep -rl` over `merge/knowledge/` → kumitate paths plus non-product
  "temporal" hits elsewhere).
- No sibling has `launcher-progress.tsv`/`dispatch-actual.json` (fleet-wide
  `find`); no sibling SCORECARD capability row is named `dispatch-evidence`.

## Post-landing state of the round's own record (context)

- `node scripts/dispatch-evidence.mjs --root … --round 61 --wave w1` →
  `DISPATCH_EVIDENCE: CLEAN (seats=32 sessions=32 exit0=32 reports=32 dead=0)`,
  exit 0, as frozen.
- `.ufo/waves/round-61/w1/swarm-registry.json` → 32/32 members with non-null
  `agentId` (`updatedAt 2026-10-25T09:41:05Z`) — the G1 class is absent, as the
  scan's C4 claims.
- `.ufo/pins/readme-map.json` → `version:2`, `covered=148`, includes
  `knowledge/temporal-worker-versioning-pinning.md` and the R60-V8 row;
  `corpus/README.md:182` carries the temporal map row.
- `grep -cE '^\| S[0-9]{3} \|' corpus/SOURCES.md` → 134; S195 = Temporal Worker
  Versioning row present (opened 2026-10-25, `used-by` names the entry).

## Residual gaps

- Merge-applier behavior is not observable from the lane (campaign tree
  read-only, per wave constraints); F1's impact depends on the applier.
- Command A's exact counting command for kaidoku's coverage map is referenced
  across SCORECARD rows but not reproduced here; the measured count and pinned
  revision are recorded as above.
