# ReviewReceiptCanon — canonical receipt copies

Seat: `kumitate-r48-ReviewReceiptCanon` (reviewer). Scope: byte-compare ScribeReceipts'
copies under `.ufo/waves/round-48/r48/` against the attempt-1 originals in
`.ufo/waves/round-48/build/` and confirm nothing was normalized silently.
Reviewed 2026-10-23 ~15:2x -03 against r48-plan/r48-taskCall seat contract
(5 expected copies: `a2-rerun-{1,2,3}.txt`, `checklist-base-{1,2}.txt`).

## Verdict per file

`cmp -s build/<orig> r48/ScribeReceipts-<copy>` run from the lane root; `cmp -s` exits 0
(silent) iff the pair is byte-identical. sha256 shown once per pair — both sides hash to it.

| build/ original | r48/ copy | size (bytes, both) | cmp -s | sha256 (both) | verdict |
|---|---|---|---|---|---|
| `a2-rerun-1.txt` | `ScribeReceipts-a2-rerun-1.txt` | 1293 | identical | `2aafd27d8440a38c15246fc3dab456da3fbcb2be349833d23f589efa8aa79630` | CANONICAL |
| `a2-rerun-2.txt` | `ScribeReceipts-a2-rerun-2.txt` | 1269 | identical | `e77a919d299bbe58e490331bccf72c40c375220b0fa02e78362c2ef58016f1ba` | CANONICAL |
| `a2-rerun-3.txt` | `ScribeReceipts-a2-rerun-3.txt` | 1267 | identical | `9040c45ec356ebba9a501a62d095e3a9b7234d51c36684d0a5c1449202c63507` | CANONICAL |
| `checklist-base-1.txt` | `ScribeReceipts-checklist-base-1.txt` | 5681 | identical | `6ec4a0962fa57ac3db463437a874740f0fabbd2460e97a3c559201e365538d7d` | CANONICAL |
| `checklist-base-2.txt` | `ScribeReceipts-checklist-base-2.txt` | 5675 | identical | `294d9b1ee3031bdd5b7821d906ad7a5696904438cff3fbc0fb38a8de45f8c924` | CANONICAL |

## Findings

- **No defects.** All 5/5 copies are byte-exact: `cmp -s` silent on every pair, and each
  pair reduces to one sha256. No normalization (line-ending, whitespace, trailing-newline,
  re-wrap) was applied. The copies are canonical duplicates of the attempt-1 evidence.
- Seat coverage complete: the seat contract (r48-taskCall.json) names exactly these five
  copies; all five exist in `r48/`, prefixed `ScribeReceipts-` as required. The seat's own
  report `r48/ScribeReceipts.md` claims `cmp -s` 0 on all five pairs — this review
  independently reproduced that result.
- Provenance sanity: build originals timestamped 08:56–09:00 (attempt 1); r48 copies
  15:23 (attempt 2). Copy direction is build → r48 as specified.
- Out of scope for this item: semantic correctness of the receipt contents (the seat's
  own R47-1 reproduce readings 3/5,3/5,4/5 and the checklist FAILs are evidence payload,
  reviewed elsewhere); no other `r48/` files are ScribeReceipts deliverables.
- **Residual risk:** none identified for byte-fidelity. If additional receipt copies are
  requested later (e.g. control receipts), they need the same cmp pass; only these five
  were in the seat's contract at review time.
