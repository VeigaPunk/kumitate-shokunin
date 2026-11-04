# K78ScoutSurface — C2 design recon (`omp-census --compare`)

Read-only seat; no tracked lane file was edited by this seat (the worktree's modified `plan.md`,
`controls/*` and `probe78-c1.mjs` are the planner's pre-verdict Amendments 1-3, made outside this
seat). Source pin `ad2630d0566a561ee078f47fade5644a22c10621`;
`scripts/omp-census.mjs` sha256 `14fea9c1…` (694 lines). No LSP server is mounted (`xd://lsp` →
no such tool); anchors are line-exact reads, with literal grep only as the recorded fallback.

## Deliverables

- `build/K78ScoutSurface/design.md` — contract map with quoted lines (`readShape` L143-158,
  `SHAPE_CONTRACT` L160, `validateShape` L162-179, `shapeFromFile` L181-192, `snapshot` L194-211,
  census ceiling L281, `USAGE` L314, incompatible-modes L342-346, `runShape` L376-392, `main`
  L668-687, exit wiring L689-694), the required `--compare` semantics, the 34-case adversarial
  table, 12 lie surfaces, the counter blind-spot table, and the measured candidate delta.
- `build/K78ScoutSurface/counter-read.md` — every frozen arm with its verbatim assertion, the
  exact grammar, what the counter leaves free, probe mechanics, and the satisfiability verdict.
- Evidence receipts: `counter-base-ad2630d0.txt` (default lane → exit 2),
  `counter-base-lane.txt` (base → 2/11), `counter-candidate-independent.txt` (candidate → 11/11),
  `live-vs-receipt-preimpl.txt` (live root = receipt, 64/64, no diffs), `shape-invariants.txt`
  (materialised receipt snapshot is byte-identical; symlink member = `symlink`/0777; symlinked
  root = ENOTDIR; EACCES and FIFO roots fail closed; `--shape`+`--root` = 64),
  `receipt-validation.txt` (17-row receipt matrix), `candidate-hazards.txt` (28-row candidate
  matrix incl. the `first` ordering divergence and the newline split).

## Findings

**F1 — routed defect (frozen counter, not edited), already captured by plan Amendment 2.**
`probe78-c2.mjs:25` `DEFAULT_LANE = resolve(dirname(SELF), '..', '..', '..')` lands on
`<lane>/.ufo`, not `<lane>`. The committed claim sentence's literal command therefore exits 2
before any arm: `probe78-c2: receipt …/.ufo/.ufo/pins/omp-shape.json invalid`. Measured; the
pre-data controls hide it because they pass `--lane` explicitly. With `--lane <lane>` the base
reads `held=2/11` (control A) and the integrated candidate reads `held=11/11`, exit 0 (independent
rerun on a `git archive` of `ad2630d0` + candidate). The worktree's plan Amendment 2 (pre-verdict,
append-only) already rewrites both claim invocations to the explicit `--lane` form and routes the
`DEFAULT_LANE` rewrite to round 79; Amendment 3 likewise fixes the IN_SYNC line as carrying no
`first=`, which matches the counter bytes I read. `probe78-c1.mjs:25` has the identical expression
and resolves all its lane paths through `ctx.lane` (L82-87, L147-165, L210-211); its bytes are
`5e9d9d4f…` after the unrelated Amendment-1 arm-selector fix, with `DEFAULT_LANE` untouched.

**F2 — the contract is satisfiable and the design is sound.** `--snapshot` of the materialised
pinned receipt is byte-identical to the receipt (sha `5980a0c8…`), which fixes the roundtrip
oracle: `compare(root, snapshot(root))` must be `IN_SYNC`; mode comparison must be exact equality,
not the census ceiling (a narrowed `0640` vs `0644` is `changed=1` while the census reads CLEAN);
`lstat` semantics must be inherited, so symlink members are `kind=symlink/mode=0777` and a
symlinked root is refused.

**F3 — where the frozen counter cannot see a wrong implementation.** Every drift arm has exactly
one differing name, so `first` = max passes; no arm has a content-key receipt, a symlink member,
a symlinked root, a multi-difference case, or a newline name. `design.md` §5 lists each shortcut
and the cheapest selftest kill.

**F4 — measured gaps in the integrated candidate** (`build/K78ExecCompare/omp-census.mjs`,
sha `cb0ea5d6…`; all 11 arms still pass):
(a) `first` is sorted by UTF-8 bytes (L247) while the shape contract's canonical order is JS
UTF-16 (L171 of the base file); measured divergence on `U+10000`/`U+FFFD` (candidate prints
`first=\uFFFD`, canonical min is `U+10000`).
(b) a live name containing `\n` splits the summary line (measured: `… first=aa` then `bb`);
escape `\n`/`\r`/`\t`/`\\` in the emitted name.
(c) ENOENT/EACCES roots are reported as `ROOT_NOT_A_DIR`; fail-closed but the token is false for
"missing"/"unreadable" — prefer `ROOT_UNREADABLE` or document.
(d) a live FIFO is counted `added=1` while `--snapshot` refuses the same root with
`SHAPE_INVALID`; the asymmetry is defensible but must be stated.
(e) `--work` alongside `--compare` is silently ignored (exit 0); reject or document.

**F5 — integration dependencies (not code defects).** The script bytes change, so
`pin.omp-census` (`14fea9c1…`, SCORECARD gate-pins + `proxy-check.mjs:544`) must be refreshed in
the integrating commit or strict proxy reads `GATE_PIN_DRIFT`. `--compare` must not appear
anywhere in `scripts/proxy-check.mjs` (arm 10 counts the literal). C2's other deliverables — a new
`corpus/knowledge/shape-receipt-live-drift.md`, its `corpus/README.md` row and a `SOURCES.md`
S228 row — move stanza `C2`/`C2_total` (188/188 if only that file is added), require
`.ufo/pins/readme-map.json` + `pin.readme-map` + possibly `pin.cite-sources`, i.e. exactly the
drift class that opened this round.

**F6 — live root stability.** Measured now: `live=64 receipt=64 added=0 removed=0 changed=0`
against `$HOME/.omp/agent`; `OMP_CENSUS: CLEAN (… entries=64 findings=0 bound=35/35)`. The plan's
after-state `--compare .ufo/pins/omp-shape.json` would print `IN_SYNC` at this instant; a closure
running later must re-measure rather than assume.

## Self-evaluation

Accuracy 5/5 — every anchor is a line-exact read and every behavioural claim was executed
(including an independent frozen-counter run); the one inference-class flag (C1's exposure) is
backed by the identical expression plus its `ctx.lane` path list, and is labelled as such.
Completeness 5/5 — all demanded symbols anchored and quoted, all 14 named adversarial cases plus
20 more, exact counter grammar per arm, satisfiability verdict, and the candidate delta.
Clarity 4/5 — the design doc is long by necessity (contract + matrix); the report compresses it to
six findings. Actionability 5/5 — F1 is a closure-command instruction, F4 names two cheap fixes
with line anchors, F5 names the exact pins and gates to re-run. Conciseness 4/5 — receipts and the
two required report locations are retained deliberately.
Overall 4.6/5.
