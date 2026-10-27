VERDICT: `scripts/routed-ledger.mjs` v1 has no dead code — V8 coverage shows every function and every non-defensive branch executes — and the only shrink I could prove (382→379 lines, 5 edits) is behaviour-identical on 33/33 selftest cases, 11 541 differential cases, 10 argv shapes and 4 counter seeds; the patch is filed but my recommendation is to keep v1, because the round's C1 ratchet authorises only mis-read fixes and the frozen control receipts pin the tool's sha256.

## Evidence

- Tool under review: `scripts/routed-ledger.mjs`, 382 lines, sha256 `f92a364d293a283804e7d693f04cddfd94040d7f29a6c5c428b900b0d6ff3bf5`, last commit `621212bac37f8249c72ac982d1d6534cb8d60701` (`git diff 621212ba -- scripts/routed-ledger.mjs` empty), working tree byte-identical after this seat.
- Test surface: the 33-case selftest is the only automated behaviour check; the frozen counter spawns the CLI (L1 = selftest on the archived tool, L2 = real run, L4 = 14 generated mutants, L5 = two stub controls). The frozen `c1-controls.sh:30` also imports `routedItems` directly — that is the module's only external importer.
- Baseline and candidate, same 33 cases:

```
$ node routed-ledger.v1-freeze.mjs --selftest      # build/K66SimplifierTool/selftest-v1-freeze.txt
ROUTED_LEDGER_SELFTEST: PASS (33/33)               # exit 0
$ node routed-ledger.v2.mjs --selftest             # build/K66SimplifierTool/selftest-v2.txt
ROUTED_LEDGER_SELFTEST: PASS (33/33)               # exit 0
```

- Behavioural differential (`differential-harness.mjs`, imports both copies; `routedItems`, `ledgerRows`, `norm` compared by `JSON.stringify` over every `.md` in the lane worktree incl. `.ufo/waves/**`, the eleven spot-checks at `621212ba`, and 5 000 seeded random markdown documents):

```
DIFF cases=11541 mismatches=0                      # exit 0
```

- CLI parity (`cli-parity.sh`, fixture built from the eleven frozen spot-checks: real 57 items + a 57-row synthetic ledger; stdout+stderr+exit compared per argv):

```
SAME exit=0 args=--root <fx> --from 55 --to 65 :: ROUTED_LEDGER: CLEAN spotchecks=11 sections=11 items=57 rows=57 open=29 closed=28 wontfix=0
SAME exit=1 args=--root <fx> --to 60 :: ROUTED_LEDGER: DRIFT spotchecks=6 sections=6 items=28 rows=57 ... findings=29 first=ITEM_ABSENT:...
SAME exit=2 args=--root <fx> --from 55 --to 65 --rev HEAD :: ROUTED_LEDGER: FAIL-CLOSED reason=rev-unreadable:HEAD
SAME exit=64 args=--root <fx> --bogus :: ROUTED_LEDGER: USAGE unknown argument --bogus
SAME exit=64 args=--root <fx> --from x :: ROUTED_LEDGER: USAGE --from/--to must be integers
SAME exit=2 args=--root <fx>/nonexistent :: ROUTED_LEDGER: FAIL-CLOSED reason=root-absent:...
SAME exit=2 args=--root <fx> --from 90 :: ROUTED_LEDGER: FAIL-CLOSED reason=no-spotchecks-in-range:90-65
                                                    # 10/10 SAME, FIXTURE=... FAIL=0, exit 0
```

- Held-out mutant harness of the frozen counter, with v2 as the tool (sandbox clone of the lane, v2 committed inside the clone under my scratch, `git -C` toplevel asserted equal to the clone before the commit), four seeds — no `L1`, `L4` or `L5` MIss in any line, i.e. the 14 mutants and both stubs are classified exactly as with v1:

```
LEDGER66_UNMET held=3/6 checks=6 rev=8483d885... rule=L66 seed=00000000000000a1 | L2 MISS ... | L3 MISS ... | L6 MISS ...
LEDGER66_UNMET held=3/6 checks=6 rev=8483d885... rule=L66 seed=deadbeefcafe1234 | L2 MISS ... | L3 MISS ... | L6 MISS ...
LEDGER66_UNMET held=3/6 checks=6 rev=8483d885... rule=L66 seed=00000000000000a2 | L2 MISS ... | L3 MISS ... | L6 MISS ...
LEDGER66_UNMET held=3/6 checks=6 rev=8483d885... rule=L66 seed=7f3c9d21aa55e010 | L2 MISS ... | L3 MISS ... | L6 MISS ...
```

  L2/L3/L6 miss only because the clone carries no `corpus/routed-ledger.md` and no registry-home rows. The unmodified tool on the lane's current HEAD (`88041bc9`) prints the same three misses (`held=3/6`), so v2 adds none.
- Coverage (V8, `NODE_V8_COVERAGE` on the 33-case selftest): every line of `routedItems`, `ledgerRows`, `evaluate`, `makeReader` runs except four `ROW_MALFORMED` branches (v1 lines 189 `:id`, 192 `:round-or-item`, 194 `:class`, 202 `:answer-quote-words`), the classes-block re-check (231), the heading that would end the `## Ledger` section (115, no fixture carries a later heading), the defensive reader fallbacks and the selftest's own FAIL arms. There is nothing to delete: each of those is a documented contract sentence or an I/O guard.
- Size: 382 → 379 lines (net −3) with `simplify.patch` (63 diff lines); the docblock and every verdict/finding string are untouched by the patch.

## Findings

1. **K66SimplifierTool-1 — severity: info. The shrink exists and is proven, but it should not be applied this round.** Five edits: (a) `starts.push({ i, kind })` → `starts.push(i)` with `L[at].startsWith('|')` recovering the table kind (one object allocation per item start removed; the discriminator duplicated the line's own bytes); (b) the item body `[L[at]]` + `push` + `join` → `L.slice(at, stop).join('\n')` with the prose break folded into `stop` (one array copy per item removed); (c) `if (/^\S/.test(L[j]) && !/^\s/.test(L[j]) && …)` → the second test was a tautology; (d) the separator regex was written twice → one `SEP_RE` const, each call site keeping its own `-` requirement, so both parsers stay byte-identical; (e) `words(row.quote)` computed twice in one finding → hoisted. Repro: `cd .ufo/waves/round-66/build/K66SimplifierTool && node routed-ledger.v2.mjs --selftest` (`PASS (33/33)`) versus `git -C <lane> diff --no-index scripts/routed-ledger.mjs build/K66SimplifierTool/routed-ledger.v2.mjs`. Why not apply: plan §C1 "Ratchet" makes a tool edit a *strengthening tied to a mis-read*, and none of these is a mis-read fix; `base/ledger66-donothing.txt:1` and `base/ledger66-autoledger.txt:1` pin `control-tool-sha256 f92a364d…`, so any change makes a re-run control print a sha the receipts no longer match. If the L1 integrates C1 data and re-runs the controls anyway, the patch is free to take: it is net −3 lines, drops two per-item allocations, and is verified identical above.

2. **K66SimplifierTool-2 — severity: info. The "duplicated" separator rule is a deliberate mirror of the frozen counter; unifying it would be a regression.** `routedItems`' separator test requires a `-` (`scripts/routed-ledger.mjs:87`) while `ledgerRows` does not (`:117`); the frozen counter does exactly the same split (`probe/ledger66-probe.mjs:81` `isSep` requires `-`, `:108` skips any `|[\s:|-]+|` line). Consequence: a `| |` line is an item inside a routed section and a skipped line inside `## Ledger` — in the tool *and* in the counter. Making the two agree would put the tool out of step with the counter that scores it. Repro: append `| |` to a routed section and to the ledger of a scratch fixture, run both tool and `ledger66-probe.mjs`; counts agree today.

3. **K66SimplifierTool-3 — severity: coverage. Four contract branches never fire in the 33 cases.** `ROW_MALFORMED` for bad `id`, non-numeric `round`/`item`, bad `class` shape and a >25-word *answer* quote (v1 lines 189/192/194/202), plus the classes-block class re-check (231), are unreachable from the suite. The behaviour is correct — `extra-selftest-cases.js` adds those four cases and both v1 and v2 print `ROUTED_LEDGER_SELFTEST: PASS (37/37)` — but they are unguarded, which is the same surface `K66MutRoutedLedger-1` reached by mutation. Repro: `NODE_V8_COVERAGE=$TMPDIR/cov node scripts/routed-ledger.mjs --selftest`, then read `ranges[].count === 0`. These are omissions, not dead weight: deleting them would delete the id/class/25-word contract sentences.

4. **K66SimplifierTool-4 — severity: nit. Three of the four `export`s have no importer.** Only `routedItems` is imported anywhere (`probe/c1-controls.sh:30`); `norm`, `ledgerRows`, `evaluate` are exported for nobody (the counter spawns the CLI, it never imports). Dropping three `export` keywords saves 0 lines and narrows a surface a later gate may legitimately import — declined, recorded so a future round does not re-open it blind. Repro: `grep -rn "from '.*routed-ledger" <lane> --include=*.mjs --include=*.sh`.

## Artifacts

- `.ufo/waves/round-66/build/K66SimplifierTool/simplify.patch` — the proposed diff (a/scripts/routed-ledger.mjs → b/…), 63 lines, 382→379.
- `.ufo/waves/round-66/build/K66SimplifierTool/routed-ledger.v2.mjs` — full simplified file, sha256 `af7cdbaeb5ff0bd0dcb27733e8b05ffc5eff935473070c402ef30a50e6bcbbf4`.
- `.ufo/waves/round-66/build/K66SimplifierTool/routed-ledger.v1-freeze.mjs` — byte copy of the freeze tool (sha `f92a364d…`) so the harnesses run from the build dir.
- `EVIDENCE.md` (verbatim outputs, coverage table), `rejected-candidates.md` (R1–R11 with measured reasons), `differential-harness.mjs`, `cli-parity.sh`, `extra-selftest-cases.js`, `selftest-v1-freeze.txt`, `selftest-v2.txt`, `differential.txt`, `cli-parity.txt`, `counter-v2-fixture.txt`, `sha256.txt`.

## Limits

- No LSP server answers for `.mjs` here, so callers were proven by grep plus the frozen control's import line, not by semantic references; `c1-controls.sh:30` is the only importer found.
- The mutant-harness evidence uses four fixed seeds I chose (not the counter's own random default) and only 14 fixtures per seed; a wider mutant population would be stronger.
- The fifty-odd `.md` files a concurrent seat adds change `cases=` between runs (11 492 → 11 524 → 11 541); the mismatch count stayed 0 each time.
- I did not run the two `c1-controls.sh` variants against v2 (that clones, commits, and costs a full counter run inside my scratch); the equivalent coverage is the fixture-clone counter run at four seeds.
- No packages were installed and no pacman transaction was attempted (nothing was needed).
