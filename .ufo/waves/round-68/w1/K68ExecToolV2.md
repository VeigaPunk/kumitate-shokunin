VERDICT: v2 full-file draft landed at `build/K68ExecToolV2/routed-ledger.mjs` (732 lines, sha256 05aacb5e…): own selftest PASS (56/56, exit 0), peer acceptance suite PASS (54/54), 18/20 of the frozen L4 mutants — the two misses are a defect in the frozen fixture, and correcting that single row turns the matrix 20/20 and the frozen counter from `held=2/7` to `held=4/7` (L1, L4, L5, L7 held; L2/L3/L6 need C1's data and registry rows).

## Evidence

Commands run from `/fast/scratch/hyaku/kumitate-r68/K68ExecToolV2` (scratch, TMPDIR set there); the lane's `scripts/` was never touched.

1. Before (v1 at the lane base): `node <lane>/scripts/routed-ledger.mjs --selftest | tail -1`
   `ROUTED_LEDGER_SELFTEST: PASS (33/33)` — exit 0.
2. Draft selftest: `TMPDIR=… node build/K68ExecToolV2/routed-ledger.mjs --selftest | tail -1`
   `ROUTED_LEDGER_SELFTEST: PASS (56/56)` — exit 0, wall 167 ms; 56 `CASE ok` lines, 0 `CASE FAIL` (receipt `receipts/selftest.txt`).
3. GIT_DIR-inherited arm: `GIT_DIR=/nonexistent/repo.git node … --selftest | tail -1` → `ROUTED_LEDGER_SELFTEST: PASS (56/56)`, exit 0.
   The child-escape arm is a selftest case: fixture repo D commits a CLEAN ledger, its worktree is then drifted to DRIFT, a foreign repo F commits that DRIFT ledger, and `--root D --rev HEAD` is spawned with `GIT_DIR=<F>/.git` → exit 0 `ROUTED_LEDGER: CLEAN` (a tool honouring GIT_DIR would read F and print DRIFT).
4. 20-mutant matrix, fixture code copied verbatim from the frozen counter (`buildFixture`/`MUTANTS` out of `probe/ledger68-probe.mjs`, seed `k68execv2`):
   `TMPDIR=… node build/K68ExecToolV2/tools/l4-frozen.mjs build/K68ExecToolV2/routed-ledger.mjs k68execv2` → `L4_MATRIX: 18/20 pass` (`receipts/l4-matrix-frozen.txt`).
   The two misses, verbatim:
   `FAIL mut=good want_exit=0 got_exit=1 got=[QUOTE_ABSENT,UNLEDGERED] items=7 :: ROUTED_LEDGER: DRIFT spotchecks=2 sections=2 items=7 rows=7 open=6 closed=1 wontfix=0 findings=2 first=QUOTE_ABSENT:A5@line11:round-101-item-5`
   `FAIL mut=no-section want_exit=0 got_exit=1 got=[QUOTE_ABSENT,UNLEDGERED] items=5 :: … first=QUOTE_ABSENT:A5@line11:round-101-item-5`
5. Same matrix over the fixture with the single A5 row corrected (`tools/l4-a5fix.mjs`, patch `patch/ledger68-probe-A5-quote.patch`): `L4_MATRIX: 20/20 pass`, every mutant at its exact expected exit and finding id (`receipts/l4-matrix-A5-patched.txt`), e.g. `PASS mut=second-section want_exit=1 want=UNLEDGERED got_exit=1 got=[UNLEDGERED] items=8 :: … sections=3 items=8`, `PASS mut=ambiguous-quote … got=[QUOTE_AMBIGUOUS,UNLEDGERED]`, `PASS mut=contradictory … got=[ROW_CONTRADICTED]`.
6. v1 through the same matrix (before): `L4_MATRIX: 13/20 pass`; v1 misses good, ordinal, one-word-quote, ambiguous-quote, shifted-answer, contradictory, no-section (`receipts/l4-matrix-v1-before.txt`).
7. Frozen counter on the draft: sandbox `git clone --shared <lane> lane`, draft copied to `lane/scripts/routed-ledger.mjs`, committed inside the clone only. Final bytes, rev `a97cc8c7` (receipt `receipts/counter-on-draft-final.txt`):
   `LEDGER68_UNMET held=2/7 checks=7 rev=a97cc8c741d73d1836fcf59358a7815fa90cb6ea rule=L68 seed=k68execv2 | L2 MISS exit=2 verdict=ROUTED_LEDGER: FAIL-CLOSED reason=ledger-absent:corpus/routed-ledger.md own-items=61 own-sections=12 own-spotchecks=12 | L3 MISS 68 problems: ledger-empty-or-absent,unledgered:55#1,… | L4 MISS seed=k68execv2 2/20 mutants wrong: good:exit=1:…items=7…;no-section:exit=1:…items=5… | L5 MISS real-tool-passes-L4=false stubs-caught=always-clean+always-drift | L6 MISS skill-row=false quality=false capability-row=false` — L1 and L7 held. The earlier run on the pre-doc bytes (`f47065bd`) read the same `held=2/7`, confirming findings -3/-4 are inert for L1..L7.
   The same counter run over the fixture with the A5 correction (finding -1) reads `LEDGER68_UNMET held=4/7 … rev=f47065bd… | L2 MISS … | L3 MISS … | L6 MISS …` (`receipts/counter-with-A5-patch.txt`): **L1, L4, L5, L7 all hold**, so `held=4/7` is the draft's measured ceiling until C1's data and the registry rows land.
8. Real-corpus agreement with the counter's own count: `node build/K68ExecToolV2/routed-ledger.mjs --root <scratch>/lane --from 55 --to 66` (sandbox corpus, synthetic one-open-row-per-item ledger, untracked) →
   `ROUTED_LEDGER: CLEAN spotchecks=12 sections=12 items=61 rows=61 open=61 closed=0 wontfix=0`, exit 0 — equal to the counter's `own-items=61 own-sections=12` (`receipts/l2-style-clean.txt`; the ledger used is scratch-only, NOT citable data).
9. Peer acceptance suite (seat `K68ExecToolSelftest`, 54 cases): `node <lane>/.ufo/waves/round-68/build/K68ExecToolSelftest/run-cases.mjs --tool build/K68ExecToolV2/routed-ledger.mjs --scratch …` → `ROUTED_LEDGER_ACCEPTANCE: PASS (54/54)`, exit 0 (`receipts/peer-acceptance.txt`).

Pointer arithmetic that matters for the L1: the frozen L4 `good` regex wants `items=7` (= 5 items from round 101 + 2 from round 102). Only fence-aware counting (v1 counted the fenced `- fenceLine`, printing `items=8`) **and** a heading-bounded section end (the counter's own `items67()` extends to EOF and counts 6, also 8) produce 7. The draft does both; v1 does neither.

## Selftest (56 hermetic cases, exit 0)

`ROUTED_LEDGER_SELFTEST: PASS (56/56)` in 167 ms; verbatim output in `receipts/selftest.txt` (56 `CASE ok` lines, 0 `CASE FAIL`).
Cases: the 20 counter mutants of the matrix below; parser (8) — 5 items, fence/prose/nested/table-header excluded, nested bullet is item 1 text, not an item, prose after the list is in no item, fenced bullet is in no item, table header and separator are not items, two routed sections in one file → 2 sections, ordinals continue, deeper sub-heading stays inside the routed section, prose-only routed section yields 0 items, exit 0; structure/answer confinement (28) — two-word quote → ROW_MALFORMED, open row carrying an answer → ROW_MALFORMED, closed row with "-" answer → ROW_MALFORMED, bad status → ROW_MALFORMED, six-cell row → ROW_MALFORMED, R-id whose round cell disagrees → ROW_MALFORMED, round outside the range → ITEM_ABSENT, answer file absent → ANSWER_DEAD, absolute answer path → ANSWER_DEAD, answer path with .. → ANSWER_DEAD, answer pointing into a spot-check → ANSWER_DEAD, answer reached through a symlink → ANSWER_DEAD, --to excludes later spot-checks (spotchecks=1), --classes prints CLASS lines, no RECURRENT under 4 rounds, RECURRENT fires at 4 distinct rounds, --ledger outside the root → FAIL-CLOSED exit 2, symlinked ledger → FAIL-CLOSED exit 2, ledger without ## Ledger → FAIL-CLOSED exit 2, absent root → FAIL-CLOSED exit 2, no spot-check in range → FAIL-CLOSED exit 2, unreadable --rev → FAIL-CLOSED exit 2, --rev reads committed bytes, not the worktree, inherited GIT_DIR is not honoured (spawned child reads --root repo), symlinked spot-check → FAIL-CLOSED exit 2, --root that is a symlink → FAIL-CLOSED exit 2, usage: unknown argument → exit 64, usage: --root without a value → exit 64, usage: --from abc → exit 64.

## 20-mutant matrix (frozen fixture vs A5-corrected)

| mutant | want (exit / finding) | frozen fixture | A5-corrected fixture |
|---|---|---|---|
| `good` | 0 / — | FAIL exit 1 → {QUOTE_ABSENT,UNLEDGERED} | PASS exit 0 → {-} |
| `drop` | 1 / UNLEDGERED | PASS exit 1 → {QUOTE_ABSENT,UNLEDGERED} | PASS exit 1 → {UNLEDGERED} |
| `quote-swap` | 1 / QUOTE_ABSENT | PASS exit 1 → {QUOTE_ABSENT,UNLEDGERED} | PASS exit 1 → {QUOTE_ABSENT,UNLEDGERED} |
| `quote-decoy` | 1 / QUOTE_ABSENT | PASS exit 1 → {QUOTE_ABSENT,UNLEDGERED} | PASS exit 1 → {QUOTE_ABSENT,UNLEDGERED} |
| `answer-wrong` | 1 / ANSWER_DEAD | PASS exit 1 → {ANSWER_DEAD,QUOTE_ABSENT,UNLEDGERED} | PASS exit 1 → {ANSWER_DEAD} |
| `answer-ledger` | 1 / ANSWER_DEAD | PASS exit 1 → {ANSWER_DEAD,QUOTE_ABSENT,UNLEDGERED} | PASS exit 1 → {ANSWER_DEAD} |
| `answer-eof` | 1 / ANSWER_DEAD | PASS exit 1 → {ANSWER_DEAD,QUOTE_ABSENT,UNLEDGERED} | PASS exit 1 → {ANSWER_DEAD} |
| `dup` | 1 / ROW_DUPLICATE | PASS exit 1 → {QUOTE_ABSENT,ROW_DUPLICATE,UNLEDGERED} | PASS exit 1 → {ROW_DUPLICATE} |
| `ordinal` | 1 / ITEM_ABSENT | PASS exit 1 → {QUOTE_ABSENT,ITEM_ABSENT,UNLEDGERED} | PASS exit 1 → {ITEM_ABSENT} |
| `nested-as-item` | 1 / QUOTE_ABSENT | PASS exit 1 → {QUOTE_ABSENT,UNLEDGERED} | PASS exit 1 → {QUOTE_ABSENT} |
| `prose-as-item` | 1 / QUOTE_ABSENT | PASS exit 1 → {QUOTE_ABSENT,UNLEDGERED} | PASS exit 1 → {QUOTE_ABSENT} |
| `long-quote` | 1 / ROW_MALFORMED | PASS exit 1 → {ROW_MALFORMED,QUOTE_ABSENT,UNLEDGERED} | PASS exit 1 → {ROW_MALFORMED,UNLEDGERED} |
| `one-word-quote` | 1 / ROW_MALFORMED | PASS exit 1 → {ROW_MALFORMED,QUOTE_ABSENT,UNLEDGERED} | PASS exit 1 → {ROW_MALFORMED,UNLEDGERED} |
| `ambiguous-quote` | 1 / QUOTE_AMBIGUOUS | PASS exit 1 → {QUOTE_AMBIGUOUS,QUOTE_ABSENT,UNLEDGERED} | PASS exit 1 → {QUOTE_AMBIGUOUS,UNLEDGERED} |
| `shifted-answer` | 1 / ANSWER_DEAD | PASS exit 1 → {ANSWER_DEAD,QUOTE_ABSENT,UNLEDGERED} | PASS exit 1 → {ANSWER_DEAD} |
| `fence-item` | 1 / QUOTE_ABSENT | PASS exit 1 → {QUOTE_ABSENT,UNLEDGERED} | PASS exit 1 → {QUOTE_ABSENT} |
| `second-section` | 1 / UNLEDGERED | PASS exit 1 → {QUOTE_ABSENT,UNLEDGERED} | PASS exit 1 → {UNLEDGERED} |
| `contradictory` | 1 / ROW_CONTRADICTED | PASS exit 1 → {QUOTE_ABSENT,ROW_CONTRADICTED,UNLEDGERED} | PASS exit 1 → {ROW_CONTRADICTED} |
| `no-section` | 0 / — | FAIL exit 1 → {QUOTE_ABSENT,UNLEDGERED} | PASS exit 0 → {-} |
| `ledger-absent` | 2 / — | PASS exit 2 → {-} | PASS exit 2 → {-} |

## Findings

**K68ExecToolV2-1 — [high] The frozen L4 fixture is unsatisfiable: row `A5` quotes words that are in no item, so the CLEAN arms (`good`, `no-section`) can never pass.** Row A5 binds `k=5` (item D5 = `phrase(5) ${shared}`) but quotes `items101[2].split(' ').slice(2, 4)` — two words of **D4**'s phrase — followed by `shared`; D4 holds words 5–6 between those and `shared`, so the quote is contiguous nowhere. Every conformant v2 tool therefore emits `FINDING QUOTE_ABSENT A5@…` and exits 1 on `good`, `L4` misses, `L5` (never vacuous) misses with it, and `LEDGER68_HELD` is unreachable whatever the tool does. The counter's own L3 rule (`quote-not-word-boundary-in-item`) rejects the same row, so the defect is self-evident by inspection, not a judgement call.
Reproduce: `TMPDIR=… node build/K68ExecToolV2/tools/l4-frozen.mjs build/K68ExecToolV2/routed-ledger.mjs k68execv2` → 18/20 with `first=QUOTE_ABSENT:A5@line11:round-101-item-5`. Strengthening (monotone, fixtures only): `patch/ledger68-probe-A5-quote.patch` — capture D5's words (`const d5 = phrase(5);`), use `${d5} ${shared}` in the D5 line, and set `A5.q = \`${d5.split(' ').slice(3, 5).join(' ')} ${shared}\``; with it the matrix is 20/20 and `L4`/`L5` become reachable (`tools/probe-a5fix.mjs` is the counter so patched). The patch touches no check, only the held-out fixture generator.

**K68ExecToolV2-2 — [medium] The counter's two halves disagree on the section boundary, and its own fixture exposes it.** `buildFixture` hard-codes `expectItems = 7` (5+2), i.e. a routed section ends at the next same-or-shallower heading, while `items67()` ends it at the next routed heading or EOF (so it counts 6 for round 101, sum 8). Today this is masked: over rounds 55..66 both rules give `items=61 sections=12` (measured — `own-items=61 own-sections=12` and the draft's identical `items=61 sections=12`), because no spot-check emits bullets after its routed section. It stops being harmless the first time a spot-check routes items mid-file and then lists anything (a `## Non-author statement` bullet list would do it): `L2`'s `items=` would then be unsatisfiable for any heading-bounded tool, exactly as `L4` is today. Proposal for round 69+: make `items67()` end a routed section at the next heading of the same or a shallower level (identical output on today's corpus, so no retroactive change to any scored round).
Reproduce: `DBG=1 node build/K68ExecToolV2/tools/probe-dbg.mjs <lane> d23892ad44b41e1af63b3edb949d265ca1dd812d 2>&1 | grep 'DBG mut=good'` → `DBG mut=good expect=7 own101=6/1 own102=2/1 sum=8` (that copy is the frozen probe plus two `console.error` lines).

**K68ExecToolV2-3 — [low] `sections=` meaning changed from v1 (files-with-a-section) to routed sections; the counter's L2 compares against the per-heading count, so the new meaning is the correct one and is now documented in the file header.** A tool that kept v1's meaning would MISS L2 on any range where one file carries two routed sections. Reproduce: `l4-matrix-A5-patched.txt`, `mut=second-section … sections=3` vs v1's 2.

**K68ExecToolV2-4 — [low] Diagnostics regression I introduced and closed: `reason=root-absent` had lost the resolved path v1 printed.** Restored as `reason=root-absent:<abs path>` (peer case C05); selftest case `absent root → FAIL-CLOSED exit 2` still green.

**K68ExecToolV2-5 — [info] Nothing in the draft blocks L2/L3/L6; they are unmet by construction at this seat.** L2/L3 need `corpus/routed-ledger.md`, L6 needs the SKILL/QUALITY/SCORECARD rows — all integration-owned (`corpus/`, `SKILL.md`, `SCORECARD.md` are outside my write scope). With finding -1 fixed the draft's ceiling is `held=4/7` (L1, L4, L5, L7) until that data lands.

## Draft contract (what the L1 lands into `scripts/routed-ledger.mjs`)

- CLI `--root DIR [--rev REV] [--from N] [--to N] [--ledger PATH] [--classes]`, `--selftest`; exit 0/1/2/64.
- Finding ids: UNLEDGERED, QUOTE_ABSENT, QUOTE_AMBIGUOUS, ANSWER_DEAD, ROW_DUPLICATE, ITEM_ABSENT, ROW_MALFORMED, ROW_CONTRADICTED.
- Hardenings: inherited `GIT_DIR`/`GIT_*`/`TAR_OPTIONS` deleted from the process and all children run under `{PATH, TMPDIR, LANG, HOME}` (never honoured, never refused — refusing would break the peer's C05/`--rev` arm); `--root` final component, `--ledger`, every answer path and every spot-check are refused when absolute, `..`, outside the root, or reached through a symlink (ledger/root/spotcheck → exit 2, answer → ANSWER_DEAD); every routed section is scanned with global per-file ordinals; quotes are ≥ 3 and ≤ 25 words, word-boundary located, unique in the file (ambiguous → QUOTE_AMBIGUOUS); answers bind at the exact named line; fences never yield items.
- Exports kept for callers: `norm`, `routedItems` (now `{found, sections, items}`), `ledgerRows`, `evaluate`, `main`; added `routedSections`, `words`, `wb`, `childEnv`. Only `scripts/routed-ledger.mjs` itself references these (grepped).

## Artifacts

- `build/K68ExecToolV2/routed-ledger.mjs` — the full-file draft (732 lines; sha256 `05aacb5ede6b3389a693bb71c6c1cb74281f8bab9b5bf2309027dd97d83913b1`), the only file the L1 needs to copy.
- `build/K68ExecToolV2/receipts/selftest.txt` — 56 `CASE ok` + `ROUTED_LEDGER_SELFTEST: PASS (56/56)`.
- `build/K68ExecToolV2/receipts/l4-matrix-frozen.txt` — 18/20 on the frozen fixture, per-mutant lines.
- `build/K68ExecToolV2/receipts/l4-matrix-A5-patched.txt` — 20/20 with the proposed fixture fix.
- `build/K68ExecToolV2/receipts/l4-matrix-v1-before.txt` — v1 13/20.
- `build/K68ExecToolV2/receipts/counter-on-draft-final.txt` (frozen counter, final bytes, `held=2/7`) and `receipts/counter-with-A5-patch.txt` (same fixture with finding -1 applied, `held=4/7`: L1/L4/L5/L7 hold).
- `build/K68ExecToolV2/receipts/l2-style-clean.txt` — real-corpus CLEAN at `items=61 sections=12` with a scratch-only ledger.
- `build/K68ExecToolV2/receipts/peer-acceptance.txt` — 54/54.
- `build/K68ExecToolV2/patch/ledger68-probe-A5-quote.patch` — the fixture strengthening for the L1 (frozen counter untouched).
- `build/K68ExecToolV2/tools/` — the runners behind the receipts, all inside the build dir: `l4-frozen.mjs` (counter fixture code + 20-mutant matrix), `l4-a5fix.mjs` (same over the corrected fixture), `probe-dbg.mjs` (frozen counter + two `console.error` lines, for finding -2), `probe-a5fix.mjs` (frozen counter + the A5 patch), `gen-ledger.mjs` (synthetic-ledger generator for the L2-style run).

## Limits

- I did not author ledger data or registry rows (integration-owned); the `61 items` ledger used for the L2-style run is generated, untracked scratch and proves only that the parser and the counter agree — it is not C1 evidence.
- `--classes` stays informational (CLASS/RECURRENT lines, no exit effect), as in v1; L3's class rules remain the counter's.
- The frozen counter was run on a sandbox clone (`git clone --shared`) with the draft committed *inside the clone*; the lane worktree, index and jj state were not touched, and the lane's `scripts/` was not edited.
- Not exercised: rev-mode answer reads against a ledger whose answers live only in a commit; multi-section files with fenced headings; Windows/POSIX path edge cases beyond `..`/absolute/symlink.
- Tooling: nothing installed or upgraded; no pacman/jj/git write in the lane or the fleet. No build, lint or formatter run in the lane (editing wave).
- Observation for the L1 (not my writes): `git -C <lane> status --porcelain` shows ` M .ufo/waves/round-68/probe/deprec68-probe.mjs` and ` M .ufo/waves/round-68/controls/c1-donothing.txt`, `c1-autoledger.txt` — frozen artifacts I only read, edited by another seat or left uncommitted by the freeze. `scripts/routed-ledger.mjs` is byte-unchanged (`sha256 f92a364d293a283804e7d693f04cddfd94040d7f29a6c5c428b900b0d6ff3bf5`); my writes are this report, `build/K68ExecToolV2/**` and deleted scratch only.
