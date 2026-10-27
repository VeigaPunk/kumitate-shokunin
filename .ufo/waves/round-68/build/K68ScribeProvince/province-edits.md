# PROVINCE.md edits — DRAFT ONLY, NOT APPLIED

Seat: `K68ScribeProvince` (round 68, wave w1). Task: fix the stale `omp.real` wrapper sentence at `PROVINCE.md:20`
(routed defect R67-V4, re-flag of K66ReviewR65Entry-2/-5) and append the round-68 frontier advance to the
`MCP protocol revisions as they bear on orchestration` band (`PROVINCE.md:21`).

- Target (lane): `/home/vgpnk/Projects/shokunin/kumitate-shokunin/PROVINCE.md`
- Base read: lane `HEAD` = `39f61816d4ee7a8d401df42c1818c91a9c537bce`; worktree file clean (`git status --porcelain` shows only round-68 `.ufo` scratch).
- `sha256(PROVINCE.md)` at base: `3c5b0b84581e7139…` (full: see `## Artifacts`); `sha256(province-new.md)` = `bbca01816c20c550…`.
- Line numbers are the **current** file's: edit 1 replaces line 20, edit 2 edits the tail of line 21. 31 lines total.
- Nothing here is applied: `PROVINCE.md` is untouched (L1 is the sole integration owner).

## Patch — combined (the two edits sit on adjacent lines, so `diff -u` emits ONE hunk)

Applies from the lane root: `patch -p1 < .ufo/waves/round-68/build/K68ScribeProvince/province-edits.patch`
or `git apply .ufo/waves/round-68/build/K68ScribeProvince/province-edits.patch`.

```diff
--- a/PROVINCE.md
+++ b/PROVINCE.md
@@ -17,8 +17,8 @@
 ### Frontier — named ground, entered by sourced entries, not yet gated
 
 - OMP harness contract (task batch, agent hub, agent discovery) — first entry `corpus/knowledge/omp-task-contract.md` (round 34); the docs track upstream `main` while the host runs the installed `omp` binary (skew named in the entry).
-- OMP harness contract, installed-release measurement (same frontier band as the line above) — advanced round 65 by `corpus/knowledge/omp-installed-release-mcp-runtime.md` (S201–S206): the installed release `omp/18.12.6` read at its own tag (`v18.12.6`, commit `45c35e40`) and measured on the host by `scripts/omp-binary-probe.sh` — two MCP clients in one binary on two revisions, a header that is absent until negotiation, the wrapper that mediates every reading; the docs-versus-binary question for task/hub semantics stays open in the round-34 entry (append-only `Amendment 2026-10-25`).
-- MCP protocol revisions as they bear on orchestration — first entry `corpus/knowledge/mcp-orchestration-contract.md` (round 59, S125/S127/S136): per-request identity in `_meta`, durable task creation, and the removal of the session handshake; other MCP revision families remain queued.
+- OMP harness contract, installed-release measurement (same frontier band as the line above) — advanced round 65 by `corpus/knowledge/omp-installed-release-mcp-runtime.md` (S201–S206): the release installed then, `omp/18.12.6`, read at its own tag (`v18.12.6`, commit `45c35e40`) and measured on the host by `scripts/omp-binary-probe.sh` — two MCP clients in one binary on two revisions, a header that is absent until negotiation, and a wrapper that mediated every reading of that release; that wrapper picture is now history: the host installs `omp/18.13.1` (upstream tag `v18.13.1` = `0838d2ab`, asset byte-identical), `~/.local/bin/omp` **is** the release binary (direct ELF, 275986608 bytes, sha256 `ee2961c7…`) and `~/.local/bin/omp.real` does not exist, so nothing stands between a reading and the binary (round-66 host-drift: `wrapper_is_script` 1→0, `wrapper_names_real` omp.real→none; the probe now needs `OMP_BIN_REAL=$HOME/.local/bin/omp` — a bare run fails closed `real-unidentified`, exit 2); the round-65 at-tag measurement and its 18.12.6 byte counts stand as history; the docs-versus-binary question for task/hub semantics stays open in the round-34 entry (append-only `Amendment 2026-10-25`).
+- MCP protocol revisions as they bear on orchestration — first entry `corpus/knowledge/mcp-orchestration-contract.md` (round 59, S125/S127/S136): per-request identity in `_meta`, durable task creation, and the removal of the session handshake — advanced round 68 by `corpus/knowledge/mcp-deprecation-registry.md` (S207–S213): the Deprecated registry, its two clocks (registry window vs SEP grace), and the installed-release bearing; other MCP revision families remain queued.
 - Isolation substrates for parallel agents (git worktrees, harness isolation backends, jj workspaces) — first entry `corpus/knowledge/agent-isolation-substrates.md` (round 45, exploratory): seat-containment rules derived from their mechanisms with demos; harness isolation is off on this host; jj workspaces advanced in round 64 by `corpus/knowledge/jj-workspace-seat-containment.md` — the first demonstrated jj-workspace seat-containment ground (mechanism M7 measured by `scripts/jj-seat-demo.sh`: one shared operation log, staleness that follows the seat's tree, `update-stale` recovery that deletes the abandoned files, no filesystem boundary), appended to the round-45 entry as `Amendment 2026-10-25`.
 - Durable-execution and multi-agent failure research (idempotency, timeouts, failure taxonomies) — first entry `corpus/knowledge/at-least-once-dedupe.md` (round 54; S106/S107): delivery identity and claim/repend; advanced round 55 by `corpus/knowledge/bounded-redelivery-budgets.md` (S109/S110/S111): the bound side — broker delivery-limit/dead-letter, consumer commit ordering, client-side retry budgets; advanced round 56 by `corpus/knowledge/visibility-lease-ack-deadlines.md` (S113/S114/S115): the lease slot — visibility timeout / ack deadline; advanced round 57 by `corpus/knowledge/worker-heartbeat-liveness.md` (S117/S118/S119): the liveness signal — worker heartbeats, session timeouts, platform probes; advanced round 60 by `corpus/knowledge/durable-execution-and-fanout-primitives-2026-10-24.md` (S190/S194): the two primitives the band was missing — compensating action as a saga, tail tolerance as the slowest seat's cost — and by `corpus/knowledge/durable-execution-failure-detection.md` (S126/S131/S133/S134/S135): the three shapes of "durable" and where the guarantee breaks; advanced round 61 by `corpus/knowledge/temporal-worker-versioning-pinning.md` (S195): the version boundary for Pinned Workflows and the narrower Auto-Upgrade/retry-inheritance contract; other broker/workflow failure families remain queued.
 - Multi-agent coordinator topology — orchestration topology **decisions** (how a wave's seats are arranged: which topology, what a coordinator may delegate, what the arrangement costs), not agent evaluation — first entry `corpus/knowledge/multi-agent-coordinator-topologies.md` (round 63, S196/S197): a vendor's managed-agent coordinator contract beside the measured scaling study of agent-system topologies, version-pinned to arXiv 2512.08296 v3; adjacent, not absorbed: kengaku evaluates agents, this lane arranges the seats around that judgment; recursion, nested rosters and cost per topology stay unspecified by both sources.
```

## Edit 1 alone (line 20) — wrapper picture rewritten to the installed reality

```diff
--- a/PROVINCE.md
+++ b/PROVINCE.md
@@ -17,7 +17,7 @@
 ### Frontier — named ground, entered by sourced entries, not yet gated
 
 - OMP harness contract (task batch, agent hub, agent discovery) — first entry `corpus/knowledge/omp-task-contract.md` (round 34); the docs track upstream `main` while the host runs the installed `omp` binary (skew named in the entry).
-- OMP harness contract, installed-release measurement (same frontier band as the line above) — advanced round 65 by `corpus/knowledge/omp-installed-release-mcp-runtime.md` (S201–S206): the installed release `omp/18.12.6` read at its own tag (`v18.12.6`, commit `45c35e40`) and measured on the host by `scripts/omp-binary-probe.sh` — two MCP clients in one binary on two revisions, a header that is absent until negotiation, the wrapper that mediates every reading; the docs-versus-binary question for task/hub semantics stays open in the round-34 entry (append-only `Amendment 2026-10-25`).
+- OMP harness contract, installed-release measurement (same frontier band as the line above) — advanced round 65 by `corpus/knowledge/omp-installed-release-mcp-runtime.md` (S201–S206): the release installed then, `omp/18.12.6`, read at its own tag (`v18.12.6`, commit `45c35e40`) and measured on the host by `scripts/omp-binary-probe.sh` — two MCP clients in one binary on two revisions, a header that is absent until negotiation, and a wrapper that mediated every reading of that release; that wrapper picture is now history: the host installs `omp/18.13.1` (upstream tag `v18.13.1` = `0838d2ab`, asset byte-identical), `~/.local/bin/omp` **is** the release binary (direct ELF, 275986608 bytes, sha256 `ee2961c7…`) and `~/.local/bin/omp.real` does not exist, so nothing stands between a reading and the binary (round-66 host-drift: `wrapper_is_script` 1→0, `wrapper_names_real` omp.real→none; the probe now needs `OMP_BIN_REAL=$HOME/.local/bin/omp` — a bare run fails closed `real-unidentified`, exit 2); the round-65 at-tag measurement and its 18.12.6 byte counts stand as history; the docs-versus-binary question for task/hub semantics stays open in the round-34 entry (append-only `Amendment 2026-10-25`).
 - MCP protocol revisions as they bear on orchestration — first entry `corpus/knowledge/mcp-orchestration-contract.md` (round 59, S125/S127/S136): per-request identity in `_meta`, durable task creation, and the removal of the session handshake; other MCP revision families remain queued.
 - Isolation substrates for parallel agents (git worktrees, harness isolation backends, jj workspaces) — first entry `corpus/knowledge/agent-isolation-substrates.md` (round 45, exploratory): seat-containment rules derived from their mechanisms with demos; harness isolation is off on this host; jj workspaces advanced in round 64 by `corpus/knowledge/jj-workspace-seat-containment.md` — the first demonstrated jj-workspace seat-containment ground (mechanism M7 measured by `scripts/jj-seat-demo.sh`: one shared operation log, staleness that follows the seat's tree, `update-stale` recovery that deletes the abandoned files, no filesystem boundary), appended to the round-45 entry as `Amendment 2026-10-25`.
 - Durable-execution and multi-agent failure research (idempotency, timeouts, failure taxonomies) — first entry `corpus/knowledge/at-least-once-dedupe.md` (round 54; S106/S107): delivery identity and claim/repend; advanced round 55 by `corpus/knowledge/bounded-redelivery-budgets.md` (S109/S110/S111): the bound side — broker delivery-limit/dead-letter, consumer commit ordering, client-side retry budgets; advanced round 56 by `corpus/knowledge/visibility-lease-ack-deadlines.md` (S113/S114/S115): the lease slot — visibility timeout / ack deadline; advanced round 57 by `corpus/knowledge/worker-heartbeat-liveness.md` (S117/S118/S119): the liveness signal — worker heartbeats, session timeouts, platform probes; advanced round 60 by `corpus/knowledge/durable-execution-and-fanout-primitives-2026-10-24.md` (S190/S194): the two primitives the band was missing — compensating action as a saga, tail tolerance as the slowest seat's cost — and by `corpus/knowledge/durable-execution-failure-detection.md` (S126/S131/S133/S134/S135): the three shapes of "durable" and where the guarantee breaks; advanced round 61 by `corpus/knowledge/temporal-worker-versioning-pinning.md` (S195): the version boundary for Pinned Workflows and the narrower Auto-Upgrade/retry-inheritance contract; other broker/workflow failure families remain queued.
```

## Edit 2 alone (line 21) — round-68 frontier advance appended

```diff
--- a/PROVINCE.md
+++ b/PROVINCE.md
@@ -18,7 +18,7 @@
 
 - OMP harness contract (task batch, agent hub, agent discovery) — first entry `corpus/knowledge/omp-task-contract.md` (round 34); the docs track upstream `main` while the host runs the installed `omp` binary (skew named in the entry).
 - OMP harness contract, installed-release measurement (same frontier band as the line above) — advanced round 65 by `corpus/knowledge/omp-installed-release-mcp-runtime.md` (S201–S206): the installed release `omp/18.12.6` read at its own tag (`v18.12.6`, commit `45c35e40`) and measured on the host by `scripts/omp-binary-probe.sh` — two MCP clients in one binary on two revisions, a header that is absent until negotiation, the wrapper that mediates every reading; the docs-versus-binary question for task/hub semantics stays open in the round-34 entry (append-only `Amendment 2026-10-25`).
-- MCP protocol revisions as they bear on orchestration — first entry `corpus/knowledge/mcp-orchestration-contract.md` (round 59, S125/S127/S136): per-request identity in `_meta`, durable task creation, and the removal of the session handshake; other MCP revision families remain queued.
+- MCP protocol revisions as they bear on orchestration — first entry `corpus/knowledge/mcp-orchestration-contract.md` (round 59, S125/S127/S136): per-request identity in `_meta`, durable task creation, and the removal of the session handshake — advanced round 68 by `corpus/knowledge/mcp-deprecation-registry.md` (S207–S213): the Deprecated registry, its two clocks (registry window vs SEP grace), and the installed-release bearing; other MCP revision families remain queued.
 - Isolation substrates for parallel agents (git worktrees, harness isolation backends, jj workspaces) — first entry `corpus/knowledge/agent-isolation-substrates.md` (round 45, exploratory): seat-containment rules derived from their mechanisms with demos; harness isolation is off on this host; jj workspaces advanced in round 64 by `corpus/knowledge/jj-workspace-seat-containment.md` — the first demonstrated jj-workspace seat-containment ground (mechanism M7 measured by `scripts/jj-seat-demo.sh`: one shared operation log, staleness that follows the seat's tree, `update-stale` recovery that deletes the abandoned files, no filesystem boundary), appended to the round-45 entry as `Amendment 2026-10-25`.
 - Durable-execution and multi-agent failure research (idempotency, timeouts, failure taxonomies) — first entry `corpus/knowledge/at-least-once-dedupe.md` (round 54; S106/S107): delivery identity and claim/repend; advanced round 55 by `corpus/knowledge/bounded-redelivery-budgets.md` (S109/S110/S111): the bound side — broker delivery-limit/dead-letter, consumer commit ordering, client-side retry budgets; advanced round 56 by `corpus/knowledge/visibility-lease-ack-deadlines.md` (S113/S114/S115): the lease slot — visibility timeout / ack deadline; advanced round 57 by `corpus/knowledge/worker-heartbeat-liveness.md` (S117/S118/S119): the liveness signal — worker heartbeats, session timeouts, platform probes; advanced round 60 by `corpus/knowledge/durable-execution-and-fanout-primitives-2026-10-24.md` (S190/S194): the two primitives the band was missing — compensating action as a saga, tail tolerance as the slowest seat's cost — and by `corpus/knowledge/durable-execution-failure-detection.md` (S126/S131/S133/S134/S135): the three shapes of "durable" and where the guarantee breaks; advanced round 61 by `corpus/knowledge/temporal-worker-versioning-pinning.md` (S195): the version boundary for Pinned Workflows and the narrower Auto-Upgrade/retry-inheritance contract; other broker/workflow failure families remain queued.
 - Multi-agent coordinator topology — orchestration topology **decisions** (how a wave's seats are arranged: which topology, what a coordinator may delegate, what the arrangement costs), not agent evaluation — first entry `corpus/knowledge/multi-agent-coordinator-topologies.md` (round 63, S196/S197): a vendor's managed-agent coordinator contract beside the measured scaling study of agent-system topologies, version-pinned to arXiv 2512.08296 v3; adjacent, not absorbed: kengaku evaluates agents, this lane arranges the seats around that judgment; recursion, nested rosters and cost per topology stay unspecified by both sources.
```

## Resulting line 20 (verbatim, for line-length review)

```
- OMP harness contract, installed-release measurement (same frontier band as the line above) — advanced round 65 by `corpus/knowledge/omp-installed-release-mcp-runtime.md` (S201–S206): the release installed then, `omp/18.12.6`, read at its own tag (`v18.12.6`, commit `45c35e40`) and measured on the host by `scripts/omp-binary-probe.sh` — two MCP clients in one binary on two revisions, a header that is absent until negotiation, and a wrapper that mediated every reading of that release; that wrapper picture is now history: the host installs `omp/18.13.1` (upstream tag `v18.13.1` = `0838d2ab`, asset byte-identical), `~/.local/bin/omp` **is** the release binary (direct ELF, 275986608 bytes, sha256 `ee2961c7…`) and `~/.local/bin/omp.real` does not exist, so nothing stands between a reading and the binary (round-66 host-drift: `wrapper_is_script` 1→0, `wrapper_names_real` omp.real→none; the probe now needs `OMP_BIN_REAL=$HOME/.local/bin/omp` — a bare run fails closed `real-unidentified`, exit 2); the round-65 at-tag measurement and its 18.12.6 byte counts stand as history; the docs-versus-binary question for task/hub semantics stays open in the round-34 entry (append-only `Amendment 2026-10-25`).
```

## Resulting line 21 (verbatim)

```
- MCP protocol revisions as they bear on orchestration — first entry `corpus/knowledge/mcp-orchestration-contract.md` (round 59, S125/S127/S136): per-request identity in `_meta`, durable task creation, and the removal of the session handshake — advanced round 68 by `corpus/knowledge/mcp-deprecation-registry.md` (S207–S213): the Deprecated registry, its two clocks (registry window vs SEP grace), and the installed-release bearing; other MCP revision families remain queued.
```

## Why edit 1 says what it says

- The line currently asserts two things that are false on this host: that `omp/18.12.6` is "the installed release"
  and that "the wrapper" "mediates every reading". Round-67 spotcheck (`corpus/lessons/round-67-verifier-spotcheck.md:47,60,73`)
  routed this as R67-V4; the round-68 plan re-declares the repair (`plan.md:21`).
- Host, measured this seat (2026-10-27): `~/.local/bin/omp` is an ELF (275986608 bytes, sha256 `ee2961c7…`),
  `~/.local/bin/omp.real` is absent, `omp --version` → `omp/18.13.1`. Round-66 drift table
  (`.ufo/waves/round-66/build/K66ExecOmpRerun/host-drift-table.md:8-11,36-37`) records the same transition
  (`wrapper_is_script` 1→0, `wrapper_names_real` omp.real→none) and pins upstream `v18.13.1` = `0838d2ab4407b74e870de07e1a6780a13c7d542c`.
- The round-65 **at-tag measurement is kept named as history**, as instructed: `omp/18.12.6` at tag `v18.12.6`
  (commit `45c35e40`), its two MCP clients, its header-absent-until-negotiation finding, and its 18.12.6 byte counts.
  Only the tense/ownership changes: "the release installed then … a wrapper that mediated every reading of that release".
- Added, because it is an operability fact the band line should not hide: the lane's own instrument
  `scripts/omp-binary-probe.sh` now **needs** `OMP_BIN_REAL=$HOME/.local/bin/omp`; a bare run fails closed
  `real-unidentified` (exit 2) — see finding K68ScribeProvince-2.
- `**is**` (bold) mirrors the file's existing emphasis style: `**Domain:**` (`PROVINCE.md:3`), `**Owns:**` (`:5`) and the
  inline `**decisions**` in a band line (`:24`).

## Why edit 2 says what it says

- Wording is the assignment's sentence, verbatim, with the path in backticks for house style (every other band line
  backticks its entry path). A substring search for `mcp-deprecation-registry` — what the frozen counter does,
  `probe/deprec68-probe.mjs:345` (`prov.includes('mcp-deprecation-registry')`) — is satisfied either way.
- Placement is convention-consistent: the line's trailing clause "other MCP revision families remain queued." is the
  band's open-items remark, and every other multi-entry band appends *before* its trailing remark (cf. `PROVINCE.md:23`
  durable-execution band, where "advanced round 60/61 by …" precede "other broker/workflow failure families remain queued.").
  If the L1 prefers a literal end-of-line append, move the same sentence after that clause; both satisfy M9.
- Separator kept as ` — ` (em dash), matching the band's " — advanced round N by …" pattern.

## Integration notes (for the L1)

- **Ordering with C2:** `deprec68-probe.mjs` M9 reads `PROVINCE.md` from the archive and only checks the substring, so
  this edit is safe to land before or with `corpus/knowledge/mcp-deprecation-registry.md`; M1 is the check that needs the
  entry itself. No ordering hazard, but landing them in one revision keeps PROVINCE from naming a non-existent entry.
- **No other gate reads PROVINCE's corpus paths:** `scripts/cite-check.mjs:176` lists `PROVINCE.md` in `SELF_DOCS`, so
  the new `corpus/knowledge/mcp-deprecation-registry.md` mention is not citation-checked from here.
- **Scope discipline:** this draft touches only lines 20 and 21. `PROVINCE.md:19` ("the docs track upstream `main` while
  the host runs the installed `omp` binary") remains true and is deliberately unchanged.
- **Not fixed here (out of scope, reported):** `corpus/knowledge/omp-installed-release-mcp-runtime.md` still states the
  wrapper in the present tense (see finding K68ScribeProvince-3). After this patch lands, PROVINCE and that entry
  disagree unless the entry gains an `Amendment 2026-10-27`.

## Instrument follow-ups (reported, deliberately not patched here)

The band line now names the call convention that works today. The instrument itself still carries the wrapper-era
assumption, and this seat does not own `scripts/`:

- `scripts/omp-binary-probe.sh:56-64` resolves the release as `$OMP_BIN_REAL` → else `$HOME/.local/bin/omp.real` *only when
  the file at `$W` names `omp.real`* → else `fail real-unidentified`. With no wrapper on the host, a bare run exits 2
  (receipt `probe-bare.txt`). Zero-risk fix, recommended: nothing in the code; name the convention in the entry's
  `recheck:` line (currently `corpus/knowledge/omp-installed-release-mcp-runtime.md:3`) as
  `OMP_BIN_REAL=$HOME/.local/bin/omp bash scripts/omp-binary-probe.sh`.
- If instead the probe should fall back to `$W` when `$W` is not a script: that changes two arms of its own control.
  `arms.sh:177` (A02b, wrapper without `BIN=`, no override) still passes (its fixture wrapper is a script, so
  `head -c 2` = `#!`), but `arms.sh:193` (A10, `HOME` unset, no overrides) expects `real-unidentified` and would begin
  succeeding unless the fallback keeps a `HOME` guard. Any such change MUST re-run the suite and re-declare the arms.
- Bigger, separate drift (round-65 fixture, not this claim): `arms.sh:22` defaults `TARGET` to
  `.ufo/waves/round-65/build/K65ExecOmpRobust/omp-binary-probe.v2.sh`, which is *not* the live script
  (`sha256 cbe63e88…` vs `ce12d748…` live; 15-key contract vs 22 keys). The negative control currently controls a stale
  copy; `TARGET=scripts/omp-binary-probe.sh bash arms.sh` (with scratch redirected) would re-point it.
- `arms.sh:24` defaults `SCRATCH=/tmp/kumitate-r65/…` and writes `arms-table.txt` next to itself, both outside a wave
  seat's write scope — the reason this seat did not execute the suite (see the report's `## Limits`).

## Verification of the draft itself

- `patch -p1 --dry-run -i province-edits.patch` in a copy of the base file → `rc=0 checking file PROVINCE.md`.
- `patch -p1 -i province-edits.patch` → `rc=0 patching file PROVINCE.md`; applied file is byte-identical to `province-new.md` (`APPLIED==DRAFT True`).
- `git apply --check` inside a `git clone --shared` sandbox of the lane (toplevel asserted) → `rc=0`;
  `git apply --stat` → `PROVINCE.md | 4 ++-- / 1 file changed, 2 insertions(+), 2 deletions(-)`.
- Draft is a pure line replacement: line count unchanged (31), only lines 20 and 21 differ.
