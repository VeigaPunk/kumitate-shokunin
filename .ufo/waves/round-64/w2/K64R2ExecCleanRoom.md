VERDICT: A clean-room second implementation (clean.py, written from the contract header and Q61 only) agrees with `scripts/report-receipt-diff.mjs` v2 on 90/99 differential cases under the contract's literal words and 99/99 once five underdetermined readings are resolved the tool's way; the 9 residual disagreements are four spec ambiguities (zero-width tallies, split table-cell tallies, box-lines-vs-boxes, URL-path hashes), plus one real tool bug (`bytes=` counts decoded UTF-8, not file bytes) and one bug the differential found in my own code.

## Evidence

Contract sources read: `scripts/report-receipt-diff.mjs:1-35` (header only; the code was not read) and `corpus/QUALITY.md:1049-1056` (Q61). Implementation: `build/K64R2ExecCleanRoom/clean.py` (python3, stdlib, `git ls-tree -r -z` + `git cat-file blob` at `--rev`, worktree otherwise; identical CLI and exit codes).

```
$ node scripts/report-receipt-diff.mjs --selftest
REPORT_RECEIPT_SELFTEST: PASS (52/52)                                    exit 0

$ cd .ufo/waves/round-64/build/K64R2ExecCleanRoom
$ python3 diffharness.py cases-controls.tsv out-controls.tsv     # 37 controls, --round 9 (no --rev)
AGREEMENT: 35/37
$ python3 diffharness.py cases-real.tsv out-real.tsv             # r40..r63, --rev 2ed8a5f8 --fleet /home/vgpnk/Projects/shokunin
AGREEMENT: 20/24
$ python3 diffharness.py cases-mut.tsv out-mut.tsv               # 38 generated mutations of c0-honest (mutator.py)
AGREEMENT: 35/38
$ python3 diffharness.py cases-controls-relaxed.tsv ...          # clean.py --tally relaxed
AGREEMENT: 37/37
$ python3 diffharness.py cases-real-toolward.tsv ...             # clean.py --boxes boxes --hash url
AGREEMENT: 24/24
$ python3 diffharness.py cases-mut-toolward.tsv ...              # clean.py --tally relaxed --boxes boxes
AGREEMENT: 38/38
$ python3 diffharness.py cases-real-general-angle.tsv ...        # clean.py --angle general (my first draft reading)
AGREEMENT: 14/24
```
Totals: strict 90/99 (35+20+35), tool-ward 99/99. The 9 strict disagreements, each traced in Findings:
k4 (F1), k3 + m05 (F2), r48 + m33 (F3), r54 + r55 + r56 (F4), m06 (F1). Exit codes match on all four fail-closed arms: usage 64, unreadable report 2, unresolvable `--rev` 2, and both report `RECEIPT_MISSING` for a symlinked receipt committed at a rev (`git ls-tree` mode 120000) and for a glob naming an empty file (both CLEAN).

Representative disagreements, verbatim:
```
k3-tally-table-cell   tool exit 1: REPORT_RECEIPT: DRIFT TALLY_UNRECEIPTED (round=9 rev=worktree bytes=399)
                                TALLY_UNRECEIPTED X9_HELD held=3/3
                      clean exit 0: REPORT_RECEIPT: CLEAN (round=9 rev=worktree bytes=399)
k4-tally-zero-width   tool exit 1: REPORT_RECEIPT: DRIFT TALLY_UNRECEIPTED (round=9 rev=worktree bytes=392)
                      clean exit 0: REPORT_RECEIPT: CLEAN (round=9 rev=worktree bytes=392)
r48                   tool exit 0: REPORT_RECEIPT: CLEAN (round=48 rev=2ed8a5f8b133… bytes=8722)
                      clean exit 1: SHONEN_COUNT SHONEN section has 3 box lines (lines)
r54                   tool exit 0: REPORT_RECEIPT: CLEAN (round=54 rev=2ed8a5f8b133… bytes=10972)
                      clean exit 1: HASH_DEAD 45c35e40c46166dc726ccc52f5d27f40f2449f99 resolves in neither repo
m05-tally-table-split-cell / m06-tally-zero-width / m33-shonen-four-boxes-three-lines: same three classes.
```

`bytes=` defect (probe under `/tmp/kumitate-r64/K64R2ExecCleanRoom/probe/`, lane copied from `c0-honest`):
```
$ python3 -c "b=open('base.md','rb').read();open('w1-one-bad-byte.md','wb').write(b.replace(b'expansion improved.',b'expansion \xff improved.'))"
$ wc -c < w1-one-bad-byte.md
392
$ node scripts/report-receipt-diff.mjs --lane lane --round 9 --report w1-one-bad-byte.md
REPORT_RECEIPT: CLEAN (round=9 rev=worktree bytes=394)                   exit 0
$ wc -c < v6-invalid-utf8.md ; node … --report v6-invalid-utf8.md
393
REPORT_RECEIPT: CLEAN (round=9 rev=worktree bytes=397)                   exit 0
```

## Findings

1. **K64R2ExecCleanRoom-1 — AMBIGUITY, high. Zero-width characters in a tally label are not covered by "spacing-insensitive".** Attacks: TALLY_UNRECEIPTED. `X9_\u200bHELD held=4/3` (receipt carries `held=3/3`) is DRIFT for the tool and CLEAN for a literal reader, i.e. a lie passes my contract-only implementation. Reproduce: `node scripts/report-receipt-diff.mjs --lane .ufo/waves/round-64/controls/receipt/k4-tally-zero-width/lane --round 9 --report .ufo/waves/round-64/controls/receipt/k4-tally-zero-width/report.md` (DRIFT) vs `python3 build/K64R2ExecCleanRoom/clean.py <same>` (CLEAN). Contract sentence: "a labelled verdict `<LABEL>_HELD|UNMET held=x/y` (case- and spacing-insensitive, table cells included)". Fix text: append "case-insensitive, and whitespace-insensitive after removing U+200B–U+200D and U+FEFF".
2. **K64R2ExecCleanRoom-2 — AMBIGUITY, high. A tally split across table cells is one claim for the tool, two tokens for a literal reader.** Attacks: TALLY_UNRECEIPTED. `| C1 | X9_HELD | held=3/3 |` where the receipt carries `1/3`. Reproduce: case `k3-tally-table-cell` (same command shape as finding 1). Contract sentence: "(case- and spacing-insensitive, table cells included)" — "table cells included" only says cells are scanned, not that a cell boundary is spacing. Fix text: "(case- and spacing-insensitive; a table cell boundary `|` is treated as spacing, and table cells included)".
3. **K64R2ExecCleanRoom-3 — AMBIGUITY, medium. `SHONEN_COUNT` counts boxes, the contract says "box lines".** Attacks: SHONEN_COUNT. r48's SHONEN section has 3 lines carrying 4 boxes (`- [ ] c — [ ] d`); the tool reads CLEAN, the contract's words read DRIFT. Reproduce: `node scripts/report-receipt-diff.mjs --lane . --round 48 --report build/K64ExecReceiptRealRun/r48.md --rev 2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8 --fleet /home/vgpnk/Projects/shokunin` (exit 0) vs `python3 build/K64R2ExecCleanRoom/clean.py …` (`SHONEN_COUNT`, exit 1); mutation `m33-shonen-four-boxes-three-lines` isolates it. Contract sentence: "or fewer than 4 box lines follow it inside its own section". Fix text: "or fewer than 4 SHONEN boxes (`- [ ]`/`- [x]`/`- [~]`, optionally backticked; several boxes may share a line) follow it inside its own section".
4. **K64R2ExecCleanRoom-4 — AMBIGUITY, medium. A 40-hex hash that is a URL path component is exempt; the contract says any 39/40-hex hash that resolves in neither repo is dead.** Attacks: HASH_DEAD. Three real reports (r54:48, r55:121, r56:127 cite `github.com/can1357/oh-my-pi/tree/45c35e40…`) read CLEAN; my literal reading flags HASH_DEAD. Reproduce: the r54 command in Evidence. Contract sentence: "a 39- or 40-hex hash (either case) that resolves in neither the lane repo nor the fleet repo". Fix text: "…a 39- or 40-hex hash (either case) that is not a path component of a URL and resolves in neither the lane repo nor the fleet repo (a foreign repository's commit is a declared limit, not a finding)".
5. **K64R2ExecCleanRoom-5 — AMBIGUITY, medium (reading-direction). Angle-bracket placeholders other than `<measured>`.** Attacks: PLACEHOLDER. The tool flags only `<measured>` (any case, backticked or not) and reads `<path>`/`<hash>`/`<subdir>`/`<clone>`/`<dirs>` CLEAN; reading the exclusion clause as licensing a general rule makes 6 more real reports DRIFT (r41, r45, r50, r57, r58, r61) and drops agreement to 14/24. Reproduce: `python3 build/K64R2ExecCleanRoom/clean.py --lane . --round 45 --report build/K64ExecReceiptRealRun/r45.md --rev 2ed8a5f8… --fleet /home/vgpnk/Projects/shokunin --angle general` → `PLACEHOLDER angle token '<hash>' at line 6`. Contract sentence: "`__name__`, `{{NAME}}`, `XXXX`, "to be filled", `<measured>`, `LANE_HASH`, `TBD`; the command-template arguments `<tip>`/`<lane>`/`<rev>` are not flagged". Fix text: "…`<measured>` (case-insensitive); any other angle-bracket word is a command argument and is not flagged (the `<tip>`/`<lane>`/`<rev>` carve-out is an instance of this)".
6. **K64R2ExecCleanRoom-6 — TOOL BUG, low (no id change). The verdict line's `bytes=` is the UTF-8 length of the lossily decoded text, not the report's byte length.** Attacks: the tool's own reported number (the surface the tool exists to police). A 392-byte report with one 0xFF prints `bytes=394`; a 393-byte report with two prints `bytes=397` (each invalid byte becomes U+FFFD, +2). Reproduce: the `w1-one-bad-byte.md` command in Evidence. Fix (proposed as text only, since I did not read the code to emit a real diff): take the count from the read buffer (`readFileSync(...).length`, or `Buffer.byteLength(raw)`) before any `toString('utf8')`; never from the decoded string.
7. **K64R2ExecCleanRoom-7 — AMBIGUITY, low. `XXXX`/`TBD` case sensitivity.** Attacks: PLACEHOLDER. `xxxx` and `tbd` are PLACEHOLDER for the tool, CLEAN for the contract's upper-case tokens. Reproduce: probe `s3-xxxx-lower`, `s5-tbd-lower` (`node … --report /tmp/kumitate-r64/K64R2ExecCleanRoom/probe/s3-xxxx-lower.md`). Contract sentence: "`XXXX`, … `TBD`". Fix text: "the token list is matched case-insensitively".
8. **K64R2ExecCleanRoom-8 — AMBIGUITY, low. Hash token boundary.** Attacks: HASH_DEAD. `x0badc0de…` (a 40-hex run inside a longer alphanumeric token) is CLEAN for the tool, HASH_DEAD for my hex-only boundary; the tool's non-alphanumeric boundary is the better reading. Reproduce: probe `s13-hash-inside-word`. Fix text: "a maximal run of 39–40 hex digits not adjacent to any alphanumeric character".
9. **K64R2ExecCleanRoom-9 — AMBIGUITY, low. The (label, x, y) pair is compared textually, not numerically.** Attacks: TALLY_UNRECEIPTED. `held=03/03` against a receipt's `held=3/3` is DRIFT for the tool, CLEAN for my numeric comparison. Reproduce: probe `v2-leading-zero`. Fix text: "the pair is compared as the exact digit strings printed, so leading zeros are not normalised".
10. **K64R2ExecCleanRoom-10 — BUG IN MINE (found by this differential, fixed before the counts above).** My first run reported `r54: TALLY_CHECKS_MISMATCH DOCTRINE54_HELD held=5/5 checks=1` because I paired the first `checks=` on a line with every claim on it; r54:38 carries two claims (`…_UNMET held=0/1 checks=1` then `…_HELD held=5/5 checks=5`). The tool was right; `clean.py` now pairs the nearest `checks=` *after* the claim. Recorded because a second implementation is only evidence if its own failures are on the record.

## Artifacts
- `build/K64R2ExecCleanRoom/clean.py` — the clean-room implementation (`--angle literal|general`, `--boxes lines|boxes`, `--tally strict|relaxed`, `--hash literal|url`; defaults are the contract's literal words).
- `build/K64R2ExecCleanRoom/diffharness.py` — differential runner (id sets + exit codes, TSV out).
- `build/K64R2ExecCleanRoom/mutator.py` — 38-case mutation generator: 34 single-edit report mutations (m01–m34) plus 4 hash arms (m35 ancestor-clean, m36 orphan, m37 39-hex prefix-clean, m38 short-prefix) run against a `mktemp -d` git fixture whose `rev-parse --show-toplevel` was asserted equal to the fixture root before the first commit.
- `build/K64R2ExecCleanRoom/cases-*.tsv`, `out-*.tsv` — every case list and every per-case `tool_exit/tool_ids/clean_exit/clean_ids/verdict` row (7 case files, 7 result files).
- `/tmp/kumitate-r64/K64R2ExecCleanRoom/{probe,mut,gitprobe.*}` — probes and mutant trees (scratch; no lane copy in the build dir; 3 `.py` files added to the lane tree).

## Limits
- I did not read the tool's code (contract-only clean room), so where we disagree I can only report the tool's *observed* behaviour on probes, not its rule; the "tool bug" in finding 6 is inferred from two byte counts and one controlled probe, not from the source.
- The 24 real reports are the wave-1 copies in `build/K64ExecReceiptRealRun`, run at `--rev 2ed8a5f8…` with `--fleet /home/vgpnk/Projects/shokunin`; I did not re-extract them from their own fleet commits.
- Mutations are single-edit (38 cases, 4 of them hash arms) and generated by me: they cover the ids but not combinations (a tally lie inside a fenced block inside a table, etc.); multi-lie reports are only represented by r60-shape `c12`.
- I did not test `--rev` against a bare worktree with uncommitted receipts, nor a receipt larger than memory, nor a report >1 MiB.
- HASH_ORPHAN was exercised only on my own git fixture (m36); the lane itself has no non-ancestor object I could cite without inventing one.
- I ran no build/lint/test gate: per the wave rule the parent owns post-integration verification.
