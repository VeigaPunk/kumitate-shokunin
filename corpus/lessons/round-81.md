author: kumitate L1 (round 81)
round: 81
lane: kumitate
base: 77c7a8b3fe7f3cebe681065da283de0ae38ddb5b (round-80 verifier spot-check, the lane's remote tip)
freeze: f8783f4be4d7e14aedf125e2c3323d46ce0da403
scaffolding: d140f2883170cc1b0859ba5359bcdac3123a676e
report: .ufo/reports/round-81/kumitate.md (fleet repo)

# Round 81 — admit the handoff, age the receipt

Two claims on two axes, one capability and one deepening, both scored by counters frozen before
any data seat: **C1 operability** — capability acquisition `ready-handoff`
(`scripts/ready-handoff.mjs`, `kumitate-ready-handoff-v1`), the inline spawn handoff judged before
the orchestrator takes it (16 arms; base 0/16, stub 3/16, close 16/16); **C2 coverage:omp** — the
shape receipt becomes self-describing (`kumitate-omp-shape-v2`: `captured_at` beside `entries`,
`--shape` age disclosure, opt-in `--max-age`, `SHAPE_VERSION`/`SHAPE_CLOCK` refusals; 15 arms; base
4/15, stub 6/15 under Amendment 2, close 15/15). Operability stays at its terminal 9 and coverage:omp at 10: both
moves are surface changes the counters measure, not re-scores.

## Gate

Both rows were opened this round and their quotes located in the committed captures.

- **S236 — Kubernetes, *Admission Controllers Reference*** (docs, tier A) — **admit**. URL
  `https://kubernetes.io/docs/reference/access-authn-authz/admission-controllers/`, accessed
  2026-11-04; capture `.ufo/waves/round-81/build/L1/captures/kubernetes-admission.html`
  (574,395 bytes, sha256 `1a86e90c458ef577…`). Located quote (21 words), *What are they?*:
  "Admission controllers are code within the Kubernetes API server that check the data arriving in
  a request to modify a resource." The page's limit sentence is used in the entry too: "Admission
  controllers do not (and cannot) block requests to read … because reads bypass the admission
  control layer." Scope: judge a write before it is persisted; reads are out of scope.
- **S237 — IETF RFC 9111, *HTTP Caching* §5.1 Age / §4.2 Freshness*** (spec, tier A) — **admit**.
  URL `https://www.rfc-editor.org/rfc/rfc9111.html`, accessed 2026-11-04; capture
  `.ufo/waves/round-81/build/L1/captures/rfc9111.html` (232,630 bytes, sha256
  `ce91ee9848d2b9ac…`). Located quote (22 words), *Age*: "The Age field value is the cache's
  estimate of the number of seconds since the origin server generated or validated the response."
  Scope: a stored artifact carries its age; freshness is a consumer decision against a declared
  lifetime.
- No row was rejected this round. S117 and S118 had an unsupported `used-by` extension
  (`corpus/knowledge/two-reading-verdicts.md` cites only S119) — reverted this round (R80-7); the
  change is logged here: S117 `used-by` old `…, corpus/knowledge/two-reading-verdicts.md` → new
  (unchanged from the pre-r80 set); S118 same. S119's own extension stands (the entry cites it).
- New knowledge entries: `corpus/knowledge/ready-handoff-admission.md` (S236),
  `corpus/knowledge/self-describing-shape-receipt.md` (S237). README map rows added; map
  198 → 202 (two knowledge entries + this lesson).

## Counters

Measured at the close tip; every receipt names its `rev=` line (`.ufo/waves/round-81/{open,close,controls}/`).

| counter | open | close | source |
|---|---|---|---|
| `proxy-check --strict` | `PROXY: DRIFT (C2_TOTAL_DRIFT declared=198 computed=199; AXES_DRIFT coverage 10/9)` exit 1 | `PROXY: MATCH (A=889 C=41 operability=9; C2=202/202; O_members=65 source=snapshot)` exit 0 | `open/proxy-open.txt`, `close/proxy-check.txt` |
| C1 counter (`probe81-c1.mjs`) | base tree 0/16; stub 3/16 | 16/16 | `controls/c1-base.txt`, `controls/c1-stub.txt`, `close/c1-probe.txt` |
| C2 counter (`probe81-c2.mjs`) | base tree 4/15; stub 6/15 (Amendment 2; the freeze-time fixtures read 1/15 and 5/15) | 15/15 | `controls/c2-base.txt`, `controls/c2-stub.txt`, `close/c2-probe.txt` |
| spotcheck coverage | `DRIFT spotchecks=47 uncovered=1 first=…round-80-verifier-spotcheck.md` exit 1 | `CLEAN spotchecks=47 uncovered=0` + `MAP: CLEAN` exit 0 | `open/spotcheck-open.txt`, `open/spotcheck-adopt.txt`, `close/spotcheck-check.txt` |
| README map | `CLEAN files=198 rows=198 covered=198` (after the adoption) | `CLEAN files=202 rows=202 covered=202` | `open/readme-map.txt`, `close/readme-map.txt` |
| SOURCES rows / tier A | 173 / 147 (r80 close) | 175 / 149 | `open/sources-census.txt`, `close/sources-check.txt` |
| checklists | base tree `31/39 pass` (the recurrence reds) | see `close/checklists.txt` | `open/checklists.txt`, `close/checklists.txt` |
| census (OMP / kimi / sources) | OMP CLEAN 65/0; kimi CLEAN 55/55; sources exit 0 | OMP CLEAN 65/0; kimi CLEAN 55/55; sources exit 0 | `open/census-open.txt`, `open/kimi-census.txt`, `open/sources-census.txt`; `close/census-shape.txt`, `close/kimi-census.txt`, `close/sources-census.txt` |
| A / C | 886 / 39 (r80 close) | 889 / 41 | `close/proxy-check.txt` |
| shape receipt | v1, 65 entries, no capture instant | v2, 65 entries, `captured_at`, `age_days=0` | `close/census-shape.txt`, `.ufo/pins/omp-shape.json` |

## Mistakes

| class | evidence | captured-by | fix |
|---|---|---|---|
| `vacuous-test` (a suite that cannot see its own CLI regression) | C2 arm 06 read `exit=0` for `--max-age 30` on a 45-day receipt: `main()` called `runShape(parsed.shape, io, note)` without `parsed.maxAge`, while the 97-case suite called `runShape` directly and passed. `node scripts/omp-census.mjs --shape <45d> --max-age 30` → `OMP_CENSUS: CLEAN … age_days=45` exit 0 (pre-fix) | the frozen counter's arm 06 — not the author's reading — plus the wave's C2 scout (`w1/K81ScoutReconC2.md` F1: `grep -c spawnSync` → 0) | `main()` passes `parsed.maxAge`; a new selftest case dispatches through `main()` (`cli-max-age`: `SHAPE_STALE age_days=45 max_age=30`, exit 1); suite 97 → 98. Shown able to fail: deleting the 4th argument makes the new case fail while the other 97 still pass |
| `empty-receipt` (a committed receipt with no bytes) | the freeze commit `f8783f4be` carries `.ufo/waves/round-81/open/checklists.txt` at 0 bytes — the background capture wrote it after the commit | the freeze commit's own diff (`git show --stat f8783f4b`) | the open receipt is re-captured from the base tree (`rev=77c7a8b3…`, `CHECKLIST: 31/39 pass`, exit 1) and lands in the close-set commit; the empty blob stays in history, named here |
| `landing` (a push that did not land) | `jj-lane.sh commit` then `push` returned `remote: Internal Server Error` and `remote: fatal error in commit_refs`; the committed local tip `d140f288` had no remote counterpart for ~20 min | `git ls-remote origin refs/heads/master` reading `2ac1f34d` while `jj-lane.sh state` read `ahead=1` | retried the helper push (never force); `landed d140f2883170cc1b0859ba5359bcdac3123a676e` printed by the helper's own remote verification |

## Routed-defect answers (R80-1 … R80-12)

1. **R80-1** dead `open/checklists-scaffold.txt` pointer — append-only erratum in
   `corpus/lessons/round-80.md` §Errata item 1 (the claim is withdrawn; the close receipt is the
   reading). This round commits its own base-tree checklist receipt so the class does not repeat.
2. **R80-2** stale README-map close value — erratum item 2 (198/198/198 at `6cbd6750`).
3. **R80-3** C1 base pass count — erratum item 3 (six arms pass at base: 6, 7, 9, 10, 11, 12).
4. **R80-4** mis-cited conflation transcript — erratum item 4 (the refusal is `open/c1-base.txt`
   arm 08).
5. **R80-5** S119 quote word count — erratum item 5 (21 → 19) and the gate-side criterion
   `corpus/QUALITY.md` Q74 (a Gate row's stated word count is re-derived with `wc -w`).
6. **R80-6** stale contract/case counts on the `spotcheck-adopt` SKILL row and checklist item —
   fixed in place: the row and both checklist items now name v3.1 / 34 cases (measured
   `close/spotcheck-selftest` at the r80 close, `w1/K80ScribeDocs`).
7. **R80-7** unsupported S117/S118 `used-by` — reverted in place; the change is logged in this
   lesson's `## Gate`.
8. **R80-8** LOG selftest value — append-only correction appended to the round-80 LOG entry
   (26 → 34 final; 28 is the scaffolding reading).
9. **R80-9** "final tip" ambiguity — erratum item 9 (receipts measured at `6cbd6750`).
10. **R80-10** base receipts without exit codes — this round's control receipts append `exit=N` to
    every probe run (`controls/c1-base.txt` …); the r80 receipts stay as committed.
11. **R80-11** adoption stdout uncommitted — this round commits its own adoption transcript
    (`open/spotcheck-adopt.txt`); r80's is not reconstructable and stays void (erratum item 11).
12. **R80-12** duplicate-gate red-before uncommitted — same disposition (erratum item 12); the S233
    withdrawal stays re-derivable from the registry bytes, and no receipt is fabricated.

## Limits

- **The gate judges structure, never intent** (wave `K81ReviewC1` F8/F9, `K81CriticClaims`
  A1–A9): a lane-root mention negated inside a comment, executor work orders carried by seats whose
  role string says `reviewer`, a non-existent `l1` id, fourteen byte-identical task bodies, seat names
  that contradict their roles, zero connectors, a relative wave path introduced with `=`, a
  directory-only relative mention, seats with no `Report:` line at all, and a scratch sentence that
  says the opposite of the rule all read `READY`. `--band`/`--attack-pct` can also loosen the frozen
  defaults, so the guarantee is only as strong as the invocation. These are disclosed, not hidden; the
  ones worth a gate (liveness, report-destination uniqueness, a connector floor) are round-82
  candidates.
- **The gate is advisory until the orchestrator calls it.** Nothing fleet-side invokes
  `ready-handoff` (scout F1): the dispatcher polls the `.ready` file and spawns the payload. Rounds
  79 and 80, re-read against the gate, both answer DRIFT (9 and 2 findings) and were dispatched
  anyway. The claim is about admission *availability*, not enforcement; enforcement needs the
  dispatcher to run the gate before taking the file (round-82 candidate).
- **No wave↔dispatch binding** (scout F4): the gate checks `ready.wave` but not the dispatch
  filename stem or a `wave` field inside the payload; two seats may also claim one `Report:` path
  (F6), and `l1` is only checked non-empty (F5). All disclosed, all round-82 candidates.
- **`ARTIFACT_KEYS` is narrower than the fleet bridge** (scout F7): the orchestrator's own dispatch
  bridge adds `solutionSpace` to every seat at call time; the gate refuses a dispatch that already
  carries it. The file contract is name/agent/task; the bridge's addition is outside it.
- **Role taxonomies disagree** (scout F8): the gate admits `labrat`/`distiller`; the validator
  refuses them as swarm roles. Round 80's labrat seat was dispatched as `revenger` because of this.
  The frozen counter does not see it; routed.
- **Band authority is duplicated** (scout F9): the gate's default `8:16` does not read
  `scripts/hyaku/ufo-wave-policy.json`. A policy edit desyncs admission from dispatch silently.
- **The age is self-asserted.** `captured_at` is written by whoever runs `--snapshot`; a re-labelled
  old snapshot passes `--max-age`. Custody is the pin, not the field.
- **The age never scores** (by design): a stale receipt still reads `coverage:omp 10`; the watch is
  `--max-age` or the non-scoring `--compare`.
- **Two shared surfaces with neighbours are now named**: the `Report:` trailer grammar is also
  parsed by `wave-census.mjs` and the `.ready` lane identity by `inline-dispatch-evidence.mjs`
  (connector, §3). They are different rules over the same fields; the connector flags the drift
  risk, not a duplicate to delete.
- **One frozen arm is missing for the realpath guard** (wave `K81ExecMutate`): ten of eleven C1
  mutants were killed by the frozen counter, and `c1-m11-realpath` — the `realpathSync` containment
  check, `ready-handoff.mjs:119` — **survived 16/16**. The guard is real and load-bearing (a symlink
  placed inside the wave dir and resolving outside passes the lexical `inside()` check), but no arm
  inputs such a symlink, so the counter cannot see the guard disappear; the seat's exploit transcript
  is `w1/K81ExecMutate/c1-m11-realpath-symlink.txt`. All six C2 mutants were killed. Round-82
  candidate: a seventeenth arm with an explicit symlink fixture.
- **The handoff was written 6 s before the gate's final bytes** (scout F3): the pinned
  `f8b4a92b…` differs from the bytes at 06:49:16 only in one selftest case (the lane-id rule was
  already in place and the gate answered READY at write time); the close re-validates READY against
  the pinned bytes (`close/handoff-admission.txt`).

## Erratum (append-only, round 82, 2026-11-04)

1. **Counters table, open README-map row (R81-8).** The table above records the open reading as
   `CLEAN files=198 rows=198 covered=198` "(after the adoption)". The cited `open/readme-map.txt`
   reads `CLEAN files=199 rows=199 covered=199`, and `git ls-tree -r --name-only 77c7a8b3
   corpus/knowledge corpus/lessons | grep -c '\.md$'` → `199`. The 198-row reading is the
   **pre-adoption** state (rows 198, map DRIFT uncovered=1); the after-adoption reading is
   **199/199/199**. The round-81 bytes are not rewritten.
2. **Fail-closed refusal count (R81-7).** The report and the README map row said "six fail-closed
   refusals". The v1 bytes cite **eight** tokens (`READY_ABSENT`, `READY_MALFORMED`, `READY_UNSAFE`,
   `DISPATCH_PATH`, `DISPATCH_ABSENT`, `DISPATCH_OUTSIDE`, `PATH_UNSAFE`, `DISPATCH_MALFORMED`);
   round 82's v2 cites **twelve**: the eight above plus `AGENTS_ABSENT`, `AGENTS_MALFORMED`,
   `POLICY_ABSENT`, `POLICY_MALFORMED`. A `throw`-site grep alone undercounts because those four are
   passed through `readJson`. The deriving command matches fourteen tokens — the twelve refusals plus
   the finding ids `READY_KEYS` and `DISPATCH_WAVE` — and the count is stated with it:
   `grep -oE "'(READY|DISPATCH|PATH|AGENTS|POLICY)_[A-Z_]+'" scripts/ready-handoff.mjs | sort -u`.
3. **The realpath survivor's premise (round-81 §Limits, one arm missing).** The limits section
   inferred that "a symlink placed inside the wave dir and resolving outside passes the lexical
   `inside()` check". Re-probed on the round-81 bytes at `0c23c4fc`
   (`.ufo/waves/round-82/build/L1/c1-symlink-probe.txt`): a symlinked dispatch is refused by the
   `lstatSync(...).isFile()` guard first — `FAIL-CLOSED DISPATCH_ABSENT ("dispatch is not a regular
   file")`, exit 2. The realpath arm is unreachable behind that guard, so the round-81 survivor was
   a counter-coverage gap, not a live escape. Round 82's arm 18 asserts the refusal that fires.
