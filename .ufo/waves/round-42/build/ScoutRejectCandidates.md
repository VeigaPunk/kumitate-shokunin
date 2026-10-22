# ScoutRejectCandidates — round 42 wave 1 (R41-1, same-round rejects)

RESULT ScoutRejectCandidates rev=- verdict=rejected opened=8 rejects=8 unopened=2 candidates=10

Read-only seat: no lane file edited, no gate run, no patch produced. The lane documents named
below were read at lane master `b237e3f09c9559e130c7367bd2efa981c4ea516f`; no git command was run.
All sources were opened on 2026-10-22 by ordinary fetch (no headless browser, no challenge or
paywall bypass); two fetch failures are recorded as unopened, per the binding sourcing rule.

Question: which sources would a hurried author reach for when sourcing C1 (the `gate-mutants`
instrument and its mutation-testing vocabulary) or C2 (declaring the host root child
`~/.kimi-code/locks`), and does each survive the lane's admission bar?

Bar applied: `corpus/QUALITY.md` Q1 (header triple, exact anchor — a CMS "Last Updated" is not a
revision), Q2 (tier C is never sole support), Q3 (a count carries its command), Q8 (version skew
named), Q9 (one domain), plus `CORPUS.md` § "SOURCES.md — where a shokunin learns": tiers are
scoped per row; `community` is never tier A; a row is written only after opening the source; an
anchor is never a bare homepage; a rejected row reads `REJECTED: <reason>; flip: <what would
change the verdict>`.

Outcome: zero admits. Eight opened candidates rejected; two candidates could not be opened and
are therefore leads, not rows.

## Summary

| # | target | candidate | best defensible kind / tier for this scope | decision |
|---|---|---|---|---|
| R1 | C1 | GeeksforGeeks "Mutation Testing – Software Testing" | community / C | reject |
| R2 | C1 | arika.dev "Mutation Testing in CI Without Burning the Budget" | community / B at most | reject |
| R3 | C1 | dev.to "Mutation testing in 5 minutes …" | community / C | reject |
| R4 | C2 | www.kimi-cli.com "Data Locations" | docs (third-party mirror) / C | reject |
| R5 | C2 | moonshotai.github.io/kimi-cli "Data Locations" | docs / A for the archived legacy product only | reject for this scope |
| R6 | C2 | Stack Overflow 185451, `mkdir` lock answer | community / C | reject |
| R7 | C2 | GitHub issue MoonshotAI/kimi-code#2736 | community / C | reject |
| R8 | C2 | GitHub issue MoonshotAI/kimi-code#1924 | community / C | reject as the member's source |
| U1 | C1 | blog.stackademic.com (Medium) Stryker article | unopened (HTTP 403) | unopened — not a row |
| U2 | C2 | deepwiki.com MoonshotAI/kimi-cli and /kimi-code | unopened (HTTP 429 twice) | unopened — not a row |

## Candidates

### R1 — GeeksforGeeks, "Mutation Testing – Software Testing" (C1)

- URL: https://www.geeksforgeeks.org/software-engineering/software-testing-mutation-testing/
- Accessed: 2026-10-22. Page states "Last Updated: 9 Jun, 2026"; meta published 2019-05-15; no
  author byline rendered.
- Located quote (§ Process of Mutation Testing, "Compare Results" bullet): "If outputs differ,
  the mutant is killed; if not, it survives." (12 words)
- Decision: reject.
- Reason: Q1 — an anonymous tertiary teaching page with no revision anchor; a CMS update stamp is
  not a revision, so a count or definition cited to it cannot be re-measured. Q2/tier — best
  defensible tier is C, and C is never sole support. Substantive — it defines a kill by output
  divergence, not by a test failing, which contradicts the Stryker vocabulary the lane already
  holds (S023 "Killed = a test failed while the mutant was active"; S034 "a mutant that only
  crashes the run is a runtime error, not a kill"). Citing it would license a gate that scores a
  crash or a divergent-output run as a kill.
- Flip: the page gains a named maintainer author and a real revision, and its kill definition
  becomes "at least one test failed". Even then it would duplicate S023/S034 and add nothing.

### R2 — arika.dev, "Mutation Testing in CI Without Burning the Budget" (C1)

- URL: https://www.arika.dev/blog/engineering/mutation-testing-in-ci/
- Accessed: 2026-10-22. Byline "Ravinder", published 2025-12-12; no tool version, no data file.
- Located quote (§ How Mutation Testing Works, closing paragraph): "A mutation score of 80% is a
  reasonable starting threshold for well-tested business logic." (15 words)
- Decision: reject.
- Reason: Q3 — the 80%/60% constants carry no counting command, sample or measurement, so they are
  recalled numbers presented as guidance. Tier — a self-published company blog is B at most for a
  practice claim, never A for a threshold the lane would gate on. Scope — C1 does not score a
  percentage; it runs a frozen manifest and prints per-mutant `killed|survived|nomatch|crash|
  timeout`, so a score threshold is the wrong instrument on top of being unsourced. The PIT 1.16.1
  in the example config is a snippet, not evidence for the threshold; Q8 still applies because the
  numbers are tied to no tool release or measured corpus.
- Flip: the threshold is backed by a published measurement at a named revision, or it is stated by
  the maintainer of the tool the lane actually runs, scoped to that tool's version. That would
  source a threshold, still not the kill vocabulary.

### R3 — dev.to, "Mutation testing in 5 minutes: catch the tests that secretly test nothing" (C1)

- URL: https://dev.to/rollamadugu/mutation-testing-in-5-minutes-catch-the-tests-that-secretly-test-nothing-2o67
- Accessed: 2026-10-22. Byline Krishnasai Rollamadugu, "Posted on Oct 21" (2026); page metadata
  literally reads `description: draft body` and `meta-author-trust: 0`; the post advertises the
  author's own tool with "pip install trust-gate # from PyPI (coming soon)".
- Located quote (§ The idea in one sentence, final paragraph; markdown emphasis stripped): "Your
  mutation score = killed / total." (7 words)
- Decision: reject.
- Reason: Q1 — a one-day-old self-published post whose own metadata calls it a draft body; there is
  no revision to pin and no independent standing. Q2/tier — community, author trust 0,
  promotional. Q3 — the score is defined killed/total with no denominator rule, which contradicts
  S023's "mutation score = detected / valid" whenever equivalent mutants exist; a hurried C1
  author would import a denominator the lane's gate does not use.
- Flip: the claim is re-scoped to that tool at a tagged release or commit id and cited from the
  tool's own docs. Even then it stays tier C for the lane's Stryker vocabulary.

### R4 — www.kimi-cli.com, "Data Locations" (C2)

- URL: https://www.kimi-cli.com/en/configuration/data-locations.html
- Accessed: 2026-10-22. HTTP 200; `Last-Modified: Thu, 22 Oct 2026 19:57:21 GMT`, i.e. the request
  instant (dynamically served); VitePress v1.6.4; nav social link points at
  github.com/MoonshotAI/kimi-cli, the archived repo.
- Located quote (§ Data Locations, opening paragraph): "Kimi Code CLI stores all data in the
  `~/.kimi/` directory under the user's home directory." (16 words)
- Decision: reject.
- Reason: Q1 — the mirror cannot name a revision because its Last-Modified moves with the request.
  Q2/tier — the domain is not Moonshot's; the page reproduces the legacy docs' headings, prose and
  `~/.kimi/` tree (rendered text 6,880 vs 6,748 chars against the legacy page, the mirror adding
  an "Are you an LLM?" line), so it is a third-party copy. Q8 — it documents the legacy root
  `~/.kimi/`, and its directory tree has no `locks/` node at all; it cannot ground the host's
  `~/.kimi-code/locks`. A mirror is at best a locator to the official page.
- Flip: the mirror pins and states the upstream revision it copies and matches the current official
  `~/.kimi-code/` tree byte for byte; even then the row must cite the official page, not the mirror.

### R5 — moonshotai.github.io/kimi-cli, "Data Locations" (C2)

- URL: https://moonshotai.github.io/kimi-cli/en/configuration/data-locations.html
- Accessed: 2026-10-22. HTTP 200; `Last-Modified: Tue, 22 Sep 2026 09:30:19 GMT`; the same site's
  Getting Started page carries the banner: "This project is archived. Kimi CLI is no longer
  maintained and will stop working." (12 words)
- Located quote (§ Data Locations, opening paragraph): "Kimi Code CLI stores all data in the
  `~/.kimi/` directory under the user's home directory." (16 words)
- Decision: reject for C2's scope.
- Reason: Q8 — official, but official for the archived legacy product: its documented root is
  `~/.kimi/`, its tree has no `locks/` node, and the site itself says it will stop working. The
  host census measures `~/.kimi-code/` (`KIMI_ROOT: /home/vgpnk/.kimi-code`). Citing it for the
  host's `locks/` mixes two products' trees. Q2/tier alone would pass (official docs, tier A); the
  scope is what fails.
- Flip: the claim is re-scoped to the legacy tool's `~/.kimi/` tree on a host that still runs it,
  or the C2 author cites the current official page instead.

### R6 — Stack Overflow 185451, "Quick-and-dirty way to ensure only one instance of a shell script is running at a time" (C2)

- URL: https://stackoverflow.com/questions/185451/quick-and-dirty-way-to-ensure-only-one-instance-of-a-shell-script-is-running-at
- Accessed: 2026-10-22 (Stack Exchange API rendering). Question asked 2008-10-09; answer by
  lhunath, score 179.
- Located quote (answer § "use `mkdir`", second paragraph): "`mkdir` creates a directory if it
  doesn't exist yet, and if it does, it sets an exit code." (17 words)
- Decision: reject.
- Reason: the tier rule is explicit — `community` is never tier A. Q9 — a generic POSIX
  shell-locking question is another domain; nothing in the thread is about Kimi Code. Q2 — it
  cannot ground a claim that Kimi creates `locks/`; using it that way would dress an inference as
  a source. Q3 — an 18-year-old answer with no revision.
- Flip: a maintainer statement (Kimi source at a commit or official docs) states what creates the
  directory. The Stack Overflow answer can only ever be tier C background for `mkdir` atomicity,
  never the member's source.

### R7 — GitHub issue MoonshotAI/kimi-code#2736 (C2)

- URL: https://github.com/MoonshotAI/kimi-code/issues/2736
- Accessed: 2026-10-22; opened 2026-08-07; environment kimi-code 0.34.0; status open.
- Located quote (§ Proposal, third bullet): "A session lock or explicit multi-client flag would
  prevent the current silent divergence when two processes resume the same session." (21 words)
- Decision: reject.
- Reason: Q2/tier — a user feature request is `community`, never A. Q4 — the sentence is
  counterfactual ("would prevent"), a proposal for a lock, not a description of an existing
  `locks/` directory or of its writer; treating it as description is an inference. Q8 — bound to
  0.34.0 with no revision.
- Flip: a maintainer reply or the merged implementation names the directory and its writer, or the
  repository source at a commit is opened; then the row cites the source, not the issue.

### R8 — GitHub issue MoonshotAI/kimi-code#1924 (C2)

- URL: https://github.com/MoonshotAI/kimi-code/issues/1924
- Accessed: 2026-10-22; opened 2026-07-19; environment "kimi-code 0.27.0".
- Located quote (§ Evidence, item 4): "There is no per-session cross-process lock" (7 words; the
  same sentence continues "so two processes resuming the same session … race").
- Decision: reject as the source for the new member.
- Reason: Q8 — the issue asserts the *absence* of exactly the lock surface C2 wants to declare, at
  version 0.27.0 (July 2026). The current official docs (build dated 2026-10-22) document
  `locks/sessions/` for cross-process occupancy locks. Cited without its version it would make the
  Gate declare the opposite of the current surface; cited with it, it is history, not evidence of
  the member. Tier — community.
- Flip: a maintainer statement or source at the version that introduced `locks/`. Then #1924
  becomes the dated before-state and may be cited as history, never as the member's source.

### U1 — Medium/Stackademic Stryker article (C1), unopened

- URL: https://blog.stackademic.com/securing-code-in-the-shift-left-era-agiles-new-frontier-with-stryker-242f43152757
- Accessed: 2026-10-22; fetch returned HTTP 403. Not retried with any other tool; recorded unopened
  under the binding sourcing rule.
- Decision: unopened — not a row (SOURCES rule 1: a row is written only after opening the source,
  in the round that writes it).
- Reason if it ever opens: Medium-hosted practitioner walkthrough is `community`, tier C for a
  gate's vocabulary; a 403 means no located quote can be recorded this round.
- Flip: it opens by ordinary means and a located quote supports a claim the lane actually needs.

### U2 — DeepWiki, MoonshotAI/kimi-cli and MoonshotAI/kimi-code (C2), unopened

- URLs: https://deepwiki.com/MoonshotAI/kimi-cli and https://deepwiki.com/MoonshotAI/kimi-code
- Accessed: 2026-10-22; both returned HTTP 429 (two attempts). Recorded unopened.
- Decision: unopened — not a row.
- Reason if it ever opens: a generated wiki is a summary of repository code; even opened it would
  be a locator, and the row would have to cite the repository file at a commit id (Q1, Q18).
- Flip: it opens and the underlying repo file is opened at a pinned commit; the row cites that file.

## Calibration (not a reject candidate): the primary that survives for C2

- URL: https://www.kimi.com/code/docs/en/kimi-code-cli/configuration/data-locations.html
- Accessed: 2026-10-22; HTTP 200; `Last-Modified: Thu, 22 Oct 2026 14:04:53 GMT` (a build time, not
  a product revision); VitePress v2.0.0-alpha.17.
- Located quote (§ Directory layout, `locks/sessions/` node): "Cross-process occupancy locks while
  a client writes a session" (9 words).
- Judgment: official docs, tier A for what creates `locks/`; this is the source class C2 needs.
  Residuals the C2 author must close: (a) Q8 — the page names no product version, so the installed
  host Kimi version must be named separately; (b) the page's Last-Modified is a build time, so the
  anchor is the section plus access date; (c) it documents the mechanism but not the lock-file
  naming or a stale timeout — the census does not need those, and no claim beyond the mechanism may
  be made.
- Host shape observed, shape only (no contents read): `~/.kimi-code/locks` mode 700 directory;
  it holds only `sessions/` (mode 700), and `sessions/` had no entries at depth 2 at access time.
  This is consistent with occupancy locks that exist only while a client writes a session.
  [INFERENCE from the docs plus the empty-at-rest shape; not proof of the writer.]
- C2's motivating DRIFT line, quoted whole from `.ufo/waves/round-42/open/receipts.txt`
  (measured 2026-10-22T19:52:15Z at `dfabe92bcec021f5beec457fb50cec484e047e35`):
  `CENSUS  error  UNLISTED  locks  locks sits at the root and is not declared by the frozen K1–K5 set`
  and `KIMI_CENSUS: DRIFT (UNLISTED locks)`, `exit=1`.

## Cross-cutting findings

1. **C1 duplicate-URL hazard, observed in the open receipt.** `sources-census.sh validate --root
   /home/vgpnk/Projects/shokunin kumitate` prints:
   `kumitate W04 S034 duplicate url stryker-mutator.io/docs/mutation-testing-elements/mutant-states-and-metrics across scopes`
   (exit 0). S023 and S034 already share that URL. A third row on the same page would repeat the
   warning; C1's new row should be a different primary source for mutation testing as a standing
   gate (its own tool docs for the CI/standing-gate use, at a named version), or an explicit
   supersession by scope.
2. **C2 version tension, evidenced.** Issue #1924 (0.27.0, July 2026) says there is no per-session
   cross-process lock; the current official docs (built 2026-10-22) document `locks/sessions/`.
   The Gate must date the claim to the docs page and name the host version, or the "before"
   (issue) and "after" (docs) are silently mixed.
3. **Mirror staleness quantified.** www.kimi-cli.com serves the legacy `~/.kimi/` bytes at paths
   whose official counterparts document `~/.kimi-code/`; rendered text differs by a 132-character
   "Are you an LLM?" line only (6,880 vs 6,748 chars); the VitePress 1.6.4 build and the
   github.com/MoonshotAI/kimi-cli social link match the legacy site; the mirror's Last-Modified is
   the request instant, while the official legacy page is a static 2026-09-22 build. A mirror that
   cannot name its revision fails Q1 before its content is even read.

## Gate rows (copy-ready)

- **R1** REJECTED: anonymous tertiary page with no revision anchor, and its kill test is output
  divergence rather than a failing test (contradicts S023/S034); flip: named maintainer revision
  and a kill definition matching "at least one test failed".
- **R2** REJECTED: self-published blog; the 80%/60% thresholds are recalled constants with no
  measurement, and a score threshold is the wrong instrument for a per-mutant manifest; flip: a
  measured threshold at a named revision, or the maintainer statement for the tool in use.
- **R3** REJECTED: one-day-old self-published post, its own metadata says "draft body", author
  trust 0, promotional; defines mutation score killed/total against S023's detected/valid; flip:
  re-scoped to its tool at a tagged release and cited from that tool's docs.
- **R4** REJECTED: third-party mirror of the legacy docs, dynamically served so no revision can be
  named; documents `~/.kimi/` and has no `locks/` node; flip: pins the upstream revision and
  matches the current official tree — and even then cite the official page.
- **R5** REJECTED for this scope: official but archived legacy docs (`~/.kimi/`, no `locks/`; the
  site says it will stop working), while the host census measures `~/.kimi-code/`; flip: scope the
  claim to the legacy product on a host that runs it.
- **R6** REJECTED: community is never tier A; a 2008 generic shell-locking answer is another
  domain and says nothing about Kimi's writer; flip: a maintainer statement or source at a commit.
- **R7** REJECTED: a feature request proposing a lock ("would prevent"), not a description of
  `locks/`; version-bound to 0.34.0; flip: maintainer reply or merged implementation naming the
  directory and its writer.
- **R8** REJECTED as the member's source: asserts the absence of a per-session cross-process lock
  at 0.27.0, opposite to the current official docs; flip: cite it as dated history once a
  maintainer statement or source at the introducing version exists.

## Handoff

- Zero candidates from this sweep should appear in C1's or C2's source line. The C2 admit path is
  the official `kimi.com/code/docs` page quoted above, with Q8 closed by naming the installed host
  version; the C1 admit path must be a primary source not already used by S023/S034 on the same URL.
- Unopened items are leads only: U1 (HTTP 403) and U2 (HTTP 429 twice). Neither is evidence.
- No writes outside this report; no gate run, no scratch clone, no tool install or upgrade in this
  seat.
