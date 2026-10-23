# MutPinDrift — mutation attack on the gate-pin surface (round 50)

- Item: `MutPinDrift` (mutation-tester), wave `kumitate-r50`.
- Detector under attack: `node scripts/proxy-check.mjs --self <tree> --strict` (the command SKILL.md item 693 runs; H3 runs it live). Secondary: `proxy-check --selftest` (item 694) and the frozen C1 counter's G6 (`.ufo/waves/round-50/probe/bindguard50-probe.mjs:111-117`).
- Tested bytes: lane `HEAD` at extraction `378b6e7` (`git archive HEAD`); re-verified at the new `HEAD 6927903` that `SCORECARD.md` (`10bbefd5…`), `scripts/proxy-check.mjs` (`0d5c00c2…`) and `scripts/bind-oracle.mjs` (`c3929a97…`) are byte-identical, so the results apply to both. Scratch trees only; lane checkout never written.
- Scratch tree: `mktemp -d` → `/tmp/mutpindrift-h1kjkood/pristine`; one fresh copy per mutant.
- Baseline on the pristine scratch tree:

```
$ node /tmp/mutpindrift-h1kjkood/pristine/scripts/proxy-check.mjs \
    --self /tmp/mutpindrift-h1kjkood/pristine --strict
PROXY: MATCH (A=43 C=22 operability=9; C1=19/19 C2=112/112 coverage=10; S=88/88 coverage:script-layer=10; R=92/92 coverage:runtime-layer=10; K=53/53 coverage:kimi-layer=10; pins=6 match; src-rev=31c465f15669)
exit 0
```

The baseline is clean, so any DRIFT/FAIL-CLOSED below is attributable to the mutation.

## Verdict table

| # | Mutation (scratch tree) | `--strict` | `--selftest` | frozen G6 | Verdict |
|---|---|---|---|---|---|
| a | `bind-oracle.mjs` +1 byte, `pin.bind-oracle` unchanged | exit 1 `PROXY: DRIFT (GATE_PIN_DRIFT …)` | n/a | catches | **KILLED** |
| b | `pin.bind-oracle=…` line deleted from the gate-pins block | exit 1 `DRIFT (PIN_UNPINNED …)` | n/a | catches (pin absent) | **KILLED under --strict**; survives default mode (exit 0 `MATCH`, warn only) |
| c1 | `'pin.bind-oracle'` entry deleted from `GATE_PINS`, stanza line kept, proxy-check **not** re-pinned | exit 2 `FAIL-CLOSED (GATE_PIN_KEY_UNKNOWN)` | n/a | n/a | **KILLED (fail-closed)** |
| c2 | same as c1 **plus** `pin.proxy-check` re-pinned to the mutated proxy bytes | exit 2 `FAIL-CLOSED (GATE_PIN_KEY_UNKNOWN)` | n/a | n/a | **KILLED** — the parse check is lexical, re-pinning does not help |
| c3 | entry removed **and** stanza line removed, proxy re-pinned | exit 1 `DRIFT (PIN_UNPINNED)` | n/a | catches (pin absent) | **KILLED under --strict**; survives default mode (exit 0 `MATCH`) |
| D2 | `compareGatePins(...)` call deleted, proxy re-pinned | **exit 0 `MATCH`** | exit 1 `VERDICT: FAIL` case 64 | n/a | survives `--strict`; killed by item 694 |
| D3 | `comparePinCoverage(...)` call deleted, proxy re-pinned | **exit 0 `MATCH`** | exit 1 `VERDICT: FAIL` cases 73/74 | n/a | survives `--strict`; killed by item 694 |
| D4 | map retarget `pin.bind-oracle → scripts/cap-spawn.mjs` + shadow key `pin.bind-oracle-shadow → scripts/bind-oracle.mjs` + stanza values + `pin.proxy-check` re-pin | **exit 0 `MATCH`** | **exit 0 `VERDICT: PASS`** | **catches** (`pin.bind-oracle=1fde43fb!=c3929a97`) | survives both lane gates; only G6 (hardcoded 5-key list) sees it |
| D5 | same shape, retarget `pin.sources-check → scripts/omp-census.mjs` | exit 0 `MATCH` | exit 1 `VERDICT: FAIL` case 63 | n/a | survives `--strict`; killed by the selftest fixture (it declares this key) |
| D6 | same shape, retarget `pin.omp-census → scripts/cap-spawn.mjs` | **exit 0 `MATCH`** | **exit 0 `VERDICT: PASS`** | **pins=5/5 (blind)** | **SURVIVES UNCAUGHT by every machine gate** |
| E | whole `kumitate-gate-pins-v1` block deleted | exit 1, 9× `PIN_UNPINNED` | n/a | n/a | KILLED under --strict; survives default mode (exit 0 `MATCH`) |
| F1 | new instrument at `scripts/lib/new-instrument.mjs`, `A` re-declared 44 | **exit 0 `MATCH`, no `PIN_UNPINNED`** | n/a | n/a | **SURVIVES** — subdir files are outside the coverage universe |
| F2 | new instrument at `scripts/new-instrument.mjs` (control) | exit 1 `PIN_UNPINNED` | n/a | n/a | KILLED |
| F3 | new instrument `scripts/new-instrument.sh`, `A` re-declared 44 | **exit 0 `MATCH`, no `PIN_UNPINNED`** | n/a | n/a | **SURVIVES** — only `*.mjs` is coverage-enumerated |

## Evidence

### (a) `pin.bind-oracle` present, `bind-oracle.mjs` +1 byte

```
bind-oracle.mjs before c3929a97c5b24303b1acadb62ebaa4778768585597cf7fc06d2996602ec211e5
bind-oracle.mjs after  1a929ab32becdb1032942221abcff41513d27d49286ee6dd19a55d47e1628572
$ node …/mutA/scripts/proxy-check.mjs --self …/mutA --strict
PROXY  error  GATE_PIN_DRIFT  pin.bind-oracle: declared=c3929a97…211e5 computed=1a929ab3…28572
PROXY: DRIFT (GATE_PIN_DRIFT term=pin.bind-oracle declared=c3929a97… computed=1a929ab3…; src-rev=31c465f15669)
exit 1
```

Default (non-strict) mode also exits 1 (`GATE_PIN_DRIFT` is severity `error`). **No, `--strict` does not still MATCH — the +1-byte drift is killed.** Restored byte-exactly (`sha256 = c3929a97…`, equals pristine).

### (b) `pin.bind-oracle` absent

```
$ node …/mutB/scripts/proxy-check.mjs --self …/mutB --strict
PROXY  warn  PIN_UNPINNED  scripts/bind-oracle.mjs has no pin.<name> key in the kumitate-proxy-v1 or kumitate-gate-pins-v1 stanza
PROXY: DRIFT (PIN_UNPINNED term=scripts/bind-oracle.mjs; src-rev=31c465f15669)
exit 1
$ node …/mutB/scripts/proxy-check.mjs --self …/mutB
PROXY: MATCH (A=43 … pins=6 match; src-rev=31c465f15669)
exit 0        # same warn on stderr/stdout, verdict still MATCH
```

Killed only because the gate runs `--strict` (SKILL.md:693, plan H3). In default mode a missing pin is a clean `MATCH`.

### (c) `GATE_PINS` entry removed while the stanza keeps the line

```
$ node …/mutC1/scripts/proxy-check.mjs --self …/mutC1 --strict     # proxy not re-pinned
PROXY: FAIL-CLOSED (GATE_PIN_KEY_UNKNOWN) line 319: pin.bind-oracle is not a kumitate-gate-pins-v1 key
exit 2
$ node …/mutC2/scripts/proxy-check.mjs --self …/mutC2 --strict     # pin.proxy-check re-pinned to 06deca10d2f1…
PROXY: FAIL-CLOSED (GATE_PIN_KEY_UNKNOWN) line 319: pin.bind-oracle is not a kumitate-gate-pins-v1 key
exit 2
```

`parseGatePins` validates the declared key against the live `GATE_PINS` object (`scripts/proxy-check.mjs:1054-1057`) and `runCheck` turns a non-ok parse into `failClosed` (`:1285-1286`) **before** any hash comparison. So the literal mutation is caught, and re-pinning does not launder it — the check is lexical, not hash-based. With the stanza line removed too (`c3`), the only signal is the advisory `PIN_UNPINNED`, i.e. the same soft lock as (b).

## Which mutation survives uncaught — the pin mechanism's real hole

**The literal three do not survive `--strict`; (c) is the strongest arm of the three (fail-closed exit 2).** The uncaught mutation is a different one: **the `GATE_PINS` key→file mapping is itself un-pinned state.** `pin.proxy-check` is declared in the same `SCORECARD.md` the run parses, so an editor can (1) change a map value, (2) set the stanza value to the new target's sha256, and (3) re-pin `pin.proxy-check` to the edited proxy bytes. Every hash then agrees with what the mechanism is told to check, and the pin key certifies a file it does not name.

```
D6: map  'pin.omp-census': 'scripts/omp-census.mjs'  →  'scripts/cap-spawn.mjs'
    plus shadow key 'pin.omp-census-shadow': 'scripts/omp-census.mjs'   (keeps PIN_UNPINNED quiet)
    stanza pin.omp-census=<sha cap-spawn>, pin.omp-census-shadow=<sha omp-census>
    pin.proxy-check=<sha of the edited proxy-check.mjs>
$ node …/mutD6/scripts/proxy-check.mjs --self …/mutD6 --strict
PROXY: MATCH (A=43 C=22 operability=9; … pins=6 match; src-rev=31c465f15669)
exit 0
$ node …/mutD6/scripts/proxy-check.mjs --selftest
VERDICT: PASS            exit 0
G6 replay (same regex/logic as bindguard50-probe.mjs:111-117): pins=5/5   # G6 is blind to this key
```

Why each detector misses it:

- `compareGatePins` only hashes the file the map names; it never asks whether the *name* should map there (`proxy-check.mjs:1113-1127`).
- The selftest's gate-pin fixture declares exactly four keys — `['anchor-truth','sources-check','wave-census','gate-mutants']` (`proxy-check.mjs:2440-2444`, case 63). Retargeting one of those fails case 63 (D5); retargeting `pin.omp-census` passes (D6). `pin.bind-oracle`, `pin.cap-run`, `pin.cap-spawn`, `pin.counter-rerun` are equally outside the fixture.
- The frozen G6 hardcodes five keys — `pin.bind-oracle`, `pin.cap-run`, `pin.cap-spawn`, `pin.proxy-check`, `pin.counter-rerun` (`bindguard50-probe.mjs:111`) — and compares each against a path *it* supplies, so it is a detector for those five only; it never reads the map.

Consequence for C1: G6 does close D4 for `pin.bind-oracle` **at round scope** (replayed above: `pin.bind-oracle=1fde43fb!=c3929a97`), so the round's scored pin is protected. The mechanism as a lane instrument is not: a retarget of any pin outside G6's five and outside the fixture's four (`pin.omp-census` today) is invisible to `--strict`, `--selftest` and the counter. This is the concrete form of plan §Limits (b) ("the pin's meaning is only as good as `GATE_PINS`"); the measurement above shows the only remaining control is human diff review, not any gate.

### Second hole — the coverage universe is narrower than the measured universe

`comparePinCoverage` enumerates `scripts/` with `readdirSync(dir, {withFileTypes:true})` and skips anything that is not a top-level `.mjs` (`proxy-check.mjs:1132-1148`). The layer terms and `A` count `scripts/<dir>/…` (any extension) and `.sh`/`.py` (`LAYER_PATTERNS`, `RE_RUNNABLE`). With `A` re-declared honestly:

- `scripts/lib/new-instrument.mjs` → `PROXY: MATCH` exit 0, **no `PIN_UNPINNED`** (F1);
- `scripts/new-instrument.sh` → `PROXY: MATCH` exit 0, **no `PIN_UNPINNED`** (F3);
- control `scripts/new-instrument.mjs` → `PIN_UNPINNED` (F2).

This is latent today: all 15 live instruments are top-level `.mjs` (`find scripts -mindepth 1 -maxdepth 2` lists no subdirectory). It becomes live the first time an instrument is added under a scripts subdir or as `.sh`/`.py` — which the layer universe already anticipates (`scripts/<dir>/` is an explicit `LAYER_PATTERNS.S` arm).

### Third hole — single-lock consumers

Deleting the `compareGatePins` or `comparePinCoverage` call and re-pinning `pin.proxy-check` gives `PROXY: MATCH` exit 0 under `--strict` (D2/D3); only `--selftest` fails (cases 64 / 73-74). Any consumer that runs 693 but not 694 (H3's `proxy-check --strict` alone, or the C1 probe's G7) trusts a checker that no longer checks. Both checklist items are present, so the lane's own gate is two-locked; the point is that `--strict` alone is not self-verifying.

## Ranking by exploitability

1. **D6 — map retarget + shadow key + self re-pin** (survives 693, 694; G6 blind outside its five). No behavioural change to any instrument, so nothing downstream notices. Requires write access to two tracked files, both visible in `git diff`; no *machine* catch.
2. **F1/F3 — instrument outside the coverage universe** (survives 693 with no re-pin, only an honest `A` bump). Latent today; zero-cost once `scripts/lib/` or a `.sh` tool exists.
3. **(b)/(c3)/E — pin line or whole block removed** (survives *default* mode; killed by `--strict`). Acceptable under the documented warn/strict design as long as every gate uses `--strict` — H3 and item 693 do.
4. **D2/D3 — comparator call removed** (survives 693, killed by 694). Acceptable only while the two-item lock holds.

## Restoration

Each mutant ran in its own copy under `/tmp/mutpindrift-h1kjkood/`. All 15 copies were restored from the pristine tree and verified by full recursive sha256 equality against it:

```
mutA mutA2 mutB mutC1 mutC2 mutC3 mutD2 mutD3 mutD4 mutD5 mutD6 mutE mutF1 mutF2 mutF3
restored_equal_pristine = True   (all)
bind-oracle.mjs restored sha256 = c3929a97c5b24303b1acadb62ebaa4778768585597cf7fc06d2996602ec211e5
```

No file in the lane checkout was modified (`git -C <lane> diff --stat HEAD` → empty; only other seats' untracked report files appear in `git status`). No host files were written by these probes (no cap-run/bwrap invocation was part of this item). No tools installed.

## Limits of this attack

- I did not run the frozen probe end-to-end (mutants were scored with the probe's G6 predicate replayed verbatim over the scratch tree, which requires no git mutation). `git add`/`commit` are forbidden anywhere, so no synthetic rev was built.
- The mutants edit tracked files only; a forger with `git` history write access is out of scope (report-supply-chain class, same as r49's output-text-oracle limit).
- The scratch baseline is `378b6e7`; pin-relevant bytes re-verified identical at `6927903`. If a later commit changes `pin.cap-run`/`pin.proxy-check` (the guard patch will), the same mutants should be re-run against the re-pinned stanza — the results above are about the mechanism, not those values.
