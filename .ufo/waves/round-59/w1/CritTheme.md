# CritTheme — round 59 / w1

Item: read `corpus/lessons/round-59.md`. Confirm exactly one admit theme (`mcp-orchestration-contract`) and the two REJECT lines for the durable-execution files, each with a flip. Quote the admit line and both flip sentences. Attack: a second theme admitted. Axes: operability, coverage. Date: 2026-10-24.

**Item result: attack did not land. CORROBORATED.** This is not a claim verdict. It does not attest REPAIR59 or DOCTRINE59.

## Admit line

From the score-rev lesson, line 15 (`12-quotes.txt`, `02-admit-reject-census.txt`):

```text
ADMIT mcp-orchestration-contract.md — frontier item 2, the uncovered MCP orchestration contract. Three rows, no others.
```

The gate table has three `ADMIT` cells. All three name the same file (`02-admit-reject-census.txt`):

```text
4 ADMIT mcp-orchestration-contract.md
```

Those cells are S125, S127, and S136 of that one theme, not a second theme. No other filename follows `ADMIT`.

## REJECT lines and flip sentences

Two REJECT lines, each carrying one `flip:`. `git grep -c flip:` on the lesson at the score rev printed `2` (`02-admit-reject-census.txt`).

Line 17:

```text
REJECT durable-execution-and-fanout-primitives-2026-10-24.md — right province band, wrong theme. This round's one theme is frontier item 2. The entry's ground (saga compensating action, Tail at Scale) is not item 2. flip: a later round whose one theme is band-4 primitives re-opens S190 and S194 and adopts it through the item-10 pipeline.
```

Flip sentence:

```text
a later round whose one theme is band-4 primitives re-opens S190 and S194 and adopts it through the item-10 pipeline.
```

Line 19:

```text
REJECT durable-execution-failure-detection.md — overlaps held surfaces, and its S126 URL is the same page as held S117. a shared page is not automatically a duplicate; the operational conclusion is to pin the duplicate group before adoption. This round does not adopt it and does not pin a group it did not open. flip: pin the S117/S126 group, then a later band-4 round may adopt the non-overlapping remainder.
```

Flip sentence:

```text
pin the S117/S126 group, then a later band-4 round may adopt the non-overlapping remainder.
```

## Attack: a second theme admitted

The attack looked for a second coverage theme in the lesson text, in files added between base `0f66ecd4a9efd10b7c0daab35891edbdd6c74b5f` and score rev `5469c0a58d7986ff8a5f203938ae1c8785a92213`, and in the staged package the lesson says it refused. It did not land.

**Lesson text.** Four `ADMIT` tokens, one filename. Two `REJECT` tokens, the two durable-execution filenames, each with a flip. The word `theme` in the lesson occurs only on the fanout REJECT line, and that line names frontier item 2 as the round's one theme (`13-ledger-and-counts.txt`).

**Tree.** `git diff --name-status` of knowledge, lessons, README, SOURCES, PROVINCE, LOG, and SCORECARD adds exactly one knowledge file: `corpus/knowledge/mcp-orchestration-contract.md`. Knowledge file count 53 → 54 (`04-name-status.txt`, `05-knowledge-added.txt`, `13-ledger-and-counts.txt`). The rejected filenames are absent from the score-rev tree:

```text
(absent from rev tree)
```

`git ls-tree -r --name-only` filtered for `durable-execution`, `fanout`, and `failure-detection` returned only `corpus/knowledge/mcp-orchestration-contract.md` (`03-rejected-paths.txt`). No file of either rejected name sits under `.ufo/waves/round-59` (`14-package-absent.txt`).

**SOURCES.** Id set 123 → 126. Added ids are only S125, S127, S136. Removed none (`06-sources-id-delta.txt`). Each added row's used-by cell is `corpus/knowledge/mcp-orchestration-contract.md` (`13-ledger-and-counts.txt`). S126, S131, S133, S134, S135, S190, and S194 have no SOURCES row. S117 is still present. S126 row count is 0.

**Staged package, not adopted.** Those rejected-theme ids are in `assimilation/staged-ids` (`16-attack-bindings.txt`):

```text
2:S126
7:S131
9:S133
10:S134
11:S135
66:S190
70:S194
```

`git grep` of those ids in `corpus/SOURCES.md` at the score rev printed `(SOURCES has none)`. Staged count 147, registry-id count 123 (`11-staged-vs-adopted.txt`). The id list being committed is the collision-guard input. It is not an adoption: the ids are not rows, and the markdown files are not in the tree. The admitted entry says the adopted ids are S125, S127, and S136, "not the package" (`15-entry-nl.txt` lines 28–29).

**PROVINCE.** The only frontier bullet that changed is item 2, from queued rows to a first entry naming `mcp-orchestration-contract.md` and S125/S127/S136. The durable-execution band bullet was not advanced (`08-province.diff`).

**Entry body.** `git grep` of `saga`, `Tail at Scale`, `S190`, `S194`, `S126`, `failure-detection`, and `fanout` in the admitted entry printed `(entry has none of those markers)` (`10-marker-grep.txt`). Corpus hits for those markers are older lessons (round 27 "repair saga"; round 58's own REJECT record) plus this lesson's REJECT lines. They are not a new knowledge entry.

**Near misses, classified and not landed.**

- S127's "durably created" shares a word with the rejected band. The frozen plan names that clause as part of the one theme, and PROVINCE item 2 now lists "durable task creation" inside the MCP entry. The rejected ground — saga compensating action, Tail at Scale, S190/S194, and the S126/S117 page — is absent from the entry and from SOURCES.
- The entry's `subscriptions/listen` sentence is on the same S125 page. The entry says it is not a second source (`15-entry-nl.txt` line 19). It is not a second frontier item and not a second file.
- README also gained a row for the existing `lessons/round-58-verifier-spotcheck.md` and changed the round-58 map citation S121 → S112 (`09-readme.diff`). Those are operability repairs of files already in the tree. `failure-recovery-replay.md` is not in the name-status set. No second knowledge theme was added.
- LOG names C1 `cite-sources` and then "C2 coverage frontier item 2, one theme" (`16-attack-bindings.txt` lines 2249–2254). `cite-sources` is the operability claim, not a coverage theme. SCORECARD's only `round 59` hit is the `receipt-evidence` capability row (R58-V6). It names no knowledge entry and neither rejected file.
- `considerthese` item 1 is recorded as taken and the file not edited (lesson lines 45–47; LOG line 2257). That is not a sourced theme admission.

## Revision binding

The item does not name the base. Measured revision is `5469c0a58d7986ff8a5f203938ae1c8785a92213`. The base was used only to see what the score rev added. Captured `2026-10-24T21:38:14-03:00` (`00-identity.txt`):

```text
head=5469c0a58d7986ff8a5f203938ae1c8785a92213
score type=commit
base_ancestor_exit=0
rev_ancestor_of_head_exit=0
lesson_blob=a7e14c72450f67e913db34d4b24665db08bf6e03
worktree_hash=a7e14c72450f67e913db34d4b24665db08bf6e03
```

`git status --porcelain --untracked-files=all` on the lesson, the entry, SOURCES, README, and PROVINCE printed nothing. HEAD was not moved.

## Evidence and scope

Captures are under `.ufo/waves/round-59/build/CritTheme/`. `commands.md` is the command index. Primary captures: `02-admit-reject-census.txt`, `12-quotes.txt`, `04-name-status.txt`, `06-sources-id-delta.txt`, `08-province.diff`, `10-marker-grep.txt`, `13-ledger-and-counts.txt`, `16-attack-bindings.txt`.

This seat did not run `repair59-probe.mjs` or `doctrine59-probe.mjs`. No production file, pin, corpus file, lane ledger, jj state, or Git index was changed. Writes were confined to this report and `build/CritTheme/`. No install, pacman transaction, commit, push, or mutating git/jj command was used.

Report: .ufo/waves/round-59/w1/CritTheme.md
