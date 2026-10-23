RESULT MutSpawnDropBind verdict=KILLED (health conjuncts) routing-predicate=SURVIVED counter_bind_blind=true

Axis: operability, control only (pre-data, not a C1 candidate score). The assigned hypothesis — "the child still runs capped, so the counter reads HELD" — is **half confirmed and half falsified by measurement**: the counter's *routing* clause reads HELD at all four sites (`capped/n` equals the base counts at every site in every run, `uncapped_direct=0`), but the counter as a whole reads `ROUTED_MISS` 0/4 because the bind drop collapses both gates' own suites, tripping the four *health* conjuncts (`gate_exit=1`, `no_final_verdict_pass`, `fail_lines=52|4`, `selftest_cases_below_base`). The functional harm the seat predicted is real and is caught — but by the gate-health proxy, not by routing. Where the bind drop is functionally inert for the owning gate's suite (measured at SP491 and SP519), **nothing** catches it: the counter has no `--bind` check, `cap-spawn` has no selftest, and the only direct bind coverage is `cap-run`'s own runner-level case (`scripts/cap-run.mjs:351-364`), which still passes because the runner honours `--bind` and only the shim drops it.

## Mutant and expected detector

- Sandbox clone: `/fast/scratch/hyaku/kumitate-r48a/seats/kumitate-r48-MutSpawnDropBind/lane`, `git clone --no-hardlinks`, detached at freeze `fe3d45bf929246915c8c0de5f7f8682b5015b22c`; `GIT_DIR`, `GIT_WORK_TREE`, `GIT_INDEX_FILE` unset for every command.
- Pristine comparator: `6291938656d8be31e08a79d03d2436ac5c8268a0` — the freeze commit plus the routed four-site comparator (the attempt-1 routing shape from `build/CtlEnvCaps.patch` patch 1, applied byte-identically: RG742 at `scripts/round-gate.mjs:743-745`, SP491/SP519/SP1592 at `scripts/surface-probe.mjs:492-499,521-533,1595-1598`; `bind: [tmp]`, `bind: [cacheRoot]`, `bind: [stateRoot]`, `bind: [tmp]`). This comparator is not the C1 candidate; it is the minimum routed state in which a bind defect exists at all.
- Mutant commit: `3d21bed66b1b8e1c4d2e25b5a890190e96a17de6` — one deleted line in `scripts/cap-spawn.mjs` (pristine `:35`): `for (const d of bind) argv.push('--bind', d);` is removed, so every `capSpawnSync(..., { bind: [...] })` call silently drops its explicit fixture-directory mounts. One file, one deletion, no other change (`git diff --stat 6291938 3d21bed` → `scripts/cap-spawn.mjs | 1 -`).
- Expected detector (frozen): `node .ufo/waves/round-48/probe/caproute48-probe.mjs <lane> <rev> --set r48`, rule `F48`, counter sha256 `f24a3af55add0708943526435fde93e02f4ef0c9d4b8e494a9111a5fec890cf2` (unchanged before/after; identical to the freeze blob).
- The counter's per-site conjunction (`caproute48-probe.mjs:355-372`) is: no routing reason from `judge()` (`no_capped_scope_ancestor`, `no_cap_run_ancestor`, `uncapped_exec`, …) **and** `status===0`, `n>=1`, `n===base_n`, `capped===n`, `dodge===0`, `execveat===0`, `verdictPass`, `failLines===0`, `pass===total===base_total`.

## Detector runs (pristine / mutant / restored), verbatim

All runs: cwd `/fast/scratch/hyaku/kumitate-r48a/seats/kumitate-r48-MutSpawnDropBind`, node `/home/vgpnk/.local/share/mise/installs/node/latest/bin/node` (`v26.12.0`, the runtime the attempt-1 receipts and the committed stability receipts used), `PATH` prefixed with that bin directory, `/usr/bin/timeout -k 10 1500`.

```sh
node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/probe/caproute48-probe.mjs /fast/scratch/hyaku/kumitate-r48a/seats/kumitate-r48-MutSpawnDropBind/lane 6291938656d8be31e08a79d03d2436ac5c8268a0 --set r48
node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/probe/caproute48-probe.mjs /fast/scratch/hyaku/kumitate-r48a/seats/kumitate-r48-MutSpawnDropBind/lane 3d21bed66b1b8e1c4d2e25b5a890190e96a17de6 --set r48
node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/probe/caproute48-probe.mjs /fast/scratch/hyaku/kumitate-r48a/seats/kumitate-r48-MutSpawnDropBind/lane b51b257c26b3436897af8b1beca3bc7db5b42da9 --set r48
```

### Pristine (comparator) — `r48/kumitate-r48-MutSpawnDropBind-pristine-receipt.txt` (exit 0, load1 47.83)

```text
RUN round-gate base0 exit=0 cases=61/61 execs=1308 resumed=19 verdict_pass=true fail_lines=0
RUN surface-probe base0 exit=0 cases=46/46 execs=54 resumed=1 verdict_pass=true fail_lines=0
SITE RG742 gate=round-gate label=ROUTED_HELD capped/n=116/116,116/116,116/116 base_n=116 cases=61/61,61/61,61/61 base_cases=61/61 uncapped_direct=0,0,0
SITE SP491 gate=surface-probe label=ROUTED_HELD capped/n=2/2,2/2,2/2 base_n=2 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=0,0,0
SITE SP519 gate=surface-probe label=ROUTED_HELD capped/n=2/2,2/2,2/2 base_n=2 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=0,0,0
SITE SP1592 gate=surface-probe label=ROUTED_HELD capped/n=14/14,14/14,14/14 base_n=14 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=0,0,0
CAPROUTE48 rev=6291938656d8be31e08a79d03d2436ac5c8268a0 base=f00cf278 set=r48 held=4/4 runs=3 rule=F48
exit=0 load1=47.83 end=18:25:54Z
```

### Mutant — `r48/kumitate-r48-MutSpawnDropBind-mutant-receipt.txt` (command exit 1; no `exit=`/`load1=` trailer in the file)

```text
RUN round-gate base0 exit=0 cases=61/61 execs=1308 resumed=47 verdict_pass=true fail_lines=0
RUN surface-probe base0 exit=0 cases=46/46 execs=54 resumed=1 verdict_pass=true fail_lines=0
RUN round-gate rev0 exit=1 cases=9/61 execs=1806 resumed=80 verdict_pass=false fail_lines=52
RUN round-gate rev1 exit=1 cases=9/61 execs=1806 resumed=49 verdict_pass=false fail_lines=52
RUN round-gate rev2 exit=1 cases=9/61 execs=1806 resumed=52 verdict_pass=false fail_lines=52
RUN surface-probe rev0 exit=1 cases=42/46 execs=180 resumed=5 verdict_pass=false fail_lines=4
RUN surface-probe rev1 exit=1 cases=42/46 execs=180 resumed=0 verdict_pass=false fail_lines=4
RUN surface-probe rev2 exit=1 cases=42/46 execs=180 resumed=9 verdict_pass=false fail_lines=4
SITE RG742 gate=round-gate label=ROUTED_MISS capped/n=116/116,116/116,116/116 base_n=116 cases=9/61,9/61,9/61 base_cases=61/61 uncapped_direct=0,0,0 reason=gate_exit=1,no_final_verdict_pass,fail_lines=52,selftest_cases_below_base
SITE SP491 gate=surface-probe label=ROUTED_MISS capped/n=2/2,2/2,2/2 base_n=2 cases=42/46,42/46,42/46 base_cases=46/46 uncapped_direct=0,0,0 reason=gate_exit=1,no_final_verdict_pass,fail_lines=4,selftest_cases_below_base
SITE SP519 gate=surface-probe label=ROUTED_MISS capped/n=2/2,2/2,2/2 base_n=2 cases=42/46,42/46,42/46 base_cases=46/46 uncapped_direct=0,0,0 reason=gate_exit=1,no_final_verdict_pass,fail_lines=4,selftest_cases_below_base
SITE SP1592 gate=surface-probe label=ROUTED_MISS capped/n=14/14,14/14,14/14 base_n=14 cases=42/46,42/46,42/46 base_cases=46/46 uncapped_direct=0,0,0 reason=gate_exit=1,no_final_verdict_pass,fail_lines=4,selftest_cases_below_base
CAPROUTE48 rev=3d21bed66b1b8e1c4d2e25b5a890190e96a17de6 base=f00cf278 set=r48 held=0/4 runs=3 rule=F48
```

(The receipt ends at the `CAPROUTE48` line: the long detector call was auto-backgrounded by the harness, whose wrapper terminated before appending its own `exit=`/`load1=` trailer. The command exit status observed by the harness was 1, and the counter exits 1 exactly when `held < 4`, so the reading is exit 1; the missing trailer is a capture gap, not an unknown outcome. The pristine and restored receipts carry their trailers.)

Reading of the four site lines: **every routing term holds** — `capped/n` equals `base_n` exactly (116/116, 2/2, 2/2, 14/14 in all three runs), `uncapped_direct=0,0,0`, no `execveat`, no `no_capped_scope_ancestor`, no `no_cap_run_ancestor`, no `exec_count_ne_base`, no canary leak. All four `why` sets contain only health terms. The kill is therefore attributable to the gate-health conjuncts, not to the routing predicate. The base runs inside the mutant receipt are green (61/61, 46/46), so the collapse is not environmental.

### Gate selftests at the mutant (direct, no strace)

- `r48/kumitate-r48-MutSpawnDropBind-selftest-round-gate.txt`: `ROUND_GATE_SELFTEST: 9/61 pass`, `VERDICT: FAIL`, 52 `FAIL` lines. Representative: `FAIL [60/61] … exit=2 ROUND_GATE: FAIL-CLOSED (REPORTS_DIR_MISSING) --reports-dir /tmp/kumitate-round-gate-selftest-jZKr21/41-tracked-clean/main/.ufo/reports is absent`. The child's view of `/tmp` is the fresh tmpfs; the fixture tree (`/tmp/kumitate-round-gate-selftest-*/…`) is simply not there.
- `r48/kumitate-r48-MutSpawnDropBind-selftest-surface-probe.txt`: `42/46 cases passed`, `VERDICT: FAIL`, exactly four failures:
  - `bare run (no --src): resolves to the first existing candidate ~/Projects/ufo-fsd-alpha — exit=2 src=null`
  - `bare run (no --src): falls back to the legacy ~/Projects/origin-work/ufo-fsd-alpha when the new path is absent — exit=2 src=null`
  - `bare run (no --src): the new path wins when BOTH candidates exist (candidate order is the spec) — exit=2 src=null`
  - `hermeticity: --selftest passes with a bogus --src (never reads the live tree) — exit=1 tail=43/46 cases passed`
  All four are SP1592 `spawnSelf` children whose `HOME`/`--src` fixtures live under the host `/tmp` (bind `[tmp]` dropped). **No installation or dispatcher-status case failed**: the SP491 `cacheRoot` and SP519 `stateRoot` binds were dropped in this same mutant and their tests still passed.

## Which checklist / H1 item catches it instead

`node scripts/surface-probe.mjs --checklists` at the mutant commit: `r48/kumitate-r48-MutSpawnDropBind-checklist-mutant.txt`, `CHECKLIST: 15/22 pass`, `VERDICT: FAIL`; per-item `load1` 44.5–53.4; 146.7 s wall. Its wrapper trailer (`exit=`/`load1=`) is likewise absent, so no exit code is claimed for the harness itself.

Inherited base side (attempt 1, `build/checklist-base-{1,2}.txt`, per-item load1 27.4–59.0): `18/22 pass` in both, same four failing items (`SKILL.md:685`, `:686`, `:687`, `:697`).

Applying the H1 rule literally (passes in both base runs, fails in the mutant run):

| Item | Base | Mutant | Evidence at the mutant |
|---|---|---|---|
| `SKILL.md:683` Surface-probe hermetic suite | PASS | **FAIL** exit 1 | `hermeticity: --selftest passes with a bogus --src … tail=43/46`; `42/46 cases passed` |
| `SKILL.md:684` Round-gate hermetic suite | PASS | **FAIL** exit 1 | `ROUND_GATE_SELFTEST: 9/61 pass`; `REPORTS_DIR_MISSING … /tmp/kumitate-round-gate-selftest-3xcXtT/…` |
| `SKILL.md:692` Sources-check hermetic suite | PASS | **FAIL** exit 1 | `SOURCES_SELFTEST: 5/46 pass`; `grep: /tmp/kumitate-sources-check-mu5d1l/parity/corpus/SOURCES.md: No such file or directory` |
| `SKILL.md:694` Anchor-truth hermetic suite | PASS | **FAIL** exit 1 | `ANCHOR_TRUTH_SELFTEST: 1/44 pass`; `TRUTH: FAIL-CLOSED (ORIGIN_PIN_MISSING /tmp/anchor-truth-selftest-60mBvU/at40/.ufo/pins/origin.json)` |

Not harm (excluded by H1's own rule): `:685`/`:686` (sandbox `REPORTS_DIR_MISSING` at both ends), `:687` (proxy drift at both ends — its mutant output additionally shows `GATE_PIN_DRIFT pin.cap-spawn: declared=3a06e8a2… computed=a8ab8869…`, i.e. the proxy pin does see any `cap-spawn` byte change, but the item already fails at base and the round re-pins at close, so the pin is provenance, never behaviour), and `:697` (fails at base with timeouts, passes at the mutant — an ordering/load artifact, not harm).

Two of the four harmed items (`:692`, `:694`) are **outside the C1 site set**: `cap-spawn` is shared infrastructure already used at the freeze by `scripts/sources-check.mjs:53,555,869` (`bind: [root]`, `bind: [tmp]`) and `scripts/anchor-truth.mjs:90,806` (`bind: [tmp]`). A bind defect in the shim is therefore a base-level functional defect of the lane, wider than the four C1 sites; the counter sees only the round-gate and surface-probe subset of the harm, and H1 names the remaining two.

## Why the counter cannot see this defect (coverage finding)

1. The frozen counter's routing predicate observes the ancestry chain, caps, canary, exec counts and dodges. It has **no term for `--bind` or for the child's filesystem view** (`grep -n bind probe/caproute48-probe.mjs` → no match). A child that runs capped inside bwrap with an empty `/tmp` is, to the routing predicate, indistinguishable from a correct one — confirmed here: `capped/n` exactly equals base at every site.
2. `cap-run.mjs:351-364` asserts the *runner's* `--bind` ("a host directory outside the cwd is read-write only when bound") and still passes at the mutant (`SKILL.md:701` PASS) — it never exercises the shim's pass-through.
3. `cap-spawn.mjs` has no selftest and no other caller-side test; its bind pass-through is covered only indirectly, by whichever gate suite happens to assert on fixture contents.
4. The mutation is *partially* inert: with all binds dropped, SP491's compile-cache dir and SP519's dispatcher state dir are re-created inside the sandbox tmpfs and their tests pass. **Measured consequence**: a narrower defect — dropping only those two mounts and keeping RG742/SP1592's — would leave every suite green, hence `CAPROUTE48 … held=4/4` exit 0 and all 18 base-passing checklist items passing. [INFERENCE, from the measured mutant: those two sites' tests passed with their binds absent, and no other harmed item depends on them.] That narrow variant is a **surviving mutant** under both detectors; the C1 claim can be scored 4/4 while two of its four binds silently never reach the child. The harm it leaves is functional (cache not reused, dispatcher state written to a tmpfs that vanishes), which is why the seat's instinct "the harm is functional, not routing" is right in kind even though this particular whole-drop instance is caught by the health proxy.

## Restoration and hashes

Restoration was exact and immediate, by `git revert` of the mutant (not a working-tree approximation), then the counter was re-run on the restored commit:

```text
git -C lane -c user.name=seat -c user.email=seat@local -c commit.gpgsign=false revert --no-edit 3d21bed66b1b8e1c4d2e25b5a890190e96a17de6
git -C lane diff --stat 6291938656d8be31e08a79d03d2436ac5c8268a0 b51b257c26b3436897af8b1beca3bc7db5b42da9   # empty
```

Restored run: `r48/kumitate-r48-MutSpawnDropBind-restored-receipt.txt`, exit 0, load1 36.59:

```text
SITE RG742 gate=round-gate label=ROUTED_HELD capped/n=116/116,116/116,116/116 base_n=116 cases=61/61,61/61,61/61 base_cases=61/61 uncapped_direct=0,0,0
SITE SP491 gate=surface-probe label=ROUTED_HELD capped/n=2/2,2/2,2/2 base_n=2 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=0,0,0
SITE SP519 gate=surface-probe label=ROUTED_HELD capped/n=2/2,2/2,2/2 base_n=2 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=0,0,0
SITE SP1592 gate=surface-probe label=ROUTED_HELD capped/n=14/14,14/14,14/14 base_n=14 cases=46/46,46/46,46/46 base_cases=46/46 uncapped_direct=0,0,0
CAPROUTE48 rev=b51b257c26b3436897af8b1beca3bc7db5b42da9 base=f00cf278 set=r48 held=4/4 runs=3 rule=F48
exit=0 load1=36.59 end=18:34:18Z
```

| File | Pristine (comparator) | Mutant | Restored |
|---|---|---|---|
| `scripts/cap-spawn.mjs` | `3a06e8a2a1cb2db8ae998cd1c107566cd123e0c0d197248d72f7c2cd78038a3e` | `a8ab8869da29cf2632288d933fa78ed0bb6fe7d988885f77e213f2001e191f0f` | `3a06e8a2a1cb2db8ae998cd1c107566cd123e0c0d197248d72f7c2cd78038a3e` |
| `scripts/round-gate.mjs` | `6ffd3ab0a0cd9778a22d502da80c3bb0157bc0bde74d8277db360436e79cb08b` | same | same |
| `scripts/surface-probe.mjs` | `77367904351d11e918201fd43cd8edf7ef80fffbd27e3721b91c7fbeee6f829c` | same | same |
| `scripts/cap-run.mjs` | `d8acc6debd101b0a76ec486e49245ee10aff6e8bb841834d9c4d03c5285d5758` | same | same |

(Freeze blobs for reference: `cap-spawn` `3a06e8a2…` is already the freeze blob — the comparator does not touch it; `round-gate` at freeze `52eb183e…` and `surface-probe` at freeze `0cd94432…` differ from the table only by the routing comparator.)

Frozen counter sha256 measured in this seat before and after every run: `f24a3af55add0708943526435fde93e02f4ef0c9d4b8e494a9111a5fec890cf2`; `git -C lane show fe3d45bf:…/probe/caproute48-probe.mjs | sha256sum` gives the same value, so the run counter is the freeze blob.

Evidence file hashes:

| File (`r48/…`) | sha256 |
|---|---|
| `kumitate-r48-MutSpawnDropBind-pristine-receipt.txt` | `208cacbca0efd391dcab174a1d2e9a06ddd1e6cfd20f4d3d6c6078bfc0dfb042` |
| `kumitate-r48-MutSpawnDropBind-mutant-receipt.txt` | `6917a49255d98fc6fc4cb76fd09aa6f03a4fcbd9ee0d9258aebc96d8e9991043` |
| `kumitate-r48-MutSpawnDropBind-restored-receipt.txt` | `7b850adc44561c50d000a722848673babab1079004d9e5ba7e3c1f103ccd3a74` |
| `kumitate-r48-MutSpawnDropBind-checklist-mutant.txt` | `b95bf2af6bca8ad29d8fce3391238c5f54875d174cc39e3a1721cdead922962e` |
| `kumitate-r48-MutSpawnDropBind-selftest-round-gate.txt` | `0d7b4b49da9aa1808a177572f74385ab961a6f4040bdca8454173c0de40da1e8` |
| `kumitate-r48-MutSpawnDropBind-selftest-surface-probe.txt` | `626843db67991dc40e9925d916b5f48cd0e79bb777f94adc2e660284ac13f454` |
| `kumitate-r48-MutSpawnDropBind.patch` (comparator + mutant, 2 commits) | `ee63a7506117e75d034808abe6d5894b8b364bb7ad0ea807ba77342209e9ecf2` |

## Containment and tooling

All git writes are confined to the named sandbox clone (`fe3d45b` → `6291938` comparator → `3d21bed` mutant → `b51b257` restore). Lane writes are limited to this report and the seven prefixed evidence files above; no lane git/jj write, no sibling edit, no counter edit, no C1 candidate score, no integration. No subagents, no background jobs of my own (two long detector calls were auto-backgrounded by the harness and are the receipts shown). No tools installed or updated; no pacman transaction. Node `v26.12.0` (existing mise install, `/home/vgpnk/.local/share/mise/installs/node/latest/bin/node`) was used for the counter and both gates; `/usr/bin/strace`, `/usr/bin/bwrap`, `/usr/bin/systemd-run` were already present. `/tmp/mutdrop/` holds only the extracted first-commit patch used to build the comparator.
