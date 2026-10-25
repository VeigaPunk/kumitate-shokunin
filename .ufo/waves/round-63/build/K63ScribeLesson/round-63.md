# Round 63 — lesson

author: kumitate-shokunin
base: `dfa6fca8f362e9c962f5b940025a2619380b759b`; frozen at `b38a2065ab8ac5b198f6569b9013d04411c3d40d` (plan, counters, controls and base receipts committed before wave 1)
opened sources this round (access date 2026-10-25): staged `S200` → lane `S196` (`https://docs.bailian.console.aliyun.com/zh/model-studio/managed-agents-multiagent.md`, § 编队配置) and staged `S202` → lane `S197` (arXiv 2512.08296, v3)
plan: `.ufo/waves/round-63/plan.md` (frozen before any wave result)

## Opened-source recheck

- Bailian: committed capture `.ufo/waves/round-63/build/K63Capture/bailian-managed-agents-multiagent.md`, 3388 bytes, sha256 `7ea4396645e3b1c89a3fd984ea095dabd75c2e23e8f376ec2211c1b855ec37e6` (my own `sha256sum` at `b38a2065`). Anchor § 编队配置: the coordinator sentence is capture line 13, the roster bound `1-20 个` is line 22, and `grep -c 'coordinator'` → `11`, which reproduces the staged `recheck:` cell (`…/multi-agent-coordinator-topologies.md:5`, ran 2026-10-23).
- arXiv: committed capture `…/K63Capture/arxiv-2512.08296v3.html`, 663997 bytes, sha256 `df31beb3a2ae0f9ad2084750b34a05849b2ab418cb8121666ffb8a8a15517223`; the version identity `arXiv:2512.08296v3 [cs.AI] 08 Apr 2026` is in the capture README. `We conducted 260 experiments across six benchmarks spanning deterministic to open-world task structures` occurs once, `0.023` twice, and the staged table's `+57`, `19%`, `80.8`, `70%`, `45%` occur 1/1/18/12/8 times.
- The staged S200 quote (`…/multi-agent-coordinator-topologies.md:22`) is **markup-stripped**: the capture bolds the term, so the literal string matches 0 times while the counter's `norm()` form matches once. Re-quoting must run through the counter's normalisation, never a literal paste.
- Staged numbers not found in this round's captures are cut, not carried (plan § Frontier step and assimilation). The sweep above covers the five headline percentages only — {{L1:number reconciliation}}.

## Gate

| candidate | decision | criterion / reason | located evidence |
|---|---|---|---|
| `multi-agent-coordinator-topologies.md` (staged rows S200/S202 → lane S196/S197) | ADMIT | Q1–Q4; one-theme round (coordinator topology); both staged documents re-opened this round; the measurement claim is version-pinned to arXiv 2512.08296v3; the r60/r61 flip fired — "a later one-theme coordinator-topology round re-opens both documents and grounds its measurement claims on a version-pinned source" | `https://docs.bailian.console.aliyun.com/zh/model-studio/managed-agents-multiagent.md`, § 编队配置, opened 2026-10-25. "{{L1:quote}}" (≤25 words; capture `.ufo/waves/round-63/build/K63Capture/bailian-managed-agents-multiagent.md`, sha256 `7ea4396645e3b1c89a3fd984ea095dabd75c2e23e8f376ec2211c1b855ec37e6`) and `https://arxiv.org/abs/2512.08296`, § Experiments & Results → § Setup (Benchmarks), v3 capture sha256 `df31beb3a2ae0f9ad2084750b34a05849b2ab418cb8121666ffb8a8a15517223` |
| {{L1:rejected staged entry}} | REJECT | {{L1:reject reason}} | {{L1:reject evidence}}; flip: {{L1:flip condition}} |
| `exactly-once-attribution.md` (package document arXiv 2609.29095) | REJECT (carried from rounds 60 and 61; no new decision this round) | duplicate-document scope: lane `S134` already holds arXiv 2609.29095, and the package stages that same document twice more (S204 structure, S211 abstract); no measured reopen under the lane's id | `corpus/lessons/round-60.md:32`; `corpus/lessons/round-61.md:13`; `corpus/lessons/round-62.md:12`; lane row `corpus/SOURCES.md:143`. Flip unchanged: a later one-theme round re-opens the paper under the lane's existing document id and adopts only under it |

**Claim verdicts.** C1 `INLINE63_HELD` and C2 `TOPOLOGY63_HELD`: {{L1:claim verdicts}}. Neither frozen predicate may be altered after a seat scored.

Stripped-prose record (not in any row cell): the staged `recheck:` cell carries a pipe-bearing command (`curl … | grep -c 'coordinator' -> 11`); pasted verbatim it splits the eleven-cell row, so the adopted cell is reduced to the cadence (`90d`) and the full prose stays here. The staged entry's two `source:` lines name package ids (`S200`, `S202`) that do not exist in this lane's registry; the adopted entry's lines must carry `S196`/`S197`.

## Assimilation

One theme from `merge/kumitate/` — coordinator topology — adopting one entry, `multi-agent-coordinator-topologies.md` (staged rows S200/S202). Access date 2026-10-25; plan pointer `.ufo/waves/round-63/plan.md` § Frontier step and assimilation.

Collision guard (committed before data, `.ufo/waves/round-63/assimilation/`): `reg-ids` 134 lines (max id `S195`, gaps at `S121`, `S128`–`S130`, `S132`, `S137`–`S189`), `staged-ids` 155 lines (`S195`–`S349`), `collisions` = `S195` only — `comm -12 <(sort reg-ids) <(sort staged-ids)` prints `S195`. Package `S195` is the MCP Architecture overview row (`/home/vgpnk/Projects/shokuknow/merge/kumitate/SOURCES.append.md:7`) whose document the lane already holds as `S125` (`corpus/SOURCES.md:137`); not appended.

Renumber map, by document: package `S200` → lane `S196`, package `S202` → lane `S197`. Both ids are free at `b38a2065`: `grep -cE '^\| S19[67] \|' corpus/SOURCES.md` → `0`, and no `S2xx` row exists at all. {{L1:registry append}}.

The staged entry is re-grounded in-round rather than copied: {{L1:entry citations}} — the entry's `source:` lines and `used-by` cells carry the lane ids and the round's own captures, and no staged number survives unverified.

## Quarantine

`.ufo/waves/round-63/assimilation/quarantine-slice` (9 lines): `S109`, `S116`, `S118`, `S129`, `S142` `payload-absent`; `S143`, `S144`, `S145`, `S178` "the cited source could not be fetched, so no quote was checked". Same nine ids as round-60 §Assimilation. Only three are lane rows — `grep -cE '^\| S(109|116|118) \|' corpus/SOURCES.md` → 1 each, while `S129`, `S142`, `S143`, `S144`, `S145`, `S178` → 0 each; those six are register ids and must never be matched to lane rows by id (the round-61 `reference-drift` fix).

Verdicts: {{L1:scout verdicts}}. A fetch that failed is not fabrication, and no verdict upgrades a row into the registry.

## Census before → after

Before (committed receipt `.ufo/waves/round-63/base/census-before.txt`; `EXIT=0`): six W04 duplicate-URL warnings (`S034`, `S068`, `S084`, `S095`, `S123`, `S126`) then `ok` on `corpus/SOURCES.md`; 134 rows re-derived at `b38a2065` with `grep -cE '^\| S[0-9]{3} \|' corpus/SOURCES.md` → `134`, equal to `wc -l` of `assimilation/reg-ids`.

After: {{L1:census after}} — paste the round-end `sources-census.sh validate --root … kumitate` transcript with its exit code, and re-derive the tier histogram instead of copying a report figure.

## Mistakes

| class | evidence pointer | captured-by | fix |
|---|---|---|---|
| `contract-misread` — the dispatched prompt's §2 ("declare 1–3 claims") was read as a *supply* of claims, so a zero-claim round was filed and no plan was frozen | `corpus/lessons/round-62-verifier-spotcheck.md:15` (defect: zero declared claims), `:55` (routed defect 1), `:65` (§Verdict `rejected-honest-stop`) | none — no criterion required a committed plan before the first `.ready`, and nothing in the lane could fail on its absence | a QUALITY criterion: a round's `.ufo/waves/round-<N>/plan.md` is committed in the lane before that round's first wave `.ready` marker, with a command shown able to fail. Round 62 fails it (no `plan.md` at all); round 63 passes — `plan.md` is inside `b38a2065`, while `w1.ready` is still untracked (`git status --porcelain` → `?? .ufo/waves/round-63/w1.ready`). Criterion id {{L1:criterion id}}; the drafted command is `.ufo/waves/round-63/build/K63ExecQualityCommand/plan-before-ready.sh` (uncommitted at `b38a2065`; verdict lines `PLAN_BEFORE_READY: PASS\|FAIL\|NA`, own `--selftest`), and it counts only once committed with its red (round 62) and green (round 63) transcripts |

## considerthese

Idea 3 of `considerthese/2026-10-25.md`, verbatim: "**Audit seat deaths.** Parse each round's `launcher-progress.tsv` for non-zero exits and null sessions, and list any dead seat the report does not name."

What was done: implemented as C1's dead-seat arm, not as a standalone parser. `scripts/inline-dispatch-evidence.mjs` (present at `b38a2065`, 376 lines, sha256 `fdd883927baa136afb4672474dc39eb0e524d5351fed26bfe6934bd05b7d2bfd`) derives the dead set from the host session transcripts (`:232` `dead: !clean`), requires the report to name every dead seat (`:256` `DEAD_UNNAMED:<seat>`), prints `dead=<n>` in the verdict line (`:260`), and ships three selftest cases (`:314` `dead-seat-counted-not-credited`, `:315` `dead-unnamed-in-report` / `dead-named-in-report`). The criterion half is QUALITY `Q54` (`corpus/QUALITY.md:924-929`).

Adaptation the reflection did not anticipate: run-7 waves are spawned inline, so no `launcher-progress.tsv` exists; the dead set comes from the transcripts instead, while `Q54`'s command half still names the progress file (`corpus/QUALITY.md:926`). {{L1:criterion extension}} — whether `Q54` is extended to the transcript-derived set; {{L1:dead-seat arm outcome}} — whether the arm names a dead seat on this round's own waves. Items 1, 2, 4, 5 and 6 of the reflection are not taken this round.
