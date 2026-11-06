K93ScribeLesson — round-93 lesson, v2 knowledge entry, PROVINCE amendment drafted; no lane writes outside the seat dir.

Behavior: read round-92 lesson/spot-check §5, Q86, PROVINCE, plan.md, the frozen oracle/counter, the open/ captures and the wave spec; drafted the three documents; ran and recorded the M93-1 fail-able check. No gate was rerun; no git/jj mutation; no product code touched. Candidate state read only (READY 98a5a3a3…, selftest 54/54).

Drafts (seat dir .ufo/waves/round-93/K93ScribeLesson/; hashes in receipts/draft-sha256.txt):
- lesson-round-93.md (58d3530c…) — round-92 section shape; `## Gate` left an L1 skeleton (admit/reject rows for the v2 tool, the knowledge entry, proposed Q87, the PROVINCE amendment, rejects); Mistakes M93-1 (r92 report rewritten in place) + M93-2 (chain type cited at its use site); Sources S267/S268/S269 with line anchors; Routed to round 94; Assimilation (considerthese idea 3).
- knowledge-seat-route-retry-fields.md (f35b42dd…) — S267/S268/S269 `source:`, `verified-at: b6204949`, `recheck:`; per-field reading of error_attempts, recovered_attempts, superseded_by, upstream, resolved, chain, flag_hops, revert_hops; attempts-vs-requests trap; limits; proposed README map row.
- province-amendment.md (7fe4e2a1…) — dated 2026-11-06 paragraph: sessions read by content by seat-route (read-only, redacted), depth-1 readdir+lstat bound unchanged; glosses PROVINCE.md:16,57-58.

Fail-able demo (receipts/report-append-check-*.txt, numstat-*.txt):
  git -C /home/vgpnk/Projects/shokunin diff --numstat cfb99a19 6982c483 -- .ufo/reports/round-92/kumitate.md
  → 4	4	.ufo/reports/round-92/kumitate.md
  ./report-append-check.sh r92 pair → added=4 deleted=4 / VERDICT: REWRITE / rc=1
  kumitate round-82 append-only erratum dcd100cc→8d0aab68 → added=18 deleted=0 / VERDICT: APPEND-ONLY / rc=0
  kumitate round-79 commit named "erratum" cbb52bd6→59aa9ae8 → added=6 deleted=4 / VERDICT: REWRITE / rc=1
  same-rev pair → "ERROR: no diff" / rc=2 (fail-closed).

Gates: none re-run; Gate rows are L1 placeholders. Touched surfaces: seat dir + this trailer only.
Out of scope (untouched): scripts/, corpus/, pins, probe/, controls/, open/, plan.md, MANIFEST, host sysctls.
Findings routed: runtime_check flags the tool's own open under round-93 (builder score1/score2 VIOLATION; same bytes outside → CLEAN); H set skips transcripts <900 s old; r93 spotcheck-adopt reading is only a plan quote (open/ has census-start.txt alone); retry-fallback-chains.ts (sha b5db5299…) has no SOURCES row; historical kumitate errata are not uniformly append-only.
Scratch created and removed; no blockers.
