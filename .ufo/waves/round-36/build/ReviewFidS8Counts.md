REVIEW s8 members=60 sections=60 diff=0

# ReviewFidS8Counts — independent S8 census re-derivation

Scope: `corpus/knowledge/remaining-scripts-census.md` at lane HEAD 0614092e (worktree note
hash `5a7c8080…`, equal to `git rev-parse HEAD:corpus/knowledge/remaining-scripts-census.md`),
origin pin `/fast/scratch/kumitate-r36/src` = `31c465f15669f744848bd9f5d56191c5085670f7`
(`git -C … rev-parse HEAD`), clean tree. Read-only; no lane/scratch writes.

## 1. Layer universe and boundary arithmetic — reproduced exactly

```bash
SRC=/fast/scratch/kumitate-r36/src
ls -1 "$SRC"/scripts/*.mjs | wc -l                      # 70
find "$SRC/scripts" -mindepth 2 -type f | wc -l         # 18
{ ls -1 "$SRC"/scripts/*.mjs; find "$SRC/scripts" -mindepth 2 -type f; } \
  | sed "s|^$SRC/||" | LC_ALL=C sort -u | wc -l         # 88 (0 duplicate lines)
```

Enumeration edges: 0 symlinks, 0 non-regular entries under `scripts/`, 0 names with
whitespace, no duplicate universe entry. Cross-checked against the commit object:
`git ls-tree --name-only 31c465f1:scripts` → 70 top-level `*.mjs` and
`git ls-tree -r --name-only 31c465f1 scripts` filtered to `^scripts/[^/]+/` → 18
recursive files; `comm -3` between the filesystem and git universes is empty.
The 18 recursive paths = charter-scribe 5 + lean-cargo 4 +
collect-omp-native-handoff-lib 5 + ufo-sighting-lib 4.

S1–S7 list is the note's own heredoc (`sed -n "/cat > \/tmp\/s8-s1s7-live.txt <<'EOF'/,/^EOF$/p"`):
28 entries, 0 duplicates, 0 absent at the pin. `comm -23 <(universe) <(S1–S7)`:

```text
S_members 88 − S1–S7 28 = S8 60      # note's own arithmetic, verified
```

Breakdown, all matching the note's "current observed" block (`:102-113`) and table:

```text
S1–S7: 19 top-level mjs + 9 subdir = 28
S8:    51 top-level mjs + 9 subdir = 60   (charter-scribe 5 + lean-cargo 4)
suites=22 tools=30 shims=3 assets=4 doc=1  ⇒ 60; mjs=52; S8 wc -l total = 33367
```

S7 cross-check: the six live S7 member headings in
`corpus/knowledge/route-probe-cluster.md:94,122,138,155,172,187` are all inside the
28-entry S1–S7 list (comm -3 shows only the 22 S1–S6 paths), so no live S7 member is
miscounted into S8. `comm -12 <(S1–S7) <(S8)` is empty (disjoint), and every S8 path
exists at the pin (0 missing).

Historical block (`:85-96`) also reproduces from git objects without a checkout:
`git ls-tree … 964f443e:scripts` → 73 top-level mjs, 18 recursive, universe 91;
−28 = 63. Upstream `git diff --name-status 964f443e 31c465f1 -- scripts` = A2 / D6 / M61;
6 D = 5 S8 members + non-universe `scripts/dev-verify.sh`; both A files
(`omp-route-grammar.mjs`, `ufo-swarm-registry.mjs`) are absent at 964f443e. 63 − 5 + 2 = 60.

## 2. Note headings vs live member set — `comm -3` empty

```bash
grep -oE '^## `scripts/[^`]+`' "$NOTE" | sed -E 's/^## `//; s/`$//' | LC_ALL=C sort
# 60 lines, 0 duplicates
comm -3 <(S8 sorted) <(headings sorted)      # no output
comm -13 …                                  # no output (no heading outside S8)
```

66 `## ` headings total = 6 meta (`Membership and measurement`,
`Composition and conventions`, `Member-completeness probe`, `Limits of this note`,
`Citation ledger`, `Departed members (re-census 31c465f1, 2026-10-20)`) + 60 member-form.
No `###`+ heading names a `scripts/` path. The 60-row census table (`:120-181`) is
set-identical to the heading set (comm -3 empty) and to live S8 (comm -3 empty);
table L column matches `wc -l` for all 60 (0 drift), class labels match path shape for
all 60 (0 drift), table L sum = 33367 (suite 16509 + tool 16197 + shim 511 + asset 69 +
doc 81), and the one named no-trailing-newline member
(`ufo-l0-monitor.test.mjs`: 1345 wc -l / 1346 grep -c '') is handled as the note states.

## 3. No departed member regained a section

20 departed paths checked — the 5 in `## Departed members` plus the 15 round-32
removals at `:395-411`:

- none exists at the pin (`[ -e "$SRC/<p>" ]` all absent; 0 `LIVE` lines);
- none appears as a `## ` heading (0 `REGAINED` lines; also implied by the empty
  `comm -3` in §2, since a heading-only departed path would surface there);
- each of the 5 departed bullets resolves at `964f443e:` and fails at `31c465f1:`
  (0 `NOT_AT_964`, 0 `STILL_LIVE`), matching the 6-file upstream D set minus the
  non-universe `dev-verify.sh`.

The note's table has exactly 60 rows, so the departed history is bullets only, as the
ExecFidRemainder brief requires.

## 4. Registry declaration

`SCORECARD.md:132` (row `S8`, 4th cell) reads `60 members (…)` and
`60 of 60 named at internals level`; its first regex hit for `/ (\d+) members?\b/`
is `60`, i.e. a 60-distinct-section note would not trip `MEMBER_COUNT_DRIFT`
[INFERENCE: derived from the note/registry text + `scripts/claims-check.mjs:405`
`RE_MEMBERS` and `:288-290` exact-path resolution; the gate itself was not run — not
assigned to this item].

## 5. ExecFidRemainder patch — count delta = 0 across every observed state

At 02:25 the lane was pristine (note hash `5a7c8080…` = HEAD; no patch file). Two
repair passes were then observed in the executor's lane (`r36-execfidremainder`), and
each was re-censused immediately:

| observed | note hash | size | lane diff | member headings | total `## ` | table rows | sumL | `comm -3` vs S8 | departed re-adds |
|---|---|---|---|---|---|---|---|---|---|
| 02:26:11 | `9aada985…` | 82150 | 54+/54− | 60 | 66 | 60 | 33367 | empty | 0 |
| 02:27:50 | `7989f5fb…` | 81959 | 53+/53− | 60 | 66 | 60 | 33367 | empty | 0 |

Both diffs contain **no** `^[-+]## ` heading line, **no** `^[-+]\| \`scripts/` table
row, and no changed line matching the census prose (`S8 members`, `S_members (layer)`,
`members L`, `suite/tool/shim/asset/doc`, `mjs total`, `top-level/subdir in S8`,
`60 members`); the changed lines are body-line anchor/symbol substitutions only
(count-neutral by construction). The canonical
`/fast/scratch/kumitate-r36/w/ExecFidRemainder.patch` was still absent at 02:28, so
**no count changed by any observed ExecFidRemainder state**.

Post-integration recheck (cheap, exact): heading set + table set + L sum + prose
numbers must still read 60/60/33367 with the same `comm -3` output; any `## ` heading
for one of the 20 departed paths is a regression even if `distinct` stays 60.

## Residual risk / verification gaps

- The canonical ExecFidRemainder `.patch` had not been emitted when this seat closed;
  the count-neutrality result is over the HEAD note and two live repair-pass snapshots
  (hashes above), not over the final patch file. An anchor-only edit cannot change the
  heading census, but a section split/merge or a departed re-add could, so the final
  patch still needs the same three `comm -3`/structural checks.
- One transient state at 02:25:49 reverted to HEAD between passes; it was not counted
  as a patch state.
- Class labels are shape-derived per the note's own definition; behavioural class is
  out of scope of a count audit.
- Historical round-13 `60` (pre-964f443e) is not re-derivable from this clone and was
  not checked; the 964f443e block was.
