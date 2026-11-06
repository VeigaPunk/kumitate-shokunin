# kumitate-shokunin — Province

**Domain:** orchestration & tooling — scopes OMP task/hub, ufo-fsd scripts & runtime

**Owns:** the domain knowledge, playbooks, error patterns, and checklists above.
**Refuses:** anything outside this domain; report cross-domain evidence back to the orchestrator rather than absorbing it.

## Province bands (appended round 34, 2026-10-19; the lines above stand unchanged)

### Core — governed at member level, gated

- Origin script layer `/home/vgpnk/Projects/ufo-fsd-alpha/scripts/` — registry rows S1–S8 (`SCORECARD.md` §In-scope surface registry), gated by `scripts/claims-check.mjs` + `scripts/proxy-check.mjs` (`coverage_script`).
- Origin runtime layer `/home/vgpnk/Projects/ufo-fsd-alpha/crates/ufo-core-runtime/src/` + `crates/ufo-cli/src/` — rows R1–R11, same gates (`coverage_runtime`).
- Kimi Code substrate `~/.kimi-code/` — rows K1–K5, gated by `scripts/kimi-census.mjs` (member set; secret members shape-only) + `scripts/proxy-check.mjs` (`coverage_kimi`).
- The lane's own instruments `scripts/*.mjs` (registry: `SKILL.md` §Gate registry) and its learning registry `corpus/SOURCES.md` (checked by `scripts/sources-check.mjs`).
- The OMP harness agent plane `~/.omp/agent` — depth-1 members only (names, kinds, permission bits), gated by `scripts/omp-census.mjs` (`kumitate-omp-census-v1`: base members + chain families + the note-binding arm) with `corpus/knowledge/omp-agent-root.md` as its internals-level note; entered core in round 75 when the last 40 undeclared members were declared and bound (`coverage:omp` 3 → 10). Member **content** stays out of scope by design (readdir + lstat only).

### Frontier — named ground, entered by sourced entries, not yet gated

- OMP harness contract (task batch, agent hub, agent discovery) — first entry `corpus/knowledge/omp-task-contract.md` (round 34); the docs track upstream `main` while the host runs the installed `omp` binary (skew named in the entry).
- OMP harness contract, installed-release measurement (same frontier band as the line above) — advanced round 65 by `corpus/knowledge/omp-installed-release-mcp-runtime.md` (S201–S206): that entry measured `omp/18.12.6` at its tag (`v18.12.6`, commit `45c35e40`) and on the host then, through a wrapper; the wrapper has since been removed, and the current installed `omp/18.13.1` is the direct ELF measured in round 66. The two MCP clients and two protocol revisions remain historical findings; the docs-versus-binary question stays open in the round-34 entry (append-only amendment 2026-10-25).
  - second entry corpus/knowledge/mcp-deprecation-registry.md (round 68, S207-S213) — the Deprecated table at 2026-07-28, the revision-anchored policy floor, the SEP-2596 grace elapsed on 2026-09-03, and the legacy HTTP+SSE transport still present in source at the installed release omp/18.13.1.
- Isolation substrates for parallel agents (git worktrees, harness isolation backends, jj workspaces) — first entry `corpus/knowledge/agent-isolation-substrates.md` (round 45, exploratory): seat-containment rules derived from their mechanisms with demos; harness isolation is off on this host; jj workspaces advanced in round 64 by `corpus/knowledge/jj-workspace-seat-containment.md` — the first demonstrated jj-workspace seat-containment ground (mechanism M7 measured by `scripts/jj-seat-demo.sh`: one shared operation log, staleness that follows the seat's tree, `update-stale` recovery that deletes the abandoned files, no filesystem boundary), appended to the round-45 entry as `Amendment 2026-10-25`.
- Durable-execution and multi-agent failure research (idempotency, timeouts, failure taxonomies) — first entry `corpus/knowledge/at-least-once-dedupe.md` (round 54; S106/S107): delivery identity and claim/repend; advanced round 55 by `corpus/knowledge/bounded-redelivery-budgets.md` (S109/S110/S111): the bound side — broker delivery-limit/dead-letter, consumer commit ordering, client-side retry budgets; advanced round 56 by `corpus/knowledge/visibility-lease-ack-deadlines.md` (S113/S114/S115): the lease slot — visibility timeout / ack deadline; advanced round 57 by `corpus/knowledge/worker-heartbeat-liveness.md` (S117/S118/S119): the liveness signal — worker heartbeats, session timeouts, platform probes; advanced round 60 by `corpus/knowledge/durable-execution-and-fanout-primitives-2026-10-24.md` (S190/S194): the two primitives the band was missing — compensating action as a saga, tail tolerance as the slowest seat's cost — and by `corpus/knowledge/durable-execution-failure-detection.md` (S126/S131/S133/S134/S135): the three shapes of "durable" and where the guarantee breaks; advanced round 61 by `corpus/knowledge/temporal-worker-versioning-pinning.md` (S195): the version boundary for Pinned Workflows and the narrower Auto-Upgrade/retry-inheritance contract; other broker/workflow failure families remain queued.
- Multi-agent coordinator topology — orchestration topology **decisions** (how a wave's seats are arranged: which topology, what a coordinator may delegate, what the arrangement costs), not agent evaluation — first entry `corpus/knowledge/multi-agent-coordinator-topologies.md` (round 63, S196/S197): a vendor's managed-agent coordinator contract beside the measured scaling study of agent-system topologies, version-pinned to arXiv 2512.08296 v3; adjacent, not absorbed: kengaku evaluates agents, this lane arranges the seats around that judgment; recursion, nested rosters and cost per topology stay unspecified by both sources.

Round-69 frontier amendment: the existing MCP deprecation-registry entry now governs live byte agreement for captures and commit-pinned upstream mirrors S214–S216. This is provenance checking, not an independent source authority or an MCP security audit.

### Adjacent — reported, never absorbed

- MCP/OAuth security practice (token passthrough, confused deputy) → kasegi / kagi.
- Local model serving and endpoints → kama. Prompt and skill craft → kotoba. Research method → chousa.
- Upstream defects in `/home/vgpnk/Projects/ufo-fsd-alpha` → filed in lane reports for the operator; never patched from here.

Round-70 host correction (2026-10-31, attempt 3; the bands above stand unchanged for the origin host, recorded here as absent where they do not exist here): this lane now runs on a Windows host (`C:/Users/jpvei/...`, Git Bash, node 24). Absent here, recorded with date: the origin script and runtime layers `/home/vgpnk/Projects/ufo-fsd-alpha/…` (no `/home/vgpnk` at all), and the installed `omp` binary (no `omp` on PATH; `C:/Users/jpvei/AppData/Local/omp` is an empty directory) — the coverage:script-layer / coverage:runtime-layer proxies keep their frozen readings at the pinned origin commits and are unmeasurable here until the origin is reachable. Present with a different shape: the Kimi substrate `~/.kimi-code/` carries 5 entries (`bin/`, `skills/`, `device_id`, `mcp.json`, `region`, plus one `.bak` file and a stray `mcp.json.before-kimi-cu-cleanup…` backup — 7 top-level paths, not the origin host's 27-member shape), so the coverage:kimi-layer census is a different-host reading, not a drift verdict; and a new surface exists: `~/.omp/agent` (the ZCode-side agent session store the inline-dispatch-evidence gate reads). The lane's own instruments run lane-local on this host; the round-70 replay instrument carries its host adapters (win32 tar backslash shim, conditional python3 shim, `PYTHONUTF8=1`, `MSYS=winsymlinks:nativestrict`) in the receipt record.

Round-72 host correction (2026-11-01; the paragraph above stays as written, dated additions only): `jj` is absent on this host (`bash scripts/jj-seat-demo.sh` → `JJ_SEAT_DEMO: FAIL-CLOSED jj-absent`; the round-64 jj-workspace frontier entry and its demo are origin-host ground, unrunnable here); `node scripts/kimi-census.mjs` crashes on win32 node (`TypeError: process.getuid is not a function`, `scripts/kimi-census.mjs:258`) so the kimi-layer census is not merely a different reading but unrunnable here pending a versioned repair; and `node scripts/proxy-check.mjs` reads `PROXY: FAIL-CLOSED (SRC_NOT_A_DIR) --src C:\fast\scratch\hyaku\kumitate-pin\src` at the v1 stanza's origin pin. The `plan-before-ready` gate is lane-local and now runs on this host (round-72 path-form normalization); its archive-backed map arm still fails closed here on rounds whose trees carry the round-57 origin-host fixture symlinks (`MAP_UNRUNNABLE reason=ARCHIVE`, repair routed).

Round-73 host correction (2026-11-02; the paragraphs above stay as written, dated additions only): the `plan-before-ready` map arm's ARCHIVE failure is REPAIRED on this host (round-73 `cf58f1d0…`: disclosed sanitized extraction excluding exactly the listed symlink members, fail-closed preserved, `sanitized=<n>` disclosed on sanitized verdicts; rounds 65–71 read real map verdicts, `map=UNRUNNABLE reason=ARCHIVE` 7 → 0, `close/pbr73-green-sweep.txt`); rounds 67/69 now read their honest `MAP_DRIFT` red at their freeze commits. Still routed, unchanged this round: the kimi-census win32 crash (re-confirmed at open, `.ufo/waves/round-73/open/gates-open.txt`; repair scoped as a portability design — the selftest carries POSIX-native arms: cap-run/bwrap gate children, FIFO fixtures, POSIX chmod mode floors — pre-registered candidate for round 74) and the proxy-check `SRC_NOT_A_DIR` FAIL-CLOSED (carried r70).

Round-79 province addition (2026-11-04; the bands above stand unchanged): **report-pointer resolution as
a lane verifier is kotoba's ground** — `kotoba-shokunin/verifiers/check_report_pointers.py` has resolved
a filed report's backticked lane pointers against committed bytes since its round 73, and
`kotoba-shokunin/PROVINCE.md:31` records it. This lane's `scripts/report-receipt-diff.mjs` v4
(`POINTER_DEAD`, round 79) resolves the pointers of **this lane's own round report before filing** — a
deepening of a gate the lane already owned, not a new cross-lane instrument and not an absorption of
kotoba's ground; cross-lane report-pointer checking stays reported, never absorbed. Adjacent, unchanged:
MCP/OAuth security practice → kasegi/kagi; local model serving → kama; research method → chousa.

Round-80 frontier addition (2026-11-04; the bands above stand unchanged): two grounded entries advance
the orchestration/tooling frontier band — `corpus/knowledge/two-reading-verdicts.md` (a tool that reads
one surface and writes another keeps one verdict per surface; S119) and
`corpus/knowledge/snapshot-bound-derived-scores.md` (a score derived from a live operator-owned surface
reads a committed, hash-pinned snapshot by default, live read opt-in; S234). Both are the lane's own
instrument ground, not an absorption of a sibling's: report-pointer resolution stays kotoba's (round-79
addition above), the census/README-map adoption writer stays this lane's, and no sibling's tool is
executed or re-implemented. Unchanged and binding: member content of `~/.omp/agent` is out of scope
(readdir + lstat only), and the OMP live root is read only through an explicit live read.

Round-93 province amendment (2026-11-06; the bands above stand unchanged, dated addition only): **seat
transcripts under `~/.omp/agent/sessions/<cwd>/<orchestrator-session>/<Seat>.jsonl` are read by content** by
the lane's own instrument `scripts/seat-route.mjs` (contracts `kumitate-seat-route-v1`, round 92, and
`kumitate-seat-route-v2`, round 93): per seat it reports the captured route, the answering turns, the retry
fields, the final state and a redacted last error. The read is read-only, and its output is redacted (runs of
24 or more characters from `[A-Za-z0-9_-]` become `<redacted>`, first line, 120-character cut); a transcript
is never copied into the lane — a citation is path plus sha256 and at most the fields a claim needs. This
paragraph glosses the two "member content stays out of scope (readdir + lstat only)" sentences at
`PROVINCE.md:16` and `PROVINCE.md:57` as scoped to the **depth-1 member set** of `~/.omp/agent`, and that
bound is unchanged: `scripts/omp-census.mjs` still reads names, kinds and permission bits only, and no census
surface reads content. The `sessions/` subtree is an input to a named instrument, not a widening of the
census and not a live read of the OMP root — that root still requires an explicit live read. Redaction is
shape-based, not a secret scanner; its limits are recorded in
`corpus/knowledge/seat-route-from-session-transcripts.md` (v1) and
`corpus/knowledge/seat-route-retry-fields.md` (v2). Adjacent and unchanged: report-pointer resolution stays
kotoba's, MCP/OAuth practice stays kasegi/kagi's, local model serving stays kama's.
