# ConnOverlap2 — kumitate round 51 wave 2

Seat `kumitate-r51.NorthernCephalopod`. Re-scan only. No lane file outside this report was written. No tool installed or updated. Counters, `plan.md`, `scripts/`, `corpus/`, `SCORECARD.md`, and `SKILL.md` were not edited. Frozen counters were not re-run; an unrun probe has not passed.

Baseline: `.ufo/waves/round-51/w1/ConnSiblingOverlap.md`, mtime `2026-10-23 23:06:04`. That report's conclusion was: kumitate round 51 does not overlap any live sibling claim on `scripts/receipt-attest.mjs`, contract `kumitate-receipt-attest-v1`, an invocation-record digest, a nonce ledger, SOURCES rows for man7 `clock_gettime(2)` / `getrandom(2)`, or `cap-run`. Zero `*-shokunin/.ufo/reports/round-51/` directories.

Axes for this re-scan: **claim separability** (does a sibling that moved after 23:06 now own those objects?) and **operability hermeticity** (the wave-1 constraint that the shipped instrument must not spawn `sha256sum`). Coverage / `DOCTRINE_HELD` is a no-harm constraint.

## Conclusion

**Not "no change" in lane activity. No change in contested scope.** No sibling that wrote after the baseline claims `receipt-attest`, `invocation-attestation`, man7 `clock_gettime(2)`, man7 `getrandom(2)`, or `cap-run`. Fleet `.ufo/reports/round-51/` is still only `kotoba.md` and `kotodama.md` (mtimes 2026-10-22). No `*-shokunin/.ufo/reports/round-51/` directory exists. No round-52 wave started: the only `round-52` wave dirs are historical kotoba (newest file 2026-10-22 15:55) and kotodama (newest file 2026-10-22 10:06).

Three status deltas matter, and none is a claim collision:

1. **revenger** left stale round-62 and opened **round-63** (dir mtime 23:21). Claims are a ZIP central-directory entry, an inert firmware fixture record, and an icon-verifier forged-receipt kill. Their "ledger" is `corpus/live/runs/round-63/LEDGER.md`, an observation-class evidence log. Their own review says the receipt hashes stdout only and nothing binds `LEDGER.md` to `inspection.json`.
2. **tsukuroi** left round-35 and opened **round-36** (dir mtime 23:43), pre-freeze. C1 is a fixed child-env dict for five existing tools, one of which is `tools/run-receipt.py`. C2 is journalctl 262 `-F`/`-N`. Not an invocation attest instrument. Sources named are S024 / S198, not S100 / S101.
3. **kake round-44 landed** after the baseline. Fleet `.ufo/reports/round-44/kake.md` mtime 23:43:03, pushed tip `942fe187…`. C2 is still `scripts/ledger_latest_check.py` re-deriving three prose figures. Their wave-2 scout already separates that checker from kumitate's receipt-attest. Shape unchanged from the wave-1 reading of their spec; status changed from in-wave to pushed.

Chousa round-37 residuals after 23:06 reconfirm the PATH/`sha256sum` attack. They do not take the receipt-attest claim. Addendum item 5 (instrument digests via `node:crypto`; probe may use absolute `/usr/bin/sha256sum`) stays the hermeticity constraint. Do not relax it.

## Evidence

### Command — lane inventory after the baseline

```
python3 inventory of /home/vgpnk/Projects/shokunin/*-shokunin
  newest .ufo/waves/<round> dir mtime,
  round-51 / round-52 wave dirs,
  <lane>/.ufo/reports/round-51 and bare reports/round-51
```

`lane_count=21`. Rows that differ from ConnSiblingOverlap.md's "current wave" table:

| Lane | Wave-1 current wave | Now | Delta |
|---|---|---|---|
| revenger | round-62, 2026-10-21 19:25 | round-63, 2026-10-23 23:21:27 | **new live round** (45 files, all newer than the baseline) |
| tsukuroi | round-35, 08:52 | round-36, 2026-10-23 23:43:10 | **new live round** (8 files: spec, plan, dispatch) |
| kake | round-44, 22:57 | same dir mtime 22:57; 181 files inside newer than 23:06 | **fleet close report rewritten 23:43:03** |
| chousa | round-37, 20:12 | dir mtime 23:39:24 | 4 residual reports after 23:41; claim text unchanged |
| mori | round-38, 20:02 | dir mtime 23:28:54 | 42 files; `resid/` needle grep empty |
| kotoba | round-63, 22:52 | dir mtime unchanged; 13 `w2/*.md` after 23:06 | debt phrase reaffirmed, not an instrument |
| kotodama | round-64, 22:53 | dir mtime unchanged; 20 `w1/` files after 23:06 | needle grep empty |
| kumitate | round-51 | dir mtime 23:44:06 | this lane's own wave-2 writes |

Unchanged newest-wave dir mtime and zero files newer than the baseline: mado round-28, kama round-31, tameshi round-35, kaidoku round-34. Stale and untouched since the baseline: kagi round-28, kasegi round-23, kengaku round-29, lore round-103, souji round-22, tabi round-22. audio, game-dev-2d, game-dev-3d: still no `.ufo/waves`.

```
ufo_reports_round-51 under *-shokunin/.ufo/reports/:
  count 0
fleet .ufo/reports/round-51:
  kotoba.md   2026-10-22 12:34:48
  kotodama.md 2026-10-22 07:22:06
round-52 wave dirs:
  kotoba-shokunin    newest file 2026-10-22 15:55:59 falsify-a2/ExecGateMatrix.md
  kotodama-shokunin  newest file 2026-10-22 10:06:24 build/ScribeSec05Drummed.md
```

No other lane has a `round-51` or `round-52` wave directory. Bare `reports/round-51` (not `.ufo/reports`) is still only audio (2026-10-13) and kotodama (2026-10-22). Same closure note as wave 1.

### Command — needles on the surfaces that moved

Pattern: `receipt-attest|invocation-attestation|clock_gettime|getrandom|cap-run|helper-invocation|kumitate-receipt|nonce ledger`.

| Surface | Result |
|---|---|
| `revenger-shokunin/.ufo/waves/round-63` | no matches |
| `tsukuroi-shokunin/.ufo/waves/round-36` | no matches |
| `kotoba-shokunin/.ufo/waves/round-63/w2` | `helper-invocation` only, as the carried debt name |
| `kotodama-shokunin/.ufo/waves/round-64/w1` | no matches |
| `mori-shokunin/.ufo/waves/round-38/resid` | no matches |
| `kake-shokunin/.ufo/waves/round-44/w2` | the scout cites kumitate's plan; it does not claim the instrument |
| `chousa-shokunin/.ufo/waves/round-37/residual` | `sha256sum` only (their existing C1) |

### What the new and late claims actually say

**revenger r63** (`build-spec.json` context): C1 coverage K, new entry on C06 archives (ZIP central-directory fields of `corpus/fixtures/archive-r2/fixture.zip`). C2 coverage F, inert firmware fixture plus one `npx -y rea-agents@6.5.0 inspect-firmware-regions` run. C3 calibration, `C3_RECEIPT_KILLED_ATTRIBUTED` on `verify_named_multi_icon_states.py` and `verify_icon_states.py`. Their connector (`build/R63ConnectorOverlap.md`) contests kaidoku / tsukuroi / game-dev-3d archive and firmware ground. It does not mention kumitate, `clock_gettime`, or `getrandom`.

`build/R63RevengerLedger.md` (the file whose name collides): scope is `corpus/live/runs/round-63/LEDGER.md` plus `inspection.json` and `receipt.json`. The constructed gap, in their words: "nothing binds LEDGER.md to inspection.json — the receipt hashes stdout only, no ledger digest exists." That is the opposite of kumitate's sidecar-over-whole-file plus inner digest. "Forged-receipt" here is an Evidence-ID transplant against an icon/firmware record, not a prelude rewrite of an invocation receipt.

**tsukuroi r36** (`SCORECARD.md:1589-1663`, pre-freeze candidate, base `cefe752d`): C1 operability, the five tools stop copying the ambient environment into children. The five are `check-revision-binding.py`, `check-report-receipts.py`, `score-census-handoff-r32.py`, `mutants-btrfs-space-r30.py`, and `tools/run-receipt.py` (`env()`, `os.environ` minus `GIT_*`). After: each child env is a fixed dict (`PATH=/usr/bin:/bin`, `LC_ALL=C`, git locks). C2 depth, journalctl 262 field/filter rejection, sources S024 and S198. Separability sentence in that declaration: C1 touches only those five tools and the new probe. `run-receipt.py` remains their score harness (wave-1 adjacent item, now a live edit target). It is not `receipt-attest`.

**kake r44 close** (`.ufo/reports/round-44/kake.md:1-21`, mtime 2026-10-23 23:43:03): pushed `942fe187034c0666b5300e134e14b76d5e92a583`. C1 witness-class gate (`c44_count_v5.py`). C2 "receipt-derived ledger figures re-derive"; checker `scripts/ledger_latest_check.py --root .` exits 0; mismatches 3 → 0. `w2/ScoutSiblingOverlap.md:130` already writes the non-merge: kumitate round-51 `receipt-attest` "verifies an invocation receipt's inner digest, sidecar, and nonce uniqueness (`RECEIPT: VALID|REPLAY|TAMPERED`). It does not read the last stated number in a ledger and compare it to an older receipt."

**chousa r37 residuals** (after 23:41): `RevC1FreshSeed.md`, `RevReceiptAudit.md`, `RevSeparability.md`, `CritC2Kill.md`. Still the claim-pin gate. `RevC1FreshSeed.md:80-86` (F3): a mutant that hashes with `PATH=/usr/bin:/bin sha256sum | cut` and no pinned binary still scored 7/7. Their security property (caller PATH cannot forge the pin) holds; the sentence "one pinned absolute sha256sum" is stricter than what P1 measures. That does not license kumitate to spawn `sha256sum`. It is the same hole, measured one step looser.

**kotoba r63 w2** (`w2/RevW2ScorecardWording.md:68`, mtime 23:08): the Next line still carries "helper-invocation receipts" as quality debt beside SentBounds' baseline receipt and the r62 dispositions. `w2/ScoutW2QualityDebt.md:57-83` (this file is not in the post-23:06 mtime set; quoted only as the standing definition the later w2 reports repeat): closure would be "a precommitted receipt of each helper invocation: before/after jj op ids, helper path, hash, and argv," and the verdict is "still open. No pointer closes it." Not a round-63 instrument.

**mori r38**: late files are drift red-receipts and census evidence. Needle grep of `resid/` is empty. `contract.md` is not among the files newer than the baseline. Wave-1's reading stands: a "live receipt" there is a drift-row log.

### Integrated kumitate wording the close still owes

`SCORECARD.md` `## Capabilities` (`:1726-1740`) has rows through `bind-oracle`. There is no `receipt-attest` capabilities row yet. The plan still requires one (`plan.md` "Terms expected to move"). What exists today:

- `pin.receipt-attest=44919763ee523f334adaa4242d370435180d07aa0cdd4b85b0a7be870f48e8d9` (`SCORECARD.md:322`).
- `SKILL.md` gate-registry row (the `receipt-attest` line): `--ledger` "rejects a nonce bound to a different record digest." It does not say "nonce ledger," and it does not disambiguate the three late homonyms.
- `corpus/knowledge/invocation-attestation.md:39-41` already uses the addendum-4 rule (same nonce, different digest). Its `receipt:` bindings are kumitate paths. No sibling path.

## Contested scope

None. Predicate search for `ATTEST_HELD` / `DOCTRINE_HELD` objects still hits no sibling.

## Adjacent scope added or sharpened since ConnSiblingOverlap.md

1. **revenger r63 evidence ledger** — new. `build/R63RevengerLedger.md`. Observation-class `LEDGER.md`; receipt hashes stdout only; icon-verifier `C3_RECEIPT_KILLED_ATTRIBUTED`. Not a nonce set.
2. **tsukuroi r36 `run-receipt.py` child env** — new round, old file. `SCORECARD.md:1598-1612`. Score-harness environment allowlist. Do not import or wrap that tool from `receipt-attest`.
3. **kake r44 figure ledger** — same object as wave-1 adjacent item 2, now pushed (`942fe187`, fleet report 23:43). Their scout already drew the boundary.
4. **chousa r37 PATH class** — same object as wave-1 adjacent item 1. Post-baseline F3: a scrubbed-PATH `sha256sum | cut` still scores their counter 7/7. Hermeticity constraint unchanged.
5. **kotoba r63 helper-invocation debt** — same object as wave-1 adjacent item 3. Post-baseline w2 prose keeps it open. Field shape, if anyone closes it later: jj op ids, helper path, hash, argv. No clocks, no nonce, no GNU sidecar.
6. Unchanged from wave 1 and not re-litigated: kaidoku ELF `clock_gettime`/`getrandom` symbols, kama/mori man7 census pages, closed kotoba/kotodama round-51 homonyms.

## Proposed move (one)

When the close writes the missing `## Capabilities` row for `receipt-attest`, the "What it can now do" cell must say **nonce ledger** and carry one negative sentence that names no sibling path and is not a new `receipt:` clause in `invocation-attestation.md`:

> Nonce ledger: `--ledger <dir>` flags a nonce only when another `*.txt` receipt in that directory binds the same nonce to a different record digest. Not a checker that re-derives the last stated figure in LOG or SCORECARD, not an evidence-class run ledger, and not a helper op-id receipt.

That is the sentence the plan still owes (`plan.md` capabilities-table row) and the sentence the late homonyms will be grepped against. It improves claim separability against revenger's unbound `LEDGER.md`, kake's landed figure checker, and kotoba's still-open helper-invocation shape.

It does not harm operability hermeticity: the instrument stays on `node:crypto` `createHash('sha256')` and still does not spawn `sha256sum` (addendum item 5). Chousa F3 is not a reason to start spawning one. It does not harm coverage: do not add a D2 clause line for this sentence. A new `-` line in `invocation-attestation.md` without a `receipt:<kumitate-path>@sha256:` binding fails D2; a `receipt:` path into revenger, kake, kotoba, or tsukuroi fails the blob compare because those paths are not blobs at the kumitate rev (`doctrine51-probe.mjs`).

Do not, in that same row, cite `tsukuroi-shokunin/tools/run-receipt.py`. Round 36 is about to change its child environment. Kumitate's contract already records no env (plan Q42).

## Risks

- **D2 if the sentence is placed in the knowledge entry as a clause.** The entry's existing clauses already carry kumitate `receipt:` bindings. A sibling path, or a clause with no binding, moves `DOCTRINE_HELD`.
- **Bare "ledger" in the capabilities cell.** `SKILL.md`'s registry row already says `--ledger` without "nonce." The capabilities row is the census-facing sentence. Copying only the SKILL verb leaves the revenger and kake homonyms attached.
- **Relaxing addendum 5.** Chousa F3 shows their counter accepts a PATH-scrubbed `sha256sum | cut`. Importing that binary into `receipt-attest` would put A1/A3 on the caller's PATH, which is the live chousa attack, without becoming chousa's claim.
- **Absorbing revenger's gap.** Their ledger is intentionally not digest-bound to the receipt. A kumitate sentence that said "ledgers are not hash-bound" would be true of revenger and false of this instrument.

## Verification (for the integrator, not run here)

1. After the capabilities row is written, `grep -n` that row for `helper-invocation`, `ledger_latest_check`, `LEDGER.md`, `run-receipt.py`, and `sha256sum`. Expected: no hits. The cell contains the words `nonce ledger`.
2. `grep -n '^[-*] .*receipt:' corpus/knowledge/invocation-attestation.md` before and after. Expected: the same bindings; no new clause whose path leaves this repo.
3. `grep -n` `scripts/receipt-attest.mjs` for `sha256sum`, `spawn`, `execFile`, `execSync`. Expected: no hash-binary spawn (addendum 5, unchanged by this move).
4. Then, at the close rev, the frozen counters. Expected `ATTEST_HELD held=9/9` and `DOCTRINE_HELD held=5/5`. This seat did not run them.

## Contradiction (left standing)

Activity and predicates disagree. After 23:06, revenger, tsukuroi, kake, chousa, mori, kotoba, and kotodama all wrote bytes that contain "receipt" or "ledger." The predicate search hits none of them. Kake's own scout states the non-merge in one sentence (`ScoutSiblingOverlap.md:130`) while their fleet report's C2 heading still says "receipt-derived ledger figures." Both are accurate. Scoring overlap by the heading would contest a landed sibling; scoring it by the checker (`ledger_latest_check.py` versus a nonce set over `*.txt`) leaves kumitate r51 uncontested.
