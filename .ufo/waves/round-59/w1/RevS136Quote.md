# RevS136Quote — round 59, wave 1

- Axes: operability, coverage.
- Seat: reviewer. This report is not a claim verdict and does not re-score C1 or C2.
- Capture opened: `.ufo/waves/round-59/build/ScoutZenn/body.html`. Receipt opened: `.ufo/waves/round-59/receipts/quote-s136.txt`.
- Outcome: **corroborated** for the named item. The receipt sentence occurs once in the visible page text, and it is 4 words (≤25).

## Quote

`initialize ハンドシェイクと Mcp-Session-Id が仕様から削除された`

Whitespace tokens: `initialize`, `ハンドシェイクと`, `Mcp-Session-Id`, `が仕様から削除された`.

## What was measured

Page text means the capture with `script` and `style` elements dropped, tags replaced by a single space, HTML entities decoded, and whitespace collapsed. That is steps 3–5 of `.ufo/waves/round-45/probe/normalize.py.txt`, which is the lane's tag-strip procedure (QUALITY Q49). It is not a raw byte search.

`sha256sum` of the two opened files, exit 0:

```text
2edb8ce1a4ffad88ce8fb1fb72635e5ce04251cb1aa5fe8a476800f188291ff9  .ufo/waves/round-59/receipts/quote-s136.txt
64fd5551c7357e2ca4d65deac37dfa8b60050cc1fcfb16df83929501d97395b5  .ufo/waves/round-59/build/ScoutZenn/body.html
```

Those digests are the S136 quote receipt named in `corpus/knowledge/mcp-orchestration-contract.md` and the S136 capture pin (194763 bytes). The receipt bytes are 82, ending in one newline. `repr` is `b'initialize \xe3\x83\x8f...\xe3\x81\x9f\n'`.

`wc -w -m -c -l` on the receipt, exit 0. Second field is words:

```text
--- LC_ALL=C ---
 1  4 82 82 .../receipts/quote-s136.txt
--- locale ---
 1  4 46 82 .../receipts/quote-s136.txt
```

4 ≤ 25. A stricter bound that counts each CJK character as its own word plus the two Latin tokens is 20, still ≤25. The item's word count is the whitespace count `wc` printed.

Visible page-text search, exit 0:

```text
raw_needle_count 2
raw_offset 26762
raw_window ...変わった。<code>initialize</code>ハンドシェイクと<code>Mcp-Session-Id</code>が仕様から削除された</li> <li da
raw_offset 106685
raw_window ...de\u003einitialize\u003c/code\u003eハンドシェイクと\u003ccode\u003eMcp-Session-Id\u003c/code\u003eが仕様から削除された\u003c/li\u0
visible_page_text_count 1
visible_offset 622
visible_context ...モデルに変わった。 initialize ハンドシェイクと Mcp-Session-Id が仕様から削除された 状態が必要な処理は、サーバーが発行する「ハンドル」をクライアントが引数として持
words 4
le_25 True
```

The one visible hit is the conclusion list item (`body.html` line 93, raw offset 26762). The markup has no spaces around the code tokens; the receipt's spaces are the tag-to-space substitution of `<code>` and `</code>`. After that substitution the sentence is the receipt, in order, once.

## Attacks that did not fire

- Word count above 25: `wc` printed 4.
- Quote absent from page text: visible count is 1, inside the article conclusion, not in chrome.
- Receipt or capture swapped: both sha256 values match the pins named above.
- A second article sentence: the other raw hit (offset 106685) is a `\u003c`-escaped copy of the same `<li>` inside a script payload. Dropping `script` leaves count 1. The full-file round-45 normalizer, which also JSON-unescapes, finds the sentence twice (offsets 4854 and 20077) with the same context; that second hit is the escaped copy, not a second page sentence.

## Boundary, not a miss

A raw contiguous search of the receipt string in `body.html` returns 0. Text-node concatenation with no space inserted at tag boundaries also returns 0 for the spaced receipt, and 1 for the same characters with those spaces removed. The item asks for page text, not a byte substring of the markup. The same split (normalized hit, raw miss) is the S122 location class. It does not remove the occurrence measured above.

## Evidence and scope

Under `.ufo/waves/round-59/build/RevS136Quote/`:

- `01-sha256sum.stdout.txt` (stderr empty)
- `02-wc.stdout.txt`
- `03-normalized.txt` — `python3 .ufo/waves/round-45/probe/normalize.py.txt` on the capture, exit 0, 64269 bytes
- `04-locate.stdout.txt` — normalized count 2, article steps-3–5 count 1, raw contiguous count 0
- `05-visible.stdout.txt` — visible page-text count 1, words 4, exit 0

No production file, pin, Git/jj state, or other seat file was changed. No commit, push, dispatch, or install.

Report: .ufo/waves/round-59/w1/RevS136Quote.md
