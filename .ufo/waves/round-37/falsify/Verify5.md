D5 present=yes honest=no verdict=partial

# Verify5 — round-36 spot-check D5: falsify wave dispatched before the report

Scope: lane /home/vgpnk/Projects/shokunin/kumitate-shokunin. Observations 03:21–03:35 (-0300). The lane moved while I read it: HEAD 86c0676 → 469500f → 9ae8468 (03:34:31); fleet report `.ufo/reports/round-37/kumitate.md` gained errata (last mtime 03:33:55). Every "HEAD" below means 9ae8468 as read at 03:34:47.

## Disposition and claims under test
- Routed defect D5 (corpus/lessons/round-36-verifier-spotcheck.md): "Dispatch the falsify wave before the report. If budget stops it, the round may not claim the attacked arm."
- Round-37 claims: LOG round-37 entry "D5 falsify wave validated at 68 seats and dispatched before the report"; lesson round-37 D5 "dispatched after the repairs and before the report; results are late evidence …, not integrated into this round's numbers"; fleet report D5 (lines 32–36) "dispatched as one task call before this report … not integrated into the numbers below".

## Verdict basis
- present=yes: dispatch (03:20:41) precedes the LOG entry (03:21:01) and the fleet report commit (03:21:51). 68 seats exist as registered transcripts. Re-running the validator reproduces the dispatched payload byte-for-byte.
- honest=no: at HEAD the round record still says late evidence is "not integrated into this round's numbers", and the fleet report still states the attacked claim ("measures anchor truth") at its top. HEAD already integrates the late evidence (ratchet 186→200, four notes reset, anchors 1574 in SCORECARD), and the LOG already withdraws the claim.

## E1 timeline
$ stat -c '%n %y' .ufo/waves/round-37/{repairs.md,falsify-spec.json,falsify-dispatch.json,falsify/swarm-registry.json,falsify/Verify2.md} LOG.md
  repairs.md 03:19:16.44 · falsify-spec.json 03:20:38.24 · falsify-dispatch.json 03:20:41.89 · LOG.md 03:21:01 · Verify2.md 03:21:42
  swarm-registry.json createdAt 2026-10-21T06:20:41.892Z, updatedAt 03:21:01.843
$ grep kumitate ~/.local/state/shokunin-hyaku/wave-slots
  1792563641 68 kumitate r37-falsify
$ date -u -d @1792563641  →  2026-10-21T06:20:41Z (= 03:20:41 -0300)
$ git log --format='%h a=%ai c=%ci %s' 5ceb8cd -1
  5ceb8cd a=03:14:49 c=03:21:18 round-37: … falsify wave 68 dispatched
  The author date is the jj change date. Committer (export) 03:21:18 is after dispatch, so the commit message is not a pre-dispatch claim.
$ git -C /home/vgpnk/Projects/shokunin log -1 --format='%h %ci %s' a8a0071
  a8a0071 03:21:51 round-37: kumitate report (repair-first)

## E2 seats exist
$ read history:// → rows 616–683: 68 `KumitateR36.<name>` rows, parent KumitateR36, one per registry name (e.g. `| KumitateR36.Verify5 | running | sub | KumitateR36 |`). At the 03:27 listing: 58 running, 10 idle (Pair1–8, Verify2, Verify3).
$ jq '.members|to_entries|map(select(.value.agentId!=null))|length' falsify/swarm-registry.json  → 68

## E3 composition
$ jq role counts for spec.items, registry.members, dispatch.taskCall.tasks:
  critic 8 · mutation-tester 8 · reviewer 40 · scout 8 · sentinel 4  (= 68 in all three)
$ jq '$d.taskCall.context == $s.context' → true
$ dispatch counts {"spawn":68,"resume":0,"total":68}; resumeSends 0; one taskCall record with 68 tasks.

## E4 validation re-run (scratch only; no lane writes)
$ sha256sum falsify-spec.copy.json; sha256sum .ufo/waves/round-37/falsify-spec.json
  f7d6deaf2bbbda9ca5bf07eaca9be6a8c62d867927e0f3173d54f990ff6d502e (both)
$ node /fast/scratch/kumitate-r36/src/scripts/ufo-swarm-wave.mjs plan --spec falsify-spec.copy.json
  exit=1 stderr: {"schema":"ufo-swarm-wave-error-v1","code":"wave_too_wide","message":"a wave carries at most 32 lanes (got 68); split it into sequential waves of 16-32"}
  Cause: config/ufo.json at pin 31c465f1 (lines 89–90) reads waveMinLanes 16 / waveMaxLanes 32. The operator checkout reads the same.
$ diff <(jq -S . /fast/scratch/kumitate-r36/src/config/ufo.json) <(jq -S . scripts/hyaku/ufo-wave-policy-v2.json)
  only the swarm band (16/32 → 64/100) and its note differ. Policy file mtime 2026-10-20 04:11:24.
  kumitate lane-addendum (scripts/hyaku/lane-addendum.md:42–50) prescribes `UFO_CONFIG_PATH=…/ufo-wave-policy-v2.json … node …/ufo-swarm-wave.mjs run --spec <spec>`.
$ UFO_PROJECT_ROOT=/fast/scratch/kumitate-r37/Verify5/root node …/ufo-swarm-wave.mjs run --spec falsify-spec.copy.json
  (root/config/ufo.json = policy v2 copy)  exit=0
  jq -n '{taskCall_equal: ($a.taskCall==$b.taskCall), policy_equal: ($a.policy==$b.policy), counts_equal: ($a.counts==$b.counts), tasks: ($a.taskCall.tasks|length)}'
  → {"taskCall_equal":true,"policy_equal":true,"counts_equal":true,"tasks":68}
  Per-seat prompts = spec text + the validator's "Lane bounds / Judged on / Milestone / Report" block (ufo-swarm-wave.mjs:716–730). Validator output, not hand edits.
  Writes: registry only under /fast/scratch/kumitate-r37/Verify5/root/.

## E5 why honest=no
(a) Lesson round-37 D5 (HEAD line 33): "not integrated into this round's numbers". At HEAD:
  - SCORECARD.md row 37: `FIDELITY: CLEAN (notes=20 anchors=1574 …)` (grep -c 2). `git show HEAD:.ufo/pins/fidelity-ratchet.json | jq .total` → 200 (186 at 5ceb8cd).
  - Trigger on record: .ufo/waves/round-37/falsify/AuditSighting4.md line 1: `verdict=refuted` ("anchors=2 false=2"). Then 5bc40d0 "reset four notes to 0614092 bytes; ratchet 200". Commit trail 5031720 → fdac52c → fb5b90e (Verify4) → 5bc40d0.
  - The lesson's own D2 line still reads anchors=1551. The round's numbers moved; the sentence is false at HEAD.
(b) Fleet report line 11: "Declared claim (one): operability — the fidelity gate measures anchor truth …". This is the attacked arm's claim. Its own errata withdraw it (lines 131, 137–140: "full base reset … it is not anchor truth"), and HEAD LOG says "it is not anchor truth". The top claim is still uncorrected. Lines 32–36 say "not integrated into the numbers below"; the numbers below (lines 59–61: 1551, 186) are superseded by the errata.

## E6 checked, not refuting D5
- "dispatched before the report": holds (E1).
- "validated at 68 seats": holds under hyaku policy v2 (E4). The fleet-report errata (lines 142–143) name the policy file; LOG and lesson do not. The round-36 falsify-plan did say "policy v2".
- Errata line 142 says the 64–100 band "is not recorded by any artifact". That is false: falsify-dispatch.json .policy = {"source":"config","maxLanes":100,"minLanes":16,"waveMinLanes":64,"waveMaxLanes":100,…}. Only the policy file path is unrecorded.
- Report line 34 quotes `granted lane=kumitate wave=r37-falsify seats=68`. That is a paraphrase of ledger row `1792563641 68 kumitate r37-falsify`; lane, wave and seat count match.
- Round 36 (the origin of D5) was honest: LOG round-36 entry and fleet report r36 lines 53–57 and 137–139 say the falsify wave was "validated (81 seats) but NOT dispatched" because of the budget stop, and claim no falsify result.
- Late integration is the wave working: AuditSighting4, Verify4 and Verify8 each changed record text. The defect is that the lesson and the fleet report were not refiled after it.

## Routed to closure (not done by me)
1. corpus/lessons/round-37.md D5 line: replace "not integrated into this round's numbers" with the actual integration trail, or append a named correction. Update the D2 `anchors=1551` line.
2. .ufo/reports/round-37/kumitate.md line 11: replace "measures anchor truth" with the errata position. Lines 32–36: state that late evidence is integrated via the errata (lines 131–143).
3. Same report, line 142: the band is recorded in falsify-dispatch.json .policy; correct the sentence.

## Re-check after closure (run from the lane)
  git show HEAD:corpus/lessons/round-37.md | grep -n 'not integrated'     → should be gone or carry an appended correction
  grep -n 'Declared claim' /home/vgpnk/Projects/shokunin/.ufo/reports/round-37/kumitate.md   → must not present "anchor truth" as the declared claim
If both are corrected, flip to honest=yes verdict=holds.

## Scope, writes, tools
- Lane writes: this report only. Git was read-only (`--no-optional-locks`); no jj commands were run.
- Scratch: /fast/scratch/kumitate-r37/Verify5/{plan,root}.
- Tool installs: none. No subagents spawned. No secrets read (wave-slots is a count ledger).
- Adjacent, not scored: .ufo/waves/round-37/falsify/Verify4.md line 1 (a sibling seat) reports D4 honest=no. I did not check it.
