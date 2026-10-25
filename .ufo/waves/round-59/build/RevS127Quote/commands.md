cwd: /home/vgpnk/Projects/shokunin/kumitate-shokunin
ran-at: 2026-10-24T21:33:14-03:00 (date -Iseconds, ran-at.txt)

Inputs (score rev 5469c0a58d7986ff8a5f203938ae1c8785a92213; working tree matches):
  .ufo/waves/round-59/receipts/quote-s127.txt
  .ufo/waves/round-59/build/ScoutMcpTasks/body.md

Commands and captures:
  date -Iseconds                                          ran-at.txt
  git rev-parse HEAD                                      head.txt
  git rev-parse 5469c0a58d7986ff8a5f203938ae1c8785a92213   score-rev.txt
  sha256sum the two inputs                                sha256sum.txt
  wc -l -w -c quote-s127.txt                              wc-quote.txt
  wc -l -w -c body.md                                     wc-body.txt
  python3 occurrence/word-count check                     check.txt
  awk 'END{print NF}' quote-s127.txt                      awk-words.txt
  git rev-parse REV:path ; git hash-object ; git diff --stat   blob-identity.txt
  git ls-files / check-ignore / cat-file -e               git-identity.txt ls-files.txt
  python3 print of lines 61, 102, 300                     near-miss-lines.txt

Quoted result is check.txt. literal_occurrences=0. marker-stripped and word-sequence hits=1, line 300. word_count=12.
