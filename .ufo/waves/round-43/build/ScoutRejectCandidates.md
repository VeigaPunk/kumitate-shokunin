RESULT ScoutRejectCandidates verdict=rejected rejects=2

# ScoutRejectCandidates — round 43 wave 1 (C1 source candidates, rejected)

Read-only seat. Lane revision read: `e5ffcbe7f155b89cb1870f9da7b0d671d092948b`. Nothing written
in the lane except this report; no gate, selftest or node run; no patch; no tool install. All
sources were opened by ordinary HTTPS or the public Stack Exchange API on 2026-10-22 (UTC clock
readings below); no headless browser, no challenge or access-control bypass, no paywall bypass.
Bar applied: `corpus/QUALITY.md` Q1–Q24 and the tier rules of `SOURCES-CONTRACT-v1` rule 3
(A primary or authoritative; B strong secondary with reproducible detail; C lead only, never sole
support; `community` is never A).

Question: which sources would a hurried author reach for when sourcing the knowledge text behind
C1/K43 (kill definition, false kill under flaky tests, equivalent mutants), and does each survive
the admission bar? Two near-miss candidates are rejected below; one near-miss is held, not
rejected, and named so the reject count is not padded.

## Summary

| # | candidate | kind / best defensible tier | decision | criterion |
|---|---|---|---|---|
| R1 | Stack Overflow 73439324, PiTEST "Impossible to kill" thread | community / C | reject | Q2 |
| R2 | CircleCI blog, "What is mutation testing?" | community (vendor marketing) / B at most | reject | Q3 (Q2 secondary) |
| H1 | mutation-testing-patterns, "Mutant killed due to flaky test" | book / B | hold, not reject | Q1 (pin available) |

## R1 — Stack Overflow 73439324 (equivalent mutants cannot be killed)

- URL: <https://stackoverflow.com/questions/73439324/java-mutation-testing-pitest-changed-conditional-boundary-%E2%86%92-survived-imp>
- Accessed 2026-10-22 via the public Stack Exchange API (`site=stackoverflow`); reader method
  `stackexchange`, no browser and no challenge. Question asked 2022-08-22. Answer 74067880 by
  nrainer, score 1, created 2022-10-14T10:27:25Z, `accepted=false`; second answer 73447929,
  score 0 (API check 2026-10-22T22:20Z).
- Located quote (answer 74067880, paragraph 1): "Such a syntactical change to the source code
  that does not change the semantics is called an equivalent mutant." (19 words; the next
  sentence reads "It cannot be killed by definition.")
- Decision: reject.
- Reason: Q2 — kind `community` is never tier A, and a tier C row is never sole support
  (`SOURCES-CONTRACT-v1` rule 3). The sentence a C1 author needs ("cannot be killed") exists
  nowhere else in the registry as a primary statement; citing this thread would make a tier C
  answer the sole support for the equivalence/SURVIVED distinction. The answer's one normative
  crutch is itself a pointer to the PIT mutators page
  (<https://pitest.org/quickstart/mutators/>), which is not in the registry (S039 anchors
  pitest.org home and FAQ only). The thread is commentary: the two answers disagree on the
  remedy (leave the code alone versus reorder the condition), so it is not a statement of record.
- Flip: open and cite the PIT mutators page (or another tool maintainer's definition) at a named
  release, in a tier A row. With that primary row open, this thread is at most a lead.

## R2 — CircleCI blog "What is mutation testing?" (threshold constant)

- URL: <https://circleci.com/blog/what-is-mutation-testing/>
- Accessed 2026-10-22; HTTP 200; body sha256 `47f2a1f0638dd3f474b6bec8a02317224ccb2c289298c165cf3e199d8801f951`;
  byline Roger Winter, "Content Marketing Manager"; published 2026-06-25; 18 min read.
- Located quote (§ "When should a team start using mutation testing?", last bullet "Don't chase
  100%"): "A floor of 60–80% on high-risk modules is the realistic target." (12 words)
- Decision: reject.
- Reason: Q3 — the article's only quantitative contribution is a 60–80% floor with no counting
  command, sample, dataset, revision or explicit `recalled` label; it is a recommendation stated
  as a target. This is the defect class the lane already rejected as S043 (arika.dev's 80%
  threshold). Q2 is a secondary ground: vendor marketing is `community`, never tier A, and the
  article's state vocabulary is a rendition of primary rows the lane already holds (S023 and S034
  Stryker states; S039 PIT), so the row adds no primary text. Its companion generalization, "Most
  tools count timeouts as killed, since the hang itself reveals the change." (14 words), is also
  unmeasured, and it contradicts K43's classification of a timeout as a non-evaluable run rather
  than a kill; a hurried author would import the wrong outcome class.
- Flip: a measured threshold at a named revision or tool release, or the maintainer's own
  statement for the tool the lane actually runs. That would source a threshold; it still would
  not source K43's kill vocabulary.

## H1 — held, not rejected (stated so the reject count is not padded)

`https://mutation-testing-patterns.readthedocs.io/en/latest/python/example_02/README.html`,
opened 2026-10-22. The reader resolved the page to its raw source,
`https://github.com/atodorov/mutation-testing-in-patterns/raw/master/python/example_02/README.rst`
(sha256 `21b3fc5f42ce01a701779dfd911f51b16eb9013626bb18dd3ac1316621dcd2b4`); the repo's master
head was `f623c36fe330a65cd19a5fcc27973eb4db0c5e18` (`git ls-remote`, 2026-10-22T22:19Z). Quote,
section "Mutant killed due to flaky test": "Sometimes mutants may be falsely reported as killed
simply because the test case failed." (14 words). This is the closest on-point statement to
K43's false-kill concern, but it is not a reject: the text is pinnable at `f623c36f`, and the
example is a stateful filesystem test (leftover `test.txt` between runs), not the host-pressure
flake K43's second-run agreement guards. If it is ever cited, pin the commit and name the Cosmic
Ray version: the reproducer installs `https://github.com/sixty-north/cosmic-ray/zipball/master`,
a moving head, which is Q8 as served.

## Leads not opened

The search surfaced open primary papers on flaky kills — "Mitigating the Effects of Flaky Tests on
Mutation Testing" (ISSTA 2019) and "Test Flimsiness" (ICSE 2026, Parry et al.), plus the ICSE 2024
flaky-failure de-duplication study. This seat did not open them; they are leads for the cite
seat, not rows, and are not rejects.

## Evidence commands (run 2026-10-22, UTC)

```
date -u                                  -> 2026-10-22T22:20:13Z / 22:21:03Z
curl -sS 'https://api.stackexchange.com/2.3/questions/73439324/answers?site=stackoverflow&filter=withbody'
  -> answer 74067880 score 1 created 2022-10-14T10:27:25Z accepted false
  -> answer 73447929 score 0 created 2022-08-22T15:57:52Z
curl -sSL https://circleci.com/blog/what-is-mutation-testing/ -o circleci.html
  -> HTTP 200; grep matches both sentences quoted above; sha256 47f2a1f0…f951
git ls-remote https://github.com/atodorov/mutation-testing-in-patterns refs/heads/master
  -> f623c36fe330a65cd19a5fcc27973eb4db0c5e18  refs/heads/master
curl -sSL …/raw/master/python/example_02/README.rst | sha256sum -> 21b3fc5f…d2b4
```
