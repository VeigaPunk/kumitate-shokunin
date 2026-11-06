# K93ExecHarm — harm and integration delta for `seat-route` v1 → v2

Seat scope: sandbox battery of the lane's own gates at the round-93 freeze rev, the same battery with the
READY candidate swapped in (M-sim), the consumer inventory for the renamed `errors` key, and the exact
integration edits the L1 must make at M. No files under the lane were modified; every receipt is a file in
this seat directory.

## Provenance (all numbers are from these bytes)

| object | bytes |
|---|---|
| lane freeze rev | `b6204949e3bb17df9d6cf0cc3f59ea0c4b362061` (committer 2026-11-06T17:53:14-03:00; plan says `20:53:14Z`) |
| base tree | `git -C <lane> archive b6204949 \| tar -x -C $S/base` (scratch) |
| base tool | `scripts/seat-route.mjs` sha256 `cd7ee03dd814da01f6c73ad4113022c2484dea182f95b0a84e07f9b6810ccfac` (v1, admitted r92) |
| candidate | `.ufo/waves/round-93/K93ExecTool/seat-route.mjs`, `READY` = `98a5a3a341b2b41540206caa5378d2ff5dacf02015f8aedf160b9d0f72b6efe9` — matches `sha256sum` (v2, `CONTRACT = kumitate-seat-route-v2`, 1080 lines) |
| host | Linux 7.2.11-arch1-1, `node v24.21.0` |
| git-history clone used for `round-gate` | `git clone --shared --no-checkout <lane>`, `checkout --detach b6204949` (fixture; no lane mutation) |

Receipts: `battery-base.txt`, `battery-cand.txt`, `battery-cand-pinfix.txt`, `battery-diff-final.txt`,
`pre-existing-drift.txt`, `counter-oracle-captured.txt`, `base-r91-wave.json`, `base-r92-wave.json`,
`diff-final/` (per-row summary).

## 1. Battery: base vs candidate (M-sim)

`battery-base.txt` runs in the archive extraction; `battery-cand.txt` runs the same commands with
`scripts/seat-route.mjs` replaced by the READY candidate (sha verified against `READY` first). The clone
that runs `round-gate` is the same directory before and after the overlay, so the two readings are paired.

| command | base (v1) | candidate (v2) | delta |
|---|---|---|---|
| `node scripts/seat-route.mjs --selftest` | `SEAT_ROUTE_SELFTEST: PASS held=37/37`, exit 0 | `SEAT_ROUTE_SELFTEST: PASS held=54/54`, exit 0 | count 37→54 (no gate pins the number; SKILL item 47 matches the prefix only) |
| `node scripts/proxy-check.mjs` | `PROXY: DRIFT` 3 terms (`A_WAVE_DRIFT` 1381/1399, `C2_DRIFT` 236/237, `C2_TOTAL_DRIFT` 236/237), exit 1 | same 3 terms **plus** `GATE_PIN_DRIFT pin.seat-route declared=cd7ee03d… computed=98a5a3a3…`, exit 1 | exactly one new term = the stale `pin.seat-route` (see §2.1) |
| `node scripts/proxy-check.mjs --strict` | identical to the default arm, exit 1 | identical to the default arm, exit 1 | no new `PIN_UNPINNED` in either |
| `node scripts/counter-pins.mjs` | `COUNTER_PINS: CLEAN pins=50`, exit 0 | same, exit 0 | none (no `seat-route` pin in the registry) |
| `node scripts/sources-check.mjs` | `SOURCES_CHECK: CLEAN (rows=206 tiers=A:174,B:22,C:10 …)`, exit 0 | byte-identical line, exit 0 | none |
| `node scripts/round-gate.mjs --round 92 --repo <clone> --reports-dir <fleet>/.ufo/reports --main-repo <fleet>` (real lane history) | `ROUND_GATE: CLEAN (round=92 lane=kumitate checks=10 errors=0 warnings=0)`, exit 0 | same, exit 0 | none (round-gate reads no tool bytes) |
| `node scripts/round-gate.mjs --round 92 --close …` | `ROUND_GATE: FAIL-CLOSED (UPSTREAM_MISSING)`, exit 2 | same, exit 2 | clone artifact: a detached clone has no upstream branch. Not a lane reading; L1 runs `--close` in the lane where the upstream exists. |

The 3-term proxy drift is **pre-existing at the freeze rev and not candidate-caused**: `pre-existing-drift.txt`
attributes `A_wave +18` to the 18 runnable files the freeze commit itself adds under `.ufo` (15 control
scripts + `make-fixtures93.py` + `oracle93.py` + `probe93-c1.py`) and `C2 +1` to the round-92 spotcheck
README row adopted just before the freeze. The `A_wave` and `C2` declarations were measured at r92 close
(`36277d49`: `A_wave` count 1381, README rows 236) and were not re-measured at the freeze.

## 2. Exact integration edits (what the L1 must change at M)

### 2.1 MUST — `SCORECARD.md:357` (inside the `<!-- kumitate-gate-pins-v1 … -->` block)

```
-pin.seat-route=cd7ee03dd814da01f6c73ad4113022c2484dea182f95b0a84e07f9b6810ccfac
+pin.seat-route=98a5a3a341b2b41540206caa5378d2ff5dacf02015f8aedf160b9d0f72b6efe9
```

Evidence: `battery-cand.txt` (new `GATE_PIN_DRIFT` term) and `battery-cand-pinfix.txt` (same tree with only
this line changed: the pin term disappears and the residual drift is byte-identical to `battery-base.txt`).
Constraint: the value must be `sha256sum scripts/seat-route.mjs` **at M**, i.e. the exact bytes scored by the
frozen predicate; if the L1 edits the candidate after READY, recompute — kill clause (e) compares the two.

### 2.2 MUST — `SKILL.md:647` (gate registry row `seat-route`)

Replace the record-shape clause

```
(`seat`, `captured`, `answered`, `fallback`, `errors`, `aborted`, `last_error` redacted, `yielded`,
`final`, `parse_errors`; wave mode adds `role` and `session`)
```

with

```
(`seat`, `captured`, `answered`, `fallback`, `error_attempts`, `recovered_attempts`, `superseded_by`,
`upstream`, `resolved`, `chain`, `flag_hops`, `revert_hops`, `aborted`, `last_error` redacted, `yielded`,
`final`, `parse_errors`; wave mode adds `role` and `session`)
```

and, in the same row, `contract `kumitate-seat-route-v1` (round 92)` → `contract `kumitate-seat-route-v2`
(round 92; v2 round 93)`. Everything else in the row stays: entry commands, the `SEAT …` / `SEAT_ROUTE: OK|DRIFT
seats=… served=… dead=… aborted=… silent=… absent=… fallback=…` line, and the 0/1/2/64 exit map are unchanged
(verified by the tool: r91/r92 wave `--strict` exits 0 in both, `battery-diff-final.txt`).

### 2.3 MUST — `SKILL.md:765` (checklist item 47)

`contract `kumitate-seat-route-v1`` → ``contract `kumitate-seat-route-v2` ``. The example command and the
expected `SEAT_ROUTE_SELFTEST: PASS` line stay valid (selftest prints `PASS held=54/54`).

### 2.4 SHOULD — the live documentation of the renamed key

`corpus/knowledge/seat-route-from-session-transcripts.md` still documents v1 field names:

- line 2 (`verified-at:`): keep the header trio (`source:` / `verified-at:` / `recheck:` are required by
  `sources-check`'s `HEADER_INCOMPLETE`); add the round-93 freeze + the shipped instrument sha256.
- line 3 (`recheck:`): the command still runs `probe92-c1.py`; point it at
  `.ufo/waves/round-93/probe/probe93-c1.py` with the frozen argv (`--sample-a …/round-92/probe/sampleA.tsv`,
  `--fixtures …/round-93/probe/fixtures`, `--after 2026-11-06T21:40:00.000Z`, `--waves …/r92…,r93…`).
- line 55: `- `errors`: count of turns with `stopReason` `error`.` → `error_attempts` (one per failed retry
  attempt, not per request) plus the seven new bullets (`recovered_attempts`, `superseded_by`, `upstream`,
  `resolved`, `chain`, `flag_hops`, `revert_hops`).
- lines 83 and 102: `errors` → `error_attempts` (line 102 already states the per-attempt semantics; keep it).
- The "Limits" § still says the definitions do not read `upstreamModel` / `retryFallback` roles — that stays
  true (v2 reads `upstreamProvider` and the *first* `session_init.retryFallback.chain`, not the spawn role).
- The "Measured status (round 92)" paragraph (lines 88–99, including the `cd7ee03d…` sha256 quote at line 93)
  is a historical r92 measurement; keep it as history and, if desired, append a round-93 measured-status
  paragraph for v2 rather than rewriting the r92 numbers.
- No pin binds this file's content: `.ufo/pins/readme-map.json:238` is keyed by path, and the note is not in
  `.ufo/pins/anchor-truth.json` (`grep` over `.ufo/pins/*.json`).

### 2.5 SHOULD — `corpus/README.md:272` (coverage-map row, content only)

The row describes the note as "(`seat-route` v1)". `readme-map` requires one row per live file, not specific
text, so this is accuracy-only: `v1` → `v2`, and optionally append `.ufo/waves/round-93/` to the source column.

### 2.6 OPTIONAL — `SCORECARD.md:1999` (`## Capabilities`, live row `seat-route`)

The row already says "error turns (one per attempt)"; it names no key and no contract id, so no gate reads it.
If the L1 wants the capability table to describe v2, add the new fields there; otherwise leave it.

## 3. Consumers of the `errors` key — inventory (grep receipts)

`grep -rn "seat-route" scripts/ SKILL.md .ufo/pins/` at the freeze rev finds exactly:

| site | what it is | must change? |
|---|---|---|
| `scripts/proxy-check.mjs:580` | `'pin.seat-route': 'scripts/seat-route.mjs'` — pin-name → path map, no bytes of the tool | **no** (path unchanged) |
| `SKILL.md:647` | registry row (fields + contract id) | yes — §2.2 |
| `SKILL.md:765` | checklist item 47 (contract id) | yes — §2.3 |
| `.ufo/pins/readme-map.json:238` | covered-file list, path-keyed | no |

Prose mentions that are no-change: `SKILL.md:284` (`scripts/omp-global-config.mjs` — a *different* "seat-route
resolver" over the omp global config), `SKILL.md:589` ("Thirty-two gate rows over thirty-one gate files (round
92 adds `seat-route` …)" — counts unchanged), `SKILL.md:703` ("Forty-seven items (round 92 adds the seat-route
transcript reading, item 47 …)" — item count unchanged).

No file in `scripts/` imports the module or parses its JSON/human output (`grep -rn "seat-route" scripts/*.mjs`
→ only the proxy pin map; `grep` for `import`/`require` of it → none). `.ufo/pins/counter-pins.json` has 50
pins and none is `scripts/seat-route.mjs`, so the counter-pins gate is insensitive to the swap (CLEAN before
and after). The only other live prose that names the v1 contract is `SKILL.md:647`/`:765`;
`SCORECARD.md:475` (Move log), `SCORECARD.md:4489` (Round-92 section), `LOG.md:3128` and
`corpus/lessons/round-92.md:9` are historical records and must **not** be rewritten (append-only erratum rule).

## 4. Behaviour delta measured on real transcripts (not the frozen scorer)

`battery-diff-final.txt` + `diff-final/`: both tools run `--file <P> --json` over all 61 rows of
`.ufo/waves/round-92/probe/sampleA.tsv`, under `prlimit --as=4294967296` and `timeout 240`. The harness is
preserved as `diff93.py` in this seat directory (sha256 `60ef8b00…`; the scratch copy named in the receipt
header is removed per contract):

```
ROWS 61 · EXIT_DRIFT 0 · JSON_FAIL 0 · KEYSET_DRIFT 0 · V1_VALUE_DRIFT 0 · ERRORS_RENAMED_MISMATCH 0
INVARIANTS PASS
```

i.e. every v1 field except `errors` is byte-equal, `error_attempts == v1 errors` on every row, the key set is
exactly `v1 keys − {errors} + {8 new keys}`, and `errors` never appears in a v2 record. Wave mode on the r91
and r92 results: 12 seats each, same order, exit 0 (`--strict` too); the only difference is the additive fields
plus the rename (`base-r91-wave.json`, `base-r92-wave.json` and the cand runs in the battery receipts).

## 5. Kill-rule pre-checks observed here (L1 owns the frozen predicate)

- clause (d) byte grep on the READY bytes: `grep -c "round-93\|oracle93\|probe93\|fixtures"` = **0**;
  `grep -c oracle` = **0** (`battery-diff-final.txt`).
- the READY `sha256` equals `sha256sum` of the candidate file and of the copy installed in the M-sim tree.
- The strace `RUNTIME:` arm, the two-run predicate, and the `--after`/freeze ordering are the L1's runs.

## 6. COUNTER finding (not a kill event) — oracle `captured` fallthrough

`counter-oracle-captured.txt`: when the **first** `model_change` row whose role is `subagent:<seat>` exists but
its `model` is not a string (or the key is absent), `oracle93.py` (and `oracle92.py`) falls through to the first
default-role row and reports that model; v1 (`cd7ee03d`) and the v2 candidate report `null` (the row exists, so
"if none" is false). This is a construction where a tool that copies the oracle's fallthrough would agree
(reach HELD) while deviating from the admitted v1 reading of an unchanged field; the reverse — a
definition-faithful tool scored against this oracle — reads UNMET. Unreachable on the F set as frozen
(`F93CapDefault.jsonl` matches no subagent row at all) and not observed on A (61 transcripts, `V1_VALUE_DRIFT 0`);
it would need a real H transcript with that shape plus a later default row. No kill clause (c) trigger: the
shipped tool does not contradict the field definition.

## 7. Risks and residuals the L1 should carry

1. Ship exactly the READY bytes (`98a5a3a3…`) or re-pin; the pin line and the scored bytes must agree (clause e).
2. Do not "repair" the pre-existing `A_WAVE_DRIFT`/`C2_DRIFT` terms by editing the stanza mid-round: they are
   the freeze-scaffolding and spotcheck-row counts documented in `pre-existing-drift.txt`; the round close
   re-measures the stanza as usual.
3. The rename is a breaking change for any *external* reader of `errors`; none exists in this lane (grep above).
   Human mode is additive; only `errors=` disappeared from the `SEAT …` line.
4. `--selftest` moved 37→54 cases; no gate pins the number (SKILL text matches the prefix), but any report that
   quotes `37/37` is stale.
