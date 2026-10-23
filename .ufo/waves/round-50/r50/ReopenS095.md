REOPEN50: HOLD source=https://raw.githubusercontent.com/containers/bubblewrap/v0.13.1/bwrap.xml sha256=2cb77df2f4be0b2a0302bb2f0a260fdb4d9e1299b76481ea66ed34c40f5be1da fetched=2026-10-23

Re-opened the pinned bubblewrap v0.13.1 manual. The fetched body SHA-256 matches S095's expected digest exactly; no content drift. The filesystem semantics still support the claim:

- bwrap.xml:260-263: “Filesystem related options. These are all operations that modify the filesystem directly, or mounts stuff in the filesystem. These are applied in the order they are given as arguments.”
- bwrap.xml:301-302: “Bind mount the host path SRC on DEST”; bwrap.xml:319-320 says `--ro-bind` binds the host path “readonly”.
- bwrap.xml:416-418: `--tmpfs DEST` — “Mount new tmpfs on DEST.”

Locator caveat: the S095 row's cited bwrap.xml:253-255 is actually the `--sync-fd` entry, not filesystem ordering; 295-312 includes `--bind` but not `--ro-bind`; 410-416 ends at the opening `--tmpfs` term and omits its description. The corrected locations above are in the same unchanged body. HOLD is the content verdict, not an endorsement of those stale/mislocated line anchors.
