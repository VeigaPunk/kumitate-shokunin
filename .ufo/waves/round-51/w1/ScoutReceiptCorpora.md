# ScoutReceiptCorpora — A4 nonce-ledger negative sweep

Seat `kumitate-r51.LikelyMosquito`. Axes: completeness of the prior corpus, evidence fidelity (command + sha256 + commit blob), alignment with frozen A4 (`attest51-probe.mjs:129-163`). No tools installed. No lane file edited except this report and `.ufo/waves/round-51/build/ScoutReceiptCorpora/`.

## Negative claim

**No committed file the A4 ledger scans contains a parseable `nonce` field.** Parseable means any of: a `{` line that `JSON.parse`s to an object with own property `nonce` (the reader at `attest51-probe.mjs:97-99`); a `"nonce"` JSON key anywhere; a whole-file JSON object/array with own property `nonce`; or a line matching `/^\s*["']?nonce["']?\s*[:=]\s*\S+/i`.

| set | files | parseable nonce | blob == `c90b9de9` |
|---|---:|---:|---|
| exact item `find` (`round-4{8,9,50}`) | 102 | 0 | yes |
| corrected `find` on `round-{48,49,50}` | 106 | 0 | yes |
| corrected `grep -rl nonce` on those three dirs | 4 | 0 | yes |
| item union (corrected find ∪ that grep) | 109 | 0 | yes |
| frozen A4 walk (all `.ufo/waves` except a directory named `round-51`, basename `/receipt\|ReRun\|L1-score/i`) | 162 | 0 | yes |
| unique paths hashed (A4 ∪ nonce-substring hits) | 168 | 0 | yes |

Full table, transcripts, and per-file sha256: `.ufo/waves/round-51/build/ScoutReceiptCorpora/corpora.md` (602 lines, sha256 `edf299694cf1b0bfab7284bba5c8b4148cf06ad895e451a0961c7d2697d432d4`). Machine copy: `inventory.json` beside it. One content digest was cross-checked against `sha256sum` (`.ufo/waves/round-35/falsify/RerunChecklists.md` = `35c51c5af157f9f626392a690214d8a9735792123e342506188974983797d8e7`).

Counter hashed: `.ufo/waves/round-51/probe/attest51-probe.mjs` sha256 `422e67b02d844fd1c3fe2d20c9211261460c452381a111b68b0d6bc22af53cd1`. Worktree blob of every hashed path equals `git rev-parse c90b9de94009b938fa19a089bfaa97df20b54f86:<path>` and the index. `git diff --name-status c90b9de9 HEAD -- .ufo/waves` has no receipt/ReRun/L1-score/nonce path. HEAD at check: `3ed875d34914560d3e30ee3e80bec7fa9b9e8666` (descendant of the frozen base). Plan: `.ufo/waves/round-51/plan.md:50-66` (A4 sentence at line 61).

## Sweeps (a negative claim carries them)

Exact item brace — bash expands `round-4{8,9,50}` to `round-48`, `round-49`, `round-450`:

```
find .../round-4{8,9,50} -type f \( -name '*eceipt*' -o -name 'ReRun*.txt' -o -name 'L1-score*.txt' \)
```

stderr: `round-450: No such file or directory`. 102 paths. Misses the four round-50 name hits.

```
grep -rl 'nonce' .../round-4{8,9,50}
```

stderr: same missing `round-450`. Only hit: `.ufo/waves/round-48/r48/SentinelReceipt.md`.

Corrected (operative) name find, 106 paths:

```
find .../round-{48,49,50} -type f \( -name '*eceipt*' -o -name 'ReRun*.txt' -o -name 'L1-score*.txt' \)
```

Corrected nonce grep, 4 paths:

```
grep -rl 'nonce' .../round-48 .../round-49 .../round-50
```

`SentinelReceipt.md`, `round-50/plan.md`, `round-50/r50/CritPlan.md`, `round-50/r50/SimplifierGuard.md`. Case-insensitive `grep -rli` adds nothing in these dirs.

All-waves nonce substring (`grep -rl 'nonce' .ufo/waves --exclude-dir=round-51`), 7 paths. The three not in the corrected grep are prose, not fields:

- `.ufo/waves/round-36/build/ScoutR7Members.md` — `create_0600_tmp_creates_private_new_file_with_nonce_name`
- `.ufo/waves/round-45/a2-control/ReopenS027.md` — "per-request nonce"
- `.ufo/waves/round-45/build/CtlQuoteFabricated.md` — "per-request nonce"

`SentinelReceipt.md:3` says "run nonce" in prose. Round-50 hits are `/tmp/<nonce>` placeholders (`plan.md:60`, `CritPlan.md:80,94-95`, `SimplifierGuard.md:47-48`).

A4 walk counts (0 = walked, no basename match; `round-51` = not descended): round-35:7, 36:0, 37:0, 38:0, 39:0, 40:6, 41:3, 42:5, 43:7, 44:12, 45:1, 46:1, 47:0, 48:113, 49:3, 50:4, 51:excluded. Total 162. The item `find` is narrower (case-sensitive, `ReRun*.txt` / `L1-score*.txt` prefixes, rounds 48–50 only). All 106 corrected-find files are inside the 162. The other 56 are what A4 opens beyond that `find` (case-insensitive `ReRun`/`rerun` any extension, and rounds 35 and 40–46).

`git ls-files -z` basename match outside `.ufo/waves`:

- `.ufo/rounds/round-33/receipt-prerequisites.json` — 1204 bytes, sha256 `dc8db4364b8faeaa966abf2b2d206181a94a0a6ab72e65e7920b0a41d9e918a3`, blob at base matches. JSON keys have no `nonce`; `receiptMinted` is false. A4 does not open it (walk root is `.ufo/waves`).
- `scripts/counter-rerun.mjs` — 28410 bytes, sha256 `c002523fc39b521f57a3ee86c3ff154e06aea8ccd6738501138460141abc369b`. Regex false friend (`rerun` in the basename). No `nonce` substring. Not a receipt.

## Observations (not counter edits)

1. **Item brace is wrong.** `round-4{8,9,50}` never names `round-50` and errors on `round-450`. The four dropped paths are `.ufo/waves/round-50/ReRunB49-{1,2,3}.txt` and `.ufo/waves/round-50/r50/MutReceiptSyntax.md`. Corrected sweep is in the artifact. Not a defect in the frozen probe.

2. **Plan parenthetical under-describes A4.** `plan.md:61` says the prior corpus is "r49/r50 receipt files". The probe comment at line 139 says "round-4*/5*". The code at lines 141–152 walks every `.ufo/waves` file outside a `round-51` directory whose basename matches `/receipt|ReRun|L1-score/i` — 162 files, not the r49/r50 pair. The code is stricter than the plan sentence (fail-closed relative to that sentence). Proposed minimal plan fix, if the L1 wants the sentence to match the counter: replace the parenthetical with "every `.ufo/waves` file outside `round-51` whose basename matches `/receipt|ReRun|L1-score/i`". Frozen files were not edited.

3. **Three round-49 name hits are one byte string.** `cmp` equal, 484 bytes, sha256 `03a258d626b1af43a8c2f55f25429d169c2cde6d7366620f10e804fcee9f9488`: `r49/L1-score-0526f898.txt`, `r49/ReRunCounter49-2.txt`, `r49/ReRunCounter49-3.txt`. No nonce field in them. Inventory A rows 100–102.

4. **A4 collides on substring, not on a field.** `attest51-probe.mjs:155-160` rejects a new nonce if those bytes appear anywhere in a prior walked file. This sweep found no nonce field to forbid. It did not enumerate incidental hex, so a future 128-bit nonce can still collide with unrelated text. That is outside this item.

## Unresolved

The receipt-attest tool and the round-51 receipts are not in the tree yet, so this seat did not execute A4. The collision set above is the set the frozen walk will open at `<rev>` once those receipts exist, provided no new prior-round receipt file is committed after `c90b9de9`.
