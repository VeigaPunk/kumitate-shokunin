# ScoutS127Live — round 59 / w1

Axes: operability, coverage. Item: fetch the raw GitHub file for ext-tasks `b3d28ace` `tasks.md`, sha256 it, and compare to pin S127 `5fc22b9b5ff248703927c69855f751a061c2d6170f4dc3923204452f859f91a5`. Quote both hashes. Score revision `5469c0a58d7986ff8a5f203938ae1c8785a92213` (this item does not name the base). Access: local `2026-10-24T21:40:41-0300`, UTC `2026-10-25T00:40:41Z`. GitHub `date` on the raw response: `Sun, 25 Oct 2026 00:40:41 GMT`.

**Item result: CORROBORATED.** The live sha256 equals the pin. This is not a claim verdict. It does not attest REPAIR59 or DOCTRINE59.

## Both hashes

Live `sha256sum` of the short-prefix raw body (`raw-short.body`), exit 0:

```text
5fc22b9b5ff248703927c69855f751a061c2d6170f4dc3923204452f859f91a5  raw-short.body
```

Pin S127, the hash named in the item and the only S127 row in `.ufo/pins/source-captures.json` at `5469c0a58d7986ff8a5f203938ae1c8785a92213`:

```text
5fc22b9b5ff248703927c69855f751a061c2d6170f4dc3923204452f859f91a5
```

They are equal. `wc -c` printed `34156`, which is the pin `bytes` field. Python `hashlib.sha256` on the same bytes printed `match=True`.

## What was fetched

The S127 row at that revision cites:

```text
https://github.com/modelcontextprotocol/ext-tasks/blob/b3d28aceaa6d49f5f92258e3d06b61ad6f111e84/specification/2026-07-28/tasks.md
```

The raw URL for that path at the prefix the item names:

```text
https://raw.githubusercontent.com/modelcontextprotocol/ext-tasks/b3d28ace/specification/2026-07-28/tasks.md
```

`curl -fsSL` wrote that response to `.ufo/waves/round-59/build/ScoutS127Live/raw-short.body` (the seat evidence directory, not `/tmp` — the write boundary forbids leaving the only copy outside this seat). Exit `0`. `curl -w` printed `http_code=200`, `size_download=34156`, `num_redirects=0`, `content_type=text/plain; charset=utf-8`, and the same URL as `url_effective`. The body starts with `---`, line 5 is `# Tasks`, NUL count 0, CR count 0.

Two sibling fetches of the same path were byte-identical (`cmp` exit 0) and hashed to the same digest:

- full hash, no redirect: `https://raw.githubusercontent.com/modelcontextprotocol/ext-tasks/b3d28aceaa6d49f5f92258e3d06b61ad6f111e84/specification/2026-07-28/tasks.md`
- `https://github.com/modelcontextprotocol/ext-tasks/raw/b3d28aceaa6d49f5f92258e3d06b61ad6f111e84/specification/2026-07-28/tasks.md`, which returned `HTTP/2 302` with `location` equal to that full-hash raw URL, then `HTTP/2 200` `text/plain`

`sha256sum` of all three bodies:

```text
5fc22b9b5ff248703927c69855f751a061c2d6170f4dc3923204452f859f91a5  raw-short.body
5fc22b9b5ff248703927c69855f751a061c2d6170f4dc3923204452f859f91a5  raw-full.body
5fc22b9b5ff248703927c69855f751a061c2d6170f4dc3923204452f859f91a5  github-raw.body
```

`cmp` of `raw-short.body` against the pinned capture `.ufo/waves/round-59/build/ScoutMcpTasks/body.md` exited 0.

## Prefix and blob identity

`GET https://api.github.com/repos/modelcontextprotocol/ext-tasks/commits/b3d28ace` exited 0, HTTP 200, and printed `sha b3d28aceaa6d49f5f92258e3d06b61ad6f111e84`. That is the full hash on the S127 row. This response does not show an ambiguous prefix.

Contents API `specification/2026-07-28/tasks.md?ref=b3d28ace` exited 0 and printed `type=file`, `size=34156`, git blob `sha=f312d47dda3cf5939307cf182d53c8670448f10a`, `download_url` equal to the short-prefix raw URL. Base64-decoded content was 34156 bytes, sha256 `5fc22b9b5ff248703927c69855f751a061c2d6170f4dc3923204452f859f91a5`, and equal to `raw-short.body`.

That git blob sha is also what local git printed for the committed capture:

```text
f312d47dda3cf5939307cf182d53c8670448f10a
f312d47dda3cf5939307cf182d53c8670448f10a
```

First line is `git hash-object` of the working-tree capture. Second is `git rev-parse 5469c0a58d7986ff8a5f203938ae1c8785a92213:.ufo/waves/round-59/build/ScoutMcpTasks/body.md`. `git rev-parse HEAD` printed the same score revision. `git status --porcelain` on the pin file, the capture, and `corpus/SOURCES.md` printed nothing.

## What this does not show

The commit `b3d28aceaa6d49f5f92258e3d06b61ad6f111e84` is not a commit that edits `tasks.md`. The API printed `files_in_commit 1`, `tasks_md_in_this_commit_diff 0`, committer date `2026-10-20T23:40:57Z`, first message line `docs: use -32021 for Missing Required Client Capability in the overview (#35)`. The pin is the file in that tree, not a claim that this commit changed the spec.

The raw `etag` `c5e285a447b6b1f157c91d6ef9198d7866e0ff15a8c7860cdd67e699740204db` is a cache etag. It is not the git blob sha `f312d47dda3cf5939307cf182d53c8670448f10a`.

A hash match does not re-score C2 and does not say the located quote is still the operational clause an orchestrator must implement. That quote check is another seat.

## Evidence and scope

Command output is under `.ufo/waves/round-59/build/ScoutS127Live/`. Primary files: `raw-short.body`, `sha256sum.txt`, `compare.txt`, `wc-c.txt`, `raw-short.curl-w.txt`, `api-commit-sha.txt`, `contents-meta.txt`, `git-identity.txt`, `date-utc.txt`, `date-local.txt`, `header-dates.txt`.

No production file, pin, corpus file, lane ledger, jj state, or Git index was changed. No commit, push, dispatch, install, or pacman transaction. Writes were this report and that evidence directory.

Report: .ufo/waves/round-59/w1/ScoutS127Live.md
