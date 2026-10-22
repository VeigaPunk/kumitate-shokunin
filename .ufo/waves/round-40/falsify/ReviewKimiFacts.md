# ReviewKimiFacts — round 40 falsify, wave 2

Seat: ReviewKimiFacts (leaf reviewer, no subagents). Judged on: coverage:kimi-layer.
Milestone: r40 falsify at measured candidate.

RESULT ReviewKimiFacts rev=1530a75521345e0f4516ed7146180e65f788e017 verdict=errors checked=73 mismatches=6

## Scope and revision

- Candidate revision: 1530a75521345e0f4516ed7146180e65f788e017.
- The new section is `## ~/.kimi-code/skills/kimi-webbridge` in `corpus/knowledge/kimi-skills-plugins.md`, candidate lines 218-317 (the diff from f69817e is one 100-line hunk at `@@ -217,0 +218,100 @@`; the other hunk is the round-40 erratum at lines 550-573, which is outside this item).
- Round-open revision: f69817edf687c8ce4f87ed7953a353399232f69e (scratch worktree, used only for before-state gate runs).
- Lane master moved during the review to 5ae8ac9cbb1697e30ec32b717b8c4dafb757315c (kimi section edited; docs commit 0004ae3 before it). The primary verdict is for 1530a75, as the item asks. A master status section follows.
- Every check ran against live files on this host on 2026-10-22, except where a row names a lane file.

## Verdict basis

- Checked: 73 fact claims (table below). One claim = one checkable fact: a heading, a bullet, one table row, or one sentence clause.
- Not counted: lines labelled INFERENCE in the section (candidate lines 291-293 and 302-303); the "CLI workflow" ownership phrase at lines 313-314 (ambiguous, see Residual).
- Mismatches: 6 (C3, C4, D10, E4, E23, G3 below).
- Effect on coverage:kimi-layer: none. The axis inputs are K_members 52 (census CLEAN, members=52), K_sections 52 (proxy heading binding, K=52/52), C1k 5/5, and derived coverage:kimi-layer 10 (PROXY: MATCH at the candidate). The six mismatches are descriptive: a negative claim, a cross-reference, one inode, and two citation anchors or pointers.

## Mismatches at 1530a75

| ID | Line | Claim in section | Live measurement | Suggested repair |
|---|---|---|---|---|
| C3 | 244 | "a self-declared string with no file backing it on this host" | The daemon binary `/home/vgpnk/.kimi-webbridge/bin/kimi-webbridge` (10031288 B) contains the ASCII bytes `2.0.26` three times, at byte offsets 6575825, 6668394 and 9653302. The last two sit in the build flag `dev.msh.team/harness/agent-extension/internal/daemon.Version=v2.0.26`. So a file on this host records the same release string. The skill-tree statement is still true (only SKILL.md:6 carries it). | Replace the negative with the binary fact, or narrow it to "no file in the skill tree backs it". |
| C4 | 245 | "the same shape this note records for the other user skills" | The note records an unbacked version for one other user skill only: reverse-engineer-anything, note lines 391-392. The note says the other user skills carry no version at all. | Say "as recorded for reverse-engineer-anything". |
| D10 | 259-260 | "the full 64-hex values and the counting command are in this round's build report" | Build report `ScoutKimiWebbridge.md` lines 45-48 hold the full 64-hex values for SKILL.md and operations.md in both trees (4 values). The five cli-creator digests appear only as 16-hex prefixes, in `ScribeKimiSkillNote.md` lines 52-53. So 5 of the 7 skill-tree values have no full value in the report. The counting command is present (`ScoutKimiWebbridge.md` lines 209-217). | Name which values are full, or add the five full digests. |
| E4 | 268 | managed copy "real dir under a mode 700 plugin root, inode 31085" | The managed skill directory `plugins/managed/kimi-webbridge/skills/kimi-webbridge` is inode 31087 (find -printf and stat both). Inode 31085 is the mode-700 plugin root itself. | Change the managed entry-point inode to 31087, and cite 31085 as the plugin root. |
| E23 | 278-280 | "`installed.json:5-6` records exactly one plugin (id, root, installedAt/updatedAt ...)" | Lines 5 and 6 hold `id` and `root`. `installedAt` and `updatedAt` are at lines 9 and 10 of the live file. | Cite `installed.json:5-10`. |
| G3 | 300 | "Under the rule this note quotes above" | The governing rule quote is at candidate lines 417-420. That is after the new section (218-317), not above it. | Say "quoted below", or cite lines 417-420. |

## Full claim table at 1530a75 (73 rows; status OK, or MISMATCH)

| ID | Line | Claim | Live measurement | Status |
|---|---|---|---|---|
| A1 | 218 | Heading names the skills child by full path | Proxy binds it: K=52/52 | OK |
| A2 | 220 | Seventh live child of ~/.kimi-code/skills/ | Census: skills/ children=7 | OK |
| A3 | 220 | Second real directory (after cursor-lane) | stat: cursor-lane d, kimi-webbridge d | OK |
| A4 | 221-222 | Other five members are symlinks (godspeed, reverse-engineer-anything, shokunin, ufo, wwkd) | Listing: all five are l | OK |
| A5 | 222 | cursor-lane is the first real directory | Listing d; cursor-lane dated 2026-10-18, earlier than kimi-webbridge | OK |
| A6 | 223 | Plain directory, not a symlink | Type d, mode 755 | OK |
| A7 | 224 | find -type l gives 0 links | symlinks=0 | OK |
| A8 | 225-226 | stat line: directory 36 755 2026-10-21 23:36:39.510359784 -0300 inode=95866022 | Exact command output identical | OK |
| B1 | 228 | SKILL.md is 193 lines | wc -l = 193 | OK |
| B2 | 228 | SKILL.md is 19437 B | wc -c = 19437 | OK |
| B3 | 228 | SKILL.md mode 600 | 600 | OK |
| B4 | 231 | SKILL.md:2 is name: kimi-webbridge | Line 2 identical | OK |
| B5 | 232 | SKILL.md:3 is the description key with a literal block marker (vertical bar) | Line 3 identical | OK |
| B6 | 232-233 | Managed copy uses the same literal block | Managed SKILL.md:3 has the same block indicator | OK |
| B7 | 234-236 | SKILL.md:4 opens with the stated Chinese and English text | Exact string found on line 4 | OK |
| B8 | 237 | SKILL.md:5 is metadata: | Line 5 identical | OK |
| B9 | 238 | SKILL.md:6 is version "2.0.26" | Line 6 identical | OK |
| B10 | 239-240 | SKILL.md:9 title is "# Kimi Browser Extension (formerly Kimi WebBridge)" | Exact string on line 9 | OK |
| C1 | 242-243 | Name stays kimi-webbridge while title and description say Browser Extension | Lines 2, 4, 9 | OK |
| C2 | 244 | metadata.version is self-declared; only SKILL.md:6 carries a version in the skill tree | Byte count over the 7 skill-tree files: 2.0.26 once (SKILL.md), 1.11.3 zero | OK |
| C3 | 244 | "no file backing it on this host" | Daemon binary holds 2.0.26 three times (see mismatch table) | MISMATCH |
| C4 | 245 | "same shape this note records for the other user skills" | Note records it for one other skill only (lines 391-392) | MISMATCH |
| D1 | 247 | 7 files in the inventory | find -type f = 7 | OK |
| D2 | 251 | SKILL.md: 19437 B, mode 600, digest defba946e6693fd4 | Size, mode, sha256 prefix match | OK |
| D3 | 252 | references/operations.md: 5911 B, 644, 7f60c9811cf2c875 | Match | OK |
| D4 | 253 | cli-creator/companion-skill-template.md: 2511 B, 644, f17d70fc178b5070 | Match | OK |
| D5 | 254 | cli-creator/go-layout.md: 4907 B, 644, 89cbfb5127646ffb | Match | OK |
| D6 | 255 | cli-creator/login-handling.md: 1436 B, 644, fd6aa463dfd25fbb | Match | OK |
| D7 | 256 | cli-creator/site-exploration.md: 4389 B, 644, d7cdeb173add3dd5 | Match | OK |
| D8 | 257 | cli-creator/workflow.md: 3926 B, 644, a5bb3523cd9f5c66 | Match | OK |
| D9 | 259 | Digest column is the first 16 hex of sha256sum | cut -c1-16 agrees for all seven | OK |
| D10 | 259-260 | Full 64-hex values and counting command are in the build report | See mismatch table | MISMATCH |
| D11 | 261 | SKILL.md mode 600 is the private mode the note already records for reverse-engineer-anything | Note lines 30-31 say so; live reverse-engineer-anything SKILL.md is 600 | OK |
| D12 | 262 | Every file under references/ is 644 | Six files, all 644 | OK |
| E1 | 264 | Managed copy is an older, separate install | Managed SKILL.md mtime 2026-10-03 18:06:32; skills copy 2026-10-21 23:36:39; versions 1.11.3 and 2.0.26 | OK |
| E2 | 268 | Skills copy: real dir, mode 755, inode 95866022 | Match | OK |
| E3 | 268 | Managed copy: real dir under a mode-700 plugin root | Plugin root mode 700; skills/kimi-webbridge is a real dir, mode 755 | OK |
| E4 | 268 | Managed copy inode 31085 | Skill directory is 31087; 31085 is the plugin root | MISMATCH |
| E5 | 269 | Skills SKILL.md: 19437 B / mode 600 | Match | OK |
| E6 | 269 | Managed SKILL.md: 11880 B / mode 644 | Match | OK |
| E7 | 270 | Skills SKILL.md digest prefix defba946e6693fd4 | Match | OK |
| E8 | 270 | Managed SKILL.md digest prefix 84a8e69d04c5b810 | Match | OK |
| E9 | 271 | Skills operations.md digest prefix 7f60c9811cf2c875 | Match | OK |
| E10 | 271 | Managed operations.md digest prefix b811d9c23dfdafa0 | Match | OK |
| E11 | 272 | Skills declared version 2.0.26 at SKILL.md:6 | Match | OK |
| E12 | 272 | Managed declared version 1.11.3 at managed SKILL.md:6 | Match | OK |
| E13 | 272 | kimi.plugin.json:4 mirrors 1.11.3 | Line 4: "version": "1.11.3" | OK |
| E14 | 273 | Skills copy has 7 files | find -type f = 7 | OK |
| E15 | 273 | Managed tree has 5 files | find -type f = 5 (03-browser-extension.txt, 04-headroom.txt, kimi.plugin.json, SKILL.md, operations.md) | OK |
| E16 | 273 | Two dated session dumps at the plugin root | Both headed 2026-10-14T17:40:47Z. Content: a chromium process table (03) and a memory, swap and load snapshot (04). "Session" is a loose label. | OK (label noted) |
| E17 | 275-277 | The two trees share no inode | Cross-tree dev:inode duplicates = 0 | OK |
| E18 | 276-277 | No link count above 1 | Link count 1 on all 19 entries | OK |
| E19 | 276-277 | No shared file digest | 12 digests, all distinct | OK |
| E20 | 278 | installed.json:5 is the id line | Line 5: "id": "kimi-webbridge", | OK |
| E21 | 279 | installed.json:6 is the root line | Line 6: the managed root path | OK |
| E22 | 279-280 | installedAt and updatedAt are 2026-10-03T21:06:32.435Z | Lines 9 and 10, same value | OK |
| E23 | 278-280 | Citation 5-6 covers installedAt and updatedAt | Those are at lines 9-10 | MISMATCH |
| E24 | 278-281 | Exactly one plugin record; no record of the skills copy | One record, id kimi-webbridge, no skills entry | OK |
| F1 | 285-286 | Skills copy is byte-identical to the ~/.claude copy | sha256 equal (defba946e6693fd4 and full value) | OK |
| F2 | 286-287 | ~/.codex copy is identical | sha256 equal | OK |
| F3 | 287 | ~/.hermes copy is identical | sha256 equal | OK |
| F4 | 288 | Four separate copies; cross-root dev:inode overlap 0 | Inodes 95866023 (kimi-code), 95866003 (claude), 95866013 (codex), 95866034 (hermes); duplicates 0 | OK |
| F5 | 289-291 | operations.md:29 is the install-skill row with the quoted text | Line 29 matches | OK |
| G1 | 297-299 | Both SKILL.md:2 files declare name kimi-webbridge | Both line 2 | OK |
| G2 | 300 | Rule text "Project overrides User overrides Extra overrides Built-in" | Verbatim at candidate note lines 419-420 | OK |
| G3 | 300 | "the rule this note quotes above" | Rule quote is at 417-420, below the section | MISMATCH |
| G4 | 304-305 | Earlier no-collision statement falsified; round-40 erratum exists | Erratum at lines 551-573; the statement is at base lines 333-335 | OK |
| H1 | 307-308 | K_members moves 51 to 52 | Stanza K_members 51 at f69817e, 52 at 1530a75; census members=52 | OK |
| H2 | 309 | K_sections moves 51 to 52 | Stanza 51 to 52; proxy K=52/52 | OK |
| H3 | 309 | coverage:kimi-layer 9 to 10 | Derived 9 at f69817e (proxy computed=9, declared 10); derived 10 at 1530a75; declared held at 10 | OK |
| H4 | 310-311 | Heading needs the full path; bare basename kimi-webbridge is owned by two members and binds to none | Identities skills/kimi-webbridge and plugins/managed/kimi-webbridge share basename kimi-webbridge (proxy-check.mjs lines 805, 812, 815-818) | OK |
| I1 | 315 | tabi-shokunin/corpus/knowledge/webbridge-plugin-anatomy.md exists | Exists, 16631 B | OK |
| I2 | 316 | K-block boundary clause routes managed-plugin internals to tabi | SCORECARD.md lines 1615-1621 | OK |

Counts: A 8 + B 10 + C 4 + D 12 + E 24 + F 5 + G 4 + H 4 + I 2 = 73. Mismatch rows: C3, C4, D10, E4, E23, G3 = 6.

## Master status (lane master 5ae8ac9, secondary)

Diff used: `git -C <scratch lane> --no-pager diff -U0 1530a75 FETCH_HEAD -- corpus/knowledge/kimi-skills-plugins.md` (10 insertions, 6 deletions in that file).

| Candidate ID | Master state | Note |
|---|---|---|
| C3 | Fixed | Master line 244-246 now states the binary carries the same 2.0.26 string. Verified: 3 ASCII hits. |
| C4 | Fixed | Sentence removed. |
| D10 | Open | Master line 261 unchanged. |
| E4 | Fixed | Master line 269 now says inode 31087 under the mode-700 root (31085). |
| E23 | Fixed | Master line 279 now cites installed.json:5-10. |
| G3 | Open | Master line 301 unchanged; the rule quote is now at master line 423. |

New at master, checked:
- Master line 274 cites tabi-shokunin/SKILL.md:1421-1424 for the two dumps (a chromium process table, and a memory, swap and load snapshot, both at 17:40:47Z). Verified: correct. OK.
- Master line 310 says coverage:kimi-layer was derived 9 at round open and 10 after, declared held at 10. Verified against the base and candidate gate runs. OK.
- Master line 320 (sibling records). Cites tabi webbridge-plugin-anatomy.md:12-14 for the size and digests: correct (1273 B, 11880 B, 2422 B; prefixes e70aff5c40ff, 84a8e69d04c5, b811d9c23dfd). Cites :53-55 for version 1.11.3 and the install record: MISMATCH. Those lines hold the registration path text. The version is at :57-58, and the install record is in section 3 (lines 60-70). Cites kotoba-shokunin/corpus/lessons/round-48.md:107-108 for "byte-identical ~/.claude copy": PARTIAL MISMATCH. Those lines count the ~/.claude copy (dated 2026-10-22T02:36:39Z) but do not say byte-identical.
- Master open mismatch count within the section: 4 (D10, G3, and the two sibling-record citation items).

## Related consistency issue outside the new section (not counted)

- Note lines 30-32 (pre-existing text) say reverse-engineer-anything is "the only member whose files are mode 600 ... the rest are 644". Now kimi-webbridge SKILL.md is mode 600, so "the rest are 644" is false. The sentence is unchanged at 1530a75 and at master.

## Gate runs (scratch clone only; no lane writes)

- Candidate 1530a75, `node scripts/proxy-check.mjs --src /fast/scratch/hyaku/kumitate-pin/src`, exit 0:
  `PROXY: MATCH (A=8 C=15 operability=8; C1=19/19 C2=89/89 coverage=10; S=88/88 coverage:script-layer=10; R=92/92 coverage:runtime-layer=10; K=52/52 coverage:kimi-layer=10; pins=6 match; src-rev=31c465f15669)`
  Two warnings: PIN_UNPINNED for scripts/anchor-truth.mjs and scripts/sources-check.mjs.
- Candidate 1530a75, `node scripts/kimi-census.mjs`, exit 0:
  `KIMI_CENSUS: CLEAN (members=52 checked=52 chain=7 info=4)`; `COUNT skills/ children=7 (counted live, names not gated)`.
- Round-open f69817e (scratch worktree), `node scripts/proxy-check.mjs --src ...`, exit 1:
  `K_MEMBERS_DRIFT declared=51 computed=52`, `COVERAGE_KIMI_DRIFT declared=10 computed=9`, `AXES_DRIFT coverage:kimi-layer ## Axes row=10 derived=9`.
- Round-open f69817e, `node scripts/kimi-census.mjs`, exit 1:
  `UNLISTED skills/ skills has 7 children, 6 declared`; `KIMI_CENSUS: DRIFT (UNLISTED skills/)`.
- Base stanza (f69817e SCORECARD.md lines 298-300): K_members=51, K_sections=51, coverage_kimi=10. Candidate stanza (1530a75 SCORECARD.md lines 298-300): 52, 52, 10.

## Commands and key outputs (live host)

- `stat -c '%F %s %a %y inode=%i' /home/vgpnk/.kimi-code/skills/kimi-webbridge` gives `directory 36 755 2026-10-21 23:36:39.510359784 -0300 inode=95866022`.
- `find /home/vgpnk/.kimi-code/skills/kimi-webbridge -type l | wc -l` gives 0.
- `find ... -type f -exec sha256sum {} + | sort -k2 | cut -c1-16,65-` gives 7 prefixes matching the table (defba946e6693fd4, 7f60c9811cf2c875, f17d70fc178b5070, 89cbfb5127646ffb, fd6aa463dfd25fbb, d7cdeb173add3dd5, a5bb3523cd9f5c66).
- Managed tree, `find ... -printf '%y|%s|%m|%n|%D:%i|%p\n'`: plugin root `d|122|700|1|56:31085`; skills/kimi-webbridge `d|36|755|1|56:31087`; SKILL.md `f|11880|644|1|56:31088`.
- `sha256sum` of the claude, codex and hermes SKILL.md copies: all `defba946e6693fd4c890e8754a56fbeef63dc633e6ea32de504cbbc41bfc34b5`; stat gives 19437 B, mode 600, inodes 95866003, 95866013, 95866034.
- Cross-tree dev:inode duplicates (both trees plus the three sibling copies): 0. Link count over all 19 entries: 1.
- `installed.json` (390 B, mode 644, mtime 2026-10-03 18:06:32): lines 5 and 6 are id and root; lines 9 and 10 are installedAt and updatedAt.
- Daemon binary (byte count in Python): `2.0.26` occurs 3 times (offsets 6575825, 6668394, 9653302); the context at 6668394 and 9653302 is `daemon.Version=v2.0.26`.
- Skill tree (byte count over 7 files): `2.0.26` once (SKILL.md), `1.11.3` zero times.
- Lane master ref: `git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin rev-parse master` gives 5ae8ac9cbb1697e30ec32b717b8c4dafb757315c.

## Tools, secrets and scope

- Tools: none installed or upgraded. Used existing coreutils (find, stat, sha256sum, wc, cut, sort, uniq), git (read-only commands; one fetch from the lane into my scratch clone), node v24.21.0 (gate runs in my clone only), and a Python subprocess for byte counts. No pacman, no uv, no npm installs.
- Secrets: not read. `~/.kimi-webbridge/identity.json` (36 B, mode 600) appeared in a directory listing by name, size and mode only. `~/.kimi-webbridge/logs/` and `~/.kimi-code` credential paths were not opened. The two plugin-root dumps were read only for their first 4 lines (process table and memory snapshot; no credential content).
- Scratch: `/fast/scratch/hyaku/kumitate-r40/seats/ReviewKimiFacts/` holds the candidate clone, a base worktree (f69817e) and a master-view worktree (5ae8ac9). The only lane file I wrote is this report.

## Residual risk and verification gaps

- "No file backing it" (C3) is testable only for the skill tree and the daemon binary. I did not search logs or identity files, which are outside scope and may hold secrets.
- The text search tool skips binary files, so its "no matches" on the daemon binary was not a real negative. The binary was checked with an explicit byte search.
- The INFERENCE lines (installer mechanism, the User-over-Extra precedence) are not measured. No rendered skill listing was captured. They are not counted.
- The "CLI workflow" phrase (lines 313-314) is ambiguous. tabi's note covers the daemon (sections 5-6) and extension presence (U3). The cli-creator workflow lives in the skill copy, not in the plugin tree, and tabi's note does not discuss it. Not counted.
- Cross-lane citations at master were checked only at the cited ranges.
- Selftests and mutant gates were not run; they are outside this item.
- The lane master moved after the candidate. I did not review the docs commit (0004ae3) or the rest of 5ae8ac9.
