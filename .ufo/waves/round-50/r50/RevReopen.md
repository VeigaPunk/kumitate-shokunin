# RevReopen — independent verification of both r50 re-open receipts

Seat: KumitateR50.RevReopen (reviewer) · Date: 2026-10-23 · Lane rev: 6927903f99bbc26e397aa47387aa76950f42b3a5
Method: my own fetches + hashes + raw exact-line reads, independent of the scribe seats; receipts then checked against that ground truth.

## 1. Independent fetch and hash (ground truth)

```sh
curl -sS -o $T/bwrap.xml   https://raw.githubusercontent.com/containers/bubblewrap/v0.13.1/bwrap.xml
curl -sS -o $T/strace.1.in https://raw.githubusercontent.com/strace/strace/v7.2/doc/strace.1.in
sha256sum $T/bwrap.xml $T/strace.1.in
```
```text
2cb77df2f4be0b2a0302bb2f0a260fdb4d9e1299b76481ea66ed34c40f5be1da  bwrap.xml    (681 lines)
c16859e07dacc5cda882c7ab5f2e353803645a6ca449a0ac41eda1034e67ae9a  strace.1.in  (2242 lines)
```
Both match the S095/S098 pins exactly. No content drift exists in either source today.

Provenance cross-check (GitHub API `git/refs/tags` + `git/tags` deref):
- `containers/bubblewrap` tag `v0.13.1` is an **annotated** tag: object `46ec5c413a3c1da265624ddac3a715b4d1bc487d` → commit **`362936aea0d5c6e70f7af75d2d44b5a914cb4ba2`** = exactly the commit id pinned in SOURCES.md:108. Chain URL→tag→commit→body-sha256 is fully closed.
- `strace/strace` tag `v7.2` → commit `195ac8ddbf6fad16ff1ff125b0feb725b6c46dcf` (S098 pins no commit id; recorded here for completeness).

## 2. Span verification on the pinned bodies (raw exact-line reads)

S095, `bwrap.xml` (all three row anchors verified verbatim):
- **:253-255** — `<para>` / "Filesystem related options. These are all operations that modify the filesystem directly, or" / "mounts stuff in the filesystem. These are applied in the order they are given as arguments." → the argument-order rule is exactly where the row says it is.
- **:295-312** — `--bind` term :295 + "Bind mount the host path SRC on DEST" :296; `--bind-try` :299-300; `--dev-bind` :303-304; `--dev-bind-try` :307-308; **`--ro-bind` term :311 + "Bind mount the host path SRC readonly on DEST" :312**; `--ro-bind-try` begins :310's varlistentry, term at :315. The rw-vs-ro contrast the row claims is inside the span.
- **:410-416** — `--tmpfs DEST` term :410, listitem :411, "Mount new tmpfs on DEST." :412, mode-0755/size sentences :413-416. Full tmpfs semantics inside the span.

S098, `strace.1.in`:
- **:832-835** — `-a column` / `--columns=column` block; "Aligns return values in a specific column (default column 40)." at :835. ✔
- **:148-158** — unfinished/resumed description :148-154 (`.IR unfinished` :152, `.IR resumed` :154) + `.CW` example :155-158 with both markers (:156 `<unfinished ...>`, :158 `<... select resumed>`). ✔

Caveat (confirmed honest in ScribeReopenS095): bwrap.xml contains **no** verbatim same-path-overlay sentence anywhere (grep for same/already/on top/shadow/overmount/hide finds none in a mount semantics context). The row's "`--tmpfs /tmp` masks … unless bound afterward" is inference from the :254-255 order rule, correctly tiered as mined. No receipt claims a verbatim overlay sentence, so nothing overstates there.

## 3. Receipt-by-receipt verdict

### ReopenS098.md — CONFIRMED, no disagreement
- First nonblank line is exactly the required `REOPEN50: HOLD source=https://raw.githubusercontent.com/strace/strace/v7.2/doc/strace.1.in sha256=c16859e07dacc5cda882c7ab5f2e353803645a6ca449a0ac41eda1034e67ae9a fetched=2026-10-23`.
- Hash matches my fetch byte-for-byte. Span citations are accurate (sentence at :835 inside the quoted span; markers at :152/:154, example :156-158 — the receipt's "lines 156–158" attribution is correct).
- HOLD is the honest verdict. **I agree.**

### ReopenS095.md — content HOLD CONFIRMED, locator caveat REFUTED (explicit disagreement)
- First line matches the required schema; hash matches my fetch; verdict HOLD on content is what my own reads support. On the verdict I agree.
- **But the receipt's "Locator caveat" paragraph is factually wrong about the pinned body**, and its "corrected locations" are themselves mislocated. Since sha256 equality means byte-identical content, line numbers under POSIX counting cannot differ; raw reads of the same digest settle every claim:

| Receipt claim | Raw reality on the 2cb77df2… body |
|---|---|
| "bwrap.xml:253-255 is actually the `--sync-fd` entry" | :253-255 is the filesystem-options/ordering `<para>` (order rule at :254-255). `--sync-fd` is not here. |
| "295-312 includes `--bind` but not `--ro-bind`" | :311-312 IS `--ro-bind` with "readonly" — inside the span. |
| "410-416 ends at the opening `--tmpfs` term and omits its description" | :410-416 includes the term (:410) and the full description (:412-416). |
| Corrected "bwrap.xml:260-263" = order rule | :260-263 is `--perms`/`--size` parent-directory permission prose. |
| Corrected "bwrap.xml:301-302" = `--bind` desc | :301-302 are `</varlistentry>`/`<varlistentry>` boundary lines; the bind description is :296. |
| Corrected "bwrap.xml:319-320" = `--ro-bind` | :319-320 is the `--remount-ro` entry. |
| Corrected "bwrap.xml:416-418" = tmpfs "Mount new tmpfs on DEST." | :416-418 is the tmpfs para tail + `</listitem>`/`</varlistentry>`; the quoted sentence is :412. |

- **Recommendation to the L1: do NOT amend S095's locators per this receipt.** The row's original `bwrap.xml:253-255, 295-312, 410-416` are accurate on the pinned body; adopting the receipt's "corrected" anchors would corrupt a correct row. The receipt's closing line ("HOLD is the content verdict, not an endorsement of those stale/mislocated line anchors") is the overstatement this review exists to catch: it manufactures an anchor defect that does not exist.
- The receipt's hash, format, and content verdict are sound, so the frozen counter's R2-style checks (format + hash) are unaffected; only prose in the receipt is wrong. No repair item is required beyond not acting on the caveat.

## 4. Residual risk / gaps
- raw.githubusercontent serves tag-resolved content at fetch time; a future force-move of a tag would not be caught by re-fetch alone. Mitigated here by the double pin (body sha256 + tag→commit dereference, both verified today). Both rows use `recheck: on-release`, adequate.
- I did not re-open S099 (man-pages mountinfo) — out of this seat's scope (r50 items reopen S095/S098 only).
- No tools installed or updated (curl/sha256sum/GitHub API only); pacman untouched. Zero lane mutations: the only file I wrote is this report.

## Bottom line
- S095: **HOLD** (content) — independently confirmed; receipt accepted, locator caveat **rejected with line-level evidence**.
- S098: **HOLD** — receipt confirmed in full.
