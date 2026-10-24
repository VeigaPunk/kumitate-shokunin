# RevCounterA — adversarial review of the FROZEN counter `probe/attest51-probe.mjs` (rule A51)

Reviewer: `kumitate-r51.VariableSilkworm`. Findings only; the counter was not edited.
Axes attacked: operability (C1 predicate `ATTEST_HELD`), freeze integrity, scoring honesty.

## Probe identity under review

- Committed bytes reviewed: `git show 3ed875d34914560d3e30ee3e80bec7fa9b9e8666:.ufo/waves/round-51/probe/attest51-probe.mjs`,
  sha256 `422e67b02d844fd1c3fe2d20c9211261460c452381a111b68b0d6bc22af53cd1`. All `:NN` line cites below are this version.
- Freeze history: `06ecbf4` (v1, syntactically broken — `round-4*/**` inside the block comment) → `1fd8ace` (repair). Verified comment-only:
  `git diff 06ecbf4 1fd8ace -- .ufo/waves/round-51/probe/attest51-probe.mjs` touches only comment lines 19–21 (`round-4*/**` → `(round-48/49/50 receipt corpora)`).
- **Working tree diverges right now** (`git status` = ` M`, sha256 `5b51c9594741a7095a7ca98c2f694c5d6b7468f3cafcaf35be0dad0d716b91e2`): an uncommitted changelog block at lines 7–9 re-embeds the literal `round-4*/**` inside the block comment and is again a `SyntaxError` (`node --check` fails; see F-D).

## Headline demonstration (run, not inferred)

Built a throwaway lane `/tmp/forger-lane` (own git repo, one commit `9cb611b7761fe04081ba9d90658f17a5b65f1ebc`) containing only:

1. `scripts/receipt-attest.mjs` — a ~30-line forger: `--selftest` prints `ATTEST_SELFTEST: PASS` **and writes the three "receipts" + a "replayed" file into `cwd`'s `.ufo/waves/round-51/receipts/`** (the files do not exist in git); `verify` prints `RECEIPT: TAMPERED` when the filename contains `replayed`, else `RECEIPT: VALID`. No digests, no nonces beyond literal strings, no cryptography.
2. `scripts/proxy-check.mjs` — stub printing `PROXY: MATCH`.
3. `SCORECARD.md` — `pin.receipt-attest=` + the forger's own sha256 (self-consistent, honest arithmetic, dishonest claim).

```
$ node /tmp/a51-committed.mjs /tmp/forger-lane 9cb611b7761fe04081ba9d90658f17a5b65f1ebc
ATTEST51: ATTEST_HELD held=5/5 checks=5 rev=9cb611b7761fe04081ba9d90658f17a5b65f1ebc rule=A51 | A1 PASS | A2 PASS | A3 PASS | A4 PASS | A5 PASS
PROBE_EXIT=0
```

The counter scored a pure fabrication as `ATTEST_HELD`. Every root cause below is a line-cited mechanism of that result.

---

## Findings by severity

### F-A — CRITICAL: static forger scores `ATTEST_HELD 5/5` (demonstrated above)

The counter grades the instrument by pattern-matching verdict strings (`/ATTEST_SELFTEST: PASS/`, `/RECEIPT: VALID/`, `/RECEIPT: TAMPERED/`, `/PROXY: MATCH/` — all unanchored substring tests on `stderr‖stdout` last lines, probe:74–75, 93–94, 123–124, 136–137, 174–175) against **static, fully predictable stimuli**: fixed filenames, a fixed doctored filename, a fixed ledger dir, a fixed pin regex. Nothing the counter asks for is unpredictable to a forger, so `ATTEST_HELD` has zero discrimination power against static forgery. Plan.md:70–73's claim that "a stub script printing verdict strings cannot clear A1 … requires its exact final line from real execution" is factually wrong — the probe never observes execution, only output text. A one-line `console.log('ATTEST_SELFTEST: PASS')` clears A1; the demonstrated forger clears all five.

### F-B — CRITICAL: rev-controlled code executes inside the scored tree before evidence is read; "committed bytes" guarantee is void

The probe extracts `<rev>` to `T` (probe:60–66), then runs `node tool --selftest` with `cwd: T` (probe:73) **before** A2's `readFileSync`/`existsSync` of the receipts (probe:88–104), before A3's file check (probe:120–127), before A4's walk (probe:131–162), and before A5's SCORECARD read (probe:167–172). Each `verify` call also runs `cwd: T` and precedes the probe-side parse of the same file (probe:92 then :97/:101). The tool under test can therefore create, rewrite, or delete every byte the probe subsequently "measures" — including receipts, sidecars, doctored control, and SCORECARD.md. Demonstrated: the forger rev contained **no committed receipt files at all**; A2/A3/A4 passed on files `--selftest` fabricated during A1. The probe-side nonce/sha/span arithmetic (probe:96–115) and prior-corpus sweep (probe:139–161) are robust only against dumb forgeries — they read post-execution bytes and are fully under tool control. This voids the header contract "scores five checks over the committed bytes of `<rev>`" (probe:7).

### F-C — HIGH: A4 ledger arm is unsatisfiable by the honest reference implementation (counter defect, demonstrated)

`verify --ledger <dir>` is invoked with `dir` = `RDIR` = `.ufo/waves/round-51/receipts` (probe:40, 135) — the same directory the doctored control `attest-run-2-replayed.txt` is committed to for A3 (probe:120). The contract's ledger semantics are "walks every other `*.txt` receipt in `<dir>` and rejects a nonce already present" (plan.md:34–35). The doctored file's JSON line is intact — only its `run-at:` prelude was rewritten — so it parses and carries run-2's nonce. Therefore `verify --ledger` on the *valid* `attest-run-2.txt` must read `RECEIPT: REPLAY` → A4 MISS. Empirical, using the wave's own reference implementation `build/ExecSelftestArms/scratch/receipt-attest.mjs` (ledger walk at its lines 166–178 counts any parseable `.txt`, no self-consistency check):

```
$ node receipt-attest.mjs verify --ledger ledger ledger/attest-run-2.txt
RECEIPT: REPLAY        (A4_RUN2_EXIT=1; run-1/run-3 → VALID)
$ node receipt-attest.mjs verify ledger/attest-run-2-replayed.txt
RECEIPT: TAMPERED      (A3 arm behaves)
```

`ATTEST_HELD` is unreachable unless the shipped tool adopts an unstated "skip ledger entries whose own verification fails" semantic (the reference implementation does not — its `parseReceipt` succeeds on the doctored file). Minimal fix options for L1 adjudication: (a) probe copies the three named receipts into a fresh scratch dir and points `--ledger` there; (b) commit the doctored control outside `RDIR` (e.g. `receipts/doctored/`); (c) amend the contract to specify ledger-entry validation — must then also update plan.md:34–35 text.

### F-D — HIGH: counter is non-parseable in the working tree at review time (second instance of the v1 bug)

`git status` shows ` M .ufo/waves/round-51/probe/attest51-probe.mjs` (sha256 `5b51c959…`); an uncommitted freeze-history block was added at lines 7–9 containing `round-4*/**` inside the `/* … */` comment. `node --check` → `SyntaxError: Unexpected identifier 'round'` at line 8. The plan's counting command (`node .ufo/waves/round-51/probe/attest51-probe.mjs <lane> <rev>`, plan.md:68) executes **working-tree** bytes, so a count run right now emits a Node traceback (exit 1) — not `ATTEST_UNMET`, not the designed fail-closed exit 2 — and if committed, the "frozen" counter ships broken a second time (identical defect class to v1 `06ecbf4`, repaired `1fd8ace`). Minimal fix: reword the comment text (e.g. `round-4* subtree`); also consider running the counter from `git show`-extracted bytes so "frozen" is enforced mechanically rather than socially — the observed divergence proves the social rule already failed once this wave.

### F-E — HIGH: A5's proxy arm executes the scored rev's own `scripts/proxy-check.mjs` (stubbable); pin regex unscoped

Probe:173 runs `node join(S,'proxy-check.mjs') --strict` where `S` = extracted `<rev>`'s scripts dir — the validator is rev-controlled (demonstrated: forger's two-line stub printed `PROXY: MATCH` → arm passed). This is the concrete exploit instance of CritFreeze F1's "mutable checking authority" (`.ufo/waves/round-51/w1/CritFreeze.md:46-58`); note also its evidence that `UFO_SRC` does not guarantee the stated origin because `pins/origin.json`'s clone takes precedence inside proxy-check. Additionally the pin check `/pin\.receipt-attest=([0-9a-f]{64})/` (probe:169) is not scoped to the `kumitate-gate-pins-v1` block — it matches the first such string anywhere in SCORECARD.md. Minimal fixes: run proxy-check extracted from the freeze commit (or a counter-pinned rev) rather than `<rev>`; anchor the pin regex to the block.

### F-F — HIGH: the `run` half of the contract is entirely uncounted; selftest content unchecked

No arm ever invokes `receipt-attest.mjs run`. C1's generative contract — argv capture, `crypto.randomBytes` 128-bit nonce, `Date.now` wall pair, `process.hrtime.bigint` monotonic span, GNU `sha256sum` sidecar over exact receipt bytes (plan.md:25–32) — is unmeasured. A1 sees only the final line of `--selftest` (probe:74–75): unanchored `/ATTEST_SELFTEST: PASS/`, stderr+stdout concatenated (stderr first), `.pop()` = last line of stdout when stdout is non-empty. The mandated "≥10 hermetic cases including a flake-injection REPLAY case and a sidecar-mismatch TAMPERED case" (plan.md:39–40) is invisible to the counter — a zero-case selftest printing the line passes. A forger that never implements `run` at all scores 5/5 (demonstrated). Minimal fix: probe-side `run --out` twice, verify both receipts `VALID` with distinct nonces; count `CASE`/`PASS` lines or require the selftest's own structured tally.

### F-G — MEDIUM: A3 never verifies the lesson-M2 construction it claims to close

Probe:121–127 requires only `existsSync(rp)` and a TAMPERED/exit-1 verdict. It never diffs `attest-run-2-replayed.txt` against `attest-run-2.txt` (prelude-only divergence), never requires a present/stale sidecar, never pins the construction described in plan.md:57–59. Any committed file the tool calls TAMPERED satisfies A3 — including a file with garbage JSON (forger's committed `{}\n` passed) or a missing sidecar (reference impl maps missing sidecar → TAMPERED, its line 152 — so the "sidecar untouched" element is untested). "Closes the r50 lesson-M2 class" therefore rests on honest file construction, not counter evidence. Minimal fix: probe-side assertion that `rp` differs from run-2 only on the `run-at:` line and that `rp.sha256` equals run-2's sidecar bytes (hence `sha256(rp) !=` it).

### F-H — MEDIUM: `git archive | tar -x` extraction caveats

Probe:60–66, verified behaviors:

- **Missing rev** → `git archive` fails, `tar` exits 2 on empty stdin → pipeline status 2 → fail-closed exit 2. Verified: `PIPELINE_STATUS=2`. Sound, though for the fragile reason that the pipeline reports only tar's status (no `pipefail`): an archive dying mid-stream after emitting a valid tar prefix could yield a partial tree scored `UNMET` rather than exit-2 — a mis-scoring edge, not a forger vector.
- **Symlinks** are preserved by `git archive`/`tar`; probe `existsSync`/`readFileSync`/`statSync` all follow them — a counted rev could symlink `SCORECARD.md` or receipt paths outside `T` (into the live working tree or `/tmp`), defeating committed-bytes isolation. Lane has zero symlink entries at HEAD (`git ls-tree -r HEAD | awk '$1=="120000"'` → empty) — prospective hole, and moot given F-B's direct-write channel.
- **`export-ignore`/`export-subst`** attributes rewrite/omit bytes at archive time; the A5 pin compares *extracted* bytes, so a rev could `export-subst` the tool file and pin to extracted-vs-blob divergence. No `.gitattributes` at HEAD — prospective.
- `bash -lc` runs a login shell: host profile (`~/.bash_profile` etc.) shapes PATH → git/tar resolution is host-dependent (low; also makes the probe non-portable where `tar` is bsdtar — `tar -x` with no `-f` is GNU/BSD-acceptable here).
- The A4 walk (`readdirSync`+`statSync`, probe:143–152) follows symlinked directories and has no cycle/depth bound: a committed symlink loop → stack overflow → outer catch → exit 2 (fail-closed DoS); a symlink `round-50/x -> /` expands the sweep to host files with no timeout (the 240 s `spawnSync` timeout covers children, not this in-process walk).

### F-I — MEDIUM: A4 prior-corpus sweep is name-filtered and same-rev-scoped

The sweep (probe:139–161) walks only `.ufo/waves/**`, skips every dir whose basename matches `/round-51$/` (over-broad: `xround-51` also skipped), and scans only basenames matching `/receipt|ReRun|L1-score/i`. ScoutReceiptCorpora's verified inventory (`build/ScoutReceiptCorpora/corpora.md:287-295`) shows exactly this blind spot live: four files contain the literal `nonce`, only `SentinelReceipt.md` is scanned — `round-50/plan.md`, `round-50/r50/CritPlan.md`, `SimplifierGuard.md` are name-filtered out. A nonce reused into any non-matching path, any path outside `.ufo/waves`, or committed under round-51 itself evades the sweep. Plan.md:151–153 (limits (c)) honestly bounds this — keep as declared-limit, not a counter defect; but note the sweep prints `prior-files=N` (probe:161) without listing which files, weakening the named negative claim.

### F-J — LOW: residual nit list

- A2 accepts receipts **without** a `run-at:` prelude (falls back to `j.wall_start`, probe:99–102) though the contract requires the prelude line (plan.md:31); also picks the *first* `{`-line, so any earlier brace line (e.g. in a banner) mis-parses → MISS (fail-safe direction).
- Verdict regexes unanchored end-to-end: a line `RECEIPT: VALID RECEIPT: TAMPERED` or `NOT RECEIPT: VALID` satisfies the patterns; the stderr-concat ordering (probe:74, `:93`) means a tool printing nothing to stdout but the verdict to stderr still matches.
- `git archive` accepts any tree-ish — no check that `<rev>` is a commit; a tag or bare tree works identically (harmless but loosens the "<rev>" mental model).
- Probe assumes JSON field names `nonce` and `wall_start` (probe:99) — coupling not stated in the contract text; fine as frozen semantics, worth naming in the entry.
- The counter executes rev-controlled code with full user privileges and no env scrubbing (probe:173 adds `UFO_SRC` but inherits all of `process.env`): a malicious counted rev could write outside `T` (lane working tree, `ORIGIN` checkout). Out of forgery scope; operational caveat for what a counting run is allowed to touch.
- `held` arithmetic is consistent: exactly five `hold()` calls execute unconditionally (probe:80,116,127,163,179); `label`/`exit` derive from `held === checks.length` (probe:187–190); usage 64 (probe:43–49), fail-closed 2 (probe:64–65, 181–182), UNMET 1 — all verified against the base reading `ATTEST_UNMET held=0/5` (`base/attest-base.txt`) and the forger's `held=5/5`. Printed `checks=5` equals the held denominator. **No arithmetic defect.**

## Residual risk and verification gaps

Even with F-B/F-E fixed (evidence snapshot before execution; trusted-validator extraction; symlink lstat-refusal), the counter can only approach soundness via **dynamic vectors** — probe-generated mutations unpredictable at commit time: rewrite a receipt's `run-at:` prelude itself → must read TAMPERED; splice run-1's nonce into run-2's JSON + recompute digests → `--ledger` must read REPLAY; invoke `run` twice → distinct nonces. All static committed vectors are forgeable by construction.

Unverified here by design: the real instrument's honest behavior (no committed `scripts/receipt-attest.mjs` exists yet at HEAD — only the scratch reference `build/ExecSelftestArms/scratch/receipt-attest.mjs`, which per F-C **cannot pass A4** as wired). Wave-2 falsifiers should not treat an `ATTEST_HELD` reading as evidence for C1's semantics; the counter currently certifies verdict-line compliance only.

## Minimal fix list for L1 adjudication (frozen file — do not apply in wave)

1. F-C: scratch-ledger dir or move the doctored control out of `RDIR` (else `ATTEST_HELD` unreachable for honest code).
2. F-D: fix the uncommitted `*/`-in-comment regression; run the counter from `git show` bytes.
3. F-B: snapshot all scored paths' bytes before first tool execution; run the tool with `cwd` outside `T`; lstat-refuse symlinks on scored paths.
4. F-E: execute `proxy-check.mjs` extracted from the freeze commit; scope the pin regex to `kumitate-gate-pins-v1`.
5. F-A/F-F: add dynamic vectors (`run --out` round-trip; probe-mutated prelude; probe-spliced nonce) and require anchored verdict lines.
6. F-G: assert prelude-only-diff + stale-sidecar construction of the doctored control probe-side.

## Evidence index

- Forger lane + transcript: `/tmp/forger-lane` rev `9cb611b7761fe04081ba9d90658f17a5b65f1ebc`; probe output quoted verbatim above (`held=5/5`, exit 0).
- A4 trap: `/tmp/a51-trap/ledger/` receipts generated by the reference `run` command; verdicts quoted verbatim.
- Probe sha256 (committed): `422e67b02d844fd1c3fe2d20c9211261460c452381a111b68b0d6bc22af53cd1`; working-tree (broken): `5b51c9594741a7095a7ca98c2f694c5d6b7468f3cafcaf35be0dad0d716b91e2`.
- Freeze-repair diff `06ecbf4→1fd8ace`: comment-only, quoted verbatim above.
- Base control reading `ATTEST_UNMET held=0/5`: `.ufo/waves/round-51/base/attest-base.txt` (matches plan.md:69 expectation).
- Cross-cited without duplication: CritFreeze F1 (validator/dependency closure, incl. `pins/origin.json` precedence over `UFO_SRC`), F2 (`A51` label absent from plan text).
- No tools installed; pacman untouched. Read-only git only; all scratch work under `/tmp`.

---

## Post-adjudication verification addendum (2026-10-24)

L1 adjudication received; re-verified each disposition against landed bytes:

| Finding | Disposition | Re-verified |
|---|---|---|
| F-A/F-B | Accepted as v2 defect; closed by v3 challenge arms (`8c07e880`) | Confirmed. Re-ran the same forger rev `9cb611b7` against v3 `8fd3cde1` (sha256 `5e75af79…`, `node --check` clean, 7 checks): `ATTEST51: ATTEST_UNMET held=5/7` — A2c and A3c both MISS (`run exit=64`, forger has no `run`). The probe-issued `a51c-<randomBytes>` nonce is unforgeable at commit time. |
| F-C | Resolved by plan addendum item 4 (committed): `--ledger` flags a nonce only when bound to a DIFFERENT record digest; the doctored control shares run-2's digest → exempt. | Confirmed textually (plan.md:184-188); consistent with my live demonstration — the exemption is exactly the semantic that makes A4 satisfiable. Reference impl `build/ExecSelftestArms/scratch/receipt-attest.mjs` predates it and needs the same-digest check to ship. |
| F-D | Transient pre-commit v3 working-tree copy; frozen bytes at `8fd3cde1` pass `node --check`. | Confirmed: extracted v3 parses; probe prints `version=v3`. |
| F-E | Accepted and recorded as declared forgery-boundary limit (judged object = committed tree at `<rev>`; r49 precedent). | Acknowledged; stands as declared limit, not a defect. |

Residual stands as adjudicated: dynamic arms (A2c/A3c) now carry the predicate's discrimination; the five static arms remain forgeable — my forger still passes all five (`held=5/7`). Caveats unchanged: A2/A3 committed-evidence reads still follow tool execution in `T` (harmless now that challenge arms gate HELD); `held=7/7` arithmetic verified consistent in v3 output.
