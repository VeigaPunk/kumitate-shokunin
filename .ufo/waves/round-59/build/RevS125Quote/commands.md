# RevS125Quote evidence index

Lane-relative. Each command file is the command; `.stdout`, `.stderr`, and `.exit` are the capture.

- `00-identity.txt` — clock, Python, `git rev-parse HEAD`
- `01-wc.*` — `wc -w` on `receipts/quote-s125.txt`
- `02-sha256.*` — `sha256sum` of the quote file and `build/ScoutMcpArch/body.html`
- `03-strip.command` / `strip.py` / `03-strip.*` — HTMLParser tag-strip; writes `stripped-primary.txt`, `stripped-visible.txt`, `stripped-boundary-spaced.txt`
- `04-refind.*` — independent `str.find` / `str.count` on those three texts
- `05-raw-window.*` — raw HTML window, regex tag-strip cross-check, punctuation split
- `06-git-blob.*` — `git cat-file -e` of both paths at HEAD
- `07-stripped-sha.*` — `sha256sum` of the three stripped texts
- `08-other-needles.*` — the other two raw prefixes, which do not survive tag-strip
- `09-git-show-sha.*` — `git show <rev>:path | sha256sum` versus working-tree hashes
- `10-page-sentence.*` — word count of the page sentence cut at `connection state.`
- `11-word-diff.*` — why boundary-spacing counts 29 tokens against 28
