# CriticC1 — round-62 C1 falsification findings

Lane: kumitate, round 62, w2 critic seat `L1Kumitate62.CriticC1`.
Scope: attack the frozen C1 acceptance rules and the round-62 counter/control receipts.
Read-only; no edits, no probes executed beyond reading committed receipts, no tool installs.
All paths relative to lane root `/home/vgpnk/Projects/shokunin/kumitate-shokunin`.
Lane tip at inspection: `0cbe0d75e5a08718e2256408329692908c837766`.

## 0. Premise vs what exists

The assignment names `.ufo/waves/round-62/plan.md` as the frozen C1 source. That file does
**not exist** in the lane worktree, in git HEAD, in any branch, or anywhere under the fleet
root. The lane's `.ufo/waves/round-62/plan/` is empty; `git status` shows the entire
`.ufo/waves/round-62/` tree untracked (worktree-only, never committed). The fleet parent
prompt `.ufo/prompts/kumitate-round-62.md` routes six round-61 defects (R61-V1..V6, from
`corpus/lessons/round-61-verifier-spotcheck.md` §6) but freezes no round-62 claim sentence
and no revised predicate. W1 reports state the same (`w1/ReviewClaims.md` §0, `w1/SourceReopen.md`).

Consequence: the only frozen acceptance rules attackable in this round are the inherited
round-61 predicates — `DISPATCH61_HELD` (P1..P4) for C1 and `DOCTRINE61_HELD` (E1..E6)
for C2 — as carried verbatim by round-62's probe copies. The "revised counter/control
receipts" the premise expects do not exist; the round-62 `controls/` holds exactly four
files, all C2 forged-baseline receipts (`forged-control-before.txt`, `forged-control-counter-before.txt`,
`c2-forgery-counter-before.txt`, `c2-forgery-bundle-metadata.txt`). There is **no** C1
control in round-62 `controls/`.

## 1. Revised C1 predicate — no revision exists (counter unchanged)

- `probe/dispatch61-probe.mjs` (round-62) is byte-identical to round-61's frozen probe: sha256
  `02028d11b9b05d952df421b030be919e2af1bf77101d302c06a8b0a718c9a89f` for both (w1/ReviewClaims §0;
  diff confirmed empty). Same for `doctrine61-probe.mjs` (sha256
  `e638e2b932f9d1552484c428131f73ad7efef663b273bad72e1581a30efa1965`).
- `scripts/dispatch-evidence.mjs` gate is unchanged from round-61 (the A5 receipt pins its sha256
  `765a7aa3ef6b11f18548da4a91f98c42e07b825229135c30010f092cc1af65cc`; worktree gate at same path is
  the same contract `kumitate-dispatch-evidence-v1`).
- `.ufo/pins/counter-pins.json` has no round-61/62 pin; `make-dispatch-actual.mjs` (the
  R61-V5 pin target) is unpinned.

So the C1 predicate under attack is exactly the frozen round-61 sentence («frozen before any
data seat scored», round-61 plan.md): P1 selftest 8/8; P2 gate CLEAN `seats=32 sessions=32
exit0=32 reports=32 dead=0` **and** rev carries `launcher-progress.tsv`, `dispatch-actual.json`,
≥32 non-empty `<seat>.md`; P3 SCORECARD capabilities row names round 61; P4
`close/dispatch61-tip.txt` exists at rev containing the same CLEAN line. Kill rule: any MISS →
fail as declared.

## 2. Forged fixture / do-nothing control — C1 passes 4/4 without any real dispatch (confirmed)

Committed receipt `round-61/close/a2-repro-c1-fabrication.txt`:

```
$ node .ufo/waves/round-61/probe/dispatch61-probe.mjs /tmp/kumitate-r61/CritControlC1/a4-full-fabrication ab902da2…
DISPATCH61: DISPATCH61_HELD held=4/4 checks=4 rev=ab902da2… rule=P61
 | P1 PASS DISPATCH_EVIDENCE_SELFTEST: PASS (8/8)
 | P2 PASS gate=0 clean=true reports=32
 | P3 PASS | `dispatch-evidence` | … | round 61 |
 | P4 PASS exists
exit=0
```

Fixture facts (w1/AttackC1C2 §1.2, w1/ReviewClaims §1.3): a scratch repo whose single commit
carries a hand-written `launcher-progress.tsv` with fabricated session ids, a hand-written
`dispatch-actual.json`, 32 one-line fabricated seat reports, a SCORECARD row containing
`round 61`, and a hand-written `close/dispatch61-tip.txt` holding the CLEAN line. **No seat
ever ran; no real dispatch record exists** — and the counter returns HELD 4/4, exit 0.

Why (gate source `scripts/dispatch-evidence.mjs` `inspect`): P2's CLEAN is derived solely from
three author-writable files in the wave dir — `launcher-progress.tsv` (rows parsed for
`name/session/exit/pid`, where any non-null session string counts; only literal `null` trips
`NOT_A_DISPATCH`), `dispatch-actual.json` (internal consistency of `planned/sessionIds/exit0/
reports/dead` against the progress rows), and the `<Seat>.md` files' existence/size. The
`NOT_A_DISPATCH` guard is a token-membership check, not provenance (committed control
`ctl-c1-critic-a2c-one-id-bypass.txt`: 32 members, agentId null on 31, one non-null →
CLEAN exit 0). The gate never reads the harness registry, launcher logs, per-seat stream
files, or external history. P1's selftest never reads the wave; P3/P4 are satisfiable by the
same authored files.

Do-nothing variant: A5 split control `ctl-c1-critic-a5-commit-worktree-split.txt` — commit
`ced3ece3` holds 32 **zero-byte** reports and no tip receipt; worktree after commit holds 32
one-line reports + untracked tip. Probe prints HELD 4/4 with P2/P4 PASS. So even a control
that writes zero working bytes at the measured rev reads HELD.

## 3. Task/run identity — not externally verifiable from what the counter reads

- The identity the counter sees is the `session=` string in `launcher-progress.tsv` (and
  `agentId` in `dispatch-actual.json`). Round-61 w1 rows are naming-convention strings
  (`L1Kumitate61.<Seat>`) that an author can mint freely; every round-61 w1 row carries
  `pid=- start=- end=-` (verified across the file) — no process metadata.
- The harness dispatch record is `.ufo/waves/round-61/w1/swarm-registry.json`
  (ufo-swarm-registry-v1); neither `launcher-progress.tsv` nor `dispatch-actual.json` is
  emitted by the harness — they are produced later by `scripts/make-dispatch-actual.mjs`
  (receipt `ctl-c1-critic-live-gate.txt`). Round-61 w1 has no `.stream.jsonl`, no `.err`, no
  launcher log in-repo; round-60 w1 **does** carry per-seat `.stream.jsonl` (e.g.
  `ConnectorSiblings.stream.jsonl`) and a launcher log, which the R60-V6 table uses. So
  stream/history evidence that could discriminate real dispatch from fabrication exists
  in-repo for round-60 and is absent for round-61 — and neither the gate nor the probe
  consults it.

## 4. Revision-byte-only — no (P2/P4 read the worktree)

- P2 spawns the gate against `--root <lane>` (worktree) and uses `git ls-tree <rev>` only for
  **name presence** of `launcher-progress.tsv`, `dispatch-actual.json`, and ≥32 `.md` names.
  The probe's "≥32 non-empty seat reports" plan sentence is not enforced at rev: no size/content
  check on rev bytes (non-emptiness comes only transitively from the worktree gate's
  `statSync(...).size > 0`, `dispatch-evidence.mjs` line ~120).
- P4 is `readFileSync(lane/.ufo/waves/round-61/close/dispatch61-tip.txt)` — worktree.
- Only P3 reads rev bytes (`git show <rev>:SCORECARD.md`).
- A dirty worktree can flip P1/P2/P4 verdicts for a fixed rev with no tree change; A5 proves
  P2/P4 satisfy the predicate from worktree bytes while the measured rev holds no working
  evidence.

## 5. The counter double-fails (false-green and false-red)

- False-green: §2.
- False-red: the genuine landed round-61 state reads **UNMET 2/4** at `019a844c`
  (`close/a2-tip-dispatch61.txt`): P3 MISS because the committed SCORECARD capabilities row
  (line 1794) contains no `round 61` substring (it reads `first working round 60`; verifier
  spot-check re-derived the same at `f351c520`), and P4 MISS because `close/dispatch61-tip.txt`
  does not exist at rev (only `a2-tip-dispatch61.txt` does). Per the verifier spot-check §6,
  C1 already failed as declared in round 61 (operability unchanged).

## 6. Round-62 repair spec vs present lane state (C1-relevant acceptance gaps)

The routed repair spec (w1/ScribeRouted follow-up 1-2; w1/ReviewClaims §6; spot-check §6
R61-V2) requires the next frozen v2 counter to: (a) read revision bytes only (`git show <rev>:…`
/ `git archive <rev>`; dirty-worktree measurement = fail-closed); (b) bind P2 to evidence the
lane cannot author (session ids resolvable in `history://`, or stream files); (c) ship
positive and negative controls committed with expected verdicts. None of this exists in the
lane today: no v2 probe, no C1 control, no honest-state control in round-62 `controls/`, and
the only committed round-62 baseline is the **forged** C2 one reading HELD 6/6
(`forged-control-counter-before.txt` at `4247d2da…`). Any claim frozen over the inherited
predicate stays false-green enabled (repair itself unlanded).

## 7. Impacted axes

- operability (C1 capability acquisition): the dispatch-evidence capability claim remains
  unverifiable — the counter reads HELD on no-dispatch fabrication and UNMET on the honest
  landed record.
- coverage (C2, same counter family): D61 E4/E5/E6 worktree reads and E3 row-parse defects
  persist unrevised (documented in w1/AttackC1C2 and w1/ReviewClaims; outside this seat's
  primary target but part of the same freeze).
- report/provenance chain: `plan.md` absent → there is no frozen round-62 claim sentence to
  attack or verify; citing one requires inventing text, so any closure over the missing plan
  is unattributable.

## 8. Smallest safe correction

Because the inherited rule is satisfied-by-fabrication and unsatisfiable-by-honesty, the
correction is to the counter + freeze, not to prose:

1. Re-place P2/P4 (and E4/E5/E6) to read only rev bytes — `git show <rev>:<path>` or a
   `git archive <rev>` worktree — and fail closed when the worktree/rev tree diverge.
2. Enforce ≥32 **non-empty** reports at rev (size check over rev bytes, not just name
   presence).
3. Cross-check `launcher-progress.tsv` rows and `dispatch-actual.json` members against an
   un-authorable record (harness `swarm-registry.json` and/or per-seat stream/launcher-log
   process metadata); require `pid/start/end` non-`-` values.
4. Align P3's required `round 61` with the committed row text (or pin the literal cell).
5. Commit four controls with expected verdicts alongside the counter: honest lane-HEAD run →
   HELD; full-fabrication fixture → UNMET; zero-byte-reports-at-rev → UNMET;
   commit-worktree-split → UNMET in both states.

Findings only; no verdict; no edits.
