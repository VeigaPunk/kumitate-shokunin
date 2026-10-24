# RevA5Pin — round 51, wave 2

## Axes and attack surface

- **Operability / `ATTEST_HELD` (A51, v3r6):** the A5 arm only — `pin.receipt-attest` equality
  against the extracted instrument bytes, and `node scripts/proxy-check.mjs --strict` with
  `UFO_SRC=/home/vgpnk/Projects/ufo-fsd-alpha` reading `PROXY: MATCH` exit 0.
- **Coverage / `DOCTRINE_HELD` (D51):** not attacked here (other seats).
- **Harm rules H1–H5:** not exercised; nothing below is a harm-rule result, and no counter, plan
  or lane file was edited.

Attacked the frozen A5 arm at
`/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/probe/attest51-probe.mjs:337-351`
(sha256 `73ee53ec994c5abaf23a5d95022a395be89e87675df07cea58efd3cf1cf0ff2c`, identical in the working
tree and at rev `7d88faa`), the integrated pin at
`/home/vgpnk/Projects/shokunin/kumitate-shokunin/SCORECARD.md:322` and the validator logic at
`/home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/proxy-check.mjs:461-471,1090-1132,1136-1148,1212-1220`.

Lane tip at measurement was `3304a56db425ea9c7cd496b426876aaedbce3949` (two w2-dispatch commits past
the assigned rev). A5's inputs are byte-identical at tip (E7), so the assigned rev was scored as
instructed. All mutation ran under `/tmp/mkt-*`; the lane was not written.

## Evidence

### E1 — extraction and hand-verified pin equality (assigned rev)

```
$ git rev-parse HEAD
3304a56db425ea9c7cd496b426876aaedbce3949
$ D=$(mktemp -d /tmp/mkt-r51-a5.XXXXXX); git archive 7d88faa | tar -x -C "$D"
$ sha256sum "$D/scripts/receipt-attest.mjs"
44919763ee523f334adaa4242d370435180d07aa0cdd4b85b0a7be870f48e8d9
$ git cat-file blob 7d88faa:scripts/receipt-attest.mjs | sha256sum
44919763ee523f334adaa4242d370435180d07aa0cdd4b85b0a7be870f48e8d9
```

The value equals the wave-1 integration hash named in the assignment. Placement at rev:
`pin.receipt-attest=` occurs **once** in `SCORECARD.md` (line 322), inside the single
`<!-- kumitate-gate-pins-v1` block (lines 312–323, one head), alongside 10 gate keys; pin and
`git show 7d88faa:SCORECARD.md` bytes agree.

### E2 — extracted validator says MATCH

```
$ cd "$D" && UFO_SRC=/home/vgpnk/Projects/ufo-fsd-alpha node scripts/proxy-check.mjs --strict
PROXY: MATCH (A=67 C=23 operability=9; C1=19/19 C2=117/117 coverage=10; S=88/88
coverage:script-layer=10; R=92/92 coverage:runtime-layer=10; K=53/53 coverage:kimi-layer=10; pins=6 match; src-rev=31c465f15669)
EXIT=0
```

The six **v1** pins were also remeasured independently against the extracted files and all MATCH,
including `pin.proxy-check=495e5164…` = sha256 of the extracted `scripts/proxy-check.mjs` — i.e. the
gate-pin addition's forced `proxy-check` re-pin is present at the rev.

### E3 — stale-pin control (one hex digit), honest validator

Scratch copy of the E1 extraction (same bytes as rev), first hex digit of `pin.receipt-attest`
flipped `4→0` (`0491…`), everything else untouched:

```
PROXY  error  GATE_PIN_DRIFT  pin.receipt-attest: declared=04919763… computed=44919763…
PROXY: DRIFT (GATE_PIN_DRIFT term=pin.receipt-attest declared=04919763… computed=44919763…; src-rev=31c465f15669)
EXIT=1
```

The frozen counter on a scratch git repo carrying that doctored `SCORECARD.md` (second run, the
other flake `4→a`) reads:

```
ATTEST51: ATTEST_UNMET held=6/9 checks=9 rev=852ed0c7… rule=A51 version=v3 | … | A5 MISS pin a4919763!=44919763;proxy exit=1 PROXY: DRIFT (GATE_PIN_DRIFT term=pin.receip
EXIT=1
```

### E4 — pin-removal control, honest validator

Deleting only the `pin.receipt-attest` line:

```
PROXY  warn  PIN_UNPINNED  scripts/receipt-attest.mjs has no pin.<name> key in the kumitate-proxy-v1 or kumitate-gate-pins-v1 stanza
PROXY: DRIFT (PIN_UNPINNED term=scripts/receipt-attest.mjs; src-rev=31c465f15669)
EXIT=1
```

Counter on that rev: `A5 MISS pin.receipt-attest absent;proxy exit=1 PROXY: DRIFT (PIN_UNPINNED term=scripts/r…`, exit 1.

**So against pin tampering the A5 arm is not vacuous.** It fails loudly for a flipped digit and for
a removed pin, with exit 1, in both the probe and the validator.

### E5 — frozen counter at the assigned rev (shape check)

```
ATTEST51: ATTEST_UNMET held=7/9 checks=9 rev=7d88faa rule=A51 version=v3 | A1 PASS |
A2 MISS attest-run-3.txt:absent | A2c PASS | A3 PASS | A3c PASS |
A4 MISS attest-run-3.txt:absent;prior-files=162 | A4c PASS | A3d PASS | A5 PASS
EXIT=1
```

`A3d`, `A4c` and the other challenge arms hold; the only MISSes are receipt-3 absence, matching the
declared pre-close schedule. `git ls-tree -r 7d88faa .ufo/waves/round-51/receipts` shows run-1
(+sidecar), run-2 (+sidecar), the `-replayed` control and `run-1.out` — no `attest-run-3.txt`.
The same tree exists at tip `3304a56`, and the tip's script blob is still `44919763…` with the same
pin line, so A5 holds at tip as long as the close commit does not change the instrument without
re-pinning.

### E6 — composition control: unscoped regex vs honest validator

`DistWave1` item 11 says the A5 regex is unscoped. Under the honest validator that is compensated:
scratch rev with the **correct** pin copy placed in prose *above* the block and the in-block pin set
to all zeros:

```
counter: A5 MISS pin match;proxy exit=1 PROXY: DRIFT (GATE_PIN_DRIFT term=pin.receipt-attest decl…
proxy:   PROXY error GATE_PIN_DRIFT pin.receipt-attest: declared=000… computed=449…  EXIT=1
```

The probe's first regex match is the prose copy (`pin match`), but the validator's block-scoped
parser catches the stale block pin, so A5 still MISSes.

### E7 — the gap: the validator itself is taken from the scored rev

Replacing only `scripts/proxy-check.mjs` in a scratch rev with a three-line stub that prints a
MATCH-shaped line and exits 0 (`DistWave1` item 12):

| Variant | Pin state | Counter output |
|---|---|---|
| S1 stub proxy, correct in-block pin | real | **`A5 PASS`** (`ATTEST_UNMET held=7/9`) |
| S2 stub proxy, zeros in-block pin | stale | `A5 MISS pin 00000000!=44919763;proxy MATCH` |
| S3 stub proxy, **block pin line removed**, correct copy in prose above block | absent from block | **`A5 PASS`** (`ATTEST_UNMET held=7/9`) |

S1 shows A5 does not establish that a canonical validator ran. S3 shows the item-11 unscope becomes
load-bearing once the validator is the rev's own: A5 can pass with no `pin.receipt-attest` in the
`kumitate-gate-pins-v1` block at all, while the plan's prose requires exactly that. Under the honest
validator the same S3 shape reads `PIN_UNPINNED` exit 1 (E4), so the plan prose is enforced only by
the rev-supplied validator, not by the frozen counter.

## Findings by severity

### F1 (MEDIUM) — A5's proxy conjunct runs the scored rev's validator; a print-stub satisfies it

`attest51-probe.mjs:345` runs `node <T>/scripts/proxy-check.mjs --strict`; the file is part of the
scored rev. S1: with a stub validator and the honest `SCORECARD.md`, A5 reads `PASS`. The v1 pin
family does not close this: `pin.proxy-check` is validated by the very file it pins, so a stubbed
`proxy-check.mjs` also silences the `pins=` check. This is `DistWave1` item 12 ("observed"), still
open at v3r6 (probe sha `73ee53ec…`). The honest lane state is unaffected (E2–E4 show the real
validator computes terms, enforces the block, and DRIFTs), but the frozen predicate has no
independent validator identity. A repair would freeze the expected `scripts/proxy-check.mjs` digest
**inside the probe** (pre-data freeze = non-circular) or extract the validator from the freeze
commit; comparing against `pin.proxy-check` from the same rev would be weaker but still block blind
stubs. Status: open; not repaired here (counter is frozen and out of my write scope).

### F2 (LOW, MEDIUM in composition with F1) — the pin match is not scoped to the gate-pins block

`attest51-probe.mjs:341` is `/pin\.receipt-attest=([0-9a-f]{64})/` over the whole file. Under the
honest validator this is caught (E6); under F1's stub it is not (S3 passes with the block pin
absent). The plan's sentence ("`pin.receipt-attest` in the SCORECARD `kumitate-gate-pins-v1` block")
is therefore stronger than the arm's implementation. At the assigned rev the stronger prose does
hold (one occurrence, inside the single block), so this is a falsifiability gap, not a lane-state
defect.

### F3 (INFO) — `pins=6 match` does not count the gate pins

`renderVerdict` reports `pins=<pinStats.matched>` from `comparePins` over the six v1 `PINS`
(`proxy-check.mjs:1090-1113,1212-1220`); gate pins are validated by `compareGatePins`
(`:1116-1132`) only as error findings and never counted. This matches the declared contract ("does
not widen v1's … six-pin count") and drift is still an error (E3), so it is not a defect. Recorded
because the MATCH line alone cannot show that `pin.receipt-attest` was exercised at all; the drift
control is what proves it.

### F4 (INFO, negative result) — non-vacuity answer

A5 is **not vacuous against pin tampering** (E3, E4, E6: flip, removal and prose-placement all MISS
with exit 1). It **is** satisfiable by a stubbed validator (S1), and only in that state does the
unscoped regex allow a pin absent from the block to pass (S3). No finding against the integrated
lane bytes at `7d88faa`/`3304a56`.

## Residual risk

- **Environmental:** the proxy half depends on the live origin `/home/vgpnk/Projects/ufo-fsd-alpha`
  remaining at `src-rev=31c465f15669`. I observed that only through the validator's own output
  (bounds: never touch the fleet repo; no independent `git -C` read).
- **Close-time:** A2/A4 stay MISSing until `attest-run-3.txt` (+ sidecar, ≥300 s span) is committed;
  at rev and tip it is absent. If the close commit changes `scripts/receipt-attest.mjs`,
  `pin.receipt-attest` must be re-pinned in the same commit — the failure mode is loud (E3).
- **Self-pin:** `pin.proxy-check` is validated by its own subject; only an external validator pin
  breaks the loop (same root as F1).

## Verification gaps

- H1–H5 batteries and D51 were not run (out of this seat's A5 scope; other seats).
- No independent read of origin HEAD; no fleet-repo or parent-gate check.
- Proxy parsing was exercised only for the prose-copy and removal placements, not for exotic
  malformations inside the block (e.g. duplicate keys, CRLF) — outside A5's declared surface.
- Items 1–10 and 14–21 of `wave2-items.md` were not exercised; A5 items 11–13 are covered above
  (11: E6/S3; 12: S1; 13: E1/E2 — the GATE_PINS addition and `pin.proxy-check` re-pin are in place).
- No tools installed or updated; no package transactions.

Report: .ufo/waves/round-51/w2/RevA5Pin.md
