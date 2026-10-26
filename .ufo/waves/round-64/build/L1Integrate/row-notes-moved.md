Round-64 row notes (K64ExecRowsDraft) — the recheck commands and the S067 reuse, kept out of the recheck cells:

- S198 recheck: `curl -fsSL 'https://docs.jj-vcs.dev/v0.46.0/technical/concurrency/' | grep -c -F 'The most important piece in the lock-free design'` -> 1 (ran 2026-10-25); `cmp` of `https://docs.jj-vcs.dev/v0.46.0/technical/concurrency/` against `latest` -> identical (48988 bytes both).
- S199 recheck: `curl -fsSL 'https://firefox-source-docs.mozilla.org/contributing/jujutsu.html' | grep -c -F 'A workspace becomes stale when a commit it depends on is rewritten from another workspace'` -> 1 (ran 2026-10-25).
- S200 recheck: `curl -fsSL 'https://docs.jj-vcs.dev/v0.46.0/working-copy/' | grep -c -F 'jj workspace remove'` -> 1 (ran 2026-10-25); `jj workspace --help | grep -c '^  remove'` -> 0 on host jj 0.45.1 (the delta is v0.46.0-only).
- S200 is the v0.46.0 rendering of the page S067 pins at v0.45.1 (same document, newer version, a different URL and scope: the `remove` paragraph exists only here); the entry's version-skew sentence is grounded on S067 (raw v0.45.1 `docs/working-copy.md`, opened 2026-10-23). S067 is named in the entry's prose as the version-pinned counterpart and is NOT on its `source:` line, because J64 J2 requires every cited row to be opened 2026-10-25.
- Staged S259 and S270 are not appended: S259 duplicates S067's whole scope (same document, moving `latest` URL, less pinnable than the v0.45.1 tag), and S270's forget-versus-remove distinction is carried by S200's delta scope alone.




