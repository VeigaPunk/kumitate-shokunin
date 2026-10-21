SEC3 hits=10 leaks=2 verdict=refuted
Axes: operability (green while unchecked), provenance (root/revision record), coverage (selftest kill rate).
Tested file: scripts/claims-check.mjs sha256 511d15563f83… = HEAD:scripts/claims-check.mjs (lane HEAD 8c41439) = working tree. Scratch copy: /fast/scratch/kumitate-r37/Sec3/cc.mjs. Every run: HOME=/fast/scratch/kumitate-r37/Sec3/sandbox-home, TMPDIR=…/tmpx. Victims and hook repos are scratch repos. The forbidden root was never passed.

## Counters
- hits=10: accepted hostile input or false green (C1–C10).
- leaks=2: ambient-env writes into a foreign repo (L1, L2).
- unrecorded misroots=3 (M1–M3).
- Pairing selftest kill rate: 3 of 9 pairing mutants killed; 6 survive with no named case.
- D2 control: holds for its one named construction (right-first shift → killed). It does not hold for C1–C10 or the six survivors.

## Baseline
$ node scripts/claims-check.mjs --selftest
CLAIMS_SELFTEST: 47/47 pass · VERDICT: PASS · exit 0
(47 = 42 literal checks + 5 from the fail-closed loop.)

## Hits — accepted as green, or unbounded
C1 Heading that does not resolve is skipped by the fidelity walk (lines 269–270: `candidates.length !== 1 → continue`).
   `## \`scripts/renamed.mjs\`` → `--fidelity` → `FIDELITY: CLEAN (notes=1 anchors=1)`, exit 0. Same tree, claims arm → exit 1, `SECTION_FILE_UNRESOLVED`.
C2 Anchor path that is not an exact origin path is not counted (resolver is exact-match, line 572).
   `ALPHA_MARK` at `scripts/gone.mjs:3` → CLEAN (notes=2 anchors=1); claims → `SECTION_NO_ANCHOR`.
   Own file, partial path, wrong symbol: `BETA_MARK` at `fx/a.mjs:2` → CLEAN. Exact `scripts/a.mjs:2` → DRIFT (nonok=1).
C3 Zero resolvable notes → `FIDELITY: CLEAN (notes=0 anchors=0)`, exit 0; claims → `NOTE_MISSING` ×2.
C4 Dedupe key `(note, file, chunk.length, chunk.slice(0,80))` (line 272) drops a distinct section. Two sections of equal length, same 80-char lead, wrong symbol after char 80 → CLEAN (notes=2 anchors=2). Prefix-differs control → DRIFT (nonok=1).
C5 Substring symbol: `port` ⊂ `export` (line 4) → ok → CLEAN (anchors=2 ok=2). `portal` → DRIFT (nonok=1).
C6 Dirty pinned tree passes the pin. Clone `git status --porcelain` = ` M scripts/a.mjs`. `--pin` → `FIDELITY: CLEAN (notes=2 anchors=2 src-rev=73e98e8e8040)`. Clean tree, same pin → DRIFT (nonok=1). The gate attests HEAD only (gitHead, lines 164–172).
C7 Ratchet laundering: clean tree, ratchet total 0, fx-a nonok=1 → RATCHET_NOTE/TOTAL DRIFT. Rename the heading → `FIDELITY: CLEAN (notes=1 anchors=1 src-rev=73e98e8e8040)`, exit 0. Claims arm, same tree → `SECTION_FILE_UNRESOLVED`.
C8 Unpinned default root (see M1). Same argv, HOME=home1 → CLEAN; HOME=home2 → DRIFT (nonok=1).
C9 Unbounded cost: one line with N anchors. N=1000/2000/4000 → 0.11 s / 0.36 s / 1.25 s (136 KB line), ≈3.4× per doubling. No size bound.
C10 Symlinked member file: `scripts/a.mjs → a-real.mjs`. walkFiles drops symlinks (lines 450–451) → CLEAN (notes=1 anchors=1); claims → `SECTION_FILE_UNRESOLVED`.

## Selftest false-green constructions
S1 The only FIDELITY case (lines 1180–1190) overrides `notes`, so fx-b.md is never written. The R1 row is silently skipped (`R1 note exists: false`). The case is green on S1 alone.
S2 Mutant battery (scratch copies; each target string asserted to occur exactly once; Pair items own the full audit):
   M1 right-first ........ killed 46/47 (FAIL "FIDELITY: a shift onto the next symbol…")
   M2 left-only .......... survived 47/47
   M3 both-eligible → ok . killed 46/47
   M4 window 15 .......... survived 47/47
   M5 window 13 .......... survived 47/47
   M6 anchor span as symbol survived 47/47
   M7 length floor off ... survived 47/47
   M8 range end +1 ....... survived 47/47; `:2` fixture DRIFT→CLEAN
   M9 range start +1 ..... killed 46/47
S3 Lines 1231–1234 "fixture roots are all under tmpdir()" are true by construction (`mkdtempSync(join(tmpdir(),…))`) for any TMPDIR. The label "(no live tree in reach)" is not proven by it.
S4 Coverage meta-check (1257–1259) reads only `CLAIMS  ` lines; FINDING_KINDS (390–396) has no FIDELITY kind, so none of C1–C10 can trip it.

## Leaks
L1 Ambient GIT_DIR reaches fixture git calls. pinTree/gitRun (1082–1098) spread `process.env`; production gitEnv (151–162) strips it.
   $ GIT_DIR=<victim>/.git node cc.mjs --selftest → CLAIMS_SELFTEST: 44/47, VERDICT: FAIL (PIN match, PIN default, PIN mismatch).
   Victim gained commit "fixture pin" and tracked scripts/a.mjs, scripts/b.mjs, scripts/dup.mjs, crates/ufo-core-runtime/src/{c.rs,dup.mjs}.
   Production rev-parse did not follow GIT_DIR (inferred: otherwise PIN match would have matched the victim HEAD).
L2 Git exports GIT_INDEX_FILE to pre-commit hooks (verified: `.git/index` for plain commit, `.git/index.lock` for commit -a; GIT_DIR not exported).
   $ GIT_INDEX_FILE=<victim>/.git/index node cc.mjs --selftest → VERDICT: PASS, exit 0; victim index sha 3765005a… → 4f263b74…, now lists fixture paths.
   Selftest as pre-commit hook: plain commit exit 0, commit = a.txt only (relative path resolved inside the fixture repo). `commit -a` → exit 1: `error: invalid object 100644 8f0593… for 'crates/ufo-core-runtime/src/c.rs'` / `error: Error building trees`, while the hook selftest printed 47/47 PASS. Same commit -a without the hook → exit 0.

## Unrecorded misroots
M1 Text verdicts carry no root. runFidelity prints only `src-rev=` under a pin (361–366); claims text is the same. Only claims `--json` records `src`. Without `.ufo/pins/origin.json` the scored root is invisible. The selftest asserts that absence (1170–1176).
M2 Fleet root `/home/vgpnk/Projects/shokunin/bash: ` (directory, mtime 2026-10-18 14:01, not tracked: `git ls-files` → 0). Nested entries `bash: /home`, `bash: /home/vgpnk`, `bash: /home/vgpnk/Projects` (shell-error text used as a path). Round-37 final/misroot.txt (03:32) lists only lane-relative status lines and does not mention it. Peer Sec4.md H1 records the same class. Not modified by me.
M3 A pin attests HEAD, not scored bytes (C6): `src-rev=` names a commit that did not produce the verdict.

## Live lane (shipped tool, read-only)
- `--fidelity --fidelity-ratchet`: `FIDELITY: CLEAN (notes=20 anchors=1574 src-rev=31c465f15669)`, exit 0. Without ratchet: DRIFT (nonok=200). Not vacuous.
- Ratchet file total = 200 = sum(notes) = measured nonok. Commit 5bc40d0 says "ratchet 200". The "186" in the round-37 context is stale.
- Silent-skip census (instrumented copy; verdict identical to shipped): noteMissing 0, sectionSkip 0, ownMissing 0, dedupe 1, pathAnchorMissing 25, sectionsWalked 183; 183 + 1 = 184 claims-arm sections.
  · dedupe 1: failure-telemetry.md / scripts/ufo-mission-result.mjs, chunk byte-identical to the first → benign today.
  · pathAnchorMissing 25: ops-watchers 19 (`hub:N` 13, `config:N` 6; `config` is a directory), gate-verdict 4, test-inventories 2 (`tests/conformance.rs` exists at crates/ufo-core-runtime/tests/, missed by the exact-match resolver). FIDELITY counts none of them; claims run errors=0.

## Verdict
refuted — hits=10, leaks=2, misroots=3. Smallest remediations:
 1. Walk: unresolved/ambiguous heading, missing note, symlinked member, non-matching own-file anchor → finding; zero-note universe → DRIFT.
 2. Dedupe by section index, not a prefix heuristic.
 3. Symbol match on identifier boundaries, not substring.
 4. Pin: refuse dirty trees (`git status --porcelain --untracked-files=no` empty) or hash scored bytes into src-rev.
 5. Text verdict prints `src=<path>`; fidelity arm gets `--json` with src.
 6. Selftest harness: same env allow-list as gitEnv (no GIT_*); fx-b.md in the shift fixture; a case per survivor (M2, M4–M8); rewrite or delete S3.
 7. Ratchet: total derived from the per-note sum in the tool.
Checks for main agent: `node scripts/claims-check.mjs --selftest` (expect 47/47); repros L1/L2 against a scratch victim repo.

## Disclosures
- First instrumented run had a harness bug (an `if` replaced by an unconditional `continue`). Its zero-note result was discarded; the corrected instrumentation reproduces the shipped verdict exactly.
- One `git -C kumitate-shokunin status --short` at start without GIT_OPTIONAL_LOCKS; may have refreshed the index stat cache. No commit, ref, or tracked change by me. Later git reads: log, show, ls-files, cat-file, rev-parse, merge-base only.
- Installs: none. Subagents: none. REA: none. pacman: not used.
- Writes: /fast/scratch/kumitate-r37/Sec3 (created; the parent did not exist) and this report.
