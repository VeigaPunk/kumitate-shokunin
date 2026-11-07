# kumitate round 95 — plan (frozen before any seat runs)

Lane base `12aa450f51127e4ee6c105944ef5e21285342f70` (r94 closure spot-check tip); pre-freeze adoption commit
`eadd519d6c5b7c76a12c4ed8e82c1a4834d585db` (round-94 spot-check adopted into the README map BEFORE this freeze:
`close-l1/adopt-r94-spotcheck.txt`, `open/readme-map-before-adopt.txt` DRIFT → CLEAN — the M94-1 ordering). Fleet pin
for filed reports `e2c52ba893c7d43cd1de92b30458e2d4c8e4098c` (78 kumitate reports). L1 = `KumitateR95` (holds the §3
planner seat; the validator refuses `planner`).

Load done: MISSION.md, AXES.md, round prompt §1–§7 + run-15 amendments through 48, SCORECARD
`## Round 95 pre-registration (written by round 94)`, `corpus/lessons/round-94.md`,
`corpus/lessons/round-94-verifier-spotcheck.md` (7 routed items), r89–r94 MANIFEST closures (89–91 rejected, 92–94
admitted).

## Axes (named)

Lane axes: operability (9, terminal `f_O`) and the coverage sub-axes (all 10). Lowest non-retired axis:
**operability**. ONE claim on it. Every coverage row is a harm surface (must stay 10, `PROXY: MATCH` after the
bookkeeping re-declaration, `README_MAP: CLEAN`). Open-state proxy DRIFT (`open/battery-before.txt`: A_wave
1503→1505, C2/C2_total 242→243) is the r94 closure spot-check + this round's adoption — bookkeeping, re-declared at
close as in r94.

## C1 — operability: `round-gate` trusts a registry row only in the census shape

Routed defect (r94 spot-check §5 item 3; K94Sentinel S94-5): `declaredPins()` reads the status at `line.split('|')[8]`
with no field-count check, so an unescaped `|` in an earlier cell shifts the status cell: a row whose true status is
`rejected` still declares its pin (K94Sentinel `receipts/candF.rejected_shifted.json`: CLEAN), and a short/long row
declares from whatever cell lands at index 8. The fleet census already defines the row shape: CORPUS.md census
"malformed rows — 11 columns means NF=13; must print 0".

**Rule (the claim's after-state, frozen).** A `corpus/SOURCES.md` registry row (`^ {0,3}\|\s*S\d{3,}\s*\|`)
declares pins only when `line.split('|')` yields exactly 13 fields (the census `NF==13`); a registry row with any
other field count declares nothing, and its id (field 1, trimmed) is appended, in file order, to `--json`
`citations.malformedRows` — an array always present on every `--json` output (empty when the registry was not read
or holds no malformed row). Everything else is unchanged.

Sourced: the GFM tables spec (escaped `\|` is legitimate GFM cell content, so a naive split disagrees with GFM;
the census shape is the lane's stricter registry contract) and the POSIX awk field-splitting rule that defines
`NF` for the census — rows opened this round, S-ids assigned at integration.

**Frozen counter** `probe/probe95-c1.mjs` (this commit), run as

    node .ufo/waves/round-95/probe/probe95-c1.mjs --tool <round-gate bytes> --work <scratch> --freeze <FREEZE>

with `<FREEZE>` = the commit that adds this plan, `--tool` = `git show <M>:scripts/round-gate.mjs` at the
integration commit M. **Frozen predicate `C95_C1: HELD`** iff (a) FIXTURE synthetic registry: declared exactly
{okA, indentF, plainH}, unresolved exactly {shiftB, escC, shortD, rejE, longG, proseI, codeJ, none},
`malformedRows` exactly `[S002, S003, S004, S007]` in file order and equal to the census awk `NF!=13` id list of the
same file; (b) NOSRC fixture: `malformedRows` = `[]`, declared empty, 11/11 unresolved, DRIFT, no INTERNAL_ERROR;
(c) NO-REG every filed kumitate report at the fleet pin: check vector, exit and declared set equal BASE, and
`malformedRows` = `[]`; (d) candidate `--selftest` exit 0 `VERDICT: PASS`. Counter text = same sentence; receipt
label `C95_C1: HELD|UNMET`.

**Pre-data controls** (`controls/`, built by `probe/make-controls95.py` from BASE bytes, run with
`--freeze eadd519d`, whose round-gate, SOURCES and reports-relevant files equal this freeze's):

| control | what it does | verdict |
|---|---|---|
| ctl-nothing | BASE bytes (do-nothing) | UNMET a=0 b=0 c=0/78 |
| ctl-escapeonly | refuse only rows containing `\|` | UNMET a=0 (malformed=[S003]) |
| ctl-gt13 | refuse only NF>13 | UNMET a=0 (short row declares) |
| ctl-lenient12 | accept NF 12 or 13 | UNMET a=0 |
| ctl-anyrej | disclose but still read malformed rows; skip any row with a `rejected` cell | UNMET a=0 |
| ctl-nodisclose | reference rule, empty `malformedRows` | UNMET a=0 |
| ctl-dropall | one malformed row silences the whole registry | UNMET a=0 |
| ctl-positive | L1 reference rule | **HELD** a=1 b=1 c=78/78 d=1 |

Disclosed limit: the real registry has 0 malformed rows (`open/real-malformed-before.txt`), so (c) is a
no-regression arm only; every rule-precision forgery is separated by fixture (a) alone. The counter does not
exercise the fail-closed `--json` path's `malformedRows` (selftest arm required, checked by the reviewer).

**Kill rules (frozen).** K1: counter at M prints anything but `C95_C1: HELD` → C1 UNMET (honest stop, no re-target).
K2: the shipped selftest passes on any of the six forgery-control rule shapes applied to the shipped code
(mutation-tester; a survivor is a selftest defect routed AND reported; it does not flip the frozen counter verdict).
K3: harm — any of `proxy-check` (after the `pin.round-gate` re-pin and bookkeeping re-declaration), `readme-map`,
`sources-check`, `counter-pins`, `spotcheck-adopt --check`, `round-gate --tracked`, the census validate reads worse at
M than at base → harm, C1 not admitted. K4: plan/probe/controls/open bytes change after this freeze → claim void.

## Frontier step (§2b, inside the cap)

SOURCES rows opened this round: GFM spec tables extension (escaped pipe) and POSIX awk field splitting (`NF`).
Routed debt answered as round work: r94 spot-check item 4 (quote word counts S271 = 18, S272 = 10; append-only
correction) and item 6 (`round-gate` registry row exit-code → verdict map in `SKILL.md`). Mistake mined: the r94
count-accuracy slip (quote word counts off by one) — fix = a counting command for `(…, N words): "…"` pairs, shown able
to fail on round-94.md and pass on round-95.md. M94-1 ordering: adopted before this freeze (receipt above).
considerthese: one report line. Assimilation: none (no theme fits a gate parse repair).

## Wave w1 (one v1 wave, 10 seats; attack = reviewer + critic×2 + mutation-tester = 4/10 = 40 %)

executor×2 (candidate tool + selftest arms; harm battery), scribe×2 (sources rows; lesson/mistake counter draft),
scout×1 (registry/sibling shape survey + GFM/awk grounding), connector×1 (sibling-gate overlap: who else splits
SOURCES rows), reviewer×1, critic×2 (counter constructions; framing/harm), mutation-tester×1 (K2). Routed, not this
round: M93-3 counter repair, M93-5 `--close` probe-receipt requirement, R93-D1 redaction, F93 fixtures, K94CriticB 1b
self-attestation (closure re-open is the only guard).
