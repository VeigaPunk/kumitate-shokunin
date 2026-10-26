VERDICT: the integrated tool v2 accepts 12 more report lies and rejects 1 honest report (13 forgeries, 12 killable); a 190-line diff (`report-receipt-diff.v3.diff`, 92+/21-, selftest 52→67) kills all 12 and stops the false positive while the 37 frozen controls, the probe's P1–P4 and the round-60/round-63 arms stay byte-identical; the 13th (a hand-written receipt) is the declared limit and stays open.

# Seat K64R2CriticForgeV2 — forge `scripts/report-receipt-diff.mjs` v2 at 2ed8a5f8

Subject attacked: `kumitate-shokunin/scripts/report-receipt-diff.mjs` at lane `2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8` (298 lines, contract v2). Frozen tree (`plan.md`, `probe/*`, `controls/`, `base/`) read only. Scratch `/tmp/kumitate-r64/K64R2CriticForgeV2/`.

## Evidence

1. Baseline at HEAD (nothing of mine in the tree):
```
$ node scripts/report-receipt-diff.mjs --selftest
REPORT_RECEIPT_SELFTEST: PASS (52/52)                      exit 0
$ controls.sh scripts/report-receipt-diff.mjs
CONTROLS total=37 fails=0
```
2. 13 forged cases, frozen control format (`report.md`, `lane/.ufo/waves/round-9/{base,close}/*`, `expect`), each a copy of the honest `c0-honest` lane plus one mutation; run with `--round 9 --fleet /home/vgpnk/Projects/shokunin`:
```
$ node /tmp/kumitate-r64/K64R2CriticForgeV2/run.mjs scripts/report-receipt-diff.mjs
FAIL f1-label-digits-first: got=0/CLEAN want=1/TALLY_UNRECEIPTED
FAIL f10-placeholder-residual: got=0/CLEAN want=1/PLACEHOLDER
FAIL f11-leading-zeros-honest: got=1/TALLY_UNRECEIPTED want=0/CLEAN
FAIL f12-checks-line-split: got=0/CLEAN want=1/TALLY_CHECKS_MISMATCH
FAIL f13-hash-41: got=0/CLEAN want=1/HASH_DEAD
FAIL f2-confusable-held: got=0/CLEAN want=1/TALLY_UNRECEIPTED
FAIL f3-fullwidth-digits: got=0/CLEAN want=1/TALLY_UNRECEIPTED
FAIL f4-arabic-indic-digits: got=0/CLEAN want=1/TALLY_UNRECEIPTED
FAIL f5-tally-line-split: got=0/CLEAN want=1/TALLY_UNRECEIPTED
FAIL f6-sections-in-html-comment: got=0/CLEAN want=1/SECTION_MISSING,SHONEN_COUNT
FAIL f7-receipt-path-case-fold: got=0/CLEAN want=1/RECEIPT_MISSING
FAIL f8-fleet-commit-hash: got=0/CLEAN want=1/HASH_FOREIGN
FAIL f9-url-tail-dead-hash: got=0/CLEAN want=1/HASH_DEAD
FORGERY cases=13 fails=13
```
3. Same 13 against the draft (`build/K64R2CriticForgeV2/report-receipt-diff.v3.mjs`):
```
$ node .../run.mjs .../report-receipt-diff.v3.mjs
ok   f1-label-digits-first: got=1/TALLY_UNRECEIPTED want=1/TALLY_UNRECEIPTED
ok   f10-placeholder-residual: got=1/PLACEHOLDER want=1/PLACEHOLDER
ok   f11-leading-zeros-honest: got=0/CLEAN want=0/CLEAN
ok   f12-checks-line-split: got=1/TALLY_CHECKS_MISMATCH want=1/TALLY_CHECKS_MISMATCH
ok   f13-hash-41: got=1/HASH_DEAD want=1/HASH_DEAD
ok   f2-confusable-held: got=1/TALLY_UNRECEIPTED want=1/TALLY_UNRECEIPTED
ok   f3-fullwidth-digits: got=1/TALLY_UNRECEIPTED want=1/TALLY_UNRECEIPTED
ok   f4-arabic-indic-digits: got=1/TALLY_UNRECEIPTED want=1/TALLY_UNRECEIPTED
ok   f5-tally-line-split: got=1/TALLY_UNRECEIPTED want=1/TALLY_UNRECEIPTED
ok   f6-sections-in-html-comment: got=1/SECTION_MISSING,SHONEN_COUNT want=1/SECTION_MISSING,SHONEN_COUNT
ok   f7-receipt-path-case-fold: got=1/RECEIPT_MISSING want=1/RECEIPT_MISSING
ok   f8-fleet-commit-hash: got=1/HASH_FOREIGN want=1/HASH_FOREIGN
ok   f9-url-tail-dead-hash: got=1/HASH_DEAD want=1/HASH_DEAD
FORGERY cases=13 fails=0
```
4. No regression: draft selftest `REPORT_RECEIPT_SELFTEST: PASS (67/67)` exit 0; `CONTROLS total=37 fails=0`; frozen probe run on a scratch clone of the lane (`git clone --no-hardlinks`, `2ed8a5f8` + one commit carrying the draft, `rev=a92be14f367fb2a2b3cfdcd12216d31f66566f4d`):
```
$ node .ufo/waves/round-64/probe/receipt64-probe.mjs /tmp/.../clone-rRhI66 a92be14f...
RECEIPT64_UNMET held=4/5 checks=5 rev=a92be14f367fb2a2b3cfdcd12216d31f66566f4d rule=R64 | P5 MISS report-not-given
```
   Same probe on the same clone at `2ed8a5f8` (integrated tool): `RECEIPT64_UNMET held=4/5 checks=5 rev=2ed8a5f8... rule=R64 | P5 MISS report-not-given` — P5 is the only miss before and after (the round-64 report does not exist yet; not mine to write).
5. P3 arms verbatim under the draft: r60 `REPORT_RECEIPT: DRIFT PLACEHOLDER,TALLY_UNRECEIPTED (round=60 … bytes=13611)` with 6 `PLACEHOLDER` lines (independent `grep -o '__[A-Z][A-Z0-9_]*__' | wc -l` = 6) and `TALLY_UNRECEIPTED DISPATCH60_HELD held=10/10`; r63 `REPORT_RECEIPT: CLEAN (round=63 … bytes=17479)` exit 0.
6. False-positive sweep, every lane round that holds `base/` and a fleet report (51–61, 63; 12 reports), integrated vs draft: `changed=0` — `r53 … HASH_DEAD`, `r57 … HASH_DEAD`, `r58 … TALLY_UNRECEIPTED`, `r60 … PLACEHOLDER,TALLY_UNRECEIPTED`, `r61 … HASH_DEAD`, the rest `CLEAN`, all identical under both tools.
7. Calibration probes (both tools agree unless noted): `./`-prefix citation → `DRIFT RECEIPT_MISSING`; `close//fake.txt` → `DRIFT RECEIPT_MISSING`; a false tally inside `<!-- … -->` → `DRIFT TALLY_UNRECEIPTED` (a comment hides a claim from the reader, not from the checker); `.ufo/waves/ROUND-9/close/fake.txt` → v2 `CLEAN`, draft `DRIFT RECEIPT_MISSING`.
8. Patch: `build/K64R2CriticForgeV2/report-receipt-diff.v3.diff`, `diff-lines=190 added=92 removed=21`, `git apply -p1 --check` → `apply-check=0`, applied copy `cmp`-equal to the draft (`applied-copy-identical`).

## Findings

Repro for every finding: `node scripts/report-receipt-diff.mjs --lane <case>/lane --round 9 --report <case>/report.md --fleet /home/vgpnk/Projects/shokunin` where `<case>` is under `.ufo/waves/round-64/build/K64R2CriticForgeV2/cases/`; `expect` holds the sound verdict (line 1 exit, line 2 ids).

- `K64R2CriticForgeV2-1` (high) — **label vocabulary is `[a-z][a-z0-9]*_HELD`**: a digits-first label is invisible. `f1-label-digits-first`: report asserts `64_HELD held=9/9`; no receipt carries it; v2 `CLEAN`. Fix: `\b([a-z0-9]+_(?:held|unmet))` (draft `:53`).
- `K64R2CriticForgeV2-2` (high) — **`HELD` spelled in another script**: `f2-confusable-held` writes `X9_НELD` (U+041D CYRILLIC CAPITAL EN) `held=9/9`; v2 `CLEAN` (NFKC does not fold it). Fix: a confusable table folded in the scan copy (draft `:58-68`).
- `K64R2CriticForgeV2-3` (high) — **full-width digits**: `f3-fullwidth-digits` asserts `held=９/９` (U+FF19); `\d` is ASCII-only, so v2 `CLEAN`. Fix: `.normalize('NFKC')` first in `scan()` (`:77`).
- `K64R2CriticForgeV2-4` (high) — **Arabic-Indic digits**: `f4-arabic-indic-digits` asserts `held=٩/٩` (U+0669); NFKC does not fold this block and `Number('٩')` is `NaN`, so v2 `CLEAN`. Fix: explicit digit-block fold (`DIGIT_BLOCK`, draft `:69-72`).
- `K64R2CriticForgeV2-5` (high) — **tally split across two lines**: `f5-tally-line-split` writes `X9_HELD` / `held=9/9 (cite)`; the tally loop is per-line, so v2 `CLEAN`. Fix: `claimLines()` folds a `held=`/`checks=` continuation into the claim line, keeping its citation scope (draft `:85-92`).
- `K64R2CriticForgeV2-6` (high) — **all six required sections plus the SHONEN boxes inside one HTML comment**: `f6-sections-in-html-comment`; the reader sees only "Nothing to report."; `unfence()` blanked fences but not comments, so v2 `CLEAN`. Fix: blank `<!-- … -->` (unterminated → to EOF) before fence handling (draft `:95-101`).
- `K64R2CriticForgeV2-7` (high) — **citation identity is case-sensitive in the parser but not in the reader**: `f7-receipt-path-case-fold` cites `round-9/Close/fake-tip.txt` and `ROUND-9/close/fake-base.txt`; `RECEIPT_PATH` only matched lower-case `base|close`, so neither path was a citation and v2 `CLEAN` (a fabricated receipt passes unchecked). Fix: `'gi'` on `RECEIPT_PATH` (`:54`); lookups stay exact-case, so a wrong-case path is `RECEIPT_MISSING`.
- `K64R2CriticForgeV2-8` (high) — **a commit of another repository under the fleet root is accepted as this lane's landing**: `f8-fleet-commit-hash` cites fleet `5bfdf50ba7bf480220a13576971a0623e69b2daf` (resolves in the fleet repo, absent from the lane); `HASH_ORPHAN` only fired for lane commits, so v2 `CLEAN`. Fix: new id `HASH_FOREIGN` when `!inLane && inFleet`, exempted when the same line names `fleet` (`:205-211`). *Integration constraint*: P2 runs cases without `--fleet`, so f8 must NOT be copied into `controls/receipt/` (there it is indistinguishable from `HASH_DEAD` and would fail its `expect`); the ratchet needs a probe change only the L1 can make. *P5 hazard*: a round-64 report citing a full fleet hash without the word `fleet` on that line will now read DRIFT.
- `K64R2CriticForgeV2-9` (medium) — **`inUrl` excused any hash that ended any URL path**: `f9-url-tail-dead-hash` cites dead `0123…4567` and appends `https://example.invalid/docs/0123…4567`; v2 `CLEAN`. Fix: only `…/(commit|commits|tree|blob)/<hash>` is the URL's hash (`:202-203`); the frozen `hash-in-url-skipped` arm (`/tree/`) still passes.
- `K64R2CriticForgeV2-10` (medium) — **placeholder vocabulary is still three spellings short of the round-60 failure mode**: `f10-placeholder-residual` leaves `TODO:`, `<<TIP>>`, `REPLACE_ME`; v2 `CLEAN`. Fix: `\bTODO\b|\bFIXME\b|\bREPLACE_?ME\b|<<[A-Za-z][A-Za-z0-9_]*>>` (`:52`); r60/r63 contain none of these tokens (checked), so P3 is unaffected.
- `K64R2CriticForgeV2-11` (medium, false positive) — **leading zeros are a different number**: `f11-leading-zeros-honest` is an *honest* report (`X9_HELD held=03/03` against receipt `held=3/3`); v2 `DRIFT TALLY_UNRECEIPTED` — the tool invents a lie. Fix: numeric `tallyKey`/`checks` (`num()`, `:104-105`), which also refuses a padded forgery.
- `K64R2CriticForgeV2-12` (medium) — **`checks=` is only read on the claim's own line**: `f12-checks-line-split` writes `X9_HELD held=3/3` then `checks=9`; the receipt says `checks=3`; v2 `CLEAN`. Fix: the same `claimLines()` fold covers `checks=` (draft `:88`).
- `K64R2CriticForgeV2-13` (medium) — **a 41-hex run is not a hash at all**: `f13-hash-41` cites `0123…4567f` (one character too long for a commit id); `{39,40}` plus word boundaries matched nothing, so v2 `CLEAN`. Fix: `{39,41}` and `HASH_DEAD (len=41)` (`:55`); a 64-hex sha256 still does not match (no 39..41 run inside it), and no historical report changed.
- `K64R2CriticForgeV2-14` (inherent, declared limit — reported, not patchable) — **a receipt the lane writes is trusted as written**. `cases-inherent/f14-handwritten-receipt/`: one `printf` into `close/` (`NEW64_HELD held=9/9 checks=9 rev=aaa rule=NEW64`) plus one report line makes a false claim `CLEAN` under v2 *and* the draft:
```
$ node <tool> --lane .../cases-inherent/f14-handwritten-receipt/lane --round 9 --report .../report.md --fleet /home/vgpnk/Projects/shokunin
REPORT_RECEIPT: CLEAN (round=9 rev=worktree bytes=452)          v2 exit 0
REPORT_RECEIPT: CLEAN (round=9 rev=worktree bytes=452)          draft exit 0
```
  No `expect` is shipped (CLEAN is not the sound verdict). *What binds a receipt to a counter run*: nothing in the tree. The frozen fixtures themselves carry `rev=aaa rule=X9` (non-resolving, three letters), so requiring `rev=<40-hex>` or a pinned `rule=` is copyable at equal cost; only counter-produced evidence (a signature or a counter-owned file the tool verifies) would bind it, which is outside this tool's contract. Cheapest in-lane forgery: 1 file + 1 line.

## Artifacts

- `.ufo/waves/round-64/build/K64R2CriticForgeV2/report-receipt-diff.v3.mjs` — full-file draft (contract `kumitate-report-receipt-diff-v3`, selftest 67/67).
- `.ufo/waves/round-64/build/K64R2CriticForgeV2/report-receipt-diff.v3.diff` — unified diff on `a/scripts/…` (190 lines, 92+/21-), `git apply -p1 --check` exit 0.
- `.ufo/waves/round-64/build/K64R2CriticForgeV2/cases/f1…f13/` — 13 controls in the frozen format, each with `expect` (sound verdict).
- `.ufo/waves/round-64/build/K64R2CriticForgeV2/cases-inherent/f14-handwritten-receipt/` — demonstration + `note.md`, deliberately no `expect`.
- Harnesses live in scratch only (`/tmp/kumitate-r64/K64R2CriticForgeV2/{gen,run}.mjs`, `controls.sh`, `sweep.sh`); the build dir adds **1** counted file (`.mjs`), no lane copies.

## Limits

- P5 not measured: the round-64 report does not exist (not mine to write). P1–P4 measured through the real frozen probe on a scratch clone; P3 through the real fleet blobs at `7b0581ed`/`8fd46e61`.
- The false-positive sweep covers the 12 reports whose round holds both a lane `base/` receipt and a fleet report (51–61, 63). Rounds 35–50 exist in the lane but hold no `base/`, round 62 has no lane round dir, and 1–34 are outside the lane: none were swept.
- Not killed and declared: a label separated by `-`/`.` (`X9-HELD`), a label in a script outside the confusable table, a label split across two lines, a claim carried by *another round's* receipt the report cites (target-vs-result), bare `held=9/10`, and f14.
- Contract bump to v3 is the L1's call: `corpus/QUALITY.md:1052` (finding-id list + contract string) and `corpus/README.md:191` name v2 and must move with it; `HASH_FOREIGN` is a new id.
- Tool installs/updates: none (node v24.21.0, git, diff, python3 pre-existing; no pacman/uv/npx).
