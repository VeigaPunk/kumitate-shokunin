# Round 9 aggregator corpus verdict — kumitate

> **Path convention.** Bare `CORPUS.md`, `PROTOCOL.md`, `MANIFEST.json`, `SCORECARD.md`, `LOG.md`, `.ufo/…` and `<lane>-shokunin/…` pointers in this file are **main-repo (`shokunin`) relative** — they do not resolve inside this checkout. Paths inside this checkout are written `corpus/…`, `SKILL.md`, `SHONEN.md`, `PROVINCE.md`.

- Repo: `kumitate-shokunin`
- Revision measured: `e0e5de1` (requested landed revision)
- Evidence: `shokunin:.ufo/waves/round-9/seats/verdict-kumitate.md` (main repo `shokunin`)
- Verdict: **not conformant — rules 1, 2, 4, 6, 7, 8 (literal), and 9**.

## Decision-relevant measurements

Round 8's withdrawn `[ ]` was replaced by an operative, non-provisional `[x]` at `59e6c0c`. Re-running the committed proxy from the e0 snapshot produced `PROXY: MATCH (A=4 C=9 operability=8; C1=16/18 C2=43/43 coverage=8; pins=4 match)`, exit 0. Box 3 is therefore **firm**, not broken.

Both gates' isolated self-tests pass with committed tallies: round-gate **57/57**, proxy-check **55/55**; each asserts exit codes and stable finding IDs. The proxy frozen run passes. The round-gate frozen archive cannot execute because the implementation requires a git worktree and returns fail-closed `NOT_A_GIT_WORKTREE` exit 2; the committed close evidence at `59e6c0c` is retained as the revision-specific close measurement rather than substituted with a moving tree.

The Gate standard is only partial for both gates: the scripts use 0/1 and document 2/64, but `SKILL.md` does not provide a single registry row mapping every nonzero code to `clean|failed|could-not-evaluate`, nor a single eight-field registry row. Scope is read-only and satisfied.

## Rule movement

The round-6 row at `7a4c9a0` read `not conformant — 7,6,4,1,2,9` (6 majors / 12 defects). At e0, rules 1, 2, 4, 6, 7, and 9 remain failed; rules 3 and 5 pass. Rule 8 is **FAIL-literal / PASS-intent**: the landed corpus has one literal `op://` occurrence, at `corpus/lessons/round-5-aggregator-audit.md:79`, inside a quoted sweep command. It is a schematic placeholder, not a real vault path, but CORPUS.md:43-46 prohibits vault-ref paths literally. No secret value is reproduced.

The full command ledger, file/line citations, dirty-tree revision note, and candidate routed rows are in the seat evidence file. This draft is a lesson pointer, not a replacement for that evidence.
