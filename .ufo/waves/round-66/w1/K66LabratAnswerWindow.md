VERDICT: CONFIRMED — the ±2-line answer window in `scripts/routed-ledger.mjs` lets a closed/wontfix answer quote match a neighbouring unrelated line of a real lane file; 5/5 probes exit 0 `ROUTED_LEDGER: CLEAN` with the shifted quote counted closed, so a wrong answer binds as CLOSED.

## Evidence

Hypothesis: `routed-ledger.mjs` locates an answer quote in `path:line ± 2` (window = lines L-2…L+2, `scripts/routed-ledger.mjs:220`), so a ledger row can claim line L with a quote taken from an adjacent, unrelated line and still pass → false CLOSED.

Method: scratch root (`/fast/scratch/hyaku/kumitate-r66/K66LabratAnswerWindow/root`) holding the committed tool (freeze commit `621212bac37f8249c72ac982d1d6534cb8d60701` bytes) + real `corpus/lessons/round-65-verifier-spotcheck.md` (7 routed items D1–D7) + real `corpus/lessons/round-65.md` (answer file). Each run ledgers all 7 items (`--from 65 --to 65`); only the probed row is `closed`, with the answer quote lifted from a neighbouring line (`offset ±2`) of the real lesson; controls: same row with a foreign quote (line 1, outside every window) and an exact-line row. Driver: `build/K66LabratAnswerWindow/probe-v2.mjs`; receipts: `build/K66LabratAnswerWindow/v2-*.txt`.

Verbatim results (all 5 probes; full set in `probe-v2.json`):

```
probe k=1: answer quote from real line 56 claimed at neighbouring line 54 (offset +2)
  abuse  quote@54: exit=0 CLEAN=true ANSWER_DEAD=false
  ctrl   foreign quote@54: ANSWER_DEAD=true (path live)
  exact  quote@56: ANSWER_DEAD=false (exact-line answer passes)
probe k=3: quote from line 141 claimed at 139 (+2)  → abuse exit=0 CLEAN, ctrl ANSWER_DEAD, exact ok
probe k=4: quote from line 146 claimed at 148 (-2)  → abuse exit=0 CLEAN, ctrl ANSWER_DEAD, exact ok
probe k=5: quote from line 151 claimed at 149 (+2)  → abuse exit=0 CLEAN, ctrl ANSWER_DEAD, exact ok
probe k=7: quote from line 115 claimed at 117 (-2)  → abuse exit=0 CLEAN, ctrl ANSWER_DEAD, exact ok
VERDICT BASIS: 5/5 probes reproduce the false CLOSED
```

Verbatim verdict lines (`v2-abuse-1.txt` / `v2-ctrl-1.txt`):

```
EXIT=0
ROUTED_LEDGER: CLEAN spotchecks=1 sections=1 items=7 rows=7 open=6 closed=1 wontfix=0
---
EXIT=1
FINDING ANSWER_DEAD P1@line7:answer-quote-not-at:corpus/lessons/round-65.md:54
ROUTED_LEDGER: DRIFT spotchecks=1 sections=1 items=7 rows=7 open=6 closed=1 wontfix=0 findings=1 first=ANSWER_DEAD:P1@line7:answer-quote-not-at:corpus/lessons/round-65.md:54
```

## Findings

- **K66LabratAnswerWindow-1 (high, attacks C1 tool L2/false-CLOSED)**: the tool's answer check is a 5-line fuzzy match, not a line check. `scripts/routed-ledger.mjs:220` `const win = norm(AL.slice(Math.max(0, ans.line - 3), Math.min(AL.length, ans.line + 2)).join(' '));` accepts any quote from lines L-2…L+2. Repro: `node build/K66LabratAnswerWindow/probe-v2.mjs` in a copy of the fixture (driver writes the ledgers and runs the tool). Consequence: an integrator can close any round-65 item D1–D7 by citing a neighbouring line that does not answer the item, and the gate prints CLEAN. A strengthening fix (L1 integrates; ratchet permits, never relaxes): require the quote to match at the exact line (or at a unique line, with UNLEDGERED-style ambiguity finding), plus a selftest case `answer quote from neighbouring line → ANSWER_DEAD`.
- **K66LabratAnswerWindow-2 (medium, attacks frozen counter L3 as declared)**: the frozen counter independently re-verifies answers with the same ±2 window (`.ufo/waves/round-66/probe/ledger66-probe.mjs:167`, identical `slice` expression; the ±2 tolerance is also declared in the plan's L3 wording), so L3 would certify the same shifted quotes as located. Per round rules this is reported, not patched by this seat; if L1 tightens the tool, the counter's declared rule text and code would need the same tightening in a later round (the freeze forbids editing it now).
- **K66LabratAnswerWindow-3 (low, measurement note)**: a first probe pass masked the signal — with sibling items unledgered the verdict reads DRIFT via `UNLEDGERED` even when the shifted answer is accepted, and table-cell quotes containing `|` break row parsing (`ROW_MALFORMED cells=8`); a careless reader could mistake DRIFT-without-ANSWER_DEAD for a rejection. The controlled v2 runs isolate the answer check (all 7 items ledgered) and are the citable evidence.

## Artifacts

- `build/K66LabratAnswerWindow/probe-v2.mjs` — driver (fixture assembly, ledger generation, tool runs)
- `build/K66LabratAnswerWindow/probe-v2.json` — machine-readable results of all 5 probes
- `build/K66LabratAnswerWindow/v2-abuse-{1,3,4,5,7}.txt`, `v2-ctrl-*.txt`, `v2-exact-*.txt` — verbatim tool output per run
- `build/K66LabratAnswerWindow/abuse-*.txt`, `ctrl-*.txt` — first-pass (v1) outputs retained for finding 3
- No files in the lane repo, `scripts/`, or the frozen probe were modified.

## Limits

- Probed only the answer-window path; the item-quote (`QUOTE_ABSENT`) path and the L4 mutant harness were not re-run beyond the tool's own `--selftest`.
- All 5 probes use one real answer file (`corpus/lessons/round-65.md`, 161 lines) and one spot-check (round 65); other lessons/rounds were not sampled, though the window code is path-independent.
- Runs used `--from 65 --to 65` with a 2-file scratch root rather than the full lane at a rev; the window logic under test is identical, but full-lane `--rev` behavior (git-archive reads) was not exercised.
- v1 driver had a buggy out-of-window control (claim at T+3 keeps a +2 quote inside the moved window); v2 controls (foreign quote, exact line) are the valid ones. No tools installed; no pacman/uv actions.
