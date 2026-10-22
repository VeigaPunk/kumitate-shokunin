RESULT SentinelWitnessGaming rev=84cb1d5d8e703aafd4f73d887ba4237692ff13f9 verdict=channel used=0

SEVERITY: none for the measured code — 0 of 6 available channels is used; the same bytes behave identically under the
control and mutant prefixes (exit, case totals, case names, verbatim stdout modulo fixture paths). MEDIUM for the
round-43 defence: A1's D-static is blind to the two strongest channels, so a suite that branches on them would score
`GATE_MUTANTS: CLEAN` and print `C1_DISCRIMINATORS: PASS`. Latent, not realised: the 43 frozen manifest rows are fixed
literal substitutions and none adds such a test (grep 1 below).

EXPLOIT PATH (latent, one line, no self-source read): with the frozen counter the per-run temp dir is
`<scratchbase>/kumitate-gate-mutant-XXXXXX` for every mutant and `<scratchbase>/kumitate-gate-control-XXXXXX` for every
control, and the child's own path, TMPDIR, HOME and cwd all carry that name, while `TMPDIR/..` also lists the pristine
`kumitate-gate-source-XXXXXX` tree. A suite that prints its normal cases and then, only when its own path (or
`TMPDIR`/`cwd`) contains `kumitate-gate-mutant-`, appends `FAIL  x — y` plus an exact `VERDICT: FAIL` and exits 1,
satisfies K43(a)-(d) for all 43 rows (case total unchanged, rerun names stable) while the control passes — no verdict
path is exercised. Variant: compare own bytes with the pristine twin and fail on any difference. Both evade
`probe/c1-discriminators.sh` D-static (its pattern is `readFileSync\([^)]*(SELF|__filename|argv\[1\]|import\.meta|fileURLToPath)|\.pin\.txt|createHash`,
added diff lines only) and D-null (whose root is `disc.XXXXXX`, carrying no mutant token, so a prefix-branching suite
takes its control arm and passes).

CHANNELS AVAILABLE (6), all unused by the code:
1. Run-dir name prefix — visible in `import.meta.url`/`argv[1]`, `env.TMPDIR`, `env.HOME`, `cwd`, `os.tmpdir()`. AVAILABLE.
2. Pristine twin at `<scratchbase>/kumitate-gate-source-*/scripts/<target>.mjs` — own bytes compare SAME (control) vs DIFFERENT (mutant). AVAILABLE.
3. Scratch base listable from a run (`TMPDIR/..`): shows the source dir plus concurrent `kumitate-gate-mutant-*` siblings; a control run never sees one. AVAILABLE.
4. Own file mtime strictly newer than every sibling in `scripts/` (mutant is rewritten after the copy). AVAILABLE, jitter-sensitive.
5. Mutation is visible in own bytes/size (`stat`, `readFileSync(own path)`). AVAILABLE.
6. Load/parallelism: mutants run `--jobs 4` concurrently, controls serially alone. AVAILABLE, non-deterministic.
Not differential: identical env key set (only HOME/TMPDIR values differ, by prefix), same prlimit/cwd/timeout, no gate-set
`KUMITATE_*` variable, parent cmdline and the `--require`/owner-marker of the 84cb1d5 in-tree gate apply to both kinds.

EVIDENCE (rev 84cb1d5d8e703aafd4f73d887ba4237692ff13f9; counter = 0f4108b scripts/gate-mutants.mjs sha256 e24749e4…d4152a; mock = my clone under /fast/scratch/hyaku/kumitate-r43/seats/SentinelWitnessGaming)
1. `grep -n "kumitate-gate\|control\|mutant" scripts/cite-check.mjs scripts/wave-census.mjs` → NONE; no `process.cwd()`, no `/proc`, no self-hash in either target.
2. Env reads in the targets: cite-check `UFO_SRC`, `KUMITATE_CITE_SELFTEST_DEPTH`, `…_INJECT_FAIL`, `…_PRIMARY_ONLY`; wave-census `KUMITATE_WAVE_CENSUS_SELFTEST_INJECT_FAIL`. Frozen `sandboxEnv` returns exactly PATH,HOME,TMPDIR,LANG,TZ → none of these is set by the gate in either kind.
3. Frozen counter: `copyScripts(sourceScripts,'kumitate-gate-control-')` (l.585) / `'kumitate-gate-mutant-'` (l.606) / `'kumitate-gate-source-'` (l.708); spawn `prlimit --nproc=… -- node --max-old-space-size=128 <file> --selftest`, `cwd:<tempRoot>/work`, `env:sandboxEnv`, `detached:true`; no `--require`, no `.kumitate-gate-owner` (those are 84cb1d5-only and apply to both kinds).
4. Probe (my own file, run under the gate's exact five-variable env): `prefix_in_self_path/TMPDIR/HOME/cwd/os_tmpdir` = `kumitate-gate-control-` vs `kumitate-gate-mutant-`; `base_readable=true`; `base_entries=kumitate-gate-control-CCCCCC,kumitate-gate-mutant-BBBBBB,kumitate-gate-mutant-DDDDDD,kumitate-gate-source-AAAAAA`.
5. Twin test, substitution only in the mutant copy: CONTROL `pristine_same_as_me=SAME, bytesDiffer=0`; MUTANT `DIFFERENT, len 2678->2697 bytesDiffer=19`. Channel 2 is proven live in the frozen layout.
6. Noise control, one prefix, identical bytes twice: normalised stdout `IDENTICAL`, differing lines 0, exits 0/0.
7. Cross-prefix, identical bytes: cite-check `exits 0/0`, normalised stdout `IDENTICAL`; wave-census `exits 0/0`, only the mkdtemp fixture suffix differs (`kumitate-wave-census-UrPl8m` vs `-4RR0qa`). No verdict/case-name/exit difference.
8. Control-case totals reproduced: `75/75 cases passed (hermetic)` + `VERDICT: PASS` (cite-check), `WAVE_CENSUS_SELFTEST: 32/32 pass` + `WAVE_CENSUS_SELFTEST_PRIMARY_EXIT: 0` + `VERDICT: PASS` (wave-census) — matches the receipt's CONTROL lines 75/75 and 32/32.
9. Same manifest mutant under BOTH prefixes: `suite-any-fail` → both exit 1, one `VERDICT: FAIL` line, same sorted FAIL names (both self-observation cases); `V385-verdict-const` → both exit 1, `31/32 pass`, one `VERDICT: FAIL`, same FAIL name WC24. The kill is prefix-independent.
10. mtime channel replicated (copy `wx`, then ftruncate+write on the target): target strictly newest, delta 0.7–6.7 ms over the 9 siblings.
11. `probe/c1-discriminators.sh` D-static pattern (read at df1ceaf8) matches only `readFileSync(...SELF|__filename|argv[1]|import.meta|fileURLToPath)`, `.pin.txt`, `createHash` on added lines → a prefix test or a composed-path twin read matches none; D-null runs in `disc.XXXXXX` (no mutant token) so it takes the control arm and passes. A1's recorded backstop therefore does not cover channels 1–3.
12. No tool installed or upgraded. Scratch dirs removed, `pgrep -af kumitate-r43/seats/SentinelWitnessGaming` → none, no git/jj writes in the lane or fleet repo.

IMPACT: the C1 claim is not gamed at the measured commit (no channel is used; kills are prefix-independent), but the
round's own defence against a self-inspecting suite is narrower than A1 states: a prefix- or twin-branching suite would
score CLEAN and pass A1, so "counter CLEAN + A1 PASS" is not by itself evidence of a real second verdict path.

SMALLEST REMEDIATION (harness-side, removes the channel instead of pattern-matching it): (a) name both run kinds with
one prefix (`kumitate-gate-run-`) — the gate already knows which run it is without encoding the role in the directory
name; (b) set `TMPDIR` to `<tempRoot>/tmp` and/or keep the pristine `kumitate-gate-source-*` tree under a separate
owner-only parent, so the scratch base is not listable from a run. Then A1's D-null probe root should carry the same
shape. Optionally extend D-static to a conditional test over `process.env.TMPDIR|argv[1]|cwd` — but (a)+(b) close
channels 1–3 outright and also close the mtime/sibling channels' usefulness.
