# ScribeScorecard — round 48 findings

## Behavior

Measured the requested live proxy terms from a no-hardlinks sandbox clone detached at frozen tip `fe3d45bf929246915c8c0de5f7f8682b5015b22c`:

- A = 26
- C = 22
- C2 map rows = 106; `corpus/knowledge` + `corpus/lessons` Markdown files = 107 (`106/107`)
- The one unmapped file is `lessons/round-47-verifier-spotcheck.md`.
- From the frozen SCORECARD formula, derived `f_O=(26+22)/(26+22+3)=48/51≈0.941`, integer 9. This is a derived freeze reading, not an executed proxy-check result or a C1/C2 close score.

Prepared the move-log skeleton with C1/C2 before→after cells deliberately left for the L1 to fill at close, plus a candidate `counter-rerun` capabilities-table row explicitly conditional on the C2 kill rule.

## Gates and execution evidence

- No C1 counter, C2 selftest, C2 probe, test suite, build, or score run was executed by this seat.
- No claim is made that C1 or C2 passed. No attempt-1 receipt bytes are cited or reused.
- The inherited `.ufo/waves/round-48/build/` listing and current `.ufo/waves/round-48/r48/` listing contained no attempt-1 `ScribeScorecard` draft. Therefore its citations could not be verified or reused. The frozen SCORECARD template itself was read in the sandbox at `SCORECARD.md:323-331`, `428-435`, and `1721-1735`.
- No tool was installed or updated.

## Commands and outcomes

1. Sandbox creation and freeze measurements (exact command):

   ```sh
   unset GIT_DIR GIT_WORK_TREE GIT_INDEX_FILE && mkdir -p /fast/scratch/hyaku/kumitate-r48a/seats/ScribeScorecard && git clone -q --no-hardlinks /home/vgpnk/Projects/shokunin/kumitate-shokunin /fast/scratch/hyaku/kumitate-r48a/seats/ScribeScorecard/lane && git -C /fast/scratch/hyaku/kumitate-r48a/seats/ScribeScorecard/lane checkout -q --detach fe3d45bf929246915c8c0de5f7f8682b5015b22c && printf 'rev=' && git -C /fast/scratch/hyaku/kumitate-r48a/seats/ScribeScorecard/lane rev-parse HEAD && cd /fast/scratch/hyaku/kumitate-r48a/seats/ScribeScorecard/lane && printf 'A=' && find . -path ./.git -prune -o -type f \( -name '*.mjs' -o -name '*.sh' -o -name '*.py' \) -print | wc -l && printf 'C=' && grep -c '^\s*- \[' SKILL.md && printf 'C2_readme=' && grep -c '^| `\(knowledge\|lessons\)/' corpus/README.md && printf 'C2_files=' && find corpus/knowledge corpus/lessons -name '*.md' | wc -l
   ```

   Outcome: `rev=fe3d45bf929246915c8c0de5f7f8682b5015b22c`, `A=26`, `C=22`, `C2_readme=106`, `C2_files=107`.

2. First unmapped-file comparison used locale-dependent `sort`; `comm` returned exit 1 with “file … is not in sorted order” warnings. Its output was discarded.

   ```sh
   cd /fast/scratch/hyaku/kumitate-r48a/seats/ScribeScorecard/lane && comm -23 <({ find corpus/knowledge -type f -name '*.md' -printf 'knowledge/%P\n'; find corpus/lessons -type f -name '*.md' -printf 'lessons/%P\n'; } | sort) <(grep -oE '^\| `(knowledge|lessons)/[^`]+`' corpus/README.md | cut -d'`' -f2 | sort)
   ```

   Exact outcome: `comm: file 1 is not in sorted order`, `comm: file 2 is not in sorted order`, then `lessons/round-47-verifier-spotcheck.md`, then `comm: input is not in sorted order`; exit 1. The output was discarded.

3. Corrected comparison (exact command):

   ```sh
   cd /fast/scratch/hyaku/kumitate-r48a/seats/ScribeScorecard/lane && comm -23 <({ find corpus/knowledge -type f -name '*.md' -printf 'knowledge/%P\n'; find corpus/lessons -type f -name '*.md' -printf 'lessons/%P\n'; } | LC_ALL=C sort) <(grep -oE '^\| `(knowledge|lessons)/[^`]+`' corpus/README.md | cut -d'`' -f2 | LC_ALL=C sort)
   ```

   Outcome: exit 0; `lessons/round-47-verifier-spotcheck.md`.

4. Corpus entry-type check (exact command):

   ```sh
   cd /fast/scratch/hyaku/kumitate-r48a/seats/ScribeScorecard/lane && find corpus/knowledge corpus/lessons -name '*.md' ! -type f -print
   ```

   Outcome: no output; every `*.md` path counted in the requested find is a regular file.

## Touched surfaces and scope

- Created `.ufo/waves/round-48/r48/ScribeScorecard-frag.md`.
- Created this report, `.ufo/waves/round-48/r48/ScribeScorecard.md`.
- Created sandbox clone at `/fast/scratch/hyaku/kumitate-r48a/seats/ScribeScorecard/lane`; the clone checkout is detached at the frozen tip.
- No product code, `SCORECARD.md`, `corpus/`, or `LOG.md` was edited; no real-checkout git/jj write was performed.
- Out of scope: integrating fragments, deciding C1/C2 verdicts, and verifying any close-time candidate or receipt.

## Artifacts

- `.ufo/waves/round-48/r48/ScribeScorecard-frag.md`
- `.ufo/waves/round-48/r48/ScribeScorecard.md`
