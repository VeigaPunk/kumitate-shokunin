RESULT XChanS068 rev=6b2a4517 verdict=defect channels=4 verbatim=no version_ok=yes pins=reproduce unsupported=0

Gate, corpus/lessons/round-45.md:33 (file sha256 c33c2809df286b11622220376f6ac826e5df3a13bdf4145f9ea028421b08e947): "a private, frozen repo" (`task/worktree.ts:677-678`, 4). `printf '%s' 'a private, frozen repo' | wc -w` printed 4.

Channels. The row URL serves the commit it names. Version 18.12.6 is that commit.

1. Installed omp. `command -v omp` is /home/vgpnk/.local/bin/omp, an ELF with the sources inside a bunfs bundle, not a separate package directory. `omp --version` printed omp/18.12.6. Binary sha256 85d9daf3a05fc76e8cd425ae1904eb576af8d21cc85fcf4690742626e07ccfa4. The bytes contain the marker 18.12.6 and do not contain 45c35e40 (0 hits).

2. GitHub blobs at 45c35e40c46166dc726ccc52f5d27f40f2449f99. Commit API: that sha, 2026-10-21T20:49:59Z, message "chore: bump version to 18.12.6". Tag list: v18.12.6 is that sha. packages/coding-agent/package.json version is 18.12.6. settings.ts sha256 47e04d3878de54e31ae3b73edcb628a0622a37a5dc49bb102d6567d2dfc777ac (19001 bytes). worktree.ts sha256 1adba7ba4dfd5ff85ad5d9fcec862acd05871735a6c8faa302d10999af56761f. lib.rs sha256 6f7b1b97f884c06fadb7c10e309f84d470eb1414ec8c14897688ef984beed438.

3. Row URL, fetched once. curl of https://github.com/can1357/oh-my-pi/tree/45c35e40c46166dc726ccc52f5d27f40f2449f99 returned HTTP/2 200, 669191 bytes, sha256 dda7f60d13a1008e6d7b72f3d50edf619d148072d89f8987e30a86bd5ba75778. Title: GitHub - can1357/oh-my-pi at 45c35e40c46166dc726ccc52f5d27f40f2449f99. The body has 45c35e40 (218 times), 18.12.6 (0), and the quote (0). The page does not print the version string. The tag and package.json tie that commit to 18.12.6.

4. npm registry. `npm view` of unscoped oh-my-pi and omp is a different project (0.2.0 and 1.0.0). The document for @oh-my-pi/pi-coding-agent/18.12.6 has version 18.12.6, gitHead absent, repository git+https://github.com/can1357/oh-my-pi.git, directory packages/coding-agent. The tarball's settings.ts and worktree.ts sha256 match channel 2 exactly.

Quote, normalizing only guillemets, apostrophes, and whitespace.

Installed binary: MISSING. 0 hits for "a private, frozen repo" and 0 for "frozen repo". The 57 "frozen" hits are lockfile flags, tab state, and word lists. The bundle does keep the setting object: id "task.isolation.enabled", default false, description "Allow per-task isolation with `isolated: true`; tasks without it run in the shared checkout". The comment was dropped.

GitHub worktree.ts and the npm copy (same bytes): MISSING as a contiguous string. An exact search is false. Collapsing whitespace is still false, because the next line's comment leader sits in the gap. Line 677 is "\t\t\t// parallel task branches. Detaching gives each isolation a private," and line 678 is "\t\t\t// frozen repo that still borrows the source object DB via alternates." Stripping a leading // is not an allowed normalization; doing it would make the four words contiguous. Row URL HTML: MISSING.

Locality. Those four words are on worktree.ts lines 677-678, inside ensureIsolation, which the row cites as 648-716. The gate's line pair is the right place. The string is not contiguous there.

Pins reproduce. settings.ts sha256 equals the row's 47e04d3878de54e31ae3b73edcb628a0622a37a5dc49bb102d6567d2dfc777ac. lib.rs sha256 equals the row's 6f7b1b97f884c06fadb7c10e309f84d470eb1414ec8c14897688ef984beed438. Read from the fetched files: settings.ts 26-36 is cfgTaskIsolationEnabled, line 30 `default: false`. Lines 161-177 are task.isolation.merge, values patch and branch, line 166 `default: "patch"`. worktree.ts 648-716 is ensureIsolation through cleanupIsolation. isolation-runner.ts 397-600 retains the workspace when a capture fails; 625-631 is the merge note (patch apply, or cherry-pick in branch mode). lib.rs 3-4 is the PAL header; 139-145 is LINUX_AUTO_ORDER btrfs, zfs, LinuxReflink, overlayfs, rcopy; 397-408 is resolve(). rcopy.rs 1-13 says `git worktree add --detach <merged> HEAD`, and lines 83-85 pass those arguments. PAL as_str for LinuxReflink is "linux-reflink"; the setting value is "reflink".

Entry sentences. Entry file sha256 a3a7ce3b340b9984f01a13c1aa5fde36fbf3847d68f920cd1d0573ac75d81d61.

Source line and verified-at ("omp/18.12.6 = oh-my-pi 45c35e40"): supported. Tag v18.12.6 is that commit, the package version is 18.12.6, and omp --version prints omp/18.12.6.

Host-facts sentence: supported for the S068 clause. settings.ts:30 is `default: false`. Line 35 says tasks without it run in the shared checkout. The config.yml clause is the entry's host note; this seat did not open ~/.omp/agent.

M4 sentence: supported as a mechanism. rcopy.rs:4 and the argv at 83-85 are `git worktree add --detach`. Lines 679-680 then call detachSubmodules and detachGitDir. The four quoted words are the comment on 677-678, split by //. The comment says a linked-worktree pointer would share the source HEAD, index, and ref namespace, which is why the harness detaches. That is the "not a seat boundary" fragment.

Closing sentence: supported. The Linux auto order is btrfs, zfs, reflink (setting name; PAL string linux-reflink), overlayfs, rcopy. `isolated: true` is the opt-in named on settings.ts:35, and the setting defaults to false. The installed bundle also has "Subagent isolated execution requires task.isolation.enabled; it is currently false."

unsupported=0. No tool was installed. The quote fails the allowed normalization in every channel, so verbatim=no and the gate quote is the defect. pgrep on this scratch path printed no process.
