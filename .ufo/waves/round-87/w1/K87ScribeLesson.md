# K87ScribeLesson — round-87 lesson draft (scribe seat)

Seat: K87ScribeLesson (scribe, leaf). Lane `/home/vgpnk/Projects/shokunin/kumitate-shokunin`, base `db97929212bb61ae970b10abac3cc4cd976713ae`, freeze `25a3a75df123a59c5cf0de944a6d2f067e278f82`. No commits, no pushes, no stash/checkout/reset/add. Scratch `/fast/scratch/hyaku/kumitate-r87/K87ScribeLesson/` removed before this report.

## Deliverable

- Draft lesson: `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-87/build/K87ScribeLesson/round-87.md` (9,791 bytes). Shape: `# Round 87 — …`, `## Method`, `## Gate`, `## Mistakes` (four-column table, classes from CORPUS vocabulary), `## Frontier`.
- Integration target when the L1 lands it: `corpus/lessons/round-87.md` (not written by this seat).

## Exact bytes the L1 must fill (every `<L1-FILLS>` in the draft)

| # | location in draft | what goes there |
|---|---|---|
| 1 | header, `measured revision M` | full 40-hex M the round is measured at |
| 2 | `## Method`, "After-state" | the `C87_C1: …` line at M with exit code, and the round's `RECEIPT_BIND:` line at M |
| 3 | `## Gate`, S250 bullet | the located quote, ≤25 words, with location (section of `statement.md`) — the seat did not choose the quote cell |
| 4 | `## Gate`, S251 bullet | the located quote, ≤25 words, with location (Important Note block) |
| 5 | `## Gate`, registry bullet | decision whether the S251 row (no capture digest in its cell) is amended by a new superseding row, or left as is |
| 6 | `## Mistakes`, landing row | the ordinal to print for the round-86 map-row recurrence: plan says "fourth", `LOG.md:2764` says "thirteenth" for round 84; git shows sixteen prior spot-checks (r70–r85) each landed their row later |
| 7 | `## Frontier` | whether a `corpus/README.md` Frontier bullet is added for `receipt-subject-binding` (the README Frontier currently has no row for it) |

No other placeholder remains. The draft contains no fix claim without the command that shows it can fail.

## Evidence the draft rests on (each re-opened by this seat)

- **attribution (row 1).** `git show 19b4e440:.ufo/waves/round-86/run-close.mjs` line 24 is `const hash=createHash(...)` over `scripts/counter-receipt.mjs`, inside the per-case loop; line 26 writes it. `grep -H '^tool_sha256=' .ufo/waves/round-86/close/*.txt` → all ten lines read `e95313700aaf8430c51e0f8abdb991ab168519eecf9803cce3fac51154f31069`. `git show db979292:scripts/proxy-check.mjs | sha256sum` → `fd51dc98…`; readme-map `fc119ab6…`. Only `selftest.txt` names its own instrument (`e95313…` = counter-receipt at base).
- **landing (row 2).** At db979292: `grep -c 'round-86-verifier-spotcheck' corpus/README.md` → `0`; `node scripts/spotcheck-adopt.mjs --check` → `SPOTCHECK_COVERAGE: DRIFT spotchecks=53 uncovered=1 first=corpus/lessons/round-86-verifier-spotcheck.md`, `MAP: DRIFT …`, exit `1` (`build/K87ScribeLesson/spotcheck-red-before.txt`, base tree from `git archive db97929…`). After `node scripts/spotcheck-adopt.mjs --adopt corpus/lessons/round-86-verifier-spotcheck.md` on the same tree: `SPOTCHECK_ADOPT: ADOPTED … wrote=both`, `--check` → `CLEAN spotchecks=53 uncovered=0`, exit `0`, `readme-map` → `README_MAP: CLEAN files=220 rows=220 covered=220`, exit `0` (`build/K87ScribeLesson/spotcheck-green-after.txt`). Per-file git check (`git log --diff-filter=A` vs `git log -S 'lessons/round-N-verifier-spotcheck.md' -- corpus/README.md`): r70–r85 each show a README-row commit later than the file commit (16 of 16); r86 shows no row.
- **number-drift (row 3, the one the seat found itself).** `grep -L '^cmd=' .ufo/waves/round-{74..86}/close/*.txt` → 225 files. Four round-85 receipts carry `cmd=` with no `tool_sha256=`: `c1-probe.txt`, `content-variation.txt`, `history-v2.txt`, `selftest.txt`. `open/census-toolbind.txt:1` prints `no_cmd=229` = 225 + 4 (bucket label `NO_CMD_OR_HASH`). The plan (`plan.md:23-25`) and `corpus/knowledge/receipt-subject-binding.md` say "229 carry neither" and "the 229 receipts without `cmd=`" — both wrong; the correct statements are 225 neither, 4 cmd-only, 229 in the bucket (`build/K87ScribeLesson/census-field-states.txt`).
- **reference-drift (row 4, extra).** `run-close.mjs:20` (cited in `plan.md:18`, `receipt-subject-binding.md:14`, `QUALITY.md:1345`) is the `['plan', …]` case entry at 19b4e440; the digest is at line 24. The knowledge entry's "once per run" is also wrong: computed once per case, same bytes each time.

## Census re-run (disclosed)

`TMPDIR=<scratch> node .ufo/waves/round-87/open/census-toolbind.mjs round-74 … round-86` (rounds listed explicitly) → `receipts=239 bound=1 mismatch=9 unresolved=0 no_cmd=229`, exit 0; `diff` against the committed `open/census-toolbind.txt` → empty (exit 0). Copy at `build/K87ScribeLesson/census-rerun.txt`.

## Frozen controls re-scored (disclosed; `--tool` override per the probe's own option)

Command: `TMPDIR=<scratch> node .ufo/waves/round-87/probe/probe87-c1.mjs --lane <lane> --work <scratch>/probe-<c> --rev db97929212bb61ae970b10abac3cc4cd976713ae --tool <control>`; base used `--tool` pointing at a nonexistent path (instrument absent).

| control | re-scored | committed `controls/*.txt` |
|---|---|---|
| base | `C87_C1: UNMET held=0/12` | `held=0/12` |
| stub-clean | `C87_C1: UNMET held=0/12` | `held=0/12` |
| constant-drift | `C87_C1: UNMET held=1/12` | `held=1/12` |
| path-keyed | `C87_C1: UNMET held=3/12` | `held=3/12` |

Kill rule did not fire (no control reached 12/12). Output at `build/K87ScribeLesson/controls-reverify.txt`. The random-fixture arm is run-time dependent and its printed pick differs per run; the held counts are stable.

## Observed on the sibling candidate (not a verdict)

`node .ufo/waves/round-87/build/L1Reference/receipt-bind.mjs --dir .ufo/waves/round-86/close --rev 19b4e440e83ea9d618708003f36c3a799eb13e08`, read-only, exit `1`: `RECEIPT_BIND: DRIFT matched=1 mismatched=9 unchecked=0 external=2 first=c1-probe.txt`. This is one line from an unintegrated sibling; the seat does not claim the frozen predicate passes. The L1 owns the integrated verdict.

## Working-tree state observed (not mine; the L1 reconciles)

`git status --porcelain` at my read: modified `.ufo/pins/readme-map.json`, `.ufo/pins/source-captures.json`, `SKILL.md`, `corpus/QUALITY.md` (+21, includes an uncommitted `### Q80`), `corpus/README.md` (+2: the round-86 spot-check row and the `receipt-subject-binding` row), `corpus/SOURCES.md` (+2: S250, S251), `scripts/readme-map.mjs`; untracked `corpus/knowledge/receipt-subject-binding.md`, `.ufo/waves/round-87/w1*`, `open/cosign-verify.html`, `open/intoto-statement.md`, `build/`. `scripts/readme-map.mjs` and `SKILL.md` are changes this seat did not make and did not read in full. The round-86 spot-check README row is already present in the working tree, so the L1's adoption step is a verify, not a re-add.

## Tools

None installed, upgraded or removed. Host `pacman` paused per the lane contract; none attempted. `/tmp` not used. No `task`/subagent spawned.

## Routed concerns for the L1 (evidence above)

1. Q80 is uncommitted and cites `corpus/lessons/round-87.md` `## Mistakes` attribution; the draft's attribution row supports it. The L1 commits Q80 with the lesson or after.
2. `receipt-subject-binding.md` and `plan.md:23-25` carry the 229 figure; the lesson's number-drift row names the correction. The L1 decides whether to amend the knowledge entry (new entry, not in-place: corrections are new entries, `corpus/CORPUS.md` rule "Corrections are new entries, never rewrites") or add a superseding line.
3. The `run-close.mjs:20` citation in the plan and knowledge entry needs a correction line, per the same rule.
4. Ordinal conflict (round-86 map-row recurrence: "fourth" vs LOG's "thirteenth") is unresolved at this seat; the L1 must pick the printed ordinal (draft placeholder 6).

## Verification commands the main agent may run (not run by this seat as gates)

- `grep -L '^cmd=' .ufo/waves/round-{74..86}/close/*.txt` then count lines → 225.
- `node scripts/spotcheck-adopt.mjs --check` → `CLEAN spotchecks=53 uncovered=0` exit 0 at M after the adopt.
- `node scripts/readme-map.mjs` → `README_MAP: CLEAN` with `files=` equal to `rows=` and `covered=` equal to both, once the new lesson lands with its row and pin (the L1 adds those together; this seat did not measure the post-landing count).
- `git show 19b4e440:.ufo/waves/round-86/run-close.mjs | awk 'NR==20 || NR==24'` → plan case entry, then the `createHash` line.
- The frozen probe: `node .ufo/waves/round-87/probe/probe87-c1.mjs --lane <lane> --work <scratch> --rev <M>` → expected `C87_C1: HELD held=12/12` exit 0 against the integrated `scripts/receipt-bind.mjs` (not this seat's job to integrate or to score the sibling candidate).
