# ScribeGateTable evidence index

Measured 2026-10-24T21:42:09-0300. Lane `kumitate-shokunin`. Score revision `5469c0a58d7986ff8a5f203938ae1c8785a92213`. Lesson not edited.

Primary captures:

- `00-date.stdout` — measurement clock
- `02-head.stdout` — `git rev-parse HEAD` printed the score revision, exit 0
- `02-rev-parse.stdout` — `git rev-parse 5469c0a58d7986ff8a5f203938ae1c8785a92213`, exit 0
- `02-cat-file.stdout` — `commit`
- `02-ancestor.exit` — `git merge-base --is-ancestor` exit 0
- `03-git-show.exit` — `git show REV:corpus/lessons/round-59.md` exit 0, stderr empty; body is `lesson-at-rev.md`
- `03-sha-rev-vs-worktree.stdout` — both copies sha256 `8ce1bb64701c04123628dad7146aaf1058e219f599fa45445ac3898be5da1133`
- `03-cmp-rev-vs-worktree.exit` — 0
- `04-extract.stdout` — Gate table parse, quote cells, whitespace / CJK-char / punct counts, receipt sha256 match. Exit 0, stderr empty. The `endswith_nl=False` lines in the WRITTEN block are a bad print (literal backslash-n). Do not use them. See `12-newline-and-rawcell.stdout`.
- `quote-S125.txt` `quote-S127.txt` `quote-S136.txt` — quote cell plus one LF
- `row-S125.txt` `row-S127.txt` `row-S136.txt` — full table rows
- `05-wc.stdout` — `wc -l -w -m -c` under `LC_ALL=C` and the session locale. Word fields 11, 12, 4. Exit 0, stderr empty.
- `05-locale.stdout` — `LANG=en_US.UTF-8`, `LC_ALL` empty
- `06-awk.stdout` — awk NF 11, 12, 4. Exit 0
- `07-receipt-cmp.stdout` — extracted quotes match `receipts/quote-s125.txt`, `quote-s127.txt`, `quote-s136.txt`. cmp exits 0.
- `09-git-grep-s125.stdout` `10-git-grep-s127.stdout` `11-git-grep-s136.stdout` — each quote once, lines 11–13, exit 0
- `12-newline-and-rawcell.stdout` — last byte `0x0a`; raw cell and stripped cell have the same word count
- `13-exits.stdout` — listed commands exit 0, stderr 0 bytes
- `01-lesson-sha-before.stdout` `08-lesson-sha-after.stdout` — same digest, `08-lesson-sha-unchanged.exit` is 0
- `14-lesson-sha-final.exit` is 1 only because that `sha256sum` printed an absolute path. `15-hash-only.stdout` records `hash_only_cmp=0` on the digest field alone.
