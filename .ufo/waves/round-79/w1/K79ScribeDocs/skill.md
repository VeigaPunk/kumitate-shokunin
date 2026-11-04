# SKILL.md integration draft — round 79

Axes: operability (capability deepening; integer held 9) and coverage:kimi-layer (composite derivation; clean integer held 10).

Replace the existing report-receipt-diff registry row, not add a second gate. Retain its existing tally, receipt, hash and structural checks. This is intended registration text, not execution evidence.

| Name | Kind | Entry / verdict / scope | Self-test | Pin / ownership |
|---|---|---|---|---|
| report-receipt-diff | gate | `node scripts/report-receipt-diff.mjs --lane DIR --round N --report FILE [--rev REV] [--fleet DIR]` — contract `kumitate-report-receipt-diff-v4` (round 79). Adds `POINTER_DEAD` for prose backtick path tokens with segments made only of ASCII letters/digits/dot/underscore/hyphen, slash separators, and final extension txt/json/jsonl/md/mjs/js/sh/py/html/tsv/csv/log; strips one trailing :N or :N-M. Scheme tokens are skipped; fenced spans excluded; duplicate tokens reported once in document order. Worktree bases: (1) lane root, (2) report directory, (3) lane/.ufo/waves/round-N/. With `--rev`, lane-relative candidates from those bases resolve in the selected git tree, never later worktree additions or external report-directory files. Full current-round receipt-path tokens retain `RECEIPT_MISSING`, with no duplicate `POINTER_DEAD`; relative close/ tokens remain eligible. Exit 0 `REPORT_RECEIPT: CLEAN`; 1 `REPORT_RECEIPT: DRIFT` plus finding lines; 2 `REPORT_RECEIPT: FAIL-CLOSED` for unreadable report/revision; 64 `usage:` for invalid arguments. Read-only lane/report inspection; fixtures only under selftest scratch. | `node scripts/report-receipt-diff.mjs --selftest` → exit 0 + `REPORT_RECEIPT_SELFTEST: PASS` | `pin.report-receipt-diff` in SCORECARD.md; owning lane kumitate. |

Pointer grammar (executor-confirmed intended bytes): prose backtick spans matching `^[A-Za-z0-9._-]+(/[A-Za-z0-9._-]+)*\.(txt|json|jsonl|md|mjs|js|sh|py|html|tsv|csv|log)$` after removing one trailing `:N` or `:N-M`; scheme tokens skipped; document-order deduplication. No fenced-code extraction. Under --rev each base is composed with resolve(base, ref), converted to a lane-relative name and tested against git-tree membership; an outside-lane report directory cannot admit an external file. Current-round full receipt-path tokens skip POINTER_DEAD; relative close/ tokens remain eligible.

## Verifiable checklist

Replace the old v3 suite item and the r78 provisional derivation item in place; do not create parallel conventions. Each bullet below carries exactly one parsed checklist command; the real pre-filing command is stated separately to avoid silently changing the checklist count.

- [ ] Report-vs-receipt v4 suite (round 79; retains receipt/tally/hash/structure checks and adds general pointer resolution) — `node scripts/report-receipt-diff.mjs --selftest` → exit 0 + `REPORT_RECEIPT_SELFTEST: PASS`
- [ ] Composite K derivation (round 79; both documentation and imported census-health factors, including the discriminating de-named-heading arm) — `node .ufo/waves/round-79/probe/probe79-c1.mjs --set c1 --lane .` → exit 0 + `C79_C1: HELD held=11/11`

Real pre-filing run, from lane root: `node scripts/report-receipt-diff.mjs --lane . --round N --report <round-report>` → accepted exit 0 + `REPORT_RECEIPT: CLEAN`. Set N and the actual report path; append `--rev <lane-tip>` for committed-tree evidence. A red finding is not an accepted clean exit. Run the actual round-79 report with `--round 79` and record argv, revision, stdout/stderr and exit in the round's close receipts.

## Decision-table replacement/addition

| When | Run / accept | Limit |
|---|---|---|
| Before filing any round report, after selecting the judged lane revision and report bytes | report-receipt-diff v4 with --lane ., --round N, --report the actual round report, and --rev when claiming committed evidence; accept only exit 0 with REPORT_RECEIPT: CLEAN; route exit 1 findings, diagnose exit 2, fix invocation at exit 64 | A pointer that exists is not a pointer that is honest: path resolution proves existence, not that the cited bytes support the sentence. It does not replace semantic review or the canonical judge. |
