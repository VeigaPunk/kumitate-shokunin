RESULT ScoutMutationSource rev=- verdict=found source=https://pitest.org/

# C1 source: mutation testing as a standing / code-review gate

Lane revision read: b237e3f09c9559e130c7367bd2efa981c4ea516f (report-only seat; nothing else
written in the lane). All pages opened by ordinary HTTPS GET (curl / reader), no browser, no
challenge, no credential. Access date: 2026-10-22 (UTC); clock readings below.

## Accepted primary source

PIT Mutation Testing, official documentation — homepage <https://pitest.org/> and FAQ
<https://pitest.org/faq/> (same project, same host). Kind `docs`, tier A: the maintainers' own
statement of what their mutation tool does, which is exactly the claim scope C1 needs.

Server headers read 2026-10-22T19:58:02Z:

- `https://pitest.org/` — HTTP 200, `last-modified: Wed, 03 Jun 2026 08:45:38 GMT`,
  body sha256 `b0c7e0505c51c95b596060ef27babbce08e72d5aaf4557eb002c2637d2bf10cc`
- `https://pitest.org/faq/` — HTTP 200, `last-modified: Wed, 03 Jun 2026 08:45:37 GMT`,
  body sha256 `ccf6ac493d6935e2f0a90b716254c57024973d5e2bf1bf3c1e8e60b9772629c1`

## Located verbatim quotes (each <= 25 words)

Q1 — mutants run against the existing tests; passing tests leave the mutant alive, i.e. survival
is the signal of a test gap. Homepage, § "What is mutation testing?" first paragraph:

> "If your tests fail then the mutation is killed, if your tests pass then the mutation lived."
> (17 words; inline `<strong>` on "killed" and "lived" elided, text verbatim)

Q1b — the same page names the consequence for the suite. Homepage, § "What?", second paragraph:

> "If a unit test does not fail in this situation, it may indicate an issue with the test suite."
> (19 words)

Q2 — timeout handling. FAQ, § "I'm seeing a lot of timeouts, what's going on?", second paragraph:

> "In order to detect infinite loops PIT measures the normal execution time of each test without
> any mutations present." (19 words)

The FAQ continues (not quoted, since > 25 words): a mutated run is expected to finish within
`normal time * x + y`; a timeout can mean either a real infinite loop **or** PIT wrongly
believing one occurred, and it is adjustable via `--timeoutConst`. So the source states that a
timeout is a measured, separately classified outcome, not a test failure — which is the
distinction the lane's `killed` definition needs.

Q3 — the standing-gate half of the claim, stated twice on the homepage:

> "The most effective way to use mutation testing is to run it frequently against only the code
> that has been changed." (21 words; `<strong>` on "frequently" elided)

> "Once it has been integrated into the build file, pitest can be run locally by developers, or
> automatically against pull requests and merge requests" (24 words; trailing link markup elided)

## Corroborating primary sources (same claim, independent project / independent operator)

### Stryker Mutator docs — thresholds and break

`https://stryker-mutator.io/docs/stryker-js/configuration/`, fetched 2026-10-22T19:56Z, HTTP 200
(`last-modified: Thu, 22 Oct 2026 16:23:06 GMT` is a site redeploy stamp, so it is not treated
as content age); body sha256 `031afe0c15bee1aaf98fd3f5ed931785ddd77d912ab81e4ac893e47d68e01060`.
§ `thresholds`:

> "Stryker will exit with exit code 1, indicating a build failure." (11 words)

The surrounding bullet is `mutation score < break`, i.e. a configured score floor turns a
survivor into a failing build — directly the "standing gate with a break threshold" shape.

### Stryker Mutator docs — mutant states and metrics

`https://stryker-mutator.io/docs/mutation-testing-elements/mutant-states-and-metrics/`, same
fetch time, body sha256 `5295e9bb464367c8287d4d56d822b01710edd744a2445fd73a222f405e4cc450`.
§ "Mutant states":

> "When at least one test failed while this mutant was active, the mutant is killed." (15 words)
> "When all tests passed while this mutant was active, the mutant survived." (12 words)
> "The running of tests with this mutant active resulted in a timeout." (12 words)

Timeout, Runtime error and Compile error are separate states; the runtime-error bullet ends
"It is not represented in your mutation score." This matches the lane's rule that a crash or
timeout is not a kill. **Caveat to record:** Stryker's aggregate metric `Detected = killed +
timeout`, so in Stryker's *score* a timeout counts as detected even though its *state* is not
"Killed". The lane's stricter rule (timeout is never a kill) is consistent with the state
definitions and stricter than Stryker's aggregate score — do not cite Stryker for the
aggregate.

### Petrović, Ivanković, Fraser, Just — "Practical Mutation Testing at Scale: A view from Google"

<https://arxiv.org/abs/2102.11378> (v2, 26 Feb 2021; abs page fetched 2026-10-22T19:56Z,
`last-modified: Mon, 24 Aug 2026 19:56:58 GMT`, body sha256
`aaf66df07f514232c0eb1cdf010c9db99a1a9e886c9a6a3f933c54fb32eceeda`; full text read from
`https://arxiv.org/pdf/2102.11378`). Abstract:

> "Mutation testing is done incrementally, mutating only changed code during code review, rather
> than the entire code base" (18 words; numbering "(1)" elided)

> "Mutation analysis assesses a test suite's adequacy by measuring its ability to detect small
> artificial faults, systematically seeded into the tested program." (22 words)

§ 2.3 states the run/measurement order first-hand: mutants are generated for a changelist, "then
tests are executed in parallel for all those states", and surviving mutants are surfaced as
findings in the code review UI (§ 2.4). § 5.3 reports 87.5% of generated mutants killed by the
initial test suite. Scale: 24,000+ developers, 1,000+ projects, 16,935,148 mutants (§ 5.1).
This is the strongest evidence that a per-change mutation gate is operated, not merely proposed.

## Rejected candidates (opened, not used as evidence)

- **<https://stryker-mutator.io/docs/stryker-js/introduction/>** — fetched 2026-10-22, HTTP 200.
  Rejected: thin landing page; it names no mutant outcome, no threshold and no test-suite claim,
  only links to "getting started". Nothing there can carry a claim.
- **arXiv 2102.11378 as the timeout/error source** — rejected for that sub-claim only: the paper's
  occurrences of "timeout" are about mutating *network-call timeout literals* (an unproductive
  mutant, § 5.1), not about bounding a mutated test run. It states no run-level timeout policy, so
  the timeout/error question is answered from PIT and Stryker instead.
- Not opened, not needed: Petrović & Ivanković, "State of Mutation Testing at Google" (ICSE-SEIP
  2018). The arXiv paper above covers the same operational claim and was opened in full.

## Proposed SOURCES.md row (next free id confirmed: S039; S001..S038 exist)

```markdown
| S039 | PIT Mutation Testing official docs — https://pitest.org/ and https://pitest.org/faq/ | docs | A | mutation testing as a standing code-review/build gate: mutants run against the existing suite, survival marks a test gap, timeouts are separately measured | § What is mutation testing? and § How to use it? (home); FAQ § I'm seeing a lot of timeouts, what's going on?; HTTP 200, Last-Modified Wed, 03 Jun 2026 08:45:38 GMT (home) / 08:45:37 GMT (faq), fetched 2026-10-22T19:56Z, sha256 b0c7e0505c51c95b… (home), ccf6ac493d6935e2… (faq) | "If your tests fail then the mutation is killed, if your tests pass then the mutation lived." Survival marks a test gap; run against only the code that changed and wire it to the build or pull requests; timeouts are found by timing the unmutated test (normal time * x + y), and a timeout may be a real loop or a wrong guess | mined | 2026-10-22 | 365d | REPLACE-WITH-C1-KNOWLEDGE-SECTION |
```

Writer's duty: replace the `used-by` cell with the knowledge file/section C1 cites, or set it to
`—` if the row is cited only from the lesson. Do not widen the `teaches` cell into the Stryker
`Detected = killed + timeout` aggregate (see caveat above).

## Confidence and remaining unknowns

- Confidence: high on all three sub-claims (quotes verified against raw fetched bodies by exact
  string match, with surrounding markup inspected so no sentence was stitched across tags).
- Unknown: whether PIT's *report* counts a timed-out mutant inside or outside its mutation score
  was not verified from PIT's own pages in this seat (the FAQ only classifies the cause). The
  lane does not need it: the gate defines its own verdicts, and Stryker's state model supplies
  the vocabulary.
- Unknown: no second independent *paper* on a standing review gate was opened beyond the arXiv
  v2 above; the ICSE-SEIP 2018 paper remains unopened by choice, not by access failure.

## Evidence (commands and observed output)

1. `curl -sSI https://pitest.org/` → `last-modified: Wed, 03 Jun 2026 08:45:38 GMT`, `date: Thu, 22 Oct 2026 19:58:02 GMT`
2. `sha256sum pitest-home.html` → `b0c7e0505c51c95b596060ef27babbce08e72d5aaf4557eb002c2637d2bf10cc`
3. `sha256sum pitest-faq.html` → `ccf6ac493d6935e2f0a90b716254c57024973d5e2bf1bf3c1e8e60b9772629c1`
4. `grep -o -F "If your tests fail then the mutation is" pitest-home.html` → `pitest-home.html:If your tests fail then the mutation is`
5. `grep -o -E 'if your tests pass then.{0,120}' pitest-home.html` → line ends the sentence at the `<strong>lived</strong>` tag; text extraction gives "…then the mutation lived."
6. `grep -o -F "If a unit test does not fail in this situation, it may indicate an issue with" pitest-home.html` → match, line 1
7. `grep -o -E 'The most effective way to use mutation testing.{0,240}' pitest-home.html` → `…is to run it <strong>frequently</strong> against only the code that has been changed.<p>`
8. `grep -o -E 'Once it has been integrated.{0,220}' pitest-home.html` → `…into the build file, pitest can be run locally by developers, or automatically against pull requests and merge requests using <a href=…`
9. `grep -o -F "In order to detect infinite loops PIT measures the normal execution time of each test" pitest-faq.html` → match
10. `grep -o -F "In order to battle infinite loops, a test run gets killed after a certain period of time." stryker-config.html` → match
11. `grep -o -F "Stryker will exit with exit code 1, indicating a build failure." stryker-config.html` → match (inside the `<code>mutation score &lt; break</code>` bullet)
12. `grep -o -F "When at least one test failed while this mutant was active, the mutant is killed." stryker-states.html` → match
13. `grep -o -F "When all tests passed while this mutant was active, the mutant survived." stryker-states.html` → match
14. `grep -o -F "The running of tests with this mutant active resulted in a timeout." stryker-states.html` → match
15. `grep -o -F "It is not represented in your mutation score." stryker-states.html` → two matches (runtime-error and compile-error bullets)
16. `curl -sSI https://stryker-mutator.io/docs/stryker-js/configuration/` → `last-modified: Thu, 22 Oct 2026 16:23:06 GMT` (same-day redeploy; not used as content age)
17. `curl -sSI https://arxiv.org/abs/2102.11378` → `last-modified: Mon, 24 Aug 2026 19:56:58 GMT`
18. `sha256sum arxiv-abs.html` → `aaf66df07f514232c0eb1cdf010c9db99a1a9e886c9a6a3f933c54fb32eceeda`
19. Full text read at `https://arxiv.org/pdf/2102.11378`: § 2.3 "tests are executed in parallel for all those states", § 2.4 surviving mutants surfaced as findings, § 5.3 "87.5% of all generated mutants are killed by the initial test suite", § 5.1 16,935,148 mutants / 776,740 changelists
20. `grep -n '^| S039' corpus/SOURCES.md` → no match, exit 1; `grep -c '^| S0' corpus/SOURCES.md` → `38` (S001..S038 taken)

Tooling: no installs, no upgrades, nothing added to the host. Scratch pages kept only under
`/fast/scratch/hyaku/kumitate-r42/seats/ScoutMutationSource/` (5 files, hashed above).
