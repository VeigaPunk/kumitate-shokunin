# RevS125Quote — round 59 / w1

Item: open `.ufo/waves/round-59/build/ScoutMcpArch/body.html` and `.ufo/waves/round-59/receipts/quote-s125.txt`. Confirm the quote file's sentence occurs in the tag-stripped HTML and is at most 25 words. Quote the sentence and the word count. Axes: operability, coverage. Measured 2026-10-24T21:34:07-0300.

**Item result: CORROBORATED.** This is not a claim verdict. The quote file's sentence occurs once in the tag-stripped capture, and its word count is 11, which is at most 25.

Sentence, the quote file with its single trailing newline removed:

> Every client request carries the io.modelcontextprotocol/protocolVersion and io.modelcontextprotocol/clientCapabilities fields in _meta

Word count: **11**.

## Word count — observed

`wc -w` exited 0. Stderr was empty. Stdout:

```text
11 /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-59/receipts/quote-s125.txt
```

An independent split of that same sentence printed `words=11` and `le25=True`. The file is 136 bytes, one trailing newline, no other whitespace. SHA-256 `7a248183c670eadcd765225727d606a009313b53303868f9ce19ad9e2218a573`.

Punctuation split (letters and digits only) is 15 tokens: `Every client request carries the io modelcontextprotocol protocolVersion and io modelcontextprotocol clientCapabilities fields in meta`. That attack is still at most 25. It is not the count used here. The count used here is whitespace words, the same split `wc -w` printed.

## Occurrence — observed

Primary tag-strip: HTMLParser text nodes in order, character references decoded, tags not emitted, whitespace runs collapsed to one space. No space was invented at tag boundaries. `python3 .ufo/waves/round-59/build/RevS125Quote/strip.py` exited 0. Stderr was empty. The lines that decide the item:

```text
QUOTE_WORDS 11
QUOTE_WORDS_LE_25 True
RAW_HTML_COUNT 0
PRIMARY_COUNT 1
PRIMARY_OFFSETS 44455
PRIMARY_HIT1_NEXT ','
VISIBLE_COUNT 1
VISIBLE_OFFSETS 23354
VISIBLE_HIT1_NEXT ','
OCCURS_IN_PRIMARY True
AT_MOST_25 True
ITEM HOLD
```

A second command, which only searched the stripped files and did not import `strip.py`, printed the same counts and offsets, and `next12=', and normal'` for both the primary and visible texts. Exit 0, empty stderr.

The hit is not a whitespace-collapse artifact. Six visible text nodes concatenate to the sentence with nothing added or removed:

```text
kind=visible path=div/div/div/div/div/div/div/span text='Every client request carries the '
kind=visible path=div/div/div/div/div/div/span/code text='io.modelcontextprotocol/protocolVersion'
kind=visible path=div/div/div/div/div/div/div/span text=' and '
kind=visible path=div/div/div/div/div/div/span/code text='io.modelcontextprotocol/clientCapabilities'
kind=visible path=div/div/div/div/div/div/div/span text=' fields in '
kind=visible path=div/div/div/div/div/div/span/code text='_meta'
```

Those nodes are `span` / `code`, not `script`. Dropping script, style, and noscript still leaves one hit (visible offset 23354). A regex strip that deletes tags and collapses whitespace also finds the sentence once, next character `,`, at its own offset 41724. Offsets are method-dependent. The count, the sentence, and the following comma are not.

Raw HTML does not contain the sentence as a contiguous string (`RAW_SENTENCE_COUNT 0`). The rendered copy splits the identifiers with `<code>` and adds no word:

```text
Every client request carries the <code>io.modelcontextprotocol/protocolVersion</code> and <code>io.modelcontextprotocol/clientCapabilities</code> fields in <code>_meta</code>, and normally
```

That is why the check is tag-stripped. A raw `grep` of the sentence would miss it.

## Attacks that do not falsify

The prefix `Every client request carries the` occurs three times in the raw capture, at offsets 229868, 555836, and 666378. Only offset 229868 is the rendered sentence. The other two are JSX bundle text (`jsx`, `_components.code`, `children`). Local tag-strip of those windows printed `local_has_sentence=False`. They are not a second occurrence of the quote.

The page sentence that contains the quote does not end at `_meta`. Cut at the unique suffix `connection state.`, the visible strip is 28 whitespace words and starts with the quote. The characters immediately after the quote are `, and normally`. Boundary-spacing prints 29 tokens only because it inserts a space before that comma, splitting `_meta,` into `_meta` and `,`. That inserted space is not in the page. The 28-word page sentence does not change the quote file's 11. The item bounds the quote file's sentence, and that sentence occurs as a located prefix.

A period scan is the wrong end marker here: identifiers contain `.`, and primary tag-strip glues the next sentence to `state.` because the only separator was `</span><span>` (`glue_after='The server a'`). The quote span itself is not glued; its six nodes already contain the spaces.

## Bytes opened

HEAD `5469c0a58d7986ff8a5f203938ae1c8785a92213`, the score revision. `git show` of both paths at that revision, piped to `sha256sum`, matched the working-tree hashes. Stderr empty, exit 0.

```text
quote_blob_sha256=7a248183c670eadcd765225727d606a009313b53303868f9ce19ad9e2218a573
body_blob_sha256=3f5cdc194aab7f1e15ecc255030fa42522e24341beaf7328ce71161cfa2963ca
```

The capture is 688587 bytes. Python 3.14.8. This seat did not re-fetch the URL.

## Evidence and scope

Command, stdout, stderr, and exit captures are under `.ufo/waves/round-59/build/RevS125Quote/`. `commands.md` is the index. Primary captures: `01-wc.stdout`, `03-strip.stdout`, `04-refind.stdout`, `05-raw-window.stdout`, `08-other-needles.stdout`, `09-git-show-sha.stdout`, `10-page-sentence.stdout`.

This seat checked only the named quote against the named capture. It did not run `repair59-probe.mjs` or `doctrine59-probe.mjs`, and it does not attest REPAIR59 or DOCTRINE59. No production file, lane ledger, corpus file, pin, jj state, or Git index was changed. Writes were confined to this report and `build/RevS125Quote/`. No install, pacman transaction, commit, push, dispatch, or mutating git/jj command was used.

Report: .ufo/waves/round-59/w1/RevS125Quote.md
