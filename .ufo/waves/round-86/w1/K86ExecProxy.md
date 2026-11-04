# K86ExecProxy — round 86 pre-registered amendment (1): A excludes `.ufo/`, A_wave added

Seat: K86ExecProxy (leaf executor). Lane: `/home/vgpnk/Projects/shokunin/kumitate-shokunin`.
Base HEAD read: `e7228850690c6bd48400140964cbaf18667fbc06` (round-86 freeze). Measured against the
round-85 tip `232350995d3001e606609aaf22ba1b58168d3655` where the pre-registration was taken.

## What changed (candidate only; nothing in production files was edited)

Candidate artifacts, all under `.ufo/waves/round-86/build/K86ExecProxy/`:

- `proxy-check.candidate.mjs.txt` — full candidate of `scripts/proxy-check.mjs`. Suffix `.txt` on purpose:
  a `.mjs` under `.ufo/` would itself move the A_wave walk. Copy verbatim to
  `scripts/proxy-check.mjs` at integration; sha256 `fd51dc98ab079141d0256ea8e74f54e49b06e88eb163ed0cea69f3ff7dca8ef7`.
- `proxy-check.patch` — `diff -u` HEAD → candidate (144 lines).
- `SCORECARD.candidate.md.txt` — full candidate of `SCORECARD.md`; `SCORECARD.patch` — its diff (28 lines).
- `selftest-candidate.txt` — the hermetic selftest output of the candidate (see Verification).
- `receipts.txt` — the commands and counts below, in one file.

Exact patch locations in `scripts/proxy-check.mjs` (HEAD line numbers):

| HEAD line | change |
|---|---|
| 119–120 | derivation doc: `A` excludes the `.ufo/` subtree; new `A_wave` doc entry (non-scoring) |
| 191 | doc: the shell-identical `find` gains `-path ./.ufo -prune` |
| 201, 208, 224 | claim-block doc (`A_wave` listed; "thirty-one keys"); findings doc (`A_WAVE_DRIFT`) |
| 531 | `TERM_KEYS` gains `'A_wave'` directly after `'A'` (so it is parsed, required, compared and printed in `--json`) |
| 619 | `FINDING_KINDS` gains `'A_WAVE_DRIFT'` |
| 978 | `deriveTerms`: `runnable` walked once; `A = runnable` not under `.ufo/`; `A_wave = runnable` under `.ufo/` |
| 987 | `terms` object gains `A_wave` (so `--json` carries it; not used by `operabilityOf`, the axes, or the verdict line) |
| 1714 | `fxBase` default `expect` gains `A_wave: 0` (no existing fixture writes under `.ufo/`) |
| after 1791 | two new selftest arms: wave-shaped `.mjs` under `.ufo/` → MATCH with `A=6 A_wave=1` (A unmoved, JSON carries A_wave); and an undeclared one → exactly `[A_WAVE_DRIFT]`, exit 1, `PROXY: DRIFT (A_WAVE_DRIFT term=A_wave declared=0 computed=1 delta=+1)` |
| 1848–1849 | the TERM_KEYS count arm: 24 → 25 |
| 1853–1854 | `parentV1Keys` gains `A_wave` after `A`; arm renamed "additive 31-key stanza" |

Imports: no import statement was touched. `./claims-check.mjs`, `./omp-census.mjs`, `./kimi-census.mjs`
resolve from `scripts/` exactly as before, so the candidate must be installed at `scripts/proxy-check.mjs`
(not elsewhere) to keep relative imports resolving.

`SCORECARD.md` stanza (`<!-- kumitate-proxy-v1`, lines 293–324 at HEAD):
- `A=972` → `A=35`
- new line `A_wave=950` after `A`
- `C2=216` → `C2=217`, `C2_total=216` → `C2_total=217`
- `pin.proxy-check=b8d52a84…` → `pin.proxy-check=fd51dc98ab079141d0256ea8e74f54e49b06e88eb163ed0cea69f3ff7dca8ef7`
- no other key changed.

## Deviation to decide at integration: `A_wave` is 950, not 945

The brief says `A_wave=945`. That is the **pre-freeze** count (`open/a-rebaseline.txt`, base `232350995`:
`git ls-tree -r … | grep -c '^\.ufo/'` = 945). The round-86 freeze commit `e7228850` itself adds five
tracked runnables under `.ufo/`: `probe/probe86-c1.mjs` and `controls/{base,noreader,replay,stub}/scripts/counter-receipt.mjs`.
Measured at HEAD: `git ls-tree -r --name-only HEAD | grep -E '\.(mjs|js|sh|py)$' | grep -c '^\.ufo/'` = **950**.
A declared 945 would read `A_WAVE_DRIFT declared=945 computed=950` at integration, so the candidate declares
950. L1 should confirm the integrated tree value and set the stanza to it; the A-side number (35) is unaffected
by the freeze because it excludes `.ufo/`.

Warning about A_wave stability during the wave: the tool walks the working tree, not git, so untracked runnables
under `.ufo/` move it. At the moment of measurement:
- tracked HEAD: 950
- working-tree walk (untracked included): **952**. Strays: `.ufo/waves/round-86/build/K86ExecTool/scripts/counter-receipt.mjs` (named in a message to K86ExecTool) and one more added during the wave.
Integration must run with no untracked runnable under `.ufo/` (or the declared value must be re-measured on the
same tree that is gated). This seat's own build directory holds no `.mjs` (only `.txt`/`.patch`), so it adds nothing.

## Verification (candidate only; no gate run)

Brief: "No tests mid-flight; L1 runs once after integration." I therefore ran only:

- `node --check scripts/proxy-check.mjs` on the candidate → exit 0.
- `node scripts/proxy-check.mjs --selftest` in a scratch snapshot of HEAD with the candidate and the patched stanza
  (`git archive HEAD` into `/fast/scratch/hyaku/kumitate-r86/K86ExecProxy/tree`, then the candidate installed) → exit 0,
  `PROXY_SELFTEST: 165/165 pass`, `VERDICT: PASS`. The two new arms are PASS at [6/165] and [7/165]; the arm
  `parent-frozen v1 parser accepts its additive 31-key stanza` is PASS (`keys=31 baseKeysMatch=true`).
- Walk twin: `find . -path ./.git -prune -o -path ./.jj -prune -o -path ./.ufo -prune -o -type f \( -name '*.mjs' -o -name '*.js' -o -name '*.sh' -o -name '*.py' \) -print | wc -l` = **35**; `git ls-tree -r --name-only HEAD | grep -E '\.(mjs|js|sh|py)$' | grep -v '^\.ufo/' | wc -l` = **35**. Equal.
- `f_O` (operability): `floor(10 × (35+45)/(35+45+3))` = `floor(9.638)` = **9**, unchanged.
- C2 = `grep -c '^| \`(knowledge|lessons)/' corpus/README.md` = 217; `find corpus/knowledge corpus/lessons -name '*.md' | wc -l` = 217.

Not run by me: `node scripts/proxy-check.mjs --strict` (live), `cite-check`, `readme-map`. The live
`PROXY: MATCH` depends on the other stanza terms (S/R/K/O/C/C1/pins of other scripts), which I did not
re-measure and did not change; L1 should run the gate once after integration. I did not install tools.

## Notes for the planner

- Only the stanza keys listed above changed. The header prose "twenty-three terms" (line 92) and
  "twenty-three/23-key" (line 1073) are pre-existing stale wording; left as is (no scope creep).
- The SCORECARD `## Axes` integers are unchanged (operability 9, coverage 10, layer and O rows untouched),
  so `compareAxes` is unaffected by A/A_wave.
- The spec sentence "the stanza carries A_wave and the tool prints it in --json" is satisfied via `TERM_KEYS`
  and `deriveTerms` (`terms.A_wave` is emitted by the existing `--json` body); the verdict line is unchanged.
