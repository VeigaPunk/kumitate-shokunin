RESULT SweepS066S070 rev=516977af verdict=clean rows=5 defects=0

Anti-loop re-open of SOURCES.md rows S066–S070 at 516977af2216b1cc426ee970d260dee53714bf4f.
Admission quotes: corpus/lessons/round-45.md ## Gate table lines 31–35 (`git grep S06x 516977af… -- corpus/lessons/`).
All five rows are status `mined` (no rejected rows; step 5 n/a). Sources fetched via curl, official raw hosts only.

ROW S066 verdict=holds — jj-vcs/jj v0.45.1 docs/git-compatibility.md
- `curl https://raw.githubusercontent.com/jj-vcs/jj/v0.45.1/docs/git-compatibility.md` → HTTP 200, 12284 B, sha256 0fb71f992b0ed05d547e597d3f5f1cd33ed9e5d56a4e4e4cb851ba30c766c641 = row pin.
- `git ls-remote` → refs/tags/v0.45.1 = 7c41cdeb16b6b321c64e789a966b6adf723816a5 = row pin.
- Gate quote "Jujutsu will import and export from and to the Git repo on every `jj` command automatically." — verbatim in fetched bytes :104-106 (line-wrap aside).
- teaches: staging-area-ignored (:48-51 "The staging area will be ignored"), 'import git refs' operation (:119-121), detached HEAD (:114-115 "usually put the Git repo in a \"detached HEAD\" state"), misplaced branch pointers (:168-169 "a branch pointer ending up in the wrong place") — every clause sits in the cited anchors.
- Host `jj --version` → "jj 0.45.1-7c41cdeb…" matches scope "(host jj 0.45.1)".

ROW S067 verdict=holds — jj-vcs/jj v0.45.1 docs/working-copy.md
- `curl …/docs/working-copy.md` → HTTP 200, 6019 B, sha256 20578df094781b9a3a24a33be318ee2810b6686e3886ea13f997c5a20275e4ea = row pin; same tag pin as S066.
- Gate quote "You can have multiple working copies backed by a single repo." — verbatim at :76.
- teaches: auto-commit of working-copy changes (:9-12), new file committed on next `jj st` (:14-17; "@" = working-copy revision shorthand), snapshot.auto-track (:19-20), ignored files never auto-tracked (:63-71), stale working copy after rewrite from another workspace (:95-98, :107-110) — all in anchors.

ROW S068 verdict=holds — can1357/oh-my-pi @45c35e40 (v18.12.6)
- 5 files fetched via raw.githubusercontent.com @45c35e40c46166dc726ccc52f5d27f40f2449f99, all HTTP 200; settings.ts sha256 47e04d38… = pin, lib.rs 6f7b1b97… = pin. `git ls-remote` → refs/tags/v18.12.6 = 45c35e40 = pin.
- Gate quote "a private, frozen repo" (worktree.ts:677-678) — verbatim only after stripping `//` comment leaders (not contiguous under whitespace-only; matches round-45-verifier-spotcheck.md:55 ruling "comment leader is source syntax, not a word").
- teaches: task.isolation.enabled default false (settings.ts:26-36, default:false); Linux order Btrfs,Zfs,LinuxReflink,Overlayfs,Rcopy (lib.rs:139-145 LINUX_AUTO_ORDER); rcopy = `git worktree add --detach` (rcopy.rs:1-4) + detached metadata (worktree.ts:674-679); merge patch|branch default patch (settings.ts:161-177, isolation-runner mergeMode :600-604); failed captures retain workspace (isolation-runner.ts:413-423,568-579 retainIsolationWorkspace).
- Scope note "host ~/.omp/agent/config.yml has no isolation key": file exists but contents are operator-owned/read-prohibited by contract — unverifiable by this seat, not counted as defect.

ROW S069 verdict=holds — containers/bubblewrap v0.13.1 bwrap.xml
- `curl https://raw.githubusercontent.com/containers/bubblewrap/v0.13.1/bwrap.xml` → HTTP 200, 33289 B, sha256 2cb77df2f4be0b2a0302bb2f0a260fdb4d9e1299b76481ea66ed34c40f5be1da = row pin.
- `git ls-remote` → refs/tags/v0.13.1^{} = 362936aea0d5c6e70f7af75d2d44b5a914cb4ba2 = row pin (annotated tag).
- Gate quote "bwrap is running a minimal pid 1 process" — verbatim at :62-63 only after stripping `<command>` tag (split `bwrap</command>\n  is running…`; matches spotcheck :56 ruling "markup, no intervening word").
- teaches: --clearenv excepts PWD and later --setenv (:231-235); minimal pid 1 reaps zombies (:62-66); --die-with-parent SIGKILLs sandbox incl. when bwrap itself dies (:587-592 "when bwrap or bwrap's parent dies") — all in anchors. Host `bwrap --version` → "bubblewrap 0.13.1" matches scope.

ROW S070 verdict=holds — containers/bubblewrap bubblewrap.c @362936ae
- `curl raw …/362936aea0d5c6e70f7af75d2d44b5a914cb4ba2/bubblewrap.c` → HTTP 200, 114986 B, sha256 de141c805cb88f8faff9af1b3bb49098191fc67833b51b51fea84510ea4426ce = row pin; commit = v0.13.1^{} per ls-remote above.
- Gate quote "We have to have a pid 1 in the pid namespace, because otherwise we'll get a bunch of zombies as nothing reaps them." (:3481-3484) — verbatim only after stripping `*` comment leaders, same clause as S068 ruling.
- teaches: xclearenv call on --clearenv at :2490 (def in utils.c:315-319 `clearenv()` — same commit, fetched for confirmation; edits bwrap's environ before execvp); forked pid-1 reaper at :3487-3495, never execs; execvp of command at :3555; pid-1's exec-time env = launcher's, hence /proc/1/environ readable — consistent with anchors; the file's own source comments support the mechanism.

Sweep-wide: 5/5 quotes verbatim in fetched bytes under the stated match methods; 5/5 sha256 pins reproduce; 3/3 tag/commit pins resolve; no teaches clause goes beyond its quote or anchor bytes; no rejected rows. No defects found.

Tooling: none installed (curl, git, sha256sum, sed, grep, wc already present; pacman paused per directive).
