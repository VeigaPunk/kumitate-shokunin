RESULT ScoutSrcKillDef rev=e5ffcbe7f155b89cb1870f9da7b0d671d092948b verdict=found sources=2 reject_candidates=1

# K43 clauses (a)-(c): sources for "kill read off the run's reported failure" and "crash/timeout is not a kill"

Scope: this seat opened sources and wrote this report; nothing else was written in the lane.
`corpus/SOURCES.md` was read first (45 rows, S001-S045). No URL it already holds was re-proposed
(S034 Stryker and S039 PIT untouched); the URLs below are new and absent from the registry. Every
source was opened by ordinary HTTPS GET (curl and the reader); no browser, no challenge, no
credential. Access date 2026-10-22, clock readings in Evidence. Quoted bytes were fetched at a
pinned commit through GitHub raw and hashed locally; each quote was then confirmed by exact
substring match in those bytes (line numbers below), so no sentence is stitched across markup.

## Accepted source 1 — a kill is read off the test run's reported failure (K43 (b)-(c))

Infection (PHP mutation testing framework), official guide, page "Introduction", file
`guide/index.md` — https://infection.github.io/guide/ ; raw bytes at commit
`4d7570f512c9ce6e76203ec192b0009a0b3ac4ce` (branch `main` head, `git ls-remote` 2026-10-22),
file sha256 `8a3d6254e64d469b0c7be70957d92c0cf44d174f2917b428bf730f42eae105dc`, 5041 bytes.
Kind `docs`, tier A: the tool's own statement of its outcome vocabulary.

Located verbatim quote, line 13 of the pinned file (12 words):

> "If mutated program produces failing tests, this is called a killed mutant."

Line 35 of the same file (10 words) shows the outcome categories are collected separately:

> "collects the results of killed, escaped Mutants, errors and timeouts"

Position: supports K43 (c) — a kill is read from the run's reported failing tests, not from the
mutation and not from any abnormal termination — and supports the validity half of K43 (a) by
naming errors and timeouts as outcome categories of their own. Caveat to record: Infection's
*score* aggregates them (line 94: "MSI is 47%. This means that 47% of all generated mutations
were detected (i.e. kills, timeouts or fatal errors)", formula `TotalDefeatedMutants = KilledCount
+ TimedOutCount + ErrorCount`). That is a scoring convention, not a kill definition; do not cite
Infection for an aggregate in which a timeout counts as a kill. K43's stricter reading (a
timed-out run is not evaluable, hence not killed) is consistent with the per-outcome categories
and stricter than the aggregate.

## Accepted source 2 — a timed-out / pathological run is not a killed mutant (K43 (a))

Cosmic Ray (Python mutation testing tool), official documentation, page "Concepts", file
`docs/source/concepts.rst` — https://cosmic-ray.readthedocs.io/en/latest/concepts.html ; raw bytes
at commit `f6550adf46ead19865285f18db528fcc4e38a3a7` (branch `master` head, `git ls-remote`
2026-10-22), file sha256 `1603d6159c1ce11b6db99e61fcc546ea076a055310aacaf07b2e11d609191286`,
8701 bytes. Kind `docs`, tier A.

Located verbatim quote, lines 178-179 of the pinned file (21 words):

> "if a test of a mutant takes longer than the timeout, the test is killed, and the mutant is
> marked incompetent"

The two preceding sentences (lines 176-177) open: "One difficulty mutation testing tools have to
face is how to deal with mutations that result in infinite loops (or other pathological runtime
effects)." Line 120 (14 words) states the kill condition in the other direction:

> "Given that a single failing test case is sufficient to kill a mutant"

Position: supports K43 (a) and (c) together. The source uses "killed" for the *test process* the
timeout terminated, while the *mutant* is marked "incompetent" — a timed-out run therefore never
yields a killed mutant, which is exactly K43's clause that a kill requires an evaluable run that
reports failure. Line 120 says one reported failing test case suffices, i.e. the verdict comes
from the run's report, not from counting failures.

## Corroborating primary source — exit status is necessary but not sufficient for a kill

cargo-mutants (Rust mutation testing tool), official book, page "Exit codes", file
`book/src/exit-codes.md` — https://mutants.rs/exit-codes.html ; raw bytes at commit
`6c720ae82a1784b84cfa06066f7b0d59ed1798d0` (branch `main` head, `git ls-remote` 2026-10-22),
file sha256 `e7ece5add68712cdfe289fbca6a6ffe474440232956de0b5a0a80594966ebf01`, 864 bytes.

Line 5 (13 words): "Success! Every viable mutant that was tested was caught by a test."
Lines 11-12 (17 words): "Some tests timed out: possibly the mutations caused an infinite loop, or
the timeout is too low."

Position: supports K43 (b) as necessary while showing it is not sufficient — this tool gives a
timed-out run its own non-zero exit class (3), so a non-zero status alone cannot mean "killed".
This is the cleanest tool-level statement that K43 needs both a numeric non-zero exit and the
explicit `VERDICT: FAIL` line.

## Peer-reviewed corroboration — definition and validity boundary

Papadakis, Kintis, Zhang, Jia, Le Traon, Harman, "Mutation Testing Advances: An Analysis and
Survey" (Advances in Computers vol. 112, 2019); author-hosted preprint —
https://mutationtesting.uni.lu/survey.pdf , fetched 2026-10-22T22:26:31Z, HTTP 200, sha256
`63b7bfca877cd4661cb24e93fbfe1757a2740b39fb65ee3a79eb17e36215f023`, 1129278 bytes. Section 2
"Background", page 6 of the preprint (24 words):

> "When a test distinguishes the behaviour of a mutant (from that of the original program) we say
> that the mutant is 'killed' or 'detected'"

Same page (17 words): "Some mutants are syntactically illegal, e.g., cannot compile, named
'stillborn' mutants, and have to be removed."

Position: supports K43 (c) (a kill is the test's distinguishing result) and the validity half of
K43 (a) (a mutant that cannot execute is removed, not counted as killed). The published chapter
is paywalled; the quote is from the authors' preprint and the row must say so. The canonical
closed survey (Jia & Harman, TSE 2011) was attempted first for this role; its author copy at
crest.cs.ucl.ac.uk timed out on three attempts (http and https), so it is not used.

## Rejected candidate (opened, not used)

"Mutation Testing: A Practical Overview", https://softengbook.org/articles/mutation-testing ,
fetched 2026-10-22 (served as text/markdown). Rejected on three grounds: tertiary (a course-site
overview, not the tool's or a paper's own text); unanchored (no revision, version or date on the
page); and it contradicts primary rows on the metric — it prints "mutation score = number of
killed mutants / total number of generated mutants", a denominator of all generated mutants,
whereas the registry's primary rows define the score over valid mutants (S034: "detected /
valid"). Its kill sentence ("A mutant is said to have been killed when it is detected by at least
one existing test.") is right in substance but adds nothing a tier-A source does not state
better.

## Unopened, recorded

- Du, Palepu, Jones, "To Kill a Mutant: An Empirical Study of Mutation Testing Kills", ISSTA
  2023, DOI 10.1145/3597926.3598090 — the closest peer-reviewed study of what makes a test kill a
  mutant. Opened only as the ACM landing page and the ACM PDF, both HTTP 403; OpenAlex reports it
  as hybrid open access with `any_repository_has_fulltext: false`, so the ACM copy is the only
  one. Per the sourcing rule I did not attempt to pass the access control; recorded as unopened.
  (A search-index snippet attributes to its abstract "the substantial contribution of 'crashes'
  to test failures leading to mutant kills" — snippet only, not opened, not evidence.) A seat
  that can open it should mine it for K43 (a) and (d).

## Proposed SOURCES.md rows (next free id S046; S001-S045 exist)

```markdown
| S046 | Infection official guide (PHP mutation testing) — https://infection.github.io/guide/ | docs | A | killed versus escaped mutants and the separately collected error/timeout outcomes | guide/index.md:13 and :35 @ commit 4d7570f512c9ce6e76203ec192b0009a0b3ac4ec (main head 2026-10-22), file sha256 8a3d6254e64d469b0c7be70957d92c0cf44d174f2917b428bf730f42eae105dc; opened 2026-10-22T22:26Z | "If mutated program produces failing tests, this is called a killed mutant." A kill is read off the run's reported failing tests; errors and timeouts are collected as their own outcomes. Do not cite for the MSI aggregate (KilledCount + TimedOutCount + ErrorCount) | mined | 2026-10-22 | 180d | corpus/knowledge/… (fill when cited) |
| S047 | Cosmic Ray official docs, page Concepts — https://cosmic-ray.readthedocs.io/en/latest/concepts.html | docs | A | a timed-out run is "incompetent", never a killed mutant | docs/source/concepts.rst:120 and :176-179 @ commit f6550adf46ead19865285f18db528fcc4e38a3a7 (master head 2026-10-22), file sha256 1603d6159c1ce11b6db99e61fcc546ea076a055310aacaf07b2e11d609191286; opened 2026-10-22T22:26Z | "if a test of a mutant takes longer than the timeout, the test is killed, and the mutant is marked incompetent" — the timeout kills the test process, the mutant outcome is incompetent; "a single failing test case is sufficient to kill a mutant" | mined | 2026-10-22 | 180d | corpus/knowledge/… (fill when cited) |
```

Optional rows, add only if cited: S048 cargo-mutants book `book/src/exit-codes.md` @
`6c720ae82a1784b84cfa06066f7b0d59ed1798d0` (sha256 `e7ece5ad…`) — "caught" requires a failed
test, a timed-out run has its own non-zero exit class; S049 Papadakis et al. survey preprint
(sha256 `63b7bfca…`) — killed/detected by a test distinguishing behaviour; stillborn mutants are
removed.

## Confidence and remaining unknowns

- Confidence high on all four quotes and the two required roles: exact substring match against
  hashed bytes at named commits.
- Unknown: K43 (d) (second-run agreement) is not supported by any source opened here — it is the
  lane's own anti-flake rule. The natural source for crash/flake-driven kills is the ISSTA 2023
  study above (unopened); Papadakis section 9 (best practices) may discuss flakiness but was not
  read this seat (artifact pages 1-25 only).
- Unknown: whether Cosmic Ray's "incompetent" also covers exception/error runs beyond the timeout
  case was not verified from Cosmic Ray's own pages; the timeout statement is what was located.

## Evidence (commands and observed output)

1. Registry read first; `grep -c '^| S0' corpus/SOURCES.md` → `45`; `grep -o '^| S0[0-9][0-9]' … |
   tail -3` → S043, S044, S045 (next free id S046).
2. `grep -n -i 'infection|cosmic-ray|cargo-mutants|mutationtesting.uni.lu|softengbook|3597926|
   Papadakis' corpus/SOURCES.md` → no match (none of the proposed URLs already held; S034 and S039
   not re-proposed).
3. `git ls-remote https://github.com/infection/infection.github.io HEAD refs/heads/main` →
   `4d7570f512c9ce6e76203ec192b0009a0b3ac4ce` (HEAD and main), 2026-10-22.
4. `git ls-remote https://github.com/sixty-north/cosmic-ray HEAD refs/heads/master` →
   `f6550adf46ead19865285f18db528fcc4e38a3a7`.
5. `git ls-remote https://github.com/sourcefrog/cargo-mutants HEAD refs/heads/main` →
   `6c720ae82a1784b84cfa06066f7b0d59ed1798d0`.
6. Pinned raw fetches (curl, 2026-10-22T22:26:31Z): infection guide/index.md `200 5041`;
   cosmic-ray docs/source/concepts.rst `200 8701`; cargo-mutants book/src/exit-codes.md
   `200 864`; papadakis survey.pdf `200 1129278`.
7. `sha256sum` in /fast/scratch/hyaku/kumitate-r43/seats/ScoutSrcKillDef →
   `8a3d6254e64d469b0c7be70957d92c0cf44d174f2917b428bf730f42eae105dc` (infection),
   `1603d6159c1ce11b6db99e61fcc546ea076a055310aacaf07b2e11d609191286` (cosmic-ray),
   `e7ece5add68712cdfe289fbca6a6ffe474440232956de0b5a0a80594966ebf01` (cargo-mutants),
   `63b7bfca877cd4661cb24e93fbfe1757a2740b39fb65ee3a79eb17e36215f023` (papadakis).
8. Exact-match greps over the fetched bytes: infection-guide-index.md line 13 "…produces failing
   tests, this is called a killed mutant…", line 35 "collects the results of killed, escaped
   Mutants, errors and timeouts", line 94 the MSI aggregate sentence; cosmic-ray-concepts.rst
   line 120 "a single failing test case is sufficient to kill a mutant", lines 177-179 the
   timeout/incompetent sentences; cargo-mutants-exit-codes.md line 5 caught-by-a-test, lines 11-12
   exit 3 timed out.
9. Live pages HTTP 200 (`curl -sS -I`, 2026-10-22T22:26:43Z): infection.github.io/guide/,
   cosmic-ray.readthedocs.io/en/latest/concepts.html, mutationtesting.uni.lu/survey.pdf,
   mutants.rs/.
10. Rejected candidate opened: softengbook.org/articles/mutation-testing (text/markdown), score
    formula and kill sentence present as quoted.
11. Unopened: `dl.acm.org/doi/10.1145/3597926.3598090` → HTTP 403; `dl.acm.org/doi/pdf/…` → HTTP
    403; `api.openalex.org/works/doi:10.1145/3597926.3598090` → `is_oa: true`, `oa_status:
    hybrid`, `any_repository_has_fulltext: false`, `oa_url` is the ACM PDF; crest.cs.ucl.ac.uk
    JiaH09b.pdf / JiaH10.pdf (http and https) → connect timeout on three attempts.
12. Leftover check: `pgrep -af kumitate-r43/seats/ScoutSrcKillDef` → no leftover processes.
    Scratch: /fast/scratch/hyaku/kumitate-r43/seats/ScoutSrcKillDef, mode 0700, five fetched files
    hashed above.
13. Tooling: no installs or upgrades; no git writes anywhere (ls-remote only, remote, read-only);
    the only lane write is this report.
