# L1 annotation — S095 locator verification

S095 body opened again at `https://raw.githubusercontent.com/containers/bubblewrap/v0.13.1/bwrap.xml`; observed `sha256sum` was `2cb77df2f4be0b2a0302bb2f0a260fdb4d9e1299b76481ea66ed34c40f5be1da`, matching the pinned row.

The exact source-line search on that body (`grep` against the raw URL) returned:

- `bwrap.xml:253-255` — “Filesystem related options… These are applied in the order they are given as arguments.”
- `bwrap.xml:295-312` — includes `--bind` (“Bind mount the host path SRC on DEST”) and `--ro-bind` (“Bind mount the host path SRC readonly on DEST”).
- `bwrap.xml:410-416` — includes `--tmpfs DEST` and “Mount new tmpfs on DEST.”

These are the locators already present in `corpus/SOURCES.md` S095. The locator caveat in `r50/ReopenS095.md:5-9` and the contrary locator claim in `r50/RevReopen.md` are not supported by this exact line search: the S095 row's existing anchor triplet is accurate. The **HOLD** body-content verdict and its hash are unaffected; do not rewrite S095's anchor cell. This annotation preserves the seat reports as authored and resolves their locator disagreement against the fetched bytes.
