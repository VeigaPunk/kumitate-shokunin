RESULT CtlQ30Reproduce rev=a2e5b54c verdict=reproduces p44d=REUSED(clean=19 recurring=9, CATALOG_GATE: FAIL, exit 1) toy=FRESH(clean=12 recurring=0, exit 0) pinned=REUSED(clean=12 recurring=12, CATALOG_GATE: FAIL, exit 1) sha=match

# CtlQ30Reproduce — re-derivation of the R44-1 catalog check (attempt 2, wave 1)

Seat: leaf control/re-derive seat. Nothing in the lane was written except this report; no git or jj
write, no push, no lane file edited, no sibling lane touched. No entry judgment was made (out of scope).

## Sources re-opened (read-only)

- Lane tip for this wave: `a2e5b54cdd2c4cbf72cb0b2ab4ed53e2fe0d730f`; working tree HEAD observed as
  `d9ad28701a9c2b504ae5db7919af1cdbabf18c83` ("round-45: attempt-2 plan erratum E8, start census,
  control-wave spec and dispatch"). Read with `env -u GIT_DIR -u GIT_WORK_TREE -u GIT_INDEX_FILE`.
- Inherited (UNTRUSTED) receipt: `.ufo/waves/round-45/build/ExecCatalogCheck.md`, sha256 of its own
  source blocks not used; every number below was re-derived by running the code.
- `.ufo/waves/round-45/probe/catalog-check.mjs.txt` -> sha256 `51e11b8f73929b49a07f14401eb9f3c9dcb50a6bb9dfa1b342a736c57cd8a63a`
  = the sha named in draft Q30 and in `corpus/QUALITY.md` Q30 -> **sha=match** (confirmed).
- `.ufo/waves/round-45/probe/toy-count.mjs.txt` -> `481d255feab3b58f504f25805ac1a79ce435f5738d1d626bebc0a353ecfde6c3`
  (receipt value match); `.ufo/waves/round-45/probe/toy-shape.tsv` -> `9b53bc39714142c99104f4d5f5c100a73f8969f93cd2c51cace20211503baf9a` (match).
- `git -C <lane> show 32b7fd561dae38b951828dde8fe11052737fb824:.ufo/waves/round-44/probe/p44d-count.mjs`
  -> `9ea97d869a613a164f75aa8c357d18f586e6aef2e04672e0cc73dce5928e461e` (receipt value match);
  `.../p44-shape.tsv` -> `fcf9fcb60138b332770f7d5daeeb667f9d28e83169b5f98963474a7a91403b71` (match).
- Host observed: `node --version` -> v24.21.0; `git --version` -> git version 2.56.0. No tool was installed
  or updated for this item, so no install record is owed.

Scratch (mine, only): `/fast/scratch/hyaku/kumitate-r45/seats/a2-CtlQ30Reproduce/` (52K, six files).
Attempt-1 scratch `/fast/scratch/hyaku/kumitate-r45/seats/w1-ExecCatalogCheck/` was read only (one file,
`bad-counter.mjs`, copied out for the guard re-run) and not modified. Every run below was inside the
host-safety wrapper `systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=128 timeout -s KILL 900 <cmd>`.

## The three required runs (exact commands, observed output)

1. p44d, two different seeds — exit 1, **as the receipt says**.
```
node catalog-check.mjs --label p44d --cmd "node p44d-count.mjs --census {CENSUS} --shape {SHAPE} --seed {SEED} --list" \
  --shape p44-shape.tsv --seed-a 0011223344556677 --seed-b aabbccddeeff0011 --require-fresh
CATALOG: REUSED (clean=19 recurring=9)
CATALOG_DETAIL: label=p44d cleanA=19 cleanB=19 uniqueA=18 recurring=9 fraction=0.500 fracCases=0.474 seedA=0011223344556677 seedB=aabbccddeeff0011
CATALOG_RECURRING: control@a47d39ddcd13 no-chains@3e5ca94c6b97 src:prompts@b8427fd699a4 src:memories@7a00b458f733 src:commands@46e92424da51 no-sidecars@81b3e26c1edd src:themes@deaef4df2919 src:tools@9e7836835180 control-end@a47d39ddcd13
CATALOG_GATE: FAIL (9 CLEAN shape(s) recur across seeds; a catalog can memorise them)
EXIT=1
```
2. Toy generator, fresh random variation — exit 0, **as the receipt says**.
```
node catalog-check.mjs --label toy --cmd "node toy-count.mjs --shape {SHAPE} --seed {SEED} --list" \
  --shape toy-shape.tsv --seed-a 1111222233334444 --seed-b 5555666677778888 --require-fresh
CATALOG: FRESH (clean=12 recurring=0)
CATALOG_DETAIL: label=toy cleanA=12 cleanB=12 uniqueA=12 recurring=0 fraction=0.000 fracCases=0.000 seedA=1111222233334444 seedB=5555666677778888
CATALOG_GATE: PASS (no CLEAN shape recurs across seeds)
EXIT=0
```
3. Toy with the seed pinned (control) — exit 1, **as the receipt says** (receipt: "REUSED 12/12").
```
node catalog-check.mjs --label toy-fixedseed --cmd "node toy-count.mjs --shape {SHAPE} --seed {SEED} --list" \
  --shape toy-shape.tsv --seed-a 1111222233334444 --seed-b 1111222233334444 --require-fresh
CATALOG: REUSED (clean=12 recurring=12)
CATALOG_DETAIL: label=toy-fixedseed cleanA=12 cleanB=12 uniqueA=12 recurring=12 fraction=1.000 fracCases=1.000 seedA=1111222233334444 seedB=1111222233334444
CATALOG_GATE: FAIL (12 CLEAN shape(s) recur across seeds; a catalog can memorise them)
EXIT=1
```
Re-run of (1) with the same seeds gave byte-identical output, so the result is deterministic, not a one-off.

## How the check fingerprints a shape, and what it ignores (two lines)

Fingerprint: for every case the listing labels `expect=CLEAN`, it rebuilds that case's whole expected
mirror from the frozen base shape plus the case's note tokens, canonicalises it as sorted
`name\tkind\tmode(3 octal digits)` lines, and takes the SHA-256 of that text; a fingerprint that appears
under both seeds is a shape a catalog could memorise. It ignores the case id, the order of cases and the
order of entries (entries are sorted before hashing), and it ignores the DRIFT cases entirely — it also
cross-checks the rebuilt entry count against the count the listing prints and errors out (exit 2) on any
mismatch, so it never passes a shape it could not reconstruct.

## Per-inherited-statement verdicts

| inherited statement | verdict | evidence |
|---|---|---|
| p44d prints `CATALOG: REUSED (clean=19 recurring=9)` + `CATALOG_GATE: FAIL`, exit 1 | CONFIRMED | run 1 above, repeated identically |
| toy generator prints `CATALOG: FRESH (clean=12 recurring=0)`, exit 0 | CONFIRMED | run 2 above |
| toy with seed pinned reads REUSED 12/12 | CONFIRMED | run 3 above (`recurring=12`) |
| catalog-check.mjs.txt sha256 is `51e11b8f…` | CONFIRMED | sha256sum of the lane probe file equals the draft Q30 value |
| `toy-novar` control: same toy with `--variation none` under two seeds -> `REUSED (clean=12 recurring=12)`, exit 0 | PARTIAL | verdict and exit reproduce, but the run prints a third line the receipt did not quote: `CATALOG_GATE: PASS (no CLEAN shape recurs across seeds)` — see Risk 1 |
| p44d verdict stable on `deadbeefdeadbeef/0123456789abcdef` -> REUSED (19/9) | CONFIRMED | re-run: clean=19 recurring=9, exit 1 |
| p44d verdict stable on `aaaaaaaa/bbbbbbbb` -> REUSED (19/9) | CONFIRMED | re-run: clean=19 recurring=9, exit 1 |
| p44d on `0f0f0f0f0f0f0f0f0f/f0f0f0f0f0f0f0f0` -> REUSED (clean=19 recurring=6, **cleanB=14**, "one seed produced a different case count") | REFUTED | re-run gives `CATALOG: REUSED (clean=19 recurring=9)`, `cleanA=19 cleanB=19`, exit 1 — the second seed does not shrink the case count; a 40-seed random scan of p44d gave `cases=207 clean=19` for every seed, so `cleanB=14` is not reachable with these bytes |
| p44d replays exactly under one seed, listing output hash `99ed13ad…` | PARTIAL | the two runs are byte-identical (CONFIRMED), but the hash embeds the absolute shape path: raw hash in my scratch is `1e08c8ad…`; rewriting the path to the receipt's seat path reproduces `99ed13adc9709d9195d86d5fc0e5157cc2e736ff4535ba8594eb8b2feae0485f` exactly, so that hash is not reproducible outside the receipt's own directory |
| guard: listing that lies about its entry count -> exit 2 | CONFIRMED | `CATALOG_CHECK: ERROR (reconstruction mismatch for case c1: reconstructed 5 entries, listing says 99)`, exit 2 |
| guard: note token the check cannot rebuild -> exit 2 | CONFIRMED | `CATALOG_CHECK: ERROR (unhandled note token "~x.txt:file" in case c1 (CLEAN cases only))`, exit 2 |
| p44d's own selftest passes at this revision (`P44_SELFTEST: 21/21`, `VERDICT: PASS`) | CONFIRMED | re-run of `node p44d-count.mjs --selftest --shape p44-shape.tsv`, exit 0, same two lines |
| mutant A (`--ignore-notes`) -> toy REUSED 12/12, fraction 12.000, uniqueA 1 | CONFIRMED | re-run: uniqueA=1 fraction=12.000 (and it still prints `CATALOG_GATE: PASS`, Risk 1) |
| mutant B (`--fingerprint id`) -> toy REUSED 12/12; p44d REUSED 19/19 | CONFIRMED | re-run both: toy recurring=12 uniqueA=12; p44d clean=19 recurring=19 |

## Risks and blockers (for the L1)

1. **Misleading gate line outside gate mode (operability defect in the shipped check).**
   `catalog-check.mjs` prints `CATALOG_GATE: PASS (no CLEAN shape recurs across seeds)` whenever
   `--require-fresh` is absent, even when the verdict line above it says `CATALOG: REUSED`. Observed on
   three runs (toy-novar, mutant A, mutant B) — all exit 0 with a PASS gate line over a REUSED verdict.
   Q30's own command includes `--require-fresh`, so the criterion as written is safe, but any reader who
   copies the receipt's control command (which omits the flag) sees "PASS" on a counter a catalog can
   memorise. Recommend the check print the gate line only in gate mode, or make the non-gate run print
   `CATALOG_GATE: SKIPPED (no --require-fresh)`.
2. **The criterion's command file is not committed.** `git show a2e5b54c:.ufo/waves/round-45/probe/catalog-check.mjs.txt`
   fails with "exists on disk, but not in 'a2e5b54c'"; at HEAD `d9ad2870` the tracked probe files are only
   `normalize.py.txt` and `reopen-quote.sh.txt`. `catalog-check.mjs.txt`, `toy-count.mjs.txt` and
   `toy-shape.tsv` are untracked working-tree files, and the Q30 text in `corpus/QUALITY.md` is likewise
   uncommitted (`grep -c Q30` at HEAD = 0, in the working tree = 2). A closure that checks out a commit
   cannot run Q30's command as named; the L1 owns committing these.
3. **One receipt statement is not reproducible** (the `0f0f` seed pair, `cleanB=14`); the QUALITY.md Q30
   measurement paragraph does not repeat that number, so no correction is needed there. The receipt's
   replay hash is path-dependent (see the table), so a re-runner must expect a different raw hash.
4. **The check keys on the shape, not on the seed — confirmed independently.** Two different seeds give the
   same CLEAN count (19) on p44d but different fingerprints for the `gen:` cases only; the nine recurring
   fingerprints are the fixed shapes (control, control-end, no-sidecars, no-chains, src:themes/tools/
   commands/prompts/memories). That is the substance of the R44-1 repair: p44d's CLEAN set is enumerable.
5. No blocker for the L1: the three headline results reproduce exactly, on the bytes the receipt named.

## Hygiene

- Files written by this seat: this report only (inside the lane); scratch outside the lane at
  `/fast/scratch/hyaku/kumitate-r45/seats/a2-CtlQ30Reproduce/` (52K: catalog-check.mjs, toy-count.mjs,
  toy-shape.tsv, p44d-count.mjs, p44-shape.tsv, bad-counter.mjs). Temporary listing dumps deleted.
- `pgrep -af "a2-CtlQ30Reproduce"` returned nothing after the last run: no process of mine is left.
- No secret, token, oauth or server.token content was read or printed. No model parameters were used.
- Sources were opened by ordinary means (`git show`, `cp`, `read`); no browser, no bot challenge, no
  unverified remote script.
