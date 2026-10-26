VERDICT: No existing tool in the lane, the fleet, or any sibling lane runs lane gates at two revisions and classifies transitions — harm-matrix's job is unclaimed — but the tool duplicates the lane's *registry home* (SKILL.md) with a second, drifting gate inventory, and the concrete reuse is surface-probe's frozen checklist parser (scripts/surface-probe.mjs:278 `CHECKLIST_RE`, :979 `parseChecklist`), not a new grammar.

## Evidence

### 1. The nearest existing tools, one per candidate, and what each lacks

| candidate | what it actually does | what it lacks vs harm-matrix | citation |
|---|---|---|---|
| `surface-probe.mjs --checklists` | parses SKILL.md's 33 GFM task rows and runs each command in the working copy; prints `CHECKLIST <PASS\|FAIL> SKILL.md:<line> exit=… substring=hit\|miss` and `CHECKLIST: n/m pass` + `VERDICT: PASS\|FAIL` | **no `--rev`**: `--self DIR` is the only tree selector and it is a *directory*, so it runs the checklist at one tree only; there is no second revision, hence no transition. Its verdict is "exit ∈ expected AND output contains expect-substring" — it cannot express "clean → not clean" | `scripts/surface-probe.mjs:1028 runChecklistsMode`, `:1040` (SKILL.md path), `:1066` (`cwd: opts.self`), `:1070-1071` (exitOk ∧ substringOk), `:337` (`--self DIR` in USAGE), `:1823-1840` (parseArgs: `--src/--self/--pin/--known/--json/--strict/--checklists/--selftest`, **no `--rev`**) |
| `plan-before-ready.sh` map arm | runs `node scripts/readme-map.mjs` **inside `git archive PLAN`** — one gate, one revision (the plan commit) | one gate, one revision, no transition, no registry of gates; verdict is `map=CLEAN\|DRIFT` only | `scripts/plan-before-ready.sh:29-37`, `:137-141`, `:178` (`git archive --format=tar "$plan" \| tar -x -C "$t"`) |
| `report-receipt-diff.mjs` | diffs a *report* against the *receipts* it cites at one rev (`merge-base --is-ancestor` for orphan hashes) | reads no gate, runs no command, one revision | `scripts/report-receipt-diff.mjs:264`, `:485-500` |
| `gate-mutants.mjs` | runs 43 frozen mutants of two targets (`cite-check`, `wave-census`) against a *measured* scripts tree and classifies killed/survived/drift | one revision per run (`--rev` picks the tree, `prepareSource` loads *that* rev's scripts), mutants of 2 targets not a registry of lane gates, no base↔tip comparison | `scripts/gate-mutants.mjs:36 TARGETS`, `:739 loadRevisionScripts`, `:772 prepareSource`, `:544-553 gateExitCode` |
| `round-gate.mjs` | audits a round's filed artifacts (`--round N --repo DIR --tracked`) | one revision, artifact audit not gate execution | `scripts/round-gate.mjs:189-197` (USAGE), `:205 DEFAULT_REPO` |
| `counter-rerun.mjs` | runs **one** counter K times at **one** (lane, rev) and compares the final summary lines byte-wise | K runs of the *same* rev, not two revs; one probe, not a gate registry; no transition vocabulary | `scripts/counter-rerun.mjs:184-190 resolveRev`, `:215-233 decide` (AGREE/DISAGREE), `:169-173 childEnv` |

**Fleet scripts** (`/home/vgpnk/Projects/shokunin/scripts/`, read-only) contain only `sources-census.sh`, `shokunin-watchdog.sh` and `hyaku/`. Grep for `harm|battery|regress` hits only the *closure rubric prose* (`scripts/hyaku/closure-prompt.md:32-33` "check no owned axis was harmed (`git -C {{LANE_CWD}} diff {{BASE}} {{HEAD}} -- SCORECARD.md`, plus spot reads)" and `scripts/hyaku/append-closure.py:28 TREND_VERDICTS` `harmed`) — a **human** rule, not a tool. `.ufo/gates/root-ledgers.py` takes `--rev` but no second revision. **Nothing in the fleet runs gates at two revisions.**

**Sibling lanes** (read-only grep over `*-shokunin/{scripts,tools,verifiers}`): the only two-revision instruments are
- `kotoba-shokunin/verifiers/check_gate_finding_delta.py` — runs **one** gate's finding-ids at base and head and diffs the sets ("Exit 1 when head has a DRIFT id base did not have", `:1-24`). **Nearest sibling in the fleet by mechanism**, but: one gate, no registry, no clean/not-clean transition classes, and it diffs *finding ids*, not verdicts.
- `souji-shokunin/tools/souji-coverage-agreement.py` — compares a coverage map at `--rev` against `--base-rev` with a `KILL-RULE` class (`:120-141 kill_rule`). Same shape (base↔rev, classified transition) but over *corpus bytes*, not gate executions, and in souji's province.
- `tsukuroi-shokunin/tools/check-registry-coverage.py` — checks SKILL.md's registry rows against committed tools (`:262 _coverage`, `:194 _operative_rows`). **Nearest sibling for the registry-drift idea** (see Finding 2), but tsukuroi's rows are a PROTOCOL-shaped table (8 columns), not kumitate's GFM checklist, and it never runs a gate.
- `kotoba-shokunin/verifiers/check_tip_battery.py` — runs 6 frozen commands at **one** rev in a fleet-shaped sandbox (`:19-30`).

**Lane-internal**: `grep -rn "harm\|HARM" scripts/*.mjs scripts/*.sh` outside `scripts/harm-matrix.*` → only prose in `anchor-truth.mjs:5` and `counter-pins.mjs:8`. The only lane script taking two revisions is `scripts/anchor-truth.mjs` (`--base REV` for debt-growth/`CHECKED_SHRANK`, `:46-49`), and it compares *anchors*, not gate verdicts.

⇒ **No sibling built this.** C1's tool is unclaimed; `scripts/harm-matrix.mjs` should own it. The nearest artefacts (kotoba's finding-delta, souji's coverage-agreement) are in other lanes' provinces and neither runs a gate registry at two revisions.

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
The registry's own `note` admits this is deliberate ("Heavy or interactive gates (cite-check, gate-mutants, cap-run, surface-probe --checklists) are out of the registry") — but the note names 4 gates and the gap is 15, and 6 of the 15 are *selftests* (cheap, hermetic, no systemd) that the note does not cover. The freeze's own sibling seat already widened the registry to 36 rows (`.ufo/waves/round-65/build/K65ExecHarmRegistry/registry-v2.json`), which closes 10 of the 15.

### 3. The drift is measurable, and the "unregistered" gates carry real verdicts

`scripts/harm-matrix.mjs` at the **freeze commit** (`git show HEAD:scripts/harm-matrix.mjs`) run over the frozen pair `a004902d → 47fe2383`, with the v1 registry, reproduces the frozen H3 clause exactly:

```
HARM_ROW gate=readme-map base=CLEAN tip=NOT_CLEAN id=HARM base_text="README_MAP: CLEAN files=156 rows=156 covered=156" tip_text="README_MAP: DRIFT files=157 rows=156 covered=156 bad=2 first=uncovered:lessons/round-64-verifier-spotcheck.md [exit=1]"
HARM_ROW gate=proxy-check base=CLEAN tip=NOT_CLEAN id=HARM base_text="PROXY: MATCH (A=351 C=33 operability=9; …)" tip_text="PROXY: DRIFT (C2_TOTAL_DRIFT …; AXES_DRIFT term=coverage declared=10 computed=9; src-rev=31c465f15669) [exit=1]"
HARM_MATRIX: HARM gates=19 held=15 repaired=0 carried=2 moved=0 new=0 gone=0 harm=2 harm_absent=0 new_red=0 base=a004902d77d1 tip=47fe238319
```
(exit 1, 66.44 s). Same tool on PAIR_B `6825a514 → a004902d`: `HARM_MATRIX: CLEAN gates=19 held=14 repaired=2 … harm=0` with `readme-map` and `proxy-check` both `REPAIRED` (exit 0, 52.61 s). Both match the frozen H3 sentence.

With the sibling seat's proposed **registry-v2** (36 rows) the same tool on PAIR_A reads `HARM_MATRIX: HARM gates=35 held=30 … harm=2 harm_absent=0 new_red=0` — the two HARM rows are still exactly `readme-map` and `proxy-check` (exit 1, 145.08 s) — and on PAIR_B `HARM_MATRIX: CLEAN gates=35 … harm=0` with `readme-map`/`proxy-check` REPAIRED plus `report-receipt-diff-selftest` and `jj-seat-demo` NEW_OK and `cap-run-selftest` REPAIRED (exit 0, 307.96 s). **The widened registry does not break the frozen H3 predicate**; it adds coverage and one extra transition class the plan's H3 sentence does not forbid (H3 constrains HARM/HARM_ABSENT/NEW_RED only).

### 4. The reuse option, with the parser's file:line

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

**K65ConnOverlap-5 — info — a fleet-root instrument is a neutered fork of souji's two-revision comparator (adjacency watch, outside this lane's write scope).**
Attacks: precedent hygiene, not C1. `/home/vgpnk/Projects/shokunin/m-rev-vs-rev.py` is tracked in the fleet repo (`git ls-files -s m-rev-vs-rev.py` → `4b4d076f…`) and is byte-identical to `souji-shokunin/tools/souji-coverage-agreement.py` except **one** line: `base = grounds` (`m-rev-vs-rev.py:118`) where souji has `base = entry_grounds(root, base_rev, knowledge_tree(root, base_rev))` (`souji-coverage-agreement.py:118`). The neutered line makes the `--base-rev` kill rule vacuous. Measured on a purpose-built fixture (a `ground: F1` entry that loses its ground between two commits): souji's tool prints `MISMATCH KILL-RULE corpus/knowledge/x.md base_grounds=F1 lost=F1 rev_grounds=none` … `kill_violations=1`, **exit 1**; the fleet-root copy prints `grounded=0 mapped=0 dangling=0 mismatches=0 kill_tested=0 kill_violations=0`, **exit 0** — the base-rev arm reads *nothing tested*. It is not kumitate's file and kumitate must not patch it; it is exactly the "masked verdict" shape C1's ratchet targets, and it is the reason a new two-revision comparator must be pinned to the revision it names. (kengaku r32 already filed it as a misroot candidate: `kengaku-shokunin/.ufo/waves/round-32/build/R32DraftMistakes.md:35`.)
Reproduce: `D=$(mktemp -d); git -C "$D" init -q; …` (fixture recipe in the transcript below) then run both tools with `--rev <tip> --base-rev <base>`.

## Artifacts

- `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-65/build/K65ConnOverlap/registry-coverage.mjs` — **draft** gate (L1 integrates; not in `scripts/`): parses SKILL.md with surface-probe's own frozen grammar and cross-checks the harm registry against it. Findings `GATE_UNREGISTERED` / `GATE_UNLISTED` / `GATE_EXIT_DIVERGES` / `CHECKLIST_GRAMMAR`; exit 0/1/2/64. Measured: exit 1, 13 findings against the current working-copy registry (33 checklist rows vs 36 registry rows).
- `/tmp/kumitate-r65/K65ConnOverlap/` (scratch): `tool/harm-matrix.mjs` + `tool/harm-matrix-gates.json` (the **committed** v1, `git show HEAD:`), `pairA_v1registry.txt`, `pairA_v2registry.txt`, `pairB_v1registry.txt`, `pairB_v2registry.txt`, `tool/scratch-registry-unregistered.json`.
- This report: `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-65/w1/K65ConnOverlap.md`.

## Limits

- I did **not** edit `scripts/`, `SKILL.md`, `SCORECARD.md`, `.ufo/pins/`, or any frozen file; `scripts/harm-matrix.mjs`, `scripts/harm-matrix-gates.json`, `scripts/harm-cases.json` and `scripts/omp-binary-probe.sh` were already **modified in the working tree** by other seats when I started (`git status --porcelain -- scripts/` shows 4 `M` rows; `scripts/harm-matrix.mjs` mtime 22:46, registry 22:52) — I measured the **committed** v1 from `git show HEAD:` so my numbers describe the freeze, not the in-flight tree. The L1 owns that integration.
- I did not run the wave-1 executor seats' own in-flight tool rewrite (`scripts/harm-matrix.mjs` working copy, contract `kumitate-harm-matrix-v2`); my PAIR_A/PAIR_B numbers are the committed v1 only.
- The `--only`/timeout/registry semantics of the v2 rewrite, and whether the 16 frozen controls still pass under it, are other seats' scope (K65MutateToolRender, K65ReviewToolClassify, K65ReviewToolSandbox).
- I did not audit the **sandbox-escape / hostile-tip** surface of the matrix (K65SentinelHarmExec) nor the CARRIED/CARRIED_MOVED normalisation (K65ExecHarmNormalize); my PAIR_B `moved=1` row is a v1 artifact I did not attribute.
- `registry-coverage.mjs` is a **draft**: its `GATE_EXIT_DIVERGES` check compares the registry's `ok_exit` (default `[0]`) against the SKILL.md row's exit set, but a SKILL.md row's exit set may legitimately be looser (e.g. `exit 0|1` for `cite-check.mjs`, whose 1 is a legitimate "found findings" exit). The finding vocabulary may need that distinction; it is not exercised by the current registry (`exit_diverges=0`).
- The fixture in Finding 5 lives only in `/tmp`; the two tools' outputs quoted are verbatim, but I did not commit the fixture.
- No tool installed or upgraded; no pacman/uv/npx run; no `jj` command; no git write outside `/tmp` fixture repos and the lane's own build/report paths.
