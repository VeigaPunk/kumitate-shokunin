# K90Sentinel — adversarial review of receipt-bind v3 at base 7218699c

Target: `scripts/receipt-bind.mjs` as shipped at base `7218699cfbdec702ba42f35ceac0a8e52d1bd564`
(extracted byte-for-byte: `base-v3.mjs`, sha256 `37201ad0c6acd4c51b8804fa66ac9606469a181891dbed1d5ee46c56176e1bb3`, matches the round-89 close receipt).
Read-only on the lane. Every attack ran against a throwaway fixture under scratch (never the lane); scratch removed on exit.

Evidence: `K90Sentinel/attacks.txt` (command, exit, verdict line per run; severity block at the end),
`K90Sentinel/attack-driver.sh` (replays everything: `bash .../K90Sentinel/attack-driver.sh`),
`K90Sentinel/receipts/*.txt` (the receipts cited), `K90Sentinel/racers/*.py` (the two race drivers).
Env: node v24.21.0, python3, GNU time. Tools installed: none.

## Verdict summary

| ID | Attack (class) | Severity | Reproduced verdict line (exact) |
|---|---|---|---|
| A1 | in-lane absolute token whose real path is outside via untracked worktree symlink (a, e-worktree) | MED | `RECEIPT_BIND: CLEAN matched=1 mismatched=0 unchecked=0 external=1` (digest = worktree bytes); relative spelling of the same file: `DRIFT matched=0 mismatched=1 ... first=a.txt` |
| A4 | `cmd=node /dev/zero`: unbounded read of an external instrument (d) | MED | no verdict; V8 `Fatal process out of memory: Worklist::Segment::Create`, exit 133 (2 GiB `ulimit -v`) |
| A5 | external FIFO instrument: open blocks (d) | MED | no verdict; `exit: 124` after 15 s |
| A11a/b/c | K89-V1: U+200B / U+00A0 / U+FEFF-prefixed field lines ignored (known, reproduced on base) | MED | `CLEAN matched=1 mismatched=0 unchecked=0 external=0` with a hidden `cmd=`/`tool_sha256=`/`rev=` that disagrees with the visible one |
| A6 | 512 MiB external regular file read whole (d) | LOW | `CLEAN ... external=1`, `maxrss_kb=580844` |
| A2a/b | any user-readable absolute path named by `cmd=` is hashed and bound; digest oracle (c) | LOW | `CLEAN matched=1 ... external=1`; `--json` row `"computed":"507b054a…95"` = sha256 of the named file |
| A2c | `cmd=` naming an executable script (c) | NONE | `CLEAN ... external=1`; marker file absent: not executed |
| A3a | symlink in a parent component of an absolute external path (a) | LOW | `CLEAN matched=1 ... external=1` (final-component symlink correctly `SYMLINK_INSTRUMENT`, A3b) |
| A7 | TOCTOU: external `lstat` then `readFileSync` follows a symlink swapped in (b) | LOW | 120 runs: `CLEAN=15 SYMLINK_INSTRUMENT=34 DRIFT=71 other=0` |
| A8 | TOCTOU: receipt `lstat` then `open` blocks on a FIFO swapped in (b) | LOW | 150 runs: `HUNG(exit 124)=7 RECEIPT_UNREADABLE=71 CLEAN=72 DRIFT=0` |
| A9c | `GIT_REPLACE_REF_BASE` from caller env survives `gitEnv()` and redirects the blob read (e) | LOW | `CLEAN matched=1 mismatched=0 unchecked=0 external=0` binding the replacement blob; `git cat-file` under same env prints `REPLACED-BLOB` |
| A10 | `refs/replace/<blob>` in the lane's own repo redirects the judged blob (e, repo-write) | LOW | `CLEAN matched=1 mismatched=0 unchecked=0 external=0` for the replacement digest |
| A12 | committed instrument > 64 MiB: maxBuffer kill reported as absent (bounded, misleading) | LOW | `FAIL-CLOSED UNRESOLVED a.txt instrument absent at <rev>: scripts/big.bin` |
| (b) git path | `ls-tree`/`cat-file` read a pinned rev object | NONE | analysis only; no reproduction attempted; no finding claimed |
| (c) exec | `cmd=` executed? | NONE | argv-only `spawnSync`, no shell, no hooks; C8 and A2c markers absent |
| (e) env drop | `GIT_DIR`, `GIT_INDEX_FILE`, `GIT_ALTERNATE_OBJECT_DIRECTORIES` canaries | NONE | C9: `CLEAN ... external=0` (canaries ignored) |

Controls behave as the contract states (C1 CLEAN; C2 SYMLINK_INSTRUMENT; C3 ESCAPES_LANE; C4 SYMLINK_RECEIPT; C5 SYMLINK_DIR; C6 RECEIPT_UNREADABLE on a FIFO receipt, no hang; C7 RECEIPT_TOO_LARGE; C8 flag-instrument UNRESOLVED without execution; C9 env dropped; A11d/e visible bogus rev and visible duplicate fail closed). The 1 MiB receipt bound is enforced before read for receipts; it is NOT enforced for external instruments (A4/A6).

## Detail for each reproduced weakness

**A1 (MED) — absolute spelling launders the judged revision.** `isAbsolute(instrument)` judges membership by `realpathSync(dirname(abs))`. A worktree that replaces a tracked directory with an untracked symlink to an outside directory makes the same file `external`: `scripts/alpha.mjs` relative → bound at rev (DRIFT against the worktree digest); `/abs/lane/scripts/alpha.mjs` → hashed from disk, CLEAN with the worktree digest. The `external=1` counter is the only trace. Bears directly on Q81 (a binding predicate must make revision and worktree differ): under the absolute spelling they do not. Reproduction: `attacks.txt` A1r / A1 / A1b; setup shows `git status`: `D scripts/alpha.mjs`, `?? scripts`.

**A4 (MED) — unbounded memory from one receipt.** `cmd=node /dev/zero`: lstat is not a symlink; there is no `isFile` or size check on the external branch; `readFileSync` of a size-0 char device reads until EOF. Under `ulimit -v 2 GiB` V8 aborts (exit 133, no `RECEIPT_BIND:` line). Without a cap it would consume host RAM. Not a forged verdict, but no fail-closed verdict is emitted.

**A5 (MED) — unbounded time from one receipt.** `cmd=node <fifo>`: `open()` blocks until a writer appears; 15 s timeout, no verdict.

**A11 (MED, known K89-V1) — hidden field lines.** Field regexes are `^key=`; a leading invisible (U+200B, U+00A0, U+FEFF) or ASCII space hides a second `cmd=`, `tool_sha256=` or `rev=` line. Visible equivalents are caught (A11d `REV_UNRESOLVED`, A11e `AMBIGUOUS_FIELD`), so the hidden lines are only skipped by the parser. The verdict binds whichever field is visible; a downstream reader that strips prefixes sees a different receipt. v4 candidate work (not integrated here) must cover this; this run is on base only.

**A2 (LOW) — arbitrary readable file as instrument; sha256 oracle.** Absolute tokens are not restricted to executables; any file the user can read is hashed. `--json` emits `computed=sha256(file)`, and a CLEAN/DRIFT verdict answers guesses about the contents. Design question for Main: external instruments may need an allow-list or the claim should be narrowed (`A2a`, `A2b`).

**A3 (LOW) — intermediate symlink on external path.** Only the final component is lstat'd (`SYMLINK_INSTRUMENT` on A3b). An absolute path through a symlinked parent resolves external and is CLEAN (A3a). Consistent with the external-disk model, but it is the same door as A1 when the parent is in-lane.

**A7 (LOW) — TOCTOU on external instrument.** `lstat(abs)` (symlink refusal) then `readFileSync(abs)` (follows). A racer flipping the path between a regular file and a symlink produced CLEAN with the link target's digest in 15/120 runs. The documented guarantee "external symlink is refused" is not atomic. Requires write access to the instrument's directory.

**A8 (LOW) — TOCTOU on receipt: DoS.** Receipt path is `lstat`'d, then `openSync(O_RDONLY|O_NOFOLLOW)`. A FIFO swapped in between blocks `open()` (no `O_NONBLOCK`); 7/150 runs hung past 3 s. The post-open `fstat` check cannot run because `open()` never returns. Requires write access to the receipt directory. Symlink substitution is blocked by O_NOFOLLOW (no reproduction).

**A9 (LOW) — env redirect of the blob read.** `gitEnv()` drops `GIT_DIR`, `GIT_WORK_TREE`, `GIT_INDEX_FILE`, `GIT_OBJECT_DIRECTORY`, `GIT_ALTERNATE_OBJECT_DIRECTORIES`, `GIT_COMMON_DIR`, `GIT_NAMESPACE`, `GIT_PREFIX`, `GIT_CEILING_DIRECTORIES`, but not `GIT_REPLACE_REF_BASE` (nor `GIT_CONFIG_*`, not exercised). Under the same env `git cat-file blob` returns the replacement (A9b), and the tool binds it (A9c). Receipts cannot set env, so reachability depends on the caller's environment (LOW).

**A10 (LOW) — repo-level replace refs.** `git cat-file`/`ls-tree` honour `refs/replace/`. A writer to the lane's repo can make the rev's blob read return other bytes while commit ids stay unchanged; nothing in the tool disables replacement. A commit gives the same power, so this is LOW, but the verdict's "judged at rev" wording is then false.

**A12 (LOW) — misleading fail-closed.** `spawnSync` maxBuffer 64 MiB kills git on a larger committed blob; `blobAt` returns null; the verdict says `absent at rev`. Fail-closed, not a bypass.

**(b), (c), (e) — checked, no weakness claimed.** Git reads are rev-pinned (`ls-tree` and `cat-file blob` on immutable objects), so there is no TOCTOU on the git path; no shell, no hook, and no code path executes `cmd=` (C8 and A2c markers absent); the dropped GIT_* list covers the three names in the brief, the residual gap is A9.

## Routed defects (base v3; each must be re-run against the v4 candidate before it is closed)

- **RD-1 (A1, MED).** For an absolute token: if the lexical path is inside the lane but its real parent is outside, fail closed (`SYMLINK_INSTRUMENT`, ancestor in lane). Do not classify an in-lane lexical path as external. Re-run A1 (expect fail-closed) and A1r (unchanged).
- **RD-2 (A4, A5, A6, MED/LOW).** External branch: open with `O_RDONLY|O_NOFOLLOW`, `fstat` the descriptor, refuse non-regular files and sizes over a cap (fail closed as `UNRESOLVED`), read from the descriptor. Re-run A4, A5, A6 (expect fail-closed, bounded time and memory).
- **RD-3 (A7, LOW).** Same fix as RD-2 closes the symlink-swap window (the `O_NOFOLLOW` open is the check; `lstat` alone is not). Re-run A7 (expect zero CLEAN from a link).
- **RD-4 (A8, LOW).** Receipt open: `O_NONBLOCK|O_NOFOLLOW`, then `fstat` and refuse non-regular, before any read. Re-run A8 (expect zero HUNG).
- **RD-5 (A9, A10, LOW).** In `gitEnv()`: set `GIT_NO_REPLACE_OBJECTS=1` (disables `refs/replace/` for every git call) and drop `GIT_REPLACE_REF_BASE` and `GIT_CONFIG_*`. Re-run A9c and A10 (expect the replacement digest to DRIFT). **Fix untested by me.**
- **RD-6 (A11, MED, K89-V1).** Already routed to v4. Requirement: strip the full invisible set (U+200B–U+200E, U+00A0, U+FEFF) before matching field keys; re-run A11a/b/c (expect `AMBIGUOUS_FIELD` or a parse that cannot be fooled).
- **RD-7 (A12, LOW).** Size-specific verdict or a larger buffer; not a security fix.
- **DESIGN-1 (A2, A3, LOW).** Decision for Main, not a code defect: external instruments are arbitrary readable files with a digest oracle. Narrow the claim or add an allow-list.

## Limits

- Attacks run on base bytes only; the v4 candidate was not read or run.
- A7 and A8 are probabilistic (rates above are one run set on this host); both reproduced.
- A4 used `ulimit -v`; no test was run without a cap, to keep the host safe.
- The `(b)` git-path and `(c)` execution items are analysis, labelled NONE, not UNVERIFIED findings.
