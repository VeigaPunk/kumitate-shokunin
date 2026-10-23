# ScribeLesson50 — round-50 lesson skeleton

Axes: operability + coverage. This is text for L1 to land in `corpus/lessons/round-50.md`; it is not a claim that the round has closed.

## Draft lesson

```markdown
# Round 50 — lesson

Lane: kumitate. Round 50 (hyaku run 6). Freeze `5b0de268e5a6bdd744fe47c6ee2ee58404693ac3`; base `ff40d7dcbc90aa043d7f4003976af6a99ff76642`. Pre-data implementation correction `378b6e732a1a40ae8adfcaaa5de352cee5163cf0` fixes G3 mount-table enumeration and restores R8's committed-report read; the frozen predicates, labels, check counts, and thresholds are unchanged. Plan `.ufo/waves/round-50/plan.md`; counters `probe/bindguard50-probe.mjs` (G50) and `probe/repairs50-probe.mjs` (R50), both frozen before data. C1 scored commit: [insert exact landed commit and its G50 receipt]. Frontier-audit close commit: [insert exact landed commit and R50 receipt].

One scored claim only: C1 `GUARD_HELD` (G50), operability. `LEDGER_HELD` (R50) is a closure/frontier audit, not a second axis claim.

## Mistakes

- **M1 — report filed before its last commits, leaving C2 stale.** Class: report-last/append-only record hygiene. Evidence: `corpus/lessons/round-49-verifier-spotcheck.md` §1 and §5. The report said 15/15 at `589d25e4`; after filing, `01b70bb0`, `923a172`, and `c432cc95` landed, and the tip measured 16/16. It also said the work was committed in `64b92866`. Captured by: the non-author r49 spot-check (routed defect 1) and the R50-1 erratum audit. Fix: append an `## Erratum` to the fleet report `.ufo/reports/round-49/kumitate.md`, name the superseded numbers and post-filing commits, and leave the report bytes above the addendum unchanged. Evidence pointer: [fleet erratum commit/receipt, plus `.ufo/waves/round-50/r50/ScribeErratum.md`].

- **M2 — byte-identical B49 receipts were presented as separate, time-spaced runs.** Class: receipt-for-claim / invocation independence. Evidence: r49 spot-check §2 C1 records `sha256sum` `03a258d6…` for all three receipts in commit `64b92866`, despite the time-spaced claim. Captured by: the r49 non-author spot-check (routed defect 4) and R50-4's frozen R4 check. Fix: preserve three outputs from separate invocations of the frozen B49 command at the same target revision; put a distinct `run-at=` prelude on each; commit byte-distinct receipts whose timestamps span at least 300 seconds. Evidence pointers: `.ufo/waves/round-50/ReRunB49-1.txt`, `ReRunB49-2.txt`, `ReRunB49-3.txt` [insert exact timestamps and sha256s from landed receipts; do not describe copied bytes as runs].

- **M3 — the all-eleven correction sweep missed two sentences.** Class: incomplete cross-reference/count sweep. Evidence: r49 spot-check §5 item 5: `SKILL.md:595` says “all eleven” and `:598` repeats “all eleven”, while `:589` says “Twelve are gates”. Captured by: the non-author r49 spot-check (routed defect 5) and the R50 R5 check. Fix: correct both stale “all eleven” sentences to agree with Twelve; keep the two edits visible in the landed diff and point to the R5 result.

- **M4 — the counter-amendment knowledge entry lacked the required provenance header.** Class: source-registry/provenance contract omission. Evidence: `.ufo/waves/round-50/controls/H1-freeze-5b0de268.txt` items 697 and 20–22: baseline `20/22`, with `ENTRY_HEADER_REQUIRED` for `corpus/knowledge/counter-amendment-discipline.md`. Captured by: H1 freeze checklist item 697 and R50-10 / close-time `sources-check`. Fix: add the `source:`, `verified-at:`, and `recheck:` trio to that existing entry and add it to the S095 and S098 `used-by` values; preserve the source rows' status/recheck and record the exact old→new row text in this lesson. Evidence pointers: the H1 freeze receipt, the committed entry, and the R50-10 source-cell diff/receipt.

## Gate

- **Candidates considered:** S095 and S098 were re-opened against their cited manual passages; S099 (`proc_pid_mountinfo(5)`) was the r49 mined-source admission being checked in the closure spot-check.
- **Admitted:** S099, tier A, status `mined` (retained from r49; its body hash and cited description/field-5 locator were rechecked by the non-author spot-check). S095/S098 re-open verdicts: S098 `HOLD`; insert the exact S095 verdict from `.ufo/waves/round-50/r50/ReopenS095.md` (that receipt was not present at this draft's inspection). A HOLD leaves its SOURCES row status/recheck unchanged.
- **Rejected:** none.
- **Spot-check:** `corpus/lessons/round-49-verifier-spotcheck.md` §3 agrees with the S099 admission, the doctored-receipt rejection, and K4–K6 rejects; it disagrees with the r49 report's “discernment — improved” because r49's lesson lacked a `## Gate` ledger. R50-2 records that missing ledger in the r49 lesson; retain the spot-check as an independent finding, not as proof that the old ledger existed.

## Frontier — SOURCES

No new source row is proposed. S095 and S098 were re-opened on `2026-10-23`; their SOURCES `opened` dates remain `2026-10-23`, tier A, status `mined`, and `recheck: on-release` unchanged. Their receipts record whether the cited content still agrees. S099 remains tier A, `mined`, opened `2026-10-23`, `recheck: on-release`, admitted in r49. The fetched body hashes remain in `corpus/SOURCES.md`.

- **S095:** bubblewrap 0.13.1 manual, `https://raw.githubusercontent.com/containers/bubblewrap/v0.13.1/bwrap.xml`, sha256 `2cb77df2f4be0b2a0302bb2f0a260fdb4d9e1299b76481ea66ed34c40f5be1da`; re-open receipt `.ufo/waves/round-50/r50/ReopenS095.md`. `used-by` before: `scripts/cap-run.mjs, scripts/cap-spawn.mjs, corpus/lessons/round-47.md`; after: those paths plus `corpus/knowledge/counter-amendment-discipline.md`.
- **S098:** strace 7.2 manual, `https://raw.githubusercontent.com/strace/strace/v7.2/doc/strace.1.in`, sha256 `c16859e07dacc5cda882c7ab5f2e353803645a6ca449a0ac41eda1034e67ae9a`; re-open receipt `.ufo/waves/round-50/r50/ReopenS098.md` says `HOLD` (default return alignment column 40 and unfinished/resumed marking agree). `used-by` before: `.ufo/waves/round-48/probe/caproute48-probe.mjs, corpus/lessons/round-48.md`; after: those paths plus `corpus/knowledge/counter-amendment-discipline.md`.
- **S099:** Linux man-pages `proc_pid_mountinfo(5)`, `https://man7.org/linux/man-pages/man5/proc_pid_mountinfo.5.html`, sha256 `27a0e5ad5cf9fc4ef4059cd0c4a9b70fa2ac23457a4d39b82f2381a654b3813f`; retain its existing `used-by`: `scripts/bind-oracle.mjs, corpus/knowledge/counter-amendment-discipline.md, corpus/lessons/round-49.md`. No status, opened-date, or recheck edit.

The counter-amendment entry's provenance header should read `source: S095 <URL>; S098 <URL>; S099 <URL>`, `verified-at: 2026-10-23 round-50 source re-open (body hashes retained in corpus/SOURCES.md)`, `recheck: on-release`. State whether the S095/S098 `used-by` additions and H1 item 697 pass from the actual close receipt; do not infer that from this draft.
```

## Evidence basis and limits

Read `plan.md`, both frozen probes, the H1 freeze receipt, the r49 lesson and non-author spot-check, the S095/S098/S099 SOURCES rows, and the counter-amendment entry. The plan confirms one scored claim and an auxiliary audit; the probes define the predicates. `git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin log -8 --format='%h %H %s' -- .ufo/waves/round-50/plan.md .ufo/waves/round-50/probe/bindguard50-probe.mjs .ufo/waves/round-50/probe/repairs50-probe.mjs` returned `378b6e7 378b6e732a1a40ae8adfcaaa5de352cee5163cf0 round-50: freeze guard and closure corrections` and `5b0de26 5b0de268e5a6bdd744fe47c6ee2ee58404693ac3 round-50: freeze guard and closure audit`.

Observed S098 receipt: `.ufo/waves/round-50/r50/ReopenS098.md` begins `REOPEN50: HOLD`, names the expected S098 hash, and cites the expected passages. S095 receipt was absent when checked; the final G50/R50 close receipts and exact final commit IDs were not available in the inspected tree. Therefore the bracketed fields above are deliberately left for L1 to fill from committed evidence, not inferred here. Existing source-cell values used for the exact old→new changes are from the current `corpus/SOURCES.md` rows; the knowledge entry currently contains the three provenance fields. No tools were installed, and no code, judge, commit, or deployment was changed by this seat.
