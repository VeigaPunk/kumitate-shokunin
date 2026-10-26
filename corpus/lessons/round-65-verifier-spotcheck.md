# Round 65 — verifier spot-check

author: hyaku closure (non-author integrator, @m_opus)
date: 2026-10-26
lane HEAD before `47fe2383151909d31557ada118ad84f90404dc6c`, after `52f8497987eaae42c3be668cdd5e90a34c5bf48e`; report `.ufo/reports/round-65/kumitate.md` (fleet commits `d85a301d29f7be73956a6bac74ca825d7d8e081e` report, `e8d4a61dfed1cea7d47217e0e84d853d2a5e985d` appended erratum; sha256 at closure `7e719f1ca7ae53cb5f5151ceef6efaf4b6fedee1df34851c6d982203dbd806f4`)
driver digest (`.ufo/watchdog.log`, mutable; both lines re-read from the log at closure): `2026-10-25T21:41:55-03:00 launch kumitate round=65 pgid=320577 driver=hyaku-inline attempt=1` → `2026-10-26T01:03:32-03:00 complete kumitate round=65; hyaku-inline attempt=1`

Method note: nothing was written in the lane except this file. The lane's gates, selftests and frozen counters were **not executed** (PROTOCOL §Gate standard, closure consequence) — the H65 counter runs every registry gate in sandbox clones and the O65 counter re-fetches live, so both were evidence-verified from committed receipts. Re-measurements below are plain `git show`/`grep`/`jq`/`wc`/`curl`/`sha256sum` runs over committed bytes, the live upstream documents, and the installed binary (read-only). Scratch went to `~/.cache/cl65`.

## 1. Step-1 conformance

| check | command | observed |
|---|---|---|
| report committed by the lane identity | `git log --format='%an %H' -- .ufo/reports/round-65/kumitate.md` | `kumitate-shokunin d85a301d29f7be73956a6bac74ca825d7d8e081e` (report, 23:42:44 -03:00) and `kumitate-shokunin e8d4a61dfed1cea7d47217e0e84d853d2a5e985d` (appended `## Erratum`, 23:57:36) — lane identity, erratum appended after the filed bytes |
| `SHONEN` heading, one line per box | `grep -c '^## SHONEN' <report>`; `grep -cE '^\s*- \[[ x~]\]' SHONEN.md` | `1`; SHONEN.md has 4 boxes, the report has 4 `[~]` lines, each with a pointer |
| cited lane commits exist and are ancestors of `master` | `git cat-file -t <h>`; `git merge-base --is-ancestor <h> master` for `47fe238`, `2ca91a0`, `2b1f416`, `62897df`, `090b4dd`, `52f8497` | all six `commit`, all `anc=0` (ancestor) |
| report lands last | commit times: close receipts `62897df` 23:41:11 → report `d85a301` 23:42:44 | the report cites `62897df` and lands after it |
| lane pushed, no leftovers | `scripts/hyaku/jj-lane.sh state <lane>`; `git -C <lane> status --porcelain \| wc -l` | `state branch=master local=52f8497… remote=52f8497… ahead=0 behind=0 head=detached tracked=0 untracked=0`; `0` |
| prompt carries the template contract | `.ufo/prompts/kumitate-round-65.md` (committed `136f30b`, lane identity) | §1 MISSION/AXES binding, §2 1–3 claims + lowest axis, §2b frontier step, §3 L2 floor, §4 report path/sections/`SHONEN`, §5 commit-then-push, push scope, L0 channel, write scope in §6 item 3 — present |
| seats | `git show 52f8497:.ufo/waves/round-65/w1-results.json \| jq '.results \| length'`; `ls .ufo/waves/round-65/w1/K65*.md \| wc -l` | `45` results, 45 with non-empty output; 45 seat reports |

Conformance defects (status-neutral): **(C-a)** round total 45 seats, below the run-7 band of 64–100 the prompt binds (§6 "Round size: 64–100 seats in total, every round"); wave 2 (40 seats) designed and not dispatched — disclosed by the report. **(C-b)** the report was filed before `WAVE-DONE` for its own wave; corrected by an appended erratum, not a rewrite (conformant correction form). **(C-c)** attribution: `35abe21` ("in-flight snapshot committed by the orchestrator") and `52f8497` ("straggler seat reports … orchestrator commit") carry the lane identity but are orchestrator commits; the report is filed at `62897df`/`090b4dd` and the after-hash `52f8497` adds only seat transcripts (`git show 52f8497 --stat` → 2 files under `.ufo/waves/round-65/`).

## 2. Claims — re-check

| claim | re-measured (plain, by me) | evidence-verified (committed receipt) | result |
|---|---|---|---|
| **C1** operability, capability `harm-matrix` | `git cat-file -e <rev>:scripts/harm-matrix.mjs` → base absent, after present; `scripts/harm-matrix-gates.json` gates 20 (freeze `2ca91a0`) → 36 (after); `scripts/harm-cases.json` cases 26 → 114; tool 208 → 432 lines; `grep -c '^CASE ok' close/harm-matrix-selftest.txt` → `114` of `114` `CASE` lines | `base/harm65-base.txt` `HARM65_UNMET held=0/5` EXIT=1 at `47fe238`; `close/harm65-measured.txt` `HARM65_HELD held=5/5 checks=5 rev=2b1f416… rule=H65` EXIT=0; `close/harm-matrix-selftest.txt` `HARM_MATRIX_SELFTEST: PASS (114/114)`; real base→M run `close/harm-matrix-47fe…-2b1f….txt` `HARM_MATRIX: CLEAN gates=36 held=27 repaired=1 carried=5 moved=2 new=1 … harm=0` EXIT=0 (my `grep -oE 'id=[A-Z_]+' \| sort \| uniq -c` → HELD 27, CARRIED 5, CARRIED_MOVED 2, REPAIRED 1, NEW_OK 1); red-before: `base/harm-pairA-freeze.txt` reproduces the r64 landing's `HARM … harm=2` EXIT=1 | **verifies** — values match the report; frozen counter forgeable (lane-disclosed, `w1/K65ReviewProbeH65.md`), so the plain surface counts carry the weight |
| **C2** coverage frontier, installed OMP release, sourced on S201–S206 | `test -e` at base absent / after present for `corpus/knowledge/omp-installed-release-mcp-runtime.md` (285 lines, provenance trio first, `## Located quotes`, `## Host measurements`); SOURCES rows `grep -cE '^\| S[0-9]{3} \|'` 139 (base) → 145 (`2b1f416`, `52f8497`), tiers A 116→122, B 15, C 8; S201–S206 all `mined`, `used-by` the entry; entry cites S201×12 S202×18 S203×10 S204×15 S205×12 S206×15; live re-open (§4) found every quote I sampled; binary re-measure `grep -a -o -F '2025-11-25' ~/.local/bin/omp.real \| wc -l` → `2`, `2025-03-26` → `2`, `2026-07-28` → `0`, sha256 `85d9daf3…7ccfa4`, `OMP_NO_RESTART=1 omp.real --version` → `omp/18.12.6` — all equal to § Host measurements | `base/omp65-base.txt` `OMP65_UNMET held=0/8` EXIT=1; `base/omp65-donothing.txt` `held=1/8`; `close/omp65-measured.txt` `OMP65_HELD held=8/8 checks=8 rev=2b1f416… rule=O65` EXIT=0 | **verifies** — scope as the lane's own erratum narrows it (binary byte sweep + two-client finding, not "first entry to measure the release") |

Harm check: `git diff 47fe238 52f8497 -- SCORECARD.md` appends `## Round 65` only; no axis score integer changes. Committed receipts at M: `readme-map` CLEAN 159/159 (REPAIRED from base DRIFT), `counter-pins` CLEAN pins=30, `sources-check` CLEAN rows=145, `claims-check` MATCH, `sources-census` exit 0. `proxy-check` DRIFT at base and at M (CARRIED_MOVED: base `C2_TOTAL_DRIFT +1; AXES_DRIFT`, M `A_DRIFT +103; C2_DRIFT +3; C2_TOTAL_DRIFT +3; PIN_UNPINNED`) — stale declared stanza, carried and disclosed. `cite-check-fleet-dot` DRIFT at both, errors 1545 → 1637 (+92 over 2 new files) — unexplained in the report; graded not-harm (red at base, not an owned axis score) but routed (D5).

## 3. Axis verdicts

| axis | verdict | basis |
|---|---|---|
| operability | improved | C1 re-measured: tool + 36-gate registry + 114-case committed PASS selftest; real base→M CLEAN with zero HARM rows |
| coverage | improved | C2 re-measured: one admitted frontier entry on six tier-A rows, quotes re-found live, host measurements reproduced |

No owned axis harmed.

## 4. Discernment spot-check (lesson `## Gate`)

| item | decision | re-opened source | agree / disagree | reason |
|---|---|---|---|---|
| `omp-mcp-protocol-version-code.md` (staged) → merged into the installed-release entry | ADMIT | S201 `https://raw.githubusercontent.com/can1357/oh-my-pi/v18.12.6/packages/coding-agent/src/mcp/types.ts` — HTTP 200, 16167 B, sha256 `caa3eade…` (equal to the Gate's capture) | agree | `export const MCP_PROTOCOL_VERSION = "2025-11-25";` at :181 and "Latest MCP protocol revision this client negotiates." at :171 — the narrowing to "constant + send site" is correct; send site `protocolVersion: MCP_PROTOCOL_VERSION,` re-found at `client.ts:100` (S204, 14975 B, `479aef6d…`) |
| `omp-host-harness-protocol-skew-2026-10-27.md` (staged) → merged | ADMIT | installed binary `~/.local/bin/omp.real` (read-only `grep -a -o -F`) | agree | the staged recheck `→ 2` reproduces today (`2025-11-25` ×2, `2026-07-28` ×0); presence-only wording is the right limit |
| `omp-mcp-migration-tracker-state-2026-10-27.md` | REJECT | `https://api.github.com/repos/can1357/oh-my-pi/issues/{8167,14172,12471}` | agree | live: 8167 open PR, `merged_at` null, 10 comments, updated 2026-10-20T21:09:56Z; 14172 open PR, null, 0, 2026-10-07T21:37:30Z; 12471 open issue, 0, 2026-09-18T19:39:20Z — exactly as the Gate states, so the reason is correctly not staleness: tracker state has no capture at the tag and adds nothing the measured entry claims |
| `omp-session-sharing-and-mcp-lifecycle.md` | REJECT | `docs/mcp-runtime-lifecycle.md` at `0b5c27ab…` (staged S199) and at `v18.12.6` (S202) | agree | both fetches HTTP 200 with identical sha256 `362acea5d3d0eca0…`, and "never replayed automatically" is present at the tag — the lifecycle half is fully carried by S202; the collab half is off-theme |

SOURCES rows re-opened (≤25-word quotes, from the entry's `## Located quotes`, since the Gate table does not carry S205/S206 — D1):

| row | URL | quote | found |
|---|---|---|---|
| S206 | `…/v18.12.6/packages/coding-agent/src/mcp/transports/http.ts` (HTTP 200, 33157 B) | "The transport fully owns `MCP-Protocol-Version`: it is stripped from" | :118; also "no protocol-version header is sent from either source." :122, "#protocolVersion: string \| null = null;" :104 |
| S205 | `…/v18.12.6/packages/coding-agent/src/web/search/providers/zai.ts` (HTTP 200, 12774 B) | "const ZAI_MCP_PROTOCOL_VERSION = "2025-03-26";" | :80; `protocolVersion: ZAI_MCP_PROTOCOL_VERSION,` :222 |
| S203 | `https://github.com/can1357/oh-my-pi/commit/10bce6900b5bdcf7479ed718f52902feeab9ed00.patch` (9953 B, `eedfbbc4…`) | "the client pinned the stale 2025-03-26 revision" | patch:7; "Fixes #8264" :11 |

Tag: `git ls-remote https://github.com/can1357/oh-my-pi.git 'refs/tags/v18.12.6*'` → `45c35e40c46166dc726ccc52f5d27f40f2449f99`, equal to `base/omp-release-tag.txt`. Census: `scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin kumitate` → six W04 duplicate-URL warnings (S034, S068, S084, S095, S123, S126; carried), `kumitate ok …/corpus/SOURCES.md`, EXIT=0.

Result: 2 admits and 2 rejects sampled, 4 agree, 0 disagree.

## 5. Trend verdicts

- **expansion — improved.** One admitted `knowledge/` entry on the PROVINCE §Frontier OMP-harness band (`PROVINCE.md` +1 line), `source:` citing six `mined` tier-A rows opened 2026-10-25; new ground is the binary byte sweep and the second (Z.AI) MCP client pinned to `2025-03-26`; quotes re-found live.
- **quality — improved.** `omp-task-contract.md` gained an appended amendment that answers its version-to-commit UNKNOWN for the installed release and dates its `18.12.3` observation instead of leaving it stale; staged sentences were narrowed before adoption; no admitted entry failed my re-check (12 sampled quotes, 6 host values).
- **discernment — improved.** The outside spot-check agrees with the gate on both admits and both rejects (§4). Caveat: the Gate's row table is stale against the landed registry (D1), a record defect, not a decision defect.

## 6. Routed defects for round 66 (status-neutral)

- **D1 — Gate row table contradicts the registry.** `corpus/lessons/round-65.md` `## Gate` maps S204 = `package.json` and S205 = `client.ts` and states "no `S206` is added (`grep -cE '^\| S206 \|' corpus/SOURCES.md` → `0`)"; landed SOURCES has S204 = `client.ts`, S205 = `zai.ts`, S206 = `http.ts` (`grep -nE '^\| S20[4-6] \|' corpus/SOURCES.md`). CORPUS rule 1 (URL, access date, ≤25-word quote per new row in the Gate) is therefore unmet for S205/S206, and the report's "the lesson's `## Gate` carries URL, date and quote per row" is false. Fix: appended correction in the round-66 lesson with the per-row Gate record.
- **D2 — capability row missing.** `harm-matrix` was demonstrated running but has no row in `SCORECARD.md` `## Capabilities` (`grep -n harm-matrix SCORECARD.md` → only the `## Round 65` prose line); SCORECARD `## Round 65` also defers the measured before→after to the report instead of recording it.
- **D3 — registry home.** `SKILL.md` has no rows for `harm-matrix` / `omp-binary-probe` (`grep -c 'harm-matrix\|omp-binary-probe' SKILL.md` → `0`): per §Gate standard no gate is graded conformant until its registry row exists; pins `pin.harm-matrix`/`pin.omp-binary-probe` absent (`PIN_UNPINNED`).
- **D4 — proxy stanza stale** (`PROXY: DRIFT` A +103, C2 +3) and QUALITY Q62–Q64 / `class-recurrences.sh` not landed — carried, disclosed.
- **D5 — `cite-check-fleet-dot` errors 1545 → 1637 (+92) across two new files** (`close/harm-matrix-…txt`, CARRIED_MOVED, unranked by the tool); the report does not mention it — attribute the 92 to files and fix or explain.
- **D6 — round size / wave 2.** 45 seats vs the 64–100 band; the 40-seat falsify wave (row re-opens, tool/probe mutation, counter forging) is open work; both frozen counters are forgeable by the lane's own finding.
- **D7 — README row for this file.** This spot-check lands without its `corpus/README.md` row (closure write scope is this path only), so `readme-map` will read DRIFT at the next base — the same `reference-drift` class the lane mined this round; the round-66 opener adds the row and pin.
