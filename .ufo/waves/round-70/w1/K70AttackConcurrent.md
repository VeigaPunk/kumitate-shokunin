# K70AttackConcurrent — AttackConcurrent report

Seat: K70AttackConcurrent · Milestone: AttackConcurrent · Axis: operability (C1 replay isolation)
Date: 2026-10-30 · Frozen plan `3dbe7e6e2616423d55f0ea2bbcf8fb32fe7bda6a` (commit) · Frozen counter
`replay70-probe.mjs` sha256 `63f52b75d9c0e3d80a91c6957ce4624cbd46a9488841a962a75bc62ffecbf0c1` (bytes
verified, never modified) · plan.md sha256 `e518567d74e1cdfb62b53478486a021dd224cc873cd5ea3c7b5a6d4a9394744b`.

## Mission

Attack one contract edge: **two same-mode replays sharing a work parent require unique mkdtemp
children.** Candidate state: `build/K70ExecRunner/` does not exist; `scripts/control-replay.mjs`
absent from the lane; no candidate to inspect. Attacked the frozen counter + contract directly with
a runnable isolated counterexample in private scratch (originals `c1-controls.sh`/`c2-controls.sh`
never executed; naive model never invokes them — its inner replay step is a synthetic receipt write).

## Counterexample (defect class: fixed child name passes the frozen counter, collapses under shared parent)

`naive-candidate.mjs` implements every contract step I could model (arg validation → exit 64,
exclusive `--out` via `openSync(wx)`, private script copy + receipt inside a child of `--work`,
receipt copy-out, child cleanup, empty work root on success) — EXCEPT the child is
`path.join(work, `${family}-${mode}`)`, a fixed deterministic name, violating the frozen plan's
normative sentence "Unique mkdtemp child under the supplied work root".

Evidence (all commands run in `/fast/scratch/hyaku/kumitate-r70/K70AttackConcurrent`, since removed):

1. **Counter blindness — Part A of `attack-driver.mjs`.** Replaying the frozen R3–R7 pattern
   verbatim (each replay gets a private pre-created `work-${i}`), the naive candidate passes
   5/5: `exit=0 ok=true workEmpty=true` for all of c1/donothing, c1/autoledger, c2/donothing,
   c2/autoorigin, c2/forgecapture; R8-equiv `exit=64`; R9-equiv refusal `exit=1`,
   `existingUnchanged=true`. A fixed-child implementation scores REPLAY70_HELD 10/10.
   Receipt: `build/K70AttackConcurrent/driver-receipts.txt`.
2. **Deterministic collision — Part B.** Two sequential same-mode replays, one shared work parent,
   sibling holding the fixed name `c1-donothing`: first `exit=0`; second `exit=1`,
   stderr `EEXIST: file already exists, mkdir ...`, leaving a created-but-empty `--out` file.
3. **True concurrency, naive — 8 concurrent same-mode (`c1 donothing`) replays, one shared work
   parent** (`for i in $(seq 1 8); do node naive-candidate.mjs ... & done; wait`):
   6/8 crashed `Error: EEXIST: file already exists, mkdir 'conc-naive/work/c1-donothing'`; each
   crash left a **0-byte file at its `--out` path** (exclusive open precedes the mkdir crash), so
   retries are then refused by the R9 exclusivity check — failure is sticky. Only 2/8 produced the
   45-byte receipt with `LEDGER69_UNMET`. Receipt: `build/K70AttackConcurrent/evidence-concurrency.txt`.
4. **True concurrency, fixed — identical setup against `fixed-candidate.mjs`**
   (`fs.mkdtempSync(path.join(work, `${family}-${mode}-`))`, the only delta): **8/8 succeeded,
   both receipts intact, work root empty** (`fixed-candidate concurrent: 8/8 succeeded; work
   leftovers: 0`).

Root cause of counter blindness: the frozen probe (bytes `63f52b75…`) allocates a **private**
`work-${i}` per replay in R3–R7 and uses the root as work parent exactly once in R9 — the
shared-parent-same-mode configuration the contract sentence exists for is **never exercised**, so
`readdirSync(work).length===0` cannot observe non-uniqueness.

## Secondary observation (same family, lower severity)

R9 passes `--work root` and asserts only `status!==0` and `existing.txt` bytes — it never asserts
work-root cleanliness. An implementation that creates its child *before* the exclusive-out refusal
would leak a fixed-named child into the probe's root unobserved. mkdtemp + refusal-path cleanup in a
`finally` closes this side-channel too.

## Impacted axes

- **Operability (C1, the only claimed axis):** if the eventual `scripts/control-replay.mjs` uses a
  derived-not-random child name, REPLAY70_HELD would be claimed 10/10 while the tool collapses
  under any driver that reuses a work root (parallel replays, retry loops) — a false-provenance /
  premature-saturation defect the frozen predicate cannot catch.
- No other axis touched; no frozen bytes changed.

## Freeze consequence (exact)

`plan.md` and `replay70-probe.mjs` froze before `w1.ready`; `base/freeze-map.txt` must stay CLEAN;
"limits disclosed rather than changing this predicate after scoring" (plan, Controls and freeze).
Therefore **no seat may patch R3–R7 to share a work parent** — the counter gap is permanent for
round 70. Consequences: (a) acceptance for this edge must ride entirely on the implementation's
mkdtemp + selftest; (b) the gap and the selftest finding ids covering it must be disclosed in
SCORECARD/LOG at close; (c) any candidate found using a fixed child name must be rejected at
integration even with a 10/10 probe receipt — the receipt is insufficient evidence for this edge.

## Smallest safe correction (implementation-side only; counter stays frozen)

1. In `scripts/control-replay.mjs`: create the child as
   `fs.mkdtempSync(path.join(work, `${family}-${mode}-`))` — uniqueness by construction; wrap
   out-file creation + child work so a failure after exclusive-out creation unlinks the empty
   `--out` file (kills the sticky 0-byte refusal observed in evidence 3) and always removes the
   child (refusal path included).
2. In the hermetic `--selftest` (R2 only greps `CONTROL_REPLAY_SELFTEST: PASS` + exit 0, so content
   is free): add stable finding ids asserting (a) two same-mode replays against ONE shared work
   parent both succeed with distinct child names, and (b) a pre-existing leftover sibling child
   does not block a fresh replay. Expected exit maps stay stable.
3. Close-sequence: record this counter gap + the selftest finding ids in SCORECARD/LOG as a
   disclosed limit. Do not amend the predicate.

## Artifacts (unique to this seat)

- `.ufo/waves/round-70/build/K70AttackConcurrent/naive-candidate.mjs` — defective model (fixed child).
- `.ufo/waves/round-70/build/K70AttackConcurrent/fixed-candidate.mjs` — corrected model (mkdtemp).
- `.ufo/waves/round-70/build/K70AttackConcurrent/attack-driver.mjs` — frozen-pattern + shared-parent driver.
- `.ufo/waves/round-70/build/K70AttackConcurrent/driver-receipts.txt` — Part A/B/C transcript.
- `.ufo/waves/round-70/build/K70AttackConcurrent/evidence-concurrency.txt` — 8-way concurrency results.

Scratch `/fast/scratch/hyaku/kumitate-r70/K70AttackConcurrent` created explicitly, receipts copied
out first, removed before yield. No production/fleet/sibling files touched (`git status` shows only
untracked seat artifacts). No installs needed — node v24.21.0 already present; no pacman/uv/npx
transactions performed. No originals executed; no commits; no delegation.
