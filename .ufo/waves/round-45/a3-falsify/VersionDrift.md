RESULT VersionDrift rev=6b2a4517 verdict=current drifted=none omp_mapping=verified

No recheck trigger fires. The host is still on every release named in the committed header. The omp equality holds: the installed binary is the published linux-x64 build of tag v18.12.6, and that tag is commit 45c35e40c46166dc726ccc52f5d27f40f2449f99.

Judged text: `git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin show 6b2a45178c72a4565bb9d98e09f4c36b95ca1521:corpus/knowledge/agent-isolation-substrates.md` lines 2-3. verified-at 2026-10-23 pins host git 2.56.0, jj 0.45.1-7c41cdeb, bubblewrap 0.13.1, systemd 262, node v24.21.0, omp/18.12.6 = oh-my-pi 45c35e40. recheck fires only on a release of git, jj, bubblewrap, systemd, node or omp. man-pages is not in that list.

Host commands, observed 2026-10-23T06:50:45Z:

- `git --version` → `git version 2.56.0`. `pacman -Q git` → `git 2.56.0-1`. Same release. No tag v2.56.1 or v2.57.0 (`git ls-remote --tags https://github.com/git/git` those two refs empty; v2.56.0 is 2478544319491bbd2a42cc57a83e3d2f4730a280).
- `jj --version` → `jj 0.45.1-7c41cdeb16b6b321c64e789a966b6adf723816a5`. The header's `7c41cdeb` is the first 8 hex digits of that same commit, not a different build. `git ls-remote https://github.com/jj-vcs/jj.git refs/tags/v0.45.1` → `7c41cdeb16b6b321c64e789a966b6adf723816a5`.
- `bwrap --version` → `bubblewrap 0.13.1`. `pacman -Q bubblewrap` → `bubblewrap 0.13.1-1`. No tag v0.13.2 or v0.14.0. v0.13.1 is 46ec5c413a3c1da265624ddac3a715b4d1bc487d.
- `systemctl --version` first line → `systemd 262 (262-1-arch)`. `pacman -Q systemd` → `systemd 262-1`. The 262 is the upstream version; `262-1-arch` is the Arch package string, not upstream 262.1.
- `node --version` → `v24.21.0`, resolved through fnm to `/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node`. Not a pacman package. No tag v24.21.1.
- `/home/vgpnk/.local/bin/omp --version` → `omp/18.12.6`. Not a pacman package. File mtime 2026-10-21 20:37:24 -0300, size 256702432, sha256 `85d9daf3a05fc76e8cd425ae1904eb576af8d21cc85fcf4690742626e07ccfa4`.
- `pacman -Qi man-pages` → Version `6.19-1`, installed Tue 20 Oct 2026 01:07:12 -03, before verified-at. The header records no man-pages version, and the recheck line does not name it, so this package cannot fire the written trigger.

omp/18.12.6 = 45c35e40, from the package and the tag list:

- `strings` on the binary finds `version: "18.12.6"`, `var p0 = "18.12.6"`, `--user-agent=omp/18.12.6`, and changelog `## [18.12.6] - 2026-10-21`. Count of the substring `45c35e40` in the binary: 0. The commit is not embedded; the version string is.
- GitHub release v18.12.6 asset `omp-linux-x64` size 256702432, digest `sha256:85d9daf3a05fc76e8cd425ae1904eb576af8d21cc85fcf4690742626e07ccfa4`. Equal to the installed file. Published 2026-10-21T21:02:53Z. `target_commitish` is the branch name `main`, not a commit id.
- Downloaded `SHA256SUMS.txt` sha256 `72ebc3d92054d3a2e8edafc1acf593ea685e609672b031084459f525a2fc64e5` (matches that asset's API digest). Line 8: `85d9daf3a05fc76e8cd425ae1904eb576af8d21cc85fcf4690742626e07ccfa4  omp-linux-x64`.
- `git ls-remote https://github.com/can1357/oh-my-pi refs/tags/v18.12.6` → `45c35e40c46166dc726ccc52f5d27f40f2449f99`. The refs API says object type `commit` (lightweight tag, not a tag object aimed somewhere else).
- That commit's committer date is 2026-10-21T20:49:59Z. First message line: `chore: bump version to 18.12.6`.
- `packages/coding-agent/package.json` at that commit, line 3, quote `"version": "18.12.6",` (2 words). File sha256 `83c96c5097f69c0b6f13b7fb9a9b940d7f9078136154518243746765628d057b`. Package name `@oh-my-pi/pi-coding-agent`. The root `package.json` at the same commit catalogs the `@oh-my-pi/*` workspace packages at 18.12.6.
- Tag list has v18.12.0 through v18.12.6 and no v18.12.7 or v18.13 through v18.19. v18.12.6 is the newest omp release tag found.

Upstream tags that are newer than the host, all dated before verified-at, and not installed. They do not change the host version strings, so they do not fire the trigger:

- node v24.22.0, annotated tag, tagger date 2026-10-14T14:16:35Z, message `2026-10-14 Node.js v24.22.0 Krypton (LTS) Release`. Host remains v24.21.0.
- systemd v262.1, annotated tag, tagger date 2026-10-16T21:51:12Z, message `systemd-stable v262.1`. Host remains systemd 262.
- jj v0.46.0, lightweight tag, commit 7d382314f9420b4b8d932245b49c99492c812b9f, committer date 2026-10-07T20:44:45Z, message `release: 0.46.0`. Host remains 0.45.1-7c41cdeb16b6b321c64e789a966b6adf723816a5.

No tool was installed or updated for this check.
