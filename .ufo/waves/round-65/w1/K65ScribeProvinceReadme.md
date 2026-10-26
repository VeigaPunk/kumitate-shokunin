VERDICT: All four paste-ready edit sets (PROVINCE line 19, README map rows + Frontier bullet, the append-only `Amendment 2026-10-25`, SKILL registry rows + checklist items) are drafted as exact replace/paste text in the build dir with every claim re-measured on this host; nothing was applied to the lane, and measuring the frozen round-open state turned up an unaccounted proxy term (`A` +6 caused by the freeze commit itself) plus a worktree-vs-revision split in the same gate.

## Evidence

Commands run at lane `2ca91a0c81542cad5f731049aa55dd2f99ade98d` (freeze); full transcripts in the build dir's `## Claim checks`.

```
$ git log -1 --format='%H %s'
2ca91a0c81542cad5f731049aa55dd2f99ade98d round-65: freeze — plan, counters H65/O65 with pins, 16 controls, base receipts, harm-matrix v1, omp-binary-probe v1, readme row for the r64 spot-check
$ test -e corpus/knowledge/omp-installed-release-mcp-runtime.md      → absent (draft path; L1 creates it)
$ cat .ufo/waves/round-65/base/omp-release-tag.txt
45c35e40c46166dc726ccc52f5d27f40f2449f99	refs/tags/v18.12.6
$ bash scripts/omp-binary-probe.sh; echo $?
OMP_BIN: wrapper_is_script=1 … real_version=18.12.6 … lit_2025_11_25=2 lit_2026_07_28=0 lit_2025_03_26=2
sym_MCP_PROTOCOL_VERSION=3 header_MCP-Protocol-Version=3 sym_DeferredMCPTool=3 collab_hosts_literal=2 docs_phrase_never_replayed=0
OMP_BIN_PROBE: DONE omp=18.12.6
0                                    # 15 `OMP_BIN:` keys
$ node scripts/harm-matrix.mjs --selftest
HARM_MATRIX_SELFTEST: PASS (26/26)   # exit 0, real 6.98s
$ node scripts/harm-matrix.mjs --base 6825a514 --tip a004902d --only readme-map,proxy-check
HARM_ROW gate=readme-map base=NOT_CLEAN tip=CLEAN id=REPAIRED base_text="README_MAP: DRIFT files=154 rows=153 covered=153 bad=2 first=uncovered:lessons/round-63-verifier-spotcheck.md [exit=1]" tip_text="README_MAP: CLEAN files=156 rows=156 covered=156"
HARM_ROW gate=proxy-check base=NOT_CLEAN tip=CLEAN id=REPAIRED …
HARM_MATRIX: CLEAN gates=2 held=0 repaired=2 carried=0 moved=0 new=0 gone=0 harm=0 harm_absent=0 new_red=0 base=6825a51425e9 tip=a004902d77d1
                                     # exit 0, real 12.46s
$ node -e '…harm-matrix-gates.json / harm-cases.json…'
gates=20 (12 lane rows + 8 selftest rows)  cases=26  exit0=12  all ten transition ids exercised
$ ls .ufo/waves/round-65/controls/harm/ | wc -l        → 17 (16 case dirs + MANIFEST.sha256)
$ grep -c '^\s*- \[' SKILL.md                          → 33
$ awk …'/^\| name \|/' SKILL.md (registry data rows)   → 28 = 24 gate rows / 23 gate files + cap-run + counter-rerun + cap-spawn + jj-seat-demo
$ wc -l corpus/knowledge/omp-task-contract.md          → 214; ends `out `omp/18.12.3`, observed 2026-10-19.\n`
$ git diff --stat 47fe2383 -- corpus/knowledge/omp-task-contract.md   → empty; blob 9ad41eaf… at both revs (O8 prefix holds)
$ grep -n '250 ms\|never replayed automatically\|backoff\|2025-11-25\|DeferredMCPTool' <S202 capture>
:114 250 ms · :152 never replayed automatically · :198 500/1000/2000/4000 ms, >5 in 30 s · :101 2025-11-25 · :13,121,150 DeferredMCPTool
$ sed -n '169,181p' <S201/S206 capture types.ts>  → l.171 "Latest MCP protocol revision this client negotiates." ; l.181 export const MCP_PROTOCOL_VERSION = "2025-11-25";
$ sha256sum build/K65{ScoutTypesTs,ScoutTagVersion}/capture/types.ts
caa3eadeb21bc36d8c6a4bf65fd362b1b27d4c189ca40684b1e11075c48bfe0d  (both; 6 × `2025-11-25` each)
```

Frozen round-open state, measured twice — clean `git archive 2ca91a0c` vs the live worktree:

```
$ cd /tmp/kumitate-r65/K65ScribeProvinceReadme/freeze && node scripts/proxy-check.mjs
PROXY  error  A_DRIFT  A: declared=351 computed=357 delta=+6
PROXY  error  C2_DRIFT  C2: declared=156 computed=157 delta=+1
PROXY  error  C2_TOTAL_DRIFT  C2_total: declared=156 computed=157 delta=+1
PROXY  warn  PIN_UNPINNED  scripts/harm-matrix.mjs has no pin.<name> key in the kumitate-proxy-v1 or kumitate-gate-pins-v1 stanza
PROXY: DRIFT (…)
$ cd <lane worktree> && node scripts/proxy-check.mjs; echo $?     → A: declared=351 computed=368 delta=+17 … PROXY: DRIFT … 1
$ node scripts/readme-map.mjs   → README_MAP: CLEAN files=157 rows=157 covered=157  (exit 0, both)
$ cat .ufo/waves/round-65/base/proxy-before.txt   → C2_TOTAL_DRIFT + AXES_DRIFT only; no A_DRIFT
$ git ls-tree -r --name-only 47fe2383 | grep -cE '\.(mjs|js|sh|py)$' → 351 ; at 2ca91a0c → 357
```

## Findings

**K65ScribeProvinceReadme-1** (medium — the round's own landing moved a gate it did not run; attacks C1's "no axis harmed" and the D2 maintenance line). The freeze commit `2ca91a0c` added six runnable files (`scripts/harm-matrix.mjs`, `scripts/omp-binary-probe.sh`, `.ufo/waves/round-65/probe/{harm65-probe.mjs,omp65-probe.mjs,gen-harm-cases.mjs,omp-donothing-control.sh}`), so `proxy-check`'s `A` term reads `declared=351 computed=357 delta=+6` in the clean archive — a drift cause absent at base `47fe2383` (`base/proxy-before.txt` has only `C2_TOTAL_DRIFT` + `AXES_DRIFT`). The plan names only "proxy stanza refresh at the close", which is sufficient only if the refresh recomputes `A`; the drafts therefore list `A 351→357`, `C 33→35`, `C2`/`C2_total` `157→159` as four terms (edits.md §5.3). Repro: `git archive 2ca91a0c | tar -x -C $D && cd $D && node scripts/proxy-check.mjs`.

**K65ScribeProvinceReadme-2** (medium — same gate, different conclusion: it reads the worktree, not a revision). In the lane worktree the same gate reads `A: declared=351 computed=368 delta=+17`; the +11 beyond the committed six are wave-1 seats' untracked build artifacts (`build/*/verify-quotes.mjs` etc.), since `A = walkFiles(self).filter(RE_RUNNABLE).length` (`scripts/proxy-check.mjs:947`). Any report that quotes `proxy-check` at HEAD conflates seat scratch with the committed revision, and the close refresh must be taken from the final committed tree (or the archive), not the working directory. Repro: `node scripts/proxy-check.mjs` (368) beside the archive run above (357).

**K65ScribeProvinceReadme-3** (low — pin coverage of the new instruments). At the freeze `proxy-check` warns `PIN_UNPINNED term=scripts/harm-matrix.mjs` and says nothing about `scripts/omp-binary-probe.sh`, although the round-64 `.sh` instrument `jj-seat-demo` does carry `pin.jj-seat-demo`. An unpinned new `.sh` therefore enters the tree with the pin gate silent; the drafts hand the L1 both hashes (`pin.harm-matrix=6bde065f…7560`, `pin.omp-binary-probe=87746405…17e3`, recompute after any executor patch). Repro: `node scripts/proxy-check.mjs 2>&1 | grep PIN_`.

**K65ScribeProvinceReadme-4** (low — a duplicate row proposed for one source). `K65ScoutTagVersion` proposes a third row (S206) for `packages/coding-agent/src/mcp/types.ts` at the tag URL, beside the already-drafted S201 for the same file at the commit URL. Both captures are byte-identical (`sha256 caa3eade…b e0d`, 6 × `2025-11-25`), so admitting both counts one source twice and `source-dupes` cannot see it (different normalised URLs). The drafts cite S201/S202/S204/S205 and note the drop; if S206 is allocated instead, S201 must be dropped, not added to. Repro: `sha256sum .ufo/waves/round-65/build/K65{ScoutTypesTs,ScoutTagVersion}/capture/types.ts`.

**K65ScribeProvinceReadme-5** (info — frozen plan wording that a careful entry must not copy). C2's "Surface it moves" says the PROVINCE line "gains the first entry that **measures the installed release**", and the task frames it as "resolving the Version skew". What the probe measures is the release version, the wrapper and byte literals; no task/hub default or lifecycle rule is re-measured, so the drafts resolve only the version-to-commit mapping and the MCP constant and say the docs-vs-binary question stays open (PROVINCE line, README Frontier bullet, amendment's second bullet). An entry that claimed the whole skew resolved would be false, and O8's "naming the entry path and `Version skew`" would still pass it — the counter cannot tell the difference.

**K65ScribeProvinceReadme-6** (low — two Frontier surfaces drift together, only one is named). The OMP frontier statement exists twice (`PROVINCE.md:19` and `corpus/README.md:283`) and C2 names only PROVINCE; `readme-map`/`cite-check` do not read the README Frontier prose, so a one-sided update is silent. The drafts give both replacements, and §2a also fixes the map rows the entry + `lessons/round-65.md` need for `README_MAP: CLEAN`, since `readme-map` counts exactly one row per file. Repro: `sed -n '19p' PROVINCE.md; sed -n '283p' corpus/README.md`.

## Artifacts

- `.ufo/waves/round-65/build/K65ScribeProvinceReadme/edits.md` — the four paste sets (`PROVINCE.md:19`, `corpus/README.md:192`-append rows + `:283` bullet, `omp-task-contract.md` append after line 214, `SKILL.md` header sentence + new probe paragraph + two registry rows + checklist preamble + two items), the close-time pin/proxy obligations, and the claim-check transcript block.
- `.ufo/waves/round-65/w1/K65ScribeProvinceReadme.md` — this report.
- Scratch: `/tmp/kumitate-r65/K65ScribeProvinceReadme/` (`freeze/` = `git archive 2ca91a0c` extraction used for the revision-true proxy run; `probe.out`). No tool was installed or upgraded.

## Limits

- Nothing applied: `PROVINCE.md`, `corpus/`, `SKILL.md`, `scripts/`, `SCORECARD.md`, pins and the index are untouched; the L1 owns integration.
- The corpus entry `corpus/knowledge/omp-installed-release-mcp-runtime.md` does not exist yet (scribes A/B had no build output when I read), so the amendment and the README row were written against the plan's O1–O8 and the scouts' S201/S202/S204/S205 drafts, not against the entry's final prose; if the entry cites a different id set, the citation cells and the `source:` line must be revised together (edits.md §2a).
- S-ids are proposals from wave-1 scouts; `cite-sources` fails on any `S###` in a README row that is not a `SOURCES.md` row, so allocate-then-paste, never paste-then-hope.
- Did not run `cite-check`, `claims-check`, `sources-check`, `sources-census.sh validate` or the frozen O65/H65 counters; those are executor/reviewer seats' runs, and O7's `README_MAP: CLEAN` is asserted only as the expected post-integration reading (`files=159`), not observed.
- The `SKILL.md` row counts (28 → 30 rows, 24 → 25 gate rows, 23 → 24 gate files, probes 2) are counted from the table at the freeze; they move again if any other wave-1 seat drafts a row.
- Byte-sweep semantics are the probe's stated limit, carried into the entry drafts: presence/absence of a literal in the release bytes proves nothing about the code path that uses it.
