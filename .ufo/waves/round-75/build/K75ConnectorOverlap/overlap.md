# K75ConnectorOverlap — sibling-overlap scan, kumitate round 75 (2026-11-04)

Seat: K75ConnectorOverlap (leaf, no subagents). Scope: read-only scan of all sibling lanes and
the fleet level for overlap with round 75's two surfaces — (a) C1 `coverage:omp`, the OMP
agent-plane members (`lsp.json`, `config.yml.pre-*`, `agent.db.pre-*`, `models.db.corrupt-*`)
and (b) C2 `origin-tip-drift` (`--tip-drift [--origin DIR]`, pin `31c465f15669` vs origin
`fb7157fcf146`). Base lane revision `c38382d5`; frozen plan `.ufo/waves/round-75/plan.md` read
first (lines 1-83). Report overlaps, never absorb.

## Method (exact scans)

All searches via the `grep` tool, case-insensitive unless noted, gitignore-respecting, over
**explicit literal paths** (a glob-form `path` in the grep tool silently matches nothing — e.g.
`*-shokunin` returned "No matches found" while the same pattern over the 20 enumerated dirs
returned 6901+ files; filed to `xd://report_issue`).

1. Full-tree pass, 20 sibling dirs (all lanes except kumitate), broad terms
   `lsp\.json|omp/agent|config\.yml\.pre|agent\.db\.pre|models\.db\.corrupt|tip-drift|origin[- ]pin|coverage:omp|origin-tip`
   → 6901+ files, dominated by `.ufo/` wave dispatch boilerplate (`~/.omp/agent/RULES.md`
   tooling directive in every lane's prompts). Mined only where terms are specific.
2. Narrow pass, same 20 dirs, finding-name terms
   `lsp\.json|config\.yml\.pre|agent\.db\.pre|models\.db\.corrupt|tip-drift|coverage:omp|origin-tip`
   → 23 files (table below).
3. Governance-surface pass, 20 × {`PROVINCE.md`, `SKILL.md`}, terms `omp/agent|origin[- ]pin|coverage:omp`.
4. C2 duplication pass, `rev-list --count` over fleet `scripts/` and every sibling
   script/tool dir that exists: `chousa-shokunin/tools`, `kaidoku-shokunin/tools`,
   `kake-shokunin/scripts`, `tabi-shokunin/scripts` (the other 16 sibling lanes have no
   scripts dir at all — verified by the tool's skipped-paths list).
5. Pin-kinship pass, `origin|pin|upstream` (case-sensitive) over `tabi-shokunin/scripts` +
   `tsukuroi-shokunin/scripts` (tsukuroi has no scripts dir), plus targeted reads of
   `tabi check-release-pins.mjs:1-63`, `tabi check-user-round-contract.mjs`,
   `tabi check-freshness.mjs`, `kumitate scripts/omp-census.mjs:1-15`.
6. Ownership pass, glob `*-shokunin/.ufo/pins/*` → hits in **kumitate-shokunin only**
   (readme-map.json, source-captures.json, counter-pins.json, origin.json, anchor-truth.json,
   fidelity-ratchet.json, surface-known.json); glob `/home/vgpnk/Projects/shokunin/.ufo/pins/*`
   → path not found. No sibling lane and not the fleet root declares an origin pin.

## Hit table

| # | Lane | File:line | Term | Gist | Disposition |
|---|------|-----------|------|------|-------------|
| 1 | tameshi | `.ufo/waves/round-55/w2-results.json:94` | `lsp.json` | r55 sentinel sweep: `find ~/.omp -newermt <base>` for operator-owned files (`config.yml*`, `mcp.json*`, `lsp.json`, `agent/agents/`) = EMPTY; census 275 touches / 274 reads / 0 writes | (ii) one-off round-55 no-write custody evidence; no governance claim |
| 2 | tameshi | `.ufo/waves/round-55/w1/T55W1SentConfig-receipts/04-config-yml-state.txt:45-51`, `r5-config-state.stdout:22-28` | `config.yml.pre` | Lists 7 `config.yml.pre-*` backups (20261027) with mode `-rw-------` (0600), sizes, mtimes | (ii) corroborates C1's mode-0600 sweep from an earlier round |
| 3 | tameshi | `.ufo/waves/round-55/w1/T55W1SentConfig.md:94` | `models.db` | "newer files there are harness DB state (`agent.db`, `models.db*`, `history.db-shm`), not seat deliverables" | (ii) names the same member classes C1 classifies; classification consistent |
| 4 | tameshi | `.ufo/waves/round-55/w2/T55W2SentConfig2-receipts/r5-omp-write-sweep.txt:1-3` | `lsp.json` | Write-sweep receipt shape over `~/.omp` newer than the round base | (ii) |
| 5 | tameshi | `SKILL.md:2142-2145` | `omp/agent` | `wave-route-mix.py` Entry reads the live route table `~/.omp/agent/config.yml`; retained r21 receipt, not a re-run | (ii) read-only content reader |
| 6 | mado | `PROVINCE.md:25` | `omp/agent`/`agent.db` | `mado-tripwire.py` refuses "`agent.db`-named files and paths under `~/.omp/agent` outside `sessions/`" — declared read boundary | (ii) boundary declaration, not governance; compatible with the census (see Compatibility) |
| 7 | mado | `.ufo/blocked/fleet-round-1-routing.json:6` | `omp/agent` | Routing authority `~/.omp/agent/config.yml`, operator-owned, read-only | (ii) |
| 8 | mori | `SKILL.md:741` | `omp/agent` | `mori-job-runway.py` gate reads `~/.omp/agent/config.yml` + the `omp` binary path; never runs omp | (ii) content-level gate precedent |
| 9 | kotoba | `SKILL.md:32,555,575` | `omp/agent` | Studies `~/.omp/agent/skill-descriptions.db` content and `~/.omp/agent/sessions/**/*.jsonl` (5842 files) | (ii) content-level authority on two other members; disjoint method from C1 |
| 10 | kotoba | `.ufo/waves/round-57/a3/falsify/A3ShipClaudeCode.md:77`, `build/CriticC1Rows.md:91`, `build/SrcClaudeCode.md:9` | `lsp.json` | Upstream Claude Code plugin docs: `.lsp.json` = LSP server config component (manifest lines 153/623) | (iii) same filename, different product plane (Claude Code/Copilot plugins ≠ omp's `lsp.json`); NOT citable as evidence about omp's file |
| 11 | kotoba | `.ufo/waves/round-58/build/ScoutCopilotPrompts.md:138` | `lsp.json` | Copilot captures `~/.copilot/lsp-config.json`, `.github/lsp.json` | (iii) same as #10 |
| 12 | kaidoku | `PROVINCE.md:15-18,44` | `omp/agent` | Drift-prone `rea-agents` pins inside `~/.omp/agent/mcp.json:8`; r19: file rewritten 2026-10-20 13:35:56 -03 by an unidentified writer, dropping the `enabled: false` key | (ii) content-level pin custody of one member; the r19 external-writer incident is the in-fleet precedent for C1's premise (plane mutates outside lane control) |
| 13 | kaidoku | `SKILL.md:732-741` | `omp/agent` | `config-pre-pair.txt` sha256 custody ritual over `mcp.json` + 4 other paths, pre/post-pair rule | (ii) |
| 14 | kama | `corpus/lessons/round-48-verifier-spotcheck.md:27` | `config.yml.pre` | Cites `config.yml.pre-glm53critic-20261026` (17:45) as historical route-map state vs the live config (defect R4) | (ii) backup files carry operator-decision provenance — citable support for C1's knowledge-note framing |
| 15 | kama | `.ufo/waves/round-52/w1/out/Sen3Policy/proposed-fixes.diff:35` | `config.yml.pre` | Proposed (unlanded) `hyaku.env` edit quoting `config.yml.pre-run8-20261026` | (iii) |
| 16 | kama | `.ufo/waves/round-25/a2-falsify/out/ReviewerQualityKQ36/verification.md:116` | `tip-drift` | "C2 tip-drift shape": `git diff --stat <a> <b>` empty = frozen counter bytes at the landed tip | (iii) same words, different meaning (byte-freeze, not origin pin) |
| 17 | kama | `.ufo/waves/round-29/w2/RerunCounter.md:39` + `out/report.md:39` | `origin-tip` | `receipt-fresh-clone-origin-tip-49f849f2.json`: counter replay in a fresh clone at the origin tip | (ii) precedent for measuring at the recorded revision vs a moved tip; not an instrument |
| 18 | kasegi | `.ufo/waves/round-46/wave2/R46W2MutLanding.md:79` | `origin tip` | Landing gate `final-is-tip` vs origin tip; "the origin-tip read in `post_report` is unpinned" (selftest suggestion) | (ii) checks its OWN lane tip vs its own remote — push-state, not pin-vs-external-origin drift |
| 19 | kasegi | `SKILL.md:368-372` | `.omp/` | Fixture-world `.omp/agents/kx-<lane>.md` cards, `.omp/config.yml` modelRoles (project-local namespace) | (iii) different path namespace, not `~/.omp/agent` |
| 20 | mori | `.ufo/waves/round-38/w2/RevC5Pin.md:112` | `tip-drift` | "Tip-drift window": both sides of a head-pin check are live `rev-parse HEAD` reads (race window) | (iii) |
| 21 | mori | `.ufo/waves/round-60/w1/Mo60Reviewer15.md:31` | `tip-drift` | Replay used frozen instruments, "not a tip-drifted copy" | (iii) |
| 22 | chousa | `.ufo/waves/round-73/w1/R73S03/.scratch__goal-20261103-hyaku-run15.md.txt:28`, `.ufo__prompts__chousa-round-73.md.txt:147,152` | `config.yml.pre` | Archived copies of fleet goal/prompt text naming routing backups | (iii) captures of fleet-level text |
| 23 | chousa | `.ufo/plans/round-1-interactive-*.md:29` | `omp/agent` | Round-1 read-only authority read of `~/.omp/agent/config.yml:318-332` role bindings | (ii) historical |
| 24 | chousa | `SKILL.md:83,90`, `corpus/QUALITY.md` (rows 49/53/58) | `pin` | `research-gate --pin/--drift` (`GATE_DRIFT`), sha256 revision pins, "a counter's measured revision is pinned inside its receipt" | (ii) pin/drift methodology authority; surface is its own gate baselines, not git origin tips |
| 25 | tabi | `scripts/check-user-round-contract.mjs:24-27,407-418` | `pin..HEAD` | Walks `pin..lane-tip` diff (`PSTACK_PIN`) for lane-history rewrites (`history_rewritten`) | (ii) nearest structural kin to C2's `pin..origin` walk, but over the lane's OWN history for rewrite detection; no commit-count or layer classification |
| 26 | tabi | `scripts/check-release-pins.mjs:1-63` | `pin` | Upstream release-tag freshness for SOURCES rows: Chromium Gitiles tags old→`--stable`, committed bytes only, never fetches; verdict 0/1/2 | (ii) nearest functional kin to C2 (upstream moved; are pinned rows stale?) — unit is tag+bytes of public docs, not a pin revision vs live origin HEAD |
| 27 | tabi | `scripts/check-freshness.mjs:84-101` | `pin` | Pin table with `baseline_sha256` + source pins `"<40-hex>:FILE:a-b"`; `content_drift` fail on changed bytes | (ii) |
| 28 | tabi | `scripts/check-adjacency.mjs` (sibling pins `<lane>@<path>:<line>`, one-cite-once) | `pin` | The fleet's dedicated sibling-overlap gate: duplicate-row and re-pin findings | (ii) shape precedent for this receipt's table |

Fleet level:

| # | Path:line | Term | Gist | Disposition |
|---|-----------|------|------|-------------|
| 29 | `scripts/hyaku/inline.sh:173` | `rev-list --count` | `origin/master..HEAD` ahead-count for the fleet repo before fleet-commit | push-state, not a pin-vs-origin drift instrument |
| 30 | `scripts/hyaku/jj-lane.sh:176-177,409-410` | `rev-list --count` | Per-lane ahead/behind vs `refs/remotes/origin/<branch>`, divergence guard | push-state, not pin drift |
| 31 | `scripts/hyaku/jj-lane-selftest.sh:190` | `rev-list --count` | Selftest arm of #30 | (iii) |
| 32 | `scripts/hyaku/hyaku.env:4-124` | `config.yml.pre` | Narrates each routing ruling with its backup name (run8→run15, flash/mim/zfl splits, latest `config.yml.pre-zfl-split-20261104`) | (ii) the fleet-level decision ledger for the `config.yml.pre-*` family; prose history, not a census or cleaner |
| 33 | `scripts/hyaku/lane-addendum.md:265-267,272-273,389-393` | `omp/agent` | mcp.json rea disable + unidentified-writer incident; config.yml capacity keys operator-owned; RULES.md tooling directive | (ii) |
| 34 | `scripts/hyaku/inline-dispatcher.py:95,98` | `omp/agent` | RULES.md boilerplate; r-note: a kengaku seat once planted `~/.local/bin/git` (git-shim incident) | (iii) |

## Dispositions

- **(i) Contested — same ground already owned by a sibling: NONE.** No sibling lane
  governs, declares or duplicates either round-75 surface. `coverage:omp` and `origin[- ]pin`
  have zero hits in any sibling PROVINCE/SKILL/corpus/scripts. No sibling implements an
  agent-root census (closest: tameshi r55's ad-hoc one-round sweep, #1-4 — evidence for a
  round-55 no-write claim, not a standing instrument). No sibling implements a pin-vs-origin
  drift instrument (see below). `.ufo/pins/` exists in kumitate only.
- **(ii) Adjacent, citable:** tameshi r55 (#1-5 — same ground, one-off evidence; 0600-mode
  corroboration), mado (#6-7 — refusal boundary), mori (#8), kotoba (#9), kaidoku (#12-13 —
  incl. the r19 external-writer precedent), kama (#14, #17), kasegi (#18), chousa (#23-24),
  tabi (#25-28), fleet hyaku.env/lane-addendum (#32-33).
- **(iii) Unrelated word match:** kotoba `.lsp.json` (#10-11 — Claude Code/Copilot plugin
  format, different product), kama "tip-drift" phrase (#16), mori tip-drift wording (#20-21),
  kasegi fixture `.omp/` namespace (#19), chousa archived prompt copies (#22), fleet
  dispatcher boilerplate (#34).

## C2 duplication check (fleet-level instrument scan) — verdict

`rev-list --count` appears only in fleet `scripts/hyaku/` (#29-31), and only as lane/fleet
push-state (ahead/behind, divergence). Zero hits in `chousa-shokunin/tools`,
`kaidoku-shokunin/tools`, `kake-shokunin/scripts`, `tabi-shokunin/scripts`; the other 16
sibling lanes have no scripts directory. No script anywhere computes
`pin..HEAD` commit/changed-path counts against an external origin. Closest kin are tabi
`check-release-pins.mjs` (upstream tag freshness for its own SOURCES rows) and
`check-user-round-contract.mjs` (`pin..lane-tip` rewrite walk) — both different units.
**No duplicate capability; C2's ground is unclaimed.**

## Compatibility notes for C1 (report, do not absorb)

1. **mado boundary vs census metadata.** mado's credential rule (#6) refuses
   `agent.db`-named files and `~/.omp/agent` paths outside `sessions/` *for its own tools*.
   kumitate's census states in its header (`scripts/omp-census.mjs:5-7`): it "never opens,
   reads or hashes a member's content: the census path uses `readdir` of the root and `lstat`
   of each entry, nothing else." Metadata-only enumeration therefore stays outside mado's
   credential-material concern. The `omp-agent-root.md` note should carry one sentence saying
   exactly that, so a later reviewer cannot read the census as an agent.db access.
2. **hyaku.env is the provenance companion for the `config.yml.pre-*` chain family.** The
   fleet file (#32) names the operator ruling behind every routing backup; kama r48 (#14)
   demonstrates backups serving as historical route-map evidence. The knowledge note may cite
   fleet `scripts/hyaku/hyaku.env` as the decision ledger — read-only citation, no absorption
   of any sibling claim (it is fleet prose, not lane-owned ground).
3. **Second-order risk worth one report line:** the plane mutates outside lane control
   (kaidoku r19 #12; tameshi r55 #1). C1's kill rule ("any live finding at close") plus the
   plan's same-commit re-measurement stanza already covers a mid-round external writer; a
   sibling seat creating or deleting plane members between measure and close would move
   `entries`/`findings` without any lane acting — disclose, never re-score silently.

## Verdict

`OVERLAP: named — tameshi, mado, kotoba, kaidoku, kama, kasegi, mori, chousa, tabi (fleet: scripts/hyaku)` —
all category (ii) adjacent-citable or (iii) unrelated; **contested ownership: none**; no
duplicate instrument for either C1 or C2 anywhere in the sibling lanes or the fleet scripts.

## Limits

- Sibling `.ufo/` wave artifacts were in scan scope for the full pass and mined where the
  terms are specific (tameshi r55, kotoba r57/58, chousa r73, kama/kasegi/mori receipts);
  the 6901+ broad-pass figure is dominated by dispatch boilerplate naming `RULES.md`.
- Text files only, gitignore-respecting; no member content of `~/.omp/agent` was read
  (census-consistent); no live sibling agent state consulted — repo evidence only.
- `audio-shokunin` and `game-dev-2d-shokunin` have no SKILL.md (tool skipped them; their
  PROVINCE.md had zero hits). `tsukuroi-shokunin` has no scripts dir.
- glob-form paths in the grep tool silently match nothing (filed via `xd://report_issue`);
  every scan recorded above used explicit literal paths.
- No files written outside `build/K75ConnectorOverlap/overlap.md` and
  `.ufo/waves/round-75/w1/K75ConnectorOverlap.md`; no scratch created; no tool installs.
