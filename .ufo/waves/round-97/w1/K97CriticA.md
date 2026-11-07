# K97CriticA — counter attack on C97_C1 (operability), round 97

Seat target: attack the FROZEN counter `.ufo/waves/round-97/probe/probe97-c1.mjs`, not the candidate.
Question: **can a tool that violates frozen rule R97 reach `C97_C1: HELD`?** Answer: yes, six times over.
Full table and receipts: `.ufo/waves/round-97/K97CriticA/constructions.md` (+ `diverge.txt`,
`r97-vs-census-on-exotic.txt`, `historical-class-scan.txt`, `run-*.txt`).

## Counterexample (the strongest one)

`x-fence-aware` — `ctl-positive` (R97) plus CommonMark fence suppression (` ``` ` toggles skip heading
lines). R97 and the plan forbid this ("mirror the census, not CommonMark … no fence awareness"). On

    ## Registry
    (blank)
    ```
    ## Leads (unopened)
    ```
    | S001 | … |

the census keeps `Leads (unopened)` → E12=1, rows=0; the tool keeps `Registry` → outside=0, rows=1
(`diverge.txt`). The R97 reference itself agrees with the census on this input
(`r97-vs-census-on-exotic.txt`: census_e12=1 / ctlpos_outside=1 / rows=0), so the divergence is the
construction's alone. Counter verdict: `C97_C1: HELD a=1 b=1 c=1 d=1 e=1 f=1` (`run-x-fence-aware.txt`).

Same result for five more R97 violations, each with its own minimal census-diverging input: `x-bom-strip`
(U+FEFF at line 1), `x-zwnbsp-trim` (U+FEFF in heading text), `x-u2003-trim` (U+2003), `x-zwsp-strip`
(U+200B inside the word), `x-u2028-split` (U+2028 as a line break). All six HELD.

## Evidence

Run form for every row (M = `38eb197c17de7ce0dc562539f2f31f41bea037ec`):
`node .ufo/waves/round-97/probe/probe97-c1.mjs --tool <con> --work <scratch> --freeze M --rev M`.
13 constructions built as patched copies of `ctl-positive` (the shape that HELDs), 12 scored:

| verdict | constructions |
|---|---|
| **HELD (R97 violated)** | `x-bom-strip`, `x-zwnbsp-trim`, `x-u2003-trim`, `x-zwsp-strip`, `x-u2028-split`, `x-fence-aware` |
| UNMET (caught) | `x-prefix-match`, `x-blank-gated`, `x-outside-cap`, `x-reset-1000`, `x-cr-break`, `x-space4-head` |
| M97-1 receipt | `x-replay`: own seed HELD, fresh seed UNMET (same bytes `8cadd99d…`) |

Checks re-run by this seat at M: do-nothing `scripts/sources-check.mjs` → `UNMET a=0 b=0 c=0 d=1 e=1 f=1`
with real per-case disagreements (`agree=18721/19459` etc., not SETUP) — `run-nothing.txt`; `ctl-positive` →
`HELD` — `run-positive.txt`. Every receipt's `tool_sha256` equals `sha256sum` of the sealed construction in
`K97CriticA/con/`.

Why the counter is blind: arms a/b/c draw from an **enumerated** class product (indent {space,tab} × sep
{SP,TAB,2SP,SP TAB,none,VT,FF,CR,NBSP} × text × trail × marker) — U+FEFF/U+2003/U+200B/U+2028/a BOM/a fence
are outside it; arm (d) is the real registry (no such characters); arm (e) replays 76 historical blobs, and
`historical-class-scan.txt` shows `blobs=76 hits=0` for all five classes.

## Impacted axes

- **operability (C1)**: HELD is the only instrument for C1's verdict; six wrong readers reach it, so HELD
  means "agrees on the enumerated classes", not "reads exactly as the fleet census".
- counter integrity (reused shape in r98+): the same closed-enumeration gap.

Not impacted: the frozen verdict. The predicate (frozen, K4) and every pre-data control stand — ctl-positive
still HELDs, ctl-nothing still UNMETs, and the construction-vs-census oracle is unchanged.

## Smallest safe correction (routed, not applied — K4 forbids touching plan/probe/controls)

Add the classes the census grammar leaves undefined to the battery as **new axes**, keeping the census as
oracle: (1) leading U+FEFF on line 1; (2) `sep`/`trail` + U+FEFF, U+2000–200A (≥U+2003,U+2007,U+200B),
U+2028, U+2029; (3) a `text` value with U+200B inside; (4) a `pre` axis `'' | blank | ```` ``` ````
open | ```` ``` ````…```` ``` ```` closed`. Carry them in a second arm (g) so a/b/c bytes and the 17 control
receipts stay comparable. Keep the id-array comparison literal — `x-replay` shows the nonce ids are what stop
a count-only hardcode.

Mistake mined: **M97-2 (candidate)** — "the counter's battery is derived from the grammar's *enumerated*
classes, so a tool wrong only on an unenumerated class reaches HELD"; class: sampling by enumeration assumed
total (Q85/Q86 captured sampling, not closure). Distinct from M97-1 (input identity, fixed by nonces).
