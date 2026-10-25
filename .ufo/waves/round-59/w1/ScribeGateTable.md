# ScribeGateTable — round 59 / w1

Item: from `corpus/lessons/round-59.md` Gate table, copy the three located quotes and count words in each. Each must be ≤25. Quote the three counts. Do not edit the lesson. Axes: operability, coverage. Measured 2026-10-24T21:42:09-0300.

**Item result: CORROBORATED.** This is not a claim verdict. It does not attest REPAIR59 or DOCTRINE59.

The three counts, whitespace words, the word field `wc -w` printed:

- S125: **11**
- S127: **12**
- S136: **4**

Each is ≤25.

## Quotes copied

Quote column only. Header cell is `quote (≤25 words, located this round)`. Data rows are lines 11–13. Three rows, ids S125, S127, S136, no others. Each cell has one padding space on each side. Stripping that padding does not change the word count.

S125, 11 words:

> Every client request carries the io.modelcontextprotocol/protocolVersion and io.modelcontextprotocol/clientCapabilities fields in _meta

S127, 12 words:

> A server MUST NOT return CreateTaskResult until the task is durably created

S136, 4 words:

> initialize ハンドシェイクと Mcp-Session-Id が仕様から削除された

Whitespace tokens:

- S125: `Every` `client` `request` `carries` `the` `io.modelcontextprotocol/protocolVersion` `and` `io.modelcontextprotocol/clientCapabilities` `fields` `in` `_meta`
- S127: `A` `server` `MUST` `NOT` `return` `CreateTaskResult` `until` `the` `task` `is` `durably` `created`
- S136: `initialize` `ハンドシェイクと` `Mcp-Session-Id` `が仕様から削除された`

## Word count — observed

`wc -l -w -m -c` exited 0. Stderr was empty. Session locale was `LANG=en_US.UTF-8` with `LC_ALL` empty. The word field is the same under `LC_ALL=C`.

```text
=== LC_ALL=C wc -l -w -m -c ===
  1  11 136 136 /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-59/build/ScribeGateTable/quote-S125.txt
  1  12  76  76 /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-59/build/ScribeGateTable/quote-S127.txt
  1   4  82  82 /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-59/build/ScribeGateTable/quote-S136.txt
  3  27 294 294 total
=== locale wc -l -w -m -c ===
  1  11 136 136 /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-59/build/ScribeGateTable/quote-S125.txt
  1  12  76  76 /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-59/build/ScribeGateTable/quote-S127.txt
  1   4  46  82 /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-59/build/ScribeGateTable/quote-S136.txt
  3  27 258 294 total
```

The locale run changes only the character field of S136 (46 characters, 82 bytes). It does not change the word field. `awk` NF printed `11`, `12`, and `4`. Python `split()` printed the same three lengths. Those are the counts.

## Bytes the counts were taken from

HEAD and the score revision are the same commit. `git rev-parse HEAD` and `git rev-parse 5469c0a58d7986ff8a5f203938ae1c8785a92213` both printed `5469c0a58d7986ff8a5f203938ae1c8785a92213`, exit 0, stderr empty. `git cat-file -t` printed `commit`. `git merge-base --is-ancestor` exited 0.

`git show 5469c0a58d7986ff8a5f203938ae1c8785a92213:corpus/lessons/round-59.md` exited 0, stderr empty. That blob and the working-tree lesson are the same file:

```text
8ce1bb64701c04123628dad7146aaf1058e219f599fa45445ac3898be5da1133  lesson-at-rev.md
8ce1bb64701c04123628dad7146aaf1058e219f599fa45445ac3898be5da1133  corpus/lessons/round-59.md
```

`cmp` of those two copies exited 0. The lesson is 51 lines, 5182 bytes. Gate heading is line 7. Header is line 9. Separator is line 10. Data rows are lines 11–13. The table ends before the blank line 14. `git grep -F` at that revision finds each quote once, on those three lines, exit 0, stderr empty.

The lesson was not edited. Digest before the extract and after the last read is `8ce1bb64701c04123628dad7146aaf1058e219f599fa45445ac3898be5da1133`. `08-lesson-sha-unchanged.exit` is 0. `14-lesson-sha-final.exit` is 1 only because that `sha256sum` line used an absolute path; the digest field compared alone is `hash_only_cmp=0`.

Copied quote files match the round's receipt files, including the trailing LF. `cmp` exited 0 for each. This is identity with the filed receipts, not a fresh location in the captures. This seat did not open the captures.

```text
7a248183c670eadcd765225727d606a009313b53303868f9ce19ad9e2218a573  quote-s125.txt
979e492a081e2f25086086ebf3162ecbcdd57d7ab2acd604ce078401811e6dde  quote-s127.txt
2edb8ce1a4ffad88ce8fb1fb72635e5ce04251cb1aa5fe8a476800f188291ff9  quote-s136.txt
```

Last byte of each copied file is `0x0a`.

## Attacks that do not falsify

Counting the whole markdown row, not the quote cell, fails the bound for two rows. Python `split()` on the row text printed `whole_row_ws_words=36` for S125 and `30` for S127. S136's row is 20. The item asks for the located quotes. Those are the quote column, not the decision cell and not the `old → new` cell. Padding spaces are not words: raw-cell and stripped-cell counts are 11, 12, and 4.

A split that breaks `.` and `/` still leaves S125 at 15 tokens (`io` `modelcontextprotocol` `protocolVersion`, and the same shape for `clientCapabilities`). S127 stays 12. Counting each CJK character as its own word, and keeping `Mcp-Session-Id` as one Latin token, leaves S136 at 20. Splitting that identifier on hyphens and keeping each Japanese run intact leaves 6. All of those are still ≤25. None of them is the count used here. The count used here is the whitespace count `wc` printed.

`04-extract.stdout` ends with `endswith_nl=False`. That print searched for the two characters backslash and n. It is not a byte fact. `12-newline-and-rawcell.stdout` printed `endswith_newline=True` and `last_byte=0x0a` for all three files, and `wc -l` printed 1 for each.

## Evidence and scope

Command output is under `.ufo/waves/round-59/build/ScribeGateTable/`. `commands.md` is the index. Primary captures: `04-extract.stdout`, `05-wc.stdout`, `06-awk.stdout`, `07-receipt-cmp.stdout`, `09-git-grep-s125.stdout`, `10-git-grep-s127.stdout`, `11-git-grep-s136.stdout`, `12-newline-and-rawcell.stdout`, `15-hash-only.stdout`.

This seat copied and counted the Gate-table quote cells. It did not run `repair59-probe.mjs` or `doctrine59-probe.mjs`, and it did not re-fetch or re-strip the source pages. No production file, lane ledger, corpus file, pin, jj state, or Git index was changed. Writes were confined to this report and `build/ScribeGateTable/`. No install, pacman transaction, commit, push, dispatch, or mutating git/jj command was used.

Report: .ufo/waves/round-59/w1/ScribeGateTable.md
