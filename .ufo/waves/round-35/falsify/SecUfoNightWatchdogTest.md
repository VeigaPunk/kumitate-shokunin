ATTACK S8-section:scripts/ufo-night-watchdog.test.mjs verdict=holds defects=0

## Scope

Target = the round-35 re-anchored census section
`corpus/knowledge/remaining-scripts-census.md:746-748`:

> Live S8 member (195 L, suite; was 118 @ 964f443e) re-censused 2026-10-14
> against origin HEAD `964f443e`. Primary surface symbol `hasTmux` at
> `scripts/ufo-night-watchdog.test.mjs:168`. re-anchored at 31c465f1 (round 35)

Master base (master-tree:765-767): "Live S8 member (118 L, suite) re-censused
2026-10-14 against origin HEAD `964f443e`. Primary surface symbol `hasTmux` at
`scripts/ufo-night-watchdog.test.mjs:90`."

Every anchor in the section was read at the pinned `31c465f1` via
`git -C /fast/scratch/kumitate-r35/src show 31c465f1:scripts/ufo-night-watchdog.test.mjs`.
The section contains exactly one line anchor (`:168`) plus the heading path; no
`:N` continuations exist.

## Anchor verification (all pass)

| Claim in section | Command | Observed at 31c465f1 | Verdict |
|---|---|---|---|
| heading member `scripts/ufo-night-watchdog.test.mjs` | `git show 31c465f1:<path> \| wc -l` | file exists, 195 lines | ok |
| `hasTmux` at `:168` | `sed -n '168p'` | `const hasTmux = spawnSync("tmux", ["-V"]).status === 0;` | ok, byte-identical symbol at exact line |
| `hasTmux` "primary surface symbol" (role check) | `sed -n '170p'` | consumed at `:170` as the skip gate `skip: !hasTmux && "tmux not installed"` | ok; still the only module-level gate (module-level decls: `REPO`:24, `LIB`:25, `lib`:28, `libRun`:35, `PS`:39, `hasTmux`:168) |

## Population-table row vs wc -l

- Census table row `corpus/knowledge/remaining-scripts-census.md:168`:
  ``| `scripts/ufo-night-watchdog.test.mjs` | 195 | suite |``.
- `git -C /fast/scratch/kumitate-r35/src show 31c465f1:scripts/ufo-night-watchdog.test.mjs | wc -l` → `195`. Exact match.
- Kind "suite": file line 15 states `// Run: node --test scripts/ufo-night-watchdog.test.mjs`; 11 top-level `test(` declarations (up from 7 at 964f443e). Correct.
- Historical clause "(was 118 @ 964f443e)": `git show 964f443e:<path> | wc -l` → `118`. Correct; matches the master table row (master-tree:147 = 118).

## Revision label + removal traces

- Original label kept verbatim: "re-censused 2026-10-14 against origin HEAD
  `964f443e`" — identical to master text; and that historical label is itself
  true (964f443e:90 is exactly `const hasTmux = spawnSync("tmux", ["-V"]).status === 0;`, verified `cat -n | sed -n '88,92p'`).
- Removed/changed clauses and their traces:
  - `118 L` → `195 L` with explicit history "(; was 118 @ 964f443e)" — trace present.
  - anchor `:90` → `:168` with explicit trace "re-anchored at 31c465f1 (round 35)" — trace present, matches the convention used by sibling re-anchored sections (e.g. `land-fleet-run.mjs:596`, `render-seat-tables.mjs:647`).
  - No other clause existed at master to remove; nothing was silently dropped.
- Member is live at the pin (not in "Departed members", census:814-817) and is
  absent from the S1–S7 live list (census:41-76) while present in the S8 table —
  "Live S8 member" is accurate.

## New-false-claim sweep

The section makes no behavior prose beyond the symbol/anchor, so the upstream
behavior change (7→11 tests; final test replaced: "the watchdog sources the lib
and no longer carries the argv-only reaper filter" at 964f443e:113-118 → bare
`bash -n` "the watchdog script parses" at 31c465f1:193-195) cannot falsify any
sentence in it. Grep of the census for `argv-only|sources the lib|watchdog-lib`
returns no claim pinned to this member's file. Nothing stale survives from
master; nothing new is asserted beyond the verified L-count/kind/anchor.

## Wave-1 cross-check

`.ufo/waves/round-35/build/FidUfoNightWatchdogTest.md` reported anchors=2,
moved=1, changed=0, gone=0 and proposed exactly the `:90`→`:168` re-anchor with
the `964f443e` label kept; the integrated section implements that plus the L
restamp "(was 118 @ 964f443e)". Wave-1's [INFERENCE] that `hasTmux` stays a
defensible primary surface symbol is confirmed above by the module-level
declaration census.

## Residual risk / verification gaps

- Cosmetic, not a defect: the section body (census:748) is immediately followed
  by the next `##` heading (census:749) with no separating blank line — same
  pattern as other round-35 re-anchored sections (census:672/673, 762/763,
  765/766). CommonMark parses the ATX heading regardless and both probe arms
  match headings without needing the blank line, so the probe result is
  unaffected.
- All claims in the section are now pinned to 31c465f1 and re-verified here;
  no residual gap for this member.
