author: kumitate L1 (round 82)
round: 82
lane: kumitate
base: 0c23c4fca408591341f22bad58660ac81e1ec5ff (the round-81 verifier spot-check, the lane's remote tip)
freeze: 97a630123a8980aa2dba4864998400ab5351dbe3
scaffolding: 63b12695ca3599d92c6d128353ca987daf64365b (tools) and c4396021c31e5d631c3ec498b4fa81cef1b98b46 (wave payload, sources)
report: .ufo/reports/round-82/kumitate.md (fleet repo)

# Round 82 — the handoff binds, the receipt ages

Two claims on two axes, both scored by counters frozen before any data seat and both controlled
before data: **C1 operability** (the lane's lowest non-retired axis, integer 9 terminal) —
`ready-handoff` becomes `kumitate-ready-handoff-v2`: the seat band and the seat-role vocabulary are
read from the campaign policy instead of restated in the tool, the handoff is bound to the dispatch
it names, two seats may not claim one report destination, `l1` may not collide with a seat and may
be resolved against a caller-supplied registry; **C2 coverage:omp** (integer 10 held) — the
`--compare` path stops pretending the receipt it diffs is timeless: it discloses `receipt_captured`
and `age_days`, gates age on demand, and refuses to guess the age of a legacy receipt.

## Gate

Both rows were opened this round; each quote was located in the committed capture and its word count
re-derived with `wc -w` (Q74).

- **S238 — Kubernetes, *Validating Admission Policy* (v1.30 docs page)** (docs, tier A) — **admit**.
  URL `https://kubernetes.io/docs/reference/access-authn-authz/validating-admission-policy/`, accessed
  2026-11-04; capture `.ufo/waves/round-82/build/L1/captures/vap.html` (598,348 bytes, sha256
  `ae87bdab827b60c5…`). Located quote (12 words), *What is Validating Admission Policy?* first
  paragraph: "Validating admission policies offer a declarative, in-process alternative to validating
  admission webhooks." Scope: a rule set declared once as a platform object and read by the admitting
  layer, never restated in each caller — the argument the round uses for reading the seat band and the
  role vocabulary from the campaign policy.
- **S239 — Open Policy Agent, *Introduction* (OPA docs)** (docs, tier B) — **reject**, so the outside
  check has a reject to sample (R81-6). URL `https://www.openpolicyagent.org/docs/latest/`, accessed
  2026-11-04; capture `.ufo/waves/round-82/build/L1/captures/opa-docs.html` (280,854 bytes, sha256
  `75ea1452901dbe94…`). Located quote (15 words), *Open Policy Agent (OPA)* opening paragraph: "OPA is
  an open source, general-purpose policy engine that unifies policy enforcement across the stack."
  Reason: OPA is a runtime decision service the caller queries, not a static rule document a gate reads
  offline, and adopting it would add a daemon this lane does not run. Flip: a committed OPA bundle plus
  an offline conformance run the lane could re-execute.
- **S237 `used-by` extended** (append-only rule 2; logged old→new): old `corpus/knowledge/self-describing-shape-receipt.md` → new `corpus/knowledge/self-describing-shape-receipt.md, corpus/knowledge/receipt-age-on-the-compare-path.md` — the round-82 entry cites the same Age sentence.
- **S237 anchor correction (recorded, row not rewritten):** the row's `anchor` cell says "§5.1 Age / §4.2 Freshness", but the quoted sentence lives in **§4.2.3 Calculating Age**, capture lines 2294-2297. The quote and its scope stand; the section label is stale and is carried for a superseding row next round (CORPUS rule 2 forbids editing the cell).

## Mistakes

| class | evidence | captured-by | fix |
|---|---|---|---|
| `inherited-false-premise` (a disclosure that was never re-probed) | round 81's §Limits stated "a symlink placed inside the wave dir and resolving outside passes the lexical `inside()` check", and its mutation battery recorded `c1-m11-realpath` as a survivor. Re-probed on the round-81 bytes: `FAIL-CLOSED DISPATCH_ABSENT ("dispatch is not a regular file")` exit 2 — the `lstatSync(...).isFile()` guard refuses the symlink first, so the realpath arm is unreachable behind it (`.ufo/waves/round-82/build/L1/c1-symlink-probe.txt`) | the round-82 C1 arm 18, written to expect `PATH_UNSAFE` and observed to read `DISPATCH_ABSENT`; not a reviewer, not the author's reading | arm 18 asserts the refusal that actually fires and is renamed `dispatch-symlink-refused`; plan Amendment 1 A1.2 records the refutation; the corrected statement lands in the round-81 lesson as an append-only erratum. Shown able to fail: the probe above answers the same token on both the v1 and the v2 bytes |
| `fixture-shaped-blindness` (a rule that only ever met its own fixture) | `REPORT_DEST_DUPLICATE` took the first token after `Report:`; the validator renders `Report: <prose> <path>`, so the round's own handoff resolved every seat to the word "write" and read 14 duplicates — with 50 selftest cases not seeing it | the round's own handoff run before dispatch (`READY_HANDOFF: DRIFT REPORT_DEST_DUPLICATE,…` exit 1), not the suite | the destination is the first path-shaped token of a `Report:` line, and three cases exercise the rendered shape (`trailer-prose-shape`, `trailer-prose-distinct`, `trailer-prose-duplicate`). Shown able to fail: reverting the extraction to `split(/\s+/)[0]` reads `52/53 pass` with `trailer-prose-distinct` red (`REPORT_DEST_DUPLICATE` on two distinct destinations) — the first two cases alone did **not** discriminate, which is how the fix was re-verified |
| `new-rule-without-containment` (a rule that named a danger and bounded nothing) | the round's new `REPORT_DEST_DUPLICATE` compared destinations but never bounded them: a dispatch whose seats carry `Report: /var/tmp/abs-N.md` read `READY`, so admission could direct seat writes outside the lane (`w1/K82ScoutReconC1.md` F7, measured on the round's own bytes) | the wave's C1 scout (F7), not the suite and not the author | `REPORT_DEST_OUTSIDE`: the resolved destination must be inside the lane; case `report-dest-outside`; plan Amendment 2 A2.1. Shown able to fail: removing the containment line reads `53/54` with that case red (`READY` on `/var/tmp/abs-0.md`) |
| `token-conflation` (two failure classes under one token) | v1's `readJson` threw the *read* token for a parse failure too, so `AGENTS_MALFORMED`/`POLICY_MALFORMED` were unreachable; the frozen arms 11 and 13 were the first code to ask for them | the frozen counters' own arms (written against the plan before the tool), run against the scaffolding commit | `readJson(file, token, detail, badToken)`; arms 10–13 assert four distinct tokens, and the suite carries `agents-malformed`/`policy-malformed`. Shown able to fail: the pre-fix run answered `FAIL-CLOSED AGENTS_ABSENT (agents: not JSON)` where the case expects `AGENTS_MALFORMED` (`47/49 pass` at that revision) |

A fourth repair, routed by the wave's connector: `corpus/README.md` pointed every reader at
`/home/vgpnk/Projects/origin-work/ufo-fsd-alpha`, which is absent on this host (the origin repo is
`/home/vgpnk/Projects/ufo-fsd-alpha`, HEAD `fb7157fc`; `PROVINCE.md` already named the right path).
Corrected in place — a moved surface, per the file contract — and logged here.

## Routed-defect answers (R81-1 … R81-8)

1. **R81-1 — stale `rev=` labels on close receipts.** The close set is generated *after* the work
   commit and every receipt stamps `rev=` from `git rev-parse master` at run time, so the receipt that
   names M hashes M's bytes; the open/control sets name the base and say so.
2. **R81-2 — a receipt pointer must contain the reading.** This lesson and the report cite the arm or
   the file that carries each reading (`close/c1-probe.txt` arm lines, `close/c2-probe.txt` arm lines).
3. **R81-3 — the registry row's stale pin value.** The `ready-handoff` row no longer states a pin
   hash; it names `pin.ready-handoff` by key, and the stanza carries the value.
4. **R81-4 — stale `verified-at` tallies.** Both knowledge entries are required to quote a command,
   and the tallies are checked against the shipped suite at the close (Q75).
5. **R81-5 — a quoted runtime line that no committed file contains.** The wave's settlement is
   cited from `w1-results.json` (`seats`, per-seat status rows), never from a runtime message.
6. **R81-6 — a Gate with only admits.** S239 is a considered-and-rejected candidate, with reason and
   flip condition above.
7. **R81-7 — the refusal count.** v2 cites **twelve** refusal tokens; the deriving command is
   `grep -oE "'(READY|DISPATCH|PATH|AGENTS|POLICY)_[A-Z_]+'" scripts/ready-handoff.mjs | sort -u`,
   which prints fourteen — the twelve plus the finding ids `READY_KEYS` and `DISPATCH_WAVE`.
8. **R81-8 — the round-81 lesson's map reading.** Corrected in place of a rewrite by an append-only
   `## Erratum` in `corpus/lessons/round-81.md` (199/199/199 after the adoption, not 198/198/198).

## Limits

- **The gate stays advisory.** Nothing fleet-side invokes `ready-handoff`; this round records the
  gate as lane-side admission and makes no enforcement claim. Enforcement needs the dispatcher's take
  path, which is orchestrator-owned.
- **`l1` liveness is opt-in.** There is no offline agent registry the lane may read (`~/.omp/agent`
  content is out of province by design), so liveness is a caller-supplied `--agents FILE`; without it
  the verdict discloses `agents=none` and checks only the collision rule.
- **The band is policy-derived; the attack share and the connector cap are not.** The campaign policy
  carries no machine-readable field for either, so they stay lane constants — a disclosed residue of
  the duplication this round removed.
- **The compare age is self-asserted.** `captured_at` is written by whoever runs `--snapshot`; a
  re-labelled old snapshot passes `--max-age`. Custody is the pin, not the field.
- **The age never scores** (by design): a stale receipt still reads `coverage:omp 10`.
- **`--compare --max-age` reads only the receipt**, never the live root's clock: a system clock far
  ahead of the capture instant is reported as `age_days`, not as a clock fault.

## Verification (measured at the work revision; receipts under `.ufo/waves/round-82/close/`)

- **C1** `C82_C1: HELD held=22/22` exit 0 (`close/c1-probe.txt`); base `held=0/22`
  (`controls/c1-base.txt`, v1 rejects `--policy` as usage 64), constant-`READY` stub `held=6/22`
  (`controls/c1-stub.txt`). Suite `READY_HANDOFF_SELFTEST: 54/54 pass` (`close/c1-suite.txt`).
- **C2** `C82_C2: HELD held=13/13` exit 0 (`close/c2-probe.txt`); base `held=6/13`
  (`controls/c2-base.txt`), constant-`IN_SYNC` stub `held=4/13` (`controls/c2-stub.txt`). Suite
  `VERDICT: PASS (105 cases)` (`close/c2-suite.txt`).
- **Stanza** `PROXY: MATCH (A=891 C=42 operability=9; C1=19/19 C2=206/206 coverage=10; S=88/88;
  R=92/92; K=55/55; O=1/1 O_members=65 O_findings=0 O_bound=35 coverage:omp=10; pins=6 match;
  source=snapshot)` exit 0 (`close/proxy-check.txt`).
- **Checklists** `CHECKLIST: 42/42 pass`, `VERDICT: PASS` (`close/checklists.txt`).
- **No harm** `HARM_MATRIX: HARM … harm=1` at scaffolding `c4396021` was `sources-check`
  `USED_BY_MISSING` — S238's `used-by` named the entry the scribe had not yet written; CLEAN once the
  entry landed (`close/sources-check.txt`). Final matrix in `close/harm-matrix.txt`.
- **Plan ordering** `PLAN_BEFORE_READY: PASS … round=82 plan=97a63012 marker=c4396021 map=CLEAN`
  (`close/plan-before-ready.txt`).
