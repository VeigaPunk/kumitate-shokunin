RESULT ScoutSrcFlaky rev=e5ffcbe7f155b89cb1870f9da7b0d671d092948b verdict=found sources=4 best=https://par.nsf.gov/servlets/purl/10104340

Assignment: primary source for K43 clause (d) (a kill is confirmed only when an immediate second run of the same mutated bytes agrees; a disagreeing rerun is UNSTABLE, never KILLED). All sources opened 2026-10-22 by ordinary HTTP; no bot challenge was passed and none was attempted. No lane file other than this report was written; no tool was installed or updated.

## Opened sources that support clause (d)

1. Shi, Bell, Marinov, "Mitigating the effects of flaky tests on mutation testing", ISSTA 2019, pp. 112-122, DOI 10.1145/3293882.3330568.
   - URL opened: https://par.nsf.gov/servlets/purl/10104340 (NSF Public Access Repository record 10104340; publisher of the record: NSF/DOE OSTI). Access 2026-10-22.
   - Revision anchor: PAR ID 10104340, Date Published 2019-07-15 (record metadata), 17-page PDF, sha256 `45da8b5f83fe46a76d5ede030b4d49bf28201fede20d90b9b70b6b1062ec5451`; section/page anchors below are from `pdftotext -layout` of exactly those bytes.
   - Quote A (24 words), §1 Introduction, paragraph 3 (page 1, under the "1 INTRODUCTION" heading; the paragraph opening "The results of mutation testing become unreliable in the presence of flaky tests"): "If a test can have different outcomes when run on the same mutant, then it is unclear if the test actually kills the mutant." This is the direct statement of clause (d): a non-reproducible failure does not establish a kill.
   - Quote B (21 words), Abstract (page 1): "mutation scores vary by four percentage points on average between repeated executions, and 9% of mutant-test pairs have an unknown status" — same bytes, same page.
   - Quote C (16 words), §4.3 "RQ3: Mutant Execution Approaches" (page 6): "38.0%, 29.7%, and 32.3% of the mutant-test pairs having all reruns being killed, survived, or both" (sentence reads in full: "the three possibilities are roughly equal in occurrence, with 38.0%, ... respectively"). Reruns genuinely disagree on about a third of pairs.
   - Also located, not quoted verbatim because the PDF encoding mangles its quotation marks: §3.2 "Mutation Execution" (page 4) defines the status "unknown" for a mutant with at least one unknown mutant-test pair and no killed-and-covered pair — the same shape as K43's UNSTABLE class, i.e. not a kill and not a survival.

2. PIT Mutation Testing FAQ, "Is it random?" (pitest project; page maintained in `hcoles/pitest-site`).
   - URL opened: https://pitest.org/faq/ ; access 2026-10-22.
   - Revision anchor: source file `pages/faq.markdown` at gh-pages (rendered by the site), latest commit `c15b349658a786c8b6a524d03587e89343011240` dated 2024-12-06 (GitHub API, path query); raw file sha256 `06f13aecf7e69024cf03daa1ff6ef234363c94a5aeda7fb5a5a557e0b687f724`, 284 lines; quote at line 222.
   - Quote (17 words), § "Is it random?" → subsection "Timeouts", second sentence of the paragraph: "a mutant may be detected as timed out on one run, but killed or surviving on another". The page's lead sentence in the same section (24 words) is: "Pitest works hard to be fully deterministic, but two factors might cause the results to differ slightly between two runs with the same input." Supports requiring run-to-run agreement before a verdict.

3. PIT issue #969, "JUnit Test Flaky When Run in PIT" — https://github.com/hcoles/pitest/issues/969 ; access 2026-10-22. Publisher: PIT project on GitHub; quoted author Henry Coles (@hcoles), PIT maintainer.
   - Revision anchor: issue #969, opened 2022-01-15, closed, updated 2024-04-02; quote from the maintainer comment dated 2022-01-30T12:30:42Z.
   - Quote (24 words), that comment, final paragraph: "A test that fails the 2nd time you run it (ie is not repeatable) it cannot be used as it will give false results." Supports treating a non-repeatable outcome as no verdict, not as a kill.

4. Alshammari, Ammann, Hilton, Bell, "A Study of Flaky Failure De-Duplication to Identify Unreliably Killed Mutants", Mutation 2024 workshop at ICST 2024.
   - URL opened: https://conf.researchr.org/details/icst-2024/mutation-2024-papers/5/A-Study-of-Flaky-Failure-De-Duplication-to-Identify-Unreliably-Killed-Mutants ; access 2026-10-22. Publisher: ICST/Mutation 2024 conference site.
   - Revision anchor: none on the page (undated); session slot Tue 28 May 2024 15:00-15:30, Room 4.
   - Quote (18 words), Abstract: "19% of mutants killed by these flaky tests result from the flakiness introduced by at least one test". The abstract's framing question ("When a flaky test 'kills' a mutant, does it reliably kill it...") is the same distinction as KILLED versus UNSTABLE.

## Opened, no clause-(d) support

- Petrović, Ivanković, Fraser, Just, "Practical Mutation Testing at Scale", arXiv:2102.11378v2 (submitted 2021-02-22, last revised 2021-02-26; arXiv record carries no journal reference, only "submitted to the IEEE"). Opened the full PDF (sha256 `a9bdf44159a7b8a6f4b77d7e347650e52d9915bf68f765ff5333f7feee56a081`, 1591 extracted lines); case-insensitive search for flaky, nondeterministic, non-deterministic, unstable, timeout, rerun/re-run finds no statement about non-reproducible outcomes. Its only "rerun" is a developer workflow ("rerun mutation testing on the new code", line 379). It is not a source for clause (d); it is already registry row S040 for the kill definition, and my download's sha256 equals S040's anchor bytes.
- Stryker Mutator, "Mutant states and metrics" — https://stryker-mutator.io/docs/mutation-testing-elements/mutant-states-and-metrics/ (opened 2026-10-22; page undated, Docusaurus docs version "current"; this is the page behind existing row S023). It defines "Killed: When at least one test failed while this mutant was active" and counts a Timeout as "detected", with no rerun or flaky policy. It must not be cited for clause (d), and its timeout convention is contrary to K43's non-evaluable-timeout rule.

## Unopened

- ACM Digital Library landing page and PDF for DOI 10.1145/3293882.3330568: HTTP 403 on both (https://dl.acm.org/doi/10.1145/3293882.3330568 and .../doi/pdf/...). Unopened; the NSF PAR copy above was used instead.
- IEEE TSE published version of the Petrović paper: not attempted; the arXiv record names no published-venue identifier, so no version anchor was available to open.

## Proposed corpus/SOURCES.md rows (next free id is S046; the registry currently ends at S045)

Status is `queued` until the C1 knowledge text lands; flip to `mined` and set `used-by` when it cites them (append-only columns: status, recheck, used-by).

```
| S046 | Shi, Bell, Marinov: Mitigating the effects of flaky tests on mutation testing — https://par.nsf.gov/servlets/purl/10104340 | paper | A | why a single-run mutant verdict is not evidence: flaky outcomes make kills non-reproducible; rerun-based confirmation and an unknown (neither killed nor survived) status | ISSTA 2019 proceedings pp. 112-122 (DOI 10.1145/3293882.3330568); NSF PAR record 10104340; PDF sha256 45da8b5f83fe46a76d5ede030b4d49bf28201fede20d90b9b70b6b1062ec5451; §1 Introduction p. 1 — "If a test can have different outcomes when run on the same mutant, then it is unclear if the test actually kills the mutant."; §4.3 RQ3 p. 6 — "38.0%, 29.7%, and 32.3% of the mutant-test pairs having all reruns being killed, survived, or both" | A kill is only credible when repeatable: the same mutant reads killed and survived across reruns, and about a third of rerun mutant-test pairs show both; one run cannot settle a verdict | queued | 2026-10-22 | 365d | — |
| S047 | PIT Mutation Testing FAQ, "Is it random?" — https://pitest.org/faq/ | docs | A | tool-documented non-determinism of a mutant's outcome between two runs of the same input | pitest-site gh-pages pages/faq.markdown at c15b349658a786c8b6a524d03587e89343011240 (2024-12-06; raw sha256 06f13aecf7e69024cf03daa1ff6ef234363c94a5aeda7fb5a5a557e0b687f724); § Is it random? → Timeouts, line 222 | "a mutant may be detected as timed out on one run, but killed or surviving on another" | Host timing pressure flips one mutant between timeout, killed and surviving, so a verdict needs a second agreeing run | queued | 2026-10-22 | 365d | — |
| S048 | Alshammari, Ammann, Hilton, Bell: A Study of Flaky Failure De-Duplication to Identify Unreliably Killed Mutants (Mutation 2024) — https://conf.researchr.org/details/icst-2024/mutation-2024-papers/5/A-Study-of-Flaky-Failure-De-Duplication-to-Identify-Unreliably-Killed-Mutants | paper | B | the reliably-killed versus incidentally-killed distinction (abstract only; full text not opened) | § Abstract; session Tue 28 May 2024 15:00-15:30; page undated, fetched 2026-10-22 | "19% of mutants killed by these flaky tests result from the flakiness introduced by at least one test" | A non-trivial share of apparent kills are flakiness artifacts; reliably killed must be separated from incidentally killed | queued | 2026-10-22 | 365d | — |
```

## Knowledge sentence for K43 clause (d) (proposed; no knowledge file yet states K43)

Target: a new `corpus/knowledge/gate-mutants.md` section for K43 (nothing under `corpus/knowledge/` mentions `gate-mutants`; `grep -rn 'K43|gate-mutants-v2|kill predicate' corpus/` returns no matches, so the C1 scribe creates the home).

> K43 clause (d) requires an immediate second run of the same mutated bytes to agree with the first on the same sorted `FAIL ` case names, because a single-run kill is not evidence: a test with different outcomes on the same mutant leaves it unclear whether it actually kills the mutant, and about a third of rerun mutant-test pairs show both killed and survived (S046); PIT documents that the same mutant may read timed out on one run and killed or surviving on another (S047). A disagreeing rerun is UNSTABLE, never KILLED; an evaluable first run whose verdict cannot be repeated is treated as no verdict at all (S048).

## Commands and observed output

- `curl -sSL https://par.nsf.gov/servlets/purl/10104340 -o shi-par-10104340.pdf` → `PDF document, version 1.5, 17 page(s)`; `pdftotext -layout` → 751 lines (752 with footer); sha256 as above.
- Page location of quote A: per-page `pdftotext` scan 1-9 printed `page 1: different-outcomes`; `1 INTRODUCTION` heading at page-1 line 44 and the sentence sits in the section's third paragraph.
- Quote B location: `page 1: abstract-rerun` from the same scan (abstract, page 1).
- Quote C location: scan printed `page 6: 38.0`; `4.3 RQ3: Mutant Execution Approaches` heading at page-6 line 45.
- Unknown-status definition: scan printed `page 4: unknown-definition`; §3.2 "Mutation Execution" heading at page-4 line 21.
- Word counts (`printf … | wc -w`): PIT FAQ quote 17; Shi intro quote 24; Shi §4.3 fragment 16; Shi abstract fragment 21 (counted by hand: mutation1 scores2 … status21); PIT issue quote 24; Alshammari quote 18.
- PIT FAQ revision: GitHub API `commits?path=pages/faq.markdown&per_page=1` → commit `c15b349658a786c8b6a524d03587e89343011240`, author/committer date `2024-12-06T11:23:50Z`, parent `2a8722ede1…`.
- PIT FAQ live page text matches the markdown byte-for-byte for the quoted sentence (checked both renderings).
- Petrović full-text search: `grep -i 'flaky|deterministic|re-?run'` over 1591 lines → only lines 379 (developer rerun) and 378; separate search `unstable|nondetermin|timeout|flak` → only "timeouts" as a network-call mutation example (line 413) and "timeout of a network call" (line 686). No outcome-instability statement.
- arXiv abs page: versions `[v1]` and `[v2]`; "Submitted on 22 Feb 2021 (v1), last revised 26 Feb 2021 (this version, v2)"; Comments "This work has been submitted to the IEEE for possible publication"; no Journal-ref.
- arXiv PDF sha256 `a9bdf44159a7b8a6f4b77d7e347650e52d9915bf68f765ff5333f7feee56a081` — identical to the anchor recorded in existing registry row S040.
- Leftover check: `pgrep -af 'kumitate-r43/seats/ScoutSrcFlaky'` → no matches (exit 1 from the filtering pipeline). No gate, selftest or suite was run, so no systemd-run bounds were needed. Scratch artifacts kept under `/fast/scratch/hyaku/kumitate-r43/seats/ScoutSrcFlaky/src/` for receipt checking.

## Confidence and remaining unknowns

- Confidence high for clause (d): four opened sources, one peer-reviewed paper with a formal statement plus measurement and a tool's own documentation of cross-run instability; the peer-reviewed paper's statement is exactly the K43 (d)/(UNSTABLE) semantics.
- Remaining unknown: the Alshammari 2024 full text (only the abstract was opened; no PDF link was offered on the page). The 19% figure and the reliably-killed distinction are therefore abstract-scope only, hence tier B.
- Remaining unknown: whether the TSE version of the Petrović paper adds a flaky-mutant rule; the published version was not accessible and the arXiv record gives no identifier for it. Nothing in this report depends on it.
