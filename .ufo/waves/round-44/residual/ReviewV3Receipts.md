RESULT ReviewV3Receipts rev=28e29bbe verdict=reproduced reproduced=5/5 missing_variants=8 missing_scored_met=0

Item: re-derive five controls-v3 receipts under the frozen p44c counter with each receipt's printed seed, then score control variants named in controls/Ctl*.md that are absent from the 27 re-scored sha256s. Lane rev 28e29bbea5f7f138214dd8e7e6d8d448ba925d40. Controls only; no real census was scored. Tools installed or updated: none.

## Part 1 — receipt re-derivation: 5/5 reproduced

Frozen bytes: `git show 28e29bbe…:.ufo/waves/round-44/probe/p44c-count.mjs` and `…p44-shape.tsv` into scratch `res-ReviewV3Receipts`; observed sha256 `d7b806eb06af78d4fbdd92c3cb3732e67fc06a69a3175f7b175bbfb57975f025` (counter) and `fcf9fcb60138b332770f7d5daeeb667f9d28e83169b5f98963474a7a91403b71` (shape) — both equal the frozen values.

Controls found at the exact paths recorded in the receipt headers; `sha256sum` observed equals each receipt's `census_sha256`: label-keyed-a.mjs `964fce5d…`, ctl-label-keyed-b.mjs `a437a672…`, exact-snapshot.mjs `535bdbe9…`, name-set.mjs `98db89e4…`, CtlPartialNoKind.mjs `aaf1ab9b…`.

Replay command (per control, seed copied from the receipt header):
`systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=128 timeout -s KILL 900 node $S/p44c-count.mjs --census <control>.mjs --shape $S/p44-shape.tsv --work $S/p44work --seed <receipt seed>; echo exit=$?`

Seeds replayed (receipt = my run header, identical): label-keyed-a `05c0a98399fb0143fef72789289e5a47`; label-keyed-b `9b9c4486a95b62f40fc88ef80cbbc7ce`; exact-snapshot `4828295bc1ce079b1f50e031557eb466`; name-set `e9033877a57dcb254a089eafd3f56bbb`; partial-no-kind `9de14c5b1010377c078cd1859da4c020`.

Per-case check: for each of the five, all 150 `CASE` lines of my replay are byte-identical to the receipt (`cmp` of `grep '^CASE '` extracts: IDENTICAL 150 vs 150), and the P44_COUNT line matches the receipt exactly:

- label-keyed-a: `P44_COUNT: UNMET (passed=96 cases=150 floor=20 census_sha256=964fce5d…)` exit=1, receipt identical.
- ctl-label-keyed-b: `P44_COUNT: UNMET (passed=87 cases=150 floor=20 census_sha256=a437a672…)` exit=1, receipt identical.
- exact-snapshot: `P44_COUNT: UNMET (passed=133 cases=150 floor=20 census_sha256=535bdbe9…)` exit=1, receipt identical.
- name-set: `P44_COUNT: UNMET (passed=71 cases=150 floor=20 census_sha256=98db89e4…)` exit=1, receipt identical.
- partial-no-kind: `P44_COUNT: UNMET (passed=136 cases=150 floor=20 census_sha256=aaf1ab9b…)` exit=1, receipt identical.

Verdict: reproduced 5/5. The p44c seeded HMAC-SHA256 case stream replays exactly; the receipts are honest, re-derivable records. All five controls still read UNMET under p44c at identical per-case detail.

## Part 2 — missing variants: 8 named in Ctl*.md, not among the 27 re-scored

Method: set-difference of the `census_sha256` values in the 27 `controls-v3/*.txt` receipts (26 real files plus the absent census) against every per-variant sha256 named in the 18 `controls/Ctl*.md` reports. Not missing: b-constant-clean `2eb18070…` (re-scored as `MutCounterP44b/constant-clean.mjs`, identical bytes) and a-absent (covered by the `_nonexistent` absent-census receipt). Missing list (8):

1. CtlConstants c-constant-drift `18f6faaa23b7446d840b20ca4edb4f28098c9f49e6758f10e14d5958571a5d04`
2. CtlConstants d-random-exit-no-verdict `2e1728304b124b9b1b928ff9e68980f48e8d6b9305208ca2be059cd1f53d68a9`
3. CtlConstants e-both-verdicts-exit-0 `68b9ce71f0da4f44e75f483a40ea3727185b1a9c1b0b1da0d3ea48c5c77c1b51`
4. CtlDigitPermissive variant 1 `9620d01a1b9549d1acece4737f61f16f94d2666f8f08ac05e237043089c31efc`
5. CtlLabelKeyedB ownerless mutant `bddddbe8e5c3934afb55b328f806b6273f67e428d4093abc0507489f39386a71`
6. CtlNameSet exact-equality `07fec1c7c55112b2f59f4b67abf99c5eb375ce5ee1e1c7ffbc3ee4aa65477dfa`
7. CtlPrefixPermissive any-prefix `e422f4b27fcbd7cf9501798d2ddfdb39e0d65f6fb15a25409f1e568666f6385d`
8. CtlRandomVerdict half `3f95be892db024d966ac8a9144e255d8486b39a287b698cf0320c00a11d15c55`

Scored 5 of 8 (item cap). Recreation: rebuilt from the sources quoted in the reports; `sha256sum` of every rebuilt file equals the report-quoted original sha256 — byte-exact recreations, validated by also rebuilding b-constant-clean to `2eb18070…`, the exact bytes already re-scored as MutCounterP44b/constant-clean.mjs.

Score command (seeds chosen by me, recorded): `systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=128 timeout -s KILL 900 node $S/p44c-count.mjs --census $S/<rebuilt>.mjs --shape $S/p44-shape.tsv --work $S/p44work --seed <seed>; echo exit=$?`

Results — all `P44_COUNT: UNMET`, exit=1:

- const-drift `18f6faaa…` (seed 0001): UNMET passed=131 cases=150 — fails exactly the 19 CLEAN-expectation cases; passes every DRIFT case, which MET does not allow.
- random-exit-no-verdict `2e172830…` (seed 0002): UNMET passed=0 cases=150 — right exit codes, no verdict line; every case fails.
- both-verdicts-exit-0 `68b9ce71…` (seed 0003): UNMET passed=0 cases=150 — prints both verdict lines; rejected per the P44 clause.
- random-half `3f95be89…` (seed 0004): UNMET passed=74 cases=150 — mirror-blind coin flips; non-deterministic across runs.
- digit-permissive variant 1 `9620d01a…` (seed 0005): UNMET passed=90 cases=150 — accepts digit-run names; fails gen, src and kind cases.

missing_scored_met=0: no missing variant reads MET under p44c. Sources of the three tiny rebuilt constants and the random-half control are appended below.

## Residual risk and verification gaps

- The three listed-but-unscored variants (ownerless `bddddbe8…`, nameset-exact `07fec1c7…`, any-prefix `e422f4b2…`) have no p44c score from anyone. [INFERENCE] none should reach MET (their shortcut classes are strictly covered by p44c's per-member and sourced cases), but that is inference, not an observed score.
- random-half and random-exit are non-deterministic; my single run is one sample (74/150 and 0/150). The counter's `--seed` does not control the census's own `randomInt` draws.
- Replay identity was checked on all CASE lines plus the P44_COUNT line; the header's counter and shape sha256 fields were also verified equal, so every receipt header field agrees with the re-derivation.
- SentinelProcLeak spin/sleep/allocate probes were not re-scored under p44c, per the plan's stated carve-out (no verdict possible within 20 s); their p44b receipts stand. Not re-verified here.

Post-run: `pgrep -f res-ReviewV3Receipts` → 0 matching processes (three transient scope-teardown PIDs observed once mid-batch were gone on immediate re-check); `p44work` removed. Raw outputs retained in scratch `res-ReviewV3Receipts` (`replay-*.txt`, `missing-*.txt`, rebuilt controls, frozen counter and shape).

## Appendix — rebuilt sources (byte-exact to the report-quoted originals)

c-constant-drift (`18f6faaa…`):
```js
console.log('OMP_CENSUS: DRIFT');
process.exit(1);
```

d-random-exit-no-verdict (`2e172830…`):
```js
import { randomInt } from 'node:crypto';
process.exit(randomInt(2));
```

e-both-verdicts-exit-0 (`68b9ce71…`):
```js
console.log('OMP_CENSUS: CLEAN');
console.log('OMP_CENSUS: DRIFT');
process.exit(0);
```

random-half (`3f95be89…`):
```js
import { randomInt } from 'node:crypto';
const clean = randomInt(2) === 0;
console.log(`OMP_CENSUS: ${clean ? 'CLEAN' : 'DRIFT'}`);
process.exitCode = clean ? 0 : 1;
```
