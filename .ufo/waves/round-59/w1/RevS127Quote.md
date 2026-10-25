# RevS127Quote — round 59 / w1

Item: open `.ufo/waves/round-59/build/ScoutMcpTasks/body.md` and `.ufo/waves/round-59/receipts/quote-s127.txt`. Confirm the quote occurs in the markdown and is at most 25 words. Quote it. Axes: operability, coverage. Date: 2026-10-24.

**Item result: CORROBORATED.** This is not a claim verdict. It does not attest REPAIR59 or DOCTRINE59.

Quote:

> A server MUST NOT return CreateTaskResult until the task is durably created

Word count: **12**, which is at most 25. `wc -w` printed `1 12 76`. `awk` printed `awk_words=12`. Python `split()` printed the same 12 tokens.

## Where it occurs

It is not a raw byte substring of the markdown. The check printed `literal_occurrences=0` and `RESULT raw_byte_substring=False`.

It does occur once the inline markdown markers are removed (`**`, then backticks, then a leftover `*`). That pass printed `marker_stripped_occurrences=1`, `word_seq_hits=1`, `word_seq_hit line=300 token_offset=0`. The raw span that strips to the quote, and only that span, is:

```text
A server **MUST NOT** return `CreateTaskResult` until the task is durably created
```

`span_strips_to_quote=True`. The next raw character is a space, then an em dash. The quote is a contiguous prefix of line 300, not a paraphrase and not the whole sentence. The rest of that sentence is "that is, until a `tasks/get` for the returned `taskId` would resolve."

Two other lines contain both `MUST NOT` and `CreateTaskResult` and are not this quote. Line 61 continues "to a client that did not include the extension capability". Line 102 is about `resultType`, not durable creation. The 12-word sequence hits only line 300.

The raw-byte miss does not falsify the item. The markers are markdown syntax around the same words. Treating them as different words would make this located quote un-citable and would not add a source the entry does not already have. The HTML twin of this seat is specified as tag-stripped; the same reading here is marker-stripped. That reading is the one corroborated.

## Revision binding

`git rev-parse HEAD` and `git rev-parse 5469c0a58d7986ff8a5f203938ae1c8785a92213` both printed `5469c0a58d7986ff8a5f203938ae1c8785a92213`. This item does not name the base. Both paths are tracked at that revision (`git ls-files`). `git hash-object` equals `git rev-parse REV:path` for each file (`6b64a90b4ea968bb4b6a4b8bea50fa6ffa62c903` for the quote, `f312d47dda3cf5939307cf182d53c8670448f10a` for the body). `git diff --stat` on those two paths against that revision printed nothing and exited 0. HEAD was not moved.

`sha256sum` printed:

```text
979e492a081e2f25086086ebf3162ecbcdd57d7ab2acd604ce078401811e6dde  .ufo/waves/round-59/receipts/quote-s127.txt
5fc22b9b5ff248703927c69855f751a061c2d6170f4dc3923204452f859f91a5  .ufo/waves/round-59/build/ScoutMcpTasks/body.md
```

The quote file is 76 bytes, one line, trailing LF, no CR, no NUL. The body is 911 lines, 34156 bytes.

## Evidence and scope

Command output is under `.ufo/waves/round-59/build/RevS127Quote/`. Primary captures: `check.txt`, `wc-quote.txt`, `awk-words.txt`, `sha256sum.txt`, `blob-identity.txt`, `near-miss-lines.txt`, `commands.md`.

This seat only compared the quote file to the markdown capture. It did not run `repair59-probe.mjs`, `doctrine59-probe.mjs`, or a live fetch. No production file, lane ledger, corpus file, pin, jj state, or Git index was changed. Writes were confined to this report and `build/RevS127Quote/`. No install, pacman transaction, commit, push, or mutating git/jj command was used.

Report: .ufo/waves/round-59/w1/RevS127Quote.md
