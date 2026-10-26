VERDICT: H65 is replayable — a 63-line `harm-matrix.mjs` that never executes a gate scores `HARM65_HELD held=5/5` on the frozen counter, so C1's counter cannot tell the claimed capability from a lying tool; the defect is fixable and a tested four-hunk probe patch (honest tool still 5/5, both forgeries 0/5) is in the build dir.

## Evidence

Runs on `/tmp/kumitate-r65/K65CriticC1Predicate/clone` (`git clone --no-hardlinks` of the lane at 2ca91a0; forgery commits made there with `-C clone -c user.*` only). Receipts under `.ufo/waves/round-65/build/K65CriticC1Predicate/r-*.txt`.

1. Replay forgery — 63 lines, commit `3e9757744d19fe5c13fb46689854deb061c9399f` ("forge: replay-only harm-matrix v2", parent 2ca91a0):
```
$ node .ufo/waves/round-65/probe/harm65-probe.mjs <clone> 3e9757744d19fe5c13fb46689854deb061c9399f
HARM65_HELD held=5/5 checks=5 rev=3e9757744d19fe5c13fb46689854deb061c9399f rule=H65
EXIT=0
```
2. Embedded-table variant — 67 lines, commit `8d387e464d9e925b6531809018c56b3047d8f048` ("forge: embedded answer table v3"): identical verdict `HARM65_HELD held=5/5 … rule=H65`, EXIT=0. So hiding the controls from the tool's tree does not close it.
3. Masked real harm — base `47fe2383` tip `f181c10887cad8090209a5a261f7d8e92c0a2a4d` (landing that adds one bad pin):
```
real tool:  HARM_ROW gate=counter-pins base=CLEAN tip=NOT_CLEAN id=HARM … "COUNTER_PINS: DRIFT pins=26 bad=1 first=forge-demo:hash-mismatch [exit=1]"
real tool:  HARM_MATRIX: HARM gates=1 held=0 … harm=1 … base=47fe23831519 tip=f181c10887ca      EXIT=1
forged:     HARM_MATRIX: CLEAN gates=15 held=15 … harm=0 harm_absent=0 new_red=0 …               EXIT=0
```
4. Masked verdict with no measurement at all: forged tool `--base 0000… --tip f181c108` → `HARM_MATRIX: CLEAN gates=15 … base= tip=f181c10887ca`, EXIT=0.
5. The answer key is writable without notice — commit `25f4cddfd0cae8addb7ef6a6e068055d603039f3` rewrites `controls/harm/case-01-honest-held/spec.json`; the honest gate reads the tip `CLEAN`: `HARM_ROW gate=counter-pins base=CLEAN tip=CLEAN id=HELD base_text="COUNTER_PINS: CLEAN pins=30"`, EXIT=0.
6. Controls removed from the tool's tree (`.ufo` deleted), all 16 frozen fixtures run through the probe's own build/runCase harness: replay `SIM … 0/16 fixtures matched` (every fixture exit=1, ENOENT), embedded `SIM … 16/16 fixtures matched`.
7. Hardening draft `probe-h65-v2-draft.mjs` (4 hunks), same clone:
```
honest tool @2ca91a0 : HARM65_HELD held=5/5 checks=5 rev=2ca91a0… rule=H65                     EXIT=0  (4m45s)
replay  @3e9757      : HARM65_UNMET held=0/5 | H1 MISS …cases=26 ok-lines=0 | H2 MISS heldout-0:got exit=2 rows=[] | H3 MISS randPair 2ca91a0c->47fe2383 readme-map=none want=HARM | H5 MISS …rows=0 registry=20 self=false
embedded @8d387e     : HARM65_UNMET held=0/5 | same four misses with fresh random held-out ids
```

## Findings

### K65CriticC1Predicate-1 (critical) — H65 reads 5/5 for a tool that never runs a gate
What it attacks: H2, H3 and H5 are each satisfiable without measurement, so the verdict says "the tool classifies transitions" when it only says "the tool can print the expected strings". The 63-line forgery (a) prints `HARM_MATRIX_SELFTEST: PASS (20/20)` (H1, 1 line); (b) in fixture mode matches `gates.json` + base/tip trees against `.ufo/waves/round-65/controls/harm/*/spec.json` and replays `expect` (H2, 24 lines); (c) dispatches on the two `--base` prefixes the counter names and prints canned rows (H3, 10 lines: `a004902d` → two `HARM` rows exit 1, `6825a514` → two `REPAIRED` rows exit 0); (d) prints a clean summary for every other pair (H5, 2 lines). 37 of its 63 lines are attack logic; the other 26 are the same argv/format scaffolding the honest tool already has.
Reproduce: `node .ufo/waves/round-65/probe/harm65-probe.mjs <clone> 3e9757…`; the tool is in the build dir.
Fix: probe v2 hunks 1–4 (tested, honest tool unaffected).

### K65CriticC1Predicate-2 (high) — H2's oracle is co-located with its subject and is not pinned
What it attacks: the probe reads the expects from the candidate archive (`probe:88`) and runs the candidate's tool from that same directory (`probe:110`), so H2's 16 answers are readable by the thing being scored. Worse, `counter-pins` does not defend them: `.ufo/pins/counter-pins.json` pins `controls/harm/MANIFEST.sha256` as a byte string, and nothing expands its 16 per-case lines, so a rewritten `spec.json` reads `COUNTER_PINS: CLEAN` (evidence 5). H2's oracle is therefore attacker-controlled *inside the claim's own archive*.
Reproduce: commit `25f4cddf…` (one rewritten spec) → `counter-pins` `HELD`, exit 0.
Fix: tool-side — `counter-pins` must expand every pinned `MANIFEST.sha256` into its listed paths (strengthens, no relaxation); probe-side — run the tool from a sanitized copy (`cp -a A A2; rm -rf A2/.ufo`) as a cost-raiser; the durable fix stays hunk 2.

### K65CriticC1Predicate-3 (medium) — H1 is self-attested
What it attacks: H1 accepts any `PASS (n/n)` with `n >= 20`; the committed `scripts/harm-cases.json` has 26 cases and the forgery answers `PASS (20/20)`. H1 scores a string rather than a run of the case file.
Reproduce: evidence 1 (H1 passes on a tool whose selftest runs nothing).
Fix: v2 hunk 1 — count must equal `cases.length` and every `CASE ok <id>` must appear.

### K65CriticC1Predicate-4 (medium) — H5 is self-referential
What it attacks: `bad` and the exit comparison both come from the tool's own summary (`probe:179-183`); nothing ties the summary to the printed rows, and `gates >= 14` sits below the registry's 20. Fifteen invented gates with zero rows pass — and so does an unreadable base revision (evidence 4).
Reproduce: `node <A>/scripts/harm-matrix.mjs --lane <clone> --base 0000… --tip f181c108` → `CLEAN gates=15`, exit 0.
Fix: v2 hunk 4 — registry ids from the archive, one row each, summary counts equal printed row counts.

### K65CriticC1Predicate-5 (high) — H3 is a pair table, and H4's do-nothing control is too narrow
What it attacks: the counter hands the tool exactly the two revision pairs it names, so a `--base`-prefix dispatch answers both; there is no third pair and no per-gate cross-check beyond those two gates. H4 then only rejects *constant* stubs (`probe:164-175`), so its claim ("the counter can fail") holds for stubs but not for an input-ignoring tool that knows the answer key — H4 passes because `realH2ok` is true.
Reproduce: evidence 1–2 (H3 and H4 both pass for the forgery).
Fix: v2 hunk 3 (a pair chosen by measuring `readme-map` over recent history) and a permanent counter-control: both forgeries must MISS in H2/H3/H4/H5.

## Artifacts
`.ufo/waves/round-65/build/K65CriticC1Predicate/`: `forged-harm-matrix-replay.mjs` (63 lines, 5/5), `forged-harm-matrix-embedded.mjs` (67 lines, 5/5), `probe-h65-v2-draft.mjs` + `probe-h65-v2.diff` + `probe-h65-v2.md` (tested hardening), `sim-controls-hidden.mjs`, and `r-*.txt` receipts for every quoted command.

## Limits
- Rule H65 v1 is frozen and the honest tool does pass it (`base/harm65-at-freeze.txt`: `HARM65_HELD held=5/5 … rev=2ca91a0`). This report attacks what the counter can *distinguish*, not the freeze receipt; the fix must land as rule H65 v2 / a ratchet control, not as an edit this round.
- I did not build the spec-rewrite forgery (finding 2 shows the pin does not stop it); I tested the pin's behaviour only.
- The lane's `scripts/harm-matrix.mjs` changed under this seat while I worked (the current worktree tool prints `unmeasured=` / `ancestor=` fields my earlier observation did not see); evidence 3/5 receipts therefore quote the current worktree tool, while evidence 7 uses the immutable archive at 2ca91a0.
- v2's H3 hunk depends on a readme-map transition existing within the last 10 revisions of lane history; on a short or uniform history it would report `randPair:none-found` and MISS.
