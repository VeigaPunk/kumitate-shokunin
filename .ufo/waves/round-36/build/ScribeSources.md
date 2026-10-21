SCRIBE sources drafted rows=4 admitted=4 rejected=0

# ScribeSources — round-36 SOURCES.md drafts (text only; the L1 writes the file)

S029 is own-work and was run; S030/S031/S032 were opened and their quotes byte-checked
first-hand against the served pages. Nothing below was pasted from a scout without
re-opening the page (the scouts' reports agree). No lane file was edited.

## Insert point

Insert the four rows immediately after the S028 row, i.e. before the blank line that
precedes `## Paths` in `corpus/SOURCES.md`. They are literal Registry rows in the frozen
11-column shape (13 split fields).

## Row literals

```markdown
| S029 | upstream ufo-fsd-alpha census at revision 31c465f1 — own-work: git rev-parse HEAD, ls/wc over the two crate src dirs, and the claims probe's R-section walk, read through the private clone /fast/scratch/kumitate-r36/src | own-work | A | pinned revision census behind C2: R5/R7 member resolution and lane R-section coverage at 31c465f1 | stdout: HEAD 31c465f15669f744848bd9f5d56191c5085670f7 (detached; dirs 555); crates/ufo-core-runtime/src/*.rs=88, crates/ufo-cli/src/*.rs=4; R sections 86 occurrences over 84 distinct files, 83 distinct in-family; R5 4 and R7 5 files present (243, 330, 229, 184 and 149, 107, 198, 2389, 2969 L in registry order); read 2026-10-21 | R_members at the pin is 92 (88 runtime + 4 CLI); R5 (native_admission_rules.rs, native_admission_text.rs, native_seats.rs, native_text.rs) and R7 (bounded_fs.rs, bounded_fs_tests.rs, fs_durability.rs, local_ship.rs, local_ship_tests.rs) resolve in that directory; 83 distinct in-family sections + the nine new ones = 92 distinct and 92 in-family (local_ship_tests.rs already counted out-of-family under R9) — the C2 numerator | mined | 2026-10-21 | 30d | corpus/knowledge/native-admission-detail.md, corpus/knowledge/local-ship.md |
| S030 | pytest documentation — How to use skip and xfail to deal with tests that cannot succeed — https://docs.pytest.org/en/stable/how-to/skipping.html | docs | A | pytest strict xfail/XPASS expected-failure semantics on stable docs (the item's how-to/skip.html is a 404; this page is the live successor) | § strict parameter (h3 id strict-parameter), closing sentence of the paragraph; fetched 2026-10-21 (HTTP date 2026-10-21) | "This will make XPASS (“unexpectedly passing”) results from this test to fail the test suite." Strict is opt-in via strict=True; KNOWN v1 hard-wires that strictness as KNOWN_STALE, so a listed expectation that stops firing is itself an error | mined | 2026-10-21 | on-release | corpus/lessons/round-36.md |
| S031 | git documentation — git-rev-parse — https://git-scm.com/docs/git-rev-parse | docs | A | git rev-parse revision naming and --verify emission semantics (served page 2.56.0) | § OPTIONS → Options for Output → --verify (id Documentation/git-rev-parse.txt---verify), last sentence; served 2.56.0 last updated 2026-09-28, fetched 2026-10-21 | "If so, emit it to the standard output; otherwise, error out." rev-parse emits exactly one object name on success and errors otherwise, so a gate can name the revision it scored and keep SRC_REV_MISMATCH distinct from an unverifiable exit | mined | 2026-10-21 | on-release | corpus/knowledge/pinned-evidence.md, corpus/lessons/round-36.md |
| S032 | Reproducible Builds — Recording the build environment — https://reproducible-builds.org/docs/recording/ | docs | A | provenance duty for a build result: environment and source identity defined in advance or recorded during the run | § Recording the build environment, preamble before § File Format; HTTP 200, Last-Modified 2026-10-19, fetched 2026-10-21 | "All relevant information about the build environment should either be defined as part of the development process or recorded during the build process." A verdict must record its revision or pin it; one that reads a moving checkout does neither | mined | 2026-10-21 | 365d | corpus/knowledge/pinned-evidence.md, corpus/lessons/round-36.md |
```

## Search log paragraph (append to `## Search log`)

**Round-36 gate-source pass — question: “what do the primary texts state that the
round's gates rest on, and what does the pinned revision actually enumerate?”; where:
direct HTTPS fetch of the locators named in the wave item plus own-work commands in the
read-only clone (`/fast/scratch/kumitate-r36/src`), 2026-10-21; unit: sources; identified
6, screened 6, included 3, failed 2, excluded 1, own-work 1.** Included: pytest's
`strict parameter` section (S030, 15-word quote), git-rev-parse's `--verify` (S031, 11
words), and Reproducible Builds' `Recording the build environment` (S032, 23 words). One
seat per source (`ScoutSourcePytest`, `ScoutSourceGitRev`, `ScoutSourceRepro`) opened it;
the scribe re-checked each admitted quote against the served page. The two failures were
retired paths, not sources: `docs.pytest.org/en/stable/how-to/skip.html` and
`reproducible-builds.org/docs/deterministic-builds/` both return 404, and their live
successors (`how-to/skipping.html`, `docs/recording/`) were opened directly and are what
the rows cite. Excluded at screening: `source-date-epoch` (200, but it defines only a
timestamp variable and states no provenance/recording rule). Own-work: the R5/R7 census at
`31c465f1` (S029) was run, not fetched — `rev-parse HEAD`, the two crate directory counts,
and the claims probe's R-section walk. Stop: every admitted quote is byte-checked against
the served page and the census numbers are their command's own stdout; the dead locators
added nothing their successors did not carry.

## Leads deltas

Opened in round 36 and removed from this list: **none** — the three fetched sources came
from locators named in the item, not from the lead list. Append:

- **git revision grammar beyond `--verify`.** `SPECIFYING REVISIONS` (H2) defines the
  `<rev>` spellings and the `^{type}` peeling operators; the S031 seat opened the heading
  and the `--verify` entry only, and observed `rev-parse --verify 'HEAD^{commit}'` without
  drafting a row for it.
- **Reproducible Builds `/docs/definition/` and `/docs/version-information/`.** The S032
  seat opened the definition page as corroboration (“Source code is usually a checkout
  from version control at a specific revision…”) and named the version-information page
  (hash truncation, `git rev-parse --short=12`) without opening it; neither is a registry
  row.
- **pytest strict-xfail configuration.** `xfail_strict`/`strict_xfail` ini and
  `--runxfail` sit adjacent to the admitted `strict` paragraph (S030) but were not opened
  as sources; KNOWN v1 hard-wires strictness, so they are context, not contract.

## Evidence (commands and observed output)

- `git -C /fast/scratch/kumitate-r36/src rev-parse HEAD` →
  `31c465f15669f744848bd9f5d56191c5085670f7`; `git status --porcelain` → empty;
  `stat -c '%A'` on `.` and `.git` → `dr-xr-xr-x` (555).
- `ls crates/ufo-core-runtime/src/*.rs | wc -l` → `88`;
  `ls crates/ufo-cli/src/*.rs | wc -l` → `4`.
- `wc -l` on the nine members → `243 330 229 184` (rules, admission_text, seats,
  native_text) and `149 107 198 2389 2969` (bounded_fs, bounded_fs_tests, fs_durability,
  local_ship, local_ship_tests).
- In-process `probeSections({self: lane, src: clone})` census → `R_rows 11 R_sections 86
  distinct 84 distinct_in_family 83`; per row `{"R1":8,"R2":12,"R3":5,"R4":6,"R6":4,"R8":4,
  "R9":4,"R10":2,"R11":41}` (no R5/R7 sections); the only pre-existing section for a
  nine-member file is `local_ship_tests.rs` under R9 (out-of-family there).
- `curl -sL` of the three admitted URLs; byte checks: pytest `exact_match=True` 15 words,
  git `If so, emit it…` present 11 words, repro `exact_match=True` 23 words. pytest
  `how-to/skip.html` and repro `docs/deterministic-builds/` → 404; repro
  `docs/source-date-epoch/` → 200 but no provenance rule; repro `docs/recording/` → 200,
  `Last-Modified: Mon, 19 Oct 2026 17:18:03 GMT`.
- Shape validation (not a gate rerun): a mirror at
  `/fast/scratch/kumitate-r36/w/ScribeSources/` (lane `corpus/` copy + stub
  `knowledge/pinned-evidence.md` and `lessons/round-36.md` to satisfy used-by) with the
  four rows inserted, then
  `node scripts/sources-check.mjs --self /fast/scratch/kumitate-r36/w/ScribeSources --today 2026-10-21 --strict`
  → `SOURCES_CHECK: CLEAN (rows=32 tiers=A:31,B:1,C:0 status=queued:14,mined:16,rejected:2
  entries_with_source=3 legacy=38)` exit 0. Without the two stubs it fails
  `USED_BY_MISSING` for S030–S032 (`corpus/lessons/round-36.md`), which is the ordering
  requirement below.

## Admission rationale and integration notes

- S030/S031/S032 admitted: each quote is verbatim and directly states the design term
  (strictness of an expectation, exact revision emission, recording/defining provenance).
  No candidate rejected this round, so rejected=0 and no `REJECTED:`/`flip:` cells.
- S032 is admitted (ScoutSourceRepro returned `supports=yes`); the lesson draft's
  “conditional on ScoutSourceRepro” line should resolve to admitted.
- Ordering: S030–S032 name `corpus/knowledge/pinned-evidence.md` and
  `corpus/lessons/round-36.md` as used-by. Both are in-flight wave deliverables; they MUST
  exist before `sources-check` runs or `USED_BY_MISSING` fires (observed on the mirror).
  S029's used-by paths already exist.
- Discrepancy to fix at integration: `ScribeLesson.md` line 118 cites S030 as
  `how-to/skip.html`; that URL is a 404 at the access date. Cite
  `how-to/skipping.html#strict-parameter` (the scout's scribe note says the same).
- S029's `83 distinct in-family` is the pre-landing census taken during the build wave; the
  after value (92) belongs to the C1/C2 gate runs, not this row's read.

## Bounds observed

- No lane file, jj state, Git index, or fleet/other-lane path touched; the lane's
  `corpus/SOURCES.md` was read only (validation ran on the scratch mirror).
- No tool install or upgrade; no REA, no subagents, no network beyond the three doc
  fetches. `/tmp` scratch used during drafting was removed; the mirror remains under
  `/fast/scratch/kumitate-r36/w/ScribeSources/`.
