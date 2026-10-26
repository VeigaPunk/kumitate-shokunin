# Round 65 — lesson

author: kumitate-shokunin (body and `## Gate` drafted by seat `K65ScribeLessonDraft`, wave 1; integrated by the L1)
base: `47fe2383151909d31557ada118ad84f90404dc6c`; frozen at `2ca91a0c81542cad5f731049aa55dd2f99ade98d` (plan, the H65/O65 counters with their pins, 16 harm controls,
`scripts/harm-matrix.mjs` + `harm-matrix-gates.json` + `harm-cases.json`, `scripts/omp-binary-probe.sh`, and the README row/pin for the round-64 spot-check)
plan: `.ufo/waves/round-65/plan.md`, committed before the first `.ready` marker (QUALITY Q58)
status: DRAFT (wave 1). No integrated `M` exists at drafting time, so every "after" value below is either the counters' declared predicate (unobserved at an `M`) or a
seat receipt taken at the **freeze** revision `2ca91a0` and named as such; two of those receipts are untracked (`.ufo/waves/round-65/base/harm65-at-freeze.txt`,
`base/plan-before-ready-freeze.txt` are absent from the freeze commit — see `K65ScribeLessonDraft-4`). `SCORECARD.md` §Round 65 and the close receipts are written at round close.

## Mistakes

| class | evidence pointer | captured-by | fix |
|---|---|---|---|
| `reference-drift` — the round-64 closure commit `47fe2383` (the non-author spot-check) landed `corpus/lessons/round-64-verifier-spotcheck.md` without its `corpus/README.md` row and pin, and the same landing moved two gates clean → not clean; the plan calls it the eleventh R56-V3-family recurrence (`.ufo/waves/round-65/plan.md:114-115`) | (a) `.ufo/waves/round-65/base/readme-map-before.txt` → `README_MAP: DRIFT files=157 rows=156 covered=156 bad=2 first=uncovered:lessons/round-64-verifier-spotcheck.md`, `EXIT=1`; (b) `.ufo/waves/round-65/base/proxy-before.txt` → `PROXY  error  C2_TOTAL_DRIFT  C2_total: declared=156 computed=157 delta=+1`, `PROXY  error  AXES_DRIFT  coverage: ## Axes row=10 derived=9`, `EXIT=1`; (c) reproduced from committed bytes — `.ufo/waves/round-65/base/harm-pairA-freeze.txt:1-2` → `HARM_ROW gate=readme-map base=CLEAN tip=NOT_CLEAN id=HARM` and `HARM_ROW gate=proxy-check base=CLEAN tip=NOT_CLEAN id=HARM`, summary `HARM_MATRIX: HARM gates=19 held=15 repaired=0 carried=2 moved=0 new=0 gone=0 harm=2 harm_absent=0 new_red=0 base=a004902d77d1 tip=47fe23831519`, `EXIT=1` | `readme-map`, after the fact at round open, on the base revision: nothing the lane ran between `a004902d` and `47fe2383` executed it. Q60's round-start arm is **not** a second capture: at the plan commit it reads `PLAN_BEFORE_READY: NA rev=2ca91a0c81542cad5f731049aa55dd2f99ade98d round=65 ... reason=NO_MARKER ... map=CLEAN files=157 rows=157 covered=157` and `... pass=0 fail=0 na=1 ... exit=2` (`base/plan-before-ready-freeze.txt`) — the freeze commit had already carried the row and pin, so the arm sees a green **plan** commit, not the red parent (K65ScribeLessonDraft-1) | C1's H3(a): `harm-matrix --base a004902d --tip 47fe2383` reproduces the transition from committed bytes, and the tool is not vacuous — of the 16 committed control dirs (`ls .ufo/waves/round-65/controls/harm \| grep -c '^case-'` → `16`) case 03 (gate prints `DRIFT`, exits 1), case 04 (clean line, exit 3) and case 14 (a later second verdict line) each expect `g1 HARM` exit 1 (`controls/harm/case-0{3,4}-*/spec.json`, `case-14-last-verdict-wins/spec.json`), and H2 matches all 16 at the freeze revision (`base/harm65-at-freeze.txt` → `HARM65_HELD held=5/5 checks=5 rev=2ca91a0… rule=H65`; untracked). The H1 selftest exercises 26 cases at the freeze: `base/harm-matrix-selftest-freeze.txt` → `HARM_MATRIX_SELFTEST: PASS (26/26)`, `EXIT=0` |

Not a second row, same family: the round-64 D3 dangling-pointer class is still open (see `## Open items carried`), and one of its three pointers was closed by the
freeze commit rather than by a correction.

## What round 65 changes

- **C1 — the harm check becomes a tool (operability 9, the lowest non-retired axis).** Before: `node .ufo/waves/round-65/probe/harm65-probe.mjs <lane> 47fe2383…` →
  `HARM65_UNMET held=0/5 checks=5 rev=47fe2383151909d31557ada118ad84f90404dc6c rule=H65 | H1 MISS tool-absent | H2 MISS tool-absent | H3 MISS tool-absent | H4 MISS real-tool-passes-H2=false stubs-that-passed=0 | H5 MISS tool-absent`, `EXIT=1`
  (`base/harm65-base.txt`). Counting command: `node .ufo/waves/round-65/probe/harm65-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin <M>` must print
  `HARM65_HELD held=5/5 checks=5 rev=<M> rule=H65` exit 0. **Not observed at any `M`**: the only `held=5/5` reading is at the freeze revision `2ca91a0`, i.e. the
  predicate is already satisfied by the freeze commit, so a wave that lands nothing still reads 5/5 and only the monotone ratchet (new controls) strengthens the surface
  (K65ScribeLessonDraft-2).
- **The registry is read as a transition table, not a hand list.** Pair A (`a004902d` → `47fe2383`) over 19 gates (`gates=19`): 15 HELD, 2 CARRIED (`kimi-census`,
  `omp-census`, identical lines at both revisions), 2 HARM (`readme-map`, `proxy-check`), 0 in every other class (`base/harm-pairA-freeze.txt`). Pair B
  (`6825a514` → `a004902d`): `HARM_MATRIX: CLEAN gates=19 held=14 repaired=2 carried=2 moved=0 new=1 gone=0 harm=0 harm_absent=0 new_red=0 base=6825a51425e9 tip=a004902d77d1`, `EXIT=0`,
  with `readme-map` and `proxy-check` both `REPAIRED` and the new-gate class carrying `harm-matrix-selftest` (`base/harm-pairB-freeze.txt`). The two pairs are the
  direction check: the same gate reads HARM forward and REPAIRED backward from committed bytes.
- **C2 — the installed release is measured, not described.** Before (base, `--no-live`): `OMP65_UNMET held=0/8 checks=8 ... | O1 MISS entry-absent | O2 MISS no-entry |
  O3 MISS no-rows | O4 MISS bullets=0;no-2025-11-25-quote | O5 MISS live-fetch-skipped | O6 MISS stated-keys=0;probe-absent;body-lacks-lit_2026_07_28-or-real_version |
  O7 MISS census-exit=0 province-names-entry=false readme-map-clean=false sources-check-clean=true | O8 MISS no-amendment-heading,…` `EXIT=1` (`base/omp65-base.txt`).
  Counting command: `node .ufo/waves/round-65/probe/omp65-probe.mjs <lane> <M>` must print `OMP65_HELD held=8/8 checks=8 rev=<M> rule=O65` exit 0 — **not observed at any `M`**.
  The do-nothing control (committed before data) copies a staged entry byte-for-byte and reads `OMP65_UNMET held=1/8 ... | O1 MISS trio source=true verified-at=false recheck=true ids=1 | ... | O7 MISS ... province-names-entry=true ...`, `EXIT=0` of the script (`base/omp65-donothing.txt`) — only O8 passes, as declared.
  The host half is re-runnable: `base/omp-binary-probe-freeze.txt` prints 15 `OMP_BIN:` keys (`grep -c '^OMP_BIN:'` → `15`) ending `OMP_BIN_PROBE: DONE omp=18.12.6`, `EXIT=0`, with
  `real_version=18.12.6`, `lit_2025_11_25=2`, `lit_2026_07_28=0`, `sym_MCP_PROTOCOL_VERSION=3`, `header_MCP-Protocol-Version=3`, `docs_phrase_never_replayed=0`; the release tag is
  `45c35e40c46166dc726ccc52f5d27f40f2449f99	refs/tags/v18.12.6` (`base/omp-release-tag.txt`). The entry also amends `corpus/knowledge/omp-task-contract.md` append-only (O8):
  the existing bytes unchanged, plus an `Amendment 2026-10-25` section naming the new entry path and `Version skew` — the mechanism by which the "documentation is `main`, the
  binary was never inspected" sentence becomes measured.
- **A counted recurrence table for routed defect classes (considerthese idea 4's structural half).** The count is *files that name the class*, not recurrences, and is
  labelled that way; the plan's own recurrence number is quoted where it exists.

| class | carried since | count (command) | this round's carrier |
|---|---|---|---|
| `reference-drift` (R56-V3) | round 56 | 8 lesson/spot-check files name it (`grep -rl 'R56-V3' corpus/lessons \| wc -l` → `8`); the plan calls this landing the eleventh recurrence (`.ufo/waves/round-65/plan.md:114`) | the `## Mistakes` row; structural fix = C1/H3(a) |
| `dangling-pointer` (routed D3) | round 64 (also named in r57/r58 lessons) | 7 lesson files (`grep -rli 'dangling' corpus/lessons \| wc -l` → `7`) | `## Open items carried` |
| `carried-unaddressed` (R61-V2) | round 61 | 4 lesson files (`grep -rl 'R61-V2' corpus/lessons \| wc -l` → `4`) | `## Open items carried` |
| Audit19 residuals | round 61 | 6 lesson files (`grep -rl 'Audit19' corpus/lessons \| wc -l` → `6`) | `## Open items carried` |
| duplicate-URL warnings (W04) | round 39 | 36 lesson files name W04 (`grep -rl 'W04' corpus/lessons \| wc -l` → `36`); 6 live warnings (`grep -c W04 .ufo/waves/round-65/base/census-before.txt` → `6`) | `## Open items carried` |
| kimi layer DEGRADED | round 63 (D4) | 1 lesson file (`grep -rl 'DEGRADED' corpus/lessons \| wc -l` → `1`) | `## Open items carried` |

  PROPOSED criterion for `corpus/QUALITY.md` (the L1 owns that file; this draft does not write it): a routed defect class that has recurred in more than three rounds
  gets a structural fix in the same round, not another routed item; the `reference-drift` row above is the first application (C1 is that fix). C2's forge seats apply
  considerthese idea 1 (try to forge each new gate) to both counters by hand-written fixtures.

## Gate

Rows opened this round at the **installed release tag** `v18.12.6` = `45c35e40c46166dc726ccc52f5d27f40f2449f99` (`base/omp-release-tag.txt`); access date **2026-10-25**
for all five; every quote ≤ 25 words and re-found in the committed capture under the frozen probe's own `norm()`, `probe/omp65-probe.mjs:57-64`.
No quote placeholder remains: every row has a wave-1 scout artifact before this draft (`w1/K65ScoutTypesTs.md`, `w1/K65ScoutRuntimeDoc.md`, `w1/K65ScoutTagVersion.md`;
S203's quotes are `build/K65ScoutCommit/S203-quotes.md`, whose capture is byte-identical to this seat's own fetch — that seat had filed no `w1/` report at drafting time).

| row | URL (opened 2026-10-25) | ≤25-word located quote | location | capture (bytes, sha256) |
|---|---|---|---|---|
| S201 | `https://raw.githubusercontent.com/can1357/oh-my-pi/v18.12.6/packages/coding-agent/src/mcp/types.ts` | "export const MCP_PROTOCOL_VERSION = \"2025-11-25\";" (5 words) | types.ts:181, under the doc comment :170-180 | `build/K65ScoutTypesTs/capture/types.ts` — 16167, `caa3eadeb21bc36d8c6a4bf65fd362b1b27d4c189ca40684b1e11075c48bfe0d` |
| S202 | `https://raw.githubusercontent.com/can1357/oh-my-pi/v18.12.6/docs/mcp-runtime-lifecycle.md` | "performs MCP initialize using protocol version 2025-11-25 and advertises the roots capability" (12 words) | § Connection establishment and startup timing | `build/K65ScoutRuntimeDoc/capture/mcp-runtime-lifecycle.md` — 22741, `362acea5d3d0eca06d54aa9a80febab5a43634007ab40a435dbb0c75079cf83d` |
| S203 | `https://github.com/can1357/oh-my-pi/commit/10bce690.patch` | "The Streamable HTTP transport never emitted the MCP-Protocol-Version header and the client pinned the stale 2025-03-26 revision." (17 words) | patch:7 (commit body), header `From 10bce6900b5bdcf7479ed718f52902feeab9ed00` | `build/K65ScoutCommit/capture/10bce690.patch` (identical bytes at `build/K65ScribeLessonDraft/captures/10bce690.patch`) — 9953, `eedfbbc405d55fdb205b74a76a67f06a0a78fa9b383a06a491107a034e172c9b` |
| S204 | `https://raw.githubusercontent.com/can1357/oh-my-pi/v18.12.6/packages/coding-agent/package.json` | "\"version\": \"18.12.6\"," (2 words) | package.json:3 | `build/K65ScoutTagVersion/capture/package.json` — 16030, `83c96c5097f69c0b6f13b7fb9a9b940d7f9078136154518243746765628d057b` |
| S205 | `https://raw.githubusercontent.com/can1357/oh-my-pi/v18.12.6/packages/coding-agent/src/mcp/client.ts` | "protocolVersion: MCP_PROTOCOL_VERSION," (2 words) | client.ts:100 inside `initializeConnection` (:91-130); second bullet `transport.setProtocolVersion?.(result.protocolVersion);` (:120) | `build/K65ScoutTagVersion/capture/client.ts` — 14975, `479aef6ddda012f8402bc2480637a8c71ada8597d9705a56080dd3ed7c7d3fe9` |

Reproduce: `curl -fsSL <url> | sha256sum` prints each hash above (five HTTP 200 on 2026-10-25; this seat fetched S203/S204/S205 and matched the scouts' bytes, and the
scouts report the tag path and the commit path byte-identical for S201/S202/S204/S205). Quote check, same `norm()` as the counter:
`node .ufo/waves/round-65/build/K65ScribeLessonDraft/qcheck.mjs` → `TOTAL 9/9` (the nine bullets: S201 ×2, S202 ×2, S203 ×2, S204 ×1, S205 ×2; word counts 1–17). The
literal `2025-11-25` appears in the S201, S202 and S203 bullets, so O4's one-literal requirement is met three times over. S201 is the row that carries the constant —
seat `K65ScoutTagVersion` proposed a separate `S206` for types.ts before it saw that the lane plan already assigns that document to S201; no `S206` is added
(`grep -cE '^\| S206 \|' corpus/SOURCES.md` → `0`).

### Assimilation theme — OMP MCP protocol version and the installed host (staged set `/home/vgpnk/Projects/shokuknow/merge/kumitate/knowledge/corpus/knowledge/`)

| candidate | decision | criterion / reason | located evidence |
|---|---|---|---|
| `omp-mcp-protocol-version-code.md` | ADMIT — merged and re-grounded into `corpus/knowledge/omp-installed-release-mcp-runtime.md` | Q1 header triple carried; Q2 every external fact cites a row opened this round (S201, S205) instead of the staged `S228` (`client.ts` at `main` `0b5c27ab`); Q3 the counts carry the probe's dated re-run; Q4 the staged claim "the client negotiates 2025-11-25" is narrowed to the source constant (S201:181), the send site (S205:100) and the binary's literal presence (`lit_2025_11_25=2`, presence only, not use) | staged `:2` (S228 URL at `0b5c27ab`); `base/omp-binary-probe-freeze.txt`; capture `caa3ead…` |
| `omp-mcp-version-negotiation-decision.md` | ADMIT — merged into the same entry | its `S232` is the same commit this round opened as S203: the patch bytes fetched here and the scout's capture are identical (`sha256 eedfbbc…`, 9953 B); its `S235` (MCP specification 2026-07-28 § Versioning) is re-pointed rather than adopted: O2 admits only rows opened this round, and no 2026-07-28 specification row is opened this round | staged `:3` (S232 = `10bce6900b5b…`); `build/K65ScoutCommit/capture/10bce690.patch` |
| `omp-host-harness-protocol-skew-2026-10-27.md` | ADMIT — merged, re-grounded on the tag | its `S250` is `types.ts` at `main`; re-opened at the tag as S201. Its recheck `grep -a -o -F '2025-11-25' ~/.local/bin/omp.real \| wc -l` → `2` is reproduced as `lit_2025_11_25=2` by the lane's probe, so the staged measurement survives the re-grounding | staged `:2`; `base/omp-binary-probe-freeze.txt` |
| `omp-session-sharing-and-mcp-lifecycle.md` | REJECT — the collab half is off-theme, the lifecycle half is carried by S202 | the theme is the installed release's MCP protocol version; `docs/collab.md` (its `S198`) is session sharing with that theme's protocol half only, and its `S199` (`docs/mcp-runtime-lifecycle.md` at `main`) is re-opened this round as S202 at the tag. Its two staged ids also collide by id with the lane's S198/S199 (different documents, see the guard) | staged `:2-3`; flip: a round themed on collab / session sharing re-opens `docs/collab.md` at the release tag under a fresh lane id; the lifecycle half stays with S202 |
| `omp-mcp-migration-tracker-state-2026-10-27.md` | REJECT — re-stated after a live read of all three tracker records | the load-bearing facts are tracker record state, and live today they are **unchanged** (so the reason is not staleness): `8167` open, `merged_at: null`, comments 10, updated 2026-10-20T21:09:56Z; `14172` open, null, 0 comments, 2026-10-07T21:37:30Z; `12471` open, 0 comments, 2026-09-18T19:39:20Z (api.github.com, 2026-10-25). Those records are API JSON with no document capture at the release tag (O3 cannot bind them), and the entry's central fact — the client sends `2025-11-25` — is now measured from the release source (S201, S203, S205), so the entry adds proposal state the installed-release entry does not claim | flip: a round themed on the 2026-07-28 migration proposals, pinning a lane-committed capture of each API response; a maintainer disposition or a merge supersedes it outright |

Carried rejects, unchanged — no new decision this round:

- `omp-advisor-and-mcp-transports.md` (staged S209/S210) — REJECT (carried from round 63): citation integrity (`S104` names RFC 8785 in the lane registry) and the
  protocol-version half is superseded by this round's S201/S205. Flip unchanged: re-point the citation to a lane row holding the MCP architecture document (S125) or a
  new in-round row, re-scope the entry to the advisor half, strip the leading blank line.
- `exactly-once-attribution.md` (package document arXiv 2609.29095) — REJECT (carried from rounds 60, 61 and 64): duplicate-document scope, lane `S134` already holds it
  and the package stages it again as staged `S204`. Flip unchanged: a later one-theme round re-opens the paper under the lane's existing document id.

### Collision guard (`build/K65ExecCollisionGuard/assimilation/`)

Registry `reg-ids` 139 ids (`wc -l` → 139; max `S200`), staged `staged-ids` 155 ids (`wc -l` → 155; max `S349`);
`comm -12 <(sort reg-ids) <(sort staged-ids)` → six ids, `S195`…`S200` (`collisions`, 6 lines). Those six collide **by id only**, and every one is a different document:
lane S195 = Temporal worker versioning vs staged S195 = MCP Architecture; S196 = 阿里云百炼 multi-agent vs staged Temporal failures; S197 = arXiv 2512.08296 vs staged MCP
Tasks; S198 = jj concurrency vs staged `docs/collab.md`; S199 = Firefox jj vs staged `docs/mcp-runtime-lifecycle.md`; S200 = jj working copy vs staged 阿里云百炼 managed
agents. No staged row is appended on an id match. Adopted ids continue the registry at `S201` (`grep -cE '^\| S20[1-5] \|' corpus/SOURCES.md` → `0`), and the staged set
also holds exactly those five ids for five unrelated documents (`grep -cE '^S20[1-5]$' staged-ids` → `5`) — so after the append the guard must read **11** collisions,
and the five staged documents stay unadopted. Negative control that the guard can fail: planting `  | S259 |` at 0 and 2 leading spaces raises `collisions` from 6 to 7
(`validate-fixture/col-base` → 6; `col-sp0`, `col-sp2` → 7), while a 4-space row is ignored (`col-sp4` → 6), as `sources-census.sh` ignores it.

### Quarantine

`build/K65ScoutQuarantine/quarantine-slice` (9 lines, `wc -l` → 9; the plan's landing path is `.ufo/waves/round-65/assimilation/quarantine-slice`, which the L1 copies it to):
`S109`, `S116`, `S118`, `S129`, `S142` labelled `payload-absent`; `S143`, `S144`, `S145`, `S178` labelled
"the cited source could not be fetched, so no quote was checked". Round 63 hand-checked all nine by document identity and read 9/9 PRESENT, 0 ABSENT, 0 UNVERIFIABLE
(`corpus/lessons/round-63.md:41`). No row is appended from this slice this round: the five rows above cite documents this round opened itself. The stray backtick after the
four unreachable ids is still visible in the slice file (`S143\`` and the three after it), a formatting artefact in a frozen file, read by id, not a data defect.

### considerthese

- `considerthese/2026-10-25.md:66-67` idea 4, verbatim: "**Count recurrences.** Keep a running count of each routed defect class (the R56-V3 map drift is at
  seven). When a class passes three, propose a structural fix instead of another routed item." → landed as the counted recurrence table in `## What round 65 changes`
  (with its counting commands) plus the PROPOSED QUALITY criterion for the L1; C1 is the structural fix for the `reference-drift` class.
- `considerthese/2026-10-25.md:62-63` idea 2 was taken in round 64 (`scripts/report-receipt-diff.mjs`); idea 1 (`:59-61`, try to forge each new gate) is applied to C1
  and C2 by the wave-2 forge seats.

spot-check: pending non-author (the round-65 closure records agree/disagree on one admit and one reject at `corpus/lessons/round-65-verifier-spotcheck.md`)

## Open items carried

- **Audit19 residuals** — the four exhaustive checks (no-truncation, exact traceback, per-row identity) and a ledger row for the dead-seat `RevS126Quote.md`: named in 6
  lesson files (`grep -rl 'Audit19' corpus/lessons | wc -l` → `6`), carried at `corpus/lessons/round-63-verifier-spotcheck.md:91`. No round-65 seat owns it: the plan's
  only hit is the routing line (`grep -c Audit19 .ufo/waves/round-65/plan.md` → `1`, `.ufo/waves/round-65/plan.md:118`).
- **R61-V2, unaddressed again** — the inherited `dispatch61`/`doctrine61` probes still accept the fabricated C1 and the forged C2 (4 lesson files name it,
  `grep -rl 'R61-V2' corpus/lessons | wc -l` → `4`; `grep -c 'dispatch61\|doctrine61' .ufo/waves/round-65/plan.md` → `0`). Round 62 recorded it as "fourth consecutive
  round noted" (`corpus/lessons/round-62-verifier-spotcheck.md:59`), so on that count round 65 is the seventh [INFERENCE — arithmetic from that line, not re-derived].
- **Six W04 duplicate-URL warnings** — `S034`, `S068`, `S084`, `S095`, `S123`, `S126` (`grep -o 'S[0-9]\{3\}' base/census-before.txt | sort -u` → those six; `grep -c W04
  base/census-before.txt` → `6`), listed and then `ok … EXIT=0` in `base/census-before.txt`; none disambiguated or superseded this round.
- **The kimi layer is DEGRADED (K = 49 of 53)** — carried as round-64 D4: `corpus/lessons/round-64-verifier-spotcheck.md:66` says "Kimi layer DEGRADED K=49/53 (host state,
  `kimi-census` MEMBER_MISSING ×4)". Live carriers: `base/checklists-open.txt:21-26` prints the four `MEMBER_MISSING` lines and `KIMI_CENSUS: DRIFT`; the gate's own clean
  line prints `K=49/49 coverage:kimi-layer=10` (`base/harm-pairA-freeze.txt:2`), so the 49 is the stanza's declared count and the 53 is the spot-check's host member
  count — the two denominators are not the same quantity.
- **The round-64 D3 dangling pointers** — two of three still stand, one is closed:
  (i) `close/supplementary-c2.txt` absent (`ls .ufo/waves/round-64/close/supplementary-c2.txt` → `No such file or directory`);
  (ii) no re-derivation line: `grep -c 're-deriv' /home/vgpnk/Projects/shokunin/.ufo/reports/round-64/kumitate.md` → `0`, and the close receipt the wave-1 draft cited,
  `.ufo/waves/round-64/close/p3-real-reports.txt`, does not exist (`ls` → `No such file or directory`; the claim lives only in
  `build/K64R2ScribeReportDraft/report-draft.md:100`) — a further dangling pointer of the same class, found this round;
  (iii) the two untracked `K64ExecProxyRepair` receipts are now **tracked** — `git log --oneline -1 -- .ufo/waves/round-64/build/K64ExecProxyRepair/receipts/13-manifest-before.txt`
  → `2ca91a0 round-65: freeze …`, same for `15-manifest-after.txt`/`15-refresh-idempotent.json`, so the freeze commit closed that sub-item (K65ScribeLessonDraft-3).
- **The counters' declared holes** — H65: a gate's reading is only as good as its verdict line; distinct not-clean readings are CARRIED_MOVED and unranked; host-state gates
  read one host at both revisions; heavy gates are outside the registry; a random temp path in output makes a not-clean gate read CARRIED_MOVED (plan §C1). O65: the counter
  measures an evidence chain plus a live re-run and cannot tell a sound entry from a well-grounded wrong one; an attacker-hosted URL passes O5; the binary sweep proves
  presence, not use (plan §C2).
