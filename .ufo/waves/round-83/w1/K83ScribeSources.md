# K83ScribeSources — round-83 seat report

Seat: `K83ScribeSources` (scribe; leaf — no dispatch). Lane: `/home/vgpnk/Projects/shokunin/kumitate-shokunin`.
Scratch: `/fast/scratch/hyaku/kumitate-r83/K83ScribeSources/` (created with `mkdir -p`, empty at exit; deleted before yield).
Tooling: none installed or upgraded.

## Deliverable tokens

LESSON: written
MAP: 3 rows added

`MAP` breakdown: 2 knowledge-entry rows (`knowledge/dispatcher-admission-surface.md`,
`knowledge/self-asserted-instants.md`) + 1 row for `lessons/round-83.md`; plus 1 Frontier bullet.
The spec asked for "the two new knowledge-entry rows"; the lesson's own row is added because the
`readme-map` contract (`kumitate-readme-map-v2`) demands one row per live `*.md` under
`corpus/knowledge` + `corpus/lessons` and the row precedents (rounds 81/82) count the lesson itself.
Stated plainly so the L1 is not surprised by `n = 3`.

## What I ran (exact commands, in order)

1. `mkdir -p /fast/scratch/hyaku/kumitate-r83/K83ScribeSources` and
   `cat /home/vgpnk/.omp/agent/RULES.md` — read the tooling directive; no install needed (no package
   was required for this seat).
2. Read `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-83/plan.md` (full).
3. `ls -la .../round-83/ .../controls/ .../probe/ corpus/lessons/` — inventory.
4. `cd /home/vgpnk/Projects/shokunin/kumitate-shokunin && ls corpus/ && wc -l corpus/README.md corpus/SOURCES.md`.
5. `grep -n "S24[0-9]" corpus/SOURCES.md` — located rows S240/S241/S242 at lines 194/195/196.
6. Read `corpus/README.md` (map + Frontier) and the recent lesson rows; read `round-81.md`
   §Gate/§Limits and `round-82.md` §Gate for section convention.
7. `cd /home/vgpnk/Projects/ufo-fsd-alpha && git rev-parse --short HEAD` → `fb7157fc`.
8. `git show fb7157fc:scripts/ufo-swarm-wave.mjs | sed -n '1080,1100p'` and
   `... | sed -n '1083,1092p'`; `... | grep -n "needs at least"` → `1086`.
9. `git show fb7157fc:scripts/ufo-swarm-registry.mjs | sed -n '20,35p'`;
   `... | grep -n "SWARM_REGISTRY_SCHEMA ="` → `27`.
10. `grep -n -i "indicate an instant in time" .ufo/waves/round-83/build/L1/captures/rfc3339.html`
    → capture line 99; `sha256sum rfc3339.html` → `c53b2d121b9f284e2cb28e2989c907470ae26a9db441bcd8a3236c6004a60bee`.
11. Quote-exactness checks (fixed-string):
    - `git show fb7157fc:scripts/ufo-swarm-wave.mjs | grep -Fc 'a wave with spawn lanes needs at least ${laneFloor} lanes (got ${total})'` → `1`
    - `git show fb7157fc:scripts/ufo-swarm-registry.mjs | grep -Fxc 'export const SWARM_REGISTRY_SCHEMA = "ufo-swarm-registry-v1";'` → `1`
    - `grep -Fc 'Date and time expressions indicate an instant in time.' .../rfc3339.html` → `1`
12. Read `scripts/ready-handoff.mjs` and `scripts/omp-census.mjs` (read-only) only to ground the
    Limits section: `grep -n "kumitate-ready-handoff-v3|SWARM_ROLES|ufo-swarm-wave-dispatch-v1|ufo-swarm-registry-v1"`
    and `grep -n "SHAPE_CLOCK|SHAPE_AGE_UNKNOWN|captured=absent"` + contract tag; `grep -n "L1_UNRESOLVED|agents"`.
13. `node scripts/readme-map.mjs` after writing the rows (read-only gate; verifies my own rows parse).
14. `ls -la corpus/lessons/round-83.md corpus/knowledge/dispatcher-admission-surface.md corpus/knowledge/self-asserted-instants.md`
    immediately before mapping — both entries existed at that moment.

No frozen probe (`probe83-c1.mjs`, `probe83-c2.mjs`) was executed by this seat: scoring is the
executors' work and re-running it would be decoration, not evidence for a scribe.

## What I observed (exact output lines)

- `git rev-parse --short HEAD` (ufo-fsd-alpha): `fb7157fc`.
- S240 quote line: `1086:      \`a wave with spawn lanes needs at least ${laneFloor} lanes (got ${total}); split the round's scope into waves of ${laneFloor}-${laneCeiling} same-shape lanes\`,` — the quoted phrase is a substring of line 1086; the enclosing guard `if (spawns.length > 0 && total < laneFloor) {` opens at line 1083, and the requested fence 1085-1091 contains the message line.
- S241 quote line: `27:export const SWARM_REGISTRY_SCHEMA = "ufo-swarm-registry-v1";`.
- S242 quote: capture line `99:   o  Date and time expressions indicate an instant in time.`; capture sha256 `c53b2d121b9f284e2cb28e2989c907470ae26a9db441bcd8a3236c6004a60bee` (matches the S242 row's `c53b2d12`).
- Quote-exactness: `1`, `1`, `1` (each phrase occurs exactly once in its source).
- Source rows read verbatim: S240 line 194, S241 line 195, S242 line 196 of `corpus/SOURCES.md`; all three carry tier `A`, state `queued`, opened 2026-11-04.
- Control receipts (read only, not re-run): `C83_C1: UNMET held=15/27` (base), `C83_C1: UNMET held=3/27` (stub), `C83_C2: UNMET held=13/16` (base), `C83_C2: UNMET held=3/16` (stub).
- `probe83-c1.mjs` header: `const ARMS = 27;`. `probe83-c2.mjs` header: `const ARMS = 16;`.
- Grounding greps: `ready-handoff.mjs:38 const CONTRACT = 'kumitate-ready-handoff-v3';`, `:47` comment "at the pinned", `:51 const SWARM_ROLES = new Set([...`, `:54 const DISPATCH_SCHEMA = 'ufo-swarm-wave-dispatch-v1';`, `:194 if (opts.agents) {`; `omp-census.mjs:166 const SHAPE_CONTRACT = 'kumitate-omp-shape-v2';`, `:272` and `:513` emit `SHAPE_CLOCK`, `:277` `SHAPE_AGE_UNKNOWN`.
- Both target entries existed before the map write: `corpus/knowledge/dispatcher-admission-surface.md` (7149 bytes) and `corpus/knowledge/self-asserted-instants.md` (4543 bytes), both `??` untracked.
- `node scripts/readme-map.mjs` after the rows:
  `README_MAP: note unpinned:knowledge/self-asserted-instants.md`
  `README_MAP: note unpinned:lessons/round-82-verifier-spotcheck.md`
  `README_MAP: note unpinned:lessons/round-83.md`
  `README_MAP: DRIFT files=210 rows=210 covered=206 bad=4 first=unpinned:knowledge/dispatcher-admission-surface.md`

## What I concluded

- All three source rows are groundable at their named pins: S240 line 1086 inside the requested
  1085-1091 fence, S241 line 27, S242 capture line 99 with the row's `c53b2d12` digest. Each quote is
  written verbatim (verified by fixed-string occurrence ≥ 1; no paraphrase).
- The map bimap is now complete for this round's files: `files=210 rows=210`, and every `bad=4` is an
  `unpinned` note against `.ufo/pins/readme-map.json`, not a row defect — no `orphan-row`,
  `duplicate-row`, `format-unmapped` or `uncovered` appears. The pin append is outside this seat's
  write scope (my scope: `corpus/lessons/round-83.md` and the README rows only), so the L1 or the
  connector must append `knowledge/dispatcher-admission-surface.md`,
  `knowledge/self-asserted-instants.md`, `lessons/round-83.md` (and the pre-existing
  `lessons/round-82-verifier-spotcheck.md`) to the `covered` set; until then `readme-map` exits 1 by
  design.
- The lesson is a skeleton with `# round 83`, `## Gate` (S240/S241/S242, all admitted, no reject,
  `spot-check: pending (non-author)`), `## Limits` (six, each grounded: advisory gate; operator-side
  validator with pinned copies; opt-in `--agents`; hermetic counters; stated-instant-only clock; the
  two divergences disclosed by `dispatcher-admission-surface.md`), and `## Mistakes` carrying only
  `pending: filled by the L1 from the seats' findings`.
- Untouched per the seat's acceptance: `SCORECARD.md`, `LOG.md`, `SKILL.md`, `SOURCES.md`, the frozen
  probes and controls, `.ufo/state`, `.scratch`, `MANIFEST.json` (none read for write, none edited).

## Findings / disclosures

- **F1 (frozen-counter header inconsistency, disclose-not-edit).** `probe83-c2.mjs`'s doc header says
  `prints \`C83_C2: HELD held=15/15\`` while the same file declares `const ARMS = 16;` and the plan
  and this seat's orders expect `held=16/16`. Cosmetic and frozen; the arithmetic is 16. Recorded for
  the L1; I did not edit the file.
- **F2 (map pin outstanding).** See above: `readme-map` remains DRIFT on `unpinned` until the pin
  registry is appended. Not a row defect and not in this seat's write scope.
- **F3 (divergences carried into the lesson).** The admission entry's own §Limits names two gate↔
  dispatcher divergences (unclamped `lo`/`hi` in the gate vs the dispatcher's clamp; registry branch
  checks a non-empty `members` but not its `schema` stamp). I carried both into `## Limits` verbatim
  in substance rather than letting the lesson read as full parity.
- **F4 (`used-by` asymmetry, append-only update outside this seat's scope).** `node scripts/sources-check.mjs`
  reports `SOURCES warn USED_BY_ASYMMETRY` for `S240`/`S241` → `corpus/knowledge/dispatcher-admission-surface.md`
  and `S242` (and `S237`) → `corpus/knowledge/self-asserted-instants.md`; two pre-existing ones remain
  (`S028`/`S124` → `failure-recovery-replay.md`, `S041` → `kimi-plane-single-derivation.md`). The gate
  stays `SOURCES_CHECK: CLEAN (rows=180 tiers=A:153,B:17,C:10 status=queued:16,mined:142,rejected:22
  entries_with_source=38 legacy=38)`. SOURCES.md is forbidden to this seat, so the connector/L1 must
  log the `used-by` extensions old→new for the three rows this round opened.

## What I could not verify

- The measured verdicts (`C83_C1: HELD held=27/27`, `C83_C2: HELD held=16/16`): not run by this seat
  (executor work). The lesson therefore states the frozen counters and arm counts, not a HELD verdict.
- The live fleet behind the gate: both counters are hermetic fixture lanes; this seat read no live
  `.ready`, dispatch, or registry document.
- The dispatcher itself was not executed (read-only `git show` at `fb7157fc`), matching the source
  rows' own scope.
