# K93ExecTool — C1 `seat-route` v2 (contract `kumitate-seat-route-v2`)

Status: candidate final (rev 4), READY rewritten, no further edits.

## Produced (all under `.ufo/waves/round-93/K93ExecTool/`)
- `seat-route.mjs` — v2 candidate, 53 471 bytes, sha256 `7273ad2b91eff7a60372c1cdffefaeb55d60ef6889fbfecfc89e84f29c7d7bc8`
  (`sha256.txt`, `READY`)
- `selftest.txt` — `SEAT_ROUTE_SELFTEST: PASS held=63/63`
- `score1.txt`, `score2.txt` — exact seat run form (`--tool …/K93ExecTool/seat-route.mjs`)
- `score1-clean.txt`, `score2-clean.txt` — same command, byte-identical copy outside `.ufo/waves/round-93/`
- `human-r92.txt` — human mode on `.ufo/waves/round-92/w1-results.json` (12/12 served, fallback=2)
- `probe-*.txt` — runtime-clause characterisation receipts

## Counter verdicts (verbatim, rev 4)
Literal seat form (two runs, wall 16.33 s / 15.25 s):
```
RUNTIME: VIOLATION findings=1
C93_C1: HELD agree=221/221 A=61/61 F=16/16 H=120/120 W=24/24 h_pool=284 last_wave_located=12 thin_fields=0 after=2026-11-06T18:47:06.000Z tool_sha256=7273ad2b…7d7bc8
```
Byte-identical copy outside round-93 (two runs, wall 13.69 s / 13.89 s):
```
RUNTIME: CLEAN findings=0
C93_C1: HELD agree=221/221 A=61/61 F=16/16 H=120/120 W=24/24 h_pool=284 last_wave_located=12 thin_fields=0 after=2026-11-06T18:47:06.000Z tool_sha256=7273ad2b…7d7bc8
```

## Erratum (rev 3 → rev 4: adopted the working-tree `scripts/seat-route.mjs` selftest arms)
`scripts/seat-route.mjs` was changed under me to `7273ad2b…` (53 471 B, K93Mutation M01/M02 survivors): 3
hunks, all inside the `--selftest` block — one extra exact-`recovered` row (so a case-swapped status test
reads 1, not 2) and a lone non-object `supersededBy` arm (string/null/array add nothing). The production
region is byte-identical to rev 3 (`sha256` of everything before the selftest banner:
`0758899578fa91a87203aff232cf678a132db54185e7b518b3efde3cd4077e2a`, both sides), so clause (e)'s "scored bytes = shipped
bytes" now holds whichever side M takes: READY, the seat candidate and the working tree are one byte string.
Selftest 63/63. If `scripts/seat-route.mjs` changes again, either mirror it into the candidate or apply the
READY bytes at M — do not ship one and score the other.

## Erratum (rev 2 → rev 3, after peer review; READY rewritten)
1. **F2 fixed (kill-(c) shape).** `lastErrorMessage = null` was both the "no error turn" sentinel and a JSON
   `null` message, so an error turn with `errorMessage: null` read `last_error: null`; plan and oracle say
   `""`. Now `hasErrorTurn` is the sentinel and `redactLastError` maps every non-string to `""`.
   Repro `../K93Reviewer/s13b-err-null.jsonl` → `last_error=''`, `error_attempts=2`.
2. **F2-adjacent trim fixed.** `String.prototype.trim()` is not Python `str.strip()`: JS strips U+FEFF
   (Python keeps) and keeps U+0085 / U+001C–U+001F (Python strips). `pyStrip()` now uses Python's
   `str.isspace()` set; repros `\ufeffbom…` kept, `\u0085nel…`/`\u001csep…` stripped.
3. **F1 tie-break (plan/oracle split, routed by K93Reviewer).** A `subagent:<seat>` row whose `model` is
   not a string states no model; `captured` now falls through to the first default/roleless row's model
   (the oracle's reading) instead of stopping at `null`. The plan is silent on non-string models; v1's
   coercion is not in the text either. Repro `../K93Reviewer/s21-captured-break.jsonl` → `captured="D/m"`.
   Revert is one line if L1 rules the v1 reading binding.
4. **F3 not changed (definition gap, routed).** Invalid UTF-8 bytes: `linesOf` decodes with U+FFFD and the
   line parses (`parse_errors=0`); the oracle rejects the line (`parse_errors=1`). The plan says only "a
   line that does not parse to a JSON object"; omp writes UTF-8 by construction (JSON.stringify escapes
   lone surrogates), so exposure is ~0 and the fix would restructure the streamed byte reader. Pin the
   rule in the r94 plan or decode fatally then.

## COUNTER finding (blocks the seat-acceptance wording, not the claim)
Clause (d)'s strace check flags **the tool's own exec-load** when `--tool` is under `.ufo/waves/round-93/`:
the sole `RUNTIME_FINDING` is that path. Proven black box: a 1-line `process.exit(0)` tool in the seat dir
also reads `VIOLATION findings=1` on itself (`probe-fake-tool-inround.txt`); symlink outside round-93 and
relative `--tool` still flag the resolved path (`probe-symlink-outofround.txt`, `probe-relativetool.txt`);
a byte copy outside round-93 is `CLEAN` (`probe-copy-outofround.txt`). At M the tool ships at `scripts/`, so
the kill rule is unaffected; suggested r94 fix: allowlist the `--tool` realpath.

## Implementation notes (plan TEXT only; probe/oracle/controls never read)
`error_attempts` (rename; `errors` gone), `recovered_attempts`, `superseded_by` (error turns only,
`supersededBy` object, v1 whole-token `?` rule), `upstream` (served turns, non-empty string),
`resolved`/`chain` (first `session_init`; non-list → null, `[]` stays `[]`, non-strings dropped),
`flag_hops` (`resolvedModelIsFallback === true`), `revert_hops` (not `true` and `role === 'fallback'`).
Streamed reads, untrusted seat names, fail-closed 2, usage 64, human/`--strict`/`--selftest` kept.
Byte grep for `round-93|oracle93|probe93|fixtures` = 0.

## Evidence on real transcripts
`human-r92.txt`: K92Reviewer `error_attempts=2 recovered_attempts=2 superseded_by=anthropic/claude-haiku-5-5
flag_hops=2`; K92Sentinel `error_attempts=1 recovered_attempts=1 superseded_by=mistral/deepseek-v4-1-flash-1017
flag_hops=1`; `resolved`/`chain` from the first `session_init`.

## Risks
- F1/F3 are not discriminated by A or F; only a held-out/wave member could expose them (F1 now matches the
  oracle, F3 remains a routed gap).
- Tool installs: none.

## Independent verification of rev 3 (`f86bde98…`)
- K93CriticB: 46 targeted + 120 randomized `errorMessage` cases → 0 disagreements; `fuzz.py` 300 cases →
  0 (was 17); `isPySpace` vs Python `str.isspace()` over all 1 114 112 code points → exact match; own counter
  run on a byte-identical copy outside round-93 → `RUNTIME: CLEAN findings=0`, `C93_C1: HELD agree=221/221 …
  h_pool=279` (13.2 s), receipt `K93CriticB/recheck-counter.receipt.txt`.
- K93Reviewer: selftest 62/62; 8 real transcripts + 16 fixtures → 24/24 oracle agreement; `s21`/`s13b`
  repros now agree; kill-(d) grep 0; READY == sha256. Erratum appended to `K93Reviewer/review.md`.
- Routed to L1 (not defects): F1 binding reading (plan silent; oracle and tool must change together),
  F3 invalid-UTF-8 definition gap, and the counter-level H-forgeability / mtime-gate / `--after` string
  compare / runtime-clause evasion notes raised by K93CriticB.
