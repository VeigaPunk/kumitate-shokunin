RESULT ReviewS018Reopen rev=fae386aa9e0542710b7a893d84c8e92e86fc079b verdict=FAIL quote=found s51=missing

FINDING (one defect — wrong section locator in the Gate S018 entry):
corpus/lessons/round-41.md lines 129-130 (at fae386aa) say "MAST §5.1 says such verification
failures 'appear frequently even in successful runs'". Against the paper the lesson itself pins
(arXiv 2503.13657 v3), that sentence appears exactly once and NOT in §5.1 — it is in Appendix J
"Correlation of Failure Modes with Different Statistics" (HTML section id A10, raw line 3021,
the bullet that opens "Some failures are non-fatal", next to Table 7). §5.1 "Failure Breakdown in
MAST-Data" (id S5.SS1, lines 1084-1091) discusses AppWorld FM-3.1 premature terminations,
OpenManus FM-1.3 step repetition and the GPT-4o/Claude FC1 split; it never contains the quoted
words. HTML v1 and v2 do not contain the sentence at all, so version drift does not explain the
label. Origin: the attempt-1 receipt .ufo/waves/round-41/falsify/ScoutMAST.md writes
"Fatality. Section 5.1: 'verification-related failures like 3.2 ... appear frequently even in
successful runs'" — and the same receipt admits "I did not read Appendix E/J/J.1 ... in full";
the lesson inherited the mislabel. The words are genuine and the non-fatal point stands (the
paper files the sentence under "Some failures are non-fatal"), but the committed locator is
wrong. Minimal fix: say "MAST Appendix J" or drop the section number.

Evidence (commands and outputs):
1. Source opened by ordinary means: `curl -sL https://arxiv.org/html/2503.13657v3` → HTTP 200,
   1780259 bytes, sha256 e54dc4caed74ca80fb6a9a165fac6ae037e438e22878399830f40c0c38cfbb7d —
   byte-identical to the artifact ScoutMAST.md receipts, so I checked the same bytes the scout
   did. v1/v2 HTML also fetched (babe8cdb…, 64951aa0…). No challenge, no captcha; no tool
   installed (curl/git only).
2. Mechanical verbatim check (tags stripped, entities unescaped, whitespace normalized):
   `FM-3.2 quote present verbatim: True | words: 13`; occurrences of the definition in v3: 1.
   Quote checked: "(partial) omission of proper checking or confirmation of task outcomes or
   system outputs" — 13 words, ≤ 25, an exact prefix of the paper's definition. quote=found.
3. Definition site, v3 raw line 2298 (id A1.I3.i2.p1.1): "FM-3.2: No or incomplete verification -
   (partial) omission of proper checking or confirmation of task outcomes or system outputs,
   potentially allowing errors or inconsistencies to propagate undetected." Section heading, line
   2207: "Appendix A MAST Failure Categories: Deep Dive" (submode A.3).
4. "appear frequently even in successful runs" occurrences in v3 text: 1; unique hit is line 3021
   inside `<section id="A10">` whose heading (line 3000) is "Appendix J Correlation of Failure
   Modes with Different Statistics". Same count in v1: 0, in v2: 0.
5. §5.1 heading, line 1085: "5.1 Failure Breakdown in MAST-Data"; its paragraphs (lines 1088,
   1091) contain "AppWorld frequently suffers from premature terminations (FM-3.1)..." and model-
   comparison text — the quoted sentence is absent. s51=missing (quote exists, locator wrong).
6. Lesson entry under review — `git -C <lane> show fae386aa…:corpus/lessons/round-41.md`, lines
   124-130: "Re-open S018 (MAST, Cemri et al., arXiv 2503.13657 v3; status `queued` → `mined`,
   used-by `—` → `corpus/lessons/round-41.md`): opened 2026-10-22T17:14Z by the falsify scout
   ScoutMAST at https://arxiv.org/html/2503.13657v3 (HTTP 200). Located quote, FM-3.2 ... Used
   here: the R40-6 slip (a seat count written from memory) is an FM-3.2 instance, and
   `wave-census --expect` is the check that was omitted; MAST §5.1 says ... 'appear frequently
   even in successful runs', so the slip did not make round 40 fail."
7. Use check (R40-6 as FM-3.2): the round-40 slip is recorded in the lesson `## Mistakes`
   calibration row (line 110): a seat-gate record said "four mutation-tester seats returned
   results" where the payload holds three. FM-3.2 is "(partial) omission of proper checking or
   confirmation of task outcomes or system outputs" — a count asserted from memory with the
   recount omitted is that omission, and the paper's own worked example for the mode (Appendix
   N.7, AG2 math trace: agent writes 9+1=10 without recounting) is the same shape. The omitted
   check is real and measured: lesson line 110 and falsify/ScoutMAST.md counter-checks 2-3 at
   4e58bb0e — `wave-census.mjs --round 40 --expect build:mutation-tester=4` → `FINDING
   EXPECT_MISMATCH … payload=3`, exit 1; `=3` → exit 0. The use follows from the text.
8. SOURCES.md S018 row change — `git -C <lane> show 4e58bb0e…:corpus/SOURCES.md | grep '^| S018 '`
   → `| S018 | Cemri et al., Why Do Multi-Agent LLM Systems Fail? (MAST) — https://arxiv.org/abs/2503.13657 | paper | A | … | § Abstract; arXiv:2503.13657v3 | MAST: 1600+ traces, 14 failure modes in 3 categories, kappa 0.88 | queued | 2026-10-19 | 365d | — |`;
   same command at fae386aa → identical row with `mined` in place of `queued` and
   `corpus/lessons/round-41.md` in place of `—`. queued→mined and used-by both match the Gate
   entry's claim exactly. Row numbers cross-checked against the fetched v3 abstract: "1600+
   annotated traces", "14 unique modes, clustered into 3 categories", "kappa = 0.88" — all hold.

Residual risk: none found beyond the one locator defect; FM-3.2 quote, R40-6 mapping, SOURCES
row status and used-by all verified against the pinned v3 bytes. Verification gaps: I checked the
HTML rendering (the artifact the gate names); I did not diff the typeset PDF, and the LaTeXML
appendix lettering (A = "MAST Failure Categories: Deep Dive", J = correlation appendix) is the
same in the PDF's \appendix scheme, so the mislabel is not an HTML-only artifact [INFERENCE on
PDF lettering only; the HTML/PDF section-numbering agreement is not byte-verified]. No lane file
was written except this report; no jj/git state touched; no tool installs.
