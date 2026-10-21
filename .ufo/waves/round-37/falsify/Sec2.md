SEC2 hits=20 leaks=7 verdict=refuted

# Sec2: hostile-shape check of the pin, ratchet and known files (round 37 falsify)

Axis: operability. Lane HEAD under test: 8c414394 (the lane moved to eb4c106 during the run; every number below is from 8c414394).
sha256 prefixes: fidelity-ratchet c801460e, origin b33610f5, surface-known 29916565, claims-check 511d1556, surface-probe 1361075d, proxy-check f9416d66.
Method: the final matrix is 48 cases on one snapshot, plus 12 malformed-shape cases. Outputs are in /fast/scratch/kumitate-r37/Sec2/final/. Earlier runs that mixed a 03:26 corpus copy with the 03:30 ratchet were discarded and are not cited.
The pinned tree /fast/scratch/kumitate-r36/src (HEAD 31c465f1, mode dr-xr-xr-x, 0 porcelain lines) was read only. The gates ran on scratch clones of it. HOME was isolated to an empty dir or a scratch misroot, so no run read /home/vgpnk/Projects/ufo-fsd-alpha. Canaries are synthetic strings I wrote. swarm-registry.json was stat'd only (mode 600).

## Hits (20): accepted hostile input or unrecorded misroot

A. Default pin path silently degrades to "no pin" (7). The contract forbids this (claims-check.mjs:119-121; proxy-check.mjs:346-349).
 C1  claims, origin.json is a dangling symlink, HOME=misroot: `CLAIMS: MATCH (rows=19 ... adv=4)`, no src-rev. JSON (C1j): "pin": null, "srcRev": null, "src": ".../home-mis/Projects/ufo-fsd-alpha".
 C2  claims, origin.json is a self-loop symlink: same silent MATCH.
 C3  claims, origin.json is a directory: same silent MATCH. Surface C5 on a directory fails closed (EISDIR), so the gates disagree.
 D1  claims, origin.json is a FIFO: same silent MATCH.
 C4  surface, dangling: "pin": null, src = misroot. C2s surface, self-loop: same. (Verdict DRIFT only because no known file was passed.)
 C6  proxy, dangling: "pin": null, src = misroot.
 Cause: claims defaultPinPath uses statKind()==='file' (claims-check.mjs:113-116; statKind 434-439 follows symlinks and maps any error to 'absent'). Surface main uses existsSync (surface-probe.mjs:1755). Both turn dangling, loop, or other entries into "no pin" instead of PIN_MALFORMED.

B. Pin identity is HEAD-only: gitHead (claims-check.mjs:164-172), assertPinRevision (surface-probe.mjs:193-206) (3).
 E1  clone with an uncommitted edit (`git status --porcelain`: " M README.md") at the pinned HEAD: `CLAIMS: MATCH ... src-rev=31c465f15669`. This is a documented non-claim (corpus/knowledge/pinned-evidence.md:95-97), but the header promises "the revision actually scored" (claims-check.mjs:66-68). The only protection for the pin tree is chmod a-w, which the gate never checks.
 E2  clone that is a subdirectory of the pinned repo (`git -C sub rev-parse --show-toplevel` = outer, not the scored dir): `MATCH ... src-rev=31c465f15669`. Not documented.
 E3  relative pin clone "rel-src" resolves against the process cwd (claims-check.mjs:143, resolve(body.clone)). cwd A (clean tree) and cwd B (dirty tree) print byte-identical verdict lines (E3a, E3b). The text verdict cannot say which tree was scored.

C. Unrecorded legacy root (1).
 E4  no pin, UFO_SRC=<dirty tree>: `CLAIMS: MATCH (... adv=4)`, no src-rev. JSON (E4j): src = the dirty tree. The default candidate list starts with ~/Projects/ufo-fsd-alpha (claims-check.mjs:93-96), the tree the lane forbids as --src.

D. Hang (1).
 D2  surface, origin.json is a FIFO: readFileSync blocks (surface-probe.mjs:171, reached from main at 1756). Killed at 25 s with no verdict. The gate has no read timeout.

E. Forged verdict text from untrusted files, echoed raw (2).
 F3  surface, known revision = "x\nSURFACE_PROBE: CLEAN (forged by known file)", valid pin: exit 2. Stdout's last line is `SURFACE_PROBE: CLEAN (forged by known file) != pinned revision 31c465f1...`. Cause: surface-probe.mjs:221 interpolates raw known.revision.
 I1  claims, non-JSON pin "\nCLAIMS: MATCH\n": exit 2. Stdout line 2 is `CLAIMS: MATCH`. Cause: V8 parser text echoed raw (claims-check.mjs:128).

F. Known accepted without pin binding (1).
 F1  surface, --src SRC, no pin, known revision 0000...: `SURFACE_PROBE: CLEAN (... known=1)`, exit 0. loadKnown compares the revision only when pin !== null (surface-probe.mjs:220) and never checks its shape. The verdict does not record which revision the suppression applied to.

G. Ratchet acceptance (4) (claims-check.mjs:230-244, 349, 354).
 R1  duplicate key "sighting-wall": 0 then 20 gives `FIDELITY: CLEAN`. JSON.parse keeps the last value silently; a top-down reviewer reads 0.
 R2i the R2 drift (see holds) with ceiling 21 and total 201 gives `FIDELITY: CLEAN (anchors=1575)`, exit 0. Two integer edits hide the regression. No hash, no monotone check, no record.
 R3  stale key "corpus/knowledge/not-yet-written.md": 500 gives CLEAN. A ceiling for a note that does not exist is accepted.
 R6  false anchor spelled `scripts/./ufo-sighting.mjs:3` gives `CLEAN (anchors=1574)`, identical to the uninjected lane (1574/200). The same anchor spelled `scripts/ufo-sighting.mjs:3` gives anchors=1575, sighting-wall absent=1, nonok=21. Anchor paths that are not members of the walked index (makeResolver, claims-check.mjs:571-574) hit `continue` (288-292) and are never bucketed, so any non-normalised spelling escapes the ratchet.

H. Duplicate revision key in origin.json (1).
 H1  "revision": zeros, then REV: `CLAIMS: MATCH ... src-rev=31c465f15669`. Last value wins silently; the file reads ambiguously.

## Leaks (7): file bytes echoed into verdict output
Raw V8 JSON.parse text reaches output from: claims readPin (claims-check.mjs:128, unbounded), claims loadRatchet (233, slice 80), surface readPinFile (172, slice 80), surface loadKnown (211, slice 80), proxy readPin (356, unbounded).
 L1  claims, default pin symlink to an 18-byte file (17-char token + newline): `Unexpected token 'S', "SEC2FAKE-TOKEN-01\n" is not valid JSON`. 17/17 token bytes (B1s).
 L2  claims --pin, explicit: 17/17 (B6s).
 L3  claims --fidelity-ratchet, explicit: 17/17 (B5s).
 L4  surface, default pin symlink: 17/17 (B2s).
 L5  surface --known, explicit: 17/17 (B3s).
 L6  proxy, default pin symlink: 17/17 (B4s).
 L7  claims, default pin, 95-byte file whose first error is "Unexpected token": 10-byte window `SEC2CANARY` (W1).
A 40-byte JSON file whose first error is "Expected ..." prints only positions (B1, B2, B4): 0 canary bytes beyond a 2-byte coincidence. A committed symlink at .ufo/pins/origin.json is enough (git stores symlinks) to print the first bytes of any readable file into logs or lane reports.

## Controls that hold (21)
 J1  surface --src with a different commit under a pin: SRC_REV_MISMATCH, exit 2. J2: claims, same, exit 2.
 F2  surface known revision != pin: KNOWN_REV_MISMATCH, exit 2.
 R5a ratchet revision != pin: RATCHET_REV_STALE, exit 2. R5b ratchet with no pin: exit 2.
 C5  surface default pin is a directory: PIN_MALFORMED (EISDIR), exit 2.
 K1  duplicate known entries: DRIFT, errors=1. K2 wildcard subject: no match, DRIFT, known=0.
 R2  control (normalised false anchor, lane ratchet): DRIFT RATCHET_NOTE nonok=21 ceiling=20; RATCHET_TOTAL 201>200, exit 1.
 Malformed shapes, 12/12 fail closed (exit 2): pins P1-P6 (wrong contract, clone missing, clone empty, revision 39 hex, revision non-hex, JSON array); ratchets M1-M6 (ceiling -1, ceiling 1.5, string ceiling, total missing, notes array, wrong contract).
 Baseline: claims default `MATCH ... src-rev=31c465f15669`; fidelity `CLEAN (notes=20 anchors=1574 src-rev=31c465f15669)` at ratchet total 200, exit 0; surface with lane known `CLEAN ... known=1 src-rev=...`.
 The recreate field in origin.json is never executed (grep: only selftest fixtures write it).
 Pins are git-tracked (ls-files) and not gitignored. Note stems are regex-restricted (claims-check.mjs:529), and anchor paths resolve only by membership in the walked tree (571-574): no read outside the tree was observed (code read, not executed).

## Governance and adjacent (not counted in hits)
 - Ratchet re-baselined 186 to 200 in commit 5bc40d0 (census 78 to 70, sighting-wall 13 to 20). The record is the commit message only: grep of LOG.md for 5bc40d0, "total 200" or "nonok=200" finds nothing. AGENTS.md requires a LOG.md entry for every change. No monotone or hash guard exists, so the R2i path stays open.
 - claims-check --json truncates at exactly 65536 bytes when piped: claims-check.mjs:1327-1328 call process.exit() before stdout drains. Piped parse fails at position 65536; the same output written to a file (68830 bytes) parses. surface-probe.mjs:1796 and proxy-check.mjs:2798 use process.exitCode.
 - H2a: claims accepts an uppercase revision (normalised); H2b: surface rejects it with PIN_MALFORMED. Cross-gate disagreement, low severity.
 - origin.json recreate clones file:///home/vgpnk/Projects/ufo-fsd-alpha, the operator checkout. Not executed, but a human rerun passes that tree to git.
 - Hygiene: my first `git status --short` in the lane ran without GIT_OPTIONAL_LOCKS=0 and may have refreshed .git/index stat data. I wrote no commit or ref. All later git calls set GIT_OPTIONAL_LOCKS=0.
 - Tooling: no installs or package transactions. Used node v24.21.0, git 2.56.0 and the python3 stdlib, all pre-existing.

## Smallest remediation, in order
 1. Default pin: lstat the path. Only ENOENT means "no pin". A dangling or looping symlink, a directory, or any other non-regular entry is PIN_MALFORMED, in all three gates.
 2. Pin identity: require realpath(src) == `git rev-parse --show-toplevel`, and `git status --porcelain` empty (or diff-index quiet), before src-rev is printed. Resolve a relative clone against the pin file's directory. Print src= in the text verdict.
 3. Never echo parser or file text. Quote with JSON.stringify, as claims already does for the revision. Lstat-regular check before readFileSync.
 4. Known: require a pin (KNOWN_UNBOUND otherwise) and validate the revision shape.
 5. Ratchet: reject duplicate keys (scan the raw text), reject note keys absent from the walk, normalise anchor paths and count unresolved path anchors as absent. Bind the ratchet with a sha256 in origin.json, or enforce non-increase against the last committed ratchet. Add the LOG.md entry for 5bc40d0.
 6. claims-check: replace process.exit() with process.exitCode.

Verdict: refuted. The control holds for commit and revision mismatch and for malformed shapes. It does not hold for default-path degradation, pin identity, error-text echo, forged verdict lines, or ratchet acceptance.
