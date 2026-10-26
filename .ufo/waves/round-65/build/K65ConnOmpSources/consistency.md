# K65ConnOmpSources — C2 cross-source consistency scan

Seat: K65ConnOmpSources (connector). Lane: kumitate-shokunin. Scanned 2026-10-25.
Scope: what the lane's existing corpus already says about the OMP version and the MCP
protocol, and how the round-65 C2 rows/entry must sit beside it. Read-only on the lane;
all experiments ran on copies under `/tmp/kumitate-r65/K65ConnOmpSources/`.

## 1. Version-statement table (every statement in the lane that names an OMP version)

| # | path:line | version stated | kind | live? |
|---|---|---|---|---|
| V1 | `corpus/SOURCES.md:17` (row S004) | `omp/18.12.3` | registry row, `mined`, used-by `corpus/knowledge/omp-task-contract.md` | **stale-but-superseded** — S081 (`:94`) says "supersedes S004 — … S004's omp/18.12.3 is a dated 2026-10-19 observation, not current" |
| V2 | `corpus/SOURCES.md:94` (row S081) | `omp/18.12.6` | registry row, `mined`, used-by omp-task-contract.md | **current**, but not cited by the entry that uses it (see §4) |
| V3 | `corpus/knowledge/omp-task-contract.md:2` (`verified-at:`) | `host omp/18.12.3` | entry header | **stale** — the host ran 18.12.6 on 2026-10-19 too |
| V4 | `corpus/knowledge/omp-task-contract.md:3` (`recheck:`) | `omp --version` → omp/18.12.3 | entry header, a recheck command + dated value | **stale as a value, still correct as a procedure** |
| V5 | `corpus/knowledge/omp-task-contract.md:205` (§Version skew) | "the installed host reports `omp/18.12.3` (S004)" | entry body | **stale** |
| V6 | `corpus/knowledge/omp-task-contract.md:207, :214` | `omp/18.12.3`, observed 2026-10-19 | two copies of the S004 quote | **correct as a dated observation**, wrong as a present tense |
| V7 | `corpus/knowledge/omp-task-contract.md:222` | `omp/18.12.6` | the new appended Amendment | **current** |
| V8 | `corpus/README.md:91` | "docs-on-main vs installed `omp/18.12.3` skew named" | README map row | **stale** — still 18.12.3 after the amendment landed |
| V9 | `LOG.md:1458` | "docs on `main` vs host `omp/18.12.3`" | historical round-34 log line | **correct as history**, must not be edited |
| V10 | `corpus/lessons/round-34.md:66, :98` | `omp/18.12.3` | historical lesson | correct as history |
| V11 | `corpus/lessons/round-46.md:36` | "S004 anchor: + round-46 re-run `omp/18.12.6`" | lesson row-log | **contradicted by the registry** — see §5 |
| V12 | `corpus/lessons/round-47.md:29` | S081 `omp/18.12.6` | lesson row-log | current |
| V13 | `corpus/knowledge/omp-agent-root.md:2` | `omp/18.12.6` = tag v18.12.6 = 45c35e40 | entry header | **current** — same commit pin the new rows use |
| V14 | `corpus/knowledge/agent-isolation-substrates.md:2` | `omp/18.12.6 = oh-my-pi 45c35e40` | entry header | **current** |
| V15 | `corpus/SOURCES.md:66, :68, :73, :81` (S053/S054/S055/S060/S068) | "v18.12.6" | registry rows at commit 45c35e40 | current |
| V16 | `corpus/knowledge/omp-installed-release-mcp-runtime.md:2, :11, :23` | `omp/18.12.6` | new entry | current |
| V17 | `corpus/knowledge/omp-installed-release-mcp-runtime.md:26, :195` | `omp/18.12.3` | new entry, as a dated observation | correct as history |
| V18 | `PROVINCE.md:20`, `corpus/README.md:193` | `omp/18.12.6` | frontier line + README row | current |

**Host truth, measured now (2026-10-25):** `bash scripts/omp-binary-probe.sh` prints
`OMP_BIN: real_version=18.12.6` and exits 0; `OMP_NO_RESTART=1 ~/.local/bin/omp.real --version`
prints `omp/18.12.6`. The installed release is 18.12.6, tag `v18.12.6` =
`45c35e40c46166dc726ccc52f5d27f40f2449f99` (`git ls-remote … refs/tags/v18.12.6`).

## 2. Contradictions and stale statements

**C1 — the entry that owns the skew paragraph still says 18.12.3 in three places.**
`omp-task-contract.md:205` reads "the installed host reports `omp/18.12.3` (S004)" while
`:222` (the amendment the same file now carries) records the host at 18.12.6. A reader who
takes §Version skew at face value gets the wrong version. **The amendment already in the
lane resolves it** — but only if the amendment says so *in the paragraph's terms*; it
currently answers three quoted clauses of §Version skew, and one of them ("the installed
host reports omp/18.12.3 (S004)") is answered with "a dated observation that still stands
for 2026-10-19". That is honest. The remaining defect is V8 (`corpus/README.md:91`), which
still advertises "installed `omp/18.12.3`" to a reader who never opens the entry.

**C2 — `corpus/README.md:91` is the last live surface naming 18.12.3 as the present.**
`grep -c 'omp/18\.12\.3' corpus/README.md` → 1 (row 91). Every other 18.12.3 mention in the
lane is either dated history (LOG, lessons) or explicitly a dated observation. The README
row is the lane's own index of the entry and it is the one a reader hits first.

**C3 — `S081` is `mined`, points at `omp-task-contract.md`, and is cited by nothing.**
`corpus/SOURCES.md:94` names `corpus/knowledge/omp-task-contract.md` as its used-by, but
`grep -c 'S081' corpus/knowledge/omp-task-contract.md` → 0: the entry's `source:` line cites
S001–S004 only. `scripts/sources-check.mjs` checks the reverse direction (an entry citation
absent from that row's used-by) and so cannot see this. The result is a mined row whose
own used-by claims a consumer that does not cite it, and the entry's `source:` header
still lists the superseded S004 while the entry's prose has moved to 18.12.6.

**C4 — the round-46 lesson's row-log contradicts the registry it describes.**
`corpus/lessons/round-46.md:36` says "S004 anchor: + round-46 re-run `omp/18.12.6`; teaches
dated 'on 2026-10-19'". At commit `980a16a` (round 46) the S004 row did carry that text.
At `269dadb` (round 47, "R46-1 rows restored") the row was **restored** to its `2b2bf7bb`
bytes and the round-46 edit was undone. Today's S004 anchor is exactly
`stdout line 1; host omp/18.12.3 (2026-10-19)` — no re-run clause, no dated teaches. So the
lesson's row-log describes a state the registry no longer holds. Verified by
`git log -L '/| S004 /,+1:corpus/SOURCES.md'` (see §7).

**C5 — `main` docs are cited as if they were the installed release's.**
`corpus/SOURCES.md:14-16, :37` (S001, S002, S003, S024) carry `…/blob/main/docs/…` URLs
anchored to `main 81fa40e` / `main 10b9b493`; `corpus/knowledge/omp-task-contract.md:1`
cites those three as its `source:`. `main` has moved since (now `0b5c27ab`), and the lane
knows it — S080 re-pins task-agent-discovery.md at `0b5c27ab` and calls the anchor
"upstream main". `docs/tools/task.md` at `main 81fa40e` (36 687 B) differs from the same
path at today's `main` (36 954 B): upstream added a sentence about batch calls rejecting a
top-level `agent`. So the lane's task-contract entry is grounded in a `main` that no longer
exists, and its `verified-at` header dates that `main` only as "the path-specific commits
in the verified-at header" without naming them in the row cells.

**C6 — the merge set's OMP rows sit on `main`, not on the installed release's tag.**
`merge/kumitate/SOURCES.append.md` rows S198/S199/S209/S210/S228/S250 all anchor
`oh-my-pi main 0b5c27ab` (or the tree at that commit). The staged knowledge entries
`omp-mcp-protocol-version-code.md`, `omp-mcp-version-negotiation-decision.md` and
`omp-host-harness-protocol-skew-2026-10-27.md` all cite `main` as the upstream half of the
pair. `main` is 170 commits ahead of the installed release's tag
(`compare 45c35e40…0b5c27ab` → `status: ahead, ahead_by: 170, behind_by: 0`,
`merge_base 45c35e40`). The staged `omp-host-harness-protocol-skew-2026-10-27.md` asserts
"upstream `main` … `main` is still `0b5c27ab`, unmoved since round 4" and concludes
"Both sides are on the same revision" — true for the *protocol constant*, false for the
*release*: the installed binary is the tag, and main is 170 commits past it.

**C7 — the merge set's own row for the installed binary is `own-work` and cites a path in
another repo.** `S250` in `merge/kumitate/SOURCES.append.md` is
"the host's omp installation — launcher …, binary …, byte-sweep transcript
`/home/vgpnk/Projects/shokuknow/lanes/kumitate/round7/omp-binary-protocol-sweep.txt`". The
lane's C2 rows instead cite release-tree files at the tag. Both are legitimate; they are
different subjects (host artifact vs upstream source), and the new entry covers both.

## 3. Where 'main' docs are cited as if they were the installed release's

| site | what it says | the installed release |
|---|---|---|
| `corpus/SOURCES.md:14` S001 | `oh-my-pi docs/tools/task.md — …/blob/main/docs/tools/task.md`, anchor "main 81fa40e (2026-10-19)" | the installed release carries the same file at tag v18.12.6 (byte-identical to today's `main`, 36 954 B, but **not** to the 81fa40e text the row anchors) |
| `corpus/SOURCES.md:15` S002 | agent-hub.md @ main 81fa40e | same situation |
| `corpus/SOURCES.md:16` S003 | task-agent-discovery.md @ main 81fa40e | superseded by S080 @ 0b5c27ab |
| `corpus/SOURCES.md:37` S024 | docs/mcp-config.md @ main 10b9b493 | `queued`, never opened at the tag |
| `corpus/knowledge/omp-task-contract.md:1` | `source:` = S001–S004, all `main`/host-version | the whole entry is grounded in `main` docs + a dated 18.12.3 stdout line |
| `PROVINCE.md:19` | "the docs track upstream `main` while the host runs the installed `omp` binary" | this sentence is the frontier's own statement of the skew; after C2 it should also name the tag |
| `merge/…/S199` | docs/mcp-runtime-lifecycle.md @ main 0b5c27ab | the same document at the tag is byte-identical (sha256 362acea5…) — see §4 |

## 4. S053 / S054 / S055 / S060 / S068 vs the new rows S201–S205

The five named rows and the six new rows all point at oh-my-pi **v18.12.6** =
(45c35e40c46166dc726ccc52f5d27f40f2449f99) — one commit, two URL *forms*:

- S053/S054/S055 (and their supersedes S087/S088/S089) use
  `github.com/…/blob/45c35e40…/packages/…`;
- S060/S068 use `github.com/can1357/oh-my-pi/tree/45c35e40…` (a whole-tree pin);
- S201–S206 use `raw.githubusercontent.com/…/v18.12.6/…` (raw at the **tag**).

Because the census normalises a URL by host+path and the raw form's path contains
`v18.12.6` while the blob form's contains `45c35e40…`, **no W04 duplicate group is created
** — confirmed: `sources-census.sh validate` on the lane's own SOURCES.md prints the same six
W04 warnings as `base/census-before.txt` and `ok`; `node scripts/source-dupes.mjs` prints
`SOURCE_DUPES: CLEAN groups=6 known=6`. The two forms therefore coexist silently — which
is a *latent* duplication risk, not a live one.

Document-by-document relation to the new rows:

| old row | document at 45c35e40 | new row | relation |
|---|---|---|---|
| S053 / S087 | `packages/utils/src/dirs.ts` (agent-root member names) | S201 `packages/coding-agent/src/mcp/types.ts` | **different file, same commit.** S053's subject is the agent-root directory; S201's is the MCP protocol constant. No overlap. |
| S054 / S088 | `packages/utils/src/sqlite.ts` (corruption quarantine) | S201 | different file, same commit; no overlap |
| S055 / S089 | `packages/ai/src/auth/sqlite-credential-store.ts` (agent.db 0600) | S201 | different file, same commit; no overlap |
| S060 | **the whole tree** at 45c35e40, scope "which OMP code reads or writes the agent-root members not named in dirs.ts" | S201–S206 | **same commit, same tree, disjoint scope.** S060 is pinned to the tree because it enumerates *member readers/writers*; S201–S206 are pinned to individual files because they quote line-anchored literals. S060's anchor does not name `src/mcp/` at all. No document overlap, no scope overlap. |
| S068 | the same tree URL again, scope "OMP task isolation … default, backend order, workspace, merge, cleanup" | S201–S206 | **same commit, same tree URL, disjoint scope** — S060 and S068 are the one known W04 pair in the lane (`source-dupes.json` pins them). Their scope (task isolation) does not reach `src/mcp/`. |

So: **none of S053/S054/S055/S060/S068 is a duplicate of S201–S206.** They share the commit
and (for S060/S068) the tree, and differ in file and in scope. S205 (`zai.ts`) and S206
(`http.ts`) are files the lane held no row for at all.

Against the **merge set**, the relations are different and tighter:

| merge row | document | new row | relation |
|---|---|---|---|
| merge S199 | `docs/mcp-runtime-lifecycle.md` @ main 0b5c27ab | S202, same doc @ tag v18.12.6 | **same document, different commit pin.** Byte-identical (sha256 362acea5d3d0eca0d54aa9a80febab5a43634007ab40a435dbb0c75079cf83d at both 0b5c27ab and 45c35e40 — verified by fetching both). The new row re-points the same bytes onto the installed release's tag, which is the plan's "re-pointed by document" requirement. |
| merge S228 | `packages/coding-agent/src/mcp/client.ts` @ main | S204, same doc @ tag | same document, different pin; byte-identical (sha256 479aef6d…) at both commits |
| merge S232 | commit `10bce690` (the header/negotiation fix) | S203, same commit (`.patch` URL) | **same commit.** S203 is the merge row's document re-anchored to the patch artifact |
| merge S250 | the host's omp installation (own-work byte sweep) | the entry's §Host measurements + `scripts/omp-binary-probe.sh` | **different subject** (host artifact vs upstream source); complementary, not duplicate |
| merge S198/S209/S210 | collab.md / advisor-watchdog.md / mcp-protocol-transports.md @ main | — | not in the new rows; the new entry's scope explicitly excludes collab |

The lane's own `corpus/SOURCES.md` §Leads still lists "mcp-protocol-transports.md,
mcp-runtime-lifecycle.md, collab.md, and advisor-watchdog.md" as unopened OMP docs
(`corpus/SOURCES.md:262-263`). After C2 lands, **mcp-runtime-lifecycle.md is opened** and
that lead list needs the one-line correction (the entry's own scope section says the
collab half is not absorbed).

## 5. Three cross-links the new entry should carry to existing lane entries

1. **`corpus/knowledge/omp-task-contract.md` §Version skew** (`:205`) — "the installed host
   reports `omp/18.12.3` (S004) … the binary's version was observed, but its implementation
   was not inspected". The new entry is the missing half for the MCP layer; the amendment
   already in the lane carries the cross-link. **Keep it**: the amendment names the new
   path and the string "Version skew", which is exactly what O8 requires.
2. **`corpus/knowledge/omp-agent-root.md:2`** — "oh-my-pi tag v18.12.6 = 45c35e40…, the
   installed `omp --version` → omp/18.12.6". This is the lane's *other* statement of the
   same commit pin the new rows use. The new entry should say so explicitly: same tag, same
   commit, different subject (agent-root members vs the MCP layer), so the two entries
   cannot drift apart silently.
3. **`corpus/knowledge/mcp-orchestration-contract.md`** — the lane's MCP contract entry
   (round 59, S125/S127/S136) covers the **2026-07-28 specification**. The new entry
   measures the installed release as **2025-11-25** with `lit_2026_07_28=0`. These are
   adjacent, not competing: one is the spec, one is the host. The new entry should carry an
   explicit "this host is not on the revision the spec entry describes" sentence, or a
   reader will take the frontier's MCP row as a statement about this host.

## 6. Amendment candidates — claims in existing entries the new entry contradicts

| existing claim | where | contradicts? | verdict |
|---|---|---|---|
| "the installed host reports `omp/18.12.3` (S004)" | omp-task-contract.md:205 | **yes** — measured 18.12.6 | **Amendment candidate.** The amendment (`:216-232`, added at 35abe21) already answers it clause-by-clause. It is the right vehicle: O8 requires the file to keep its base bytes as a prefix, so an in-place edit is forbidden and an append is the only legal fix. |
| "docs-on-main vs installed `omp/18.12.3` skew named" | corpus/README.md:91 | **yes** | **Amendment candidate.** The README row is the lane's own index and still advertises the stale version. It is a live surface, editable by the L1, and no counter checks its prose. |
| S004's `teaches`: "Installed harness version omp/18.12.3 for version-skew checks against upstream main docs" | corpus/SOURCES.md:17 | **no** — S081 supersedes it and says so | Leave. The row is `mined` with `used-by omp-task-contract.md`; the supersession is explicit. Do not touch a frozen-by-round row. |
| S081 `used-by: corpus/knowledge/omp-task-contract.md` while the entry cites S001–S004 only | corpus/SOURCES.md:94 vs omp-task-contract.md:1 | **yes** (a dangling used-by) | **Report, do not patch.** The entry's `source:` line is inside the base bytes O8 freezes; it cannot gain S081 without breaking the O8 prefix check. The correction belongs in the amendment's prose, not in the header. |
| round-46 lesson's "S004 anchor: + round-46 re-run `omp/18.12.6`" | corpus/lessons/round-46.md:36 | **yes** — round 47 restored the row | **Report, do not patch.** A lesson is a historical record of a round's edits; the registry moved on in round 47 by design. The contradiction is a documentation-of-history artefact, not a live falsehood. |
| "the docs track upstream `main` while the host runs the installed `omp` binary" | PROVINCE.md:19 | **no** — still true, but now under-specified | Optional tightening: name the tag and the commit, as the new PROVINCE line (:20) does. |
| merge-set "upstream `main` … `main` is still `0b5c27ab`" / "Both sides are on the same revision" | merge/…/omp-host-harness-protocol-skew-2026-10-27.md:17-21 | **partly** — same protocol revision, but main is **170 commits ahead** of the installed release | If the merge entry is admitted, its upstream half must be re-pointed to the tag. The plan already requires this ("rows … re-pointed by document"). |

## 7. Reproducing commands

```
# host truth (the installed release and its tag)
bash /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/omp-binary-probe.sh
OMP_BIN: real_version=18.12.6
OMP_BIN_PROBE: DONE omp=18.12.6
git ls-remote https://github.com/can1357/oh-my-pi refs/tags/v18.12.6
45c35e40c46166dc726ccc52f5d27f40f2449f99	refs/tags/v18.12.6

# every version statement in the lane
grep -rn -o -E 'omp/18\.12\.[0-9]+' corpus SKILL.md PROVINCE.md SCORECARD.md LOG.md | sort

# the entry that owns the skew, and its stale header
grep -n 'omp/18\.12\.' corpus/knowledge/omp-task-contract.md
grep -n '18\.12\.3' corpus/README.md

# S081 is used-by an entry that does not cite it
grep -c 'S081' corpus/knowledge/omp-task-contract.md      # 0
awk -F'|' '/^\| S081 /{print $12}' corpus/SOURCES.md        # corpus/knowledge/omp-task-contract.md

# the round-46 lesson vs the restored row
sed -n '36p' corpus/lessons/round-46.md
sed -n '17p' corpus/SOURCES.md | awk -F'|' '{print $7}'
git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin log --oneline -L '/| S004 /,+1:corpus/SOURCES.md'
#   269dadb round-47 … |+| S004 | … stdout line 1; host omp/18.12.3 (2026-10-19) |   <- restored
#   980a16a round-46 … |+| S004 | … ; re-run 2026-10-23 (round 46, SweepS001S005): `omp/18.12.6` …  <- the edit the lesson describes

# 'main' has moved under the lane's main-anchored rows
curl -sSL -o /tmp/t1 https://raw.githubusercontent.com/can1357/oh-my-pi/81fa40e/docs/tools/task.md
curl -sSL -o /tmp/t2 https://raw.githubusercontent.com/can1357/oh-my-pi/0b5c27ab24719c86a5986b95ee55f4e75bc1aaa0/docs/tools/task.md
wc -c /tmp/t1 /tmp/t2        # 36687  36954  -> upstream added a sentence since 81fa40e

# main is 170 commits ahead of the installed release's tag
curl -sS "https://api.github.com/repos/can1357/oh-my-pi/compare/45c35e40c46166dc726ccc52f5d27f40f2449f99...0b5c27ab24719c86a5986b95ee55f4e75bc1aaa0"
#   "status":"ahead","ahead_by":170,"behind_by":0,"merge_base_commit":45c35e40...

# the merge set's rows are 12-cell (E01) and their ids collide with the lane's
python3 -c "print(len(open('/home/vgpnk/Projects/shokuknow/merge/kumitate/SOURCES.append.md').readline()))"
/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --file corpus/SOURCES.md
#   file  E01  S195 fields=12 … (every appended merge row)
#   E03 duplicate id is NOT reported for a 12-cell row: the E01 branch does `next` before the id check

# the new rows create no new duplicate group
node scripts/source-dupes.mjs
#   SOURCE_DUPES: CLEAN groups=6 known=6
```

## 8. The frozen counter at the lane's own commit — and the one thing that blocks it

At the lane's current commit `35abe21ba64064c028060a8e4f31984b65b26df0`:

```
node .ufo/waves/round-65/probe/omp65-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin 35abe21
OMP65_UNMET held=6/8 checks=8 rev=35abe21… rule=O65 | O3 MISS S201:capture-absent,…
      S202:capture-absent,S203:capture-absent,S204:capture-absent,S205:capture-absent,S206:capture-absent
    | O4 MISS S201:quote-not-in-capture(export const MCP_PROTOCOL_VERS);…
exit 1
```

**Root cause (verified, not inferred).** `.ufo/pins/source-captures.json` binds S201–S206 to
`.ufo/waves/round-65/build/Capture/*`, and those six files exist **on disk** but are **not
committed**: `git ls-tree -r 35abe21 --name-only | grep -c 'round-65/build/Capture'` → **0**.
O3 reads the capture out of `git archive <rev>`, so an uncommitted capture is absent → O3
MISS → O4's quote-in-capture test fails on the same missing bytes. The round-64 precedent
shows the captures belong in the tree: `git ls-tree -r 47fe238 --name-only | grep
'round-64/build/Capture'` lists three committed capture files.

**Proof that committing them is sufficient.** On a scratch clone (`--no-hardlinks`) of the
lane at `35abe21`, adding only the six capture files and committing:

```
git add .ufo/waves/round-65/build/Capture
git -c user.name=fixture -c user.email=fixture@example.test commit -m "fixture: commit the six captures"
node .ufo/waves/round-65/probe/omp65-probe.mjs <clone> 33c23ccafc7c60812c63fbc921a3795560c8482b
OMP65_HELD held=8/8 checks=8 rev=33c23ccafc7c60812c63fbc921a3795560c8482b rule=O65
exit 0
```

The lane working tree additionally carries a modified `scripts/omp-binary-probe.sh`
(v2, 22 keys) with the entry's §Host measurements updated to the same 22 keys — consistent,
and O6 compares the entry's block against the probe live, so the two must move together.
The frozen `base/omp-binary-probe-freeze.txt` receipt records the **15-key** v1 output; the
v2 hardening is a legitimate subject change (the claim's subjects are explicitly not frozen),
but the freeze receipt and the landed probe now disagree on key count, and that difference
should be recorded rather than left implicit.

**This is a landing gap, not a content defect.** The counter cannot be blamed on the entry,
the rows or the pins: all three are correct at `35abe21`; the captures are simply not in the
tree. The L1 must `git add .ufo/waves/round-65/build/Capture` (six files) before the claim
is measured.

## 9. One more cross-source hazard: the merge set's id space and cell shape

The merge package `/home/vgpnk/Projects/shokuknow/merge/kumitate/SOURCES.append.md` cannot
be appended to the lane registry as-is:

- **Every merge row is 12 cells, the lane contract is 11** (NF=13 including the two
  boundary empties). `python3` on the file's own header gives 11 cells; on S199 gives 12.
  The census reads `NF!=13` → `E01 fields=12`. Reproduced: appending merge rows S195–S202
  to a copy of the lane's SOURCES.md yields
  `file E01 S195 fields=12 … S202 fields=12`, exit 1.
- **The extra cell is an unescaped `|` inside the `recheck` text.** Merge S199's cells are
  `[10] on-release — curl … | grep -c …` and `[11] grep -c 'never replayed automatically'`
  — the shell pipe inside a backtick-quoted command splits the Markdown cell. The lane's own
  rows keep the pipe inside one cell by not putting a shell pipeline in `recheck`.
- **Ids S195–S228 collide with the lane's own registry.** The lane already uses S195–S200
  for *different documents* (Temporal Worker Versioning, 阿里云百炼, Scaling Agent Systems,
  jj Concurrency, Firefox Jujutsu, jj Working copy) while the merge package uses the same
  ids for other documents (MCP Architecture overview, Temporal, MCP Tasks spec, collab.md,
  mcp-runtime-lifecycle.md, 阿里云百炼). Verified by comparing the two files' rows cell by
  cell: every one of S195–S200 differs in document. Appending merge rows S195–S202 to a copy
  of the lane registry produced **no E03 duplicate-id finding** — because the E01 branch
  `next`s before the id check — so the collision is masked, not absent. A well-formed
  duplicate of S200 does produce `file E03 S200 duplicate id`.
- The plan anticipates this: "adopted ids continue the lane registry at S201 and are
  re-pointed by document." Re-pointing must be by **document**, since the merge ids carry
  no information the lane can reuse.

## 10. Cross-links for the L1 (concrete, in the lane's own surfaces)

1. `corpus/README.md:91` — change "installed `omp/18.12.3`" to "installed `omp/18.12.6`
   (the entry's amendment 2026-10-25)", and add the new entry's row (already drafted at
   `corpus/README.md:193`).
2. `corpus/SOURCES.md:262-263` — the §Leads line "mcp-protocol-transports.md,
   mcp-runtime-lifecycle.md, collab.md, and advisor-watchdog.md" must drop
   mcp-runtime-lifecycle.md (now opened at the tag as S202).
3. `corpus/knowledge/omp-installed-release-mcp-runtime.md` — carry the three cross-links of
   §5 (omp-task-contract §Version skew; omp-agent-root's identical tag pin;
   mcp-orchestration-contract's spec-revision adjacency), and state plainly that the host
   is on 2025-11-25 while the lane's MCP-contract entry describes 2026-07-28.
4. `corpus/knowledge/omp-agent-root.md:2` and `corpus/knowledge/agent-isolation-substrates.md:2`
   — both already say "omp/18.12.6 = oh-my-pi 45c35e40"; no edit needed, but the new entry
   should cite them so the three surfaces agree on one commit pin.
