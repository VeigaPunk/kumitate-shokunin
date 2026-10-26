VERDICT: All 20 registry gates and all 16 named candidates were measured in fresh sandbox clones at `47fe2383` and `2ca91a0` (two runs at base): all 36 proposed gates are stable in clean/not-clean class and match one verdict line, none exceeds 27.8 s, none writes into the sandbox — and four registry defects were found (a verdict regex matching two lines, a gate escaping to `/tmp`, four timeouts above the 120 s budget, a verdict line carrying a random temp path), so a corrected 36-gate `registry-v2.json` is proposed and the real tool reads it `HARM_MATRIX: CLEAN gates=36 ... harm=0` exit 0.

## Evidence

Measurement: one fresh `git clone --no-hardlinks` of the lane per worker, `git checkout -q -f --detach <rev>` + `git clean -qfdx` before every gate, env `PATH/HOME/LANG=C/LC_ALL=C/NO_COLOR=1` and `timeout -k 2 <t>` exactly as `scripts/harm-matrix.mjs:measure()` runs a gate; 4 workers, 3 passes (base x2, tip x1), 114 gate executions.

```
# base 47fe2383 (2 passes), tip 2ca91a0c (1 pass); 36 gates + 1 extra
nondeterministic: 0 of 36          # identical exit + verdict word + match count over both base passes
class-deterministic 36/36, byte-identical verdict line 35/36   # exception: plan-before-ready-selftest, see finding -4
runs=114 runs-with-sandbox-writes=0
```

Cost (max of the three runs, per gate; full table in `registry-v2-table.md`):

```
incumbent registry (20 gates): one pass 61652 ms, base<->tip pair 123304 ms
proposed registry (36 gates):  one pass 139291 ms, base<->tip pair 278582 ms
slowest gate: round-gate-selftest 27814 ms   (next: proxy-check-selftest 18795, jj-seat-demo 11861, cite-check 10624)
```

The real tool on the proposed registry (live lane, both revisions, sandboxes only in /tmp):

```
$ node scripts/harm-matrix.mjs --base 47fe2383151909d31557ada118ad84f90404dc6c \
    --tip 2ca91a0c81542cad5f731049aa55dd2f99ade98d --gates .ufo/waves/round-65/build/K65ExecHarmRegistry/registry-v2.json
HARM_MATRIX: CLEAN gates=36 held=30 repaired=1 carried=2 moved=2 new=1 gone=0 harm=0 harm_absent=0 new_red=0 base=47fe23831519 tip=2ca91a0c8154
real 3m29.141s   exit=0
HARM_ROW gate=readme-map base=NOT_CLEAN tip=CLEAN id=REPAIRED base_text="README_MAP: DRIFT files=157 rows=156 covered=156 bad=2 first=uncovered:lessons/round-64-verifier-spotcheck.md [exit=1]"
HARM_ROW gate=harm-matrix-selftest base=ABSENT tip=CLEAN id=NEW_OK base_text="absent:scripts/harm-matrix.mjs" tip_text="HARM_MATRIX_SELFTEST: PASS (26/26)"
HARM_ROW gate=cite-check-fleet-dot base=NOT_CLEAN tip=NOT_CLEAN id=CARRIED_MOVED base_text="CITE_CHECK: DRIFT (files=161 tokens=12033 errors=1545 warnings=766) [exit=1]"
HARM_ROW gate=proxy-check base=NOT_CLEAN tip=NOT_CLEAN id=CARRIED_MOVED   # tip adds A_DRIFT +6 and PIN_UNPINNED term=scripts/harm-matrix.mjs
HARM_ROW gate=kimi-census base=NOT_CLEAN tip=NOT_CLEAN id=CARRIED   # identical text both ends
HARM_ROW gate=omp-census  base=NOT_CLEAN tip=NOT_CLEAN id=CARRIED   # OMP_CENSUS: DRIFT (root=/home/vgpnk/.omp/agent entries=42 findings=10)

# the shipped file (with the per-gate metadata added after that run) re-validated through the tool
$ node scripts/harm-matrix.mjs --base 47fe2383... --tip 2ca91a0c... --gates .../registry-v2.json \
    --only plan-before-ready-selftest,cite-check-fleet-dot,readme-map
HARM_MATRIX: CLEAN gates=3 held=1 repaired=1 carried=0 moved=1 new=0 gone=0 harm=0 harm_absent=0 new_red=0 base=47fe23831519 tip=2ca91a0c8154   exit=0
```

Host-state proof (sandbox `.ufo/pins/origin.json` `clone` rewritten to `/nonexistent/origin-pin`, restored after):

```
claims-check      exit=2  CLAIMS: FAIL-CLOSED (SRC_NOT_A_DIR --src /nonexistent/origin-pin is absent)
anchor-truth      exit=2  TRUTH: FAIL-CLOSED (SRC_MISSING /nonexistent/origin-pin)
surface-known     exit=2  SURFACE_PROBE: FAIL-CLOSED (--src /nonexistent/origin-pin is missing)
proxy-check       exit=2  PROXY: FAIL-CLOSED (KIMI_ROOT_NOT_A_DIR) --kimi-root /nonexistent/kimi-root is absent
omp-census (HOME=empty) exit=2  OMP_CENSUS: ERROR root=.../.omp/agent reason=ENOENT
```

## Findings

**K65ExecHarmRegistry-1 (MEDIUM)** — `readme-map`'s verdict regex matches two logical lines. `scripts/readme-map.mjs:247-248` prints one `README_MAP: note <item>` per bad item *before* the verdict, so `^README_MAP: (\w+)` matches 2 lines at base (`note`, then `DRIFT`). The tool's last-match-wins rule is correct only because of emission order; a note emitted after a verdict (or a reader using first-match) misreads it. Fix shipped in `registry-v2.json`: `^README_MAP: (CLEAN|DRIFT|FAIL-CLOSED)\b` (matches 2 -> 1 at base, 1 at tip). Repro: `grep -E '^README_MAP: ' <(cd <clone> && node scripts/readme-map.mjs)`.

**K65ExecHarmRegistry-2 (MEDIUM, sandbox escape)** — `cite-check` reads its **parent directory** as the fleet root when `--fleet` is absent (`scripts/cite-check.mjs:272`, `opts.fleet = dirname(opts.self)`), i.e. `/tmp` under harm-matrix. Same base tree, same `files=161 tokens=12033`, different parent → different verdict: `errors=1545 warnings=771` with the sandbox's parent, `errors=1506 warnings=768` with `--fleet /tmp` (and the tool's own run reproduced 1506). So the gate's reading is a function of `/tmp` contents shared with every other seat. `--fleet .` pins it inside the sandbox and is stable across three different parents (2.5-3.7 s, exit 1, `errors=1545 warnings=766`); shipped as gate `cite-check-fleet-dot`. The bare form is **not** shipped. Repro: `cd <base-clone> && node scripts/cite-check.mjs | tail -1; node scripts/cite-check.mjs --fleet /tmp | tail -1`.

**K65ExecHarmRegistry-3 (MEDIUM)** — Four incumbent rows declare a timeout above the round's 120 s budget and up to 40x their measured worst case: `round-gate-selftest` 180 (measured 27.8 s), `report-receipt-diff-selftest` 180 (3.3 s), `plan-before-ready-selftest` 180 (3.9 s), `harm-matrix-selftest` 300 (7.2 s). Seven more exceed 2x their measured worst case. `registry-v2.json` sets `timeout = clamp(ceil(5 x max_ms, 10), 45, 120)`; every gate holds the 120 s rule with >= 4x headroom, and `gates=36` is inside the 40-cap.

**K65ExecHarmRegistry-4 (MEDIUM)** — `plan-before-ready.sh:650` prints its selftest verdict with a random fixture path (`fixtures=/tmp/pbr-selftest.XXXXXX`); three runs of the same revision give three different verdict lines. `harm-matrix.mjs:transition()` separates CARRIED from CARRIED_MOVED by exact text equality, so two identical FAILs can never read CARRIED. Today the gate is clean at both ends (HELD, unread) — on a red pair it is a guaranteed CARRIED_MOVED. Measured: 35 of 36 proposed gates are byte-identical over the two base passes; this is the 36th (`deterministic_2runs:false`, `deterministic_class_2runs:true` in `registry-v2.json`). Patch in `proposed-fixes.md` §2 (`fixtures=mktemp`); nothing parses that field (`counter-pins` does not pin the script: `grep -c plan-before-ready .ufo/pins/counter-pins.json` = 0).

**K65ExecHarmRegistry-5 (MEDIUM)** — Host-state scope is undeclared in v1: 6 of the 36 proposed gates read state outside the sandbox (proven by the exit-2 experiments above and by `src=/fast/scratch/hyaku/kumitate-pin/src` / `src=/home/vgpnk/Projects/ufo-fsd-alpha` on their first output lines). The plan's stated limit is therefore exact: a host change between the two runs can only surface as CARRIED_MOVED, never as HARM — and for the three host-state gates that are red at both ends (proxy-check, kimi-census, omp-census) the reading mixes host bytes with the revision, so neither a repair nor a regression there can be attributed to the revision pair alone (all three read CARRIED, as measured). `registry-v2.json` records `scope` per gate (sandbox-pure / host-state); the tool ignores unknown keys (verified in `loadGates`).

**K65ExecHarmRegistry-6 (LOW)** — The plan's exclusion reason "heavy gates (cite-check ...) are outside the registry" is falsified: bare `cite-check` is 3.9-10.6 s, `--selftest` 1.6-2.1 s, the pinned form 2.5-3.7 s at base. `gate-mutants` 2.1-2.5 s, `cap-run` 9.1-9.9 s, `surface-probe --selftest` 3.0-3.9 s likewise cost seconds. `cite-check --selftest` (76/76, 1.6-2.1 s) is admitted too (`cite-check-selftest`), beyond the named list.

**K65ExecHarmRegistry-7 (LOW)** — `wave-census` bare is vacuous as a gate (exit 64 usage, 0 verdict lines -> FAIL_CLOSED at both ends, never clean); excluded. `wave-census-selftest` and `wave-census-r40` already cover that script.

**K65ExecHarmRegistry-8 (LOW)** — No gate writes into its sandbox (0 of 114 runs), so harm-matrix's one-sandbox-per-revision design has no cross-gate contamination on this axis; the only cross-gate coupling observed is `cite-check`'s *parent* read (finding -2).

**K65ExecHarmRegistry-9 (LOW)** — Seven incumbent `^VERDICT: (\w+)` rows can be satisfied by a nested fixture's line; `gate-mutants --selftest` proves it (2 matches: line 12 fixture echo, line 45 final). v2 uses the dedicated one-shot literal for those gates (`^<GATE>_SELFTEST: \d+/\d+ (\w+)`, `^SOURCES_SELFTEST:`, `^ROUND_GATE_SELFTEST:`, `^CITE_SOURCES_SELFTEST:`, `^WAVE_CENSUS_SELFTEST:`) or an end-anchored `^VERDICT: (PASS|FAIL)\b`; every proposed regex matched exactly one line at both revisions.

**K65ExecHarmRegistry-10 (LOW)** — The v2 pair costs 3m29s in situ (two lane clones ~54 s + 279 s of gates) versus the incumbent pair's ~123 s of gates; that is the price of the 16 added gates. If the close step needs to stay near two minutes, the 9 sandbox-pure selftests over 5 s are the trim list (round-gate, proxy-check, jj-seat-demo, cap-run, kimi-census, receipt-attest, receipts-evidence, sources-check, harm-matrix).

## Artifacts

- `.ufo/waves/round-65/build/K65ExecHarmRegistry/registry-v2.json` — 36 gates, each with argv, proposed verdict, clean set, timeout, measured base x2 / tip timings, readings, `deterministic_class_2runs` / `deterministic_2runs` / `deterministic_note`, and `scope`.
- `.ufo/waves/round-65/build/K65ExecHarmRegistry/registry-v2-table.md` — the full measured table.
- `.ufo/waves/round-65/build/K65ExecHarmRegistry/proposed-fixes.md` — four patches (readme-map regex, pbr verdict line, timeouts, cite-check `--fleet .`).
- Scratch (not deliverables): `/tmp/kumitate-r65/K65ExecHarmRegistry/{runner.mjs,results-*.jsonl,out/,full-v2-final.txt}`.

## Limits

- Load average was 124.8 on 32 cores for the whole measurement; every wall time is inflated and noisy, which is why timeouts are 5x the observed worst case rather than 2x.
- Measured at two revisions only (`47fe2383`, `2ca91a0c`); the tip is the freeze commit, not the round close, so REPAIRED/NEW_OK rows describe those two revisions.
- Purity was classified by reading the scripts and by the pin/root-removal experiments (exit 2), not with strace; a gate that reads host state through a path none of the greps and experiments touch could still be mislabelled.
- Not measured as gates: `make-dispatch-actual`, `counter-rerun`, `cap-spawn`, `omp-binary-probe.sh` (C2's subject), non-selftest modes of `gate-mutants`/`cap-run`/`surface-probe --checklists`, and `jj-seat-demo` exit-2 (jj absent) — only exit 0 was observed.
- Determinism was measured over two consecutive runs at one sitting plus the tip run; drift over hours is not covered except where finding -2 reproduces it.
- Another seat rewrote the worktree's `scripts/harm-matrix.mjs` to contract v2 while this wave ran (325+/122- lines, mtime 22:47, `--strict-gone`/`--strict-unmeasured`, normalised readings); every number and row here comes from the committed v1 blobs in fresh clones (`47fe2383`/`2ca91a0c`), which is also why a worktree edit cannot skew these readings. The registry gates file is the same schema for both, but v2's normalisation may change CARRIED vs CARRIED_MOVED on the `fixtures=/tmp/...` line of finding -4 — the patch is still the right fix, the normaliser is a second line of defence.
- `registry-v2.json` is a draft for the L1; this seat edited no file under `scripts/`, `corpus/`, `.ufo/pins/` or the frozen round-65 inputs, and installed no tools.
