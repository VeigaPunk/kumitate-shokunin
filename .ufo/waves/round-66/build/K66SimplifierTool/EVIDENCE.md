# K66SimplifierTool — YAGNI review evidence (routed-ledger v1, freeze 621212ba)

Lane: /home/vgpnk/Projects/shokunin/kumitate-shokunin. Tool under review: `scripts/routed-ledger.mjs`
(382 lines, sha256 `f92a364d293a283804e7d693f04cddfd94040d7f29a6c5c428b900b0d6ff3bf5`, last committed at the
freeze commit `621212bac37f8249c72ac982d1d6534cb8d60701`; `git diff 621212ba -- scripts/routed-ledger.mjs` empty).

## 1. Baseline selftest (v1, unmodified copy)

```
$ TMPDIR=<scratch> node v1.mjs --selftest        # selftest-v1-freeze.txt
CASE ok clean ledger reads CLEAN exit 0
...
CASE ok unreadable --rev → FAIL-CLOSED exit 2
ROUTED_LEDGER_SELFTEST: PASS (33/33)
exit=0
```

## 2. Proposed simplification v2 — 382 → 379 lines (−3), 5 edits, no docblock line touched

`simplify.patch` (also `routed-ledger.v2.mjs`, full file):

1. `routedItems`: `starts.push({ i, kind: 'list' })` / `{ i, kind: 'table' }` → `starts.push(i)`; the
   discriminator duplicated information already in the line — `L[at].startsWith('|')` is exactly the table-push
   condition (`/^\|/`), and a list marker can never be followed by a leading `|`. Removes one object allocation
   per item start.
2. `routedItems`: item body accumulated into `const body = [L[at]]` + `push` then joined → `L.slice(at, stop).join('\n')`
   with the prose-break folded into `stop`. Removes an array copy per item; identical bytes.
3. `routedItems`: `if (/^\S/.test(L[j]) && !/^\s/.test(L[j]) && ...)` → dropped `!/^\s/` (`^\S` and `^\s` are
   mutually exclusive on a single line) — the condition was a tautological conjunction.
4. Separator regex was written twice (`routedItems.sep`, `ledgerRows` inline) → one module const `SEP_RE`; the
   two call sites keep their own existing `-` requirement, so both behaviours are byte-identical. Also collapses
   `ledgerRows`' two `continue` guards into one line.
5. `words(row.quote)` computed twice in the same finding → hoisted to `qw`.

## 3. v2 selftest (same 33 cases)

```
$ TMPDIR=<scratch> node v2.mjs --selftest        # selftest-v2.txt
ROUTED_LEDGER_SELFTEST: PASS (33/33)
exit=0
```

## 4. Differential v1 vs v2 — `differential-harness.mjs` (self-contained: imports `routed-ledger.v1-freeze.mjs` and `routed-ledger.v2.mjs` from this directory)

Compares `routedItems`, `ledgerRows` and `norm` output (`JSON.stringify` identity) over: every `.md` file in the
lane worktree (including `.ufo/waves/**`), the eleven routed spot-checks at `621212ba`, and 5 000 seeded random
markdown documents built from headings/list markers/nested bullets/table rows/separators/prose/entities.

```
$ cd <this build dir> && TMPDIR=<scratch> node differential-harness.mjs
DIFF cases=11541 mismatches=0
exit=0
```

## 5. CLI parity — `cli-parity.sh` (real 57 items from the eleven frozen spot-checks + synthetic ledger, 57 rows)

stdout+stderr+exit identical for 10 argv shapes (`cli-parity.txt`):

```
SAME exit=0 args=--root <fx> --from 55 --to 65 :: ROUTED_LEDGER: CLEAN spotchecks=11 sections=11 items=57 rows=57 open=29 closed=28 wontfix=0
SAME exit=0 args=--root <fx> --from 55 --to 65 --classes :: ROUTED_LEDGER: CLEAN spotchecks=11 sections=11 items=57 rows=57 open=29 closed=28 wontfix=0
SAME exit=0 args=--root <fx> --from 55 :: ROUTED_LEDGER: CLEAN spotchecks=11 ...
SAME exit=1 args=--root <fx> --to 60 :: ROUTED_LEDGER: DRIFT spotchecks=6 sections=6 items=28 rows=57 ... findings=29 first=ITEM_ABSENT:...
SAME exit=2 args=--root <fx> --from 55 --to 65 --rev HEAD :: FAIL-CLOSED reason=rev-unreadable:HEAD
SAME exit=64 args=--root <fx> --bogus :: USAGE unknown argument --bogus
SAME exit=64 args=--root <fx> --from x :: USAGE --from/--to must be integers
SAME exit=64 args=--from :: USAGE --from needs a value
SAME exit=2 args=--root <fx>/nonexistent :: FAIL-CLOSED reason=root-absent:...
SAME exit=2 args=--root <fx> --from 90 :: FAIL-CLOSED reason=no-spotchecks-in-range:90-65
FIXTURE=<this build dir>/.run/cli.XXXXXX FAIL=0     # exit 0
```

`bash cli-parity.sh` is self-contained: it derives its own directory, writes fixtures under `$S` (default
`<script-dir>/.run`, removed after the receipt is taken) and exits 0 on full parity, 1 on any divergence.

## 6. Held-out mutant harness of the frozen counter, with v2 as the tool

Reproduce: `git clone --shared <lane> $D/lane`; `cp routed-ledger.v2.mjs $D/lane/scripts/routed-ledger.mjs`;
commit inside `$D/lane` only (`git -C $D/lane rev-parse --show-toplevel` == `$D/lane`); then
`node .ufo/waves/round-66/probe/ledger66-probe.mjs $D/lane <rev> --seed <hex>`.
Four seeds (`counter-v2-fixture.txt`); each line's MISS list has no `L1`, `L4` or `L5` entry:

```
LEDGER66_UNMET held=3/6 checks=6 rev=8483d885b924ac91072608d29f9d6dd8364045df rule=L66 seed=00000000000000a1 | L2 MISS ... L3 MISS ... L6 MISS ...
LEDGER66_UNMET held=3/6 checks=6 rev=8483d885... rule=L66 seed=deadbeefcafe1234 | L2 MISS ...
LEDGER66_UNMET held=3/6 checks=6 rev=8483d885... rule=L66 seed=00000000000000a2 | L2 MISS ...
LEDGER66_UNMET held=3/6 checks=6 rev=8483d885... rule=L66 seed=7f3c9d21aa55e010 | L2 MISS ...
```

`L1` = the v2 selftest inside the archive; `L4` = 14 generated mutants (drop, quote-swap, quote-decoy,
answer-wrong/ledger/eof, dup, ordinal, nested-as-item, prose-as-item, long-quote, no-section, ledger-absent);
`L5` = both always-CLEAN and always-DRIFT stubs still rejected. L2/L3/L6 miss only because the fixture commit
carries no `corpus/routed-ledger.md` and no registry-home rows — they are data/registry checks, not tool behaviour.

For comparison, the frozen counter on the lane's current HEAD with the unmodified tool (`88041bc9`) prints
`LEDGER66_UNMET held=3/6 ... | L2 MISS ... L3 MISS ... L6 MISS ...` — the same three, i.e. v2 adds no miss.

## 7. Coverage of v1 (V8, `NODE_V8_COVERAGE` on the 33-case selftest)

Every function and every line of `routedItems`, `ledgerRows`, `evaluate`, `makeReader` is executed except four
`ROW_MALFORMED` branches and defensive I/O fallbacks:

| site (v1 lines) | branch | exercised by a case? |
|---|---|---|
| 189 | `:id` (id regex) | no |
| 192 | `:round-or-item` (numeric shape) | no |
| 194 | `:class` (class regex) | no |
| 202 | `:answer-quote-words` (> 25) | no |
| 231 | classes-block class re-check `continue` | no |
| 115 | heading that ends the `## Ledger` section | no (no fixture carries a later heading) |
| 177 | `R.read(...) ?? ''` fallback | no (defensive) |
| 134/141/145 | reader `catch`/`null`/`[]` fallbacks | no (defensive) |
| 348-350 | selftest FAIL/exit-1 branches | no (by definition) |
| 355-379 | `main` (uncovered because `--selftest` returns first) | covered by §5 CLI runs |

These are live behaviour, not dead code — deleting them would delete contract sentences (id shape, class shape,
25-word answer limit). `extra-selftest-cases.js` holds four ready-to-paste cases covering the first four; they
pass on v1 **and** v2 (`ROUTED_LEDGER_SELFTEST: PASS (37/37)` on both copies), so the behaviour is correct and
only unguarded.
