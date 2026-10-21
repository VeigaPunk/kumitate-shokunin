SEC4 hits=4 leaks=0 verdict=refuted

# Sec4: fleet-root sweep and -.rej move, misroot residue (round-37 falsify)

Axis: operability. Lane: /home/vgpnk/Projects/shokunin/kumitate-shokunin (HEAD a5d627b = origin/master).
Read-only: `git --no-optional-locks`, `find`, `stat`, `grep -c`, `sha256sum`. Writes: this report and scratch /fast/scratch/kumitate-r37/Sec4/. No lane, fleet or sibling file changed. Installs: none.

## Counters
- hits = fleet-root misroot-class entries from my own enumeration: 3 open (H1-H3) + 1 closed (H4, moved in round 37). `local/` is not counted: kaika-w2j/fleet-root.md:9 says the assignment expects it.
- leaks = secret, credential or host-path material in moved or residue content: 0.

| id | item | entries | in mandated sweep | recorded where |
|---|---|---|---|---|
| H1 | `bash: ` tree (shell-error text used as a path): 1 file 10,139 B + 7 dirs | 9 | no | souji `census/operator-sweep-20261019/stray-bash-tree-file.preserved.json`; kaika-w1/elegance.md:73,163,179. Not in kumitate round-36/37 records or `.ufo/waves/hyaku/misroots/` |
| H2 | `tameshi-shokukin/` typo dir: 9 empty dirs; newest `tameshi-shokunin/.ufo/waves/round-19/w1` 2026-10-21 02:50 | 10 | no | kengaku ConnTameshi.md:36; kaidoku ConnSiblingWasm.md:42; souji ConnRevPinSiblings.md:26. Not in kumitate or the register |
| H3 | `reports/`: empty root dir (fleet reports live under `.ufo/reports/`) | 1 | no | kaika-w1/elegance.md:75; tameshi round-16 MisrootSweep.md:126. Not in kumitate or the register |
| H4 | kumitate `-.rej`: 72,390 B, 19 hunks | 1 | visible before move | LOG.md:1721-1723; lessons/round-37.md:30-32; repairs.md:12-13; report:37-39,53 |

Mandated sweep now: `git status --porcelain` = 15 lines (14 `?? .ufo/state/*.report-baseline`, 1 ` M .ufo/watchdog.log`). Residue lines: 0 of 20 entries.

## Verdict basis
Failing condition "unrecorded misroot" is met. H1-H3 are residue the mandated sweep cannot see, and the round-37 record says the post-wave re-sweep found "only driver files" (report:39). That is true of `git status` and false of the fleet root. The -.rej move holds on leak and hostile-input tests. Its byte-exact claim is unevidenced, and the misroot is not recorded under `## Mistakes`.

## E1. Why the sweep is blind (root cause)
```
$ git check-ignore -v -- 'bash: /home/vgpnk/Projects/shokunin/souji-shokunin/tests/tools/souji-verify.sh: No such file or directory'
.gitignore:1:*-shokunin/	bash: /home/vgpnk/Projects/shokunin/souji-shokunin/tests/tools/souji-verify.sh: No such file or directory
$ git check-ignore -v -- 'tameshi-shokukin/tameshi-shokunin/.ufo/waves/round-19/w1/'
.gitignore:1:*-shokunin/	tameshi-shokukin/tameshi-shokunin/.ufo/waves/round-19/w1/
```
Fleet `.gitignore` line 1 is `*-shokunin/` with no leading slash, so it matches a directory component at any depth. H1 is hidden because its path contains `souji-shokunin/`. kaika-w1/elegance.md:179 calls this cause "unexplained"; this rule is the answer. Git never lists empty directories: `tameshi-shokukin` (9 dirs, 0 files), `reports` (0/0) and `local/fleet-analysis` (0/0).

## E2. Sandbox reproduction (copy of the fleet .gitignore, /fast/scratch/kumitate-r37/Sec4/sandbox)
```
$ git status --porcelain
?? .gitignore            (sandbox artefact)
?? stray-kumitate.rej    P1 plain file: visible
?? tameshi-shokukin/     P4 non-lane nested file: visible
$ git status --porcelain --ignored
!! "bash: /"             P2 lane-named nested path: visible only with --ignored
$ git ls-files --others --exclude-standard
stray-kumitate.rej
tameshi-shokukin/.ufo/waves/x/n.md
```
P3 (empty tree under a lane-named component) and P5 (`reports/`, `local/fleet-analysis/`) appear in no form. Fleet, same command: `git status --porcelain | grep -E '^\?\? (bash: |tameshi-shokukin|local/|reports/)' | wc -l` gives `0`.
`mori-misroot-sweep.py --fleet-root /home/vgpnk/Projects/shokunin --lane Kumitate --round 37` and `--round 36`: `"candidate_count": 0`, `"finding": "MORI_MISROOT_CLEAN"`. Its own limits say git-ignored files never reach `git status`.
Lane-named dirs below fleet top level: 11. Residue: 2 (`bash: .../souji-shokunin`, `tameshi-shokukin/tameshi-shokunin`). The other 9 are fixtures, `.tower` probes and one lane-internal nest (`kotodama-shokunin/kotodama-shokunin`).

## E3. The -.rej move (lane path `.ufo/waves/round-36/evidence/remaining-scripts-census.rej.txt`)
```
$ stat -c '%s' <path>                       -> 72390
$ grep -c '^@@' <path>                      -> 19        header: --- remaining-scripts-census.md
$ sha256sum <path>                          -> 3f51c7e7c3caf1c5723dd9ee263703af5fa7d407c53f704cc3d97868ac7e36b0
$ git show --stat 5ceb8cd -- <path>        -> 1 file changed, 249 insertions(+)
$ git merge-base --is-ancestor 5ceb8cd origin/master -> yes; path status clean
$ ls -A /home/vgpnk/Projects/shokunin | grep -ci rej -> 0   (fleet copy gone)
$ fleet git status: tracked deletions (D) -> 0
```
- Byte-exact ("cmp equal"): UNEVIDENCED. The source is deleted and no sha or cmp output was recorded before deletion. `grep -rl 3f51c7e7 kumitate-shokunin .ufo/reports .ufo/waves/round-37` returns nothing. The 72,390 B and 19-hunk match to the closure census (round-36-verifier-spotcheck.md:36) corroborates identity, not byte equality. Six scratch clones carry the same sha; they copy the lane file, not the original.
- Attribution: the header names only `remaining-scripts-census.md`, so the prompt test "content names your lane/round" (kumitate-round-37.md:312-317) is not met by the file. The content test passes: 38/38 sampled `-` lines occur in kumitate's 0614092 note (60-char prefix). That filename is tracked only in kumitate.
- Mechanism: not recorded. `grep -rn -E 'git apply|patch -|--reject|\.rej' .ufo/waves/round-36/build` returns only verification lines (`git apply --check`, `patch -p1` on a blob).
- Path: the prompt requires "the same relative path under the lane". The repair used `.ufo/waves/round-36/evidence/...rej.txt`. The deviation is not stated as one.

## E4. Leak and hostile-input tests
```
secret families (PRIVATE KEY, AKIA..., sk-..., ghp_..., Bearer ..., api_key|secret|token|password): 0 in moved file; 0 in H1 file
origin: https://github.com/VeigaPunk/kumitate-shokunin.git (no userinfo); credential-in-URL: lane 0, fleet .git/config 0
/home/vgpnk in moved file: 0; relative ../: 2 (../charter-ufo-fsd)
127.0.0.1:34113 in moved file: 2 lines; same literal already committed in 0614092 (4 files) -> no new disclosure
curl|wget|sudo|eval|$(...)|pipe-to-shell|base64|chmod|rm -rf: 0 each
assistant|disregard|you are|instruction: 0 each; ignore 2, override 4, verdict 2 -> gate prose, not agent-directed
```
Leaks: 0. Hostile input accepted into evidence: 0. The `.gitignore` rule does silently accept nested lane-named trees (E1), so the sweep accepts H1 and H2 as clean; they are counted under H1-H2.

## E5. Record checks
- D6 (LOG.md:1721-1723, lessons/round-37.md:30-32, repairs.md:12-13, report:37-39,53): consistent with the tree for the moved file.
- `## Mistakes`: the prompt (kumitate-round-37.md:316) requires the misroot to be recorded there. Round-37 table (lesson lines 9-16) has 3 rows (anchors, pairing, ratchet). Round-36 table (lines 12-22) has 7 rows, none on misroots. Not met.
- report:39 "misroot re-sweep after the wave: only driver files": true of `git status`, false of the fleet root (H1-H3). The limit is not stated.
- SimplSurface.md:121 says no `*.rej` in the lane. True by name only: the file is `*.rej.txt`. Disclosed in D6, so not a leak.

## Failing-condition check
- leak: none (E4).
- accepted hostile input: none into evidence (E4). The sweep accepts H1-H2 as clean through the `*-shokunin/` rule (E1-E2).
- unrecorded misroot: MET for H1-H3 in this control's record (report:39) and in the fleet register `.ufo/waves/hyaku/misroots/` (MoriR16.Lesson, SoujiR15, TameshiR15 only). Sibling lanes do record them (table above), so the gap is in this control's record, not in fleet knowledge.

## Smallest remediation (not applied; Sec4 has no remediation scope)
1. Fleet owner: anchor `.gitignore` line 1 as `/*-shokunin/`. H1 and H2 become visible; lane repos stay ignored.
2. Sweep: add `git status --porcelain --ignored=matching` and `find . -mindepth 1 -maxdepth 1 -type d -empty -not -path './.git'`, or diff `ls -A` against `git ls-files` plus an allowlist.
3. Owner lanes (souji for H1, tameshi for H2, H3 owner unknown) record or clear their own residue. Kumitate must not move it (never touch other lanes' files).
4. Kumitate, next round, lane-owned append: add a `-.rej` row under `## Mistakes`; state the path deviation; name the git-blind limit in the sweep line.
5. Before any future move: record sha256 and `cmp` output before deleting the source.

## Limits
cmp cannot be rerun (source deleted). The -.rej mechanism is unknown. `local/` is treated as expected only per kaika's assignment text. The mori detector is blind to ignored files by its own stated limit.

## Scope
Scratch: /fast/scratch/kumitate-r37/Sec4/ (sandbox, ctx.txt, minus.txt). I created /fast/scratch/ctx-sample.txt outside my scratch dir during the run and removed it. No REA. No spawns. No tools installed.
