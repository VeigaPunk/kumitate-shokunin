RESULT SentinelTempParent rev=e5ffcbe7f155b89cb1870f9da7b0d671d092948b verdict=findings findings=4

# SentinelTempParent — round 43 security review: temp parent and K43 confirmation rerun

Scope: the counter bytes at `0f4108bf66d58eb4cf4642ca1faf0fdeeba06c82`, `scripts/gate-mutants.mjs`,
sha256 `e24749e4b1eb21f5fb446c05543451b3221e708978fff6938fa6f68c36d4152a`, diff against
`2a7f37d2`: (a) `makeTempDir`'s new temp parent and its owner/mode checks, (b) the confirmation
rerun that reuses the first run's temp tree. Nothing else was judged. No lane file was modified,
so no patch is delivered. No tool was installed. All probes ran from the extracted bytes in
`/fast/scratch/hyaku/kumitate-r43/seats/SentinelTempParent/`, with a byte-identical copy of the
counter whose only edit was `main()` guarded by `GATE_PROBE_NO_MAIN` plus a trailing `export {}`
so the real functions could be driven directly; every function under test is unmodified.

## Code under review

```
37: const SCRATCH_TMPDIR = process.env.KUMITATE_GATE_MUTANTS_TMP
38:   || join(homedir(), '.cache', 'kumitate-gate-mutants');
43: function makeTempDir(prefix) {
44:   mkdirSync(SCRATCH_TMPDIR, { recursive: true, mode: 0o700 });
45:   const base = realpathSync(SCRATCH_TMPDIR);
46:   const baseStat = statSync(base);
47:   const parentStat = statSync(dirname(base));
48:   if (baseStat.uid !== process.getuid() || (baseStat.mode & 0o077) !== 0
49:     || parentStat.uid !== process.getuid() || (parentStat.mode & 0o002) !== 0) {
50:     throw new Error(`unsafe scratch temp parent: ${base}`);
51:   }
52:   const dir = mkdtempSync(join(base, prefix));
...
623:     const digest = sha256(mutated);
624:     const run = await runSelftestFile(file, copied.tempRoot, { timeoutMs });
...
628:     if (state === 'killed') {
629:       const again = await runSelftestFile(file, copied.tempRoot, { timeoutMs });
630:       const agreed = confirmKill(run, again, controlTotal);
...
634:     try {
635:       if (sha256(readSafeFile(file, copied.tempRoot)) !== digest) state = 'crash';
```

## F1 — MEDIUM — the K43(d) confirmation run is not an independent second run

Severity MEDIUM. Defect class: false kill, which the counter reports as CLEAN. Latent for the two
frozen targets today (both selftests `mkdtempSync(join(tmpdir(), …))` and remove it in a `finally`),
but the predicate's confirmation holds only because those two suites happen not to cache state.
The frozen K43(d) text says "an immediate second run of the same mutated bytes"; the implementation
starts the second run on the same `copied.tempRoot` (same `HOME`, same `TMPDIR`, same `cwd`), so
run 1's writes are visible to run 2, and the mutated bytes are only compared after run 2 has already
executed (line 634-636). Two consequences, both demonstrated with the real `runMutant`:

* Outcome: a mutated selftest that reads a file its first invocation wrote replays the first
  failure. The gate then reports `confirm=same`, i.e. KILLED, for a mutation whose honest second
  observation (fresh tree, identical bytes and identical host conditions) is `2/2 cases passed`,
  `VERDICT: PASS`, exit 0, i.e. UNSTABLE. This is the exact failure mode K43(d) was added to
  answer (round-42 CritC1Claim objection 2: a false kill under host pressure).
* Integrity digest: run 1 can rewrite the target file during its own run and restore the mutated
  bytes before exiting; the post-hoc digest comparison sees nothing. It can also rewrite a sibling
  module in the same copied tree (`scripts/fixture-helper.mjs`), which the digest witness never
  covers; run 2 imports the rewritten sibling.

Smallest remediation, no amendment of K43: give the confirmation a fresh `copyScripts` tree (same
mutated bytes, fresh `home`/`work`/`TMPDIR`) and recompute `sha256` of the target immediately before
starting it, refusing with `crash` on mismatch. Two call sites change.

## F2 — LOW — the parent check accepts a parent another user can write

Severity LOW. `parentStat.mode & 0o002` rejects only world-writable parents; a group-writable
parent (0770) and a 0700 parent carrying a POSIX ACL for a foreign uid (mode reads 0770 through the
mask) both pass. The help text at line 111 promises "temp parent: … (owner-only, mode 0700)", so
the shipped claim is stronger than the check. Impact is bounded: the base itself must be 0700 and
owned by us, so a foreign writer can rename or delete the base entry (denial of service, spawn
`ENOENT`, error exit 2) but cannot read the temp trees. Escalation requires a second uid holding a
grant on the parent; I could not execute that step because this seat's scratch ancestors are
mode 0700, so the cross-uid rename is inference, while the accepted-parent facts are demonstrated.

Smallest remediation: require the parent to be owner-only as well, e.g. reject
`(parentStat.mode & 0o022) !== 0` and a parent whose `getfacl` mask is non-empty, or relax the help
text if the weaker property is intended.

## F3 — MEDIUM — the temp tree is held as a path string, not an identity

Severity MEDIUM. After the checks pass, nothing pins the directory: no dirfd, no inode comparison
before a spawn. Any same-uid process that can write the base entry redirects a later run to a
replacement tree at the same absolute path. This is not hypothetical inside the gate itself: the
base is shared by every job of a run and by every concurrent invocation that uses the same parent,
and a sandboxed selftest child is the same uid (`sandboxEnv` allowlists `TMPDIR`, and
`dirname(TMPDIR)` is the base). Demonstrated with the real functions: a selftest child listed the
shared base, renamed a sibling tree and planted a file in the base; and a swap made between
`makeTempDir` and `runSelftestFile` made the run execute forged bytes with a different inode.

Impact: a sibling job's kills or survivals can be decided by bytes the code under test chose, i.e.
a false kill, hence a false CLEAN. Today's two target suites never do this, so the live receipt is
not affected; the `gate-mutants` capability as a reusable gate is.

Smallest remediation: record `st.dev`/`st.ino` of `copied.tempRoot` (and of `base`) at creation and
re-stat both immediately before every `runSelftestFile`, classifying a mismatch as `crash`
(exit 2); or open a dirfd on the tree and spawn through it.

## F4 — LOW — wrong-mode and non-directory bases produce the wrong diagnosis

Severity LOW, operability only. A pre-created base with the wrong mode is refused as designed
(0755 and 0770 both read `unsafe scratch temp parent`), but a base that is a regular file of ours
fails earlier with `EEXIST: file already exists, mkdir …`, a base with mode 0500 fails with
`EACCES: permission denied, mkdtemp …`, and a base with setgid or sticky bits (2700, 1700) is
accepted because the mask is `0o777` rather than `0o7777`. `baseStat` is never checked with
`isDirectory()`. Smallest remediation: check `isDirectory()` and the `0o7777` mask in the same
conditional so every bad shape reports `unsafe scratch temp parent`.

## Verified clean (no finding)

* Foreign-owner base (uid 65534, mode 0700): refused (`unsafe scratch temp parent`).
* World-writable parent (0777): refused.
* Pre-created base 0755 and 0770: refused.
* Symlinked parent: resolved with `realpathSync`; a link to an owner-only directory is accepted and
  writes land in the resolved target; a link whose resolved parent is world-writable is refused.
* Cleanup cannot be turned into a recursive delete through a symlink: a symlink planted inside the
  tree and a top-level symlink replacing the tree both leave the link target intact.
* A missing `cwd` at spawn settles instead of hanging: `status=-2 spawnError=spawn /usr/bin/prlimit
  ENOENT`, classified `crash` (exit 2).
* The parent is re-checked on every `makeTempDir` call, not once per process.
* `sandboxEnv` is an allowlist of five variables, so `KUMITATE_GATE_MUTANTS_TMP` never reaches a
  selftest child.
* The gate's own `--selftest` has no case for any temp-parent check (`grep -c "chmod\|setfacl"` = 0)
  and exercises `confirmKill` only on canned objects (lines 909-910), never two real runs; that is
  why F1 passes its own gate. Coverage gap, folded into F1's remediation.

## Evidence (commands and observed output)

1. `git show 0f4108bf:scripts/gate-mutants.mjs > $S/gate-mutants-0f4108.mjs; sha256sum` →
   `e24749e4b1eb21f5fb446c05543451b3221e708978fff6938fa6f68c36d4152a`.
2. `git diff 2a7f37d2 0f4108bf -- scripts/gate-mutants.mjs` → +74/-14, `SCRATCH_TMPDIR` moved to
   `$KUMITATE_GATE_MUTANTS_TMP`/`~/.cache/kumitate-gate-mutants`, `makeTempDir` checks added,
   `evaluable`/`killedOnce`/`confirmKill` added, second run added in `runMutant`.
3. F1, public path: `PROBE_SEAT=$S node rerun.mjs` →
   `REAL runMutant (public path, same-tree confirm) state=killed detail=exit=1 verdict=FAIL group_clean=true fail_lines=1 overflow=false confirm=same`.
4. F1, same tree, pressure flag removed before run 2: `same-tree run2 status=1
   stdout="0/2 cases passed\nFAIL  fixture-case — transient pressure\nVERDICT: FAIL\n"`,
   `same-tree confirmKill=true -> state=killed (FALSE KILL)`,
   `tree leftovers after run1: ["home","run1-stash.txt","scripts","work"]`.
5. F1, fresh tree (honest second observation, same bytes, same conditions):
   `fresh-tree run2 status=0 cases={"passed":2,"total":2} stdout="2/2 cases passed\nVERDICT: PASS\n"`,
   `fresh-tree confirmKill=false -> state=unstable (honest)`.
6. F1, digest: `helper after run1="export const FLAG = \"rewritten-by-run-1\";"`,
   `target bytes restored by run1 so post-hoc digest check sees nothing: true`.
7. F2: `gw parent mode=770` → `case=parent-group-writable OK`; ACL parent
   `acl=user::rwx;user:nobody:rwx;group::---;mask::rwx;other::---`, mode 770 →
   `case=parent-acl-foreign-write OK`; contrast `case=parent-world-writable REFUSED`.
8. F3, swap after the check:
   `case=path-swap ino_before=1095168114 ino_now=1430819276 ran="0/2 cases passed\nFAIL  fixture-case — forged\nVERDICT: FAIL\n" status=1`.
9. F3, reachability from a sandboxed child:
   `child stdout="base=…/gm-tmp listed=[\"kumitate-gate-mutant-sibling\",…] rename=ok plant=ok"`,
   `sibling_intact=false planted=true`.
10. F4: `case=base-is-file REFUSED EEXIST EEXIST: file already exists, mkdir …`; `base mode=500 →
    case=ro REFUSED EACCES EACCES: permission denied, mkdtemp …`; `base mode=2700 → OK`,
    `base mode=1700 → OK`.
11. Default parent, synthetic `HOME`: `case=default-home(no .cache) OK path=…/cases/home/.cache/kumitate-gate-mutants/case-L9QfSP mode=700 uid=1000`, and `created …/.cache mode=700 and base mode=700`.
12. Verified clean: `case=base-foreign-owner REFUSED unsafe scratch temp parent`;
    `case=base-0755 REFUSED`; `case=base-0770 REFUSED`;
    `case=base-symlink-world-parent REFUSED unsafe scratch temp parent: …/cases/world/target`;
    `case=base-symlink-owner-only OK`.
13. Verified clean: `inside-tree-symlink: tree_gone=true victim_keep=true`;
    `top-level-symlink: tree_gone=true victim_keep=true`.
14. Verified clean: `case=missing-cwd SETTLED status=-2 spawnError=spawn /usr/bin/prlimit ENOENT
    waited_ms=62`.
15. Coverage: `grep -c "chmod\|setfacl" scripts/gate-mutants.mjs` → `0`; selftest confirm cases are
    `check('k43-confirmation-same-names-agrees', confirmKill(firstKill, sameKill, 1), …)` on literal
    objects at lines 909-910.
