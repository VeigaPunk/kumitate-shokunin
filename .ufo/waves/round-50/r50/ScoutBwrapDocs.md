# ScoutBwrapDocs — S095 man-page sentences

Pinned body: `/fast/scratch/hyaku/kumitate-r47/seats/w1-ScribeBwrapBind/bwrap-v0.13.1.xml`
sha256 `2cb77df2f4be0b2a0302bb2f0a260fdb4d9e1299b76481ea66ed34c40f5be1da` (matches S095, `corpus/SOURCES.md:108`). Tag v0.13.1 = `362936aea0d5c6e70f7af75d2d44b5a914cb4ba2`. No re-fetch this seat; quotes are from those pinned bytes. No tools installed.

S095 anchors: `bwrap.xml:253-255`, `:295-312`, `:410-416`.

## Quotes (≤25 words)

| claim | in the S095 anchors? | quote | words | locator |
|---|---|---|---|---|
| (b) options apply in argument order | yes | These are applied in the order they are given as arguments. | 11 | bwrap.xml:254 |
| (b) what that sentence governs | yes | These are all operations that modify the filesystem directly, or mounts stuff in the filesystem. | 15 | bwrap.xml:253-254 |
| (a) binds are recursive | no sentence | Bind mount the host path SRC on DEST. | 8 | bwrap.xml:296 |
| (a) read-only twin, still not recursive | no | Bind mount the host path SRC readonly on DEST. | 9 | bwrap.xml:312 |
| (c) mount-point overlay (later mount hides earlier) | no sentence in the anchors | — | — | — |
| nearest general rule, outside the anchors | no | When options are used multiple times, the last option wins, unless otherwise specified. | 13 | bwrap.xml:73-74 |
| nearest mount-point sentence, outside the anchors; it denies recursion | no | It works only on the specified mount point, without changing any other mount point under the specified path | 18 | bwrap.xml:320 (`--remount-ro`) |
| tmpfs, no overlay claim | yes | Mount new tmpfs on DEST. | 5 | bwrap.xml:412 |

## (a) Recursive binds

The word recursive/recursively does not occur in `bwrap.xml` (grep of the pinned body). `--bind` / `--ro-bind` / `--dev-bind` inside `:295-312` only say "Bind mount the host path SRC on DEST" (and "readonly" / "allowing device access"). That does not establish recursion.

The only nearby man sentence about submounts is the opposite, and it is not in the S095 anchor: `--remount-ro` at `:320` works only on the specified mount point and does not change mount points under that path.

Same tag, not the manual (bubblewrap.c at v0.13.1):

- `bubblewrap.c:935-936` — "We always bind directories recursively, otherwise this would let us access files that are otherwise covered on the host" (19 words). Next line passes `BIND_RECURSIVE`.
- `bind-mount.h:27` — `BIND_RECURSIVE = (1 << 3)`.
- `bind-mount.c:429` and `:458` — `recursive` selects `MS_REC` on the bind `mount()`.

So recursion is an implementation fact at this tag, not a sentence in the S095 man-page spans.

## (b) Argument order

Established inside the anchor. Verbatim `:252-255`:

```
Filesystem related options. These are all operations that modify the filesystem directly, or
mounts stuff in the filesystem. These are applied in the order they are given as arguments.
```

## (c) Mount-point overlay, and two options on one path

No sentence in `:253-255`, `:295-312`, or `:410-416` says a later filesystem option covers, replaces, or hides an earlier mount on the same path. `--tmpfs` (`:412-416`) only describes a new tmpfs plus `--perms` / `--size`.

Same-path statement in the manual: none that names a destination. The closest is `:73-74` ("the last option wins"), which is outside the S095 anchors and does not say "two mounts of the same path". It is a general repeated-option rule, not a mount-overlay rule. Argument order (`:254`) says operations are applied in order; the masking corollary is not written there.

The S095 teaches cell (`SOURCES.md:108`) states that corollary as if it were the manual: "Filesystem operations apply in argument order, so `--tmpfs /tmp` masks a host fixture unless its path is explicitly bound afterward." That "so …" clause is not a sentence in `bwrap.xml`. Round-47 `falsify/ReopenS095.md` already recorded it as derived, not verbatim.

Same tag, code only (not a man-page quote): `bubblewrap.c:1119-1120` — "After having covered dest_fd with a mount, we need to re-open it to work on the new mount." That is the implementation saying a mount covers the destination fd. It is not in S095.

## Confidence

High that (b) is verbatim at `:254`, and that (a) and a same-path overlay rule are absent from the pinned manual and from the three S095 anchors. High that recursion and dest-covering exist in bubblewrap.c at the same tag; those are not man-page sentences.
