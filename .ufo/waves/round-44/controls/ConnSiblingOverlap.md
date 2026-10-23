RESULT ConnSiblingOverlap rev=292d9266 verdict=complete scope=lane-repos-read-only findings=30 contested=6 reusable=8 route-out=3 omp_census_elsewhere=none tooling=none

Read-only scan over all 21 sibling lane repos under /home/vgpnk/Projects/shokunin/*-shokunin (SKILL.md, PROVINCE.md, SCORECARD.md, scripts/, tools/, corpus/knowledge, .ufo/waves) at their working revisions. No lane holds an OMP census; `OMP_CENSUS` appears only in this lane's round-44 probe (`.ufo/waves/round-44/probe/p44-count.mjs:2`). One line per finding, path:line.

## Contested scope — a member another lane already governs (6)

1. kotoba governs `~/.omp/agent` *content* (skill-router semantics): `kotoba-shokunin/verifiers/verify_harness_claims.py:54` (`OMP_DB = ~/.omp/agent/skill-descriptions.db`), `:57` (`OMP_SESSIONS = ~/.omp/agent/sessions`), `:65` (`~/.omp/agent/skills` as a discovery root); declared `kotoba-shokunin/PROVINCE.md:14`; siblings `verifiers/verify_harness_independent.py:125,346`, `verifiers/compare_harness_independent.py:1133-1134`. A shape row on `skill-descriptions.db`, `skills/` or `sessions/` is a *second, strictly weaker* claim on kotoba's ground — declare as shape adjacency, do not absorb.
2. mori governs one *value* inside `config.yml`: `mori-shokunin/tools/mori-job-runway.py:6,12,110` (async.maxJobs from `~/.omp/agent/config.yml` plus the clamp compiled into the omp binary); `mori-shokunin/SKILL.md:718` states it is "not a census or fleet-admission gate" — so a name/kind/mode row on `config.yml` does not duplicate it, but must not become a second value-level read.
3. mado already declared the exact boundary this census needs: `mado-shokunin/tools/mado-tripwire.py:2766-2770` refuses any path under `~/.omp/agent` outside `sessions/`; `mado-shokunin/PROVINCE.md:25` records the refusal set (`agent.db`-named files, non-`sessions/` paths). Reusable precedent: lstat-only name/kind/mode is weaker than mado's own refusal, so no conflict — cite it.
4. kaidoku governs `mcp.json` *content*: `kaidoku-shokunin/PROVINCE.md:17` (`rea-agents@6.7.0` at `/home/vgpnk/.omp/agent/mcp.json:8`), `:44`; `kaidoku-shokunin/SKILL.md:334` sha256sums `~/.omp/agent/mcp.json` into `config-pre-pair.txt`. A census member rule there must be name+kind+mode only, never a content or registration claim.
5. tameshi holds the kumitate gate census this round changes: `tameshi-shokunin/corpus/knowledge/gates-survey-kumitate.md:1` ("six hermetic suites"), `:21-26` per-suite case counts; mutation worked case `corpus/knowledge/mutation-case-kimi-census.md:4-7` (43-case suite vs 10 single-edit mutants → 8/10 killed). A 7th suite (`omp-census` + the 87-case counter) invalidates their "six" and its count table — hand the row to tameshi, do not silently absorb.
6. chousa refuses `.omp/` as a claim source: `chousa-shokunin/SCORECARD.md:1322` ("refuses claim sources beginning `.config/`, `.omp/`, or `.local/state/`"), `chousa-shokunin/corpus/knowledge/denylist-r22.md:9,19`; falsifier `chousa-shokunin/.ufo/waves/round-26/falsify/FRegistryRegistryDeny.md:64` (case B6 `c:/.omp/agent/reg.md` → 0 rows, refused). Consequence: census evidence must live as gate output, never as a `.omp/agent/...` claim source in a corpus note.

## No collision (3 checked, negative results are findings)

7. kagi does NOT census `~/.omp`: scan dirs are `kagi-shokunin/corpus/surface-census.tsv:17-20` (`$HOME/.config/the-janitor`, `$HOME/.local/state/the-janitor`, `…/xdg-data/opencode`, `$HOME/.local/state/tac`) — zero OMP rows in `surface-census.tsv`/`state-shape.tsv`. kagi only *reads* `~/.omp/agent/sessions/…` transcripts as historical evidence (`kagi-shokunin/.ufo/waves/round-22/build/Entry22.md:120-122,415`).
8. souji cannot absorb it: `souji-shokunin/SKILL.md:2` anti-trigger "NEVER operator config"; its census excludes `souji-shokunin/census/**` (`souji-shokunin/SKILL.md:37`). `~/.omp/agent` hygiene is nobody's lane, so a read-only shape census is the only available instrument.
9. `models.*` is ABSENT from `~/.omp/agent` and unclaimed fleet-wide: the only `models.jsonl` claims are `~/.bailian/skills/bailian-docs-llm-wiki/models/` (`kengaku-shokunin/corpus/knowledge/local-model-index.md:19-22`, `kengaku-shokunin/PROVINCE.md:17`) — different path, different substrate.

## Own-lane prior holdings (cite so the census does not read as new ground)

10. `kumitate-shokunin/PROVINCE.md:19` — OMP harness contract (task batch, agent hub, agent discovery) is already Frontier in this lane; `:20` MCP protocol revisions queued; `:21` isolation substrates for parallel agents queued (the band a bwrap-sandboxed counter lands in).
11. `kumitate-shokunin/corpus/knowledge/route-resolution.md:1,37-38,62` — `omp-global-config.mjs` resolution over `~/.omp/agent/config.yml` (routing precedence, live alias table).
12. `kumitate-shokunin/corpus/SOURCES.md:37` S024 — user `~/.omp/agent/mcp.json` is a primary MCP server-definition file (queued, docs tier A).
13. Secret-member precedent to reuse verbatim: `kumitate-shokunin/corpus/knowledge/kimi-mcp-plane.md:93-94` — presence as a non-directory leaf + mode floor `0400` owner-read, never content-read; FIFO canary proves the gate never reads it.

## Reusable patterns — sandboxed counters / bwrap (7 here; the 8th, mori's context-clause gate, is finding 30)

14. tameshi `tools/env-diff.py:57-59,68` — bwrap `--ro-bind / / --dev /dev --proc /proc` execution, plus `:161-162` `EXEC_UNAVAILABLE` fail-closed arm when bwrap is missing: exactly the shape P44's "cleared environment, only its own file" needs.
15. tameshi bwrap confinement for untrusted mutants: `.ufo/reports/round-16/tameshi.md:111`, `.ufo/reports/round-17/tameshi.md:125` (carried-forward debt list).
16. mori `.ufo/waves/round-31/count-c2-a1.py` — bwrap isolation for control counting (precedent that a *control* run is sandboxed, not just the target).
17. kotodama `reports/round-39/calib/isolation-replay-protocol.md:37-50` — Tier A (bwrap mount namespace, publish permitted) / Tier B (no-bwrap fallback, no publish) / Tier C (altered-source replay disclosed): a ready tier vocabulary for stating a sandboxed counter's honest bounds.
18. kaidoku `corpus/lessons/round-20.md:34,102` — systemd-run sandbox built and passing, bwrap port left open; the false "bwrap is NOT installed" premise came from a `set -e` leak in a persistent shell. Binding on P44: any bwrap-presence claim needs a printed probe result. Its surviving bwrap reference is the round-20 wave generator `kaidoku-shokunin/.ufo/waves/round-20/gen-wave1.py` (with two clones of it under `.ufo/waves/round-23/{runtime/KaidokuR23.RunBefore/clone,worktrees/AppImageLibraries}/`) — a wave artifact, not a tracked lane tool.
19. kotoba `verifiers/check_sibling_census.py` + `corpus/knowledge/sibling-overlap-census-round49.md` (source line 2, `recheck:` line) — the fleet's only machine-checked sibling-overlap census: per-lane classification, pinned commit, boundary quote, gate re-verifies it against `PROVINCE.md` ("rows 20 verified 20"). The pattern to adopt if this scan is to be durable instead of one round's prose.
20. This lane's prior scan of the same kind, one axis narrower: `.ufo/waves/round-35/build/ConnectorSiblingOverlap.md:18-24` (7-row member-claim table + adjacent list) — same report shape, usable as the template for a durable version.

## Report rather than absorb (PROVINCE adjacency, 3)

21. MCP/OAuth security practice (token passthrough, confused deputy) → kasegi / kagi: `kumitate-shokunin/PROVINCE.md:26`. Concretely: `mcp.json` may enter the census as name+kind+mode only; anything about the REA server entry, the dropped `enabled: false`, or token material routes out, never into a census finding.
22. kama's hard write boundary is the read-only precedent to restate: `kama-shokunin/PROVINCE.md:45,65` ("kama never writes to `~/.config`, `~/.omp`, or systemd"), echoed by `mori-shokunin/SKILL.md:666` ("writes under `~/.omp` are the operator's").
23. kengaku routes OMP ground back to this lane: `kengaku-shokunin/PROVINCE.md:27` "kumitate: OMP route resolution, fallback policy, operational failure taxonomy", with measured model effects kept at `:30-31`; kotoba's census pins the same adjacency (`kotoba-shokunin/PROVINCE.md:54`, kumitate adjacent at `fac39171…`, basis `kumitate PROVINCE.md:27`).

## Live-shape facts and cross-gate interactions that bear on the census design (lstat only, never contents)

24. `~/.omp/agent` is mode 700; observed members: `config.yml` 600, `mcp.json` 600, `agent.db` 600 (+`-shm`/`-wal` 600), `history.db` 644 (+sidecars), `RULES.md` 644, `kimi-device-id` 600, `last-changelog-version` 644, dirs `agents/ blobs/ cache/ custom-session-files/ hooks/`.
25. Chain-generation sidecars are live, not hypothetical — the CONTROL clause "name or chain template + kind + permission ceiling, sidecars and chain generations optional" is load-bearing: `mcp.json.rea.backup.0a0013883f33dfc5f190448dc1db19796967dec159202c53710210a8f1782edb.recovery`, `mcp.json.rea.backup.619e9309acade66187a3d66f15c00885ddb92f62d5a276c0ea432169f18db958.recovery`, `mcp.json.pre-disable-20261020T1015`, `mcp.json.rea.backup` (all 600); `agent.db.pre-restore-20261023T004529Z` + `-shm`/`-wal`, `agent.db.recovered-20261023T004505Z`; `history.db.corrupt-1792715344636-b3047a2e-ec33-4a05-a4e7-bd59ec6ce87b` (+`-shm`/`-wal`).
26. The directory's shape changed *during this round* (recovery artifacts written 2026-10-22 21:29–21:45). The 87-case counter is mirror-based and therefore immune, but any wave-2 run of the census against the live host DRIFTs unless the member rule set is chain-template based, not exact-name based. This is the single largest operability consequence found.
27. Stated contradiction, not smoothed: `mcp.json` is now 600 and shape-CLEAN by any kind/mode rule, yet `kaidoku-shokunin/PROVINCE.md:17` records it as the file whose `enabled: false` was dropped by an operator rewrite. A shape census reads CLEAN on a semantically changed file; that residual must be disclosed in the census's own notes, not scored away.
28. `agent.db` is currently 600 with live `-shm`/`-wal` sidecars written seconds apart — a census that demands exact sidecar presence will flap under normal harness use; the `-shm`/`-wal` pair belongs to a chain template with an "optional" arm.
29. No lane's gate would reject a shape-only census run: kagi's `SURFACE_CENSUS` scans four non-OMP dirs, chousa's denylist covers claim *sources* not gate inputs, souji never enters operator config. The census's only review surface outside this lane is tameshi's mutation ledger (finding 5) and the PROVINCE adjacency rows above (finding 21).
30. The only sibling *gate* whose clause set names `~/.omp/agent` is mori's context check: `mori-shokunin/tools/mori-round17-context-check.py:565` carries `/home/vgpnk/.omp/agent/RULES.md` inside its twelve required seat-context clauses, and `mori-shokunin/SKILL.md:177` registers it as a static-text gate over committed wave specs ("static text only, no runtime prevention"; "none live"). It never reads the directory — the path is an expected string — so it is no census collision; it is a reusable pattern (a clause gate over dispatched seat text) and the precedent that the `~/.omp/agent` path string is already asserted fleet-wide in seat contexts, including this round's own.

## Evidence (commands; all read-only, no lane or host state written)

```
$ grep -rn "\.omp/agent\|agent\.db\|mcp\.json" --include="*.md" --include="*.mjs" --include="*.js" --include="*.sh" --include="*.py" .   # fleet root, 21 lane repos
$ for d in *-shokunin; do grep -rn "OMP\|omp" "$d/PROVINCE.md"; done
$ grep -rn "OMP_CENSUS\|omp-census" .    # → only kumitate-shokunin/.ufo/waves/round-44/probe/p44-count.mjs:2,9,11-13,196-197,214,223,258
$ grep -rln "bwrap" --include="*.mjs" --include="*.js" --include="*.sh" --include="*.py" .   # tracked lane tool: tameshi tools/env-diff.py only; the rest are wave/evidence scripts (tameshi .ufo/evidence/round-18+21, tameshi .ufo/waves/round-21, mori .ufo/waves/round-31, kaidoku .ufo/waves/round-20+23, kumitate .ufo/waves/round-44/probe)
$ grep -n "^# scan" kagi-shokunin/corpus/surface-census.tsv   # → 17-20, four non-OMP dirs
$ ls -la /home/vgpnk/.omp/agent/ && stat -c '%n kind=%F mode=%a' /home/vgpnk/.omp/agent   # listing + stat only; no file under it was opened, copied or hashed
```

Tooling: none installed or upgraded (no pacman transaction, no uv/npx/cargo install). No git or jj write in the lane or fleet repo; no process left running; no temp dir created.

Limit: this scan reads committed/working text only. A lane that governs `~/.omp/agent` without naming it in SKILL.md/PROVINCE.md/SCORECARD.md/corpus would be invisible to it; the negative results (findings 7-9) are greps over those surfaces, not proof of absence.
