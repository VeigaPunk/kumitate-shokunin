RESULT ReviewErratum rev=1530a75521345e0f4516ed7146180e65f788e017 verdict=defects checked=23

Scope: the name-collision erratum in corpus/knowledge/kimi-skills-plugins.md and the four census re-pins in corpus/knowledge/kimi-residue-files.md. Clone: /fast/scratch/hyaku/kumitate-r40/seats/ReviewErratum/lane at 1530a75; base worktree at f69817e (round open). No citation or factual error found. Two minor defects and one nit. Judged on coverage:kimi-layer: the census is CLEAN and the erratum counts match it.

Defects (minor)
D1 label: kimi-skills-plugins.md lines 563-565 (erratum bullet 1, the collision bullet) say the precedence outcome "stays rule-derived, not measured". The word inference and the note's INFERENCE tag do not appear there. The same claim is tagged "INFERENCE, not measured" at lines 295 (heading), 302 and 433. Substance is labeled unmeasured; the literal label is missing. Fix: write "INFERENCE, not measured" in that sentence.
D2 attribution: kimi-residue-files.md line 367 says the four citations went stale through round-34, round-35 and round-40 edits. git grep per revision shows the citations were correct at round 20 (f86b8ed: RE_CHAIN 97, K5 rows 130-132, FROZEN 145), then shifted at round 34 (1a8eed5: 101, 134-136, 149) and round 35 (4c9e407: 101, 135-137, 150). They were already wrong at round open f69817e. Round 40 moved the correct anchors +5 (106, 140-142, 155) and did not cause the staleness. Fix: drop round-40 from the causal list.
N1 nit (audit trail): line 367 gives no old-to-new map. The map (97 to 106; 130-132 to 140-142; 145 to 155; 38-41 and 32-41 unchanged) appears only in .ufo/waves/round-40/build/ExecKimiCensus.md lines 185-189.

Residual, outside the erratum
R1: residue note line 247 says the config chain count is "= 12", and lines 13-14 quote "members=49 ... chain=12". The live census at 1530a75 says members=52 and chain=7. `ls -1d /home/vgpnk/.kimi-code/config.toml*.bak | wc -l` prints 7. Line 248 (re-pinned) ends the same sentence as the stale count.
R2: default cite-check reports ERROR UNRESOLVED at residue line 337 (bare workspaces.json not found under src). Identical at f69817e and 1530a75. Not introduced here; the official pinned --src run was not performed.

Verified (holds)
V1 line 11: 38-41 is the K5 rule block; 140-142 are the three K5 rows (workspaces.json, tui.toml.bak, rc-qrcode.png); 155 is FROZEN with K5: 3.
V2 line 248: 106 is RE_CHAIN, /^config\.toml(\..+)?\.bak$/; lines 263-266 use it to count the chain as one member.
V3 line 255: 38-41 (K5 rules) and 140-142 (141 is tui.toml.bak). Holds.
V4 line 338: 155 is FROZEN with K5: 3. Holds.
V5 base f69817e: 97 is DEFAULT_ROOT, 130-132 are K4 rows (device_id, region, credentials/), 145 is the plugins/managed row. The old citations were wrong.
V6 cite-check at f69817e marks all four old citations OK (in range, silent); the new ones are OK at 1530a75. Confirms line 367's "cite-check does not flag" claim.
V7 erratum citations at f69817e: line 12 is "five entries, all symlinks"; 316-320 is the rule text; 333-335 is the quoted sentence (exact match); 440 is the round-34 "six children" bullet. All hold.
V8 collision observed: ~/.kimi-code/skills/kimi-webbridge/SKILL.md line 2 and ~/.kimi-code/plugins/managed/kimi-webbridge/skills/kimi-webbridge/SKILL.md line 2 both read name: kimi-webbridge.
V9 live skills root (stat -c): symbolic links godspeed, reverse-engineer-anything, shokunin, ufo, wwkd; real directories cursor-lane, kimi-webbridge. Seven children, as the erratum says.
V10 census at 1530a75 (node scripts/kimi-census.mjs): KIMI_CENSUS: CLEAN (members=52 checked=52 chain=7 info=4), exit 0; FAMILY K2 27; skills children 7.
V11 append-only: git diff --numstat f69817e 1530a75 gives 124 insertions and 0 deletions for kimi-skills-plugins.md; the errata block (lines 551-573) is the final section. The new K2 section is a 100-line mid-file insertion near line 218; the erratum's pre-insertion numbering discloses it. Residue note: 7 insertions, 4 deletions (the four in-place citation edits), disclosed by the appended paragraph at line 367.
V12 no other corpus note, SCORECARD.md or README.md repeats the falsified "no collision" sentence (grep).

Commands run
- git -C <lane clone> --no-pager diff --numstat f69817e 1530a75 -- <three files>
- node scripts/kimi-census.mjs (cwd lane clone)
- node scripts/cite-check.mjs --json (cwd base and lane clone; residue and census findings parsed)
- git grep -n -E "const RE_CHAIN|const FROZEN|id: 'workspaces.json'|dir: 'plugins/managed'" <rev> -- scripts/kimi-census.mjs, revs f86b8ed 1a8eed5 06757b0 4c9e407 f69817e 1530a75
- stat -c '%n | %F' /home/vgpnk/.kimi-code/skills/*
- ls -1d /home/vgpnk/.kimi-code/config.toml*.bak | wc -l

Gaps: the precedence outcome is not measured (no live rendered listing this round); the erratum says so. The UNRESOLVED error in R2 may be a default-argument artifact. The K2 section's other claims (S035, versions) and the census freeze logic were not reviewed here. Tools: none installed; used the host git, node v24.21.0 and the cite-check script. Writes: this report only, in the lane; scratch work lives under /fast/scratch/hyaku/kumitate-r40/seats/ReviewErratum/.
