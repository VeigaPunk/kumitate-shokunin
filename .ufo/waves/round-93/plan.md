# kumitate round 93 — plan (FROZEN at the freeze commit; never edited after)

L1: KumitateR93 (holds the canonical §3 planner seat). Base lane tip `36277d499388c68ef2645d92f44e722d454c9820`
(round-92 verifier spot-check, closure: **admitted**). Host: Linux run-15 host, omp transcripts under
`~/.omp/agent/sessions/-Projects-shokunin/`, node v24.21.0, python3, strace present.
Round-92 spot-check adopted before this freeze (`spotcheck-adopt --adopt` → `wrote=both`,
`SPOTCHECK_COVERAGE: CLEAN spotchecks=59 uncovered=0`; considerthese/2026-11-06.md idea 3, the M8 class).

## Claim C1 — operability, capability upgrade `seat-route` v1 → v2 (contract `kumitate-seat-route-v2`)

Axis: operability (lowest non-retired axis; integer 9, terminal under `f_O`; the move is a capability row,
the r86 `counter-receipt` v3 and r92 `seat-route` precedent). One claim this round.

Why v2. Round 92's admitted v1 reconstructs "who answered after a failure" indirectly and is blind to four
things omp persists in every seat transcript (K92Scout D1, D4, D6, D7, D8; `.ufo/waves/round-92/K92Scout/recon.md`):
- D1: `errors` counts failed **attempts** (one persisted error row per retry attempt), but reports read it as
  failed requests. v2 renames it `error_attempts` and adds `recovered_attempts`.
- D7: `retryRecovery` on an error turn (`status` `recovered` | `superseded`, `supersededBy {provider, model}`)
  states who replaced the failed attempt. Source: oh-my-pi `packages/ai/src/types.ts` 1259–1284
  (`AssistantRetryRecovery`), writer `packages/coding-agent/src/session/turn-recovery.ts` 1035–1062, both at
  `79fa222e8390aed3494f4bc6746814e6c74c21cf` (the current `main` tip on 2026-11-06; captures `open/`).
- D6: `upstreamProvider` (types.ts 1326–1333: the provider an aggregator routed to, e.g. `Stealth`).
- D8: `session_init.resolvedModel` and `retryFallback.chain` (session-entries.ts 277–300): the configured
  chain before any failure.
- D4: role `fallback` is reused for the revert-to-primary hop (turn-recovery writes it without the flag).
Host census (1 500 random transcripts, 2026-11-06): 1 486 error turns carry `retryRecovery` (all objects;
`supersededBy` an object in 1 431), 2 229 `session_init` rows (`retryFallback` in 2 228, `resolvedModel` in
2 226), 273 served turns carry `upstreamProvider`.

Surface moved: the lane's seat-transcript reader (`scripts/seat-route.mjs`) gains seven fields and one rename;
a do-nothing control (shipped v1 at `cd7ee03d…`) reads `UNMET agree=0/221`.

### Frozen field definitions (v2; executable form `probe/oracle93.py`)

Unchanged from v1 (round-92 plan): `seat`, `captured`, turns and the `?` model rule, `answered`, `aborted`,
`last_error` (24-char `[A-Za-z0-9_-]` runs → `<redacted>`, first line, trimmed, cut 120; non-string → ""),
`yielded`, `final`, `fallback`, `parse_errors`, and wave mode (`role`, `session`, locate rule, `absent`; a
results name containing `/`, `\`, NUL or `..` locates nothing → `absent`).
Changed / new:
- `error_attempts` (int; replaces v1 `errors`, which must no longer appear under that name in records):
  count of turns with `stopReason` `error`.
- `recovered_attempts` (int): error turns whose `retryRecovery` is a JSON object whose `status` is exactly the
  string `recovered`.
- `superseded_by` (list of str): over error turns in file order, when `retryRecovery` is an object and its
  `supersededBy` is an object: `supersededBy.provider + "/" + supersededBy.model` under the `?` rule (either
  missing, non-string or empty → `?`); distinct, first-seen order. Served turns' `retryRecovery` is ignored.
- `upstream` (list of str): over served turns (stop/toolUse/length) in file order, `upstreamProvider` when it is
  a non-empty string; distinct, first-seen order.
- `resolved` (str or null): of the FIRST `session_init` row, `resolvedModel` when a string, else null; null when
  no `session_init` row.
- `chain` (list of str or null): of the FIRST `session_init` row, when `retryFallback` is an object and its
  `chain` is a list: the list's string items in order (non-strings dropped; an empty list stays `[]`); else null.
- `flag_hops` (int): `model_change` rows whose `resolvedModelIsFallback` is JSON `true` (not `1`).
- `revert_hops` (int): `model_change` rows whose `resolvedModelIsFallback` is not JSON `true` and whose `role` is
  the string `fallback`.
Records are JSON; integers are integers, booleans are booleans, lists are lists (type-strict).
Human mode keeps one `SEAT …` line per seat and adds the new fields; `--strict`, `--selftest`, exit map
0/1/2/64 unchanged. The shipped tool must not read, import or execute anything under `.ufo/waves/round-93/`
other than a `--results`/`--file` argument it is given.

### Frozen predicate

Run from the lane root at M (the integration commit), twice:
```
python3 .ufo/waves/round-93/probe/probe93-c1.py --tool scripts/seat-route.mjs \
  --sample-a .ufo/waves/round-92/probe/sampleA.tsv --fixtures .ufo/waves/round-93/probe/fixtures \
  --after 2026-11-06T21:40:00.000Z \
  --waves .ufo/waves/round-92/w1-results.json,.ufo/waves/round-93/w1-results.json --out <receipt>
```
C1 HELD iff both receipts print `C93_C1: HELD …` (every scored record agrees type-strictly; A ≥ 55; F = 16/16;
H ≥ 60 held-out transcripts whose first `session` timestamp is ≥ `2026-11-06T21:40:00.000Z`; the round-93 wave
has ≥ 8 located seats; `thin_fields=0`) AND `RUNTIME: CLEAN findings=0`.
`--after` is later than this freeze commit's committer time (checkable: `git show -s --format=%cI <freeze>`),
so no H member exists while the contract, oracle and counter are written.

### Kill rule (frozen)

C1 is UNMET if any of:
(a) the shipped `scripts/seat-route.mjs` at M is not HELD with `RUNTIME: CLEAN` on two runs;
(b) any non-positive pre-data control (`controls/table.txt`) reads HELD;
(c) a committed reproduction shows the shipped tool's record contradicting a field definition above on a real
    or synthetic transcript (also when the oracle shares the error);
(d) the shipped tool reads, imports or executes a file under `.ufo/waves/round-93/` other than its argv input
    (byte grep of the tool for `round-93`, `oracle93`, `probe93`, `fixtures` > 0, or a `RUNTIME: VIOLATION`);
(e) the bytes scored differ from the bytes shipped at M (`tool_sha256` in both receipts = `sha256sum` at M);
(f) the freeze commit's committer time is not earlier than the `--after` literal.
Not in the kill rule, by design (same as r92): "a construction reaches HELD" — the held-out H set and the
round-93 wave are scored after the candidate is final; a construction that agrees there implements the
definitions. Findings about omp semantics outside these definitions are routed, not kill events.

### Q86 field table (pre-data, positive control receipt `controls/ctl-positive.txt`)

Distinct canonical values per compared field, all sets / real sets only (A + pre-freeze H draw + r91/r92 waves):
captured 21/19 · answered 33/30 · error_attempts 8/8 · recovered_attempts 7/7 · superseded_by 24/22 ·
upstream 3/2 · resolved 23/21 · chain 32/30 · flag_hops 4/4 · revert_hops 3/2 · aborted 2/2 · fallback 2/2 ·
final 5/4 · last_error 29/23 · yielded 2/2 · parse_errors 2/1. `parse_errors` has no real discriminating member
(distinct_real=1): F93ParseErr is its synthetic member, as Q86 requires. Ablations caught only by F (no real
member discriminates them): `flagtruthy` (F93Flags), `parseerr0` (F93ParseErr), `redact23` (F93Redact),
`upstreamall` (F93Upstream) — each 220/221, so F is load-bearing and stated, not hidden.

### Pre-data controls (run before any candidate exists; `controls/run-controls93.sh`, receipts `controls/ctl-*.txt`)

Run with `--after 2026-11-06T18:47:06.000Z` (the r92 freeze instant; the r93 literal lies in the future) and
`--waves` r91 w1, r92 w1; `--runtime off` (controls import the oracle by construction).

| control | what it skips | reading |
|---|---|---|
| ctl-absent (do-nothing) | no tool | `UNMET agree=0/221` |
| ctl-v1-shipped (do-nothing: existing capability) | `scripts/seat-route.mjs` v1 `cd7ee03d…` | `UNMET agree=0/221` |
| ctl-v1names | v1 record shape | `UNMET agree=0/221` |
| ctl-errname | D1 rename only | `UNMET agree=0/221` |
| ctl-typeloose | booleans as 0/1 | `UNMET agree=0/221` |
| ctl-resolvedcaptured | resolved = captured string | `UNMET agree=13/221` |
| ctl-chainprimary | primary prepended to chain | `UNMET agree=22/221` |
| ctl-revertrole | D4 ignored | `UNMET agree=173/221` |
| ctl-supersedefromhops | superseded_by from flagged model_change rows | `UNMET agree=188/221` |
| ctl-recoveredloose | any retryRecovery = recovered | `UNMET agree=218/221` |
| ctl-flagtruthy | `1` counts as true | `UNMET agree=220/221` |
| ctl-parseerr0 | r92 x2 construction | `UNMET agree=220/221` |
| ctl-redact23 | r92 x2b construction | `UNMET agree=220/221` |
| ctl-upstreamall | upstream from every turn | `UNMET agree=220/221` |
| ctl-positive (positive) | nothing | `HELD agree=221/221` |

## Frontier step (§2b)

Sources opened this round (L1, 2026-11-06, upstream `main` = `79fa222e…`): `turn-recovery.ts` (new row; writer
of `retryRecovery`), types.ts `AssistantRetryRecovery`/`upstreamProvider` and session-entries.ts
`SessionInitEntry` (re-opened; same bytes as S268/S267 captures), host transcript field census (own-work).
C1 cites the new rows (sourced claim). Census at start: exit 0 (`open/census-start.txt`).
Mistake mined into `corpus/lessons/round-93.md` `## Mistakes`. Assimilation: considerthese/2026-11-06.md idea 3
(adoption-before-freeze). shokuknow package: `Assimilation: none` unless a seat finds a fitting theme.

## Debt answered as round work (not claims)

r92 spot-check §5: (2) report corrections land as an appended erratum, never a rewrite (lesson criterion);
(3) every seat writes its `w1/<Seat>.md` trailer; (5) `PROVINCE.md` dated amendment: seat transcripts are read
by content (`seat-route`), the readdir+lstat bound stays for `~/.omp/agent` depth-1 members; (1) Q86 counter
blind spots are armed by this counter (type-strict, F set, held-out H, runtime clause).
