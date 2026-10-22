RESULT CritProbeBias rev=3908f322c4c473f1a8b45c8d1c14054205eb7647 verdict=mixed open=6/6 candidate=0/6
Reproduced. Command (scratch /fast/scratch/hyaku/kumitate-r39/seats/CritProbeBias, probe.mjs = git show 3908f322:.ufo/waves/round-39/probe/floor-probe.mjs.txt): node --input-type=module - --lane /home/vgpnk/Projects/shokunin/kumitate-shokunin --rev <rev> --src /fast/scratch/hyaku/kumitate-r39/src < probe.mjs
fac39171: CONTROL exit=0 CLEAN true=777 debt=21; A1-A6 all ACCEPTED exit=0; FLOOR_PROBE accepted=6/6
3908f322: CONTROL exit=0 CLEAN true=778 debt=20; A1 and A2 REFUSED exit=1 kinds=TOKEN_FORGED,BASE_TRUE_LOST; A3 REFUSED exit=1 kinds=TOKEN_FORGED; A4 REFUSED exit=2 FAIL-CLOSED (PIN_INVALID); A5 and A6 REFUSED exit=1 kinds=BASE_TRUE_LOST; FLOOR_PROBE accepted=0/6
Refusal reasons: none of the refusals is a crash. Four attacks (A1, A2, A5, A6) are refused by the floor (BASE_TRUE_LOST). A3 is refused only by the note-level TOKEN_FORGED check, which runs without --base. A4 is refused by the pin-source schema rule (exit 2) before the floor runs. All three are C2 mechanisms, but only four of the six exercise the floor. When I removed the source rule (mutant m-nosource ce1adef9), A4 was refused exit=1 kinds=BASE_TRUE_LOST, so the floor also covers A4.
Instrument defect 1: the probe counts any nonzero exit as REFUSED, and its only control is the unedited tree. Two mutants built on the open tool, with no floor fix, both score 0/6 with CONTROL CLEAN:
  m-blanket 78a43845 (exit 1 whenever the working tree differs from HEAD): every attack REFUSED kinds=ANY_EDIT; FLOOR_PROBE accepted=0/6
  m-crash b1c85658 (throws whenever the working tree differs from HEAD): every attack REFUSED exit=2 FAIL-CLOSED (INPUT_UNREADABLE boom); FLOOR_PROBE accepted=0/6
  So 0/6 cannot tell the floor apart from a tool that refuses everything or crashes. A5's re-pin refusal path also counts as REFUSED without running the floor (present in the code, not triggered here).
Instrument defect 2: there is no benign-edit control, and the candidate over-refuses honest re-citations that the open revision accepts (node extra.mjs --lane <lane> --rev <rev> --src <src>):
  B1 S8#26 scripts/charter-scribe/sync.mjs:508-511 narrowed to :508, where the token is (write-pin=0): fac39171 ACCEPTED CLEAN true=777; 3908f322 REFUSED exit=1 kinds=BASE_TRUE_LOST
  B2 S8#3 scripts/charter-scribe/config.json:2 widened to :2-3 (write-pin=0): fac39171 ACCEPTED; 3908f322 REFUSED exit=1 kinds=BASE_TRUE_LOST
  B3 prose-only edit: ACCEPTED at both revisions
  So A5 is refused because any change to the raw text of a base-true anchor breaks its identity. The floor does not detect a vacuous widening to EOF. This is a tradeoff for the judge, and it hurts operability.
Attack selection fits the fix. A3 forges with source=pair, which is exactly the TOKEN_FORGED trigger. A1, A2, A4, A5 and A6 all target the single anchor S8#3 (E[3]). Neither declared open limit is probed.
L1 limit 1 (a self-declared review:<seat> source is not bound to a record): CONFIRMED, and it is worse than stated.
  X1: S8#92 scripts/fleet-ledger-read.mjs:498, debt:false, set to source=review:NoSuchSeat token=the expect=true. Result at 3908f322: ACCEPTED exit=0 CLEAN true=779 debt=19 (tries=1). A stopword token is enough to pass overrideValid. Same result at fac39171.
L1 limit 2 (a new false anchor traded against one repaired debt anchor): CONFIRMED, but the bound is wrong. The tally is per note against the frozen base, not against the current state. Census debt by revision: e18ff1af=77, fac39171=5, 3908f322=4. Command: node headroom.mjs --lane <lane> --rev 3908f322... --src <src> --n 1,73,74 (appends N `zzNoSuchSymbolI` anchors at never-cited ranges, then runs --write-pin and --base):
  new-false-anchors=1: ACCEPTED CLEAN debt=21
  new-false-anchors=73: ACCEPTED CLEAN anchors=884 debt=93
  new-false-anchors=74: REFUSED exit=1 kinds=DEBT_GREW
  [INFERENCE, not run] route-probe-cluster.md has the same kind of headroom: base debt 74 against 16 now, which is 58 slots.
Impacted axes: operability (the C2 count overstates the floor's strength, and honest re-citation of base-true anchors regresses) and coverage (up to 73 new false anchors fit in the census note; a debt anchor can be forged true through review:<seat>).
Smallest safe correction to the probe: count REFUSED only when exit=1 and the attack's expected finding kind is present, and mark any other exit as INVALID. Add benign controls B1-B3 that must be ACCEPTED, and report X1 and the X2 headroom as declared-open attacks. The numbers 6/6 to 0/6 are reproducible and correct in direction, but on their own they do not establish the claim.
Scratch only: mutants were committed and tagged m-blanket, m-crash and m-nosource in my seat clone; nothing was pushed. No tools were installed or upgraded.
