OVERLAP lanes=9 conflicts=3

# Sibling-overlap scan — kumitate round 35 (read-only connector)

Bar for counting a lane: a durable artifact (corpus note, SCORECARD row, PROVINCE
row, committed report) making a claim about a path or behaviour in `~/.kimi-code/`
(`mcp.json` or a K-family member) **or** `ufo-fsd-alpha/scripts/`. Consumer
receipts, shared HEAD pins and instrument reuse are listed separately and do not
count. All sibling paths are under `/home/vgpnk/Projects/shokunin/<lane>/`.
No sibling file was written; no lane gate was run (not assigned to this seat).

## Surface overlaps (9 lanes)

| Lane | Surface covered | Evidence (path:line) | Class | Route or absorb |
|---|---|---|---|---|
| game-dev-3d | `~/.kimi-code/mcp.json`; `config.toml` MCP key | `reports/round-101/probes/kimi-surfaces.md:32` (249 B, md5), `:190-201` (content verbatim), `:218-228` (TOML key dead), `reports/round-102/sentinel-mcp.md` §3 | claim | Absorb: kumitate owns the agent-side MCP plane (their `PROVINCE.md:76` routes general orchestration here). Conflict C-1. |
| tabi | K2 member `plugins/managed/kimi-webbridge/` | `PROVINCE.md:6-7`; `.ufo/waves/round-16/w1/ConnMcpAdjacency.md:137` (routes `mcp.json` to kumitate); `.ufo/waves/round-16/drafts/DraftAdjacency.md:41,63` (path declared contested, asks for one owner); `.ufo/rounds/fleet-round-1-interactive-20261015/freshness.expected.json:6-8` (3 public-file sha pins) | claim | Split by claim type; conflict C-2. `mcp.json` itself is already routed to kumitate. |
| kaidoku | `config.toml` REA registration; `scripts/ufo-swarm-wave.mjs` | `PROVINCE.md:16-18` (`:4126`, 6.7.0), `:44`; `.ufo/waves/round-18/w2/WaveEvidenceComplete.md:37-40,365` (line anchors measured at `31c465f1`) | claim | Route line pins to kaidoku (C-3); absorb membership only. |
| kengaku | `config.toml` model/routing census | `corpus/knowledge/kimi-model-routing-round18.md:4-5,129-133` (live census, 143 entries, 42 unroutable) | claim | Absorb membership; route model/eval semantics (their `PROVINCE.md:27-28`). |
| kama | `scripts/local-helper.mjs:8` | `PROVINCE.md:11,20-23` (baseURL pin; `file_match=yes` ≠ live model) | claim | Route endpoint semantics to kama; member anchor is safe at the pin (file unchanged). |
| chousa | `scripts/ufo-mission-result.mjs` | `.ufo/evidence/round-1/receipt-blocker.json:30` (`:68-73,637-645,698-710,2707-2717`) | claim | Absorb membership; report the stale range (below). |
| kagi | `scripts/omp-global-config.mjs`; `scripts/ufo-sighting.mjs` | `.ufo/round-20/route-admission.mjs:3` (import); `.ufo/reports/round-20/pane-attestation.json:16` (entrypoint argv); `LOG.md:868-869` | claim | Absorb; path-only anchors, no conflict. |
| kotoba | `scripts/ufo-swarm-wave.mjs` behaviour | `SCORECARD.md:216-219` (route-families validation, "route preflight is unprobed") | consumer receipt | Absorb; validation ≠ dispatch; re-run at new pin not guaranteed. |
| mado | `scripts/ufo-swarm-wave.mjs`; `kimi-census.mjs` mutation leg | `SCORECARD.md:136-138`; `.ufo/waves/round-13/frozen/harness.sh:84-90,589-628,1112-1113` | consumer receipt + instrument | Absorb; see FROZEN consequence below. |

## Adjacent, not counted (3)

- **kasegi** — holds `ufo-fsd-alpha` **HEAD** as `964f443e` (`SCORECARD.md:126-129`,
  `SKILL.md:28-31`, `LOG.md:794-796`) and explicitly assigns the "50 upstream file
  deletions" wording to kumitate. Tree-level pin, no script-member claim. Route: kumitate
  owns the wording; kasegi never absorbs it.
- **kake** — already at `31c465f1` for `docs/charter-ufo-fsd/index.html`
  (`.ufo/waves/round-22/domain-snapshot/provenance.json:3`, `corpus/lessons/round-22.md:111-113`).
  No scripts-layer claim. Route: none.
- **tameshi** — read-only mutation method over kumitate gates
  (`PROVINCE.md:8-11,29-35,76-82`), including `kimi-census.mjs`. Instrument reuse,
  not substrate membership. Route: survivor recommendations already flow to kumitate.

## Conflicts

**C-1 — `~/.kimi-code/mcp.json`: shape-only (kumitate) vs content-published (game-dev-3d).**
`corpus/knowledge/kimi-mcp-plane.md:31-34` (contract Q5, `corpus/QUALITY.md:30`) says the
file can carry `env`/`headers`/`bearerTokenEnvVar` and is never content-read;
`game-dev-3d/reports/round-101/probes/kimi-surfaces.md:190-201` prints it verbatim and
`:732-733` records `cat mcp.json`. Their province does not own it. Verdict: kumitate keeps
shape-only (`stat` only); do **not** cite or reproduce their content. Also correct the
scope slip at `kimi-mcp-plane.md:7-9` ("no lane note named it until this one"): the
measurement `grep -rlF 'mcp.json' SKILL.md corpus` covers kumitate's own tree only, and
the file was already named and printed in that sibling probe (round 101, before this note).

**C-2 — `~/.kimi-code/plugins/managed/kimi-webbridge/`: two lanes, two claim types.**
tabi owns it as primary substrate documentation (`PROVINCE.md:6-7`) and pins three public
files by sha256; kumitate counts it as one K2 member (`SCORECARD.md:138`, 26 members).
tabi's own adjacency note already calls the directory contested and asks for one owner
(`.ufo/waves/round-16/drafts/DraftAdjacency.md:41,63`). Verdict: **split, do not merge** —
kumitate keeps membership/count; tabi keeps the plugin's semantics and byte pins. State
the partition in the K2 note's next append; the single-owner ruling is an operator/L0
question, not kumitate's to absorb.

**C-3 — `~/.kimi-code/config.toml`: two live line authorities.**
kaidoku pins the REA registration at `:4126` (`PROVINCE.md:18`, re-derived 2026-10-20);
live file is 4150 lines, `[mcp_servers.rea]` at `:4124`, `:4126` = `args = [ "-y",
"rea-agents@6.7.0", "mcp" ]`. Kumitate's `corpus/knowledge/kimi-config-plane.md:257-258`
still pins `:1285/:1287` and `rea-agents@6.4.0`. Two lanes holding different line numbers
and different version pins for one operator file. Verdict: kumitate cites kaidoku's live
derivation (or drops line numbers for K1) and drops the 6.4.0 literal; kaidoku keeps
registration semantics.

## Second-order effects at `31c465f1` on sibling-held members

Measured with `git -C /fast/scratch/kumitate-r35/src show <rev>:<path> | wc -l`.

| Member | 964f443e → 31c465f1 | Sibling claim | Status |
|---|---|---|---|
| `scripts/ufo-mission-result.mjs` | 2966 → 3013 (+72/−25) | chousa `receipt-blocker.json:30` `:2707-2717` | **stale**: at the pin that range is `readBytes()`, not `usage()` |
| `scripts/local-helper.mjs` | 360 → 360 (not in the 55) | kama `PROVINCE.md:11` `:8` | holds |
| `scripts/omp-global-config.mjs` | 627 → 677 (+70/−20) | kagi import at `route-admission.mjs:3` | path-stable; no line pins |
| `scripts/ufo-sighting.mjs` | 4714 → 4730 (+233/−217) | kagi entrypoint path only | path-stable |
| `scripts/ufo-swarm-wave.mjs` | 1907 → 1844 (+67/−130) | kaidoku line anchors; kotoba/mado receipts | kaidoku measured **at** the pin; kotoba/mado receipts are historical — a re-run is not guaranteed identical |
| `scripts/charter-scribe/sync.mjs` | 844 → 902 (+59/−1) | none in sibling corpus (the 844-line cite lives in a fleet-root audit scope) | no sibling impact |

Added members `scripts/omp-route-grammar.mjs` (parseRoute home) and
`scripts/ufo-swarm-registry.mjs`; deleted `omp-wave-context.mjs`,
`primeagent-recovery-assess.mjs`, `primeagent-refinement-ledger.mjs`,
`ufo-refinement-context.mjs`, `ufo-refinement-context.test.mjs`. **No sibling corpus note
or SCORECARD row cites any of these seven names** (grep over all 20 sibling `corpus/` and
`SCORECARD.md` trees → 0), so the C2 re-census creates no competing membership claim.

**FROZEN-string consequence.** `scripts/kimi-census.mjs:149` is
`const FROZEN = { K1: 3, K2: 26, K3: 9, K4: 9, K5: 3 };`; the K1 change makes it
`K1: 4`. mado's mutation spec D10 and tameshi's witness spec embed the older
`{ K1: 3, K2: 25, … }` string at a pinned revision (`rev=175de6ba…`,
`sha256=83016d45…`) — replay still works there, but any re-pin to current HEAD breaks the
old-string match. Internally, `scripts/kimi-census.mjs:716-723` asserts the **pre-change**
state (`UNLISTED` root `mcp.json`, `totals.members === 50`); it must flip to declared /
51 in the same change or `--selftest` (baseline 45/45) goes red.

## Proposed move (one, bounded)

Add a `## Cross-lane anchor delta` section to the round-35 **build report** (not a new
gate, not a corpus note): for the 55 modified members, list only those with a sibling-held
claim (rows above) with `base→pin` counts and a held/stale verdict, plus the FROZEN-string
consequence for the two mutation legs. Affected axes: coverage:script-layer (C2) gains the
cross-lane evidence it already needs; operability (C1) untouched — no script changes;
coverage:kimi-layer (C3) untouched. No sibling file is edited and no `mcp.json` content is
copied.

Risks: (1) keep it out of `corpus/knowledge/` so `claims-check` does not parse it as a
registry row; (2) word stale sibling anchors as observations ("reported, never absorbed"),
not repairs; (3) kotoba/mado's receipts stay historical — record the pin they were taken
at rather than implying they are current.

## Verification

- No lane gate was run (read-only seat; not assigned). No write outside this file. No tool
  install or upgrade was needed or performed.
- `git -C /fast/scratch/kumitate-r35/src log -1` → `31c465f15669f744848bd9f5d56191c5085670f7`.
- `git diff --stat 964f443e 31c465f1 -- scripts/` → 69 files, +4568/−8700.
- `git diff --diff-filter=D --name-only …` → 6 files (5 members + 1 non-member shim).
- `wc -l /home/vgpnk/.kimi-code/config.toml` → 4150; `grep -n '^\[mcp_servers'` → `:4124`, `:4129`; `grep -n 'rea-agents'` → `:4126` (6.7.0).
- `stat -c 'kind=%F size=%s mode=%a mtime=%y' ~/.kimi-code/mcp.json` → `kind=regular file size=249 mode=644 mtime=2026-10-15 06:47:10` (shape only; content not read).
- Baseline for the claims cited: `.ufo/waves/round-35/frozen/s-added-2.txt`, `s-deleted-5.txt`, `s-modified-members-55.tsv`; baseline `proxy.txt` (`S_MEMBERS_DRIFT declared=91 computed=88`, `S_SECTIONS_DRIFT 91→86`).
