# RevIntegration — close-sequence ordering review (round 52, read-only)

Scope: plan §`Close sequence — R52-11 discipline` (plan.md:179-192) against the frozen counters
`.ufo/waves/round-52/probe/attest52-probe.mjs` (rule A52 v1, 13 checks) and
`.ufo/waves/round-52/probe/doctrine52-probe.mjs` (rule D52 v1, 5 checks), the proxy's frozen
term derivations (`scripts/proxy-check.mjs`), and the round-gate/checklist audit
(`scripts/round-gate.mjs`, `scripts/surface-probe.mjs --checklists`).
Lane tip at review: `ac56743` (9 committed files under `.ufo/waves/round-52/`).
No edits, no installs (no pacman/uv/npx used). No language server is available to this seat
(no `lsp` device in the toolset), so caller/definition evidence is code reading + literal
grep; that substitution is recorded, not presented as semantic proof.

## Severity-ordered findings

### HIGH-1 (hazard a, inverted) — the sequence as written cannot produce a HELD `FINAL` receipt: step 1's commit inventory omits four artifacts A52 reads at R1

Evidence. Plan step 1 (plan.md:181-183) enumerates the integration commit contents; the three
genuine receipts, the doctored control and the counter-mutant transcript are **not** in that
list. Step 2 (plan.md:184-185) then sets `R1 = that tip` and runs the counters against R1.
A52 reads, at the rev:
- `B2` → `.ufo/waves/round-52/receipts/attest52-run-{1,2,3}.txt` + `.sha256` (probe :26 `RDIR`, :198-234);
- `B3` → `receipts/attest52-run-2-replayed.txt` (:249-255);
- `B4` → `verify --ledger` over `RDIR` (:303-311);
- `B5c` → `.ufo/waves/round-52/build/MutCounter52/counter-mutant.txt` (:437-447).

At the tip none exists: `git ls-tree -r HEAD --name-only | grep round-52/` = 9 files (plan, two
probes, three `base/` receipts, three `w1-*.json`); `.ufo/waves/round-52/receipts/` and
`.ufo/waves/round-52/build/MutCounter52/counter-mutant.txt` are absent **in the working tree too**
(build/ is untracked: `?? .ufo/waves/round-52/build/`).

Failure mode: literal step 1 → step 2 yields `ATTEST52: ATTEST52_UNMET held=9/13` at R1 with
`B2 MISS attest52-run-1.txt:absent;attest52-run-2.txt:absent;attest52-run-3.txt:absent`,
`B3 MISS attest52-run-2-replayed.txt absent`, `B4 MISS tool or receipts dir absent`,
`B5c MISS mutantReceipt=absent-or-malformed`; the only HELD run is then the step-3 idempotence
transcript at R2 — i.e. the committed FINAL is a receipt of a failing predicate. This is
R52-11 re-incarnated in its exact round-51 form: the committed
`.ufo/waves/round-51/close/FINAL-57333ead….txt` reads
`ATTEST51: ATTEST_UNMET held=8/9 … A5 MISS pin match;proxy exit=1 PROXY: DRIFT (A_DRIFT …=81 …=71)`.

Detection signal: FINAL line `held=9/13` (or `git ls-tree -r <R1> -- .ufo/waves/round-52/receipts`
empty); any FINAL whose quoted `rev=` tree does not contain `receipts/` and
`build/MutCounter52/counter-mutant.txt`.

Answer to (a) as literally asked ("receipts land before the stanza commit"): **term-safe and in
fact required**. Receipts are `.txt`/`.txt.sha256`; no declared term reads them (see HIGH-2 term
table), and B2/B3/B4 need them inside R1's tree. The risk in that direction is only (i) a receipt
commit that also edits `SCORECARD.md` (see LOW-2 first-match regex) and (ii) producing the
receipts with uncommitted instrument bytes — auditable only by timing, since the receipt has no
instrument-hash field (residual gap R1 below).

### HIGH-2 (hazard c) — "receipt .txt files change no counter term" is true but not sufficient: the R1→R2 re-run can flip the verdict through four channels unrelated to the receipt bytes

Term table for the R2 delta (`close/FINAL-<R1>.txt`, `close/IDEMPOTENCE-<R2>.txt`), read from
`scripts/proxy-check.mjs`:
- `A` = `walkFiles(self).filter(RE_RUNNABLE)` (:935), `RE_RUNNABLE = /\.(?:mjs|js|sh|py)$/` (:495),
  the walk prunes only `.git` trees (:682). **Receipts contribute 0.**
- `C` = SKILL.md lines `/^\s*- \[/` (:496); `C1/C1_total` = SCORECARD `/^\| (S|R)\d+ \|/` (:497);
  `C2` = `corpus/README.md` `/^\| \`(knowledge|lessons)\//` (:500); `C2_total` = corpus `*.md`.
  **0.**
- pins (:452-471) hash six (plus gate) script files. **0.**
- `S_*`/`R_*` read the origin pin clone (`.ufo/pins/origin.json`: read-only clone, `revision
  31c465f15669…`, `SRC_REV_MISMATCH`/`PIN_MALFORMED` = exit 2, :59-71); `K_*` read the host kimi
  root (`$KIMI_ROOT` or `~/.kimi-code`, `KIMI_ROOT_NOT_A_DIR` exit 2, :38/:229). **Independent of
  the lane tree.**

So the parenthetical at plan.md:186-187 is correct for the declared counts. The flip channels are:

(i) **Staging breadth.** If the receipt/idempotence commit is created with a broad `git add`,
the 961 runnable files now untracked under `.ufo/waves/round-52/build/` (measured:
`find … -type f \( -name '*.mjs' -o -name '*.js' -o -name '*.sh' -o -name '*.py' \) | wc -l`
= 938 including nested repos, 961 excluding) enter the tree and `A` moves 73 → ~1034 → `A_DRIFT`
(an `--strict` error) → B5 fails at R2 while R1 read MATCH. The class is proven live, twice:
my `node scripts/proxy-check.mjs --strict` at the **working tree** of HEAD prints
`PROXY: DRIFT (A_DRIFT term=A declared=71 computed=1048 delta=+977 …)`, while `git archive HEAD`
counts 73 runnable — the same working-tree-vs-committed split that produced round-51's close line
`A declared=81 computed=71`. Round 51 committed exactly 25 runnable build files (21 `.mjs` + 4
`.sh` under `round-51/build/`); round 52's build tree is ~38× larger.

(ii) **K-term host drift.** A `~/.kimi-code/locks` appearing/disappearing inside the close window
changes `K_members`; the round-41 record in SCORECARD is the precedent (`locks` created after the
round-open census → `kimi-census` DRIFT, checklist item 16/17). Identical lane bytes, different
verdict at R2.

(iii) **Origin pin at rev.** `.ufo/pins/*.json` is read from the archive, and the pin clone's HEAD
must equal `31c465f1` or the proxy exits 2. A pin re-derivation inside the close commit (or a
recreated clone) flips B5 with no receipt involvement.

(iv) **D52 E5 is not a function of the rev**: it shells the fleet script
`/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin kumitate`
(doctrine52-probe.mjs:118-121). Another lane editing that script, or a half-written sibling
registry, flips E5 at R2 with identical lane bytes. (`E1-E4` are archive-bound; `E4` runs the
rev's own `sources-check.mjs` inside the temp tree.)

Detection signal: a bare pair of probe lines cannot attribute a flip. The `IDEMPOTENCE-<R2>.txt`
transcript must also record: `git show --name-only R2` (include-set; every added path must end
`.txt`/`.md`), the R2 `A` count derived with `git ls-tree -r R2` (never the working tree),
`git -C <pin clone> rev-parse HEAD`, the kind listing of `~/.kimi-code` (and its `locks/`), and
the census exit — plus, cheaply, `sha256sum scripts/receipt-attest.mjs` so the instrument bytes
the receipts were produced by are named.

### HIGH-3 (hazard d) — a freeze repair after R1 voids the FINAL receipt, and no rule restarts the close

Evidence: plan.md:148-153 ("Any freeze repair after a seat finding re-runs both and commits fresh
base receipts under the same paths"); plan.md:184-192 names R1 as both citation and receipt rev.
Failure modes, in increasing blast radius:
1. Repair edits a **probe**: the committed FINAL line was produced by pre-repair probe bytes and no
   longer reproduces at the tip; the frozen predicate sentence is required byte-identical in
   probe header, SCORECARD and report (plan.md:51-53), so a header edit also breaks the sentence
   contract. Detection: re-running the counting command at the tip prints a different
   `rule=`/`version=`/`held=` than the quoted line.
2. Repair edits the **instrument**: `pin.receipt-attest` (B5, probe :420-429) must be re-derived,
   **all three genuine receipts must be regenerated** (B2 span ≥300 s from body `wall_start`,
   nonce/sha distinctness), and every corpus clause that binds a receipt blob breaks D52 E2
   (`git show <rev>:<path>` sha256 equality, doctrine52-probe.mjs:68-79). The r51 precedent binds
   receipts directly: `corpus/knowledge/invocation-attestation.md:25` carries
   `receipt:.ufo/waves/round-51/receipts/attest-run-1.txt@sha256:7b8713…`. Detection:
   `D52 … | E2 MISS … hash-miss=N`, or `B2 MISS … span=…s<300(body wall_start)`.
3. Repair **adds** a runnable file rather than editing in place: `A` +1 at every later rev while
   the stanza declares the pre-repair `A` → B5 `A_DRIFT`. The plan requires re-running the two
   counters after a repair but says nothing about re-deriving the stanza, so this is silent.
4. Repair lands after FINAL but before the report: the report's verbatim quote is stale.

Detection signal (one command): `git log -1 --format=%H -- .ufo/waves/round-52/probe/ scripts/receipt-attest.mjs SCORECARD.md SKILL.md corpus/` must equal R1 at declaration time.

### MEDIUM (hazard b) — late reports are mechanically term-neutral but contractually fatal

`.md` reports move no term (A is extension-scoped; C2 reads `corpus/README.md` rows, not
`.ufo/waves`). So A52/D52 would still read HELD at the later tip. What actually breaks:
1. The stated property "the tip carries an idempotence re-run against its own bytes"
   (plan.md:190-192) is falsified: tip ≠ R3 named in the report. Note the property is already
   imprecise at R3: the transcript committed *as* R3 records a run against R2, so the fixed point
   is "R3 differs from R2 only by `.txt`", which is an argument, not a measurement at R3.
2. The checklist audit is a function of the **fleet** reports dir, not the lane rev: round-gate's
   default `--round` is the max N with `<reports-dir>/round-<N>/<lane>.md` (round-gate.mjs:36,
   60-61), so filing round-52's report switches items 692/693 from auditing round 51 to auditing
   round 52 — with identical lane bytes H1 can read 23/23 before filing and 22/23 after
   (`REPORT_THIN` <1024 bytes, `REPORT_UNTRACKED`, `REPORT_ROUND_MISMATCH`; round-gate.mjs:68-98).
3. If the late commit stages build artifacts, channel (i) of HIGH-2 applies.

Detection signal: `test "$(git rev-parse <R3>)" = "$(git rev-parse HEAD)"` at declaration time;
re-run H1 after filing the report; `git show --stat <R3>..HEAD | grep -E '\.(mjs|js|sh|py)$'`.

### MEDIUM — the plan declares no expected term values, so the integrator has no target; give the exact prediction

Measured at `ac56743`: committed `A` = 73 (`git archive HEAD` → 73 runnable) while the stanza
declares `A=71` — the two frozen probes committed at `f539a71` are already undeclared, i.e. the
stanza is A_DRIFT before any round-52 work. `C=23`; `C1=19/19`; `C2=117`; `C2_total=118`; the
unrowed note is exactly `corpus/lessons/round-51-verifier-spotcheck.md` (the plan's "inherited
117→118 drift"); `pin.receipt-attest=4491976…` matches the shipped v1 bytes
(`sha256sum scripts/receipt-attest.mjs` = 4491976…, `--selftest` = `ATTEST_CASES: 27 passed` →
B1's ≥30-case arm correctly MISS at HEAD, the K1 control).

Expected values after step 1 as scoped (entry + `lessons/round-52.md` + three README rows —
entry, lesson, and the repair row): **`C2 = C2_total = 120`, `A = 73`** (no runnable file added),
`C = 23`, `pins = 6 match`. Any other pair is a drift: `C2=119` vs `C2_total=120` →
`COVERAGE`/`AXES_DRIFT` (coverage floors to 9); `C2=120` vs `C2_total=119` → `C2_DRIFT`. Declaring
today's 117/117 guarantees `PROXY: DRIFT`. Detection: run the proxy **inside** `git archive` of
the rev, never in the working tree (the working tree reads `computed=1048` today).

### MEDIUM — the SCORECARD FINAL quote necessarily lands after R1; its term-neutrality must be asserted

Plan step 4 requires the SCORECARD to quote the FINAL line, whose `rev=` is unknowable at step 1.
Term safety then depends on the diff: no new line matching `/^\| (S|R)\d+ \|/` (C1 — a row like
`| R52 | … |` matches; `| R52-11 | … |` does not), no `## Axes` integer change (`AXES_DRIFT` is a
`--strict` error, as my run shows today at `coverage: declared=10 computed=9`), no `pin.*=` key
change, no stanza-key edit. Recommend: put the quote in the R2 commit and assert the SCORECARD
diff touches none of those three patterns.

### LOW — B4's prior-corpora walk prunes by directory *name suffix* (`/round-52$/`)

Probe :318-330. Any receipt copy placed outside a directory literally ending `round-52` (e.g.
`close52/`, `round-52-close/`) enters the prior scan, and a transcript that embeds a receipt body
creates `nonce-reuse-in-prior` on the next run. The FINAL/IDEMPOTENCE lines themselves are safe
(A52's B2 detail prints `span=… nonces=distinct sha=distinct`, no nonce bytes). Keep every receipt
copy under `.ufo/waves/round-52/`.

### LOW — B5 reads the FIRST `pin\.receipt-attest=` match in SCORECARD.md

Probe :421-423. Quoting the pin in the round-52 prose above the stanza makes B5 score the prose
copy. Keep exactly one occurrence, inside `<!-- kumitate-proxy-v1 … -->`.

### LOW — the doctored control's provenance is unchecked

B3 only requires `TAMPERED` (probe :249-255); a control derived from a *regenerated* run-2 still
passes while no longer being "run-2 with only the prelude rewritten". Commit the derivation (the
two bodies plus a diff showing only the `run-at:` line differs) into the close transcript.

## Recommended safest commit order

`term-neutral` = only `.txt`/`.md`/prose edits; terms derived with `git ls-tree -r <rev>`, never
the working tree.

1. **C0** — v2 instrument at `scripts/receipt-attest.mjs` (plus anything it needs; count the added
   runnable files).
2. Produce **run-1** (wrapping `bind-oracle --selftest`) → ≥300 s → **run-2**
   (`sources-check`) → **run-3** (`round-gate --selftest`) with the committed instrument; derive
   the doctored control from the committed run-2; produce `build/MutCounter52/counter-mutant.txt`.
   Verify locally; commit nothing yet.
3. **C1** — receipts + sidecars + control + mutant transcript + the complete stanza (`A C C1 C1_total
   C2 C2_total` + pins + coverage + `## Axes` integers + `pin.receipt-attest`) + SKILL.md registry
   row/contract label (v2) + entry + SOURCES rows + lesson + three README rows + Q44 + LOG +
   SCORECARD round-52 section (predicate and counting command, **no FINAL quote**). Expected
   `C2=C2_total=120, A=73, C=23, pins=6 match`; then run the proxy inside the archive of C1.
4. **R1 = C1**. Run A52 + D52 at R1 and require `held=13/13` / `held=5/5`. If either is UNMET,
   **stop** — do not commit a FINAL of an unmet predicate (r51's file is the counter-example).
5. **R2** — `close/FINAL-<R1>.txt` (+ the SCORECARD FINAL quote; assert the three neutral
   patterns). Term-neutral; the receipts are already in R1.
6. Re-run A52 + D52 at R2 into a transcript that also records the include-set, the R2 `A` count,
   the pin-clone rev, the kimi-root listing and the census exit; commit as **R3**
   (`close/IDEMPOTENCE-<R2>.txt`).
7. Land late reports/artifacts **before** filing, then re-measure at the new tip
   (`close/TIP-<R4>.txt`) and quote R4 — or keep R3 as the declared tip and never commit after it.
8. Any freeze repair: restart at step 3 with a new R1′; name the superseded FINAL/IDEMPOTENCE
   files rather than leaving them to be read as current.

## Residual risk and verification gaps

- I did not execute either frozen counter end-to-end: `scripts/receipt-attest.mjs` v2 does not
  exist yet (HEAD ships v1, 4491976…), so B1/B2e/B1c against v2 are untestable now. I did execute
  the proxy (`--strict`, read-only) and `receipt-attest --selftest` (27 cases) to establish the
  A-drift and K1 baseline.
- **R1 (evidence gap)**: nothing in a receipt binds the *instrument's* bytes or the tree it was
  produced on — `argv` names `scripts/receipt-attest.mjs` but not its hash, and the record has no
  rev field. The pin in SCORECARD is a declaration, not a receipt field. A receipt produced by
  uncommitted or pre-repair bytes therefore verifies. Cheap mitigation: the FINAL transcript
  records `sha256sum scripts/receipt-attest.mjs` and the body `wall_start` is compared against
  `git log -1 --format=%cI` of the instrument commit.
- **R2 (audit gap)**: H1 (`CHECKLIST: 23/23`) is not a pure function of the lane rev (fleet reports
  dir drives items 692/693) and item 16's kimi-census reads host state; the plan's H1 sentence
  does not require re-running the checklist after filing.
- **R3 (idempotence wording)**: the R3 transcript necessarily records a run against R2; the tip's
  "own bytes" property holds only under the `.txt`-delta argument, which is now backed by the
  include-set assertion above.
- LSP unavailable in this seat; caller/definition claims rest on reading
  `scripts/proxy-check.mjs:495/500/935`, the two probes, and `scripts/round-gate.mjs:36/60-98`.
