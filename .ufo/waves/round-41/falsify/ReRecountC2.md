RESULT ReRecountC2 rev=4e58bb0ee48a069ac7dbd99b6e5afe70dcd36ba3 verdict=AGREE mismatches=0 report_mismatches=0

Scope. The C2 counter at the measured revision, and my own python recount of all seven *-dispatch.json payloads in rounds 38, 39 and 40, compared with `node scripts/wave-census.mjs --round 38 --round 39 --round 40 --json`. A seat means one task in a payload. The recount never used jq or the census code. No lane file changed and there is no code change, so no patch. Scratch: /fast/scratch/hyaku/kumitate-r41/seats/ReRecountC2/ (clone lane/, recount.py, recount-result.txt, recount-part1.txt, probe-run.txt, census.json, demo-nojq.txt, demo-noroot.txt). Tools as found: node v24.21.0, python3 3.14.8, git, jq-1.8.2. Nothing installed or upgraded.

Evidence
1. git clone of the lane, then checkout --detach 4e58bb0ee48a069ac7dbd99b6e5afe70dcd36ba3: HEAD is that revision, status empty.
2. TMPDIR=<scratch> bash .ufo/waves/round-41/probe/wave-recount.sh.txt: RECOUNT_MISMATCHES=0, CAPABILITY_ROWS=2, EXPECT_4_EXIT=1, EXPECT_3_EXIT=0. These match the claimed after values. Each listing has 7 rows.
3. node scripts/wave-census.mjs --round 38 --round 39 --round 40 --json: exit 1, verdict DRIFT, 4 findings, all STRAY_REPORT.
4. My recount against the census JSON, per wave, as mine/census: seats / attack / reports present / absent
   38 build     90/90  42/42  89/89  1/1
   38 falsify   88/88  59/59  45/45  43/43
   39 build     46/46  28/28   0/0  46/46
   39 falsify   37/37  21/21   8/8  29/29
   39 residual   8/8    8/8    8/8   0/0
   40 build     32/32  14/14  31/31   1/1
   40 falsify   35/35  31/31  26/26   9/9
5. Per-role counts: 0 differences in all 7 waves. Stray files: mine 4, census 4, the same four (round 38 falsify supplements).
6. Report paths: 336 seats, 207 present, 129 absent. Presence differs for 0 seats. My trailer rule and the census regex pick the same path for all 336 seats.
7. Registry members equal the task names, and counts.spawn equals the seat count, in all six v1 waves. resumeSends is 0 everywhere.

Findings, ranked (none changes a number above)
F1 medium, operability. The probe can print zero with no data. (a) With a stand-in jq that exits 127: RECOUNT_MISMATCHES=0, both listings empty, probe exit 0, and node prints a broken-pipe trace. (b) In a tree with no round folders: RECOUNT_MISMATCHES=0, EXPECT_4_EXIT=2, EXPECT_3_EXIT=2, probe exit 0. At 4e58bb0 the zero is real (7 rows each side), but the probe never checks that. Fix: require 7 rows per side, use pipefail, and exit non-zero on any unmet condition.
F2 medium, receipt. The SCORECARD wave-census row points at .ufo/waves/round-41/final/wave-recount-*.txt. At 4e58bb0 that matches only wave-recount-before-27592977.txt, which records the instrument missing (RECOUNT_MISMATCHES=7, CAPABILITY_ROWS=1). No after-receipt is committed at 4e58bb0. Its rule source, AXES.md §Capabilities, is not in the committed tree or the lane root.
F3 medium, wider than its evidence. Round 39 prints seats=91, attack=57, reports=16/91. seat-gate.txt says the 46-seat build and the 37-seat falsify never dispatched; only the 8-seat residual spawned. The residual wrote its eight reports to the falsify paths, so eight files count twice: 16 claims, 8 files. Rounds 38-40 together: 207 present claims, 199 distinct files. The census docstring states this limit; the printed rows do not.
F4 low-medium, wording. plan.md C2 says the instrument prints "seats dispatched" and reads "the matching swarm-registry.json". It prints payload seats and reads the registry embedded in each envelope; no code path opens a swarm-registry file. The six swarm-registry.json files equal their envelopes and task names, so no number changes.
F5 low. The round 38 DRIFT verdict comes from four files that falsify-summary.json lists as "supplements". The census rule matches its own definition, and the probe does not use the verdict.
F6 low. --expect applies to every listed round's wave of that name. `--round 38 --round 40 --expect build:mutation-tester=3` gives FINDING EXPECT_MISMATCH round=38 build payload=0, exit 1. The probe uses one round, so it is unaffected; the usage text does not say this.
F7 low. The tool shell's jq is a shell built-in that reports jaq 3.1.1. Child processes get jq-1.8.2 (~/.local/bin/jq or /usr/bin/jq), and the probe gives the same zero with either. The probe prints no jq version.
F8 low, latent. ScoutDeadSeat (round 38 build) has a second "Report:" on line 12, with no path, after a round-37 path on that line. Both methods pick the round-38 path today. A .ufo/waves path added after that second "Report:" would switch the census to it.

Checked against the lane's own receipts (agree)
- Round 38: falsify-summary.json dead_seats (43) and falsify-seat-accounting.txt (9 Codex and 34 Zai names) equal the census absent set. Summary reports 45 equal census present 45. build-seat-accounting.txt: 90 dispatched, 89 reports, ConnSibling failed.
- Round 39: seat-gate.txt says build 46 and falsify 37 "Nothing dispatched"; residual "8 spawned".
- Round 40: seat-gate.txt: seven mutation-testers died at spawn, ReviewProbeValidity and ReviewGateDiff were cancelled, ExecTokenKept was cancelled. These equal the census absent sets (9 falsify, 1 build).
- Present means existence only. All 207 present reports are at least 1,638 bytes; none is empty.
- Lane working copy and clone: same file lists and same bytes for rounds 38-40 (199, 40 and 95 files).
- node scripts/wave-census.mjs --selftest: WAVE_CENSUS_SELFTEST: 12/12 pass, exit 0.
- Able to fail: --round 40 --expect build:mutation-tester=4 gives EXPECT_MISMATCH ... payload=3, exit 1; =3 gives WAVE_CENSUS: CLEAN, exit 0.

Not checked: the S038 source row (outside this item); the round 41 census; the AXES.md rule source (not found in the lane; I did not search elsewhere).
