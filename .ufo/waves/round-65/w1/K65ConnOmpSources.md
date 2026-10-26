VERDICT: The C2 cross-source scan finds the entry, rows and pins correct but the six capture files uncommitted at the lane's own commit 35abe21 — committing only those six files turns the frozen counter from 6/8 into 8/8 — and one live stale version statement (`corpus/README.md:91` still says `omp/18.12.3`), one dangling used-by (S081 claims an entry that does not cite it), and one contradiction between the round-46 lesson and the round-47-restored S004 row.

## Evidence

**Host truth, measured now (2026-10-25):**
```
$ bash /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/omp-binary-probe.sh
OMP_BIN: wrapper_is_script=1
OMP_BIN: wrapper_names_real=omp.real
OMP_BIN: wrapper_restart_codes=132-139
OMP_BIN: wrapper_max_restarts=5
OMP_BIN: real_is_elf=1
OMP_BIN: real_bytes=256702432
OMP_BIN: real_version=18.12.6
OMP_BIN: lit_2025_11_25=2
OMP_BIN: lit_2026_07_28=0
OMP_BIN: lit_2025_03_26=2
OMP_BIN: sym_MCP_PROTOCOL_VERSION=3
OMP_BIN: header_MCP-Protocol-Version=3
OMP_BIN: sym_DeferredMCPTool=3
OMP_BIN: collab_hosts_literal=2
OMP_BIN: docs_phrase_never_replayed=0
OMP_BIN_PROBE: DONE omp=18.12.6
EXIT=0

$ git ls-remote https://github.com/can1357/oh-my-pi refs/tags/v18.12.6
45c35e40c46166dc726ccc52f5d27f40f2449f99	refs/tags/v18.12.6
```

**Every version statement in the lane** (`grep -rn -o -E 'omp/18\.12\.[0-9]+' corpus SKILL.md PROVINCE.md SCORECARD.md LOG.md`): 18.12.3 at `corpus/SOURCES.md:17` (S004, superseded by S081), `corpus/knowledge/omp-task-contract.md:2,3,205,207,214,228`, `corpus/README.md:91`, `LOG.md:1458`, `corpus/lessons/round-34.md:66,98`; 18.12.6 at `corpus/SOURCES.md:66,68,73,81,94`, `corpus/knowledge/omp-agent-root.md:2`, `corpus/knowledge/agent-isolation-substrates.md:2`, `corpus/lessons/round-44.md:63`, `corpus/lessons/round-47.md:29`, `PROVINCE.md:20`, `corpus/README.md:193`, and the new entry `:2,11,23`. Full table in the build artifact, §1.

**The stale live statement and the dangling used-by:**
```
$ grep -n '18\.12\.3' corpus/README.md
91:| `knowledge/omp-task-contract.md` | OMP harness contract (round 34, … docs-on-main vs installed `omp/18.12.3` skew named | S001–S004 in `corpus/SOURCES.md` |

$ grep -c 'S081' corpus/knowledge/omp-task-contract.md
0
$ awk -F'|' '/^\| S081 /{print $12}' corpus/SOURCES.md
 corpus/knowledge/omp-task-contract.md
```

**The round-46 lesson vs the round-47-restored row:**
```
$ sed -n '36p' corpus/lessons/round-46.md
- S004 anchor: + round-46 re-run `omp/18.12.6`; teaches dated "on 2026-10-19". Status unchanged (`mined`).
$ sed -n '17p' corpus/SOURCES.md | awk -F'|' '{print $7}'
 stdout line 1; host omp/18.12.3 (2026-10-19)
$ git log --oneline -L '/| S004 /,+1:corpus/SOURCES.md'
269dadb round-47: … R46-1 rows restored plus supersedes rows S080-S092 …
+| S004 | omp --version on this host — stdout omp/18.12.3 | tool | A | … | stdout line 1; host omp/18.12.3 (2026-10-19) | …
980a16a round-46: …
+| S004 | … | stdout line 1; host omp/18.12.3 (2026-10-19); re-run 2026-10-23 (round 46, SweepS001S005): `omp/18.12.6` — the 18.12.3 capture is a dated observation, no longer reproducible | …
```

**`main` has moved under the lane's main-anchored rows:**
```
$ wc -c t1 t2        # 81fa40e vs 0b5c27ab, docs/tools/task.md
  36687 t1
  36954 t2
$ curl -sS "…/compare/45c35e40…0b5c27ab…"      # main vs the installed release's tag
"status":"ahead","ahead_by":170,"behind_by":0,"merge_base_commit":"45c35e40c46166dc726ccc52f5d27f40f2449f99"
```
`main` is 170 commits **ahead** of the installed release's tag. The staged merge entry `merge/kumitate/knowledge/corpus/knowledge/omp-host-harness-protocol-skew-2026-10-27.md:17-21` asserts "Both sides are on the same revision" — true of the protocol constant, false of the release.

**Same document, two pins (merge S199 vs new S202) — byte-identical:**
```
types.ts / client.ts / mcp-runtime-lifecycle.md / package.json / zai.ts / http.ts
  sha256 at main 0b5c27ab == sha256 at tag v18.12.6   (IDENTICAL for all six)
  e.g. mcp-runtime-lifecycle.md 362acea5d3d0eca0d54aa9a80febab5a43634007ab40a435dbb0c75079cf83d
```

**The new rows create no new duplicate group:**
```
$ /home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --file corpus/SOURCES.md
file	W04	S034 … S068 … S084 … S095 … S123 … S126 duplicate url … across scopes
file	ok	/home/vgpnk/Projects/shokunin/kumitate-shokunin/corpus/SOURCES.md
EXIT=0
$ node scripts/source-dupes.mjs
SOURCE_DUPES: CLEAN groups=6 known=6
```

**The frozen counter at the lane's own commit, and the fix:**
```
$ node .ufo/waves/round-65/probe/omp65-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin 35abe21ba64064c028060a8e4f31984b65b26df0
OMP65_UNMET held=6/8 checks=8 rev=35abe21… rule=O65 | O3 MISS S201:capture-absent,S202:capture-absent,S203:capture-absent,S204:capture-absent,S205:capture-absent,S206:capture-absent | O4 MISS S201:quote-not-in-capture(export const MCP_PROTOCOL_VERS);…
exit 1

$ git ls-tree -r 35abe21 --name-only | grep -c 'round-65/build/Capture'
0
$ ls .ufo/waves/round-65/build/Capture/          # the six files, on disk, uncommitted
omp-commit-10bce690.patch  omp-v18.12.6-mcp-client.ts  omp-v18.12.6-mcp-runtime-lifecycle.md
omp-v18.12.6-mcp-transports-http.ts  omp-v18.12.6-mcp-types.ts  omp-v18.12.6-zai.ts

# scratch clone (--no-hardlinks) at 35abe21 + ONLY the six captures committed:
$ git add .ufo/waves/round-65/build/Capture && git -c user.name=fixture -c user.email=fixture@example.test commit -m "fixture: commit the six captures"
$ node .ufo/waves/round-65/probe/omp65-probe.mjs <clone> 33c23ccafc7c60812c63fbc921a3795560c8482b
OMP65_HELD held=8/8 checks=8 rev=33c23ccafc7c60812c63fbc921a3795560c8482b rule=O65
exit 0
```

**The merge set cannot be appended as-is (12-cell rows; masked id collision):**
```
$ python3 -c "…"      # merge S199 splits into 12 cells; the merge header has 11
[10] on-release — `curl -fsSL '…' | grep -c …
[11] grep -c 'never replayed automatically'` -> 1 (ran 2026-10-23)
[12] corpus/knowledge/omp-session-sharing-and-mcp-lifecycle.md
$ # appending merge rows S195–S202 to a copy of the lane registry:
file	E01	S195 fields=12   … E01 S202 fields=12      (exit 1; no E03 — the E01 branch `next`s first)
$ # a well-formed duplicate of S200 does report:
file	E03	S200 duplicate id
$ # the lane's S195–S200 carry six documents the merge package also claims, all different:
S195 lane='Worker Versioning — Temporal'      merge='MCP Architecture overview'    same_doc_text=False
S196 lane='阿里云百炼 … multiagent'             merge='Temporal — Detecting Activity' same_doc_text=False
S197 lane='Towards a Science of Scaling'        merge='MCP Tasks extension spec'    same_doc_text=False
S198 lane='Jujutsu (jj) — Concurrency'          merge='oh-my-pi docs/collab.md'      same_doc_text=False
S199 lane='Firefox Source Docs — Jujutsu'       merge='oh-my-pi docs/mcp-runtime-lifecycle.md' same_doc_text=False
S200 lane='Jujutsu (jj) — Working copy'        merge='阿里云百炼 多智能体协作'      same_doc_text=False
```

**The Z.AI second-client attribution, verified independently at the byte offsets:**
```
$ grep -a -b -o -F '2025-03-26' ~/.local/bin/omp.real
99174972  168226055
$ dd if=~/.local/bin/omp.real bs=1 skip=168223500 count=8000 | tr -c '[:print:]\n' '\n' | grep -nE 'zai|2025-03-26'
23: // packages/coding-agent/src/web/search/providers/zai.ts
35: var Z = "2025-03-26";
```

## Findings

**K65ConnOmpSources-1 — severity HIGH (blocks the C2 counter at the lane's own commit; a landing gap, not a content defect).** The six captures bound by `.ufo/pins/source-captures.json` for S201–S206 live at `.ufo/waves/round-65/build/Capture/*` but are **not committed** at `35abe21` (`git ls-tree -r 35abe21 | grep -c 'round-65/build/Capture'` → 0), so O3 (`capture-absent`) and O4 (`quote-not-in-capture`) both MISS: `OMP65_UNMET held=6/8 … exit 1`. The entry, the six rows and the six pins are all correct; the bytes are simply not in the tree. **Reproduce:** `node .ufo/waves/round-65/probe/omp65-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin 35abe21` → 6/8 exit 1; then `git ls-tree -r 35abe21 --name-only | grep -c 'round-65/build/Capture'` → 0. **Fix (L1):** `git add .ufo/waves/round-65/build/Capture` (six files) — proven sufficient: on a scratch clone at `35abe21` with only that addition, `OMP65_HELD held=8/8 checks=8 rev=33c23cca… rule=O65`, exit 0. The round-64 precedent commits its captures (`.ufo/waves/round-64/build/Capture/*.html` at `47fe238`).

**K65ConnOmpSources-2 — severity MEDIUM (live stale statement; no counter checks it).** `corpus/README.md:91` still advertises "docs-on-main vs installed `omp/18.12.3` skew named" for `knowledge/omp-task-contract.md`, although the host reads 18.12.6 and the entry's own amendment (`omp-task-contract.md:216-232`) records it. It is the lane's index of the entry and the first surface a reader hits. **Reproduce:** `grep -n '18\.12\.3' corpus/README.md` → line 91. **Fix (L1):** reword to `omp/18.12.6` and cite the entry's 2026-10-25 amendment.

**K65ConnOmpSources-3 — severity MEDIUM (dangling used-by; the fix is prose, not a cell edit).** `corpus/SOURCES.md:94` (S081, `omp/18.12.6`) names `corpus/knowledge/omp-task-contract.md` as its used-by, but that entry cites S001–S004 only (`grep -c 'S081' corpus/knowledge/omp-task-contract.md` → 0). `scripts/sources-check.mjs` checks the reverse direction (entry citation absent from the row's used-by) and so cannot see it. The entry's `source:` line is inside the base bytes O8 freezes, so it cannot gain S081 without breaking O8's prefix check. **Reproduce:** the two commands above. **Fix (L1):** carry the S081 reference in the amendment's prose; do not edit the header, and do not edit the row.

**K65ConnOmpSources-4 — severity MEDIUM (a doc-vs-registry contradiction; report, do not patch).** `corpus/lessons/round-46.md:36` records "S004 anchor: + round-46 re-run `omp/18.12.6`; teaches dated 'on 2026-10-19'", but round 47 (`269dadb`, "R46-1 rows restored") reverted that edit; today's S004 anchor is `stdout line 1; host omp/18.12.3 (2026-10-19)`. The lesson describes a state the registry no longer holds. **Reproduce:** `sed -n '36p' corpus/lessons/round-46.md` vs `sed -n '17p' corpus/SOURCES.md`, and `git log -L '/| S004 /,+1:corpus/SOURCES.md'`. A lesson is a historical record; the contradiction is an artefact of a documented round-47 restore, not a live falsehood.

**K65ConnOmpSources-5 — severity MEDIUM (the assimilation's upstream half is 170 commits off the installed release).** Upstream `main` is at `0b5c27ab`, which is 170 commits **ahead** of the installed release's tag `v18.12.6` = `45c35e40` (`compare 45c35e40…0b5c27ab` → `status ahead, ahead_by 170, behind_by 0, merge_base 45c35e40`). Every merge-set OMP row (S198/S199/S209/S210/S228/S250) and every staged knowledge entry anchors `main`, and `omp-host-harness-protocol-skew-2026-10-27.md:17-21` concludes "Both sides are on the same revision". That is true of the *protocol constant* and false of the *release*. **Reproduce:** the compare URL above. The plan's re-pointing rule ("adopted ids continue the lane registry at S201 and are re-pointed by document") covers this, but the staged entry's own prose must not assert release-equality.

**K65ConnOmpSources-6 — severity MEDIUM (the merge set's rows cannot be appended as-is; the id collision is masked).** Every merge row is 12 cells (the lane contract is 11, NF=13): the extra cell is an unescaped `|` inside a shell pipeline in the `recheck` text, so the census reports `E01 fields=12` and `next`s before its id check — no `E03 duplicate id` fires even though the merge ids S195–S200 carry six **different** documents from the lane's S195–S200. **Reproduce:** append merge rows S195–S202 to a copy of `corpus/SOURCES.md` and run `sources-census.sh validate --file` on it → eight `E01 … fields=12`; a well-formed duplicate of S200 does give `E03 S200 duplicate id`. **Fix (L1):** re-point by document and rewrite the `recheck` cell without an unescaped pipe; never paste the merge rows verbatim.

**K65ConnOmpSources-7 — severity LOW (a lead that C2 makes stale).** `corpus/SOURCES.md:262-263` still lists "mcp-protocol-transports.md, mcp-runtime-lifecycle.md, collab.md, and advisor-watchdog.md" as unopened OMP docs; S202 opens mcp-runtime-lifecycle.md at the tag. **Reproduce:** `sed -n '262,263p' corpus/SOURCES.md`. **Fix (L1):** drop that one path from the lead list.

**K65ConnOmpSources-8 — severity LOW (the frozen probe receipt and the landed probe now disagree).** `base/omp-binary-probe-freeze.txt` records the 15-key v1 output; the lane's working tree carries a modified `scripts/omp-binary-probe.sh` (v2, 22 keys — verified: `probe-v2-run1.txt` prints 22 `OMP_BIN:` keys) with the entry's §Host measurements updated to the same 22 keys. The subjects are legitimately not frozen, so this is a valid strengthening; but the difference should be recorded rather than left implicit, because O6 compares the entry's block against the probe live, so the two must always move together. **Reproduce:** `diff <(git show HEAD:scripts/omp-binary-probe.sh) scripts/omp-binary-probe.sh`.

**K65ConnOmpSources-9 — severity INFORMATIONAL (S053/S054/S055/S060/S068 vs S201–S206: no duplication).** All five named rows and the six new rows point at one commit, 45c35e40, in two URL forms (blob-at-commit vs raw-at-tag), which the census's host+path normalisation keeps apart — so no W04 group and no `source-dupes` group is created (`SOURCE_DUPES: CLEAN groups=6 known=6`; the census still prints the same six W04s as `base/census-before.txt`). Document by document: S053/S054/S055 (and their supersedes S087/S088/S089) are `packages/utils/src/dirs.ts`, `packages/utils/src/sqlite.ts`, `packages/ai/src/auth/sqlite-credential-store.ts` — **different files, same commit**, scopes disjoint from the MCP layer. S060 and S068 are the **same tree URL** under two scopes (the lane's one known W04 pair, pinned in `source-dupes.json`) — their scopes are agent-root members and task isolation, neither reaching `src/mcp/`. Against the merge set the relation is tighter: merge S199 and new S202 are the **same document** (`docs/mcp-runtime-lifecycle.md`) at two pins and are byte-identical (sha256 362acea5…); merge S228 and new S204 likewise (`client.ts`, 479aef6d…); merge S232 and new S203 are the **same commit** (`10bce690`); merge S250 is a **different subject** (the host artifact) complementary to the entry's §Host measurements.

**K65ConnOmpSources-10 — severity INFORMATIONAL (the three cross-links the new entry should carry, with sentences).** (i) `corpus/knowledge/omp-task-contract.md` §Version skew `:205` — "the installed host reports `omp/18.12.3` (S004) … its implementation was not inspected"; the new entry supplies the missing half for the MCP layer, and the amendment already names the path and "Version skew" as O8 requires. (ii) `corpus/knowledge/omp-agent-root.md:2` — "oh-my-pi tag v18.12.6 = 45c35e40…, the installed `omp --version` → omp/18.12.6": the lane's other statement of the very commit pin the new rows use, so the two entries cannot drift apart silently. (iii) `corpus/knowledge/mcp-orchestration-contract.md` — the lane's MCP contract entry covers the 2026-07-28 *specification* while the host measures 2025-11-25 (`lit_2026_07_28=0`); the new entry must say the host is not on that revision or a reader will read the frontier's MCP row as a statement about this host.

## Artifacts

- `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-65/build/K65ConnOmpSources/consistency.md` — the full scan: 18-row version table, six contradictions, the 'main'-vs-installed table, the S053–S068 ↔ S201–S206 and merge-set document maps, the three cross-links and the amendment-candidate table, the counter diagnosis with the two reproducing commands, and the merge-set id/cell-shape hazard.
- `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-65/w1/K65ConnOmpSources.md` — this report.
- Scratch only, under `/tmp/kumitate-r65/K65ConnOmpSources/` (two `--no-hardlinks` fixture clones of the lane, a SOURCES.md copy used for census experiments, and the fetched upstream files). Nothing outside the lane was written; the lane's git index and `scripts/`, `corpus/`, `PROVINCE.md`, `SCORECARD.md`, `LOG.md`, `SKILL.md`, `.ufo/pins/` were not edited by me. No tool was installed or updated this run.

## Limits

- I did not run the C1 counter (`harm65-probe.mjs`) or judge C1; the scan is scoped to C2's cross-source consistency.
- The 'main vs installed release' comparison used the GitHub compare API and raw fetches, not a local clone of oh-my-pi; a full clone would let me confirm that the 170 commits touch no MCP file beyond the six I fetched, though I did confirm those six are byte-identical at both commits.
- I did not evaluate whether the Z.AI `2025-03-26` attribution is *correct* in upstream's intent, only that the two literals sit in that module — the byte context is quoted in the evidence.
- The counter was run against the lane's commit `35abe21` and against two scratch clones of it; I did not measure any revision after the L1's own landing, and the lane's working tree was still moving while I scanned (it was snapshotted mid-flight by the orchestrator at `35abe21`; `scripts/omp-binary-probe.sh`, `scripts/harm-matrix.mjs`, `scripts/harm-cases.json` and `scripts/class-recurrences.sh` changed under me afterwards). Any figure I quote for the working tree is dated 2026-10-25 and may already be stale.
- I did not open `merge/kumitate`'s `amendments/` directory or the round-7 `KNOWLEDGE-PROPOSED.md`, so the merge set's own admissibility reasoning is outside what I checked.
- The E11 (dangling used-by) finding in my scratch census runs is an artefact of running the census against a SOURCES.md copy outside the lane root (the `used-by` paths are resolved relative to the lane root); it is not a lane defect and I excluded it from the findings.
