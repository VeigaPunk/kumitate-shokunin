#!/usr/bin/env bash
# repro-r64.sh — reproducible proofs of top open forgeries against R64 & report-receipt-diff.mjs
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../../.." && pwd)"

echo "=== R64 Repro 1: Bare Unlabelled Tally Bypass ==="
node -e '
import { diffReport } from "'"$DIR"'/scripts/report-receipt-diff.mjs";
const report = `## Work performed\nx\n## Landed changes\nx\n## Before → after measurements\nUnreceipted lie: held=10/10\n## Sources & frontier\nx\n## Trend verdicts\nx\n## SHONEN\n- [~] a\n- [~] b\n- [~] c\n- [~] d\n`;
const f = diffReport({ lane: "'"$DIR"'", round: 64, reportText: report });
console.log("Unlabelled tally findings (want 0):", f.length);
'

echo "=== R64 Repro 2: Colon Syntax Tally Bypass ==="
node -e '
import { diffReport } from "'"$DIR"'/scripts/report-receipt-diff.mjs";
const report = `## Work performed\nx\n## Landed changes\nx\n## Before → after measurements\nMY_CLAIM_HELD: held=10/10\n## Sources & frontier\nx\n## Trend verdicts\nx\n## SHONEN\n- [~] a\n- [~] b\n- [~] c\n- [~] d\n`;
const f = diffReport({ lane: "'"$DIR"'", round: 64, reportText: report });
console.log("Colon tally findings (want 0):", f.length);
'

echo "=== R64 Repro 3: Alternative Verb Tally Bypass ==="
node -e '
import { diffReport } from "'"$DIR"'/scripts/report-receipt-diff.mjs";
const report = `## Work performed\nx\n## Landed changes\nx\n## Before → after measurements\nMY_CLAIM_PASSED held=10/10\n## Sources & frontier\nx\n## Trend verdicts\nx\n## SHONEN\n- [~] a\n- [~] b\n- [~] c\n- [~] d\n`;
const f = diffReport({ lane: "'"$DIR"'", round: 64, reportText: report });
console.log("Alternative verb findings (want 0):", f.length);
'

echo "=== R64 Repro 4: False Tally Match on Failing Receipt Line ==="
node -e '
import { diffReport } from "'"$DIR"'/scripts/report-receipt-diff.mjs";
import fs from "node:fs"; import { tmpdir } from "node:os"; import { join } from "node:path";
const d = fs.mkdtempSync(join(tmpdir(), "rrd-fail."));
fs.mkdirSync(join(d, ".ufo/waves/round-64/close"), { recursive: true });
fs.writeFileSync(join(d, ".ufo/waves/round-64/close/r.txt"), "ERROR: FAKE_HELD held=10/10 was wanted but failed with 0\n");
const report = `## Work performed\nx\n## Landed changes\nx\n## Before → after measurements\nFAKE_HELD held=10/10\n## Sources & frontier\nx\n## Trend verdicts\nx\n## SHONEN\n- [~] a\n- [~] b\n- [~] c\n- [~] d\n`;
const f = diffReport({ lane: d, round: 64, reportText: report });
console.log("False match findings (want 0):", f.length);
fs.rmSync(d, { recursive: true, force: true });
'

echo "=== R64 Repro 5: Short Dead Hash Bypass ==="
node -e '
import { diffReport } from "'"$DIR"'/scripts/report-receipt-diff.mjs";
const report = `## Work performed\nx\n## Landed changes\nLanded commit deadbeef (dead hash)\n## Before → after measurements\nx\n## Sources & frontier\nx\n## Trend verdicts\nx\n## SHONEN\n- [~] a\n- [~] b\n- [~] c\n- [~] d\n`;
const f = diffReport({ lane: "'"$DIR"'", round: 64, reportText: report });
console.log("Short dead hash findings (want 0):", f.length);
'

echo "=== R64 Repro 6: Out-of-Scope Receipt Citation Bypass ==="
node -e '
import { diffReport } from "'"$DIR"'/scripts/report-receipt-diff.mjs";
const report = `## Work performed\nx\n## Landed changes\nx\n## Before → after measurements\nSee .ufo/waves/round-63/close/nonexistent.txt\n## Sources & frontier\nx\n## Trend verdicts\nx\n## SHONEN\n- [~] a\n- [~] b\n- [~] c\n- [~] d\n`;
const f = diffReport({ lane: "'"$DIR"'", round: 64, reportText: report });
console.log("Out-of-scope receipt findings (want 0):", f.length);
'

echo "=== R64 Repro 7: Unflagged Template Placeholders ==="
node -e '
import { diffReport } from "'"$DIR"'/scripts/report-receipt-diff.mjs";
const report = `## Work performed\nx\n## Landed changes\nx\n## Before → after measurements\nTODO: measure this\nFIXME: broken\n__A__\n## Sources & frontier\nx\n## Trend verdicts\nx\n## SHONEN\n- [~] a\n- [~] b\n- [~] c\n- [~] d\n`;
const f = diffReport({ lane: "'"$DIR"'", round: 64, reportText: report });
console.log("Unflagged placeholder findings (want 0):", f.length);
'
