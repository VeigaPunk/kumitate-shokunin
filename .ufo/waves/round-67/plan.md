# Round 67 — plan (frozen before any wave seat was dispatched or scored)

Round: kumitate 67, attempt 1, L1 `KumitateR67`. Base revision `f29eb6990653dba3e1c6296044fd7bfa2ac2b9ed`
(branch `master`, the round-66 verifier spot-check commit). Frozen 2026-10-27. These sentences are the claims;
the same words appear in the counters' code and in the receipts' labels. Committed before the first `.ready`
marker (QUALITY Q58). Round 66 closed `rejected-honest-stop`: its 66-seat v2 wave was handed off inline and
never returned `WAVE-DONE`; the round-66 spot-check routed three lane-owned defects (D1 wave-leftover
settlement, D2 receipt-revision precision, D3 land-or-redeclare C2) which this round settles while re-declaring
both claims under fresh freezes.

## Axis state and nudge

Owned axes (SCORECARD `## Axes`): operability 9 (terminal integer of the saturating `f_O` proxy), coverage
retired at 10, coverage:script-layer / runtime-layer / kimi-layer 10. Last capability row entered round 64;
rounds 65–66 entered none → stagnation window N = 3 not yet active; the lowest-axis obligation stands:
**C1 works operability**; **C2 works the coverage frontier** (sourced claim). No score integer can move; each
verdict is its frozen counter. No axis may be harmed.

## D1 settlement (routed, inside the round, not a claim)

The round-66 wave leftovers are settled in this freeze commit, under the round-67 LOG entry:
`.ufo/waves/round-66/build/K66MutLedgerProbe/results.tsv` (mutant matrix; every row INCONCLUSIVE —
`spawnSync node ETIMEDOUT`; the seat died mid-run without WAVE-DONE) and
`.ufo/waves/round-66/build/K66ReviewStagedClaims/captures/timeline.json` (GitHub events JSON for SEP-2596,
the Final-date evidence chain, fetched 2026-10-27) are committed byte-exact as wave evidence. Six of the 66
dispatched seats filed no report and have no results receipt (`K66ConnectorClaims`, `K66ExecProxyStanza`,
`K66ExecToolEdge`, `K66ExecToolHarden`, `K66MutHarmMatrix`, `K66MutLedgerProbe`); they are recorded as dead
seats in the round-67 report. Nothing was respawned; nothing was discarded — the two files are evidence, kept.

## C1 — operability, capability acquisition `routed-ledger` (fresh freeze, rule L67 v1)

**Surface it moves:** `scripts/routed-ledger.mjs` advances v1 → v2 (contract `kumitate-routed-ledger-v2`),
binding every routed item of the spot-checks in rounds 55..66 to a ledger row, and the gate gains the
round-66 wave's confirmed hardenings (six findings, each reproduced by a committed attack before this freeze:
GIT_DIR-inherited selftest/repo escape; symlink/`..` answer and ledger escapes; second routed section
silently missed; one-word / ambiguous quote binding; ±2-line answer window; fence-blind item count), plus its
data `corpus/routed-ledger.md` (60 items in 12 sections: rounds 55..65's 57 plus round 66's D1–D3) and its
registry home (SKILL gate-registry row, QUALITY Q62, SCORECARD capabilities row). Command that shows it
unmoved at the base: `test -e corpus/routed-ledger.md` (absent) and
`node scripts/routed-ledger.mjs --selftest` printing `PASS (33/33)` (the v1 case count).

**Frozen predicate `LEDGER67_HELD`** (rule L67 v1, checks L1..L7), measured over `git archive M` (never the
worktree; the counter itself refuses a poisoned environment and an unsafe extraction):

- L1 — the archive's `scripts/routed-ledger.mjs --selftest` prints `ROUTED_LEDGER_SELFTEST: PASS (n/n)` with n >= 44, exit 0.
- L2 — the archive's tool run inside a second clean extraction of M (`--root <extraction> --from 55 --to 66 --classes`)
  exits 0 with `ROUTED_LEDGER: CLEAN spotchecks=12`, `items=` equal to this counter's own fence-aware item count
  over the twelve spot-checks, and rows >= items.
- L3 — this counter's own re-verification of `corpus/routed-ledger.md` at M (independent of the tool): every item
  of rounds 55..66 has a row whose quote is >= 3 words, word-boundary-located and unique within its routed
  section; every closed/wontfix row's answer quote is located at the exact named line (no window) of a lane file
  that is neither the ledger nor a spot-check; no (round,item) carries more than one non-open row; every
  round-66 item (D1–D3) has a closed or wontfix row whose answer quote is NOT found in that file at the round-66
  base `8d557f85312de4fcc82e09ff735d21436bc3746d` (answered this round); >= 5 distinct classes; >= 1 class spans
  >= 4 distinct spot-check rounds.
- L4 — held-out fixtures generated at counting time from random tokens (seeded by `--seed` or crypto; no answer
  key exists to read): the archive's tool, run on each fixture with `--root`, returns the expected exit code and
  finding id / item count for all 20 mutants (good; drop; quote-swap; quote-decoy; answer-wrong; answer-ledger;
  answer-eof; dup; ordinal; nested-as-item; prose-as-item; long-quote; one-word-quote; ambiguous-quote;
  shifted-answer; fence-item; second-section; contradictory; no-section; ledger-absent).
- L5 — the counter can fail: an always-CLEAN stub and an always-DRIFT stub both miss the L4 harness; L5 counts
  only where the real tool passes L4 (never vacuous).
- L6 — registry home in the same revision: SKILL.md carries a table row naming `routed-ledger.mjs`;
  corpus/QUALITY.md names `routed-ledger`; SCORECARD.md `## Capabilities` holds a table row whose first cell
  names `routed-ledger`.
- L7 — counter self-confinement, proven by fixtures at counting time: re-running this counter with
  `NODE_OPTIONS=--require <preload>` set prints `LEDGER67_UNMET held=0/7 … | ENV_POISONED` and exits 2;
  a revision whose `scripts/routed-ledger.mjs` is a symlink fails L1 (never executes a host file); a revision
  containing any symlink or non-regular file fails closed `EXTRACTION_UNSAFE` before any check; every child
  process runs under an explicit environment allow-list (`PATH`, `TMPDIR`) with a timeout.

**Counting command:** `node .ufo/waves/round-67/probe/ledger67-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin <M>`
→ `LEDGER67_HELD held=7/7 checks=7 rev=<M> rule=L67` exit 0.
**Kill rule:** any check MISS → the claim fails as declared. A rule changed after any seat scored is not this claim's rule.
**Ratchet (declared now, monotone):** a wave finding that the tool mis-reads a real section is fixed in the tool
with a new selftest case — a strengthening, never a relaxation.
**Before (base `f29eb699`):** `LEDGER67_UNMET held=0/7` exit 1 (`base/ledger67-base.txt`).
**Do-nothing controls (committed, scored before any seat):** `probe/c1-controls.sh donothing` — the v1 freeze
tool + an empty `## Ledger` skeleton + the three registry-home lines → UNMET (`base/ledger67-donothing.txt`);
`probe/c1-controls.sh autoledger` — the same plus one machine-generated open row per item → UNMET
(`base/ledger67-autoledger.txt`).
**Stated limit:** the counter verifies bindings, not adequacy: an answer line that quotes itself as an answer
passes L3 if it is new and located; whether an answer really answers the item is the non-author closure's
judgment. Round 59's routed section is prose (0 items) and its one orchestrator note is not ledgered. Item
ordinals assume the spot-checks stay append-only.

## C2 — coverage frontier: the MCP deprecation registry re-grounded at the installed release (fresh freeze, rule M67 v1; sourced claim)

**Surface it moves:** `PROVINCE.md` frontier band "MCP protocol revisions as they bear on orchestration" gains
its second entry, `corpus/knowledge/mcp-deprecation-registry.md`, re-grounded this round on rows opened this
round (access date 2026-10-27) against the host as it is **now**: the installed release is `omp/18.13.1`
(upstream asset byte-identical, 2026-10-27; the round-66 wave established the host upgrade and the removal of
the `omp.real` wrapper), the registry's HTTP+SSE clock resolves to **SEP-2596 Final 2026-06-03 (commit
`183238ddac`, "Mark SEPs as final") + the registry's three-month grace → elapsed 2026-09-03** (the live clock;
the staged theme's 2026-04-17-Created and 2026-05-18-merge readings are disproven and must not enter), and the
legacy HTTP+SSE transport source is re-verified at `/v18.13.1/`. Rows: S207 (deprecated.md 2026-07-28), S208
(feature-lifecycle.md), S209 (sse.ts at v18.12.6), S210 (SEP-2596 page), S211 (transports 2025-11-25), S212
(sse.ts at v18.13.1), S213 (the PR #2596 merge/final record). Command that shows it unmoved at the base:
`test -e corpus/knowledge/mcp-deprecation-registry.md` (absent) and `grep -c 'S207' corpus/SOURCES.md` → 0.

**Frozen predicate `DEPREC67_HELD`** (rule M67 v1, checks M1..M10), measured over `git archive M`:

- M1 — the entry `corpus/knowledge/mcp-deprecation-registry.md` exists; its first 14 lines carry `source:` lines
  naming >= 3 S-ids, a `verified-at:` line, and a `recheck:` line.
- M2 — every S-id on those `source:` lines is a `## Registry` row of `corpus/SOURCES.md` absent at the round base
  `f29eb6990653dba3e1c6296044fd7bfa2ac2b9ed`, 11 cells, `mined`, opened 2026-10-27, carrying a URL, tier A or B,
  and a `used-by` cell naming the entry.
- M3 — each cited row is bound in `.ufo/pins/source-captures.json` to a committed capture whose sha256 and byte
  size match, whose path is relative, free of `..`, and resolves inside the lane, and whose file is a regular file.
- M4 — the entry's `## Located quotes` holds >= 6 bullets of the form `- S### — "<quote>"`, each <= 25 words,
  each found in its row's capture; one quote contains `2027-07-28` and one contains `Three months after`; every
  cited row has >= 1 bullet.
- M5 — every M4 bullet's quote is found in a fresh live fetch of its row's URL (unreachable = MISS;
  `--no-live` = MISS).
- M6 — the entry's `## Registry snapshot` table has exactly as many data rows as the Deprecated table of the
  S207 capture (>= 5), and each snapshot row's Feature, `Deprecated in` and `Earliest removal` cells equal the
  capture row's delinked cells (a mispaired or reworded row fails).
- M7 — the entry's `## The live clock` section names `2026-06-03` as SEP-2596's Final date with an evidence
  pointer to S213, derives the elapsed grace `2026-09-03`, and contains neither `2026-04-17` nor `2026-05-18`.
- M8 — the entry's `## Bearing on the installed OMP release` section names `18.13.1`, names `roots` and
  `HTTP+SSE`, cites >= 1 of S201..S206, and >= 1 cited new row whose URL contains `/v18.13.1/` is bound to a
  capture per M3.
- M9 — on the archive: `sources-census.sh validate --file` exits 0; `scripts/sources-check.mjs` reads
  `SOURCES_CHECK: CLEAN`; `scripts/source-capture.mjs` reads `SOURCE_CAPTURE: CLEAN`; `scripts/readme-map.mjs`
  reads `README_MAP: CLEAN`; PROVINCE.md names the entry.
- M10 — counter self-confinement, same construction as L7 (ENV_POISONED self-rerun; symlinked tool-path or
  capture-path refusal; child environment allow-list with timeouts).

**Counting command:** `node .ufo/waves/round-67/probe/deprec67-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin <M>`
→ `DEPREC67_HELD held=10/10 checks=10 rev=<M> rule=M67` exit 0. **Kill rule:** any MISS → fails as declared;
same no-retroactive-change rule.
**Before (base `f29eb699`):** `DEPREC67_UNMET held=0/10` exit 1 (`base/deprec67-base.txt`).
**Do-nothing control:** `probe/c2-donothing.sh` — the staged shokuknow entry copied byte-for-byte plus a
PROVINCE line, nothing else → UNMET (`base/deprec67-donothing.txt`).
**Stated limit:** the counter measures an evidence chain and a live re-fetch; it cannot tell a sound reading
from a well-grounded wrong one; presence of `sse.ts` in source at a tag is not proof the host exercises it;
M5 needs the network at counting time.

## Frontier step, assimilation, routed defects (inside the claim cap; not claims)

- **Census** before (`base/census-before.txt`, exit 0, six carried W04) and after, pasted in the report.
- **Assimilation:** ONE theme — "MCP deprecation registry and its clocks" from `merge/kumitate/`. The staged
  entry is **rejected as staged** (its worked example rests on the SEP's Created date and a 404 recheck path;
  round-66 wave evidence) and re-grounded by the lane's own entry; the theme's sources are opened as S207–S213.
  The lesson's `## Gate` records >= 1 admit (the re-grounded entry, with the staged file named as the refusal
  basis) and >= 1 reject from the staged set, with reasons and flips.
- **considerthese:** `2026-10-25.md` ideas 4 and 5 are the substance of C1 (landed as the round-66 tool; this
  round lands the data and registry home); no new proposal is mined this round beyond that file.
- **Mistake mined (§2b.3):** `receipt-revision-mismatch` — the round-66 report cited `held=3/6` "at cutoff tip
  `6c79d68…`" while the only committed receipt named `rev=621212bac…` (routed D2); captured-by: none until this
  round; fix: QUALITY Q63 (a receipt names the revision it measured) + every round-67 receipt carrying `rev=`.
- **Routed R66 defects D1–D3** answered in `corpus/routed-ledger.md` rows with located answers (L3's round-66 clause).

## Round shape

One v2 wave (policy `ufo-wave-policy-v2.json`, band 64–128) carrying build and attack items together, seats
prefixed `K67`; attack roles (reviewer, critic, mutation-tester, labrat) >= 25%; a few connector seats.
Planner seat: the L1 (the validator rejects `planner`).

## Write scope

Lane repo only: `/home/vgpnk/Projects/shokunin/kumitate-shokunin`. Seats write only their report
(`.ufo/waves/round-67/w1/<Seat>.md`) and build artifacts under `.ufo/waves/round-67/build/<Seat>/`; scratch under
`/fast/scratch/hyaku/kumitate-r67/<Seat>/`, deleted on exit. The L1 is the sole integration owner of
`scripts/`, `SCORECARD.md`, `corpus/`, `PROVINCE.md`, `LOG.md`, `SKILL.md`, `.ufo/pins/`.
