# K94CriticB — C1 framing and harm-surface attack (round 94, w1)

Seat: critic B. Scope: the claim's framing (real operability vs lowered bar) and the harm surface of
`declared`. I did not build, edit, admit, or ship anything; the candidate was read only. Every claim
below names the command and carries its output under `.ufo/waves/round-94/K94CriticB/receipts/`.

**Verdict on the framing: SOUND, but NARROW — a genuine false-positive repair, not a capability gain —
and it ships one measured, previously absent escape channel that no lane gate tests.** Three
qualifications (A–C below) are facts the round's disposition should carry; none of them flips the
frozen predicate, and none of them launders a real lane commit.

## 1. Real operability move or lowered bar? Both, and the split is measurable

### 1a. For "real" (evidence)

- Axis definition (fleet `AXES.md:13`): operability is "Runnable artifacts … | A checklist item can be
  run and produces the stated outcome". The lane's checklist item (`SKILL.md:724`) is
  `node scripts/round-gate.mjs` → exit 0 + `ROUND_GATE: CLEAN`. At base, `--round 93` produces DRIFT
  exit 1 on a citation the lane's own registry declares (S267–S269, `79fa222e…`): a runnable artifact
  not producing its stated outcome. That is the axis, literally.
- The gate's own contract already says an upstream pin is a different class: header lines 108–109
  ("lane → main → origin; resolving in main/origin is an external citation and never a finding").
  The red is a false positive by the tool's own stated semantics, not a lane defect.
- Blast radius is exactly one report of 77 and the seven typo reds survive:
  `receipts/ctl-nothing-rerun.txt` → `C94_C1: UNMET a=0/1 b=7/7 c=77/77 d=1/2 e=1/1`; and my own
  independent runs: `receipts/r63-base.json` (r63 `unresolved=["9237a72"]`, exit 1) and
  `receipts/diff5-r12.diff`/`diff5-r62.diff` (only the new empty `declared` key; exit codes equal).
- Resolution precedes declaration in the shipped order (READY bytes lines 453–458, verified by reading
  them: `isDeclaredPin` sits after the lane/main/origin probes and before the probeability guard): a token that exists in lane → ancestry check,
  in main/origin → `external`. Therefore **no real commit, and in particular no non-ancestor lane
  commit, can be laundered into green** — the counter's (b) r61 `ab902da2…`/`4247d2d` proves the
  ancestry arm still fires.
- The closure had already reached the same verdict: r93 spot-check §1 line 24 classifies `79fa222e`
  as "not a defect of ancestry" and the disposition reads "C1 HELD … operability 9 unchanged
  (terminal)" (`kumitate-shokunin/SCORECARD.md:4522-4539`). So C1 changes the instrument's output,
  not any closure outcome — that is exactly what an operability repair is, and also why it cannot be
  sold as more than that.

### 1b. For "lowered bar" (measured)

The declaration is a **self-attestation channel**: a lane-authored line, checked by no automated gate
for truth. I measured the cost of silencing a typo'd lane hash with one fabricated row.

Setup: clone of the lane at the freeze (`a6e4da96`) in scratch; the fleet's r63 report at pin
`87de49a6`; fabricated row

    | S999 | fabricated locator — https://github.com/can1357/oh-my-pi/blob/9237a720123456789abcdef0123456789abcdef0/docs/none.md | docs | A | implausible scope | no anchor | teaches nothing | queued | 2026-11-06 | 30d | — |

(`9237a72` = r63's red token; the 40-hex segment exists in no repo; status `queued` — allowed by the
frozen rule's "not `rejected`").

| check | before the row | after the row | receipt |
|---|---|---|---|
| candidate/ctl-positive `--round 63` | `unresolved=["9237a72"]`, exit 1 | `declared=["9237a72"]`, `unresolved=[]`, citation finding gone | `receipts/r63-junkrow-inreg-fix.json` |
| `sources-census.sh validate --file …` | `ok` exit 0 | `ok` exit 0 (same 7 pre-existing W04) | `receipts/census-junkrow-inreg.txt` |
| `sources-check.mjs --self <clone> --json` | `CLEAN`, 6 W-only | `CLEAN`, 6 W-only (unchanged) | `receipts/sources-junkrow-inreg.json` |

So the lane's two registry gates do not see a fabricated row: `sources-check` is structural and
offline by design (its header: "does not use the network"), the census has no network either, and
`cite-sources` only checks README→S-id direction. **Silencing cost = one well-formed line, zero other
edits.** The only guard left is the human/closure probe of the URL (r93 spot-check did curl S269).

Two things bound this harm, and they are worth stating as precisely as the attack:
1. The silenced class is "tokens that resolve in no probed repo" — the same class whose red the r93
   closure already called neutral. The channel cannot hide an ancestry defect (1a) and cannot change
   any exit code for a real commit.
2. The incentive is weak: an honest fix (edit the typo) costs the same one edit as a fabricated row,
   and the fabricated row must also survive the closure's row review (which is where S267–S270 were
   actually verified, by `curl | sha256sum`).

### 1c. Transparency: the declaration is invisible in the mode the checklist runs

The rule says "no finding; listed in `--json citations.declared`". The human renderer prints **only
`!ok` checks** (`round-gate.mjs:660-665` builds `findings` from non-ok items; `:753` prints only those
plus the verdict line). So on a green round the declaration is structurally absent from human output.
Measured on the shipped candidate (`sha256 341726f3…` = the `READY` line):

    $ node <candidate> --round 93 … --main-repo …/shokunin --origin …/ufo-fsd-alpha
    ROUND_GATE: CLEAN (round=93 lane=kumitate checks=10 errors=0 warnings=0)
    $ … --json   →  {"detail":"cited=11 unresolved=0 declared=2", "citations.declared":["79fa222e","79fa222e8390aed3494f4bc6746814e6c74c21cf"], "findings":[]}

`receipts/cand-human-r93.txt`. The builder's `declared=${n}` suffix on the
`COMMIT_CITED_UNRESOLVED` detail is correct data but unreachable in human mode, because that check is
`ok: true`. The consumer that matters (the checklist item) reads the green line and cannot tell
"11 real commits" from "9 real + 2 self-declared".

### 1d. Two rule-level under-determinations the frozen counter cannot see

- **Status clause.** The rule is "status cell is not `rejected`"; a stricter "must be `mined`" rule
  is indistinguishable to the counter, because the fixture's and the real declaring rows are all
  `mined`. Measured: I patched the regenerated positive control to `!== mined → continue` and ran
  the frozen counter — `C94_C1: HELD … tool_sha256=b330a425…` (`receipts/ctl-minedonly.txt`). So the
  probe cannot certify which evidence bar shipped; a `queued` one-line row is enough (1b).
- **Probeability order.** The candidate places `isDeclaredPin` *before* the
  `mainProbeable && originProbeable` guard. On a host where origin is absent (the real
  `DEFAULT_REPO`-derived default lives at `~/Projects/ufo-fsd-alpha`; a fresh clone lacks it) the
  three declaring tokens move from BASE `unverifiable` to `declared`; verdict and exit are unchanged
  (CLEAN/0). Measured: candidate and `ctl-positive` on both shapes —
  `receipts/noorigin-cand-ready.json` / `noorigin-cand-nomain.json` vs
  `receipts/noorigin-base-noorigin.json` / `noorigin-base-nomain.json` (ctl-positive: `noorigin-ctlpos-*`). Every counter fixture passes a probeable main *and* origin (`gate(..., fx1.F, fx1.F)`),
  so (c)/(d) cannot exercise this.

## 2. Do-nothing control — re-run by me

Regenerated the controls from base bytes with `make-controls94.py` into scratch
(`base/round-gate.mjs` sha256 `09d4d792…` = the receipt's `base_sha256`), then ran the frozen counter
form:

    C94_C1: UNMET a=0/1 b=7/7 c=77/77 d=1/2 e=1/1 tool_sha256=09d4d79238f44dd74a0fa727c8f6b193c3fa87200c02340e2f4b3dcc6b354594

(`receipts/ctl-nothing-rerun.txt`). Right reason: `r93` stays `DRIFT` with
`unresolved=["79fa222e","79fa222e8390…"]` so a=0, and the sources fixture declares nothing so d=1/2;
nosources 8/8 and selftest 61/61 still pass — i.e. BASE is not broken, it is simply the do-nothing
shape. I also re-ran the regenerated `ctl-positive` myself (`receipts/ctl-positive-rerun.txt`):
`C94_C1: HELD a=1/1 b=7/7 c=77/77 d=2/2 e=1/1 tool_sha256=c67dbc8d…` — the controls directory's claim
reproduces byte-for-byte from the generator.

## 3. Candidate at READY — counter, 5-round diff, consumer check

`K94ExecTool/READY` appeared at 20:55 with `341726f3854ce424c433dfe7d4321301bc9803bc72b0b6a1657e9387f82dae20`,
identical to the bytes I had measured; the builder's earlier revision was `77f6470b…`. The frozen counter
at the READY sha with the assignment's run form:

    C94_C1: HELD a=1/1 b=7/7 c=77/77 d=2/2 e=1/1 tool_sha256=341726f3854ce424…
    C94 SELFTEST exit=0 ROUND_GATE_SELFTEST: 71/71 pass ok=true

(`receipts/cand-ready-counter.txt`).
The human-mode receipt, the no-origin fixture and the 5-round diff below were all taken on these same
bytes, so they describe the shipped candidate, not a draft.

- 5 rounds (1, 12, 44, 62, 93), BASE vs tool, full `--json` normalised (only `durationMs` dropped):
  r1/r12/r44/r62 differ **only** by the new `citations.declared: []` key; r93 differs exactly by the
  intended flip (`DRIFT/1 → CLEAN/0`, finding removed, detail `cited=11 unresolved=0 declared=2`).
  Receipts: `receipts/diff5-cand-r{1,12,44,62,93}.diff` (the `diff5-r*` set is the same diff run against `ctl-positive`). No other behaviour change surfaced in the JSON:
  no check outside the citation block changes kind/ok/severity, and no exit code outside r93 moves.
- No lane consumer parses `citations` (`grep -rn citations scripts/*.mjs` hits only `cite-check`,
  which is a different object), so the added key breaks nothing.
- The candidate also carries `declared=${n}` on the detail (see 1c) — additive, harmless, inert in
  human mode.

## 4. Impacted axes

- **operability** (claim axis): predicate is on the cited-token set; scored term stays 9 (terminal) —
  the claim is a repair, not a gain, and the disposition should not claim otherwise.
- **coverage rows** (all 10): untouched by this claim's diff (one tool file + one SOURCES row);
  I did not run the K3 harm battery (K94ExecHarm's assignment) and make no claim about it.
- No duplicate authority is introduced for *lane ancestry* (resolution still wins), but the registry
  becomes the authority for the `declared` class — which is already the lane's trust model for every
  other S-row (structure-checked, truth by review).

## 5. Smallest safe corrections (in order of safety)

1. **Make the declaration visible in human mode (zero-risk, additive).** When
   `citations.declared.length > 0`, emit one non-finding note line before the verdict, e.g.
   `ROUND_GATE  note  COMMIT_CITED_DECLARED  declared=N [tokens]`. Keeps both pinned readers: the verdict regex
   (`^ROUND_GATE: (CLEAN|DRIFT) \(round=…\)$`, asserted at `round-gate.mjs:964`) takes the **last**
   non-empty line, and `parseFindings` (`:958-963`) matches only `^ROUND_GATE  (error|warning)  …`, so
   a `note` line before the verdict is invisible to both. All exits unchanged; the frozen counter reads
   `--json` and `--selftest` only. One extra selftest arm.
2. **If a stricter evidence bar is wanted, require the declaring row to be `mined`.** Proven
   counter-compatible (`receipts/ctl-minedonly.txt` HELD), but it *changes the frozen rule text*
   ("not `rejected`"), so route it as a discovered option for the round's disposition / next
   pre-registration — do not ship it under this frozen predicate.
3. **Disclose 1d in the round disposition**: the probeability-order delta and the
   status-clause under-determination are real, unexercised by `probe94-c1.mjs`, and a future reader
   of `C94_C1: HELD` would otherwise read more than was measured.

## 6. What would falsify my verdict

- A fabricated row that *also* survives the closure's row review (needs network/curl agreement) would
  make the escape real in practice rather than in principle.
- A declared token in a future report reaching green while the token names a commit that exists in a
  repo the gate could have probed (e.g. a second remote, a not-fetched branch) would make `declared` a
  truth-laundering channel; today resolution precedes declaration, so that is not reachable.

Scratch fixture `fx.MjomUk` and the lane clone live under
`/fast/scratch/hyaku/kumitate-r94/K94CriticB/` (removed before yield); all cited outputs are copied
under `receipts/`. Lane writes: this report and `receipts/` only.
