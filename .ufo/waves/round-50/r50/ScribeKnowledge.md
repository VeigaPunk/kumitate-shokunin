# ScribeKnowledge — draft only

Axes: operability, coverage. No product or corpus knowledge file was changed; this report is the only output. The proposed entry below is 13 lines (within the 120-line limit) for the L1 to land.

## Proposed `corpus/knowledge/mount-order-and-bind-scope.md`

```markdown
source: S095 https://raw.githubusercontent.com/containers/bubblewrap/v0.13.1/bwrap.xml (bwrap 0.13.1, tag 362936aea0d5c6e70f7af75d2d44b5a914cb4ba2); S099 https://man7.org/linux/man-pages/man5/proc_pid_mountinfo.5.html (man-pages 6.19); own-work: scripts/cap-run.mjs (sha256 64fafb421a5fd70ff17383d9f8c9eaf51be23b66816773b609eb9b8082e3b672; inspected lines 124-133, 187-192 on 2026-10-23)
verified-at: 2026-10-23 (host bubblewrap 0.13.1; cap-run.mjs digest above)
recheck: on bubblewrap release, reopen S095; after any cap-run mount-order or bind-validation change, run the guard/isolation checks at the committed revision and inspect `/proc/self/mountinfo` inside the child (field 5 is the mount point, S099)

# Mount order and bind scope

Bubblewrap filesystem actions apply in argv order (S095). A later mount at a path can cover an earlier one. In cap-run, `--tmpfs /tmp` is followed by caller `--bind` actions, so binding `/tmp` itself afterward re-exposes host `/tmp` read-write and defeats that tmpfs mask.

Refuse binds of the whole sandbox-managed mount point, not every path sharing its prefix: reject `/tmp` itself after canonicalizing the source with `realpath` and resolving the destination, while allowing a legitimate existing subdirectory such as `/tmp/job-123` to be bound. Apply the refusal to both source and destination so a caller cannot punch the entire mount point through from either side.

Read `/proc/self/mountinfo` from inside the child whose namespace is being checked; parse field 5 (the fifth whitespace-delimited field) as the mount point (S099). Compare requested and observed mount points, accounting for mountinfo path escapes. A mount row proves a mount point is present, not that its bytes are the requested source; absence of an extra bind row also does not prove a path is invisible, because the recursive root bind can leave it readable. Check visibility, contents, and writability separately where those are the property under test.

Evidence: `.ufo/waves/round-49/r49/ScoutCapRunVisibility.md:47-49,78` observed that `--bind /tmp` passed and exposed host `/tmp` as `xfs rw` (40905 entries), while the unbound `/tmp` was an empty tmpfs; a dropped bind on a path already under the recursive root stayed readable but lost its writable mount. `.ufo/waves/round-50/probe/bindguard50-probe.mjs:10-15,22-23` freezes G50 arms for refusing the whole `/tmp` mount point, allowing a legitimate subdirectory bind while retaining tmpfs isolation, and preserving isolation without a bind. These G50 lines specify acceptance checks; they are not evidence that the counter was run or passed.
```

## Provenance and inspection record

- Read `corpus/SOURCES.md:108` (S095: bwrap v0.13.1 filesystem operation order; source body sha256 `2cb77df2f4be0b2a0302bb2f0a260fdb4d9e1299b76481ea66ed34c40f5be1da`) and `:112` (S099: process namespace mount records and field 5; body sha256 `27a0e5ad5cf9fc4ef4059cd0c4a9b70fa2ac23457a4d39b82f2381a654b3813f`).
- Read current `scripts/cap-run.mjs:124-133,187-192`; current bytes reject `p === '/tmp'` as well as `/`, `/proc`, `/sys`, `/dev`, `/run`, and append caller binds after the tmpfs actions. `sha256sum scripts/cap-run.mjs` output: `64fafb421a5fd70ff17383d9f8c9eaf51be23b66816773b609eb9b8082e3b672`.
- Read `ScoutCapRunVisibility.md:43-49,78` and frozen `bindguard50-probe.mjs:7-27`. Hashes from `sha256sum`: probe `a9e79600d8849d947f0074b6f2964c17611b40a324afb9c5793ea7f212b61dc3`; r49 finding `2dfdb57a330cea1523a9deb21883bcd66d2bd804fbe7a60bca203bf2e376b1b8`.
- Exact hash command run from `/home/vgpnk/Projects/shokunin`: `sha256sum /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/cap-run.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-50/probe/bindguard50-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-49/r49/ScoutCapRunVisibility.md`; outputs are recorded above. No builds, tests, probes, installs, or repo mutations were performed.
