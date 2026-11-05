# K91ScribeSources — round-91 SOURCES rows (new) and the two routed corrections.

Registry schema per `CORPUS.md` §Registry: `| id | source | kind | tier | scope | anchor |
teaches | status | opened | recheck | used-by |` — 11 fields, `NF=13` after the leading/trailing
pipe. Every row below is the exact text landed in `corpus/SOURCES.md` at commit
`77ebfe37` ("round-91: integrate receipt-bind v5 (bounded external reads), Q84/Q85, S263-S265,
lesson, records, w1 evidence"); the seat's own capture bytes are byte-identical to the ones the
L1 pinned (same sha256, see `gate.md`).

Ids S263-S265 are the next free ids after S262. No id is reused: the retired S233 (withdrawn at
round-80) and the pre-rule gap ids are left alone.

## New rows (S263-S265)

| S263 | fifo(7) — Linux man-pages — https://man7.org/linux/man-pages/man7/fifo.7.html | docs | A | why an external FIFO instrument must be opened non-blocking and refused by type: a blocking open of a writer-less FIFO never returns | § DESCRIPTION, nonblocking-open paragraph; read 2026-11-05; capture .ufo/waves/round-91/close-l1/sources/fifo.7.html (rendered text line 88 of fifo.7.txt), sha256 9c9bbe3240e79d086dc46cfb546dcedadb9a9ba56408994131e6482fa500749f | A FIFO opened read-only in nonblocking mode returns at once with no writer, so the instrument can fstat it and refuse it instead of hanging | mined | 2026-11-05 | 180d | corpus/knowledge/receipt-bounded-external-reads.md |
| S264 | open(2) — Linux man-pages — https://man7.org/linux/man-pages/man2/open.2.html | docs | A | the descriptor flags of the v5 external read: O_NONBLOCK (no wait on open or I/O) and O_NOFOLLOW (a symlink leaf fails ELOOP) | § DESCRIPTION, O_NONBLOCK and O_NOFOLLOW entries; read 2026-11-05; capture .ufo/waves/round-91/close-l1/sources/open.2.html (rendered text lines 349 and 366 of open.2.txt), sha256 d665489cadb85624d98fae03a8d8d06209030f32735cff8aeba949ad8491c789 | With O_NONBLOCK neither the open nor later I/O makes the caller wait; with O_NOFOLLOW a symlink leaf fails, so the opened object is the named file | mined | 2026-11-05 | 180d | corpus/knowledge/receipt-bounded-external-reads.md |
| S265 | Node.js v24 fs API — https://nodejs.org/docs/latest-v24.x/api/fs.html | docs | A | the Node calls the v5 external read uses: openSync returns a descriptor, fstatSync reads Stats from that descriptor, fs.constants.O_NONBLOCK | § fs.fstatSync(fd), § fs.openSync, § File open constants; read 2026-11-05 (docs v24.22.2); capture .ufo/waves/round-91/close-l1/sources/fs.html (rendered text lines 6729 and 9080 of fs.txt), sha256 c175e0e7340f0bfb686077581e885504890780f20e7206de0cba5e3cc5c29d50 | fstatSync(fd) returns the Stats of the opened descriptor, so the type and size test runs on the object that is then read | mined | 2026-11-05 | 180d | corpus/knowledge/receipt-bounded-external-reads.md |

### Why one row per source, not one row per fact

Each row carries one source and one scope. The registry's `E04` check (same URL + same scope in two
non-superseded rows) and the `source-dupes` ratchet both key on (URL, scope) pairs, and the fleet
`shared` mode already lists `man7.org/linux/man-pages/man2/open.2.html` across four sibling
registries. Three rows — one per opened document, each with its own scope — keep this lane's
duplicate-group set at the pinned `known=7` (verified: `SOURCE_DUPES: CLEAN groups=7 known=7`).

Sibling-lane rows for the same documents (souji `S062`/`S241` fifo(7), `S070`/`S077`/`S242`/`S245`
open(2); kaidoku `S320` open(2); chousa `S134` open(2); tameshi `S072`/`S078` open(2)) live in other
lanes' registries and are not reused here — each lane cites the sources it opened itself
(`corpus/lessons/round-91.md` §Sources opened this round, and `w1/K91Connector.md`).

## Routed corrections (append-only; no cell of S260/S255 was edited)

Per `CORPUS.md` rule 2 ("Only `status`, `recheck` and `used-by` change in place … A correction is a
new row whose `teaches` opens `supersedes S0NN —`" — and, for a claim's wording, the lane's
established practice is an append-only correction paragraph inside the citing knowledge entry,
`corpus/knowledge/receipt-invisible-prefix-fields.md` and
`corpus/knowledge/receipt-lane-membership-and-link-binding.md`). Both landed paragraphs are quoted
in `corrections.md` with the exact old → new cell text.

## Also verified for the L1 (not landed by this seat)

- `node scripts/sources-check.mjs` → `SOURCES_CHECK: CLEAN (rows=203 …)` (the three
  `USED_BY_ASYMMETRY` warnings are pre-existing: S041, S258, S237 — none is a row of this round).
- `node scripts/source-capture.mjs` → `SOURCE_CAPTURE: CLEAN captures=92 exemptions=111`.
- `node scripts/source-dupes.mjs` → `SOURCE_DUPES: CLEAN groups=7 known=7`.
- `scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin kumitate` → exit 0, the
  same 7 pre-existing `W04` warnings, no new finding.
