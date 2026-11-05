# K91ScribeSources — round 91: SOURCES rows for the C1 bounded-external-read claim

Seat: K91ScribeSources (scribe, leaf). Lane `kumitate-shokunin`, round 91 attempt 1, hyaku run 15.
Claim C1 = capability acquisition `receipt-bind` v5 (contract `kumitate-receipt-bind-v5`): bounded
external reads.

Lane detached. **Nothing outside my seat dir was written**: no file under `scripts/`, `corpus/`,
`.ufo/pins/`, `.ufo/waves/round-91/probe/`, `plan.md` or `controls/` was touched; the frozen probe
was never edited, moved or copied. The three new rows (S263-S265) and the two routed corrections were
integrated by the L1 at commit `77ebfe37`; my seat files are the drafts and the evidence behind
them. Node v24.21.0 was already installed — **no tool was installed or upgraded** this seat.

## Deliverables (all under `.ufo/waves/round-91/K91ScribeSources/`)

| file | what it is |
|---|---|
| `rows.md` | the three new registry rows in the exact 11-field schema (S263 fifo(7), S264 open(2), S265 Node.js fs), the id-reuse reasoning, and the four lane gates re-run after landing. |
| `gate.md` | per row: URL, access date 2026-11-05, the ≤25-word quote, the capture path (mine and the L1's, byte-identical) and the sha256; plus the two corrections' re-opened sources and the rejected/gap notes. |
| `corrections.md` | the two routed corrections with the exact old → new cell text (S260 quote hygiene; K89-V7 S255 line 70 → 75) and where each landed. |
| `quote-checks.txt` | one `grep -c -F` receipt per published quote, on both surfaces (raw bytes and the whitespace-collapsed rendering). |
| `fifo.7.html`, `open.2.html`, `fs.html` | the fetched bytes (sha256 below). |
| `fifo.7.flat.txt`, `open.2.flat.txt`, `fs.flat.txt` | the same bytes, tags stripped, entities unescaped, whitespace collapsed — the surface a wrapped sentence is byte-present in. |
| `*.lines.txt` | one record per source line (`<lineno>\t<text>`), so any source line number is resolvable. |
| `flatten.py` | the deterministic derivation of the two surfaces from the fetched bytes. |
| `r89-proc-root.html`, `r90-unicode-tr44.html` | the two existing lane captures re-opened for the corrections (sha256 unchanged; re-fetched live and identical). |
| `final_quotes.tsv`, `quotes.tsv`, `quotes.txt` | the quote inventory the receipts were produced from. |

## The three sources opened (all on 2026-11-05, HTTP 200, no redirect)

| row | URL | sha256 (bytes) | quote (≤25 words) |
|---|---|---|---|
| S263 | https://man7.org/linux/man-pages/man7/fifo.7.html | `9c9bbe3240e79d086dc46cfb546dcedadb9a9ba56408994131e6482fa500749f` (9248) | "opening for read-only succeeds even if no one has opened on the write side yet" (15) |
| S264 | https://man7.org/linux/man-pages/man2/open.2.html | `d665489cadb85624d98fae03a8d8d06209030f32735cff8aeba949ad8491c789` (76506) | "Neither the open() nor any subsequent I/O operations on the file descriptor which is returned will cause the calling process to wait." (22) |
| S265 | https://nodejs.org/docs/latest-v24.x/api/fs.html (docs v24.22.2) | `c175e0e7340f0bfb686077581e885504890780f20e7206de0cba5e3cc5c29d50` (774165) | "Retrieves the <fs.Stats> for the file descriptor." (7) |

Each row's `used-by` is `corpus/knowledge/receipt-bounded-external-reads.md` (landed by the L1;
`node scripts/sources-check.mjs` → `SOURCES_CHECK: CLEAN (rows=203 …)`).

## The two routed corrections (append-only; no row cell edited)

1. **S260 quote hygiene** (round-90 spot-check §6 row 3). The row's `teaches` cell condensed the
   source. Re-opened the UAX #44 capture: live fetch sha256 `d951c7cf4f697c238e7a96ab891cf27fdf0b1
   94454aa0071a9d5b0d3a0e1ab4`, identical to the committed round-90 capture. Verbatim (21 words):
   "U+200B ZERO WIDTH SPACE was originally classified as a space character (General_Category=Zs), but
   it was reclassified as a Format character (General_Category=Cf)". Old → new cell text in
   `corrections.md`; landed as an append-only correction paragraph at
   `corpus/knowledge/receipt-invisible-prefix-fields.md:43`.
2. **K89-V7, S255 quote-location drift** (round-89 spot-check §5 item 3, carried in §6 row 4). The
   anchor named `open/proc-root.html` line 70; line 70 closes the NAME block and the quoted sentence
   begins at **line 75** (`grep -n "symbolic link that points to the process"` → `75:`; live fetch
   sha256 `1a71736f5c84b7a9846502b541e0c25ebe8e0efee2b8638a002ef37626c251ac`, identical to the
   committed round-89 capture). Old → new cell text in `corrections.md`; landed at
   `corpus/knowledge/receipt-lane-membership-and-link-binding.md:47`.

## Evidence commands (all run in this seat; outputs quoted above)

    node scripts/sources-check.mjs   → SOURCES_CHECK: CLEAN (rows=203 tiers=A:171,B:22,C:10 status=queued:14,mined:161,rejected:28 entries_with_source=45 legacy=38)
                                      [3 USED_BY_ASYMMETRY warnings, all pre-existing: S041, S258, S237 — no row of this round]
    node scripts/source-capture.mjs  → SOURCE_CAPTURE: CLEAN captures=92 exemptions=111
    node scripts/source-dupes.mjs   → SOURCE_DUPES: CLEAN groups=7 known=7
    scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin kumitate → exit 0, the same 7 pre-existing W04 warnings, no new finding
    grep -c -F -- "<quote>" <surface>   → per-quote receipts in quote-checks.txt (every quote: hits=1 on the collapsed surface)
    sha256sum <capture>               → the digests in gate.md and rows.md

## Note for the L1 (already satisfied, recorded for the audit trail)

`man7.org/linux/man-pages/man2/open.2.html` and `man7.org/linux/man-pages/man7/fifo.7.html` are
already cited by sibling lanes (souji `S062`/`S070`/`S077`/`S241`/`S242`/`S245`, kaidoku `S320`,
chousa `S134`, tameshi `S072`/`S078`). Each lane cites the sources it opened itself, so this lane's
S263/S264 are its own openings, not reuse — stated in `corpus/lessons/round-91.md` §Sources opened
this round and in `w1/K91Connector.md`. The `shared` census mode lists those URLs across lanes; it
is informational and does not gate (the lane's own `source-dupes` ratchet is `groups=7 known=7`,
CLEAN).
