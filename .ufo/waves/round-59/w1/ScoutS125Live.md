# ScoutS125Live — round 59 / w1

Item: `curl -fsSL https://modelcontextprotocol.io/docs/2026-07-28/learn/architecture` to a temp file, sha256 it, and compare to pin S125 sha256 `3f5cdc194aab7f1e15ecc255030fa42522e24341beaf7328ce71161cfa2963ca`. Quote both hashes and whether they match. Record the access date. Axes: operability, coverage. Access 2026-10-24T21:40:17-03:00.

**Item result: CORROBORATED.** This is not a claim verdict. The live body SHA-256 equals the named pin S125 SHA-256.

Live hash:

```text
3f5cdc194aab7f1e15ecc255030fa42522e24341beaf7328ce71161cfa2963ca
```

Pin S125 hash:

```text
3f5cdc194aab7f1e15ecc255030fa42522e24341beaf7328ce71161cfa2963ca
```

Match: **yes**.

## Access date

Written immediately before and after the primary curl. Both files are the same instant. Stderr of the curl was empty. Exit 0.

```text
2026-10-24T21:40:17-03:00
```

UTC of that instant, `date -u`:

```text
2026-10-25T00:40:17+00:00
```

Local calendar date is 2026-10-24. UTC calendar date is 2026-10-25. The pin object's `captured` field is the date `2026-10-24` with no clock. Do not collapse these.

## Primary command — observed

Command, stdout redirected to `/tmp/scouts125live.WMuhPk/architecture`:

```text
curl -fsSL https://modelcontextprotocol.io/docs/2026-07-28/learn/architecture
```

Exit 0. Stderr empty. `sha256sum` of that temp file:

```text
3f5cdc194aab7f1e15ecc255030fa42522e24341beaf7328ce71161cfa2963ca  /tmp/scouts125live.WMuhPk/architecture
```

`wc -c`:

```text
688587 /tmp/scouts125live.WMuhPk/architecture
```

The evidence copy `live.body` re-hashed to the same digest. The temp path is not the pin path.

String compare of the live digest to the named pin:

```text
named_pin=3f5cdc194aab7f1e15ecc255030fa42522e24341beaf7328ce71161cfa2963ca
live=3f5cdc194aab7f1e15ecc255030fa42522e24341beaf7328ce71161cfa2963ca
MATCH yes
```

## Pin binding at the score revision

`git show 5469c0a58d7986ff8a5f203938ae1c8785a92213:.ufo/pins/source-captures.json` exited 0. The S125 object in that blob:

```text
{
  "bytes": 688587,
  "captured": "2026-10-24",
  "path": ".ufo/waves/round-59/build/ScoutMcpArch/body.html",
  "sha256": "3f5cdc194aab7f1e15ecc255030fa42522e24341beaf7328ce71161cfa2963ca",
  "sourceId": "S125"
}
```

`git grep` of the named hash at that revision, stderr empty:

```text
5469c0a58d7986ff8a5f203938ae1c8785a92213:.ufo/pins/source-captures.json:119:      "sha256": "3f5cdc194aab7f1e15ecc255030fa42522e24341beaf7328ce71161cfa2963ca",
```

The named hash is the S125 field at the score revision, not only the item text. The pin's byte count, 688587, equals the live `wc -c`.

Read-only `sha256sum` of the pin path (not an input to the curl):

```text
3f5cdc194aab7f1e15ecc255030fa42522e24341beaf7328ce71161cfa2963ca  /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-59/build/ScoutMcpArch/body.html
```

`git show` of that path at the score revision exited 0. `sha256sum` of the shown blob is the same digest. `cmp` of the live body against the temp file, against the pin-path file, and against the shown blob all exited 0 (byte-identical).

Identity taken from the live body, not from the pin file: title `Architecture overview - Model Context Protocol`; canonical `https://modelcontextprotocol.io/docs/2026-07-28/learn/architecture`; `protocolVersion` occurs. The `nul=no` line in `07-identity.stdout` is not evidence. That probe searched for the four characters `\x00`, not a NUL byte. The title, canonical, and `protocolVersion` lines are the ones used.

## Second fetch — not the hashed body

A later request recorded headers. It is not the primary body. It also hashed to the pin, so the match is not a single-connection accident. Exit 0. Stderr empty.

```text
http_code=200
url_effective=https://modelcontextprotocol.io/docs/2026-07-28/learn/architecture
size_download=688587
content_type=text/html; charset=utf-8
num_redirects=0
redirect_url=
```

Header lines from that response, CRLF stripped in this quote:

```text
HTTP/2 200
age: 23820
cf-cache-status: HIT
content-type: text/html; charset=utf-8
date: Sun, 25 Oct 2026 00:40:46 GMT
etag: W/"nqhhwe0p4ger3h"
x-vercel-cache: MISS
```

That `date` is 29 seconds after the primary UTC clock. It is the second response's server date, not the primary access date. Cloudflare served a cached object (`HIT`, age 23820). This seat did not bypass cache. The primary curl did not record headers, so those cache headers are not attached to the hashed body. Byte match is observed. An origin re-render at access time is not.

## What this does not say

The live URL still serves the pinned S125 bytes, which is the operability check the item named and a coverage check that the architecture page has not drifted from the pin. It does not admit a source, re-score coverage, or hold a claim. This seat did not run `repair59-probe.mjs` or `doctrine59-probe.mjs`, and it does not attest REPAIR59 or DOCTRINE59.

No production file, lane ledger, corpus file, pin, jj state, or Git index was changed. `git show` and `git grep` were read-only. Writes were confined to this report and `.ufo/waves/round-59/build/ScoutS125Live/`. No install, pacman transaction, commit, push, dispatch, or mutating git/jj command was used.

## Evidence

Command, stdout, stderr, and exit captures are under `.ufo/waves/round-59/build/ScoutS125Live/`. `commands.md` is the index. Primary captures: `live.sha256.txt`, `live.bytes.txt`, `curl.exit`, `04-compare.stdout`, `pin-at-rev.s125.txt`, `pin-grep.txt`, `05-cmp.stdout`, `06-committed.sha256.txt`, `08-curl-w.stdout`.

Report: .ufo/waves/round-59/w1/ScoutS125Live.md
