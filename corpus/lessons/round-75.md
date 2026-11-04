author: kumitate L1
round: 75

# Round 75 — the OMP agent plane is declared and bound (C1) and the lane can measure how far origin has drifted from its pin (C2)

## Gate

Sources opened this round (rows appended to `corpus/SOURCES.md`; capture and exemption entries in
`.ufo/pins/source-captures.json`; the freeze/append history is in plan.md `## Amendment 1`):

- **S224 — oh-my-pi `docs/lsp-config.md`, tier A, `docs`.** Opened 2026-11-04 at tag `v18.15.0` =
  `3fedf8d53267e32a6d7521ce725fdcc4a36fdc67` (`curl -sSL`, HTTP 200; 17254 bytes, sha256
  `04b56a7d86663141a68dacb79f61d660acee1a33d56cc7a994367b8a90baf9da`; byte-identical at `main` the
  same day). Located quotes: § Config file locations, "`~/.omp/agent/lsp.json` is the default-profile
  spelling." (8 words); § Recommended locations, "User-wide preferences → active native agent
  directory's `lsp.json`" (8 words); "The user-level config in `~/.omp/agent/lsp.json` is unaffected"
  (11 words). **Admit** — official docs, names the agent-dir member exactly, grounds the `lsp.json`
  base rule; capture committed at `.ufo/waves/round-75/build/L1/lsp-config.md` (`SOURCE_CAPTURE:
  CLEAN captures=56`).
- **S225 — fleet run-state records (hyaku goal files, runs 7/9/10/15), own-work, tier B.** Opened
  2026-11-04; line-anchored quotes: run7:13 "backup `config.yml.pre-run7-20261025`"; run10:66
  "(backup config.yml.pre-more-zfl-20261027)"; run9:340 "Action: backup agent.db.pre-kimiroute-20261027";
  run10:62 "backup agent.db.pre-kimi58-unblock-20261027"; run15:25 "backup
  `~/.omp/agent/config.yml.pre-run14-20261103`". Negative sweep: `git -C
  /fast/scratch/hyaku/kumitate-pin/src grep -nE 'config\.yml\.pre-|agent\.db\.pre-' -- .` → 0 hits.
  **Admit** — the only record of who writes the pre-edit copies; grounds `config-pre` and
  `agent-pre-named`. Exempted from byte capture (operator-owned fleet state, not copied).
- **Reject — `merge/kumitate/` assimilation package (155 rows, 70 entries).** Criterion missed:
  §10 scoping proportionality — a package that large cannot be re-grounded inside a round whose two
  claims are OMP-plane repairs. **Flip:** a dedicated assimilation round; carried from round 74
  (append-only; the earlier rejection stands).
- **Reject — `models.db`'s per-store `recoverCorruption` opt-in as admitted fact.** The generic
  quarantine template is grounded (S054 `sqlite.ts:193`), but the models.db opener's opt-in was not
  located in the pinned tree. **Flip:** locate the `recoverCorruption` argument on the models.db
  open site; then the rule comment can cite it. The census comment says "per-store opt-in not
  located" and the note repeats it as an open limit.

Spot-check: **pending the non-author closure** (this lesson records the lane's own decisions; the
closure re-opens a sample of them; the round-74 spot-check agreed on both its sampled decisions).

## Mistakes

- **plan-quotes-receipt** · the frozen plan cites `open/prereqs.txt` for the 40×0600 mode sweep and
  the `scripts=57 runtime=23 other=161` classification, but the receipt at the freeze commit
  `fd7862d4` carried only identity/version lines — the commands had run ad hoc · evidence: `git show
  fd7862d4:.ufo/waves/round-75/open/prereqs.txt` vs the appended block in the same file at
  `58a90f29`; raised by seat K75ReviewFreeze · captured-by: **Q65** (a claim sentence cites its
  receipt by a path that resolves at the freeze commit and quotes that receipt's line byte-for-byte)
  — the criterion existed and caught it · fix: sweeps appended to the same file (append-only, freeze
  bytes unchanged) and disclosed in the report; next freeze writes the receipt into its file
  *before* citing it.
- **number-drift** · the plan's split of the 7 `agent.db.pre-*` findings as "4 files + 3 sidecars" is
  wrong: it is 3 files + 4 sidecars (kimi58-unblock and kimiroute each carry `-shm`/`-wal`;
  `pre-merge` has none); the total 7 and the census findings count are unaffected · evidence:
  seat K75ScribeNote report and the shape listing in `open/gates-open.txt` · captured-by: none (no
  criterion enumerates a sub-split the plan did not have to state) · fix: the report states the
  corrected split; the census is the counter, not the prose.
- **vacuous-predicate (formulation)** · C1(c)'s literal "final line `VERDICT: PASS`" is incompatible
  with the tool's preserved output `VERDICT: PASS (29 cases)` (`open/modes-open.txt:4`), so the
  literal clause could not discriminate before or after the change · evidence: reviewer K75ReviewFreeze
  (both the incompatibility and the precise receipt location) · captured-by: Q64's exercised-base
  idea (a counter whose base run does not print the expected line is unexercised) · fix: the report
  reports C1 under **both readings** — literal (does not verify) and corrected (`VERDICT: PASS (n
  cases)`, n ≥ 34) — and claims no literal conformance.
- **survivor (disclosed)** · the tip-drift fail-closed arm is doubly guarded: removing only the
  head-null refusal leaves the `rev-list` failure path, so mutant M4 survives · evidence:
  `build/K75MutTipDrift/mutation-receipt.txt`, `real-matrix.json` · captured-by: Q23's kill predicate
  (a survivor must be named, never hidden) · fix: `close/c2-mutants.txt` carries M4 and M4b (both
  guards removed) so the arm's load-bearing claim is measured, not assumed.
- **binding-arm hole (critic counterexample, disclosed)** · the executor's first binding
  implementation used `noteText.includes(name)`, so a note whose only content is an HTML comment
  listing every declared name read `bound=35/35` · evidence: `build/K75CriticClaims/note-stuffing.json`
  (exit 0, CLEAN on the stuffed note) · captured-by: none before the seat (the plan said "bind" but
  the implementation measured mention) · fix: the L1 tightened the arm before any claim verdict —
  HTML comments are stripped, a name must be an identifier token, and two selftest cases
  (`NOTE_UNBOUND-comment-only-note`, `NOTE_UNBOUND-superstring-decoys`) hold the counterexample; the
  report discloses the tightening and its residual limit (a fenced code block is visible text and
  still binds).

## Routed items (dispositioned this round)

- **R74-spotcheck D1 (pin erratum): LANDED** — append-only SCORECARD erratum names the superseded
  `pin.proxy-check d6f8dce9… → 25e7eccc…` sentence and the landed `aabf389e…`.
- **R74-spotcheck D2/D3 (receipt headers): LANDED** — every `close/` receipt carries
  `rev=<hash> date=<ISO> exit=<n>`; `live=` per Q66.
- **Spotcheck coverage recurrence (4th): LANDED** — README row + `readme-map.json` covered entry for
  `lessons/round-74-verifier-spotcheck.md` and for this file; `README_MAP: CLEAN` at close.
- **`PROXY: DRIFT` at open (C2_total 179→180, `AXES_DRIFT coverage`): LANDED** — the same recurrence
  through the proxy; the stanza is re-measured at close and `--strict` reads MATCH.
- **R74 K74MutKimi residue:** none open.
- **considerthese proposal 2 (2026-10-26, "Cross-check gate tables against the registry"): LANDED**
  as `corpus/QUALITY.md` Q71 — a lesson's `## Gate` table ids must exist in the landed
  `corpus/SOURCES.md` with a `used-by` that names the entry the Gate says they ground, checked by
  command, so an r65-D1 class mismatch fails the lane's own gate rather than the closure's.

## Round-75 verdicts

C1 — coverage:omp (new live sub-axis). Base `c38382d5`: `OMP_CENSUS: DRIFT (root=/home/vgpnk/.omp/agent
entries=64 findings=40)` exit 1 (`base/omp-census-base.txt`), score `floor(10×24/64)` = **3**. At the work revision
(the commit carrying this file): `OMP_CENSUS: CLEAN (root=/home/vgpnk/.omp/agent entries=64 findings=0 bound=35/35)` exit 0
(`close/census.txt`), score **10**; selftest `VERDICT: PASS (49 cases)` (`close/census-selftest.txt`);
specificity fixture prints `UNLISTED bogus-member-75.txt` exit 1 (`close/specificity.txt`); the five
drop-unit mutants kill with identical reruns (`close/c1-mutants.txt`). Literal C1(c) reading: **does
not verify** (see Mistakes); corrected reading: **verifies**.

C2 — operability, capability `origin-tip-drift`. Base: `--tip-drift` → `unknown argument`, exit 64
(`base/tip-drift-base.txt`). Close: `ORIGIN_TIP_DRIFT: MOVED pin=31c465f15669 origin=fb7157fcf146
commits=58 changed=241 scripts=57 runtime=23 other=161` exit 1; `--origin /fast/scratch/hyaku/kumitate-pin/src`
→ `IN_SYNC … commits=0 changed=0 …` exit 0; `--origin /tmp` → `FAIL-CLOSED SRC_REV_UNVERIFIABLE /tmp`
exit 2 (`close/tip-drift.txt`); `PROXY_SELFTEST: 132/132 pass`; default `--strict` `PROXY: MATCH`
exit 0. **Verifies.**
