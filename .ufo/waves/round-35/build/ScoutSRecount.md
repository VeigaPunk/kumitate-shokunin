SRECOUNT members=88 s8=60 s8_headings=63 only_tree=scripts/omp-route-grammar.mjs,scripts/ufo-swarm-registry.mjs only_note=scripts/omp-wave-context.mjs,scripts/primeagent-recovery-assess.mjs,scripts/primeagent-refinement-ledger.mjs,scripts/ufo-refinement-context.mjs,scripts/ufo-refinement-context.test.mjs

# ScoutSRecount — independent C2 script-layer re-census (read-only)

## Verdict

At pin `31c465f15669f744848bd9f5d56191c5085670f7` the script-layer universe is
**88 members**, the S8 remainder is **exactly 60**, and the census note still carries
**63** member headings. `comm -3` yields **2 tree-only** (added) and **5 note-only**
(deleted) paths. Baseline `S_members=88`, `S_sections=86`, `coverage_script=9` is
reproduced independently; the 86 decomposes as 28 S1–S7 + 58 resolvable S8 sections.

## Derivation (binding definition)

Patterns read from `scripts/proxy-check.mjs:317-320`:

```
S: [/^scripts\/[^/]+\.mjs$/, /^scripts\/[^/]+\/.+/]
```

i.e. top-level `scripts/*.mjs` plus **every** file under `scripts/<dir>/` recursively
(any extension). `scripts/claims-check.mjs` has no `LAYER_PATTERNS` of its own (grep
over the whole repo: only `scripts/proxy-check.mjs:317`, plus prose at
`corpus/knowledge/layer-axes.md:244`, `corpus/knowledge/sighting-wall.md:235`,
`SCORECARD.md:122`); its origin walk (`walkFiles`, `PRUNE_DIRS` =
`.git .ufo target node_modules`, `scripts/claims-check.mjs:156-168`) sees the same file
set — verified: no pruned dir exists under `scripts/` at the pin.

Commands (all under `/fast/scratch/kumitate-r35/src`, never the lane repo):

```
git ls-tree -r --name-only 31c465f1 -- scripts | grep -E '^scripts/[^/]+\.mjs$|^scripts/[^/]+/.+' | LC_ALL=C sort  # 88
git ls-tree -r --name-only 964f443e -- scripts | grep -E '^scripts/[^/]+\.mjs$|^scripts/[^/]+/.+' | LC_ALL=C sort  # 91
```

S1–S7 live membership resolved from the registry cells (`SCORECARD.md:119-125`) into
28 concrete paths: S1 (1), S2 (2 + 5 lib), S3 (2), S4 (1 + 4 lib), S5 (2), S6 (5),
S7 (`probe-*` glob = 5 + `fake-omp.mjs` = 6). All 28 resolve at the pin
(`comm -23 s17.txt members31.txt` empty). S8 = 88 − 28 = **60**
(`comm -23 members31.txt s17.txt` → 60; at 964f443e the same subtraction gives 63).

```
comm -23 s8_tree31.txt census_headings.txt   # only_tree (2)
comm -13 s8_tree31.txt census_headings.txt   # only_note (5)
```

`census_headings.txt` = `grep -E '^## \`' corpus/knowledge/remaining-scripts-census.md`
(63 lines; the four prose `## ` headings carry no leading backtick and are excluded,
matching `scripts/claims-check.mjs` section-form).

## Corroboration

1. **The note's own S1–S7 heredoc is byte-identical to my derived list.**
   `corpus/knowledge/remaining-scripts-census.md:35-64` lists 28 paths;
   `comm -3 note_s17.txt s17.txt` → empty; `wc -l` = 28.
2. **The note was exactly current at the base revision.** `comm -3 census_headings.txt
   s8_tree964.txt` → empty (63 headings = the 63-member S8 set at `964f443e`). The
   whole drift is upstream advance, not a pre-existing note defect.
3. **Gate cross-check** (read-only, `claims-check` writes nothing):
   `node scripts/claims-check.mjs --row S8 --src /fast/scratch/kumitate-r35/src --json`
   → `sections=63 inFamily=58 notes=['corpus/knowledge/remaining-scripts-census.md']`,
   `verdict=DRIFT`, findings = exactly 5 × `SECTION_FILE_UNRESOLVED` for the 5
   only_note paths. 58 + 28 S1–S7 = 86 = frozen baseline `S_sections=86`
   (`.ufo/waves/round-35/baseline/proxy.txt:5`), and `floor(10*86/88)=9`
   (`proxy.txt:6` computed=9).
4. **No ownership ambiguity for the two added files.** Neither
   `scripts/omp-route-grammar.mjs` nor `scripts/ufo-swarm-registry.mjs` has a `## `
   heading in any other corpus note (`grep -rn '^## \`scripts/omp-route-grammar.mjs\`…'`
   corpus/ → no match); `swarm-wave-lifecycle.md:49,71,99` mentions only the
   `ufo-swarm-registry-v1` **schema string**, not the file. They are S8.

## Arithmetic for the C2 target

- Live: 88 members, 86 sections ⇒ `floor(10*86/88)=9` (matches baseline).
- 88/88 ⇒ 10 requires S8 sections 58 → 60: delete the 5 stale headings, add the 2
  new ones. 60 + 28 = 88 exactly; no other row needs a section-count change.
- Anchor re-verification surface at the pin: **55 modified members** = 36 S8 + 19
  S1–S7, plus **2 added** S8 files (`scripts/omp-route-grammar.mjs` 207 L,
  `scripts/ufo-swarm-registry.mjs` 173 L) ⇒ **57 changed members** (C2 also says
  "every changed member", so the 19 S1–S7 modified members are in scope for their
  own notes: `collect-omp-native-handoff-lib/{base,events,evidence,policy}.mjs`,
  `collect-omp-native-handoff.mjs`, `fleet-dispatcher.mjs`, `omp-global-config.mjs`,
  `probe-ufo-route-health.mjs`, `run-omp-native-trial.mjs`, `ufo-ground-handler.mjs`,
  `ufo-l0-monitor.mjs`, `ufo-l0-watch.mjs`, `ufo-mission-result.mjs`,
  `ufo-sighting-lib/{base,surface}.mjs`, `ufo-sighting.mjs`, `ufo-stale-watchdog.mjs`,
  `ufo-swarm-collect.mjs`, `ufo-swarm-wave.mjs`).
- Diff shape (`git diff --name-status 964f443e 31c465f1 -- scripts`, 69 paths):
  A=2, D=6, M=61 — of which members A=2, D=5, M=55; the 6th deletion and the 6
  modified non-members are `scripts/dev-verify.sh` (D) and
  `scripts/{gates,self-iter,smoke,ufo-night-watchdog,ufo-night-watchdog-lib}.sh` +
  `scripts/ufo-sighting` (M), all outside `LAYER_PATTERNS` (S4's shim exclusion,
  `SCORECARD.md:122`).
- Exact 36 modified S8 members (anchor-risk list for the scribe; `comm -12 m_members.txt
  s8_tree31.txt | wc -l` = 36):
  `charter-scribe/config.json`, `charter-scribe/sync.mjs`,
  `charter-scribe/systemd/charter-scribe.service`, `check-hand-authored-sets.mjs`,
  `check-hand-authored-sets.test.mjs`, `fleet-dispatcher.test.mjs`,
  `fleet-ledger-rotate.mjs`, `fleet-selfheal-verify.mjs`, `gates-plan.mjs`,
  `land-fleet-run.mjs`, `lean-cargo/README.md`, `omp-role-work.mjs`,
  `prepare-ephemeral-fleet.mjs`, `prepare-ephemeral-fleet.test.mjs`,
  `prepare-ephemeral-l1.mjs`, `project-devin-subagents.mjs`,
  `render-seat-tables.mjs`, `sync-global-routing.mjs`, `sync-ufo-contracts.mjs`,
  `ufo-drills.mjs`, `ufo-godspeed-inject.test.mjs`, `ufo-l0-monitor.test.mjs`,
  `ufo-l0-watch.test.mjs`, `ufo-night-watchdog.test.mjs`, `ufo-route-preflight.mjs`,
  `ufo-route-preflight.test.mjs`, `ufo-stale-watchdog.test.mjs`,
  `ufo-state-census.mjs`, `ufo-state-census.test.mjs`, `ufo-state-retention.mjs`,
  `ufo-state-retention.test.mjs`, `ufo-statusline-hook.test.mjs`,
  `ufo-swarm-collect.test.mjs`, `ufo-swarm-wave.test.mjs`, `ufo-watchdog-repend.mjs`,
  `ufo-watchdog-repend.test.mjs` (full list at
  `/fast/scratch/kumitate-r35/w/ScoutSRecount/modified_s8.txt`).

## Required note/registry edits (evidence, not performed here)

- `corpus/knowledge/remaining-scripts-census.md:1` and `:10` declare "63 members";
  the pin measures 60. The measurement block (`:27-64`) hardcodes revision
  `964f443e` and `SRC=/home/vgpnk/Projects/ufo-fsd-alpha`; C2's pin requires
  `31c465f1` / the read-only clone.
- `SCORECARD.md:126` S8 cell says "63 members (round-32 measurement)" and
  "60 of 60 named at internals level" — both stale at the pin (60 live, 60 headings
  needed, currently 63 headings of which 58 live).
- Stale citations outside the census that name now-deleted members:
  `corpus/knowledge/queue-summary.md:122,215,222` (`scripts/primeagent-refinement-ledger.mjs`)
  and `corpus/README.md:105,112` (`primeagent-*`). `queue-summary.md` is an S1 note;
  these are prose citations, so the gate does not fire on them, but they are dead
  paths at the pin. [INFERENCE] no gate impact.
- `SCORECARD.md:125`'s parenthetical `ls scripts/probe-*.mjs scripts/atomic-write.mjs
  scripts/fake-omp.mjs | wc -l → 9` is doubly stale: `scripts/atomic-write.mjs` does
  not exist at either revision (`grep -c atomic-write members31.txt census_headings.txt
  s8_tree31.txt` → 0/0/0), and the S7 note itself carries 6 `## ` headings. Any scribe
  copy of that `ls` line will fail at the pin.

## Observed vs inferred

- Observed: every count, path list, diff status and gate field above comes from the
  listed commands; outputs reproduced verbatim in the report body.
- [INFERENCE] Anchor liveness for the 55 modified members is **not** verified here —
  that is the scribe's assigned question. My 36/19 split only delimits the surface.
- [INFERENCE] Using 9 S7 members (as the `ls … → 9` prose implies) would make S8 57
  and contradict both the S7 note and the 91→88 arithmetic; 6 is the consistent value.

## Tools / environment

- No installs, no upgrades, no package transactions, no network.
- Writes: this report + `/fast/scratch/kumitate-r35/w/ScoutSRecount/` only
  (`members31.txt`, `members964.txt`, `s17.txt`, `s8_tree31.txt`, `s8_tree964.txt`,
  `census_headings.txt`, `note_s17.txt`, `all_status.txt`, `m_paths.txt`,
  `m_members.txt`, `changed_s8.txt`, `modified_s8.txt`). Lane repo, jj state and Git index untouched.
