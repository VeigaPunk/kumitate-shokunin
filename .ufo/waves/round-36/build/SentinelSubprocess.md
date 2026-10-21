SENTINEL subprocess sites=5 misreport=11

# Scope and reviewed snapshot

Lane 0614092 + the build-wave executor lane files as they stood when this seat ran (no integration).
Read-only; all probes ran in `/fast/scratch/kumitate-r36/w/SentinelSubprocess/`, upstream bytes were
read only through `/fast/scratch/kumitate-r36/src` (a-w). `sites` = the five subprocess execution
sites in the two gates under review; `misreport` = the D1–D11 rows below, each a concrete way the
gate prints a verdict that contradicts the bytes it scored or the child's actual result.

| # | Site | Anchor (as reviewed) | argv | env | timeout / caps | cwd | crash reads as reachable? |
|---|---|---|---|---|---|---|---|
| S1 | dispatcher `status` (new) | `scripts/surface-probe.mjs` → `readDispatcherStatus()` (spawn + `env` block inside) | `[host,'status']`, no shell | `{...process.env, UFO_STATE_DIR, UFO_PENDING_WORK_PATH, UFO_PROJECT_ROOT}` | 20 s / 8 MiB | `src` | no (error→fail, status≠0→fail) |
| S2 | sighting shim (unchanged) | `scripts/surface-probe.mjs` → `readSightingSurface()` | `bash [host,'surface','--json']` | full `process.env` inherited | 20 s / 8 MiB | `src` | no |
| S3 | SKILL checklist (unchanged) | `scripts/surface-probe.mjs` → `runChecklistsMode()` | `bash -c <SKILL command>` | full `process.env` inherited | 120 s / 8 MiB | `self` | no (`status` null ⇒ exitOk false) |
| S4 | pin `git rev-parse HEAD` (new, **not yet integrated**) | ExecSurfacePin/lane `scripts/surface-probe.mjs` → `readGitHead()` | `['git','-C',dir,'rev-parse','HEAD']` | full `process.env` inherited | 20 s / 8 MiB | inherited (irrelevant with `-C`) | no |
| S5 | pin `git rev-parse HEAD` (new, **integrated**) | `scripts/proxy-check.mjs` → `gitHead()` | same | `{...process.env, GIT_OPTIONAL_LOCKS:'0', GIT_TERMINAL_PROMPT:'0'}` | 30 s / Node default 1 MiB | inherited | no (`null` ⇒ `SRC_REV_UNVERIFIABLE`, exit 2) |

Integration status at write time: S1 + S5 are in the lane working tree; S4 (surface-probe `--pin`) is
only in ExecSurfacePin's lane. The lane working tree was being integrated while this seat ran, so line numbers inside
newly added functions move; the function names above are the durable anchors (upstream
`fleet-dispatcher.mjs` line numbers are pinned at 31c465f1 and stable).

# Defects (each with the scenario that misreports)

| id | sev | site | scenario (observed unless marked) | impact | smallest remediation |
|---|---|---|---|---|---|
| D1 | High | S4 | Clone at the pin with one uncommitted edit — `git -C dirty status --porcelain` = ` M scripts/fleet-dispatcher.mjs`; probe (--pin, --src=dirty) prints `src-rev=31c465f15669` (`dirty-pin.txt:4`) and then **executes** that edited dispatcher. | The pin proves commit identity, not the scored bytes: any writable/edited clone gets a verdict naming a revision it did not score, and uncommitted JS runs under the gate's env. Directly falsifies C1's "every verdict names the revision it scored". | In `assertPinnedRevision`, also run `git -C <src> status --porcelain=v1 -uno` (or `diff-index --quiet HEAD --`) and refuse `SRC_TREE_DIRTY` (exit 2). Verified that command reports ` M …`. |
| D2 | High | S4 | `GIT_DIR` inherited overrides `-C`: `GIT_DIR=/tmp/gitlab/a/.git git -C /tmp/gitlab/b rev-parse HEAD` → `0a65cb00…` (a's HEAD), not b's `11bd5ba2…`. End-to-end: `GIT_DIR=/tmp/gitlab/b/.git` + a pin whose revision is b's HEAD, scored tree = the 31c465f1 dirty clone → probe prints `src-rev=11bd5ba22e88` (`gitdir-bypass.txt:4`), no refusal. | Pin satisfied by an unrelated repository — false pass, and the verdict names a tree that was never scored. `GIT_WORK_TREE`/`GIT_OBJECT_DIRECTORY`/`GIT_CONFIG_*` are the same class. | Spawn git with an allowlisted env (`{PATH,HOME,LANG,LC_ALL,GIT_OPTIONAL_LOCKS:'0',GIT_TERMINAL_PROMPT:'0'}`); never spread `process.env`. |
| D3 | High | S5 | Identical: same decoy `GIT_DIR`, scored tree 31c465f1, verdict `PROXY: DRIFT (…; src-rev=11bd5ba22e88)` (`proxy-gitdir.txt:5`). The tool's own contract paragraph says "the pin's git child gets `GIT_OPTIONAL_LOCKS=0`/`GIT_TERMINAL_PROMPT=0` **only**" (`scripts/proxy-check.mjs:278`), while `gitHead` spreads `process.env` (`:382`) — the code does not implement its documented env bound. | Same false pass in the proxy gate; the attestation it stamps is not the scored tree. | Same env scrub, shared with S4 (one helper so the two gates cannot drift); the doc sentence becomes true once the spread is gone. |
| D4 | Med | S1 | Caller shell exports `UFO_FLEET_LEDGER_PATH` (a supported override the repo's own harness sets, e.g. `.ufo/waves/round-35/falsify/SecFleetSelfhealVerify.md:31`; un-gated upstream at `fleet-dispatcher.mjs:90`); the child runs `assertLedgerPath()` (`:458-475`, `:8949`) and exits 1 with `UFO_FLEET_LEDGER_PATH must stay under /tmp/sent-probe/ufo`. `readDispatcherStatus` maps that to `ok:false` ⇒ `SURFACE_UNREACHABLE` error ⇒ DRIFT on a clean pinned tree. | The gate re-scores differently per shell; the same tree is CLEAN or DRIFT depending on ambient env, and the verdict blames the source. | Same allowlist: drop every `UFO_*` key, then set the three sandbox vars. Verified sufficient: `env -i PATH HOME TMPDIR LANG + the 3 UFO vars` ⇒ status exit 0, `ok:true` (`c-out.json`). |
| D5 | Med | S1 | Inherited `UFO_FLEET_ALLOW_EXTERNAL_TOOLS=1` disables `gatedExecPath` (`:63-82`), so an inherited `UFO_CONFIG_PATH`/`UFO_SIGHTING_PATH` outside the root is accepted and the child reads a foreign `config/ufo.json` (queuePath, `globalRunnerCeiling`, routing). [INFERENCE on today's verdict effect — shape-only checks hide it] | The scored child's policy can be substituted by ambient env while the verdict claims the pinned tree's contract. | Same allowlist (D4); the flag must never reach a gate-spawned child. |
| D6 | Low-Med | S1 | Under the sandbox the child **always** reports `routing:{ok:false,code:"routing_unavailable"}` (`b-out.json`): config declares `sighting.dispatch.queuePath=.ufo/pending-work.json` under ROOT while `UFO_STATE_DIR` is the temp dir, so `dispatchPolicy()` refuses. `STATUS_SHAPE` passes. | A genuine routing fault is indistinguishable from the probe's own artifact; any future check on `routing.ok` reads a false error. | Print an explicit note (`STATUS_ROUTING_SANDBOXED`) asserting exactly that code, and never gate on `routing.ok` under the sandbox. |
| D7 | Med | S1 | Partial implementation (only `UFO_STATE_DIR`, `UFO_PENDING_WORK_PATH` forgotten): `queuePathForReport` (`:4458-4470`) refuses with `sighting.dispatch.queuePath must stay under .ufo`, exit 2 (`a-out.json`) ⇒ false UNREACHABLE. | A half-landed fix reads as a source defect, not an env defect. | Keep the three overrides inseparable (the executor's fixture already asserts `pending`); add a selftest that removes `UFO_PENDING_WORK_PATH` and expects the sandbox to still be applied. |
| D8 | Med | S1 | The dispatcher's **pre-dispatch** `sweepOrphanTmpFiles()` (`:8902-8941`, called at `:8955`) deletes stale `*.tmp` and `*.lock.stale.*` under `dirname(queueFile())`/`dirname(LEDGER_PATH)`. Writable copy, default env: status removed `.ufo/pending-work.json.4242.1.tmp`, `.ufo/fleet-ledger.jsonl.4242.2.tmp` and `.ufo/pending-work.json.lock.stale.4242.aaaa` (before/after `find` above). With the full contract env the same three survive (`wtree-b`). On the a-w pin the deletes fail EACCES and are swallowed (`:8934`,`:8939`). | The "read-only status" property holds only if the env is fully sandboxed; otherwise the probe mutates the tree it scores — the C1(b) defect. Worse, the executor's mtime+list proof on the a-w clone is **blind to deletions**, so an incomplete sandbox passes that proof. | Keep `UFO_PENDING_WORK_PATH` (load-bearing — it is what moves the sweep to the temp root) and prove no-mutation on a **writable copy** of the pin (full list+size+mtime diff, deletions included). |
| D9 | Low | S1 | `mkdtempSync(join(tmpdir(),…))` (`:430`) uses the inherited `TMPDIR`. If `TMPDIR` resolves inside `--src`, the state root is created inside the scored tree and `rmSync` deletes it there. [INFERENCE] | Self-inflicted mutation of the scored tree plus a misleading "untouched" pass. | Refuse a tmpdir beneath `src` (fall back to `/tmp`) and assert non-containment in the reader. |
| D10 | Med | S4/S5 | `git -C` discovers a parent repo: `git -C /tmp/gitlab/b/sub rev-parse HEAD` → `/tmp/gitlab/b`'s HEAD. `GIT_CEILING_DIRECTORIES=/tmp/gitlab/b` blocks it; `rev-parse --show-toplevel` = `/tmp/gitlab/b` ≠ `sub`. A copied (non-git) tree placed inside any repo therefore reads as verifiable. | A copy used as `--src` can pass the pin (false pass if the parent sits at the pin) or fail as `SRC_REV_MISMATCH` instead of `SRC_REV_UNVERIFIABLE`, misdirecting blame for the wrong tree. | Require `git -C <src> rev-parse --show-toplevel` == realpath(src) (same spawn: `rev-parse --show-toplevel HEAD`), and set `GIT_CEILING_DIRECTORIES`, `GIT_DISCOVERY_ACROSS_FILESYSTEM=0`. |
| D11 | Low-Med | S2/S3/S4/S5 | Interpreter resolved by PATH (`'git'`, `'bash'`). A shim earlier in PATH answers `rev-parse HEAD` with the pin and receives the full inherited env. [INFERENCE] | Pin defeated without touching the tree; env (tokens, agent sockets) exposed to whatever the shim is. | Resolve `git`/`bash` from a fixed absolute candidate list; D2's env scrub also caps exfiltration. |

# What holds (no defect found)

- **Argv construction is shell-free** at every site: `shell:true` never appears; `dir`/`host` are separate argv elements (so paths with spaces/quotes are inert), and `--src`/`--pin` are `resolve()`d inside `parseArgs` in both gates.
- **Exit interpretation is fail-closed**: every reader checks `result.error` first, then `status !== 0`; timeout/SIGKILL gives `status === null` ⇒ not ok. A crashed or timed-out child therefore reads as *unreachable*, never as reachable. `readGitHead` additionally requires stdout to be exactly 40 hex after trim, so warnings/multi-line output cannot pass.
- **Output caps**: 8 MiB `maxBuffer` + 20 s on the dispatcher and surface git spawn; overflow surfaces as `result.error` ⇒ not ok. Proxy's git spawn has no `maxBuffer` (Node default 1 MiB) — ample for 40 bytes.
- **Cleanup**: `readDispatcherStatus`'s `finally` does `rmSync(stateRoot,{recursive:true,force:true})` on every path; `mkdtemp` gives a unique 0700 root; after the run only the state root itself remained, not `ufo/...` children.
- **`cwd: src` is not load-bearing**: the child's `ROOT` comes from `UFO_PROJECT_ROOT` / its own module dir (`fleet-dispatcher.mjs:41`), and every state path is `resolve()`d, so cwd cannot redirect a read today. It does mean any *relative* path a future dispatcher line introduces resolves inside the scored tree — keep every path absolute.
- **Pin refusal precedes every surface read** (`main()` pin block in ExecSurfacePin's lane, before `probeConformance`; once integrated) and exits 2; `--selftest`/`--checklists` never load a pin. A non-git `--src` refuses correctly: `SURFACE_PROBE: FAIL-CLOSED (SRC_REV_UNVERIFIABLE …)` (`notrepo.txt`).
- **S2 inherits the full env but is behaviorally inert**: the `surface` verb is a pure in-memory manifest render (`ufo-sighting.mjs:4484-4494`); it takes no lock and writes nothing.

# Siblings / landing state

`scripts/proxy-check.mjs --pin` **is already integrated** — D3 is live in the production gate today.
`scripts/claims-check.mjs --pin` had no code at review time (ExecClaimsFidelity lane clean); it must
carry both invariants above (D2/D3 env scrub, D1/D10 worktree + toplevel) or C1(d) ships a third
instance of the same bypass.

Prose overclaim: the new SKILL.md paragraph says the pin-aware gates "assert that clone's `HEAD`
equals the pinned revision … so no gate writes into the tree it reads". HEAD equality does **not**
establish the bytes (D1), and read-only-ness of `status` depends on the env sandbox holding (D8). The
checklist text should say "asserts the clone's HEAD and that its tracked tree is clean" once
`SRC_TREE_DIRTY` exists, and "runs the read verbs against a throwaway state root" rather than the
unqualified "no gate writes".

# Commands run (key outputs)

```
# dispatcher pre-dispatch sweep deletes in a writable tree (default env)
node wtree/scripts/fleet-dispatcher.mjs status   # exit 0; three stale orphans gone (find before/after)
# full sandbox env => same orphans survive, state root created only in /tmp
UFO_STATE_DIR=…/uB UFO_PENDING_WORK_PATH=…/uB/pending-work.json UFO_PROJECT_ROOT=$PWD node … status  # ok:true
# state-only (partial) => exit 2, "queuePath must stay under .ufo" (a-out.json)
# inherited UFO_FLEET_LEDGER_PATH => exit 1, "must stay under /tmp/sent-probe/ufo"
# minimal allowlisted env (PATH HOME TMPDIR LANG + 3 UFO vars) => exit 0, ok:true (c-out.json)
# git env inheritance
GIT_DIR=/tmp/gitlab/a/.git git -C /tmp/gitlab/b rev-parse HEAD  # a's HEAD, not b's
git -C /tmp/gitlab/b/sub rev-parse HEAD                         # parent repo's HEAD (discovery)
GIT_CEILING_DIRECTORIES=/tmp/gitlab/b git -C …/sub rev-parse HEAD  # 128
# end-to-end
node …/surface-probe.mjs --self … --src …/dirty --pin pin1.json     # src-rev=31c465f15669 (dirty tree)
GIT_DIR=/tmp/gitlab/b/.git node …/surface-probe.mjs … --pin pin2.json  # src-rev=11bd5ba22e88
GIT_DIR=/tmp/gitlab/b/.git node …/proxy-check.mjs … --pin pin2.json    # PROXY: DRIFT (…; src-rev=11bd5ba22e88)
```

Tooling: nothing installed or upgraded. No writes outside this report and
`/fast/scratch/kumitate-r36/w/SentinelSubprocess/`.
