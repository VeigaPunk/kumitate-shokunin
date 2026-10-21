ATTACK corpus/knowledge/remaining-scripts-census.md:775-796 §scripts/ufo-swarm-collect.test.mjs verdict=partial defects=1

## Scope and axes
- Target axis: coverage:script-layer — fidelity of one re-anchored S8 member section at the pin. Related axes operability/coverage were only touched where this member's row feeds them. No implementation, contract, score, or source edits.
- Source pin, read only through `/fast/scratch/kumitate-r35/src`: `git rev-parse 31c465f1` → `31c465f15669f744848bd9f5d56191c5085670f7`; `git rev-parse 964f443e` → `964f443ee53df0ce06bd689af01f0dea031b01f9`.
- Lane note under attack: `sha256sum corpus/knowledge/remaining-scripts-census.md` → `58ae48d8b52338f6e506735a896a5ad1a988971ac9df54f8b9e09b2f37fdaa78` (matches falsify/MutS8NoteGate.md's pristine Hn). Runtime `node v24.21.0`; no installs/updates; no gate runs (other seats own them).

## Anchor readback — 19/19 pass
Command for every row: `git -C /fast/scratch/kumitate-r35/src show 31c465f1:scripts/ufo-swarm-collect.test.mjs | sed -n 'Np'`, with N mechanically extracted from every `:N` token in census:777-796.

| census | N | pin line (truncated) | census claim | verdict |
|---|---|---|---|---|
| 779 | 16 | `const SCRIPT = join(import.meta.dirname, "ufo-swarm-collect.mjs");` | names SCRIPT | ok |
| 781 | 14 | `import { spinWait } from "./ufo-mission-result.mjs";` | reuses spinWait (used at :42) | ok |
| 783 | 65 | `function run(args, { expectFail = false, env = null, …`)` | spawns real CLI (`spawnSync(process.execPath, [SCRIPT,…])` :68) | ok |
| 784 | 77 | `function runJson(args, opts = {}) {` | runJson | ok |
| 785 | 83 | `function test(name, fn) {` | own test helper | ok |
| 786 | 95 | `function dispatchPayload({ spawns = [], resumes = [] } = {}) {` | fixture builder | ok |
| 787 | 107 | `function resultsPayload(members, extra = {}) {` | fixture builder | ok |
| 788 | 23 | `const REGISTRY_LOCK_HOLDER_SOURCE = \`#!/usr/bin/env node` | lock holder source | ok |
| 789 | 31 | `const R22_HOLDER_TOKEN = "r22-nc5-swarm-collect-lock-holder";` | token | ok |
| 789 | 32 | `const OWNER = { runId: "runCollect1", sessionId: "sess.collect.1" };` | fixed OWNER | ok |
| 790 | 234 | `test("unmapped_member_rejected", () => {` | unmapped rejected | ok |
| 790 | 246 | `test("unexpected_member_rejected", () => {` | unexpected rejected | ok |
| 791 | 260 | `test("duplicate_results_row_rejected", () => {` (asserts `duplicate_member`) | duplicate rejected | ok |
| 791 | 560 | `test("conflicting_agent_id_rejected", () => {` (asserts `conflicting_member`) | conflicting agentId rejected | ok |
| 792 | 1386 | `test("collect_succeeds_fast_under_held_writer_registry_lock", () => {` | collector fast under writer lock (`assert.ok(elapsed < 10_000)` :1410) | ok |
| 793 | 828 | `test("default_registry_join_from_wave_path", () => {` | hand-built registry join via `wave.registry.path` | ok |
| 794 | 692 | `test("plan_input_preserves_spec_order", () => {` | plan-schema mixed spawn/resume (tasks agent, resume=agentP, agent; asserts `[1,2,3]` and mode resume) | ok |
| 795 | 1620 | `console.log(\`\n${results.length - failed.length}/${results.length} passed\`);` | final N/M line | ok |
| 796 | 1621 | `if (failed.length) process.exit(1);` | exit 1 on red | ok |

- `:1386` body is byte-identical to base `:1319`: `diff <(git show 964f443e:… | sed -n '1319,1360p') <(git show 31c465f1:… | sed -n '1386,1427p')` → IDENTICAL.
- Negative claim "not an end-to-end wave-run record": `git show 31c465f1:… | grep -nE 'runRecord|run record|swarm-wave|wave-run|waveRun'` → only schema strings at :97/:695/:720/:1218 and a comment at :924; no import/spawn of `ufo-swarm-wave.mjs`. Holds.
- Topic list at census:779-781 matches the file header verbatim: `:4` outcome mapping, `:5` resume_hint presence rule, `:6` fail-closed joins, `:7` XML shape.

## Population table and count claims
- Row `corpus/knowledge/remaining-scripts-census.md:177` = `| scripts/ufo-swarm-collect.test.mjs | 1621 | suite |`; `git show 31c465f1:scripts/ufo-swarm-collect.test.mjs | wc -l` → `1621`. Base `964f443e` → `1554` (master row `master:158` said 1554, consistent).
- Every S8 table row checked the same way (60 rows): `0` mismatches at the pin; sum of L = `33367` = census:105 `S8 members L: 33367 total`.
- Section set: `grep '^## \`scripts/'` headings = 60, table paths = 60, `diff` sets identical; every path resolves at `31c465f1` (no MEMBER set drift in this area).
- `71 \`test()\` declarations` = `git show 31c465f1:… | grep -cE '^test\('` → `71` (72 total `test(` occurrences including the helper definition at :83); base → `67`. The 84→71 correction is the right direction and magnitude.

## Revision label
- The master section (`master:809-833`) carried **no** per-member revision label, so nothing was lost there. The census-wide base label survives and is now explicit: master's bare `Observed:` (master:76) became `Historical observed (round 32, 2026-10-14 at 964f443e)` (census:82), and a `Current observed (pinned origin 31c465f1, 2026-10-20)` block was added (census:99). The section suffix `re-anchored at 31c465f1 (round 35)` is present (census:796).

## D1 — the removed `ENTRY_FAILURE_CLASSES` clause left no trace
- Exact location: `master:815-816` clause `It reuses \`spinWait\` and \`ENTRY_FAILURE_CLASSES\` from` → `corpus/knowledge/remaining-scripts-census.md:781-782` `It reuses \`spinWait\` from`. The clause is gone with no `(round 35: removed …)` marker.
- Command: token diff of the two paragraphs, `diff <(sed -n '811,833p' /tmp/master-census.md | tr '\n' ' ' | tr -s ' ' | sed 's/ \`/\n\`/g') <(sed -n '777,796p' corpus/knowledge/remaining-scripts-census.md | … )`. Output's only substantive symbol removal lacking a trace is `ENTRY_FAILURE_CLASSES`; the wave-run clause removal does carry one at census:796.
- The clause was false, not merely advance-stale: `git show <rev>:scripts/ufo-swarm-collect.test.mjs | grep -c ENTRY_FAILURE_CLASSES` → `0` at 31c465f1 and `0` at 964f443e; the symbol is owned by `scripts/ufo-mission-result.mjs:33`. Removing it is correct.
- But the round's applied convention traces base-absent symbol removals too: census:670 traces `boundaryRefusal`, `DRILLS_REFUSAL_SCHEMA`, `UNEXPECTED_ERROR` as "absent at 31c465f1", while `git show 964f443e:scripts/ufo-drills.mjs | grep -c <sym>` → `0/0/0`; census:759 traces `emitFor`/`STALE_MS`/`SAFE_RUN_ID` the same way. The same section even traces its other base-false clause (end-to-end wave-run record). The omission is therefore inconsistent with the round's own practice, not a judgement that the clause was true.
- Minimal fix: append to census:796 `(round 35: dropped \`ENTRY_FAILURE_CLASSES\` — absent at 31c465f1)`, mirroring the existing template; or record the drop explicitly in the round's "41 false clauses removed" accounting so a reader is not left to infer it.

## Observations (not counted as defects)
- census:796's trace (`absent at 31c465f1`) is literally true but understates the finding: `:2028` was already past EOF at `964f443e` (1554 L). The same "absent at pin only" wording is used for boundaryRefusal et al., so this is convention-consistent. [INFERENCE] The L1 may prefer `absent at 964f443e and 31c465f1` for this one because the seat's evidence explicitly established both.
- `hand-built registry join` and `succeeds quickly` are interpretive but match `:828` fixtures and `:1386`'s `elapsed < 10_000` assertion. [INFERENCE]
- Inherited from master, outside this member: the historical block's `36827 total` (census:88) sums master's table, whose `scripts/fleet-dispatcher.test.mjs` row 3278 exceeds `964f443e` `wc -l` 3268 (actual base sum 36817). Master already carried 3278 (`master:108`), so this is not a round-35 regression and I did not edit or count it.

## No new false claim found
All 12 prose claims above resolve to the pin (19 anchors, 71 declarations, 4 topic names, the negative wave-run claim, the `N/M`/exit pair). The partial verdict rests solely on D1, the trace gap for a removed clause.

## Remaining unknowns
- [INFERENCE] Whether the L1's trace convention is meant to cover only advance-caused removals; the applied evidence (census:670, 759) says base-absent symbols are traced too, which is why D1 is scored.
- No gate was run here by design; per falsify/MutS8NoteGate.md D1/D2 the paired gates cannot prove per-anchor fidelity, so this seat's evidence is the direct source readback above.
