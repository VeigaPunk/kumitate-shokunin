WAVE1 items=68 dup=4 registry=yes verdict=refuted

Both failing conditions hold: Wave1–Wave4 are one prompt body, and the unqualified "validated at 68 seats" claim is refuted by the fleet's production gate. Registry exists. Pin and trailers hold.
State: lane HEAD c589b384 (03:34:49 -03), 15 commits past base 91da27c6ac17712aa53ea0adb27d89b133d60081 (ancestor). Falsify spec, dispatch, and registry last touched at 5ceb8cd. HEAD moved during this check; findings cite the states shown.

## 1. Duplicated prompt — FAILS (dup=4)
$ python3: normalize each spec prompt (item name → <N>, digits → #), group by sha256
  group of 4: Wave1 Wave2 Wave3 Wave4
  exact-byte duplicate groups: 0
  Wave2 vs Wave1 differing spans: "record 1"→"record 2" and "WAVE1"→"WAVE2" (nothing else)
  dispatch task = spec prompt + identical suffix for 68/68; Wave1–4 tasks differ only by name
  $ grep -cE 'record [0-9]+ (is|=|means|covers)' falsify-spec.json → 0 (no definition of "record N")
Digit-equal families that are NOT duplicates (index is a defined partition, complete and unique):
  AuditRemainder|AuditSighting|AuditRouteProbe|AuditNativeTrial|Truth 1..8: "group|slice k/8", 8/8 each
  Pair1..8: "mutant k" (distinct offsets); Verify1..8: "D1..D8"; Rep1..4: "section k"; Sec1..4: distinct topics
Gate: ufo-swarm-wave.mjs:19–21 requires "pairwise-distinct expanded prompts"; the check is exact-string, so Wave1–4 pass.
Seats: 4 dispatched, 3 redundant → 65 distinct bodies.
Corroboration (not evidence): agent://KumitateR36.Wave3 lists "the exact difference between Wave1 and Wave3" as a remaining check; Wave4 repeats the same checks.
Disclosed, not fixed: fleet report erratum 6, /home/vgpnk/Projects/shokunin/.ufo/reports/round-37/kumitate.md:141–142 ("near-duplicate prompts … recorded, not fixed").

## 2. Accounting claim unsupported — FAILS (one claim)
LOG.md:1721–1722 and corpus/lessons/round-37.md:31 (HEAD) say "validated at 68 seats" with no band qualifier.
$ cd ufo-fsd-alpha && node scripts/ufo-swarm-wave.mjs plan --spec <lane>/.ufo/waves/round-37/falsify-spec.json   (UFO_CONFIG_PATH unset)
  rc=1  stderr: {"code":"wave_too_wide","message":"a wave carries at most 32 lanes (got 68); split it into sequential waves of 16-32"}   (check at ufo-swarm-wave.mjs:982)
  config/ufo.json sighting.dispatch.swarm: minLanes 16, waveMinLanes 16, waveMaxLanes 32, maxLanes 100, globalRunnerCeiling 1056
$ UFO_CONFIG_PATH=/home/vgpnk/Projects/shokunin/scripts/hyaku/ufo-wave-policy-v2.json UFO_FLEET_ALLOW_EXTERNAL_TOOLS=1 node scripts/ufo-swarm-wave.mjs plan --spec <same>
  rc=0; policy {source:"config", waveMinLanes:64, waveMaxLanes:100, …}; counts spawn 68
  policy, counts, context, and all 68 tasks are byte-identical (==) to falsify-dispatch.json
  policy file sha256 70418a0f0b89288b… matches final/README.txt; its sighting.dispatch.swarm has waveMinLanes 64 / waveMaxLanes 100
So 68 seats validate only under a policy file outside the fleet root. The guard (ufo-swarm-wave.mjs:419) requires UFO_FLEET_ALLOW_EXTERNAL_TOOLS=1 for that path; neither wave-plan-validation.json nor final/README.txt records it. The dispatch labels the band source:"config".
final/README.txt (HEAD) discloses the 64–100 band. LOG and lesson do not. Fleet report erratum 6 (lines 143–144) says the band is "not recorded by any artifact", which README.txt now contradicts.

## 3. Base, pin, context
- base 91da27c6 exists and is an ancestor of HEAD — PASS
- pin /fast/scratch/kumitate-r36/src: HEAD 31c465f15669f744848bd9f5d56191c5085670f7; `find … -perm /0222` → 0 writable entries — PASS
- spec context "repair tree uncommitted" — FAIL: the repair is committed (5ceb8cd, 03:14:49); `git status --porcelain` lists only untracked falsify/*.md. The seats read a stale premise.
- every absolute path in spec/context exists (except the <YourName> placeholder); ufo-fsd-alpha appears only as a prohibition — PASS

## 4. Report-trailer rule — PASS
- 68/68 dispatch tasks end "Report: write your scoped findings to .ufo/waves/round-37/falsify/<Name>.md"; each equals reportDir/<name>.md; all relative; directory exists.
- Spec item prompts carry no trailer (added at dispatch only). The Rep prompts do not name the round report path; it lives at the fleet root (see §6).

## 5. Registry — yes
- falsify/swarm-registry.json: schema ufo-swarm-registry-v1; 68 members; keys = spec names (68/68); role, axes, milestone = spec (68/68); reportDir ok; agentId "KumitateR36.<name>" (68/68).
- item null 68/68: partition labels are absent from the registry (the validator takes `item` as the partition label, ufo-swarm-wave.mjs:939–944).
- dispatch-embedded copy: agentId null 68/68 (snapshot never updated after spawn).
- Round-37 names vs round-36 IDs: 0 collisions (96 distinct KumitateR36.* tokens in round-36/rounds/reports). The prefix is cosmetic.

## 6. Seat accounting — consistent apart from §1–2
- 68 = spec items = dispatch tasks = counts.spawn = registry members (identical name sets).
- Roles: reviewer 40, mutation-tester 8, critic 8, scout 8, sentinel 4. All in validator SWARM_ROLES (16-item probe with all five roles: plan rc=0).
- C2 84/84: `node scripts/proxy-check.mjs` at HEAD → "PROXY: MATCH (… C2=84/84 …)", exit 0. LOG and lesson now say 84 (earlier 83 superseded).
- final/checklists.txt at HEAD: "CHECKLIST: 14/14 pass / VERDICT: PASS" (earlier 13/14 superseded at 8c41439).
- Round report is at /home/vgpnk/Projects/shokunin/.ufo/reports/round-37/kumitate.md (fleet root, 161 lines). Its D5 says "68-seat falsify wave generated … dispatched as one task call"; LOG and lesson say "validated". The wording disagrees.

## 7. Not verified
- surface-probe --checklists not re-run (14/14 is the refreshed artifact, not my run).
- Spawn records: only agent://KumitateR36.Wave2–4 status was read.
- dispatch.calls=1 in wave-plan-validation.json is self-declared.

## 8. Tools and writes
- No installs or updates. `swarm` (tmux session manager): --version/--help only (usage printed; no session attached).
- node v24.21.0; jq (jaq 3.1.1); python3. Git read-only with GIT_OPTIONAL_LOCKS=0.
- Validator used in `plan` mode only (persistWaveRegistry is on the `run` branch). Lane registry mtime 03:21:01 and 16721 B unchanged after both plan runs; fleet repo `git status --porcelain` = 0 lines after the runs.
- Scratch writes only: /fast/scratch/kumitate-r37/Wave1/probe-roles-16.json, ufo-band-64-100.json.

## 9. Fixes for the main agent (not applied)
1. Wave1–4: give distinct content or drop three; define or delete "record N".
2. Re-issue the 68 seats as sequential waves of 16–32 under the fleet config, or change the band by operator decision. Record the policy digest and the env opt-in in the wave artifact.
3. LOG.md:1721–1722 and corpus/lessons/round-37.md:31: qualify "validated" with the band and the production refusal.
4. Spec context: replace "repair tree uncommitted" with the commit hash (5ceb8cd).
5. Registry: set `item` partition labels. Pin the lane revision in the spec, since HEAD moved 15 commits during the wave.
