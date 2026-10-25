# corpus/README.md — rows, frontier bullet, and the pin-registry additions (round 64)

Read first: `corpus/README.md` (`## Coverage map` header at :14, table ends at :188, `## Frontier` at :280) and
`scripts/readme-map.mjs` (`kumitate-readme-map-v2`). The bimap rule, from `evaluate()` (`scripts/readme-map.mjs:203-238`):

- every `*.md` under `corpus/knowledge` + `corpus/lessons` needs exactly one table row (`uncovered:<f>` otherwise);
- every row must name an existing file (`orphan-row:<f>`), a duplicate row is `duplicate-row:<f>`;
- a row is recognised only as `| \`<knowledge|lessons>/<name>.md\` | …` — a first cell starting with `knowledge/` or
  `lessons/` **without** backticks is `format-unmapped`;
- every file must also be listed in `.ufo/pins/readme-map.json` `covered` (`unpinned:<f>`), and every `covered` entry
  must lstat as a regular file in its namespace dir (`stale-covered` / `covered-not-file`).

**Consequence the base receipt shows** (`base/readme-map-before.txt`): `DRIFT files=154 rows=153 covered=153 bad=2`
— `uncovered:lessons/round-63-verifier-spotcheck.md` **and** `unpinned:lessons/round-63-verifier-spotcheck.md`.
A README row alone therefore does **not** clear the DRIFT; the pin registry must gain the file too. Three files are
in play this round (the new entry, `lessons/round-64.md`, the missing `lessons/round-63-verifier-spotcheck.md`).

## 1. Coverage-map rows — insert after `corpus/README.md:188` (the `lessons/round-63.md` row), one line each

<!-- ROWS:BEGIN -->
| `knowledge/jj-workspace-seat-containment.md` | jj workspaces as seat containment (mechanism M7, demonstrated): one repository / one operation log / one object store per seat workspace; what the workspace bounds (the seat's commit surface — snapshots on its own `@`, seat writes absent from the default tree) and what it does not (an absolute-path write reaches the default workspace; the default workspace can rewrite or abandon the seat's head — a rewrite leaves the seat fresh, an abandon makes it stale with files kept on disk, `workspace update-stale` recovers, `workspace forget` leaves the directory); 15-key hermetic demo, and the round-45 entry amended append-only (`Amendment 2026-10-25`) | S198, S199, S200 (rows opened 2026-10-25 in `corpus/SOURCES.md` `## Registry`); `scripts/jj-seat-demo.sh` (contract `kumitate-jj-seat-demo-v1`); `.ufo/pins/source-captures.json` |
| `lessons/round-63-verifier-spotcheck.md` | Round-63 non-author verification (hyaku closure, non-author integrator): C1 `inline-dispatch-evidence` verified (frozen `INLINE63_HELD held=6/6`, independently recounted 40 + 39 = 79 seats, 0 dead) and C2 `multi-agent-coordinator-topologies`/D63 verified (`TOPOLOGY63_HELD held=7/7`, registry 134 → 136); conformance defects (three `-2` stems, 79 seats against the 80–100 plan band, m_flash 44.3%); routed defects D1–D6 for round 64; row added in round 64 so the file does not open the next round in DRIFT | `.ufo/reports/round-63/kumitate.md`; lane tip `bb184a901d88193cf582de03c57e39945df65f15` at the spot-check |
| `lessons/round-64.md` | Round-64: `report-receipt-diff` capability acquisition (contract `kumitate-report-receipt-diff-v1` — a report diffed against the committed receipts it cites, judged by frozen R64 P1–P5) and the jj-workspace seat-containment frontier entry (mechanism M7 demonstrated by `scripts/jj-seat-demo.sh`, judged by frozen J64 J1–J8); `readme-map` and `proxy-check` base DRIFT repaired as maintenance; `considerthese/2026-10-25.md` idea 2 taken as C1, idea 1 applied to the new tool and both counters by the forge seats | `.ufo/waves/round-64/plan.md`; `.ufo/waves/round-64/base/`; `.ufo/waves/round-64/probe/` |
<!-- ROWS:END -->

## 2. Frontier bullet — replace `corpus/README.md:284` with this ONE line

<!-- BULLET:BEGIN -->
- **Isolation substrates for parallel agents:** first entry `knowledge/agent-isolation-substrates.md`; seat-containment mechanisms are mapped, harness isolation is not demonstrated on this host, and jj workspaces advanced in round 64 by `knowledge/jj-workspace-seat-containment.md` — mechanism M7 demonstrated by a 15-key hermetic demo (`scripts/jj-seat-demo.sh`), with the round-45 entry carrying it as `Amendment 2026-10-25`.
<!-- BULLET:END -->

## 3. `.ufo/pins/readme-map.json` — append to `covered` (version stays 2)

Machine-ready fragment: `readme-map-covered-additions.json` beside this file. Append these three strings at the end
of the existing `covered` array (153 entries at the base; 156 after):

```json
  "knowledge/jj-workspace-seat-containment.md",
  "lessons/round-63-verifier-spotcheck.md",
  "lessons/round-64.md"
```

## 4. Proof this closes the gate (run by this seat, `verify-drafts.mjs` in this directory)

The three rows are copied out of this file into a sandbox `README.md` (inserted after the `lessons/round-63.md` row),
the bullet replaces `:284`, the three files exist as stubs, and `scripts/readme-map.mjs` runs against sandbox copies:

- registry unchanged + rows added → `README_MAP: DRIFT … bad=3 first=unpinned:knowledge/jj-workspace-seat-containment.md`
  (proves the pin registry addition is required, not optional);
- registry + the three `covered` strings → `README_MAP: CLEAN files=156 rows=156 covered=156` exit 0.

Exact output is pasted in the seat report `.ufo/waves/round-64/w1/K64ScribeAmendment.md` § Evidence.
