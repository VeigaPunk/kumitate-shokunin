# Receipt-tool forgery controls — seat K64ExecReceiptForge (round 64, wave 1)

20 cases in the frozen control format (`report.md`, `lane/`, `expect`, plus a `note.md` naming the lie).
Every report here is false to a reader; `expect` is what a **sound** tool must print (line 1 exit code,
line 2 the sorted finding ids or `CLEAN`). Measured on the first tool build
(`scripts/report-receipt-diff.mjs` @ `dd1a3e6f`): **20/20 read CLEAN** (`check.mjs` → `fails=20`, every
`forge/*` line). Measured on `report-receipt-diff.v2.mjs`: **20/20 exact**, and the 16 frozen controls,
the P3 arms and the selftest are unchanged-clean.

| case | the lie | sound verdict | cheapest change that kills it (v2) |
|---|---|---|---|
| k1-tally-spaced-eq | `X9_HELD held = 3 / 3`, receipt says 1/3 | TALLY_UNRECEIPTED | tally parsed on `scan()` (spaces around `=`/`/` normalised away) |
| k2-tally-lowercase-label | `x9_HELD held=3/3` | TALLY_UNRECEIPTED | `TALLY` gains `i`, `tallyKey()` upper-cases |
| k3-tally-table-cell | `\| X9_HELD \| held=3/3 \|` | TALLY_UNRECEIPTED | `scan()` maps `\|` → space |
| k4-tally-zero-width | `X9_\u200bHELD held=3/3` | TALLY_UNRECEIPTED | `scan()` strips U+200B–200F/U+2060/U+FEFF |
| k5-hash-uppercase-dead | dead hash in upper case | HASH_DEAD | `HASH` = `[0-9a-fA-F]{39,40}`, lower-cased before git |
| k6-hash-39-digits | dead hash truncated to 39 hex | HASH_DEAD | same line (`{39,40}`) |
| k7-placeholder-braces | `{{MEASURED_REV}}` | PLACEHOLDER | `PLACEHOLDER` += `\{\{[A-Za-z][A-Za-z0-9_]*\}\}` |
| k8-placeholder-angle-measured | `<measured>` | PLACEHOLDER | `PLACEHOLDER` += `<(?:measured\|…\|todo)>` (`<tip>/<lane>/<rev>` stay legal) |
| k9-placeholder-prose | "to be filled" | PLACEHOLDER | `PLACEHOLDER` += `\bto be filled\b` |
| k10-placeholder-xxxx | `XXXX` | PLACEHOLDER | `PLACEHOLDER` += `\bX{4,}\b` |
| k11-placeholder-lowercase-token | `__measured__` | PLACEHOLDER | `PLACEHOLDER` head `[A-Za-z]`, `{1,}`, `i` |
| k12-sections-in-fence | all six headings inside one fence | SECTION_MISSING,SHONEN_COUNT | `REQUIRED` tested on `unfence(text)` |
| k13-shonen-in-fence | the SHONEN block quoted in a fence | SECTION_MISSING,SHONEN_COUNT | same `prose` copy for the SHONEN heading |
| k14-receipt-path-escape | cite `close/p-tip.txt/../../../round-8/close/old.txt` | RECEIPT_MISSING | `RECEIPT_PATH` class gains `/`; `isPath()` rejects `..`/dirs |
| k15-receipt-symlink | tip receipt is a symlink out of the lane | RECEIPT_MISSING,TALLY_UNRECEIPTED | `lstatSync().isFile()` (worktree), mode `120000` skip (rev) |
| k16-receipt-empty | a zero-byte receipt cited as confirmation | RECEIPT_EMPTY | cited receipt with `.trim()===''` |
| k17-tally-base-only | tip HELD whose only carrier is a base plan-target line | TALLY_UNRECEIPTED | claims bound to the receipts their own line cites |
| k18-tally-cited-mismatch | claim carried by a superseded receipt, cited one says 1/3 | TALLY_UNRECEIPTED | same citation binding |
| k19-shonen-boxes-outside | SHONEN empty, four boxes under `## Appendix` | SHONEN_COUNT | boxes counted inside the SHONEN section only |
| k20-tally-checks-mismatch | `held=3/3 checks=9`, receipt says `checks=3` | TALLY_CHECKS_MISMATCH | compare the `checks=` that follows the tally |

Run one case:

```
node scripts/report-receipt-diff.mjs --lane <case>/lane --round 9 --report <case>/report.md
```

`k15` ships a real symlink (`lane/.ufo/waves/round-9/close/p-tip.txt` → `../../../../outside/tip.txt`); git
archives it as a symlink, so the probe's `git archive` copy keeps the forgery live.
