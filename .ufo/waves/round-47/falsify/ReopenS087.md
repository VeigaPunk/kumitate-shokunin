RESULT ReopenS087 rev=269dadb6 verdict=HOLDS — re-open S087 (registry row, Gate record, drafting-seat report) vs restored S053: `supersedes S053 —` names the right target; byte correction (anchor 952-1006 plus 16 teaches names) fully supported by the fetched pinned source.

## Scope and evidence

- Row S087 at C1: `git -C .../kumitate-shokunin show 269dadb6a56744531bd1201e5944185e96ff6a4c:corpus/SOURCES.md | grep -n '^| S087 |'` → line 100:
  `| S087 | oh-my-pi v18.12.6, packages/utils/src/dirs.ts — https://github.com/can1357/oh-my-pi/blob/45c35e40c46166dc726ccc52f5d27f40f2449f99/packages/utils/src/dirs.ts | code | A | the names OMP gives members of its agent directory (~/.omp/agent) on the installed release 18.12.6 | packages/utils/src/dirs.ts:29, 368-370, 952-1006, 1007-1035, 1037-1050 @ 45c35e40c46166dc726ccc52f5d27f40f2449f99; re-opened 2026-10-23; body SHA-256 2d423f4f18e5ed0c25cd4887c68cf2fea704f1615ad4c85846ae5c10d3207f24 | supersedes S053 — census declares: agent.db,history.db,models.db,skill-descriptions.db,last-changelog-version,cache,blobs,predict,sessions,terminal-sessions,custom-session-files,themes,tools,commands,prompts,memories | mined | 2026-10-23 | on-release | corpus/knowledge/omp-agent-root.md, corpus/lessons/round-44.md |`
- Restored S053 at C1 (`show 269dadb6...:corpus/SOURCES.md | grep '^| S053 |'`, line 66): terminates `lines 29, 368-370, 952-991, 1007-1035, 1037-1050 at tag v18.12.6 = 45c35e40...`, teaches opens `"/** Get the custom themes directory (~/.omp/agent/themes). */" (dirs.ts:1007) — every agentSubdir member name the census declares: agent.db, history.db, ... memories`. Base 2b2bf7bb S053 identical (byte-for-byte same teaches list; anchor 952-991).
- Round-46 rewritten S053 at base 0bd8be60: anchor `952-1006 (992-1006 added round 46: predict, sessions, blobs; SweepS051S055)`; confirms the 952-1006 widening was the round-46 in-place change R46-1 repairs.
- Gate record (C1 `corpus/lessons/round-47.md` § Gate table): `| S087 | raw oh-my-pi `45c35e40…/packages/utils/src/dirs.ts` | 2026-10-23 | "/** Get the custom themes directory (~/.omp/agent/themes). */" (:1007; 8 words) | admit A, mined — supersedes S053 (SupersedeS053) |`. Matches the SOURCES row and the drafting-seat report.
- Drafting-seat report `build/SupersedeS053.md`: `RESULT SupersedeS053 rev=cac43009 verdict=CONFIRMED row=S087`, fetched sha256 2d423f..., quote count 8.

## Source fetched (ordinary means)

- Command: `curl --fail --location --silent --show-error --max-filesize 4000000 --connect-timeout 20 --max-time 90 'https://raw.githubusercontent.com/can1357/oh-my-pi/45c35e40c46166dc726ccc52f5d27f40f2449f99/packages/utils/src/dirs.ts' --output dirs.ts`
- sha256 of what I fetched: `2d423f4f18e5ed0c25cd4887c68cf2fea704f1615ad4c85846ae5c10d3207f24  dirs.ts` (matches row body SHA-256; 1292 lines).
- `omp --version` → `omp/18.12.6` (installed release named by scope).

## Quote check (verbatim, ≤25 words)

- `sed -n '1007p' dirs.ts` → `/** Get the custom themes directory (~/.omp/agent/themes). */` — verbatim at stated locator (line 1007).
- `printf '%s' "/** Get the custom themes directory (~/.omp/agent/themes). */" | wc -w` → `8` ≤ 25.

## Every teaches clause supported by located bytes

All 16 census-declared names map to agentSubdir calls inside the declared anchor segments (952-1006, 1007-1035, 1037-1050):
- agent.db → 954; last-changelog-version → 959; history.db → 964; models.db → 969; cache (tiny-models/document-conversions/composer.db under `path.join("cache",…)`) → 975-985; predict → 991 (comment 989; fn 990; subdir 991; return 994); sessions → 999 (comment 997); blobs → 1004 (comment 1002); themes → 1009 (comment 1007); tools → 1014; commands → 1019; prompts → 1024; memories → 1034; terminal-sessions → 1039; custom-session-files → 1049.
- Segment boundaries verified: 1005 `}` closes getBlobsDir, 1006 blank, 1007 themes comment; 1035 closes getMemoriesDir, 1036 blank, 1037 terminal-sessions comment. No taught name falls outside the declared ranges.
- Lines 29 (`export const CONFIG_DIR_NAME: string = ".omp";`) and 368-370 (`defaultAgent = path.join(this.configRoot, "agent")`, override resolution) support the `~/.omp/agent` scope; line 117 `path.join(os.homedir(), getConfigDirName())` is the ~/.omp default root.

## Tier/kind/scope/anchor

- kind=code, tier=A (primary source at pinned release commit) — appropriate; source URL and pin `45c35e40` are the fetched bytes.
- scope "the names OMP gives members of its agent directory (~/.omp/agent) on the installed release 18.12.6" — supported (dirs.ts agentSubdir family; omp/18.12.6 installed).
- anchor = the four byte segments, all verified; the 952-1006 widening (predict/sessions/blobs) is exactly the round-46 in-place edit that S087 carries as the correction.

## Target check

- `supersedes S053 —` names the right target: S053 is the same source row (same URL, pin, kind, tier, scope) restored at 269dadb6 to its 2b2bf7bb bytes; S087 is R46-1's appended correction row carrying the widened anchor and the census list. Gate table and drafting-seat report both record the same supersedes relation. No other row claims S053.

## Lane bounds / hygiene

- Only write in lane: this report. No git writes, no sibling-lane touch, no operator-config reads, no processes left (`pgrep -af` scratch path → none). No tool installed (curl present). No gate/counter/selftest run; HOST SAFETY not triggered. Scratch under `/fast/scratch/hyaku/kumitate-r47/seats/w2-ReopenS087/`.
