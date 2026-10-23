RESULT ScribeS079Cgroup rev=516977af verdict=admit words=20 sha256=a9433bb0e16a67f07a93424c7bf842f47616e9b0a27b51e17d7b34cff246b7ad tag=v7.2

## Behavior and finding

S079 is an authoritative kernel-documentation source for the narrow C2 point: under `memory.max`, if a cgroup's memory usage reaches the limit and cannot be reduced, the OOM killer is invoked in that cgroup. The source directly states this; no inference about the runner's implementation or observed behavior is made.

Host/tag command:

```sh
uname -r && git ls-remote --tags --refs https://github.com/torvalds/linux 'refs/tags/v7.2*'
```

Observed output:

```text
7.2.11-arch1-1
237a1c39e8dfd3e1c6f1f023eea37a48ec04cc63	refs/tags/v7.2
728e68a889bcf257b1e67298b12c360e5c3a13e0	refs/tags/v7.2-rc1
4c45e14df2f4e77982ad70d6d8e3fe750edd4c37	refs/tags/v7.2-rc2
1137d8b5df06137fb49513cc923b3b24d94cb809	refs/tags/v7.2-rc3
6946cd5d0aa4dd10a414ddcb7a10844fdb0ad345	refs/tags/v7.2-rc4
a8e429896436e8c2d288181f875f92af8204bc58	refs/tags/v7.2-rc5
d7dd96eb916519208210bb4a0408fcf4f7fdce5d	refs/tags/v7.2-rc6
2ee859ebf156157609f71060ae472711c8cbc326	refs/tags/v7.2-rc7
```

The host reports 7.2.11-arch1-1; the requested `torvalds/linux` tag search returned v7.2 and its release candidates, but no v7.2.11 tag. Used nearest available mainline tag v7.2 (commit `237a1c39e8dfd3e1c6f1f023eea37a48ec04cc63`).

Fetched both source bodies on 2026-10-23 with this bounded command (exit 0; outputs below):

```sh
mkdir -p /fast/scratch/hyaku/kumitate-r46/seats/w1-ScribeS079Cgroup && timeout 120 curl --fail --location --silent --show-error --max-filesize 2000000 'https://raw.githubusercontent.com/torvalds/linux/v7.2/Documentation/admin-guide/cgroup-v2.rst' -o /fast/scratch/hyaku/kumitate-r46/seats/w1-ScribeS079Cgroup/cgroup-v2-v7.2.rst && timeout 120 curl --fail --location --silent --show-error --max-filesize 2000000 'https://docs.kernel.org/admin-guide/cgroup-v2.html' -o /fast/scratch/hyaku/kumitate-r46/seats/w1-ScribeS079Cgroup/cgroup-v2-docs.html && sha256sum /fast/scratch/hyaku/kumitate-r46/seats/w1-ScribeS079Cgroup/cgroup-v2-v7.2.rst /fast/scratch/hyaku/kumitate-r46/seats/w1-ScribeS079Cgroup/cgroup-v2-docs.html && wc -c /fast/scratch/hyaku/kumitate-r46/seats/w1-ScribeS079Cgroup/cgroup-v2-v7.2.rst /fast/scratch/hyaku/kumitate-r46/seats/w1-ScribeS079Cgroup/cgroup-v2-docs.html
```

```text
a9433bb0e16a67f07a93424c7bf842f47616e9b0a27b51e17d7b34cff246b7ad  /fast/scratch/hyaku/kumitate-r46/seats/w1-ScribeS079Cgroup/cgroup-v2-v7.2.rst
b478c1bae99899df476d6b4989cbb516f7ca93c5f009cdff64b802bbc24f3d4b  /fast/scratch/hyaku/kumitate-r46/seats/w1-ScribeS079Cgroup/cgroup-v2-docs.html
133236 /fast/scratch/hyaku/kumitate-r46/seats/w1-ScribeS079Cgroup/cgroup-v2-v7.2.rst
172967 /fast/scratch/hyaku/kumitate-r46/seats/w1-ScribeS079Cgroup/cgroup-v2-docs.html
306203 total
```

Primary locator and exact raw-file text (`Documentation/admin-guide/cgroup-v2.rst`, tag v7.2, lines 1376-1384):

```text
1376:  memory.max
1380:        Memory usage hard limit.  This is the main mechanism to limit
1381:        memory usage of a cgroup.  If a cgroup's memory usage reaches
1382:        this limit and can't be reduced, the OOM killer is invoked in
1383:        the cgroup. Under certain circumstances, the usage may go
```

Quote used (lines 1381-1383): “If a cgroup's memory usage reaches this limit and can't be reduced, the OOM killer is invoked in the cgroup.” Count command and observed result:

```sh
printf '%s' "If a cgroup's memory usage reaches this limit and can't be reduced, the OOM killer is invoked in the cgroup." | wc -w
20
```

Comparison source `https://docs.kernel.org/admin-guide/cgroup-v2.html` was also opened. Its fetched HTML body SHA-256 is `b478c1bae99899df476d6b4989cbb516f7ca93c5f009cdff64b802bbc24f3d4b`; lines 1294-1300 show the same `memory.max` behavior (HTML uses typographic apostrophes in “cgroup’s” and “can’t”). The quote and row below are grounded in the pinned raw file, not the moving comparison page.

## Draft SOURCES row

`| S079 | Linux kernel cgroup v2 admin guide, tag v7.2 — https://raw.githubusercontent.com/torvalds/linux/v7.2/Documentation/admin-guide/cgroup-v2.rst | docs | A | cgroup v2 memory.max behavior when its limit is reached and usage cannot be reduced | Documentation/admin-guide/cgroup-v2.rst:1381-1383 under memory.max @ tag v7.2 (commit 237a1c39e8dfd3e1c6f1f023eea37a48ec04cc63); file sha256 a9433bb0e16a67f07a93424c7bf842f47616e9b0a27b51e17d7b34cff246b7ad; opened 2026-10-23 | If a cgroup's memory usage reaches the memory.max limit and can't be reduced, the OOM killer is invoked in the cgroup | queued | 2026-10-23 | on-release | — |`

`queued` / `—` is deliberate: this is a draft; no existing knowledge entry cites S079 and `corpus/lessons/round-46.md` did not exist when inspected. Do not mark it mined until an actual used-by path is landed.

## Draft lesson `## Gate` line

`- S079 — https://raw.githubusercontent.com/torvalds/linux/v7.2/Documentation/admin-guide/cgroup-v2.rst (opened 2026-10-23); Documentation/admin-guide/cgroup-v2.rst:1381-1383 @ tag v7.2: “If a cgroup's memory usage reaches this limit and can't be reduced, the OOM killer is invoked in the cgroup.”`

## Gates, touched surfaces, limits

- Gate: admitted as a faithful, locator-pinned source for the quoted kernel-doc statement; quote is 20 words. The docs.kernel.org comparison agrees.
- No C1/C2 code, frozen counter, selftest, build, or operability claim was run or assessed by this source-only item. No optional `memory.events` quote/row was drafted.
- Only affected lane surface written: this report. `SOURCES.md`, the lesson, and product files remain unchanged. No tool installed or updated.
- Cleanup check used the exact command `printf '%s' "If a cgroup's memory usage reaches this limit and can't be reduced, the OOM killer is invoked in the cgroup." | wc -w; p=$(printf '/fast/scratch/hyaku/kumitate-r46/seats/w1-%s/' 'ScribeS079Cgroup'); pgrep -af "$p" || true`; observed output was `20` and no process matches.

Artifact: `.ufo/waves/round-46/build/ScribeS079Cgroup.md`
