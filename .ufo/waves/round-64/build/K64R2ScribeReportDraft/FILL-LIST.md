# FILL LIST — what the L1 must do before filing `report-draft.md`

Draft: `.ufo/waves/round-64/build/K64R2ScribeReportDraft/report-draft.md` (target: `/home/vgpnk/Projects/shokunin/.ufo/reports/round-64/kumitate.md`).
Measured at lane `2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8`. Every number in the draft is either a committed receipt, a command I ran, or
the literal word `UNMEASURED`.

## 1. Close receipts the draft cites (commit them in the lane at the filing revision M)

Copy `close-drafts/*.txt` to `.ufo/waves/round-64/close/` (names must stay identical — the tool binds by exact path), or regenerate each with
the command its first line records:

| file | content source |
|---|---|
| `receipt64-probe-at-2ed8a5f8.txt` | `node .ufo/waves/round-64/probe/receipt64-probe.mjs <lane> 2ed8a5f8…` (held=4/5, P5 MISS) |
| `jj64-probe-at-2ed8a5f8.txt` | `node .ufo/waves/round-64/probe/jj64-probe.mjs <lane> 2ed8a5f8…` (held=8/8) |
| `p3-real-reports.txt` | the two real-report runs (r60 DRIFT / r63 CLEAN) |
| `tool-and-controls.txt` | selftest 52/52, 37 controls, the id list, `COUNTER_PINS: CLEAN pins=25` |
| `demo-after.txt` | `bash scripts/jj-seat-demo.sh` (21 keys, exit 0) |
| `census-after.txt` | `sources-census.sh validate --root … kumitate` |
| `readme-map-after.txt` | `node scripts/readme-map.mjs` |
| `proxy-after.txt` | `node scripts/proxy-check.mjs` on the archive (DRIFT, exit 1) |
| `plan-before-ready-after.txt` | `--round 64` (PASS) and `PBR_MAP_FROM=64 … --rev dd1a3e6f` (FAIL MAP_DRIFT) |

## 2. The one line that must change after the final measurement

Draft line ~95 states the measured state honestly:

`RECEIPT64_UNMET held=4/5 checks=5 rev=2ed8a5f8… rule=R64 | P5 MISS report-not-given`, receipt
`.ufo/waves/round-64/close/receipt64-probe-at-2ed8a5f8.txt`.

Once the report exists and the close receipts are committed, re-run the counter with `--report <filed report>` at M. Replace that line with the
new verdict line verbatim (label `RECEIPT64_HELD`, `held=5/5`, `checks=5`, the new rev, `rule=R64`) and write it to
`close/receipt64-probe-at-M.txt`, **updating the cited path on the same line** (the tool scopes a tally to the receipts named on its own line).
Leave the base line (`held=0/5`, `base/receipt64-base.txt`) untouched.

## 3. Wave-2 and filing facts the draft marks UNMEASURED (fill from `w2-results.json`)

- wave-2 seat count, dead seats, per-seat statuses and answering models (the draft currently: 39 dispatched, 5 of 39 reports on disk, deaths
  UNMEASURED; `w1-results.json` has no status field at all — 41 entries, `output: null`, kernel-restart note).
- the round-64 LOG entry install commit (draft `build/K64ScribeLogSkill/log-entry.md`), the SCORECARD section (draft
  `build/K64ScribeScorecard/scorecard-r64.md`), the SKILL rows/checklist items (draft `build/K64ScribeLogSkill/skill-rows.md`,
  `checklist-item.md`), and the push of both repos.
- the wave-2 corrections to S198/S199/S200, the lesson `## Gate` cells and QUALITY rows (drafts under `w2/`, `build/K64R2*`).

## 4. Maintenance the plan promises and the draft reports as red

`proxy-check` on the archive of `2ed8a5f8` is DRIFT (exit 1): `A` 257 → 514 (255 of the 257 new runnable files are wave build copies under
`.ufo/waves/`), `C2`/`C2_total` 153 → 156, `GATE_PIN_DRIFT pin.plan-before-ready`, `PIN_UNPINNED scripts/report-receipt-diff.mjs`. Repair
(pin `A` at the archive count or exclude `.ufo/waves/*/build/**`, re-pin the gate, pin the new tool), then append the repaired reading with its
commit; keep the `2ed8a5f8` reading as the historical measurement. Do not delete the `A` finding: it is what makes the next round's copies visible.

## 5. CLEAN verification of this draft (how I checked it, how to re-check)

The draft reads CLEAN in worktree mode against the committed base receipts plus the drafted close receipts, and DRIFT in `--rev` mode **only**
because the close receipts are not committed yet:

```
$ C=$(mktemp -d)/cl && git clone -q --shared <lane> "$C" && git -C "$C" rev-parse HEAD   # 2ed8a5f8…
$ mkdir -p "$C/.ufo/waves/round-64/close" && cp build/K64R2ScribeReportDraft/close-drafts/*.txt "$C/.ufo/waves/round-64/close/"
$ node "$C/scripts/report-receipt-diff.mjs" --lane "$C" --round 64 --report …/report-draft.md --fleet /home/vgpnk/Projects/shokunin
REPORT_RECEIPT: CLEAN (round=64 rev=worktree bytes=20820)   exit 0
$ node "$C/scripts/report-receipt-diff.mjs" --lane "$C" --round 64 --rev 2ed8a5f8… --report …/report-draft.md --fleet …
REPORT_RECEIPT: DRIFT RECEIPT_MISSING,TALLY_UNRECEIPTED …   exit 1   # 10 × RECEIPT_MISSING (close/), 2 × TALLY_UNRECEIPTED (after-tallies)
```

Authoring rules the tool enforces on this report (found by writing it):
- every labelled tally (`<LABEL>_HELD|UNMET held=x/y`) must sit on a line that names the receipt carrying it, in full
  (`.ufo/waves/round-64/{base,close}/<file>`), or the tally is read against all receipts;
- a full 40-hex token that is not a commit (e.g. the jj build hash in `JJ_SEAT_DEMO: DONE jj=0.45.1-…`) reads `HASH_DEAD` — truncate it;
- the six section headings and one `SHONEN` section with ≥4 box lines are mandatory; `UNMEASURED` is not a placeholder token.

## 6. Ratchet case and fix draft (wave-2 finding, not yet integrated)

`control-k21/` is a control case in the committed shape (`lane/`, `report.md`, `expect`) that the shipped tool accepts (CLEAN, exit 0) and the
patched tool kills (`DRIFT RECEIPT_MISSING,TALLY_UNRECEIPTED`, exit 1): a receipt cited **relatively** (`close/absent-tip.txt`) is invisible to
`RECEIPT_PATH`, so a report can cite a receipt that does not exist and still read CLEAN. Fix: `tool-relfix.diff` (2 hunks, `REL_RECEIPT`
alternative in `cited()`); `tool-relfix.mjs` is the patched file. Proof: selftest 52/52, all 37 committed controls 37/37 under both tools, r63
CLEAN, r60 same ids, the k21 case flips. If integrated, add the case to `controls/receipt/` (37 → 38, distinct ids unchanged) and raise nothing
else — a strengthening, never a relaxation.
