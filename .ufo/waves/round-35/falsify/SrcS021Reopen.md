ATTACK S021 verdict=partial defects=1

Target: corpus/SOURCES.md `## Registry` row S021 (line 34), re-opened non-author
against the pinned read-only clone /fast/scratch/kumitate-r35/src (detached at
31c465f1). Scratch: /fast/scratch/kumitate-r35/w/SrcS021Reopen/.

## Defect 1 — `teaches` undercounts the outside-files set: "five" is six

- Path: corpus/SOURCES.md:34, `teaches` cell:
  "…dev-verify.sh and five shell or extensionless files are outside the member
  patterns"
- Evidence (exact commands, run in scratch):
  - `git -C /fast/scratch/kumitate-r35/src diff --name-status 964f443e 31c465f1 -- scripts`
    → 69 files: 2 A, 6 D, 61 M (matches the row's anchor).
  - Universe per pin (`git archive <pin> scripts | tar -t`, dir entries stripped):
    964f443e = 91 members (73 top-level `*.mjs` + 18 under `scripts/*/`);
    31c465f1 = 88 (70 + 18). Membership per file classified against both lists:
    A-member 2, D-member 5, M-member 55 — the row's member split is exact.
  - Outside set = **7** files: `scripts/dev-verify.sh` (the extra D) plus **six**
    extra M: `scripts/gates.sh`, `scripts/self-iter.sh`, `scripts/smoke.sh`,
    `scripts/ufo-sighting` (regular file, mode 100755, extensionless),
    `scripts/ufo-night-watchdog-lib.sh`, `scripts/ufo-night-watchdog.sh`.
    `git ls-tree` shows `ufo-sighting` blob bddad9fa, mode 100755 — not a symlink.
    61 M − 55 member M = 6 outside M, so "five" is arithmetically impossible.
- Corroboration: the round's own scribe report
  .ufo/waves/round-35/build/ScribeSrcUpstreamRange.md:36 lists the same six
  extra M files; the integrated row dropped `ufo-sighting` when transcribing
  ("five shell or extensionless files") [INFERENCE: copied the legacy census
  sentence's five-shell list and omitted the extensionless file].
- Impact: low. All anchored numbers (2 A/6 D/61 M; 2/5/55; 91 → 88) verify; the
  error is one word in the explanatory clause. A non-author re-deriving the
  member set from this clause would hunt for a nonexistent missing member.
- Minimal fix: corpus/SOURCES.md:34 — change "five shell or extensionless files"
  to "six shell or extensionless files" (or "five shell files plus the
  extensionless `scripts/ufo-sighting`"). Log the teaches correction old→new in
  the round lesson per contract rule 2 (a correction is normally a new row, but
  a one-word factual fix in a same-round row is cheapest logged as a rider).

## Verified clean (every other cell, against freshly run commands)

- Counts: `git diff --name-status 964f443e 31c465f1 -- scripts` → 2 A, 6 D,
  61 M ✓ (matches anchor).
- Member split 2 added / 5 deleted / 55 modified ✓ (per-pin universe
  classification; deleted members: omp-wave-context.mjs,
  primeagent-recovery-assess.mjs, primeagent-refinement-ledger.mjs,
  ufo-refinement-context.mjs, ufo-refinement-context.test.mjs).
- "moves the script-layer universe 91 → 88 members" ✓ (91 and 88 measured).
- Census S8 63 → 60 ✓: the note's 28-entry S1–S7 live list exists in full at
  both pins (`comm -12` = 28 each); 91−28=63, 88−28=60.
- "log line 1 is the range head 31c465f1, committed 2026-10-20 07:25:51 -0300" ✓:
  `git log --oneline 964f443e..31c465f1 -- scripts crates/ufo-cli
  crates/ufo-core-runtime` line 1 = `31c465f routing: grammar admits …`;
  `git show -s --format=%ci 31c465f1` → 2026-10-20 07:25:51 -0300. "the two
  crates" is well-defined: exactly crates/ufo-cli and crates/ufo-core-runtime
  changed in the range.
- Gate quote (corpus/lessons/round-35.md `## Gate`, S021 bullet): verbatim
  prefix of the commit subject through "build.rs", 15 words (≤25 ✓), location
  "log line 1" correct (unscoped and scoped log agree), access date 2026-10-20 ✓.
  Contract rule 1 fields all present for the new row.
- Registry hygiene: 28 rows; duplicate-id census empty; every row NF=13 (no `|`
  in cells); S021 kind=own-work, tier=A, status=mined, opened=2026-10-20,
  recheck=30d — all enum-legal; recheck 30d has precedent (3 rows).
- used-by `corpus/knowledge/remaining-scripts-census.md` exists and cites S021
  (line 12) with the same member counts — status=mined is earned, and the
  scribe's F2 flip condition was satisfied in-round.
- S021 absent at master (`git show master:corpus/SOURCES.md | grep -c S021` → 0;
  one + line in the round diff) → Gate's "Rows touched old→new: none" is
  accurate; born-mined with a same-round citation breaks no rule.
- Rule 6: no credentials/session URLs in the row or Gate entry ✓.

## Residual risk (adjacent, not S021 defects)

- corpus/knowledge/remaining-scripts-census.md legacy sentence (unchanged from
  master, so predates this round): "The five unattributed top-level shell
  scripts — dev-verify.sh, gates.sh, self-iter.sh, smoke.sh and
  ufo-night-watchdog.sh sit outside…" is stale at the pinned tree: dev-verify.sh
  is deleted by this very range, and ufo-night-watchdog-lib.sh,
  nc5-origin-sync.sh, nc5-seat-watch.sh (shell) plus scripts/ufo-sighting and
  probe-token-plan-models.verdict.json (extensionless) are also outside the
  universe. The 60-member derivation (universe minus S1–S7) does not depend on
  that enumeration, so C2 is untouched — but the same stale "five" is the likely
  source of Defect 1 [INFERENCE]. Cheap round-36 rider: refresh that sentence.
- Gate's scoped-log command (`git log --oneline 964f443e..31c465f1`, no
  pathspec) differs from the row's "over scripts + the two crates"; both have
  31c465f as line 1, so the quote is correctly located either way.

## Verification gaps

None material: every cell was checked against commands re-run in this session on
the pinned clone; no claim in the row rests on unobserved state beyond the one
defect above.
