# K64R2ExecCounterRerun — proposed minimal diffs (text only; the probes are frozen, the L1 integrates)

Measured rev 2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8. Every diff below strengthens, never relaxes, a check.
None of them is installed by this seat.

## 1. scripts/jj-seat-demo.sh — neutralize the ambient editor (fixes findings -1 and -7)

Measured in a scratch clone; see jj-seat-demo-editor.patch (byte-identical to this hunk):

    --- a/scripts/jj-seat-demo.sh
    +++ b/scripts/jj-seat-demo.sh
    @@ -40,7 +40,7 @@
     export GIT_CEILING_DIRECTORIES="${S%/*}"
    -J() { jj --config user.name=fixture --config user.email=fixture@example.invalid --no-pager --color never "$@"; }
    +J() { jj --config user.name=fixture --config user.email=fixture@example.invalid --config 'ui.editor=["true"]' --no-pager --color never "$@"; }

`jj squash --from @ --into "$SEAT_CHANGE"` (line 97) opens the description editor unless one is configured.
With EDITOR/VISUAL unset jj's editor launch fails (ENOENT) and the demo exits 2 -> J6 MISS. The config flag is
resolved before $JJ_EDITOR/$VISUAL/$EDITOR, so it also defeats a hostile or interactive ambient editor.
Measured alternatives, both also 21/21 keys identical under the harness env:
  - `export EDITOR=true VISUAL=true` in the hermetic block (line 43), one line, no jj-config dependency;
  - `jj squash ... --config 'ui.editor=["true"]'` at the single call site instead of in J().
Verified: with the hunk applied (clone commit 80faa1b525d163d525b517bb3eb274be2f62d99d) the frozen probe reads
`JJ64_HELD held=8/8` and `counter-rerun` reads `COUNTER_RERUN: AGREE (runs=5)` exit 0 under the harness env.

## 2. probe/jj64-probe.mjs + probe/receipt64-probe.mjs — an un-creatable scratch dir must be exit 2, not 1

Both: `const T = mkdtempSync(join(tmpdir(), '<name>.'))` is unguarded (jj64 line 51, receipt64 line 42).
Measured: TMPDIR=/nonexistent -> uncaught ENOENT, exit 1, no verdict line, i.e. an un-evaluated run recorded as
`held=0/N` by any receipt that reads the exit code. Proposed (same shape in both probes):

    -const T = mkdtempSync(join(tmpdir(), 'jj64.'));
    +let T;
    +try { T = mkdtempSync(join(tmpdir(), 'jj64.')); }
    +catch (e) { process.stdout.write(`JJ64_UNMET held=0/8 checks=8 rev=${full} rule=${RULE} | scratch-unwritable ${e.code}\n`); process.exit(2); }

This keeps the contract sentence "Exit 2 only when the revision itself cannot be read" honest by widening it to
"cannot be evaluated" (the receipt64 header already says "Exit 2 only when the measured revision itself cannot be
read"; the plan's kill rule reads a MISS, and exit 2 is the arm that is never a score).

## 3. probe/jj64-probe.mjs + probe/receipt64-probe.mjs — extract only the paths the counter reads (cost, finding -5)

Measured: the full archive is 171857920 B / 14826 files / 190 MB on disk / 325 ms per run; the paths the two
counters actually read are 4055040 B (jj64: `scripts corpus PROVINCE.md .ufo/pins`) and 12830720 B
(receipt64: `scripts .ufo/waves/round-64`). Proposed:

    -const ar = spawnSync('bash', ['-c', `git -C "${lane}" archive "${full}" | tar -x -C "${T}"`], ...);
    +const NEEDED = ['scripts', 'corpus', 'PROVINCE.md', '.ufo/pins'];
    +const ar = spawnSync('git', ['-C', lane, 'archive', full, ...NEEDED], { maxBuffer: 64 << 20, encoding: 'buffer' });
    +if (ar.status !== 0 || spawnSync('tar', ['-x', '-C', T], { input: ar.stdout }).status !== 0) { ... archive-failed ... }

(For receipt64: `['scripts', '.ufo/waves/round-64']`.) The probe's own reads stay identical: J1/J2/J4/J8 read
corpus/ and PROVINCE.md, J3 reads .ufo/pins, J6/J7 read scripts/. This is a cost fix only; it does not change any
check's outcome and must be re-measured after the change (the seat did not apply it).

## 4. .ufo/pins/counter-pins.json — pin the census validator (finding -2, L1 decision)

J7 delegates its census arm to `process.env.SOURCES_CENSUS || '/home/vgpnk/Projects/shokunin/scripts/sources-census.sh'`
— a fleet file outside the measured rev and outside the pins (grep 'sources-census' counter-pins.json = 0).
Measured: a no-op `exit 0` stub keeps `JJ64_HELD 8/8`; an `exit 1` stub yields `J7 MISS census-exit=1`.
Proposed: add the script's sha256 to `.ufo/pins/counter-pins.json` and have the probe verify it before the J7 run,
or vendor the validator into the lane (`scripts/sources-census.sh`) and run the archived copy so the arm is inside
the measured bytes. Same class for receipt64 P3: it reads the fleet repo at `--fleet` (default
/home/vgpnk/Projects/shokunin) and two abbreviated fleet commits (`7b0581ed`, `8fd46e61`); measured
`--fleet <non-git>` -> `P3 MISS fleet-blob-unreadable`. Proposed: commit the two report blobs into the lane under
`.ufo/waves/round-64/base/` with sha256 pins, and read them from the archive.

## 5. scripts/counter-rerun.mjs — the AGREE predicate cannot certify a stable UNMET reading (finding -8, L1 decision)

Measured: five byte-identical `RECEIPT64_UNMET held=4/5 ...` summaries, five `run N exited 1` reasons,
`COUNTER_RERUN: DISAGREE` exit 1. The declared predicate (AGREE iff every run exits 0 and the summary lines are
byte-identical) therefore reports the *current* frozen state of C1 as a disagreement, although it is perfectly
deterministic. Proposed, as a declared predicate change (not a relaxation of the byte comparison):

    -  if (r.status !== 0) { reasons.push(`run ${r.i} exited ${...}`); }
    +  if (r.status !== 0) {
    +    // a non-zero counter exit is a reading, not a flake: require the SAME non-zero code in every run
    +    if (r.status !== runs[0].status) reasons.push(`run ${r.i} exited ${r.status} vs run 1 ${runs[0].status}`);
    +  }
    ...
    -  if (verdict === 'AGREE') { out(`COUNTER_RERUN: AGREE (runs=${o.runs})\n`); process.exit(0); }
    +  if (verdict === 'AGREE') { out(`COUNTER_RERUN: AGREE (runs=${o.runs}${runs[0].status ? ` status=${runs[0].status}` : ''})\n`); process.exit(0); }

That makes `AGREE (runs=5 status=1)` mean "stable unmet", `AGREE` mean "stable held", and DISAGREE mean "the code
or the line moved". The existing selftest cases still hold (the flake counter varies the line; a counter that
exits 0 once and 1 once now varies the code). The L1 owns this call; the seat only measures.
