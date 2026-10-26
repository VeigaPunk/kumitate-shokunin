VERDICT: An independent six-arm checker (S1–S6, `git archive` bytes only) PASSes the integrated tree 6/6 at 2ed8a5f8 and FAILs all six wave-1/wave-2 C2 forgeries it was run on (F1, A, D, F5, F3b, F3c) that the frozen counter scores `JJ64_HELD held=8/8`, closing the demo-byte, demo-execution, prose↔demo, archive-symlink and registry-binding holes the counter leaves open.

## Evidence

Checker: `.ufo/waves/round-64/build/K64R2ExecSupplementaryC2/supplementary-c2.mjs` (sha256 `44b4da258f98f4978e09d76f79ee8402e006929f5a1a50634553f2d202a24085`), stdlib only, one `git archive <rev>` stream read via `tar -xOf` (no working-tree read), nothing in the lane written. Pin proposal: `proposed-pin.jj-seat-demo.json` + `pin.patch` (not applied).

```
$ node .ufo/waves/round-64/build/K64R2ExecSupplementaryC2/supplementary-c2.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin 2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8
S1 PASS read-set=36 pins=32 symlinks-in-archive=16 (none in claim ground)
S2 PASS prose-tokens=32 distinct=19 stated=21
S3 PASS bullets=13 rows=3 counts=S198=1,S198=1,S198=1,S198=1,S199=1,S199=1,S199=1,S200=1,S200=1,S200=1,S200=1,S200=1,S200=1
S4 PASS blob=2d2edd43559c52912e674d89cf5d05c3988cbd1618bb98b82561691ca53182c3 bytes=11426 pin=proposed:…/proposed-pin.jj-seat-demo.json runs=2 keys=21 cwd-clean=true jj-calls=57 subcommands=13
S5 PASS S198:identical S199:identical S200:identical
S6 PASS rows=139 cells=11/11 cited=S198,S199,S200 citing-entry=S198,S199,S200
OBS prose-drift corpus/lessons/round-64.md:seat_snapshot_in_shared_op_log=2 (entry/demo=1)
SUPP_C2: PASS arms=6/6 rev=2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8 entry=corpus/knowledge/jj-workspace-seat-containment.md rule=SUPP-C2
exit=0
```
(S4's full line, incl. the 21-key list, is `out-honest.txt`; S5's `identical` means live bytes == pinned bytes for all three rows, stronger than the arm requires.)

Four forgeries rebuilt from the wave-1 critic's own preserved generator and patches (`reproduce-forgeries.sh`, one command, end-to-end re-run today):

```
=== F1 3697a65a8ecab65b2bd7e77bc79f5e3490005202   frozen: JJ64_HELD held=8/8 checks=8 … exit=0
                                                    supp:    SUPP_C2: FAIL arms=4/6 … exit=1
=== A  8737809c0aa3f6f0b889ca4d617fabbaae68f812   frozen: JJ64_HELD held=8/8 checks=8 … exit=0
                                                    supp:    SUPP_C2: FAIL arms=4/6 … exit=1
=== D  662863a67a96603c03743fb495d4e92f4e351376   frozen: JJ64_HELD held=8/8 checks=8 … exit=0
                                                    supp:    SUPP_C2: FAIL arms=3/6 … exit=1
=== F5 be5bd7229cf4f18c290858fce5459552a032f8c0   frozen: JJ64_HELD held=8/8 checks=8 … exit=0
                                                    supp:    SUPP_C2: FAIL arms=4/6 … exit=1
```
Arm-level reasons (verbatim, from `out-forgeries-checker.txt`; revs of my first build: F1 40d1877f, A 36f22f55, D 3809b0a6, F5 2630609b):
```
F1 S2 FAIL … | no-prose-tokens
F1 S4 FAIL … | pin-mismatch:…:pin=2d2edd43559c5291:blob=5d73d52443e3e85b; demo-keys=12; no-done-line; jj-calls=0;
   jj-subcommands-missing=workspace add/workspace list/workspace forget/workspace update-stale/op log/abandon/squash/describe/git init
A  S4 FAIL … | pin-mismatch…; demo-keys=12; no-done-line; jj-calls=0; jj-subcommands-missing=…
D  S5 FAIL S195:differ-outside-quotes(diff-sentences=107,inside=2) S196:identical (identity by byte-equality)
   | S195:capture-not-bound-to-url(no-marker-for:visibility); S195:diff-inside-quotes=2
F5 S4 FAIL … | run0-cwd-writes=demo-cwd.txt; run1-cwd-writes=demo-cwd.txt; pin-mismatch…; demo-keys=12; jj-calls=0
```
Positive calibration controls (each mutates only the honest tree, so an arm that did not bite would leave SUPP_C2 PASS):
```
MPROSE  (prose `seat_file_in_default_tree=yes`, demo prints no): frozen JJ64_HELD held=8/8 exit=0;
        supp S2 FAIL | seat_file_in_default_tree:prose=yes:demo=no ; SUPP_C2: FAIL arms=5/6 exit=1
MSYMLINK (capture pin path replaced by a symlink to /etc/hostname): frozen JJ64_UNMET held=6/8 (J3,J4);
        supp S1 FAIL | symlink:.ufo/waves/round-64/build/Capture/jj-v0.46.0-working-copy.html ; arms=3/6
MORPHAN  (row S201 names the entry in used-by, entry does not cite it): frozen JJ64_UNMET held=7/8 (J7 census);
        supp S6 FAIL | S201:cites-entry-but-entry-omits-it ; arms=5/6
```
Two more forgeries of the same class, rebuilt from the peer seat's own generator (`K64R2CriticJjForge/forge-c2.mjs`, OUT repointed into my scratch):
F3b d9818a5be2c9bb1bdd3cc7ac146b030fe233d4db  frozen JJ64_HELD held=8/8 exit=0 -> supp SUPP_C2: FAIL arms=4/6 exit=1
    S2 FAIL prose-tokens=32 stated=12 | prose-key-not-in-demo:rewrite_seat_head_seat_state; …abandon_seat_head_files_on_disk (8 named)
    S4 FAIL … | pin-mismatch:…:pin=2d2edd43559c5291:blob=349ebcb53ed813ed; demo-keys=12; jj-calls=0
F3c 2ac6be84e87ccecb7df70ed0c92e73ddf1e8cb78  frozen JJ64_HELD held=8/8 exit=0 -> supp SUPP_C2: FAIL arms=4/6 exit=1
    same two arms (S2 names the same 8 prose keys; S4 pin-mismatch + demo-keys=12 + jj-calls=0)

Pin absence at the measured rev, and the critic's unpreserved commits:```
$ git show 2ed8a5f8:.ufo/pins/counter-pins.json | grep -c 'jj-seat-demo'      -> 0
$ git show 2ed8a5f8:.ufo/pins/source-captures.json | grep -c 'jj-seat-demo'   -> 0
$ for r in 0c698f48 81cb6397 ec462374 2ad1bcb1 930c0fce 5dffdb1a 2c753ba5; do git cat-file -e "$r^{commit}" …; done
  -> absent (7/7); evidence/f1-diff.patch is 52 lines: the entry and demo hunks are missing.
```

## Findings

**K64R2ExecSupplementaryC2-1 — HIGH — the demo's bytes are unbound, so a replaced demo reads 8/8.**
Attacks: J6 of the frozen counter (it runs whatever `scripts/jj-seat-demo.sh` the archive holds and compares only its output with the entry's own text). F1/A/F5 replace the demo with a `cat`/`awk` echo, F3b/F3c with a 12-key heredoc, and all six still read `JJ64_HELD held=8/8`. Closure: S4 requires sha256(demo blob) == pin and, independently of any pin, runs the demo twice under a PATH shim that logs `jj` argv (>= 20 calls, 9 named subcommands), with fresh TMPDIR and an empty cwd that must stay empty; S2 additionally fails F3b/F3c because their stated keys are not the keys the prose asserts.
Repro: `bash .ufo/waves/round-64/build/K64R2ExecSupplementaryC2/reproduce-forgeries.sh <lane> <jj64-probe.mjs> <supplementary-c2.mjs> /tmp/kumitate-r64/K64R2ExecSupplementaryC2/repro`

**K64R2ExecSupplementaryC2-2 — HIGH — `scripts/jj-seat-demo.sh` is pinned nowhere.**
Attacks: every J6 run in this round and the next: nothing in `.ufo/pins/` names the demo (both greps above read 0), so the counter cannot tell the committed demo from a forgery, and a later edit is invisible. Proposed (not written): `{"round":64,"name":"jj-seat-demo","path":"scripts/jj-seat-demo.sh","sha256":"2d2edd43559c52912e674d89cf5d05c3988cbd1618bb98b82561691ca53182c3"}` (11426 bytes at 2ed8a5f8) — `proposed-pin.jj-seat-demo.json` and `pin.patch` in my build dir; S4 already consumes it, so the pin makes S4's first sub-arm live without touching the frozen counter.
Repro: `git show 2ed8a5f8:.ufo/pins/counter-pins.json | grep -c 'jj-seat-demo'`

**K64R2ExecSupplementaryC2-3 — MEDIUM — prose that contradicts the demo is invisible to J64.**
Attacks: the entry's `## Mechanism`/decision-table prose versus `## Demo outcomes`; J6 compares stated vs demo, never prose vs stated. One token flipped (`seat_file_in_default_tree=yes`) still reads `JJ64_HELD held=8/8`; S2 names it. Closure: S2 parses every `key=value` in all sections except `## Demo outcomes` and `## Located quotes` and requires the key to be stated with the same value; zero prose tokens fails closed (which is why F1 fails S2).
Repro: the MPROSE block in `out-calibration-controls.txt` (checkout 2ed8a5f8, flip one token, run both checkers).

**K64R2ExecSupplementaryC2-4 — MEDIUM — the integrated tree's lesson contradicts the demo it grounds.**
`corpus/lessons/round-64.md:63` (Gate table) re-grounds the staged finding as `seat_snapshot_in_shared_op_log=2` on S198; the entry and the demo both read `1` (`out-honest.txt`, OBS line). Not patched (outside my write scope; the L1 owns `corpus/`). Reported as OBS, not as a hard arm, because the frozen rule J64 does not cover the lesson.
Repro: `git show 2ed8a5f8:corpus/lessons/round-64.md | grep -n 'seat_snapshot_in_shared_op_log=2'` → `63:`

**K64R2ExecSupplementaryC2-5 — MEDIUM — a capture can be bound to the wrong page and still pass J4+J5.**
Attacks: J4/J5's quote-in-page test with site-wide boilerplate. D swaps S195's URL to `visibility.md`, leaves the capture and pin on `worker-versioning.md`, and quotes the docs-index note; `JJ64_HELD held=8/8`. Closure: S5 requires the live fetch to carry every bullet, rejects non-public hosts (loopback/private/link-local), and — when live bytes differ from the pin — requires the capture to be identifiable as the row's document (canonical/og:url path, else title/first-heading slug, else the URL itself). Honest rows are byte-identical to live today, so the arm costs nothing there.
Repro: D block in `reproduce-forgeries.sh`.

**K64R2ExecSupplementaryC2-6 — LOW — the critic's forgery commits are not reproducible.**
`evidence/verdicts.txt` cites seven revs; all seven are absent from the lane, and `evidence/f1-diff.patch` is truncated to 52 lines (no entry/demo hunks). The recorded `JJ64_HELD 8/8` lines do reproduce from the preserved generator + patches (my four runs above), so the verdicts stand — but the exact trees are gone, the same class as round 60's unrun tallies. Proposal: wave seats that record a rev also record the generator that rebuilds it (as `reproduce-forgeries.sh` does).
Repro: the `git cat-file -e` loop above.

**K64R2ExecSupplementaryC2-7 — LOW — a symlink at a capture-pin path resolves outside the archive.**
Attacks: `git archive | tar -x` + `readFileSync` in J3/J4 follows a committed symlink out of the extracted tree (the archive at 2ed8a5f8 already holds 16 symlink members, all under `.ufo/waves/**` fixtures, so a whole-tree rule is unsatisfiable). S1 therefore fails on the claim's read set (entry, SOURCES, pin file, demo, every capture pin, their ancestors) and on any symlink under `corpus/`, `scripts/`, `.ufo/pins/`, and reports the whole-tree count as information. MSYMLINK shows the arm firing; the counter catches the same tree only downstream (J3/J4 MISS).
Repro: MSYMLINK block in `out-calibration-controls.txt`.

## Artifacts
- `.ufo/waves/round-64/build/K64R2ExecSupplementaryC2/supplementary-c2.mjs` — the checker (S1–S6, `--no-live`/`--verbose`, exit 0/1/2).
- `.ufo/waves/round-64/build/K64R2ExecSupplementaryC2/reproduce-forgeries.sh` — rebuilds F1/A/D/F5 from the critic's preserved generator/patches and runs both checkers.
- `.ufo/waves/round-64/build/K64R2ExecSupplementaryC2/proposed-pin.jj-seat-demo.json`, `pin.patch` — the demo pin, proposed only.
- `.ufo/waves/round-64/build/K64R2ExecSupplementaryC2/out-honest.txt`, `out-forgeries-checker.txt`, `out-forgeries-counter.txt`, `out-calibration-controls.txt`, `out-f3bc-counter.txt`, `out-f3bc-checker.txt` — full transcripts.
- Two counted files added under the lane tree (`.mjs`, `.sh`); scratch clones deleted (`/tmp/kumitate-r64/K64R2ExecSupplementaryC2` = 64K).

## Limits
- Not a replacement for J64: it scores a different surface and its S4 pin arm reads a *proposed* pin until the L1 integrates one; with `--no-live` S5 is a declared FAIL (5/6, exit 1).
- S3's exactly-once passes F1's site boilerplate (each boilerplate line occurs once *within its own capture*); cross-page binding is S5's job, and a *public* attacker-hosted page whose bytes equal the pin still passes S5 (the plan's declared T63 hole, narrowed to non-public hosts, not closed).
- S1's whole-tree symlink rule is scoped as stated above (16 fixture symlinks exist at 2ed8a5f8); a symlink under `.ufo/waves/**` is reported as information only.
- S2 tolerates a prose value that is one component of a comma-separated stated value (`workspace_list=seat, main`) and fails closed when the prose names no demo key; it does not read `SCORECARD.md`/`SKILL.md`.
- The forgery revs I cite (40d1877f, 36f22f55, 3809b0a6, 2630609b; d9818a5b/2ac6be84 for F3b/F3c) lived only in deleted scratch clones; `reproduce-forgeries.sh` rebuilds F1/A/D/F5 and the peer's `forge-c2.mjs F3b F3c` rebuilds the other two, with fresh hashes. `F3` (attacker-hosted URL) was not rebuilt — its verdict needed a live loopback server, and no background job is allowed from this seat.
- Only jj 0.45.1 / git 2.56.0 / node v24.21.0 were exercised; no jj upgrade, no build/lint/test gate (wave-2 editing lane; the L1 owns post-integration gates). No tool installed or upgraded.
- Both fail-closed arms need a re-pin receipt path, or they freeze the evidence: S4 rejects any legitimate future edit to `scripts/jj-seat-demo.sh` (pin mismatch) and S5 rejects a capture whose page changed inside a quoted section (or stopped being byte-identical while losing its identity marker). The integration must pair each with a re-pin + receipt commit (new sha256, committed re-run transcript), as the plan's monotone ratchet already requires for controls; the script itself never writes a pin.
