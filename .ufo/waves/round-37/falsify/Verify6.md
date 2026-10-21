D6 present=yes honest=no verdict=partial

# Verify6 — round-36 spot-check D6 on the round-37 tree

Scope: D6 = "remove or claim the fleet-root `-.rej` stray (19 hunks of `remaining-scripts-census.md`), and re-run the misroot sweep after every late patch attempt" (`corpus/lessons/round-36-verifier-spotcheck.md:36-38`, `:207-208`). Round 37 claims it done: fleet report `.ufo/reports/round-37/kumitate.md:37-39` (fleet commit `a8a0071`), `.ufo/waves/round-37/repairs.md:12-13`, `corpus/lessons/round-37.md:30-32`, `LOG.md:1722-1723`. Reports live at the fleet root, not the lane: `scripts/shokunin-watchdog.sh:47` sets `UFO="$SHOKUNIN_ROOT/.ufo"`.

Checks run 2026-10-21 03:19–03:30 -03:00. Read-only: git with `--no-optional-locks`, stat, sha256sum, find, a python parse. Installs: none. Writes: this file only. No subagents.

## 1. Fleet-root `-.rej` removed: PRESENT
```
$ stat -c '%n' /home/vgpnk/Projects/shokunin/-.rej
stat: cannot stat '/home/vgpnk/Projects/shokunin/-.rej': No such file or directory
$ find /home/vgpnk/Projects/shokunin -name '*.rej' -not -path '*/.git/*'
(no output, exit 0; ignored paths included)
$ git -C /home/vgpnk/Projects/shokunin log --all --oneline -- '*.rej'
(no output: no fleet commit carries a .rej)
$ glob kumitate-shokunin/**/*.rej  →  No files found   (lane clean too)
```

## 2. Moved copy present, intact, committed: PRESENT
```
$ stat -c '%s B %y' kumitate-shokunin/.ufo/waves/round-36/evidence/remaining-scripts-census.rej.txt
72390 B 2026-10-21 03:19:16.435785953 -0300
$ sha256sum <same>
3f51c7e7c3caf1c5723dd9ee263703af5fa7d407c53f704cc3d97868ac7e36b0
$ git show HEAD:.ufo/waves/round-36/evidence/remaining-scripts-census.rej.txt | sha256sum
3f51c7e7c3caf1c5723dd9ee263703af5fa7d407c53f704cc3d97868ac7e36b0
$ git diff --stat HEAD -- .ufo/waves/round-36/evidence     →  (empty)
$ git show --stat 5ceb8cd -- .ufo/waves/round-36/evidence  →  1 file changed, 249 insertions(+)
```
Python parse of the copy: 249 lines; 19 hunk headers (first at line 3 `@@ -461,7 +461,7 @@`, last at line 231 `@@ -739,15 +738,15 @@`); 0 hunk-count mismatches; the only lines outside hunks are the two file headers `--- / +++ remaining-scripts-census.md`; LF-terminated; no CR, no NUL. Size and hunk count equal the closure's pre-move record (`round-36-verifier-spotcheck.md:36-37`: 72,390 B, 19 hunks).

## 3. "byte-exact (`cmp` equal)": UNVERIFIABLE, not contradicted
The source is deleted, so `cmp` cannot be re-run. No tracked or untracked record keeps a pre-move hash or cmp output. Grep `3f51c7e7|72,?390|\.rej` over `.ufo/reports/round-36`, `.ufo/reports/round-37`, `.ufo/watchdog.log`, `corpus/lessons/round-37.md`, `.ufo/waves/round-37/repairs.md` returns only the prose lines already cited. Four identical copies exist under `/fast/scratch/kumitate-r37/Verify7/`, but they derive from the lane copy and are not independent evidence. Size and hunk count are consistent with byte-exactness; they are not proof of it.

## 4. Misroot re-sweep: substance REPRODUCES; "after the wave" is CONTRADICTED
```
$ git --no-optional-locks -C /home/vgpnk/Projects/shokunin status --porcelain    (03:29:31)
 M .ufo/watchdog.log
?? .ufo/state/{chousa,kagi,kaidoku,kake,kama,kasegi,kengaku,kumitate,mado,mori,souji,tabi,tameshi,tsukuroi}.report-baseline
```
15 entries. Untracked: 14, all `.ufo/state/<lane>.report-baseline`, which only `record_report_baseline` writes (`scripts/shokunin-watchdog.sh:120-133`). Kumitate's file holds `37 e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`, the SHA-256 of empty input, which the script returns for a missing report (`:113`). That is a pre-launch baseline, not a seat file. Kumitate seat residue: 0. The other 13 lanes' files were not touched. This matches the record's "only driver files".

Timing, from the tree:
- `falsify/swarm-registry.json` `createdAt 2026-10-21T06:20:41.892Z` (= 03:20:41 -0300), `updatedAt` 03:21:01.
- The commit carrying the sweep, fleet `a8a0071`, has author = committer 03:21:51. The sweep ran no later than 03:21:51, at most about 70 s after the wave was registered. Either way it predates the wave's completion.
- The same report's D5 (lines 32-36): the 68 seats were "dispatched as one task call before this report; its reports land under `.ufo/waves/round-37/falsify/` as late evidence".
- Lane transcript `history://KumitateR36`, entry 1420 (written with the report): "**Slot not released yet** (seats still returning; release due after they settle)".
- `falsify/` at 03:30:05: 17 reports plus the registry, against 68 declared (`falsify-spec.json` `.items|length` = 68). One report predates the commit (Verify2 03:21:42). Sixteen postdate it: Pair1 03:22:38 … Verify3 03:23:04 … Verify8 03:27:21, Rep3 03:28:01, AuditSighting4 03:28:59, Verify4 03:29:41, AuditSighting2 and Verify7 03:29:44, AuditNativeTrial8 03:30:05.
- Lane commits after the sweep: `a5d627b` 03:23:30 and `5031720` 03:27:34 (HEAD at 03:29). The 03:29:31 sweep above postdates both and is clean.

So no post-wave sweep exists in the tree, and the wave was still landing seats at 03:30. "After the wave" is false as written. Operability: the control itself works (one command, clean now), but the record keeps no raw sweep output and no timestamp, so the claim cannot be re-checked from the record.

## 5. Verdict
- present=yes: the fleet copy is gone, the lane copy is committed and intact, and the sweep substance reproduces.
- honest=no: the record dates the sweep "after the wave" when it predates the wave's completion; "cmp equal" has no retained output.
- verdict=partial: the failing condition is met for one qualifier ("after the wave"), not for the disposition's action. The physical disposition holds; the record's timing and verification wording does not.

## 6. Smallest correction (main agent; not applied here)
1. When the falsify wave settles, re-run `git -C /home/vgpnk/Projects/shokunin status --porcelain`, paste the raw output and timestamp into the D6 line of the report, and replace "after the wave" with the actual time of each sweep.
2. Record `sha256sum` of the lane copy (`3f51c7e7…`). Drop "cmp equal" unless the closure's cmp output is attached.
3. Make the same wording change in `corpus/lessons/round-37.md:30-32` and `.ufo/waves/round-37/repairs.md:12-13`.

Not checked: the remaining seats' contents (their own items); the closure's original cmp run (no record of it survives).
