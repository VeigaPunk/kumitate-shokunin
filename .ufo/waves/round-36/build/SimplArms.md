SIMPL arms deletions=6 kept-because-falsifiable=7

# SimplArms — dead weight in the round-36 gate delivery (read-only)

Scope: every round-36 gate change landed or in flight in `/fast/scratch/kumitate-r36/w/*/lane`
(the L1 was integrating into the lane tree while I read, so path:line citations are to the
executor lanes and may shift by a few lines after merge; function names are the durable handle).
I wrote nothing outside this report; every command below is a read, and I ran no gate.

## Deletions (6) — with the span, the loss, and why falsifiability survives

### D1 claims-check: the fidelity arm's private pin resolver and duplicate constants
Span (ExecClaimsFidelity lane, `scripts/claims-check.mjs`): `readFidelityPin` **:665-684**,
`gitHead` **:687-692**, `resolveFidelityOrigin` **:695-708**, `ORIGIN_PIN_CONTRACT`/
`PIN_DEFAULT_REL` **:93-94**; caller `runFidelity` **:735**. Replace with the pin arm's
`resolveOrigin(opts)` (KumitateR36.ExecClaimsPin lane, **:168**; needs `export`) and take
`src`/`srcRev` from it.

The executor already marked the block merge-deletable in its own words (**":661-663 INTEGRATION
(PIN v1 arm): … this block should be deleted — one origin resolution per file"**). Post-merge
the same file would hold `readPin`/`gitHead`/`resolveOrigin` (:113-193) **and**
`readFidelityPin`/`gitHead`/`resolveFidelityOrigin` (:665-708), i.e. two `gitHead`s for one
git call and two token pairs (`PIN_CONTRACT` vs `ORIGIN_PIN_CONTRACT`, same string, same file).
The two copies already differ: the pin arm sets `GIT_OPTIONAL_LOCKS=0`/`GIT_TERMINAL_PROMPT=0`
and enforces a 30 s timeout; the fidelity copy (:688) sets neither — on the read-only pinned
clone that is exactly the invariant the pin arm documents.
Loss: none — `resolveFidelityOrigin` was written to mirror the pin resolver, and `runFidelity`
already consumes `{src, srcRev}`. `RATCHET_REV_STALE` keeps firing (:744-749), against the same
verified head.
Mutation: MutPin killed M4-print-only ("src-rev computed and printed but never compared") in
`runCheck`; sharing the resolver puts fidelity's identically-shaped term under the same kill
instead of leaving a second copy that only fidelity's suite can reach.

### D2 proxy-check: drop the byte-identical pin block, import the resolver
Span (ExecProxyPin lane, `scripts/proxy-check.mjs`): `PIN_CONTRACT`/`PIN_REL`/`RE_REV`
**:336-338**, `defaultPinPath` **:341-344**, `readPin` **:351-376**, `gitHead` **:379-387**,
`resolveOrigin` **:396-417** — ~82 lines. Export claims-check's `resolveOrigin`; import it
beside `probeSections` (proxy-check.mjs **:297**).

Proven identical, not assumed:
`diff <(sed -n '/^function readPin/,/^}/p' proxy) <(… claims…)` → *readPin IDENTICAL*,
same for `resolveOrigin` and `gitHead` (all three printed IDENTICAL).
The block's own justification ("each gate must stand alone … the claims gate exports no pin
reader", proxy-check.mjs :329-334) is false on the facts: proxy-check **already cannot start**
without `scripts/claims-check.mjs` (static import, :297), and its header documents exactly that
copy-pair at `corpus/knowledge/executable-scorecard.md:323`.
Loss: none. One mutant in the shared block is still killed — by claims-check's suite (M1–M4,
4 killed / 0 survivors in `MutPin/mutation-results.json`) *and* by proxy's own pin fixtures
running the same import.
Also inside this deletion: `runCheck` repeats the dir test at **:1168**, which `resolveOrigin`
already makes at **:402** on the pinned branch. Keep one site (move it into `resolveOrigin` for
both branches) so `SRC_NOT_A_DIR` has one producer, not two with different details.

### D3 surface-probe: `readActivePin`'s file parse and `PIN_FILE`
Span (ExecSurfaceKnown lane, `scripts/surface-probe.mjs`): **:422-427** (the
`existsSync`/`JSON.parse` fallback) and **:187-188** (`const PIN_FILE`). Keep only the
`opts.pin`-object / `opts.pinRevision` branches (:418-421).
The pin arm (ExecSurfacePin lane) already owns default discovery — `PIN_DEFAULT_PATH` :179,
`defaultPinPath` :331 — and fails closed before the known arm runs. Post-merge the fallback is
unreachable; while it *is* reachable it is worse than dead: a malformed pin returns
`null` = "no active pin", silently dropping the `KNOWN_REV_MISMATCH` term.
Sequencing requirement (not a deletion, blocks the merge): `resolveKnown` must run **after**
`loadOriginPin` in `main()`; today `resolveKnown` precedes src resolution (known lane :1782).
Loss: none. Falsifiability: unchanged-to-up.

### D4 surface-probe: one token for one state — delete the `pinSuppliedSrc` special case
Span (ExecSurfacePin lane): **:1810-1817**, the `const pinSuppliedSrc` + `if (pinSuppliedSrc)
{ reportPinRefusal(new PinError('SRC_REV_UNVERIFIABLE', …)) }` branch.
An absent pin clone currently yields `SRC_REV_UNVERIFIABLE` in surface-probe but
`SRC_NOT_A_DIR` in claims-check for the same state (claims-check `resolveOrigin` :174;
the pin header there states the rule). MutPin's M2 kill is recorded against the *token*:
"PIN clone absent → SRC_NOT_A_DIR exit 2, never a fallback to the operator checkout".
Delete the branch; the existing `kind !== 'dir'` refusal already covers it.
Loss: none — still exit 2, still named. `SRC_REV_UNVERIFIABLE` keeps its contract meaning
(git absent / not a repo / HEAD not 40 hex). M2 is still killed (the fallback is still refused).

### D5 surface-probe: `SURFACE_NAMES`, the third surface list
Span: `scripts/surface-probe.mjs:262` and its only use `:717` (`surfaces: SURFACE_NAMES.length`).
Bind `const surfaces = buildSurfaces(...)` once and read `surfaces.length`.
Pre-existing, not part of round 36; listed because the round adds two more readers of the same
surface list (`LIVE_READERS`, `CHECK_ORDER`).
Loss: the count stops independently witnessing the block list. The witness that matters is
intact: the selftest pins `checks.length === 12` and every per-surface check id.

### D6 claims-check: `--fidelity` must refuse `--row` and `--json`, not ignore them
`parseArgs` (ExecClaimsFidelity lane :1166) has neither flag; `runFidelity` (:734) walks
every member section by contract and prints text only. Once `--fidelity` is wired, `--row`
cannot narrow it and `--json` has no schema — accepting them silently is the deadest form of a
flag ("the arm cannot fail" moved to the CLI). Refuse with the existing usage path (exit 64),
or thread `--row` through `probeSections`.
Loss: nothing that works today.

## Kept because removing it loses falsifiability (7)

- **K1 `DIGEST_ORDER` note** (surface-probe, `checkDigests`): after the declared-order concat
  fix the manifest is self-consistent in *any* order, so the note is the only witness of a
  reorder. Not gated on purpose — the origin owns the order.
- **K2 `dead` + `noid` counters** (fidelity): never gated, per contract — gating `noid` fails
  prose-only anchors outside the arm's claim. Their visibility is what stops "drop the symbol
  span" from reading as burn-down (nonok↓ with noid↑ on the same line).
- **K3 `PIN_DRIFT`/`PIN_MISSING` non-gating warns** (`NON_GATING_WARNS`, surface-probe :213):
  origin-owned config pin. Gating them fails every run until the origin repairs its generator;
  tree identity is now covered by `src-rev=`.
- **K4 KNOWN's all-subjects rule** (`findingSubjects`/`applyKnown`, ExecSurfaceKnown :374-405):
  excusing on (surface,kind,check) alone would let a second, unlisted verb ride the aggregate
  `VERB_UNDECLARED` finding. The subject set *is* the falsifiable part — do not "simplify" it.
- **K5 the third pin copy in surface-probe**: the only gate whose header promises "Read-only,
  zero deps" (:3) and the one checklist item 3 runs live. An import edge to claims-check would
  make item 3 fail whenever the registry parse refuses. Not mergeable with D2.
- **K6 `DIGEST_PER_FILE` and `DIGEST_CONCAT` together**: two independent declarations
  (per-file sha256 vs whole-bytes digest); a manifest can carry a correct `scriptDigest` beside
  a stale per-file hash. Neither implies the other.
- **K7 `.ufo/pins/fidelity-ratchet.json` (all-zero) and item 14's `--fidelity-ratchet`**:
  considered for deletion and rejected. All-zero ceilings do equal the no-ratchet rule, but the
  file names the 15 debt-carrying notes (an absent file cannot distinguish "burned to 0" from
  "never had anchors") and it is the only *live* trigger of `RATCHET_REV_STALE`
  (`runFidelity` :690-696). Cost: a second 40-hex revision to bump with the pin — a gate catches
  the miss, which is the acceptable direction.

## Merge hazards (no deletion; L1 must decide)

1. **Three-way divergence on the pin's required fields**: surface-probe requires `repo`
   (`loadOriginPin` :359, `repo` absent → `PIN_MALFORMED`); claims-check and proxy-check accept
   a pin without it (`readPin`: `repo: body.repo ?? null`). One rule, or the same pin file is
   valid for two gates and refused by the third. [INFERENCE] the contract's shape lists `repo`,
   so the lenient pair is the one to tighten — but that is a contract decision, not mine.
2. `SEVERITY` gains a third value `'refuse'` (ExecSurfacePin :232-235) solely to force suite
   coverage. Harmless today (nothing calls `note('refuse', …)`), but it makes `SEVERITY` a
   finding-severity map that can mint a non-gating finding. Keep the coverage force; hold the
   invariant explicitly.

## Evidence (commands run, output quoted above)

- `git -C /fast/scratch/kumitate-r36/src rev-parse HEAD` → `31c465f15669f744848bd9f5d56191c5085670f7`; clone `dr-xr-xr-x`, never written.
- `diff <(sed -n '/^function readPin/,/^}/p' proxy) <(…claims…)` → `readPin IDENTICAL`;
  same construction for `resolveOrigin` and `gitHead` → both `IDENTICAL`.
- `grep -n "PIN_CONTRACT\|PIN_REL\|RE_REV\|function (defaultPinPath|readPin|gitHead|resolveOrigin)|import { probeSections }"`
  on the proxy and claims lanes → the line numbers cited in D1/D2.
- `grep -n "PIN_FILE\|readActivePin\|pinRevision\|KNOWN_REV_MISMATCH"` on the known lane → D3;
  `grep -n "pinSuppliedSrc\|SRC_REV_UNVERIFIABLE"` on the pin lane → D4.
- `cat MutPin/mutation-results.json` → 4 mutants, 4 killed, `"survivors": []`; M2's killer text
  is the `SRC_NOT_A_DIR` expectation D4 aligns to. No mutation seat has published a survivor, so
  no deletion above removes a proven-killing arm.
- `grep -n "SURFACE_NAMES" scripts/surface-probe.mjs` → `262`, `717`.
- `sed -n '/^- \[ \] /p' ExecChecklistRewrite/lane/SKILL.md` → 14 items; item 3 uses `--known`,
  item 14 uses `--fidelity --fidelity-ratchet`. `--pin` has no checklist consumer: it is reached
  through the default pin path and is exercised only by the gates' own suites — kept, since the
  default-path form is what every verdict line depends on.

Untested by me: no gate was run (read-only seat); the digest/fidelity numbers quoted above are the executors' measurements. No tools installed.
