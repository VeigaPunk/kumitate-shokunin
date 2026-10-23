RESULT SweepS046S050 rev=516977af verdict=defects rows=5 defects=1

Anti-loop re-open of SOURCES.md rows S046–S050 at 516977af2216b1cc426ee970d260dee53714bf4f.
Admission quotes: corpus/lessons/round-43.md ## Gate (lines 66–94) and round-43-verifier-spotcheck.md:141–145
(3 admits, 2 rejects, 7/7 agree). One defect found, and it is the defect the lane already disclosed:
round-43.md:75–80 carries a filed erratum for S047 that "supersedes its locator and parenthetical".
No new defect. Sources fetched by curl/git only; no installs.

ROW S046 verdict=holds
  curl https://par.nsf.gov/servlets/purl/10104340 → HTTP 200, 318061 bytes;
  sha256 45da8b5f83fe46a76d5ede030b4d49bf28201fede20d90b9b70b6b1062ec5451 == row's pinned PDF sha256.
  Quote verbatim in pdftotext output §1 ¶3: "If a test can have different outcomes when run on the same
  mutant, then it is unclear if the test actually kills the mutant." (24 words; matched across PDF line wraps).
  teaches supported by locators: §3.2 introduces "a new category, 'unknown'" and defines mutant status
  unknown iff ≥1 unknown pair and no killed-covered pair (i.e. neither killed nor survived); §3.2/§4.3(RQ3,
  text line 636/1041) confirm rerun-confirmation ("rerun tests that do not cover … up to 16 times").

ROW S047 verdict=teaches-overstates — erratum-disclosed, not new
  raw.githubusercontent.com/infection/infection.github.io/4d7570f5…/guide/index.md → HTTP 200, 5041 B;
  sha256 8a3d6254e64d469b0c7be70957d92c0cf44d174f2917b428bf730f42eae105dc == pinned. Quote verbatim at :13
  "If mutated program produces failing tests, this is called a *killed mutant*."; :35 collects
  "killed, escaped Mutants, errors and timeouts" (supports "collected as their own outcomes").
  But "(not the MSI aggregate)" is contradicted by the same file :94
  "TotalDefeatedMutants = KilledCount + TimedOutCount + ErrorCount" + :99-101 MSI formula, and :101
  "47% of all generated mutations were detected (i.e. kills, timeouts or fatal errors)". Locator also wrong:
  raw under infection/site/4d7570f5… → HTTP 404; blob exists only under infection/infection.github.io.
  Both defects are the round-43.md:75-80 erratum (file sha256 as recorded ⇒ row as filed still carries them).

ROW S048 verdict=holds
  raw.githubusercontent.com/sixty-north/cosmic-ray/f6550adf…/docs/source/concepts.rst → HTTP 200, 8701 B;
  sha256 1603d6159c1ce11b6db99e61fcc546ea076a055310aacaf07b2e11d609191286 == pinned.
  Quote verbatim at :178-179 "if a test of a mutant takes longer than the timeout, the test is killed, and
  the mutant is marked incompetent" (21 words). teaches supported: :120 "a single failing test case is
  sufficient to kill a mutant" ⇒ killed is read off a failing test; timeout marks mutant incompetent.
  Repo owner not in row (spotcheck's noted minor); f6550adf resolves under sixty-north/cosmic-ray.

ROW S049 verdict=holds (reject substantiated; one reason clause imprecise)
  curl conf.researchr.org/details/icst-2024/mutation-2024-papers/5/…Mutants → HTTP 200 text/html, 78820 B,
  sha256 68d0298008b52d49621c84b10806f56d5f3cffd0056bb6a06288b337ad122638 (no pin in row).
  Gate quote verbatim in page abstract: "19% of mutants killed by these flaky tests result from the
  flakiness introduced by at least one test" (18 words). Reason "no locatable … sample" is loose: the
  abstract states a sample size, "22 Java projects, previously examined for test flakiness", but names
  none — unlocatable. No method for the 19%, no revision; entry itself undated (conf dates are the
  programme's). Q2 clause stands independently: tier-B abstract only. Reject decision correct.

ROW S050 verdict=holds (reject substantiated; anchor mime clause stale)
  curl softengbook.org/articles/mutation-testing → HTTP 200 text/html, 13951 B,
  sha256 dafd50ef32460cfe654a062db6b3188d5074b9c344174be6af80b73e31154fc7. Anchor says "served as
  text/markdown": not so now — text/html; charset=utf-8, and retry with -H 'Accept: text/markdown' still
  returns text/html. No revision/version/date on the article ("Version for personal use only" is a license
  line, not a version). Gate quote verbatim (markup aside): "A mutant is said to have been killed when it
  is detected by at least one existing test" (18 words). Denominator "total number of generated mutants"
  (§1.2) contradicts S034's Valid = detected + undetected (Stryker page, re-opened HTTP 200). Reject stands.

Residual risk: S046/S048 word-wrap matching via pdftotext/rst — quotes are verbatim modulo line breaks.
S047 row bytes remain wrong at the freeze but are superseded by the filed erratum (append-only convention);
if the sweep counts row-byte defects, 1 defect: S047 teaches parenthetical.
