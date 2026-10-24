# Round 52 write-scope audit — SentScope

Axes: wave-path conformance; lane tracked-tree integrity; fleet-boundary attribution.

## Findings

### Low — files present outside the explicit round-52 path allowlist

**Exploit path:** a writer places artifacts directly under `round-52/` rather than under `probe/`, `base/`, `w1/<SeatName>.md`, or `build/<SeatName>/`; those files evade the stated path boundary.

**Evidence:** late `find .../round-52 -type f` listed these paths, none of which is covered by the stated allowlist:
- `.ufo/waves/round-52/w1-assignments.json`
- `.ufo/waves/round-52/w1-registry.json`
- `.ufo/waves/round-52/w1-spec.json`
- `.ufo/waves/round-52/w1-taskcall.json`
- `.ufo/waves/round-52/w1-validate.json`

All other listed files were within `plan.md`, `probe/`, `base/`, `build/<SeatName>/`, or `w1/<SeatName>.md`. `git -C <lane> status --porcelain` showed no modified tracked lane files; its visible untracked entries were confined to `.ufo/waves/round-52/` (`build/`, `w1/`, `w1-assignments.json`, `w1-registry.json`). The porcelain output does not establish tracking/ignore status for the other three `w1-*.json` files. Artifact ownership is not established by this evidence; do not attribute them to a seat without provenance.

**Impact:** strict path-scope conformance fails for the five metadata paths, although no tracked lane source changes were observed.

**Smallest remediation:** have the round owner explicitly authorize these exact coordinator metadata paths in the allowlist (if expected); otherwise relocate them to an authorized directory. Preserve provenance before cleanup.

### Medium — fleet-repository cleanliness / no-seat-write claim is inconclusive

**Exploit path:** an agent or process with fleet-root write access can alter shared files despite the lane read-only boundary.

**Evidence:** `git -C /home/vgpnk/Projects/shokunin status --porcelain` was not clean. It showed modified `.ufo/state/{chousa,kagi,kaidoku,kake,kama,kengaku,kumitate,mado,mori,souji,tameshi,tsukuroi}.report-baseline`, `.ufo/watchdog.log`, and `SCORECARD.md`; untracked `.omp/mcp.json`, `.ufo/state/{kotoba,kotodama,revenger}.report-baseline`, `.ufo/waves/hyaku/inline-run-20261023.md`, `AGENTS.md`, `bm.json`, `live.html`, `live_s228.html`, `nama.html`, `s395.txt`, `scripts/hyaku/append-closure.py.bak-20261023T040735Z`, `scripts/hyaku/fleet-commit.sh.bak-20261023T040735Z`, `tf_bavelas.html`, `unblob.log`, `wb2.html`, `write`, and `xc.xml`.

`git status` establishes these paths are present as local changes, not who wrote them or when. Thus I cannot verify that no seat wrote in the fleet repo; in particular `SCORECARD.md` is modified, and untracked files are present under `scripts/`. No fleet file contents or provenance were inspected.

**Impact:** shared-tree integrity and attribution remain unverified; a seat-caused change could not be distinguished from pre-existing/operator activity from this evidence alone.

**Smallest remediation:** fleet owner should reconcile these paths against the pre-wave baseline and writer provenance; do not treat this status snapshot as evidence of seat attribution.

## Scope conclusion

The lane porcelain check passes the requested tracked-file condition (no modified tracked lane files; reported untracked entries are within the round-52 subtree). The strict allowlist check does not pass because of the five `w1-*.json` paths above. No seat write into lane `corpus/`, `scripts/`, `SCORECARD.md`, or `SKILL.md` is indicated by the lane status output, but the dirty fleet status prevents a verified fleet no-write conclusion. No files were changed by this audit except this authorized report.
