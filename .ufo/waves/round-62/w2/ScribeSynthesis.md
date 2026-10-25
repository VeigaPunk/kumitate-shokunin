# ScribeSynthesis — round-62 wave synthesis (frozen claims, prior defects, evidence map)

Agent: `L1Kumitate62.ScribeSynthesis` (UFO-FSD scribe, round 62 wave 2).
Date: 2026-10-25. Lane root: `/home/vgpnk/Projects/shokunin/kumitate-shokunin`.
Status: read-only findings synthesis; **no fixes proposed, no edits anywhere except this file**.
Lane HEAD at inspection: `0cbe0d75e5a08718e2256408329692908c837766`; `git status --porcelain`
shows only untracked `.ufo/waves/round-61/controls/r61-c2-full-forgery.bundle` and
`.ufo/waves/round-62/`.

---

## 1. Scope and method

Sources read (all current round-62 lane artifacts, plus the governing/frozen sources):

- Parent prompt: `/home/vgpnk/Projects/shokunin/.ufo/prompts/kumitate-round-62.md` (fleet, 159 lines).
- Wave context: `.ufo/waves/round-62/w2-dispatch.json` (`{context, tasks}`, 40 tasks; parsed).
- Wave 1 artifacts (8): `w1/AttackC1C2.md`, `w1/Audit19.md`, `w1/C2Bundle.md`,
  `w1/ReadmeGate.md`, `w1/ReviewBundle.md`, `w1/ReviewClaims.md`, `w1/ScribeRouted.md`,
  `w1/SourceReopen.md`.
- Wave 2 artifacts (7): `w2/ControlMutation.md`, `w2/CounterReplay.md`, `w2/CriticC1.md`,
  `w2/CriticC2.md`, `w2/LessonGate.md`, `w2/ProxyAudit.md`, `w2/R60Erratum.md`.
- Frozen surface: `.ufo/waves/round-61/plan.md` (P61/D61 claim sentences);
  `corpus/lessons/round-61-verifier-spotcheck.md` (R61-V1..V6 routed defects);
  `.ufo/waves/round-62/controls/*` (4 files, all C2 forged-baseline receipts);
  `.ufo/waves/round-62/probe/*.mjs` (2 probe copies).

Independent byte checks performed by this scribe (read-only, data reads only — no gate/counter
was executed here):

- `sha256sum` of round-62 vs round-61 probes → identical:
  `dispatch61-probe.mjs` `02028d11b9b05d952df421b030be919e2af1bf77101d302c06a8b0a718c9a89f` (both);
  `doctrine61-probe.mjs` `e638e2b932f9d1552484c428131f73ad7efef663b273bad72e1581a30efa1965` (both).
- JSON parse of `w2-dispatch.json`: **40 tasks, 19 critic / 21 reviewer**; no `w2-spec.json`,
  `w2-plan.json`, registry, or results accompany it.
- `ls`/glob: `round-62/plan/`, `baseline/`, `close/` all empty; `.ufo/reports/round-62/kumitate.md`
  does not exist (directory holds other lanes' reports only); `corpus/lessons/round-62.md` absent.

---

## 2. Exact frozen claims — present vs absent

### Present (inherited freeze, not a round-62 freeze)

1. **P61 v1 — `DISPATCH61_HELD` (C1, P1..P4)**, frozen in round-61 plan.md,
   carried verbatim into round-62 by the byte-identical probe copy `probe/dispatch61-probe.mjs`
   (sha confirmed). Checks: P1 selftest 8/8; P2 live gate CLEAN `seats=32 sessions=32 exit0=32
   reports=32 dead=0` + rev name-presence of `launcher-progress.tsv`/`dispatch-actual.json`/≥32
   `.md`; P3 SCORECARD capability row naming `round 61`; P4 `close/dispatch61-tip.txt` containing
   the CLEAN line.
2. **D61 v1 — `DOCTRINE61_HELD` (C2, E1..E6)**, frozen in round-61 plan.md,
   carried verbatim by `probe/doctrine61-probe.mjs` (sha confirmed). Checks: E1 entry exists at rev;
   E2 provenance trio; E3 S195 row `mined`/`2026-10-25`/used-by; E4 capture sha == row pin; E5
   sources-census exit 0; E6 README map row + `readme-map` CLEAN.
3. **Committed forged control receipts**: `controls/forged-control-counter-before.txt` and
   `controls/c2-forgery-counter-before.txt` both read `DOCTRINE61_HELD held=6/6` at fixture rev
   `4247d2da937842bd6846874d548b7125b356e14c` (full and short rev). `controls/forged-control-before.txt`
   is a one-line label ("C2 forged control baseline"); `controls/c2-forgery-bundle-metadata.txt`
   records the bundle fixture (see §5 conflict).
4. **Routed repair obligations R61-V1..V6** (round-61 verifier spot-check §6) are the attachable
   surface the wave reports attack; several are restated verbatim in the w2 dispatch items (Audit19
   re-queue, revision-bytes language).

### Absent

1. **No round-62 frozen plan/claim.** `.ufo/waves/round-62/plan.md` does not exist; `plan/` is
   empty; the entire round-62 tree is untracked worktree state. The fleet parent prompt freezes no
   claim sentences. The w2 dispatch context states it explicitly: **"Round-62 claim plan has not
   been frozen yet; attack inherited round-61 predicates only"**.
2. **No round-62 lesson/Gate.** `corpus/lessons/round-62.md` does not exist; the w1 three-row
   `## Mistakes` draft (`w1/ScribeRouted.md`) is a report, not a corpus lesson, uses non-vocabulary
   classes (`counter-worktree-read`, `counter-row-parse`, `dead-seat-unattacked` vs the fleet §5
   vocabulary), and carries no `## Gate` block or red-before fix evidence (LessonGate §3).
3. **No census before → after receipts** for round 62 (baseline/ and close/ empty; only E5-leg
   census exits exist inside the C2 receipt files). Exit 0 at round end is still owed per prompt §2b.2.
4. **No honest-state control** committed in round-62 `controls/` (only four C2 forged-baseline
   files; **no C1 control at all**).
5. **No validated wave dispatch evidence.** No `w1-spec.json`/registry/`launcher-progress.tsv`/
   `dispatch-actual.json` for w1; `w2-dispatch.json` is a bare `{context, tasks}` payload with no
   spec/registry/results; no dispatch outcome (handles/status/dead seats) exists for either wave.
6. **No round-62 fleet report** (`.ufo/reports/round-62/kumitate.md` absent), so no round-62
   claim/verdict sentence exists on either repo.
7. **No v2 counters, no red-before state, no fix shown able to fail** (LessonGate §3).

---

## 3. Prior defects map (R61-V1..V6 → current round-62 state)

| # | Defect (spot-check §6) | Status this round | Evidence |
|---|---|---|---|
| R61-V1 | Falsifier fixtures only in tmpfs; not closure-durable | **Partial.** C2 fixture committed as lane bundle `controls/r61-c2-full-forgery.bundle` (canonical: 16,488,385 B, sha256 `c5c0154010d5becc752179bee2cbf81c8fb5dc8a8bd7ed8debb2a20ec9f0526b`, all-refs, `git bundle verify` ok, object count 8867 = fixture reachable graph, tip `4247d2d`). **C1 fixture absent** — `/tmp/kumitate-r61/CritControlC1` and the `a4-full-fabrication` scratch are gone; no C1 bundle exists (ReviewBundle §1, C2Bundle §5). | w1/ReviewBundle, w1/C2Bundle, w1/AttackC1C2 |
| R61-V2 | Frozen counters admit fabrication (false-green) and reject honest work (false-red) | **Open.** Probes byte-identical; no v2 exists. Mutation testing (ControlMutation): accepted mutants M-C1-2 (forged identities), M-C1-4 (stale/fake tip receipt), M-C1-5 (surplus untracked report), M-C2-4 (row relocated outside `## Registry`), M-C2-5 (fabricated pin + self-consistent capture bytes) all read HELD, exit 0; killed mutants confirm fail-closed only for genuinely-missing input. Replay (CounterReplay) reproduces honest rev `019a844c`/HEAD `0cbe0d7` → UNMET 2/4 & 3/6 exit 1, forged rev `4247d2d` → HELD 6/6 exit 0. | w2/ControlMutation, w2/CounterReplay, w1/ReviewClaims, w1/AttackC1C2 |
| R61-V3 | In-place edits to filed bytes in `165b830` (round-60 lesson Before 102→104; SCORECARD capability row 1794 gained "first working round 60") | **Open.** No named old→new correction appended; row 1794 still reads `round 60` at tip; the round-61 SCORECARD correction says the row "stays as history only"/capability "not admitted", but no appendix/correction row was appended. | w2/LessonGate §2 |
| R61-V4 | R60 fleet-report placeholders (`__MEASURED__`/`__TIP__`/`__COMMITS__`) | **Open.** `.ufo/reports/round-60/kumitate.md` still carries exactly 6 tokens (lines 4, 5, 73, 88, 96, 190). No erratum filed. R60Erratum maps them: 4× `__MEASURED__` → `a745a3b0`; 1× `__TIP__` → `a745a3b0` (tip); line 73 `__COMMITS__` needs **both** `165b83044d…` (work receipts) and `be4a820c344d…` (tip receipts `dispatch60-tip.txt`/`doctrine60-tip.txt` — present in `be4a820c`, absent in `165b830`). The candidate erratum at `round-61/build/ScribeErratum/erratum.md` §R60-V2 maps all four measured tokens correctly but line 73's attribution to `165b830` alone is incomplete; §R60-V4 already names `be4a820c`. | w2/R60Erratum, w2/LessonGate §2/§6 |
| R61-V5 | Proxy DRIFT + unpinned `make-dispatch-actual.mjs` (same change as spot-check README row + `covered` pin) | **Open.** Live stanza `kumitate-proxy-v1` (SCORECARD 287–311) stale `A=105 C=30 C2=145 C2_total=145`; `proxy-check --strict` exit 1 (`A_DRIFT declared=105 computed=117`, `C2_DRIFT 145/148`, `C2_TOTAL_DRIFT 145/149`, `AXES_DRIFT coverage 10/9`, `PIN_UNPINNED scripts/make-dispatch-actual.mjs`). `readme-map` DRIFT `files=149 rows=148 covered=148 bad=2` (round-61 spot-check file both uncovered and unpinned). Computed A=117 is worktree-sensitive (counts the two untracked round-62 probes); committed-tree A=115. `make-dispatch-actual.mjs` sha256 `f0194314e98e87e86eb1329f36411e249911f9a0120aa4feb702562a54bf3dc9` is byte-correct but has no `pin.make-dispatch-actual` in `kumitate-gate-pins-v1` (17 pins present, none for it). | w2/ProxyAudit, w2/LessonGate §2/§4, w2/CriticC2 §5, w1/ReadmeGate |
| R61-V6 | Dead seat `Audit19` (provider `invalid_prompt` at spawn; never ran) | **Re-queued.** w2 dispatch carries an `Audit19` reviewer item with the same `Round60-DeadTable` prompt. w1 `Audit19.md` re-ran against committed blobs at HEAD `0cbe0d7` (hashes unchanged from `be4a820c`): 32 rows, 5× exit=0, 27× exit=-9, 5 non-null sessions correlating 1:1 with exit=0, 27 null with exit=-9; traceback lines 65–68 verbatim, no `DONE` line; `resume_hint` exactly 1 per live seat, 0 for sampled dead seats; `.err` blob sizes/tails match. Four checks remain unexecuted (full 64-file no-truncation scan, exact traceback byte-compare, full per-row pid/exit/session cross-check, independent count re-derivation). No fresh `w2/Audit19.md` yet. New observation: `RevS126Quote.md` is committed for a dead seat (exit=-9, session=null) — 6 `.md` reports vs 5 exit=0 seats (`DEAD_SEAT_UNCREDITED`-class anomaly). | w1/Audit19, w1/AttackC1C2 §3, w1/ReviewClaims §4 |
| (carry) | Round-61 verifier spot-check itself: no README row + `covered` pin | **Open** (part of R61-V5 bundle; seventh recurrence of R56-V3 class per spot-check wording). | w1/ReadmeGate, w2/LessonGate §4 |

---

## 4. Evidence-backed synthesis

1. **The inherited C1/C2 predicates fail both falsifier directions, on fresh evidence.**
   The round-62 probe copies are byte-identical to the frozen round-61 probes (sha confirmed), so
   no repair requirement from R61-V2 is present in this round's counter code (ControlMutation §1).
   C1 reads HELD 4/4 on do-nothing fabrication (committed control `ctl-c1-critic-a4-full-fabrication.txt`
   + `close/a2-repro-c1-fabrication.txt`) and on a commit/worktree split with zero-byte reports at rev
   (`ctl-c1-critic-a5-commit-worktree-split.txt`, commit `ced3ece3`); the genuine landed round-61
   state reads UNMET 2/4 (P3 MISS: committed row has no `round 61`; P4 MISS: `close/dispatch61-tip.txt`
   absent at rev). C2 reads HELD 6/6 on the forged committed fixture (rev `4247d2d`, phantom
   `|:S195:|` row outside `## Registry`, fabricated 41-byte capture, header-only rewrite) and UNMET
   3/6 on the honest landed rev (E3 row-absent, E4 pin empty, E5 exit 2).
2. **The mechanism is confirmed by mutation and replay, not just static reading.**
   ControlMutation's accepted mutants (forged identities, stale receipt substring, surplus untracked
   report, relocated row, fabricated pin+capture) all read HELD exit 0; its killed mutants read
   UNMET exit 1 only when input is genuinely absent. CounterReplay's fresh run reproduced the
   inversion on real revs. Accepted mutants share one property: internal self-consistency under the
   counter's own weak rules; every accepted forgery is author-writable with no seat run and no fetch.
3. **C1 specifics.** P2 gate CLEAN derives only from author-writable files (`launcher-progress.tsv`,
   `dispatch-actual.json`, `<Seat>.md` presence/size); `NOT_A_DISPATCH` is token-membership, not
   provenance (any non-null session string counts; control `ctl-c1-critic-a2c-one-id-bypass.txt`);
   round-61 w1 rows all carry `pid=- start=- end=-` and no stream/launcher-log artifacts exist
   in-repo to cross-check (round-60 w1 has `.stream.jsonl` + launcher log — the gate never reads
   them). P2/P4 are worktree reads; only P3 reads rev bytes; the plan's "≥32 non-empty at rev"
   sentence is not enforced at rev (CriticC1 §4, AttackC1C2 §1.1).
4. **C2 specifics.** E3's finder uses JS `[[:space:]]` (literal set, not whitespace) and scans the
   whole file un-scoped; it rejects the honest `| S195 |` form and accepts `|:S195:|` anywhere,
   including outside `## Registry`. Cell indices 9/10/12 vs the 11-cell contract at 8/9/11 make E3
   unsatisfiable for any honest Registry row (census NF=13 agrees with the contract). E4 reads the
   capture from the worktree and compares only the first 16 hex chars (64 bits). E5 validates the
   live disk under the census root (default = lane → exit 2), never the measured rev tree. E6's
   `readme-map` leg runs from the worktree and is currently false-red on every honest rev (DRIFT
   bad=2) until the R61-V5 carry lands (CriticC2 §1–§4, ReviewClaims §2).
5. **The corpus data is honest; the defect is in the counters.** `SourceReopen` proves the live
   page (`https://docs.temporal.io/worker-versioning.md`, HTTP 200, 9645 B, sha256
   `8ef2ee5f…`) is byte-identical to the committed capture at tip; the quote is located exactly once
   at line 39 under `§ Pinned Workflows`; the committed S195 row is an honest 11-cell Registry row
   with the correct pin and cells 8/9/11 = `mined`/`2026-10-25`/entry path. So the honest record
   would pass a corrected E3/E4; conversely, a well-formed in-Registry self-pinned forgery would
   pass the fixed E3/E4/E5/E6 too — the counter proves internal consistency, never provenance
   (CriticC2 §1 residual hole).
6. **Gate status snapshot at this checkpoint** (all from lane evidence; none re-run by scribe):
   `readme-map` DRIFT exit 1 (bad=2); `proxy-check --strict` DRIFT exit 1; census before/after
   receipts absent for round 62; counter verdicts on inherited predicates currently cannot support
   any claim closure (no frozen round-62 claim exists to close).
7. **Wave shape.** w1: 8 seat reports, findings-only, no spec/registry/dispatch evidence. w2:
   bare `{context, tasks}` dispatch (40 items; 19 critic / 21 reviewer), 7 reports landed at write
   time; several w2 seats still running (Audit05/07/09/14/17/20/21, CritControlC1StatusSynthesis,
   CritC2WorkingMap, ControlMutation peers). No dead-seat evidence is available for w2 (no dispatch
   outcome data on disk). Per the attack contract, no report claims a dispatch, and none does.

---

## 5. Conflicts and verbatim discrepancies (canonical judge reference)

1. **LessonGate role split vs actual dispatch bytes.** `w2/LessonGate.md` §7 states w2 dispatch
   carries "40 task items with role split 16 critic / 24 reviewer". Parsing `w2-dispatch.json`
   verbatim yields **40 tasks, 19 critic / 21 reviewer** (critics: CritControlC1Nonempty/ZeroSeats/
   NullMix/P3Only, CritC2Regex/Columns/CaptureForge/CensusRoot, Audit02/04/06/08/10/12/14/16/18/20/22;
   reviewers: the remaining 21). The 16/24 figure does not match the file.
2. **Stale bundle control metadata.** `controls/c2-forgery-bundle-metadata.txt` pins bundle sha256
   `d1bc3bc6e15cb9e6042cb0d76a6f63a154c08aadc6b1874c114fa063f738c1b4`, bytes 16,488,336,
   refs/heads/r61-c2-forgery — the **superseded single-ref artifact** (C2Bundle §4). The canonical
   lane bundle on disk is the all-refs artifact: 16,488,385 B, sha256
   `c5c0154010d5becc752179bee2cbf81c8fb5dc8a8bd7ed8debb2a20ec9f0526b` (w1/AttackC1C2 §4,
   w1/ReviewBundle §3). The metadata file is out of sync with the artifact it names.
3. **Bundle finalization was observed mid-review.** w1/ReviewBundle recorded the lane copy changing
   size during review (16,488,336 → 16,488,385 at 10:19:53) and recommended re-verifying the pin
   after all writers land; the sha above is the post-finalization read and matches AttackC1C2/C2Bundle.
4. **Probe index citation nuance (not a conflict).** `w1/C2Bundle.md` notes the brief's "8/9/11"
   wording does not match the frozen probe's code indices (9/10/12) — "code governs". This is
   consistent across all reports (ReviewClaims, CriticC1, CriticC2, spot-check): the honest 11-cell
   row fails E3 under the frozen probe's indices, and the contract indices are 8/9/11.
5. **Timing sensitivity.** `w2/LessonGate.md` was written when only `w2/CriticC1.md` had landed;
   at this writing 7 w2 reports exist (added `CriticC2.md`, `ControlMutation.md`, `CounterReplay.md`,
   `ProxyAudit.md`, `R60Erratum.md`). LessonGate's "one w2 report has landed so far" is a snapshot
   statement, not a contradiction.

---

## 6. Touched surfaces / out-of-scope

- Write: only this file (`.ufo/waves/round-62/w2/ScribeSynthesis.md`).
- Read-only (no modifications): the wave artifacts, controls, probes, round-61 plan, spot-check
  lesson, parent prompt, and the byte checks in §1.
- Out-of-scope: no product/corpus/registry edits; no commits; no gate/counter executions by this
  scribe; no fixes proposed; no round-62 claim verdicts (none are frozen to adjudicate).

## 7. Known limits

- This synthesis is a checkpoint: several w2 seats were still running at write time; later artifacts
  may add findings.
- With no round-62 plan.md, no claim sentence can be verified or cited; the frozen surface here is
  the inherited P61/D61 plus R61-V1..V6 and the committed forged C2 controls.
- C1's fabrication fixture is not materialized anywhere (no bundle, no scratch repo); only the
  committed receipts survive.
- `.ufo/reports/round-62/kumitate.md` does not exist yet; a round-62 fleet report is still owed.
