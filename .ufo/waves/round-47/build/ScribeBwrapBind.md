RESULT ScribeBwrapBind rev=cac43009 verdict=OPENED row=S095
| S095 | bubblewrap 0.13.1 manual — https://raw.githubusercontent.com/containers/bubblewrap/v0.13.1/bwrap.xml | docs | A | bubblewrap filesystem action semantics: read-write and read-only binds, tmpfs, and operation order | bwrap.xml:253-255, 295-312, 410-416 at tag v0.13.1 = 362936aea0d5c6e70f7af75d2d44b5a914cb4ba2; body sha256 2cb77df2f4be0b2a0302bb2f0a260fdb4d9e1299b76481ea66ed34c40f5be1da; fetched 2026-10-23 (seat ScribeBwrapBind) | `--bind SRC DEST` exposes a host path read-write, unlike read-only `--ro-bind`; `--tmpfs DEST` mounts a new tmpfs. Filesystem operations apply in argument order, so `--tmpfs /tmp` masks a host fixture unless its path is explicitly bound afterward. | mined | 2026-10-23 | on-release | scripts/cap-run.mjs, scripts/cap-spawn.mjs, corpus/lessons/round-47.md |

## Gate
URL: https://raw.githubusercontent.com/containers/bubblewrap/v0.13.1/bwrap.xml
Access date: 2026-10-23. Opened the raw upstream manual bytes with curl; tag v0.13.1 resolves to 362936aea0d5c6e70f7af75d2d44b5a914cb4ba2 (also recorded in existing S069).
Quote: “These are applied in the order they are given as arguments.” Locator: bwrap.xml:253-254.
Word-count command: `printf '%s' 'These are applied in the order they are given as arguments.' | wc -w` → `11`.

## Evidence
- Fetch command: `set -eu; d=/fast/scratch/hyaku/kumitate-r47/seats/w1-ScribeBwrapBind; mkdir -p "$d"; curl -sSL --fail --max-filesize 1048576 -o "$d/bwrap-v0.13.1.xml" https://raw.githubusercontent.com/containers/bubblewrap/v0.13.1/bwrap.xml; wc -c "$d/bwrap-v0.13.1.xml"; sha256sum "$d/bwrap-v0.13.1.xml"`.
- Output: `33289 /fast/scratch/hyaku/kumitate-r47/seats/w1-ScribeBwrapBind/bwrap-v0.13.1.xml`; SHA-256 `2cb77df2f4be0b2a0302bb2f0a260fdb4d9e1299b76481ea66ed34c40f5be1da`.
- Search tool call: `functions.grep(pattern="^\\| S069 \\|", path="/home/vgpnk/Projects/shokunin/kumitate-shokunin/corpus/SOURCES.md")` returned the existing S069 row. It covers environment options, PID namespace reaping, and `--die-with-parent`, not mount action semantics; S095 does not repeat its teaching.
- Search tool call: `functions.grep(pattern="^\\| S095 \\|", path="/home/vgpnk/Projects/shokunin/kumitate-shokunin/corpus/SOURCES.md")` → no matches found. Draft row is included above; the registry itself remains unchanged.
- Process check: `pgrep -af '[w]1-ScribeBwrapBind' || true` → no output.

## Behavior and findings
The draft distinguishes host binds from read-only binds and records filesystem action ordering as the basis for binding a host fixture after a tmpfs mounted at `/tmp`. Tier A is scoped to the primary upstream manual. The fetched body hash matches S069's recorded bytes; S095 adds different scope and anchors.

## Gates and touched surfaces
Source opened and quote locator/word count recorded. No counter, gate, or product test was run; none is claimed passed. Only this report file was written; `corpus/SOURCES.md` was read-only.

## Out of scope
No changes to C1 routing, runner code, lessons, registry, or other lane files. No tools installed.

Artifact: `.ufo/waves/round-47/build/ScribeBwrapBind.md`
