# ExecChecklistAudit — round 52

Axes: **operability** (C1 receipt-attest capability) and **coverage** (C2 sourced frontier entry).

## (a) Round-close artifact audit / SCORECARD

`SKILL.md:692` requires `node scripts/round-gate.mjs` → exit 0 + `ROUND_GATE: CLEAN`. In `scripts/round-gate.mjs:81,87-88,415-418,439-442`, the relevant checks are exactly: a SCORECARD line matching `^\|\s*52\s*\|` and a LOG line matching `^- \d{4}-\d{2}-\d{2} — round 52\b` (U+2014 em dash). This addresses the two round-open omissions; it does not assert that those are the only eventual close-gate conditions.

The rounds table columns are `Round | Axis | Before | After | Evidence` (SCORECARD.md:433-434). Existing compliant row, quoted from SCORECARD.md:435:

> | 50 | operability (integer held 9 — terminal under `f_O`; one claim C1, surface: `scripts/cap-run.mjs` mount-root refusal for explicit binds and the implicit cwd bind, plus the gate-pin family; sourced on S095) | `node .ufo/waves/round-50/probe/bindguard50-probe.mjs <lane> ff40d7dcbc90aa043d7f4003976af6a99ff76642` → `GUARD_UNMET held=5/8` exit 1 (G2 `/tmp` triple, G6 `pin.bind-oracle=absent`, G7 `PROXY: DRIFT`); exposure control: child write through `--bind /tmp` left `host_marker=present` (`controls/CtlExposure-base-ff40d7d.txt`) | same command at `ab3c64e9aaaff80faf3a2c93743287e44def4084` → `BINDGUARD50: GUARD_HELD held=8/8` exit 0 (`close/G50-ab3c64e9.txt`); the first guard commit `227b9e6` read `held=6/8` (stale `pin.cap-run`) and is retained as the failing receipt; the explicit `/tmp` refusal pre-landed at `378b6e7` and G50 already read 8/8 at `6927903` (attribution limit, `close/CritCloseClaims.md` §2); auxiliary `node .ufo/waves/round-50/probe/repairs50-probe.mjs <lane> <rev> --fleet /home/vgpnk/Projects/shokunin` → `LEDGER_HELD held=8/8` exit 0 (base `held=1/8`) | `node .ufo/waves/round-50/probe/bindguard50-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin <rev>`; `.ufo/waves/round-50/close/G50-*.txt`, `close/R50-*.txt`; plan `.ufo/waves/round-50/plan.md`; lesson `corpus/lessons/round-50.md` |

Draft `| 52 |` row (computed/close-only slots intentionally marked; replace the bracketed expected lines with the actual committed outputs):

```markdown
| 52 | operability + coverage (C1 `receipt-attest` v2; C2 `fail-closed-clock-validation`, sourced on S102/S103) | A52 base: `ATTEST52_UNMET held=5/13 checks=13 rev=02c01258464cac3804faf177d0cfbf113cd59706`; D52 base: `DOCTRINE52_UNMET held=0/5 checks=5 rev=02c01258464cac3804faf177d0cfbf113cd59706` | [R1 measured score/result pending; expected only if held: `ATTEST52_HELD held=13/13 checks=13 rev=<R1> rule=A52 version=v1`; `DOCTRINE52_HELD held=5/5 checks=5 rev=<R1> rule=D52`; computed axis score pending] | `node .ufo/waves/round-52/probe/attest52-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin <R1>`; `node .ufo/waves/round-52/probe/doctrine52-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin <R1>`; `close/FINAL-<R1>.txt`; `close/IDEMPOTENCE-<R2>.txt`; plan § Close sequence |
```

The before values above are verbatim from `base/attest52-base.txt` and `base/doctrine52-base.txt`; the draft after values are frozen predicates from `plan.md`, not claimed measurements. The close plan requires the row/report to cite measured R1, then identify R2 (receipt commit) and R3 (idempotence transcript commit).

## (b) LOG.md round entry

Compliant existing line, quoted exactly from LOG.md:1967:

> - 2026-10-23 — round 49 addendum (C2 re-score; connector seat findings). C16 added to

It starts with the date, em dash and `round 49`, satisfying the gate's line regex; the sentence continues on the following physical line.

Draft round-52 opening line (fill all placeholders and the quoted receipt line from close evidence before filing):

```text
- 2026-10-24 — round 52 (one v2 wave, 64 seats; base 02c01258464cac3804faf177d0cfbf113cd59706; measured close R1 <R1>; receipt commit R2 <R2>; idempotence transcript commit R3 <R3>; FINAL A52/D52 receipt line(s): <verbatim committed output>; PROXY: <measured verdict>). [Replace placeholders with the close evidence and continue the entry with the claims, wave, and retained limits.]
```

## (c) Proxy recompute / dependency on ExecStanzaDrift

`SKILL.md:694`'s exact green condition is `node scripts/proxy-check.mjs --strict` → exit 0 + `PROXY: MATCH`. Round-open evidence records `PROXY: DRIFT`, including `C2_TOTAL_DRIFT` (`declared=117 computed=118 delta=+1`); the frozen plan attributes this C2 count to a missing corpus README map row and assigns diagnosis/row drafting to **ExecStanzaDrift** (`plan.md:15-21,172-175`; `w1-spec.json` assignment). The round-52 `build/ExecStanzaDrift/` artifact was absent at this audit snapshot, so its exact note path/hash/row could not be retained here.

Conditional conclusion: item 694 is green once the repaired tree's strict proxy run actually yields exit 0 and `PROXY: MATCH`. Do not treat the README row alone as sufficient: the committed round-open `base/baseline-gates.txt` also records `A_DRIFT` (71→73) and `AXES_DRIFT` (coverage 10→9). The frozen close plan explicitly calls for re-deriving the SCORECARD stanza/axes and restoring the C2 README row before H3 (`PROXY: MATCH pins=6 match`). Thus ExecStanzaDrift supplies the missing C2 map-row dependency; final green status depends on the integrated full re-derivation, not an unmeasured one-row change.

## Evidence limits / checks

No checklist/proxy command was run: this is an in-flight wave, and the parent owns post-integration verification. Open-state red findings and baseline values are retained from the supplied task/committed plan receipts; no close result is asserted. No tools installed or updated.
