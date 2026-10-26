VERDICT: The tool's structure checks are presence-only — a 174-byte report with six headings, five empty bodies and four bare `[ ]` boxes reads CLEAN and the frozen P5 reads `RECEIPT64_HELD held=5/5` on it; twelve additive arms (patch text in the build dir) close every named forge, flag 10 real reports in rounds 40–63, and keep round 63's filed report and the round-64 report draft CLEAN.

## Evidence

`$ node scripts/report-receipt-diff.mjs --selftest` → `REPORT_RECEIPT_SELFTEST: PASS (52/52)` exit 0.

Five forgeries, each read CLEAN at `2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8` (`build/…/evidence.txt`):
```
hollow.md (174 B: six headings, empty bodies, 4 bare [ ])  REPORT_RECEIPT: CLEAN … bytes=174   exit=0
hollow2.md (198 B, same with "done" words)                  REPORT_RECEIPT: CLEAN … bytes=198   exit=0
order.md (six headings, contract order reversed)            REPORT_RECEIPT: CLEAN … bytes=451   exit=0
prosebox.md (4 bullets quoting `[x]` in prose)              REPORT_RECEIPT: CLEAN … bytes=614   exit=0
xnoverifier.md (4 [x] boxes, no verifier named)             REPORT_RECEIPT: CLEAN … bytes=554   exit=0
```
The frozen counter, run first at ~20:47 with the hollow file in the `--report` slot:
```
$ node .ufo/waves/round-64/probe/receipt64-probe.mjs <lane> 2ed8a5f8… --report /tmp/…/hollow.md
RECEIPT64_HELD held=5/5 checks=5 rev=2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8 rule=R64     exit=0
```
Round 63's report in the same slot: `RECEIPT64_UNMET held=4/5 … P5 MISS exit=1 REPORT_RECEIPT: DRIFT TALLY_UNRECEIPTED`.

`build/…/matrix.mjs` (v2 tool + the arms) over the 24 real reports and 14 one-lie fixtures (`build/…/matrix.txt`):
```
real r41 1/HASH_DEAD        SHONEN_NO_POINTER (line 179 [ ])      real r48 0/CLEAN  CLEAN
real r44 0/CLEAN            SHONEN_NO_POINTER (line 93 [ ])       real r59 0/CLEAN  SHONEN_X_SELF (line 174)
real r45 0/CLEAN            SHONEN_NO_POINTER (line 156 [ ])      real r60 1/PLACEHOLDER,TALLY_UNRECEIPTED  SHONEN_X_SELF,LOG_UNNAMED
real r46 0/CLEAN            SHONEN_NO_POINTER (line 95 [ ])       real r61 1/HASH_DEAD  STALE_LANE_UNNAMED
real r47 0/CLEAN            SHONEN_NO_POINTER (line 86 [ ])       real r63 0/CLEAN  CLEAN
real r49 1/TALLY_UNRECEIPTED SHONEN_NO_POINTER (line 112 [~])     real r58 1/TALLY_UNRECEIPTED  LOG_UNNAMED
MATRIX: OK (r63 and the honest fixture read CLEAN under the arms)
```
The 13 CLEAN / 11 DRIFT split the arms ran against reproduces `controls/real-reports-v2.txt` exactly (r40,41,42,43,49,53,57,58,60,61,62 DRIFT) — the corpus was fetched as the last blob touching each path, sha256-pinned in `build/…/reports.sha256`.

The same five forgeries through `patched-tool.mjs` (v2 `diffReport` + the arms, same CLI/render): `fx-hollow` →
`REPORT_RECEIPT: DRIFT SECTION_EMPTY,SHONEN_NO_POINTER,SHONEN_UNASSERTED,CITE_ABSENT,SOURCES_UNRECORDED,TREND_MISSING,STALE_LANE_UNNAMED,LOG_UNNAMED` exit 1;
`fx-order` → `SECTION_ORDER`; `fx-prosebox` → `SHONEN_COUNT boxes=0`; `fx-xnoverifier` → `SHONEN_X_VERIFIER`; `fx-honest` and the round-64 report draft
(`build/K64R2ScribeReportDraft/report-draft.md`) → CLEAN under every arm (the v2 tool still reads the draft
`DRIFT RECEIPT_MISSING,TALLY_UNRECEIPTED` — two close receipts are not committed yet and two tallies are unreceipted; that
is the pre-close state, not an arm finding).

## Findings

**K64R2CriticForgeStruct-1 — critical — P5 is satisfiable by a hollow report.** Attacks: claim C1's P5 and the tool's
`SECTION_MISSING`/`SHONEN_COUNT` arms. A 174-byte file with six headings, five empty bodies and four bare `[ ]` boxes
is accepted as "the round-64 report": the tool checks heading presence, not content, and counts `[ ]` boxes.
Repro: `printf '# r\n\n## Work performed\n\n## Landed changes\n\n## Before → after measurements\n\n## Sources & frontier\n\n## Trend verdicts\n\n## SHONEN\n\n- [ ]\n- [ ]\n- [ ]\n- [ ]\n' > /tmp/h.md && node scripts/report-receipt-diff.mjs --lane . --round 64 --rev 2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8 --report /tmp/h.md`
→ `REPORT_RECEIPT: CLEAN` exit 0; the probe then scores P5 HELD (`held=5/5` at 20:47; since the fleet git dir vanished
— finding 6 — the same command reads `held=4/5 … P3 MISS fleet-blob-unreadable`, with P5 still passing).

**K64R2CriticForgeStruct-2 — high — five named structure forges read CLEAN.** Attacks: the tool's structure surface.
(i) headings with empty bodies; (ii) the six headings in the wrong order (`REQUIRED` is tested per-heading, never
ordered); (iii) four `[ ]` boxes that assert nothing (`SHONEN_COUNT` counts the mark, not the assertion); (iv) four
bullets that merely quote `` `[x]` `` in prose (the selftest's own `shonen-backticked-boxes` case accepts backticked
marks); (v) `[x]` boxes with no named verifier (PROTOCOL: "Each checked box names its reviewer (`[x] <verifier>`)";
"any `[x]` carrying no named non-author verifier is author attestation counting as `[~]`"). Repro: the five CLEAN
lines in Evidence, fixtures in `build/…/fixtures/`.

**K64R2CriticForgeStruct-3 — high — twelve additive arms close them; patch text is `report-receipt-diff-v3.patch.md`.**
Attacks: same surface, with zero false positives on the real corpus. Four arms flag real filed reports:
`SHONEN_NO_POINTER` (r41:179, r44:93, r45:156, r46:95, r47:86, r49:112 — a box with no pointer, PROTOCOL "one line per
box … + pointer"), `STALE_LANE_UNNAMED` (r61 — no progressing/silent statement, PROTOCOL stale-lane actuator),
`SHONEN_X_SELF` (r59:174, r60:193 — `[x]` whose text says "those seats are still the lane"), `LOG_UNNAMED` (r58, r60 —
wording-level, OPTIONAL). Eight more are fixture-proven with 0/24 false positives: `SECTION_EMPTY`, `SECTION_ORDER`,
tightened `SHONEN_COUNT` (marks only on a mark-initial bullet — round 48's three-bullet/four-box SHONEN still counts 4),
`SHONEN_UNASSERTED`, `SHONEN_X_VERIFIER`, `CITE_ABSENT`, `SOURCES_UNRECORDED`, `TREND_MISSING`, `ROUND_UNNAMED`.
Round 63's filed report and the round-64 draft stay CLEAN. Integration cost is stated exactly: the selftest's `body()`
must become conformant (verified `REPORT_RECEIPT: CLEAN (round=9 … bytes=835)` in a fixture repo) and three literal
fixtures change ids (both forms given, computed). Repro: `node matrix.mjs <reports> fixtures`; `node forge.mjs fixtures`.

**K64R2CriticForgeStruct-4 — medium — the cheapest-looking arms are false-positive traps; do not adopt them.**
Measured: an unconditional `SOURCES:` arm flags **all 24** reports including round 63 (`SOURCES:` appears in none;
PROTOCOL requires that form only for a lane with no corpus); `CITE_UNRESOLVED` over 7–40-hex tokens in `Landed changes`
flags r58 on the sha256 prefix `7effcf4dce8f2da1` (the exact class `CHANGES-AFTER-FREEZE.md` refuses to fix by
adjacent-word heuristics); `BEFORE_NO_CMD` flags r62 (an honest "no claims were frozen") and r43 (its command opens with
an env assignment); `TREND_UNEVIDENCED` flags r62 (prose verdicts, legitimate); an `L0` arm flags r49 and r62 — the L0
side channel is a duty to append `.ufo/l0-questions.md` (PROTOCOL line 524), not a report-content clause.

**K64R2CriticForgeStruct-5 — medium — `--report` is unbound to the round, so "as filed" is whatever bytes are handed
over.** Attacks: P5's subject and the tool's premise. `resolve(rep)` is the caller's path; nothing requires
`<lane>/.ufo/reports/round-64/kumitate.md` or a committed blob. Measured on a real report with two filed versions: the
round-57 report at `7c3d1203` reads `REPORT_RECEIPT: CLEAN (… bytes=12622)` and the same path's later filed version at
`8e43dbcd` reads `DRIFT HASH_DEAD` (14985 bytes). Fix proposed in `p5-amendment.md` (path/blob binding; round-65 text,
the probe is frozen).

**K64R2CriticForgeStruct-6 — critical, host state, outside my write scope — the frozen P3 can no longer pass: the fleet
git directory is unreachable.** Attacks: claim C1's counter (P3 reads `git -C <fleet> show 7b0581ed:…`). Now:
`git -C /home/vgpnk/Projects/shokunin rev-parse --show-toplevel` → `/home/vgpnk`; there is no `.git` under the fleet
root; `7b0581ed` and `8fd46e61` resolve in neither `/home/vgpnk` nor the lane; `git -C /home/vgpnk rev-list --all
--count` → `28` (a wowdible history, HEAD `870a976`, empty tree). Re-running the counter now:
`RECEIPT64_UNMET held=4/5 checks=5 rev=2ed8a5f8… rule=R64 | P3 MISS fleet-blob-unreadable` exit 1 — the same command
read `held=5/5` earlier in this session, and the 24 report blobs were fetched through that path minutes before. P3
pins two abbreviated fleet hashes and resolves `--fleet` by upward search with no pin of its own. The round's C1 cannot
read HELD until the fleet git directory is restored; the counter is frozen, so this is reported, not patched.

## Artifacts
`build/K64R2CriticForgeStruct/`: `report-receipt-diff-v3.patch.md` (patch text: constants, helpers, replacement
SHONEN block, appended arms, selftest replacement + 13 verified cases), `p5-amendment.md`, `structure-arms.mjs` (the
arms), `patched-tool.mjs` (v2 + arms, same CLI), `forge.mjs` + `fixtures/` (14 one-lie reports), `matrix.mjs` +
`matrix.txt`, `evidence.txt`, `reports.sha256` (24 report blobs). Scratch: `/tmp/kumitate-r64/K64R2CriticForgeStruct/`.
No file outside these paths and the report was written; no lane copy left behind (4 `.mjs` files in the build dir).

## Limits
Did not judge the arms' *semantic* strength: `SHONEN_X_VERIFIER`/`SHONEN_X_SELF` are marker checks (a forger omits the
admission), and no arm can decide authorship. `ROUND_UNNAMED` is satisfiable by naming the round once anywhere in the
prose. Did not run the patched tool against the *final* round-64 report (it does not exist yet; the wave-2 draft reads
CLEAN under the arms). Did not investigate who removed the fleet `.git` or restore it; `.jj` in the fleet root is a
native-store repo with foreign bookmarks (`main`/`master`, commits `9a0cac1d…`), which I did not probe further. The
"as filed" corpus was the last blob touching each path; earlier filed versions (r57) were not graded except where named.
