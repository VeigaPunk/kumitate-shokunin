VERDICT: The integrated `kumitate-proxy-v1` stanza and `kumitate-gate-pins-v1` block at a9531c8e are stale on 6 terms and 2 missing gate-pin keys; the patched scorecard in build/ reads `PROXY: MATCH` (plain and --strict, exit 0) on the archive, so the final stanza is ready to integrate.

## Evidence

Commands (all against git archive of `a9531c8e617338fd16cb69c61344ef8f17711117` extracted to `/tmp/kumitate-r63/K63R2ExecProxyFinal/archive`; origin pin resolved to `/fast/scratch/hyaku/kumitate-pin/src` @ `31c465f1…` asserted OK; kimi root `/home/vgpnk/.kimi-code` live):

1. `node scripts/proxy-check.mjs --self <archive> --json` (committed SCORECARD.md) → exit=1, verdict `DRIFT`, errors=6, warnings=1. Computed terms: A=201 C=30 C1=19 C1_total=19 C2=153 C2_total=153 S_members=88 S_sections=88 R_members=92 R_sections=92 coverage_script=10 coverage_runtime=10 C1k=5 C1k_total=5 K_members=49 K_sections=49 coverage_kimi=10; pinsMatched=5/6. Findings: `A_DRIFT declared=117 computed=201 delta=+84`, `C2_DRIFT declared=150 computed=153`, `C2_TOTAL_DRIFT declared=150 computed=153`, `K_MEMBERS_DRIFT declared=52 computed=49`, `K_SECTIONS_DRIFT declared=52 computed=49`, `PIN_DRIFT pin.proxy-check declared=7f73f8e7… computed=cc4a2ea7…`, warn `PIN_UNPINNED scripts/inline-dispatch-evidence.mjs`.
2. `sh build/K63ExecProxyStanza/recompute.sh <archive>` (independent re-derivation; derivation verified by reading vs `scripts/proxy-check.mjs` lines 92–128 / 943–966: same `walkFiles` pruning/lstat, same `/^\s*- \[/`, same 4th-cell `yes` test, same README-row regex, same corpus-note recursion, pin maps parsed from the tool) → `A=201 C=30 C1=19 C1_total=19 C2=153 C2_total=153`, all 26 pins (6 v1 + 20 gate) matching the tool's `--json`; `# PREFLIGHT NOTE: pin.inline-dispatch-evidence … not declared`, `# PREFLIGHT NOTE: pin.plan-before-ready … not declared`.
3. Patched copy `SCORECARD.final.md` (diff: `build/K63R2ExecProxyFinal/K63R2ExecProxyFinal.stanza.diff`). Re-run:
   - plain: `PROXY: MATCH (A=201 C=30 operability=9; C1=19/19 C2=153/153 coverage=10; S=88/88 coverage:script-layer=10; R=92/92 coverage:runtime-layer=10; K=49/49 coverage:kimi-layer=10; pins=6 match; src-rev=31c465f15669)` exit=0.
   - `--strict`: identical `PROXY: MATCH` exit=0 (0 warnings).
4. Independent count: `find <archive> -type f \( -name '*.mjs' -o -name '*.js' -o -name '*.sh' -o -name '*.py' \) | wc -l` → 201.

## Findings

- K63R2ExecProxyFinal-1 (attack: integrated scorecard bytes, severity high). The committed stanza is not the final file set: 6 of 23 v1 terms drift (A=117→201, C2/C2_total=150→153, K_members/K_sections=52→49, pin.proxy-check=7f73f8e7…→cc4a2ea7…), and the gate-pins block lacks `pin.inline-dispatch-evidence` and `pin.plan-before-ready` — the tool's `GATE_PINS` registers them, so a `--strict` gate fails on `PIN_UNPINNED` (and any future declared-but-unregistered key would fail closed `GATE_PIN_KEY_UNKNOWN`). Reproduce: command 1 (exit 1). Fix: apply the provided diff.
- K63R2ExecProxyFinal-2 (attack: A stability, severity medium). A is now dominated by committed build artifacts: 76 of 201 runnables live under `.ufo/waves/round-63/build/` (wave-1 seats' fixture generators, proposed probes, replay scripts — e.g. `K63CriticC1Predicate/make-fixtures.mjs`, `K63ExecGateForgery/measure-real.mjs`, `K63ExecProxyStanza/recompute.sh`). Formula: `A' = 201 + N − M` (N added runnables, M removed; each file matching `/\.(?:mjs|js|sh|py)$/` counts 1; `operability = floor(10×(A+C)/(A+C+3))` stays 9 for every finite A+C). To keep A stable at 201, do NOT commit w2 build artifacts that are runnables — commit only `.md/.txt/.diff`/patch text; keep scratch under `/tmp/kumitate-r63/` (never committed). Wave-1's 76 committed runnables are already in A and cannot be un-committed without a new commit that removes them (each removal −1).
- K63R2ExecProxyFinal-3 (attack: portability, severity medium). K terms are measured live from the kimi root (`$KIMI_ROOT` or `~/.kimi-code`). `K_members=49` (49 sections) is this host's live state; the stale stanza's 52 (and the Axes prose's 53) reflect an older install. The final stanza is correct only for the host the L1 gates on — re-run `proxy-check` on that host after the final commit; do not copy these figures blindly. The layer terms likewise depend on the pinned origin `31c465f1` (asserted `src-rev=31c465f15669`).

## Artifacts

- `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-63/build/K63R2ExecProxyFinal/K63R2ExecProxyFinal.stanza.diff` — unified diff of the stanza + gate-pins block (lines 287–333) vs committed SCORECARD.md at a9531c8e.
- `…/build/K63R2ExecProxyFinal/SCORECARD.md.patched` — full patched scorecard (verified MATCH plain + strict).
- `…/build/K63R2ExecProxyFinal/K63R2ExecProxyFinal-values.txt` — exact final values, verdict lines, A formula, A composition.
- Scratch: `/tmp/kumitate-r63/K63R2ExecProxyFinal/{archive,out,SCORECARD.final.md}`.

## Limits

- Layer terms (S/R) were scored against the pinned origin clone `31c465f1`; a different origin tree yields different S/R values (formula identical).
- `K_members/K_sections` were scored against `/home/vgpnk/.kimi-code` at measurement time; another host or a changed kimi install changes them.
- `proxy-check --selftest` was not re-run (hermetic suite unchanged; not part of this dry-run); frozen counters/controls untouched; no lane files other than the report and build dir were written.
