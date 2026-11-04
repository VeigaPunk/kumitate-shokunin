# K81CriticClaims — falsification attacks on C1 (`ready-handoff`) and C2 (shape receipt v2)

Round 81, wave w1, 2026-11-04. Base tip `77c7a8b3`. Seat: critic, leaf, no subagents.
Attacks were built and run in scratch `/fast/scratch/hyaku/kumitate-r81/K81CriticClaims/`
(deleted after the runs; every output below is verbatim from those runs and embedded here —
the drivers were `attacks-c1.mjs`, `attacks-c2.mjs`, `attacks-c2b.mjs`).

Instruments attacked (read-only):
- `scripts/ready-handoff.mjs` (sha fnv-1a `df736d63` per counter output; ATTACK set at line 37)
- `scripts/omp-census.mjs` (shape gate: `validateShape` :168-192, `receiptAgeDays` :216-219,
  `runShape` stale/clock checks :469-493)

## State at attack time (context, not a verdict)

- `node scripts/ready-handoff.mjs --selftest` → `READY_HANDOFF_SELFTEST: 34/34 pass` / `VERDICT: PASS`, exit 0.
- `node scripts/omp-census.mjs --selftest` → `VERDICT: PASS (98 cases)`, exit 0.
- Live handoff: `node scripts/ready-handoff.mjs --round 81 --wave w1` →
  `READY_HANDOFF: READY wave=w1 seats=14 attack=4/14 connector=1 roles=scout=2,connector=1,executor=3,mutation-tester=1,reviewer=2,critic=1,sentinel=1,scribe=2,revenger=1`, exit 0.
- `probe81-c1.mjs` → `C81_C1: HELD held=16/16 … sha=df736d63`, exit 0.
- `probe81-c2.mjs` → `C81_C2: HELD held=15/15`, exit 0.
- Committed pin `.ufo/pins/omp-shape.json`: contract `kumitate-omp-shape-v2`, `captured_at=2026-11-04T09:45:44Z`, 65 entries, sha256 `8b6aaa79…3dae7`; it describes the **OMP agent root `~/.omp/agent`** (depth-1), not the lane.

## C1 — attacks that read READY but would dispatch wrong

Command form for every row (fixtures under the scratch root):
`node scripts/ready-handoff.mjs --lane <fixture>/kumitate-shokunin --round 81 --wave w1`
(e.g. A1 ran `--lane /fast/scratch/hyaku/kumitate-r81/K81CriticClaims/c1-9f2PXQ/a1-lane-root-only-in-hostile-comment/kumitate-shokunin --round 81 --wave w1`).
The fixture builder is byte-for-byte the probe's `laneFixture` (10 seats, 3 attack, 1 connector,
context carrying the Report-resolution sentence), so CONTROL is arm-01's own shape.

| # | Attack | Exit | First output line | READY? | Claim as written |
|---|--------|------|-------------------|--------|------------------|
| CTRL | clean fixture (arm-01 shape) | 0 | `READY_HANDOFF: READY wave=w1 seats=10 attack=3/10 connector=1 …` | yes | sanity control |
| A1 | lane root named **only inside a hostile comment** (“STALE MIRROR — NEVER read or write it”), no real target | 0 | `READY_HANDOFF: READY wave=w1 seats=10 attack=3/10 …` | **yes** | survives; arm 10 (`TASK_LANE_ROOT`, ready-handoff.mjs:187 `task.task.includes(laneRoot)`) is a substring test — a negated mention satisfies it |
| A2 | all attack seats carry **executor work orders** in their prompts (roles `reviewer/critic/…` untouched, 3/10 by role string) | 0 | `READY_HANDOFF: READY … attack=3/10 …` | **yes** | survives; the ≥25 % floor counts role strings (line 37 set + :194-196), never prompt semantics |
| A3 | `ready.l1 = "GhostL1-Not-Running-9999"` — a non-live agent id | 0 | `READY_HANDOFF: READY …` | **yes** | survives; :156 checks only “non-empty string”. The prose rules never promised l1 liveness, so this is a disclosed gap, not a broken promise |
| A4 | **14 seats, byte-identical task text** (distinct names; all Report trailers collide on one file) | 0 | `READY_HANDOFF: READY wave=w1 seats=14 attack=13/14 connector=1 …` | **yes** | survives; no task-diversity or report-destination-uniqueness finding exists. (Fixture note: my role-lambda made 13 of 14 attack seats — irrelevant to the property tested; the identity of the task bodies is the point, and it passed) |
| A5 | 16-seat wave; the 4 attack seats are **named `Exe01..Exe04`** while `agent` says `reviewer` | 0 | `READY_HANDOFF: READY wave=w1 seats=16 attack=4/16 connector=1 …` | **yes** | survives; names and roles are never cross-checked (SEAT_NAME only validates the CamelCase pattern) |
| A6 | 14 seats, 4 attack, **zero connectors** | 0 | `READY_HANDOFF: READY wave=w1 seats=10 attack=3/10 connector=0 …` | **yes** | survives; :201 `CONNECTOR_COUNT` is a ceiling only (`connectors > 2`). Plan §Wave shape (:118-119) says “one connector” — the floor is prose, not gate |
| A7a | seat text embeds `Read PLAN=.ufo/waves/round-81/plan.md before starting.` | 0 | `READY_HANDOFF: READY …` | **yes** | survives; the RELATIVE_WAVE_PATH regex (:188-190) anchors `.ufo/waves/round-\d+/` to `[\s"'`(]` or line start — `=` is in neither |
| A7b | seat text says “lives under `.ufo/waves/round-81` — read it first” (no trailing slash) | 0 | `READY_HANDOFF: READY …` | **yes** | survives; the regex demands `round-\d+\//`, so a directory-only relative mention passes |
| A8 | **every seat stripped of its `Report:` line** — no declared destinations at all | 0 | `READY_HANDOFF: READY …` | **yes** | survives; the tool reads Report lines only to excuse them from the relative-path scan and to demand a context resolution sentence. Absence of any trailer is invisible |
| A9 | context scratch sentence replaced by `Scratch root: none this round — seats must not create scratch directories.` | 0 | `READY_HANDOFF: READY …` | **yes** | survives; :162 `(`/HYAKU_SCRATCH\|scratch root/i`)` matches the lie — the check is lexical |
| A10 | attack share is 1 reviewer + 2 labrat (no critic/mutation-tester); plan :118 names **sentinel** as the 4th attack role, the tool counts **labrat** (line 37) | 0 | `READY_HANDOFF: READY wave=w1 seats=10 attack=3/10 connector=1 roles=reviewer=1,labrat=2,…` | **yes** | survives under the tool's set. Provenance conflict: plan.md:118 vs ready-handoff.mjs:37; the policy JSON (`scripts/hyaku/ufo-wave-policy.json`) carries the band (:89-90 `waveMinLanes/waveMaxLanes`) but no attack-role list I could find — the set's canonical source is currently the tool's own comment. This round's live wave has `sentinel=1` that the tool does not count (prints 4/14; prose would say 5/14). Both clear 25 %, so no verdict impact — but the two texts disagree |

**Tally: 11/11 attacks read READY (exit 0) — plus the control, which is supposed to.**
None of the 16 frozen arms can see any of them: arms 3-14 test single syntactic mutations of
exactly the kind the tool already refuses; every attack above varies *meaning*, not syntax.

### What the claim survives as, and the smallest correction

The frozen C1 predicate (“HELD 16/16 at M; below 16 at base”) is **not falsified** — the arms
hold and arm 2 remains the discriminator. What is falsified is any stronger reading of
“admission gate”: READY certifies the payload's *shape*, not that the wave would run as
written. Smallest safe correction (lesson route, no code change required by the claim):

- One `## Limits` paragraph in `corpus/lessons/round-81.md`: READY is syntactic/policy-shape
  admission only; seat-prompt semantics (A1, A2, A5), l1 liveness (A3), task diversity and
  report-destination uniqueness (A4), a connector floor (A6), the regex anchor gaps (A7a/A7b),
  Report-trailer presence (A8) and lexical scratch/laneness (A9) are out of scope.
- If hardening is ever wanted (not owed by this claim): widen the RELATIVE_WAVE_PATH anchor
  class to non-word characters and drop the trailing-slash requirement (kills A7a/A7b); add a
  counter arm for byte-identical task bodies (A4) and one for `connector=0` (A6). Everything
  else needs semantics the tool cannot have.

## C2 — receipts the gate accepts but that lie

All receipts below are v2 with a valid ISO-second `captured_at` and well-formed sorted
entries, i.e. exactly what `validateShape` (:170-192) demands. Grounding first:

```
G1  --compare .ufo/pins/omp-shape.json --root /home/vgpnk/.omp/agent
    exit 0  OMP_SHAPE_COMPARE: IN_SYNC entries=65 receipt=65 added=0 removed=0 changed=0 transient=0
```

| # | Attack | Exit | Output (last line) | Gate fooled? |
|---|--------|------|--------------------|--------------|
| CTRL-B | honestly-stamped 45-day receipt + `--max-age 30` | 1 | `SHAPE_STALE age_days=45 max_age=30` / `OMP_CENSUS: CLEAN (… captured=2026-09-20 age_days=45)` | no — the gate works **on an honest label** |
| B1 | the same 45-day content **relabeled `captured_at=now`** + `--max-age 30` | 0 | `OMP_CENSUS: CLEAN (… entries=65 findings=0 bound=35/35 captured=2026-11-04 age_days=0)` | **yes** |
| B2a | fresh honest snapshot, then one entry (`agent.db.corrupt-1793746030434-…`) silently dropped, `captured_at` left fresh; `--shape` | 0 | `OMP_CENSUS: CLEAN (source=snapshot entries=64 findings=0 bound=35/35 … age_days=0)` | **yes** — only `--compare` tells the truth: `OMP_SHAPE_COMPARE: DRIFT entries=65 receipt=64 added=1 removed=0 changed=0 first=agent.db.corrupt-…`, exit 1 |
| B2b | fresh receipt with `RULES.md` mode 0644→0666 | 1 | `MODE RULES.md want<=0644 got=0666` / `OMP_CENSUS: DRIFT (… findings=1 …)` | **no** — the census's per-member rules catch this class of edit; the hole is specific to unbound entries |
| B3a | receipt 30.5 days old + `--max-age 30` | 0 | `… captured=2026-10-04 age_days=30` (no SHAPE_STALE) | **yes** — `receiptAgeDays` floors (:218), and staleness is strict `age > maxAge` (:479), so a “30-day” window admits up to ~31 days |
| B3b | receipt 31 days old + `--max-age 30` | 1 | `SHAPE_STALE age_days=31 max_age=30` | no |

The sharpest single fact: **B1's relabeled receipt and G2's honest fresh snapshot of the live
agent root have the identical sha256 `960e34ae1b979f9d119e83f59553fa86f59e462a696db76be83842126be7d494`.**
A relabel is not merely undetected — it is *byte-indistinguishable* from a truthful recapture.
No offline test (counter, pin, selftest) can ever separate them; only a second, independent
witness (commit instant, signature) could.

### Is the fabrication hole in the claim sentence?

Per surface:

- The **frozen predicate** (“HELD 15/15 at M; below 15 at base”) is **not falsified** — none of
  the 15 arms tests authenticity, and they all hold.
- The **motivation sentence** (“a closure reading it months later could not tell whether the
  live root had moved since”) is only half-true after C2: `--shape` grades the receipt *in
  isolation* (own consistency + note binding `bound=35/35`); it never opens the live root. A
  closure that runs only `--shape` gets `CLEAN … age_days=0` on a receipt whose entries were
  hand-edited (B2a) or whose capture instant is fabricated (B1). Live truth exists only on the
  separate, opt-in `--compare` surface. So: **yes — a fabrication hole in the claim's
  narrative, not in its frozen predicate.** `captured_at` is self-attested; the v2 receipt is
  self-describing about *shape*, and trust-me about *time*.
- Mitigations that already exist: the SCORECARD `pin.omp-shape` (arm 13) ties the *committed
  bytes* to the scorecard, so post-commit tampering is caught (any relabel changes the sha);
  B2b shows per-member rules catch some content edits. What is unattested: the label at
  capture/commit time.

Smallest safe correction (lesson route; arms are frozen): a `## Limits` entry stating
(1) `captured_at` is self-attested — relabel ≡ honest recapture byte-for-byte (cite the
sha equality above); (2) `--shape` never reads the live root, `--compare` does; (3)
`--max-age N` admits `< N+1` days (floor + strict `>`). A v3 witness (commit instant recorded
beside `captured_at` by the L1 at commit) is the real fix and is out of this round's scope —
name it as a round-82 candidate, do not retrofit it.

## Plan-doc drift observed (no verdict impact)

- Amendment 1 §6 says `ready-handoff.mjs --selftest` is 31/31; it now prints **34/34**.
  Amendment 1 §2-era census selftest count was 97; it now prints **98 cases**. Frozen arm 16/14
  only require self-consistent N/N, so both still pass — but the amendment's numbers are
  already stale at M; the closure should quote the counters, not the amendment.
- Attack-role provenance: plan.md:118 `(reviewer, critic, mutation-tester, sentinel)` vs
  ready-handoff.mjs:37 `labrat`; see A10.

## Tooling

No tools installed or upgraded (none needed); `RULES.md` read as required. No mutating git/jj
anywhere; no writes outside this seat's report file and the scratch root. Scratch
`/fast/scratch/hyaku/kumitate-r81/K81CriticClaims/` deleted after capture.
