# kumitate — round 49 report (hyaku run 5)

Lane repo `kumitate-shokunin`, base `b7b040b5`, freeze `8237be86`, record commit `64b92866b3c119d4a3434039569a82786ab323f1`
(pushed). Plan `.ufo/waves/round-49/plan.md`. Round shape: **one v2 wave** (`kumitate-r49`, 64 seats, policy
`ufo-wave-policy-v2.json`, band 64–128), attack 24 seats = **37.5%** (reviewer 8, critic 4, mutation-tester 12),
build/recon 40 (scout 8, connector 2, executor 14, scribe 10, sentinel 2, revenger 2, simplifier 2); slot
`granted lane=kumitate wave=kumitate-r49 seats=64 live=82 pending=0 cap=256`; validator exit 0 under the v2 policy,
taskCall `.ufo/waves/round-49/r49-taskcall.json` (dispatched inline by the orchestrator per the session contract;
seat outputs relayed). No residual call was needed: the wave returned more distinct attack items than the freeze
required and no seat died (zero dead seats observed at the relays received before the report; a late seat's absence is
recorded as missing, never replaced).

## Work performed

The round declares **two claims** (frozen counters before any data seat):

- **C1 — capability `bind-oracle` (operability surface).** `scripts/bind-oracle.mjs` (`kumitate-bind-oracle-v1`):
  inside a `scripts/cap-run.mjs` child it reads the child's own `/proc/self/mountinfo`, compares the observed
  mount-point set with the requested binds (EXTRA against the *parent* mount set, not a fixed allowlist), and reports
  `HELD / MISSING / EXTRA / CONTROL_VISIBLE / NO_CHILD`. It closes the round-48 §Limits (a) class — a surgical
  `--bind` drop that the counter could not see — with a mechanism probe. Counter
  `.ufo/waves/round-49/probe/bindoracle49-probe.mjs` (rule B49), predicate `ORACLE_HELD` = held=6/6 exit 0.
- **C2 — coverage (learning): `corpus/knowledge/counter-amendment-discipline.md`.** The F48/A48 counter and
  pre-data-amendment discipline as 15 clauses, each bound by sha256 to a committed receipt; counter
  `.ufo/waves/round-49/probe/doctrine49-probe.mjs` (rule D49), predicate `DOCTRINE_HELD` = every clause hash verifies,
  clauses>=10, rows>=2 `mined`.

Work items (each with its pointer; seat reports under `.ufo/waves/round-49/r49/` were written by the wave seats into
the lane and are committed in `64b92866`):

- **Freeze + controls.** Plan and both counters committed before data (`8237be86`); do-nothing control
  `held=0/6` exit 1 and C2 `UNMET reason=entry-absent` exit 1 (`.ufo/waves/round-49/controls/CtlNothing-*`); a static
  forged oracle reads `held=3/6` exit 1 (`controls/CtlForged-static-oracle.txt`) — the counter's output-text limit,
  recorded and attacked by wave mutation seats.
- **C1 build.** `scripts/bind-oracle.mjs` (7-arm selftest incl. three runner mutants built from `cap-run.mjs` source);
  fix history captured in `corpus/lessons/round-49.md` M1 with the failing receipt
  `.ufo/waves/round-49/r49/Mistake-fixed-allowlist.txt` (fixed allowlist → `A1 FAIL … EXTRA extra=25`, 4/7, exit 1).
- **C1 measurement.** `r49/L1-score-0526f898.txt`, `r49/ReRunCounter49-2.txt`, `r49/ReRunCounter49-3.txt` — three
  time-spaced runs, all `ORACLE_HELD held=6/6 checks=6 rule=B49 oracle_sha256=c3929a97…` exit 0 at `0526f898`.
- **C2 build.** `corpus/knowledge/counter-amendment-discipline.md` (15 clauses, receipts under frozen round
  directories), `corpus/lessons/round-49.md` (frontier gate), `corpus/QUALITY.md` Q38 (the attestation criterion with a
  shown-able-to-fail doctored run), README rows 108 → 110.
- **C2 measurement.** `r49/L1-c2-score-589d25e4….txt` → `DOCTRINE49: HELD clauses=15/15 rows=3 entry_sha256=6b8f69cd…`
  exit 0; `r49/C2-doctored-control-589d25e4.txt` → `UNMET reason=receipts misses=.ufo/waves/round-48/plan.md=hash-mismatch`
  exit 1.
- **Repairs R49-1…R49-5.** R49-2 registry: `counter-rerun` = **probe** (its exit 1 is DISAGREE, not a surface
  defect — `r49/ScoutRegistryClassification.md`), `cap-spawn` = **helper**, `bind-oracle` = gate; the registry's
  "all eleven" sentence updated to twelve gates. R49-1: the round-48 late writes are committed under this round and
  named in LOG (`close/ReRunCounter48-1.md` and `close/ReRunCounterA.md` move their prose onto the committed receipt
  blob `fd7d8866…`, trailer start `16:01:13-03:00`; `close/ReviewIntegration.md`; the empty `r48-plan.stderr`; the
  one-line `r48-residual-plan.stderr`; plus the two late `r48/ExecLoadProbe*` files). R49-3/R49-4/R49-5: appended
  LOG corrections naming all four round-48 mistakes, the canonical re-run start `19:01:13Z`, and the leak receipt's
  13 residual directories (the "delta 0" sentences corrected; attribution not established).
- **Wave seats (relayed).** Findings that changed this report: `ScoutCorrections` (exact corrected lines),
  `ScoutLeftovers` (the two `M` files are substantive receipt-pointing rewrites, not prose reformats),
  `ScoutRegistryClassification` (probe/helper classification), `ScoutCapRunVisibility` (a genuine hole:
  `--bind /tmp /tmp` after `--tmpfs /tmp` re-exposes host `/tmp` read-write), `ScoutSiteBindsRoundGate`/`…SurfaceProbe`
  (per-site bind lists), `ScoutMountinfoFields` (field 5, `\040`/`\134` escapes, 44 lines / 38 mount points).

## Landed changes

| change | LOG entry | commit |
|---|---|---|
| freeze: plan + both counters + pre-data controls | `LOG.md` round-49 bullet | `8237be86` |
| C1 `scripts/bind-oracle.mjs` | `LOG.md` round-49, C1 | `0526f898` |
| C2 entry + SOURCES S099 | `LOG.md` round-49, C2 + frontier | `589d25e4` |
| SCORECARD (capability row, round-49 section, move-log 49), LOG (incl. R49-3/4/5), lesson, Q38, README 110, registry rows, wave spec/taskcall/receipts, r48 leftovers | `LOG.md` round-49 bullet | `64b92866` |
| this report (fleet repo) | — | `fleet-commit` below |

## Before → after measurements

| claim | command | before | after | measured at |
|---|---|---|---|---|
| C1 | `node .ufo/waves/round-49/probe/bindoracle49-probe.mjs <lane> 0526f898257f58158e9264905f4895f54163e8db` | `ORACLE_UNMET held=0/6` exit 1 (`controls/CtlNothing-base-b7b040b5.txt`; forgery control `held=3/6`) | `ORACLE_HELD held=6/6 checks=6` exit 0 ×3 time-spaced | `0526f898` |
| C2 | `node .ufo/waves/round-49/probe/doctrine49-probe.mjs <lane> 589d25e4c2dc6600f6d8db1468b832555bda9dd0` | `UNMET reason=entry-absent` exit 1 | `HELD clauses=15/15 rows=3` exit 0; doctored control `UNMET` exit 1 | `589d25e4` |

Differences from the plan, disclosed: the plan's § C1 Limits (2) declared EXTRA against a fixed base-mount allowlist;
the built instrument compares against the parent process's mount set plus non-directory host nodes, because the fixed
allowlist read `EXTRA extra=25` on a healthy runner (`r49/Mistake-fixed-allowlist.txt`). The predicate wording is
unchanged; the mechanism sentence is corrected here and in `corpus/lessons/round-49.md` M1, not by rewriting the plan.

## Sources & frontier

- Census: `scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin kumitate` — exit 0 at the round
  end (99 rows, S001–S099; the r48 pre-existing W04 duplicate-url warnings remain).
- Rows 98 → **99**: **S099 admitted** (`proc_pid_mountinfo(5)`, man7.org, man-pages 6.19 2026-02-08, body sha256
  `27a0e5ad5cf9…`, tier A, `mined`, opened 2026-10-23; located quote 15 words: "This file contains information about
  mounts in the process's mount namespace (see mount_namespaces(7))." locators DESCRIPTION ¶1 + field (5)).
- Re-opened: S095 and S098 (both hold what their rows say; no `status`/`recheck`/`used-by` cell changed, so the
  old→new log is empty by design and recorded in `corpus/lessons/round-49.md` § Frontier).
- Rejections: none this round.
- Frontier advanced: the bind-view surface (tier A source → instrument → capability row), and the lane's own
  counter-discipline receipt corpus (15 bound clauses).

## Trend verdicts

- **expansion — improved.** +1 tier-A `mined` row (S099); `bind-oracle` enters the SCORECARD capabilities table with a
  same-round running demonstration (6/6 ×3, selftest 7/7); +1 knowledge entry (15 bound clauses) and Q38.
- **quality — improved.** Five routed r48 defects repaired with committed evidence (registry probe/helper/gate rows,
  the four-mistake correction, the canonical 19:01:13Z start, the leak receipt's 13, the leftovers resolved), and the
  round's own plan/build drift is disclosed with a failing receipt.
- **discernment — improved.** The round rejected its first EXTRA mechanism on a measured reading instead of shipping
  the plan's sentence; the registry classification follows a seat's evidence (`counter-rerun` is a probe, not a gate);
  the counter's forgery limit is recorded and attacked rather than hidden.

## SHONEN

- [~] **SKILL.md contains real decision tables, error patterns, checklists, cited sources** — registry grew three
  rows and the "all eleven" sentence was corrected; the round adds no new decision table, pointer `SKILL.md:594-617`.
- [~] **At least one end-to-end domain task executed and logged in LOG.md** — the C1 instrument and its three score
  runs; pointer `LOG.md` round-49 bullet + `r49/L1-score-0526f898.txt`.
- [~] **Instructions executable by an agent without oral context** — plan + counters + lesson carry commands; the
  wave's 64 item prompts were self-contained; no non-author confirmation this round.
- [~] **No cross-domain bleed (PROVINCE.md still accurate)** — the work stays within orchestration & tooling (the
  runner/gates); no domain tree was edited; no non-author confirmation this round.

No box is promoted to `[x]`: every one is lane-asserted here and needs a named non-author verifier.

## Stale-lane

Respawn-per-round driver: this lane process serves round 49 only; no other kumitate mission is open. No tool installs
were made by the L1 this round (seats that installed anything name it in their reports; none reported).
## Erratum (round 50; append-only)

This report was filed in fleet commit `0fdce71a764cf0093380d64b9c55f4c58a08c593`, citing lane record commit
`64b92866b3c119d4a3434039569a82786ab323f1`. Three lane commits landed after it: `01b70bb0` added clause C16
and prior-art citations; `923a172` recorded the addendum and re-scored C2; `c432cc95` added the
`ConnSiblingOverlap` seat report. The statement above that the C2 entry had 15/15 clauses is superseded:
it was 15/15 at `589d25e4`, but the appended C16 makes it **16/16 at the r49 tip** (`c432cc95`), with
entry sha256 `11828698f0feee79405037cff3a31f65297ecebfcedf4f812cbdceb3d53f527b`; the frozen counter at
`.ufo/waves/round-49/probe/doctrine49-probe.mjs` reproduces the 16/16 reading. The earlier report bytes remain
unchanged; this erratum supersedes only the stale C2 count and clarifies which late seat report was not in
`64b92866`.
