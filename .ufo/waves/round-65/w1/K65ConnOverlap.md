VERDICT: No tool in the lane, the fleet, or any sibling lane runs lane gates at two revisions and classifies transitions — harm-matrix's job is unclaimed and no sibling duplicates it — but the tool keeps a second, drifting inventory of the lane's registry home (SKILL.md: 15 of 33 checklist rows unregistered, 13 of them cheap selftests) and adds a fourth, costliest revision-materialization mechanism where the lane already has three (276 MiB × 2 per run vs 196 MiB via `git clone --shared`, measured); the concrete reuse is surface-probe's frozen checklist parser (scripts/surface-probe.mjs:278 `CHECKLIST_RE`, :979 `parseChecklist`) as the registry's coverage oracle, and the sibling's 36-row registry-v2 does **not** break the frozen H3 predicate (measured: PAIR_A `harm=2` = exactly readme-map + proxy-check; PAIR_B `harm=0`).

## Evidence

### 1. The nearest existing tools, one per candidate, and what each lacks

| candidate | what it does | what it lacks vs harm-matrix | citation |
|---|---|---|---|
| `surface-probe.mjs --checklists` | parses SKILL.md's 33 GFM task rows, runs each command in the working copy; prints `CHECKLIST <PASS\|FAIL> SKILL.md:<line> exit=… substring=hit\|miss` + `CHECKLIST: n/m pass` + `VERDICT: PASS\|FAIL` | **no `--rev`** (`--self DIR` is the only tree selector, and it is a *directory*) ⇒ one tree, no transition. Its verdict is "exit ∈ expected ∧ output contains expect-substring" — it cannot express clean→not-clean | `scripts/surface-probe.mjs:1028 runChecklistsMode`, `:1040`, `:1066` (`cwd: opts.self`), `:1070-1071`, `:337`, `:1823-1840` (parseArgs: `--src/--self/--pin/--known/--json/--strict/--checklists/--selftest`, **no `--rev`**) |
| `plan-before-ready.sh` map arm | runs `node scripts/readme-map.mjs` **inside `git archive PLAN`** — one gate, one revision (the plan commit) | one gate, one revision, no transition, no gate registry; verdict `map=CLEAN\|DRIFT` only | `scripts/plan-before-ready.sh:29-37`, `:137-141`, `:178` (`git archive --format=tar "$plan" \| tar -x -C "$t"`) |
| `report-receipt-diff.mjs` | diffs a *report* against the *receipts* it cites at one rev (`merge-base --is-ancestor` for orphan hashes) | reads no gate, runs no command, one revision | `scripts/report-receipt-diff.mjs:264`, `:485-500` |
| `gate-mutants.mjs` | runs 43 frozen mutants of two targets (`cite-check`, `wave-census`) against a *measured* scripts tree; classifies killed/survived/drift | one revision per run (`--rev` picks the tree; `prepareSource` loads *that* rev's scripts), 2 targets not a gate registry, no base↔tip comparison | `scripts/gate-mutants.mjs:36`, `:739 loadRevisionScripts`, `:772 prepareSource`, `:544-553` |
| `round-gate.mjs` | audits a round's filed artifacts (`--round N --repo DIR --tracked`) | one revision, artifact audit not gate execution | `scripts/round-gate.mjs:189-197`, `:205` |
| `counter-rerun.mjs` | runs **one** counter K times at **one** (lane, rev), compares the final summary lines byte-wise | K runs of the *same* rev, not two revs; one probe, not a registry; no transition vocabulary | `scripts/counter-rerun.mjs:184-190 resolveRev`, `:215-233 decide`, `:169-173 childEnv` |

**Fleet scripts** (`/home/vgpnk/Projects/shokunin/scripts/`, read-only) hold only `sources-census.sh`, `shokunin-watchdog.sh`, `hyaku/`. Grep `harm|battery|regress` hits only *closure rubric prose* (`scripts/hyaku/closure-prompt.md:32-33` "check no owned axis was harmed (`git -C {{LANE_CWD}} diff {{BASE}} {{HEAD}} -- SCORECARD.md`, plus spot reads)"; `scripts/hyaku/append-closure.py:28 TREND_VERDICTS` `harmed`) — a **human** rule, not a tool. `.ufo/gates/root-ledgers.py` takes `--rev` but no second revision. **Nothing in the fleet runs gates at two revisions.**

**Sibling lanes** (read-only grep over `*-shokunin/{scripts,tools,verifiers}`) — the only two-revision instruments:
- `kotoba-shokunin/verifiers/check_gate_finding_delta.py` — runs **one** gate's finding-ids at base and head and diffs the sets (`:1-24`). **Nearest sibling in the fleet by mechanism**, but one gate, no registry, no clean/not-clean classes, and it diffs *finding ids*, not verdicts.
- `souji-shokunin/tools/souji-coverage-agreement.py` — a coverage map at `--rev` vs `--base-rev` with a `KILL-RULE` class (`:120-141 kill_rule`). Same shape (base↔rev, classified transition) but over *corpus bytes*, in souji's province.
- `tsukuroi-shokunin/tools/check-registry-coverage.py` — SKILL.md registry rows vs committed tools (`:262 _coverage`, `:194 _operative_rows`). **Nearest sibling for the registry-drift idea** (Finding 1/2), but its rows are a PROTOCOL-shaped 8-column table, not kumitate's GFM checklist, and it never runs a gate.
- `kotoba-shokunin/verifiers/check_tip_battery.py` — 6 frozen commands at **one** rev in a fleet-shaped sandbox (`:19-30`).

**Lane-internal**: `grep -rn "harm\|HARM" scripts/*.mjs scripts/*.sh` outside `scripts/harm-matrix.*` → only prose (`anchor-truth.mjs:5`, `counter-pins.mjs:8`). The only lane script taking two revisions is `scripts/anchor-truth.mjs` (`--base REV`, `:46-49`), and it compares *anchors*, not gate verdicts.

⇒ **No sibling built this.** C1's tool is unclaimed; `scripts/harm-matrix.mjs` should own it. The nearest artefacts are in other lanes' provinces and neither runs a gate registry at two revisions.

### 2. The lane's registry home is SKILL.md, and harm-matrix keeps a second inventory of it

PROTOCOL.md §Gate standard: *"a child lane's **registry home** is its own `SKILL.md`"* (`PROTOCOL.md:398-403`). The lane's SKILL.md holds 33 checklist rows (`grep -c '^- \[ \] ' SKILL.md` → 33); the harm registry held 20 rows at the freeze commit (`scripts/harm-matrix-gates.json`, 20 gates). Comparing argv strings:

```
v1 registry (20 gates): 18 in SKILL.md, 2 registry-only
  registry-only: node scripts/counter-pins.mjs --selftest
  registry-only: node scripts/harm-matrix.mjs --selftest
SKILL.md rows with no registry row (15): cite-check.mjs · round-gate.mjs · round-gate.mjs --tracked ·
  anchor-truth.mjs --selftest · gate-mutants.mjs --selftest · surface-probe.mjs --selftest ·
  cite-check.mjs --selftest · proxy-check.mjs --selftest · gate-mutants.mjs · omp-census.mjs --selftest ·
  cap-run.mjs --selftest · receipt-attest.mjs --selftest · receipt-evidence.mjs --selftest ·
  dispatch-evidence.mjs --selftest · jj-seat-demo.sh
```
The registry's own `note` admits this is deliberate ("Heavy or interactive gates (cite-check, gate-mutants, cap-run, surface-probe --checklists) are out of the registry") — but the note names **4** gates and the gap is **15** rows, of which **13 are `--selftest` rows** (cheap, hermetic, no systemd) that the note does not cover. The freeze's own sibling seat already widened the registry to 36 rows (`.ufo/waves/round-65/build/K65ExecHarmRegistry/registry-v2.json`), which closes **10 of the 15**, leaving 5 (`cite-check.mjs`, `round-gate.mjs`, `round-gate.mjs --tracked`, `gate-mutants.mjs`, `anchor-truth.mjs --selftest`).

**Measured with the draft checker** (`registry-coverage.mjs`, §Artifacts) against the **committed v1** registry — exit 1:
```
FINDING GATE_UNREGISTERED node scripts/cite-check.mjs SKILL.md:707 (expect CITE_CHECK:)
FINDING GATE_UNREGISTERED node scripts/round-gate.mjs SKILL.md:712 (expect ROUND_GATE: CLEAN)
FINDING GATE_UNREGISTERED node scripts/round-gate.mjs --tracked SKILL.md:713 (expect ROUND_GATE: CLEAN)
… (12 further selftest rows) …
FINDING GATE_UNLISTED node scripts/counter-pins.mjs --selftest registry id=counter-pins-selftest
FINDING GATE_UNLISTED node scripts/harm-matrix.mjs --selftest registry id=harm-matrix-selftest
REGISTRY_COVERAGE: FINDINGS checklist=33 registry=20 findings=17 unregistered=15 unlisted=2 exit_diverges=0
```
Against the working-copy registry (36 rows): `registry=36 findings=13 unregistered=5 unlisted=8 exit_diverges=0`, exit 1.

### 3. What the unregistered gates actually read — the gap is not hypothetical

The five SKILL.md gates the v1 registry does not run, measured **in the matrix's own sandbox** at PAIR_A (`a004902d → 47fe2383`), committed v1 tool + a scratch registry holding just those five (verbatim rows: `build/K65ConnOverlap/transcripts/pairA-unregistered-skillegates.txt`):

| gate | base → tip | id | verdict line |
|---|---|---|---|
| `round-gate` | NOT_CLEAN → NOT_CLEAN | CARRIED | `ROUND_GATE: FAIL-CLOSED (REPORTS_DIR_MISSING) --reports-dir /tmp/.ufo/reports is absent [exit=2]` |
| `round-gate-tracked` | NOT_CLEAN → NOT_CLEAN | CARRIED | same line |
| `anchor-truth-selftest` | CLEAN → CLEAN | HELD | `VERDICT: PASS` |
| `cite-check-bare` | NOT_CLEAN → NOT_CLEAN | CARRIED_MOVED | `CITE_CHECK: DRIFT (files=160 tokens=11980 errors=1476 warnings=764)` → `(files=161 tokens=12033 errors=1506 warnings=768) [exit=1]` |
| `gate-mutants` | CLEAN → CLEAN | HELD | `GATE_MUTANTS: CLEAN (mutants=43 killed=43 frozen=41/41 drift=0 targets=2 rev=working-copy manifest=8486506f…)` |

`HARM_MATRIX: CLEAN gates=5 held=2 repaired=0 carried=2 moved=1 new=0 gone=0 harm=0 harm_absent=0 new_red=0 base=a004902d77d1 tip=47fe238319`, exit 0, 390.69 s. Two of the five read **not-clean for a reason that has nothing to do with the lane**: `round-gate` resolves `DEFAULT_MAIN_REPO = resolve(HERE, '..', '..')` (`scripts/round-gate.mjs:154`), so inside the matrix's sandbox (`/tmp/harm-matrix.XXXX`) it looks for `/tmp/.ufo/reports` — the **sandbox's parent**, not the lane — and fails closed; `cite-check` resolves `opts.fleet = dirname(opts.self)` (`scripts/cite-check.mjs:272`), so it reads `/tmp` as the fleet root. The sibling seat K65ExecHarmRegistry already measured the same escape and proposed `--fleet .` for cite-check; `round-gate` has no such pin. So the registry gap is **partly justified** (these gates are not sandbox-pure) and **partly a hole** (the 13 selftests are hermetic and cost 1.6–7 s each). The registry `note` does not say which is which.

### 4. The lane already has THREE revision-materialization mechanisms; harm-matrix adds a fourth, and the cheapest one is not the one it picked

| mechanism | where | cost measured at `47fe2383` |
|---|---|---|
| `git archive \| tar -x` | `scripts/plan-before-ready.sh:178`, `scripts/receipt-evidence.mjs:100-103` | **194 MiB**, no `.git` |
| `git ls-tree` + `git show` per blob | `scripts/gate-mutants.mjs:739-770 loadRevisionScripts` | scripts/ only, no checkout |
| `git clone --shared --no-checkout` + `checkout` | (kotoba's `check_gate_finding_delta.py` style) | **196 MiB**, `.git` = 2.2 MiB (alternates) |
| `git clone --no-hardlinks --no-checkout` + `checkout` | `scripts/harm-matrix.mjs:74-81 sandbox()` | **276 MiB**, `.git` = 83 MiB |

harm-matrix holds **two** of the last one at once (base + tip), i.e. ~552 MiB per invocation, and the lane tree is 908 MiB at HEAD (601 MiB of it `.ufo/waves/round-65`). This is a live constraint on this host, not a theory: while my four matrix runs were in flight `/tmp` hit **100 % (345 MiB free)** and a plain `git clone` of the lane failed with `fatal: failed to copy file … No space left on device`; removing my own 275 MiB scratch clone freed 4.0 GiB. The tool cleans up in a `finally` (`scripts/harm-matrix.mjs:135-136 rmSync`), so the leak is not the tool's — but the *peak* is.

**Does the cheap mechanism work?** Measured, each registry gate run inside a `git archive` tree (no `.git`) at `47fe2383`: `README_MAP: DRIFT files=157 rows=156 covered=156 bad=2 first=uncovered:lessons/round-64-verifier-spotcheck.md` · `PROXY: DRIFT (C2_TOTAL_DRIFT term=C2_total declared=156 computed=157 delta=+1; AXES_DRIFT term=coverage declared=10 computed=9; src-rev=31c465f15669)` · claims-check `SUMMARY: errors=0 warnings=4` · `COUNTER_PINS: CLEAN pins=25` · `SOURCES_CHECK: CLEAN (rows=139 tiers=A:116,B:15,C:8 …)` · `SOURCE_CAPTURE: CLEAN captures=32 exemptions=107` · `SOURCE_DUPES: CLEAN groups=6 known=6` · `WAVE_CENSUS: CLEAN (rounds=1 waves=2 findings=0)` · and the `cite-sources` / `counter-pins` / `sources-check` / `wave-census` selftests all PASS.
**16 of the 20 registry gates read identically in the archive.** Two do not:
- `round-gate` → `round-gate: fail-closed — NOT_A_GIT_WORK_TREE: --repo /tmp/tmp.VSrACX91ba is not a git work tree` (exit 2)
- `anchor-truth --base e18ff1af…` → `TRUTH: FAIL-CLOSED (BASE_UNREADABLE e18ff1af…:.ufo/pins/anchor-truth.json)` (exit 2) — it needs `git show REV:path` (`scripts/anchor-truth.mjs:245,745`)

**The lane's third mechanism closes the git-ness gap.** Using kotoba's pattern (`git archive` + `git read-tree` + `GIT_DIR`/`GIT_WORK_TREE`/`GIT_INDEX_FILE`, `kotoba-shokunin/verifiers/check_gate_finding_delta.py:59-88`) inside the archive tree at `47fe2383`: `round-gate: fail-closed — REPORTS_DIR_MISSING: --reports-dir /tmp/.ufo/reports is absent` (the `NOT_A_GIT_WORK_TREE` refusal is **gone** — git-ness restored) while `anchor-truth` still reads `TRUTH: FAIL-CLOSED (BASE_UNREADABLE e18ff1af…:.ufo/pins/anchor-truth.json)` (it needs the base REV's blob, not just the tree). With a **`git clone --shared --no-checkout`** checkout at `a004902d` (196 MiB, `.git` 2.2 MiB) both read live: `TRUTH note=corpus/knowledge/remaining-scripts-census.md anchors=521 true=508 debt=4 unchecked=9` (no BASE_UNREADABLE) and `round-gate: fail-closed — REPORTS_DIR_MISSING: --reports-dir /tmp/tmp.lYHzpPrH4m/.ufo/reports is absent`.
⇒ `--shared` restores git-ness at **196 MiB instead of 276 MiB** (a 29 % cut, dropping the 83 MiB private `.git`; the clone's `.git` is 2.2 MiB of alternates pointing at the lane). The `round-gate` reports-dir escape is *independent* of the sandbox mechanism (it is `HERE/../..` = the sandbox's parent in any layout) and needs its own pin — a `round-gate.mjs` repair (`:154`), not a matrix repair, and not this seat's file.

### 5. The drift is measurable, and the "unregistered" gates carry real verdicts

`scripts/harm-matrix.mjs` at the **freeze commit** (`git show HEAD:scripts/harm-matrix.mjs`) run over the frozen pair `a004902d → 47fe2383`, with the v1 registry, reproduces the frozen H3 clause exactly:

```
HARM_ROW gate=readme-map base=CLEAN tip=NOT_CLEAN id=HARM base_text="README_MAP: CLEAN files=156 rows=156 covered=156" tip_text="README_MAP: DRIFT files=157 rows=156 covered=156 bad=2 first=uncovered:lessons/round-64-verifier-spotcheck.md [exit=1]"
HARM_ROW gate=proxy-check base=CLEAN tip=NOT_CLEAN id=HARM base_text="PROXY: MATCH (A=351 C=33 operability=9; …)" tip_text="PROXY: DRIFT (C2_TOTAL_DRIFT …; AXES_DRIFT term=coverage declared=10 computed=9; src-rev=31c465f15669) [exit=1]"
HARM_MATRIX: HARM gates=19 held=15 repaired=0 carried=2 moved=0 new=0 gone=0 harm=2 harm_absent=0 new_red=0 base=a004902d77d1 tip=47fe238319
```
(exit 1, 66.44 s). Same tool on PAIR_B `6825a514 → a004902d`: `HARM_MATRIX: CLEAN gates=19 held=14 repaired=2 … harm=0` with `readme-map` and `proxy-check` both `REPAIRED` (exit 0, 52.61 s). Both match the frozen H3 sentence.

With the sibling seat's proposed **registry-v2** (36 rows) the same tool on PAIR_A reads `HARM_MATRIX: HARM gates=35 held=30 … harm=2 harm_absent=0 new_red=0` — the two HARM rows are still exactly `readme-map` and `proxy-check` (exit 1, 145.08 s) — and on PAIR_B `HARM_MATRIX: CLEAN gates=35 … harm=0` with `readme-map`/`proxy-check` REPAIRED plus `report-receipt-diff-selftest` and `jj-seat-demo` NEW_OK and `cap-run-selftest` REPAIRED (exit 0, 307.96 s). **The widened registry does not break the frozen H3 predicate**; it adds coverage and transition classes the plan's H3 sentence does not forbid (H3 constrains HARM/HARM_ABSENT/NEW_RED only).

### 6. The reuse option, with the parser's file:line

`scripts/surface-probe.mjs` already owns the lane's **frozen checklist grammar**: `CHECKLIST_RE` at `scripts/surface-probe.mjs:278` and `parseChecklist(text)` at `scripts/surface-probe.mjs:979-1003` (label / command / exits / expect, with `- [x]` → checked and an unparsable `- [ ]` → malformed). `scripts/surface-probe.mjs` **exports nothing** and self-executes at `:1903` (`process.exitCode = main();`), so `parseChecklist` cannot be imported — `import('…/surface-probe.mjs')` runs the whole live conformance probe (measured: the import printed a `SURFACE_PROBE: DRIFT (surfaces=2 checks=12 errors=1 warnings=1 src-rev=31c465f15669)` report before resolving). **Concrete reuse options, in order of cost:**
1. **Copy the two blocks** into the new gate (what the draft below does) and add a source-line comment naming the upstream lines. Zero changes to `surface-probe.mjs`; the risk is a second copy that drifts.
2. **Lift the grammar into a shared module** both import — one grammar, no drift; costs a `surface-probe.mjs` edit (the L1's call, and `surface-probe.mjs` is *not* a claim subject, so it is in scope for the L1 but not for this seat).

`sed`-check of the two candidate semantics side by side (measured):
- surface-probe checklist: `exitOk = exits.includes(status)` ∧ `substringOk = output.includes(expect)` (`:1070-1071`) — a **substring** test, so `CITE_CHECK: DRIFT` with `expect=CITE_CHECK:` would PASS. Measured: a fixture row `- [ ] cite-like drift — node -e "console.log('CITE_CHECK: DRIFT files=1 errors=2'); process.exit(1)" → exit 0|1 + \`CITE_CHECK:\`` reads `CHECKLIST  PASS SKILL.md:3 exit=1 expected=0|1 substring=hit` → `CHECKLIST: 1/1 pass`, `VERDICT: PASS`, exit 0.
- harm-matrix: exit ∈ `ok_exit` ∧ the **last** line matching `verdict` carries capture 1 ∈ `clean` (`scripts/harm-matrix.mjs:83-97 measure`, `:99-106 transition`).

⇒ The checklist grammar is **not** a substitute for the registry's verdict model; it is a *source of the gate inventory* (which commands are lane gates) plus a *cross-check* (does the registry cover them). That is exactly the reuse the overlap justifies.

## Findings

**K65ConnOverlap-1 — medium — harm-matrix keeps a second, drifting inventory of the lane's registry home (SKILL.md).**
Attacks: the completeness of the "no axis harmed" check. PROTOCOL.md:398-403 names SKILL.md the registry home; the harm registry is a parallel JSON that names 20 (v1) / 36 (v2) of the lane's 33 checklist gates. A gate added to SKILL.md but not to the registry is a gate the harm matrix never runs — the masked-verdict class the round's ratchet targets, inside the tool built to catch it. The registry `note` names 4 exclusions; the measured gap is 15 rows (6 of them cheap selftests).
Reproduce: `node .ufo/waves/round-65/build/K65ConnOverlap/registry-coverage.mjs --lane /home/vgpnk/Projects/shokunin/kumitate-shokunin --gates /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/harm-matrix-gates.json` → `REGISTRY_COVERAGE: FINDINGS checklist=33 registry=36 findings=13 unregistered=5 unlisted=8 exit_diverges=0`, exit 1 (run against the *current working-copy* registry, 36 rows).
Severity note: this is a **coverage** finding, not a break of the frozen predicate — the v2 registry already closes 10 of the 15 (measurement in Evidence §3).

**K65ConnOverlap-2 — low — the fleet already owns the two pieces harm-matrix could reuse, and each is in another lane's province.**
Attacks: duplication of a comparator. The nearest fleet artefacts are `kotoba-shokunin/verifiers/check_gate_finding_delta.py` (one gate, two revisions, finding-id delta, `:19-24`, `:113-131`) and `souji-shokunin/tools/souji-coverage-agreement.py` (`--base-rev` + `KILL-RULE`, `:120-141`). Neither runs a *registry* of gates at two revisions; neither classifies clean→not-clean. Ownership: **kumitate owns the gate-transition comparator** (it is the lane's own gates and the lane's own admission rule); kotoba owns finding-id deltas for kotoba's corpus gates; souji owns coverage-map agreement; tsukuroi owns registry-row↔tool coverage for tsukuroi's PROTOCOL-shaped table (`tsukuroi-shokunin/tools/check-registry-coverage.py:262`). Nothing here is contested; the report should *cite* the two neighbours, not merge them.
Reproduce: `grep -rl "check_gate_finding_delta\|souji-coverage-agreement" /home/vgpnk/Projects/shokunin/*-shokunin/{verifiers,tools,scripts}` and read the cited lines.

**K65ConnOverlap-3 — low — the sibling's registry-v2 (36 rows) does NOT break the frozen H3 predicate; it is safe to integrate.**
Attacks: the fear that widening the registry changes the frozen verdict. Measured with the **committed** v1 tool over both frozen pairs: PAIR_A → `harm=2` with exactly `readme-map` and `proxy-check`; PAIR_B → `harm=0`, `readme-map`/`proxy-check` REPAIRED. The widened registry adds `cap-run-selftest` REPAIRED and two NEW_OK rows (absent at base) — none in the HARM/HARM_ABSENT/NEW_RED set the sentence constrains. This retires the objection and is a **strengthening** (H5's "gates ≥ 14" is met at 35 counted rows, not 19).
Reproduce: `node /tmp/kumitate-r65/K65ConnOverlap/tool/harm-matrix.mjs --lane <lane> --base a004902d… --tip 47fe2383… --gates <lane>/.ufo/waves/round-65/build/K65ExecHarmRegistry/registry-v2.json --timeout 120` → `HARM_MATRIX: HARM gates=35 … harm=2`, exit 1.

**K65ConnOverlap-4 — info — `surface-probe --checklists` cannot be reused AS the gate runner; it can be reused as the gate inventory.**
Attacks: the reuse option. `--checklists` runs one tree only (`--self DIR`, no `--rev`), and its verdict is a substring test that reads `CITE_CHECK: DRIFT` as PASS (measured above). What it *does* own is the frozen grammar for "which commands are lane gates" (`scripts/surface-probe.mjs:278`, `:979`), and that is the reuse. `scripts/surface-probe.mjs` exports nothing and self-executes at `:1903`, so the grammar must be **copied** (option 1) or **lifted into a shared module** (option 2) — importing it does not work.
Reproduce: `node scripts/surface-probe.mjs --help` (no `--rev`); `node -e "import('…/surface-probe.mjs')"` (prints a full `SURFACE_PROBE:` report before resolving).

**K65ConnOverlap-5 — medium — the matrix's sandbox mechanism is a FOURTH revision-materialization mechanism in the lane, and the most expensive one; the lane already has three, one of which restores git-ness at 29 % less disk.**
Attacks: the tool's operational cost and the reuse axis. The lane already materializes a revision three ways: `git archive | tar -x` (`scripts/plan-before-ready.sh:178`, `scripts/receipt-evidence.mjs:100-103`, measured **194 MiB**, no `.git`), `git ls-tree` + `git show` per blob (`scripts/gate-mutants.mjs:739-770`, no checkout at all), and `git clone --shared --no-checkout` + `checkout` (kotoba's pattern, `kotoba-shokunin/verifiers/check_gate_finding_delta.py:59-88`, measured **196 MiB**, `.git` 2.2 MiB of alternates). `scripts/harm-matrix.mjs:74-81 sandbox()` uses `git clone --no-hardlinks --no-checkout` + `checkout` = **276 MiB** with an **83 MiB private `.git`**, and it holds **two** of them at once (base + tip) ⇒ ~552 MiB per invocation. This is not theoretical on this host: with four matrix runs in flight `/tmp` reached **100 % (345 MiB free)** and a plain `git clone` of the lane died with `fatal: failed to copy file … No space left on device`; removing my own 275 MiB scratch clone recovered 4.0 GiB. The tool cleans up correctly (`scripts/harm-matrix.mjs:135-136 rmSync` in a `finally`), so the *leak* is not the tool's — the *peak* is. Measured coverage: **16 of the 20 registry gates read identically in a bare `git archive` tree**; the two that do not are `round-gate` (`NOT_A_GIT_WORK_TREE`) and `anchor-truth --base` (`BASE_UNREADABLE`, it needs `git show REV:path`, `scripts/anchor-truth.mjs:245,745`), and **both are restored by the `--shared` clone** (measured: `TRUTH note=corpus/knowledge/remaining-scripts-census.md anchors=521 true=508 debt=4 unchecked=9`, no BASE_UNREADABLE). Concrete strengthening (never a relaxation): switch `sandbox()` to `git clone -q --shared --no-checkout` + `checkout` (or `git archive` + `git read-tree` + `GIT_DIR`/`GIT_WORK_TREE`, the kotoba pattern, measured to restore git-ness: `NOT_A_GIT_WORK_TREE` → `REPORTS_DIR_MISSING`). Note the `round-gate` reports-dir escape (`scripts/round-gate.mjs:154` `DEFAULT_MAIN_REPO = resolve(HERE, '..', '..')` ⇒ the sandbox's **parent**) is independent of the sandbox mechanism and needs its own pin in `round-gate.mjs`, not in the matrix.
Reproduce: `D=$(mktemp -d); git clone -q --no-hardlinks --no-checkout <lane> "$D/c"; git -C "$D/c" checkout -q 47fe2383…; du -sh "$D/c" "$D/c/.git"` → 276 MiB / 83 MiB; then `git clone -q --shared --no-checkout <lane> "$D/s"; du -sh "$D/s" "$D/s/.git"` → 196 MiB / 2.2 MiB.

**K65ConnOverlap-6 — info — a fleet-root instrument is a neutered fork of souji's two-revision comparator (adjacency watch, outside this lane's write scope).**
Attacks: precedent hygiene, not C1. `/home/vgpnk/Projects/shokunin/m-rev-vs-rev.py` is tracked in the fleet repo (`git ls-files -s m-rev-vs-rev.py` → `4b4d076f…`) and is byte-identical to `souji-shokunin/tools/souji-coverage-agreement.py` except **one** line: `base = grounds` (`m-rev-vs-rev.py:118`) where souji has `base = entry_grounds(root, base_rev, knowledge_tree(root, base_rev))` (`souji-coverage-agreement.py:118`). The neutered line makes the `--base-rev` kill rule vacuous. Measured on a purpose-built fixture (a `ground: F1` entry that loses its ground between two commits): souji's tool prints `MISMATCH KILL-RULE corpus/knowledge/x.md base_grounds=F1 lost=F1 rev_grounds=none` … `kill_violations=1`, **exit 1**; the fleet-root copy prints `grounded=0 mapped=0 dangling=0 mismatches=0 kill_tested=0 kill_violations=0`, **exit 0** — the base-rev arm reads *nothing tested*. It is not kumitate's file and kumitate must not patch it; it is exactly the "masked verdict" shape C1's ratchet targets, and it is the reason a new two-revision comparator must be pinned to the revision it names. (kengaku r32 already filed it as a misroot candidate: `kengaku-shokunin/.ufo/waves/round-32/build/R32DraftMistakes.md:35`.)
Reproduce (fixture commits are made **only** inside `$D`, with `-c user.name`/`-c user.email` on the commit call, per the lane's git-fixture rule; no lane or fleet repository is written):
```
D=$(mktemp -d) && git -C "$D" init -q && [ "$(git -C "$D" rev-parse --show-toplevel)" = "$D" ] \
 && mkdir -p "$D/corpus/knowledge" \
 && printf '# R\n\n| ground | x | entries |\n|---|---|---|\n| F1 | a | `knowledge/x.md` |\n' > "$D/corpus/README.md" \
 && printf -- '---\nground: F1\n---\n\nx\n' > "$D/corpus/knowledge/x.md" \
 && git -C "$D" add -A && git -C "$D" -c user.name=t -c user.email=t@t commit -qm base \
 && BASE=$(git -C "$D" rev-parse HEAD) \
 && printf -- '---\n---\n\nx\n' > "$D/corpus/knowledge/x.md" \
 && git -C "$D" add -A && git -C "$D" -c user.name=t -c user.email=t@t commit -qm tip \
 && TIP=$(git -C "$D" rev-parse HEAD)
$ python3 …/souji-shokunin/tools/souji-coverage-agreement.py --root "$D" --rev "$TIP" --base-rev "$BASE"
MISMATCH	KILL-RULE	corpus/knowledge/x.md	base_grounds=F1 lost=F1 rev_grounds=none
grounded=0 mapped=0 dangling=0 mismatches=0 kill_tested=1 kill_violations=1
exit=1
$ python3 /home/vgpnk/Projects/shokunin/m-rev-vs-rev.py --root "$D" --rev "$TIP" --base-rev "$BASE"
grounded=0 mapped=0 dangling=0 mismatches=0 kill_tested=0 kill_violations=0
exit=0
```

## Ownership (the adjacency answer, in one place)

| ground | owner | why |
|---|---|---|
| the two-revision **lane-gate transition classifier** (HELD/REPAIRED/HARM/… over a registry of lane gates, each revision in its own sandbox) | **kumitate**, `scripts/harm-matrix.mjs` + `scripts/harm-matrix-gates.json` + `scripts/harm-cases.json` | it grades *kumitate's own* gates against kumitate's own admission rule ("no axis harmed"); no sibling lane holds kumitate's gates, and no fleet or sibling tool does this job (§1) |
| the **SKILL.md checklist grammar** (what a lane gate row is) | **kumitate**, `scripts/surface-probe.mjs:278,979` — reused, not re-derived | it is the lane's own frozen grammar; harm-matrix must consume it, not fork it (§6) |
| **registry-row ↔ committed-tool coverage** (a registry row that names an absent tool) | **tsukuroi** for its own PROTOCOL-shaped table (`tsukuroi-shokunin/tools/check-registry-coverage.py`), kumitate for its own GFM checklist | both lanes need it, in their own row shape; the *method* is shared, the *artifact* is per-lane |
| **finding-id delta between two revisions of one gate** | **kotoba** (`kotoba-shokunin/verifiers/check_gate_finding_delta.py`) | kotoba's corpus gates, kotoba's finding ids |
| **coverage-map agreement between two revisions** | **souji** (`souji-shokunin/tools/souji-coverage-agreement.py`) | souji's corpus coverage map; the fleet-root copy `m-rev-vs-rev.py` is an unowned neutered fork (Finding 6) and is **souji's/fleet's** to retire, not kumitate's |
| the **"no axis harmed" admission rule** | the **fleet** (`scripts/hyaku/closure-prompt.md:32-33`, `scripts/hyaku/append-closure.py:28`) | it is the closure rubric, applied by a human/LLM reviewer; harm-matrix mechanises the *gate half* of it for one lane, and does not replace the rubric |

⇒ **No contested ground.** The adjacent artefacts should be *cited* in the round's lesson as convergent prior art, and the lane's own claim is the first mechanical lane-gate transition classifier in the fleet.

## Artifacts

- `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-65/build/K65ConnOverlap/registry-coverage.mjs` — **draft** gate (L1 integrates; not in `scripts/`): parses SKILL.md with surface-probe's own frozen grammar (`CHECKLIST_RE`/`parseChecklist` copied from `scripts/surface-probe.mjs:278`/`:979`, with the upstream lines named in the file header) and cross-checks the harm registry against it. Findings `GATE_UNREGISTERED` / `GATE_UNLISTED` / `GATE_EXIT_DIVERGES` / `CHECKLIST_GRAMMAR`; exit 0/1/2/64. Measured: **exit 1, 17 findings** against the committed v1 registry (33 checklist rows vs 20 registry rows: 15 unregistered, 2 unlisted); **exit 1, 13 findings** against the working-copy 36-row registry (5 unregistered, 8 unlisted).
- `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-65/build/K65ConnOverlap/transcripts/` — the verbatim matrix outputs quoted above: `pairA-v1registry.txt` (66.44 s), `pairA-v2registry.txt` (145.08 s), `pairB-v1registry.txt` (52.61 s), `pairB-v2registry.txt` (307.96 s), `pairA-unregistered-skillegates.txt` (390.69 s) + its scratch registry, and `harm-matrix-COMMITTED-v1.mjs` (the `git show HEAD:` tool every measurement used, so the L1 can re-run without touching the in-flight working copy).
- This report: `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-65/w1/K65ConnOverlap.md`.

## Limits

- I did **not** edit `scripts/`, `SKILL.md`, `SCORECARD.md`, `.ufo/pins/`, or any frozen file. `scripts/harm-matrix.mjs`, `scripts/harm-matrix-gates.json`, `scripts/harm-cases.json` and `scripts/omp-binary-probe.sh` were **modified in the working tree** by other seats when I started (`git status --porcelain -- scripts/` showed 4 `M` rows; `scripts/harm-matrix.mjs` mtime 22:46, registry 22:52, cases 22:52) — I measured the **committed v1** from `git show HEAD:` so my numbers describe the freeze, not the in-flight tree. The L1 has since landed wave 1 as commit `2b1f416` ("wave 1 landed (45 seats) + integration — harm-matrix v2 (114 cases, 36-gate registry)"), which **integrates the sibling seat's 36-row registry-v2** and the v2 tool; my Finding 3 is therefore about what was integrated. The landed v2 keeps `git clone --no-hardlinks --no-checkout` (`scripts/harm-matrix.mjs:146`) — Finding 5's cost point is unaddressed — but it **added a `LOW_DISK` fail-closed guard** (`scripts/harm-matrix.mjs:296-300`: "two sandbox clones of this lane are ~0.2-0.5 GB each and gates write scratch: on a full TMPDIR gates fail with ENOSPC and read as FAIL_CLOSED, i.e. a false HARM (observed 2026-10-25, host /tmp at 100%)"), so the ENOSPC-as-false-HARM hazard I measured is now guarded. The `--shared` **cost** reduction (Finding 5) remains a separate, unaddressed move.
- The landed v2's own PAIR_A/PAIR_B readings are other seats' re-measurement scope (K65ExecGateDryrun landed `close/harm-matrix-*.txt`); the numbers in §5 are the committed **v1** tool against the v1 and v2 registries, which is the combination that answers "does widening the registry break the frozen H3 clause".
- The `--only`/timeout/registry semantics of the v2 rewrite, and whether the 16 frozen controls still pass under it, are other seats' scope (K65MutateToolRender, K65ReviewToolClassify, K65ReviewToolSandbox).
- I did not audit the **sandbox-escape / hostile-tip** surface of the matrix (K65SentinelHarmExec) nor the CARRIED/CARRIED_MOVED normalisation (K65ExecHarmNormalize); my PAIR_B `moved=1` row is a v1 artifact I did not attribute.
- I did not measure the **v2** registry's own verdict at PAIR_A/PAIR_B against the *v2 tool* — only the committed v1 tool against both registries, which is the combination that answers "does widening the registry break the frozen H3 clause".
- `registry-coverage.mjs` is a **draft**: its `GATE_EXIT_DIVERGES` check compares the registry's `ok_exit` (default `[0]`) against the SKILL.md row's exit set, but a SKILL.md row's exit set may legitimately be looser (e.g. `exit 0|1` for `cite-check.mjs`, whose 1 is a legitimate "found findings" exit). The finding vocabulary may need that distinction; it is not exercised by the current registry (`exit_diverges=0` in both runs).
- The `--shared`-clone measurement (§4) was a single checkout at `47fe2383` and a single checkout at `a004902d`; I did not run the **whole** registry through the `--shared` sandbox, so "16 of 20 read identically in an archive" is measured per-gate and the "`--shared` restores the other 2" claim is measured on `anchor-truth` and `round-gate` only. The `round-gate` reports-dir escape is a `round-gate.mjs` defect (`:154`) whose owner is not this seat.
- Host state: `/tmp` reached 100 % during my runs and a `git clone` of the lane failed with `No space left on device`; I removed **only my own** 275 MiB scratch clone (recovering 4.0 GiB). Other lanes' scratch (e.g. `/tmp/tameshi-r47-T47ConnCross`, 16 G) is not mine and I left it alone.
- The fixture in Finding 6 lives only in `/tmp`; the two tools' outputs quoted are verbatim, but I did not commit the fixture.
- No tool installed or upgraded; no pacman/uv/npx run; no `jj` command; no git write outside `/tmp` fixture repos and the lane's own build/report paths.
