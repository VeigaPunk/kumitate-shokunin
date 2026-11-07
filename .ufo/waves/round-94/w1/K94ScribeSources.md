# K94ScribeSources — SOURCES rows for round 94 (C1 grounding + M93-2)

Seat: scribe, sources. Leaf member, no dispatch. Lane base `a6e4da96`; plan frozen at `73317eca`.
Access date 2026-11-06. Nothing under `scripts/`, `corpus/`, `probe/`, `controls/`, `open/` or
`plan.md` was written; the three draft rows exist only in this seat dir until L1 appends them.

## Deliverable

Three rows, drafted as `S271 S272 S273` (ids provisional — the plan assigns at integration; last row
in the registry is S270):

- **S271** — git gitrevisions manual, `<sha1>` entry: an abbreviated object name is repository-relative
  and names a commit only when its prefix is unique in that repository. Used by
  `corpus/knowledge/round-gate-declared-pins.md`.
- **S272** — GitHub Docs "Getting permanent links to files": the commit id is written into the URL path
  in the segment the branch name occupies (`blob/<commit-id>/<file>`), so an upstream pin is a URL path
  segment. Used by the same knowledge entry. **Not** a duplicate of S033 (disclosed below).
- **S273** — oh-my-pi `packages/coding-agent/src/session/retry-fallback-chains.ts` at
  `79fa222e…`: the `RetryFallbackRole` home — one primary selector plus `chain: string[]`, empty chain
  a deliberate no-fallback, persisted in `session_init`. Used by
  `corpus/knowledge/seat-route-retry-fields.md`. Closes routed defect **M93-2**.

Files: `rows.md` (rows + integration notes), `quotes.md` (URL, date, HTTP status, sha256, quote,
location per source), `census.txt` (validator runs), `captures/` (the fetched bodies and the two
derived renderings).

## Evidence (all commands run 2026-11-06, scratch `/fast/scratch/hyaku/kumitate-r94/K94ScribeSources`)

| source | fetch | body sha256 | quote location |
|---|---|---|---|
| gitrevisions | `curl -sS … https://git-scm.com/docs/gitrevisions` → **200**, 74526 B | `60bfaca3907710bdedcfaab0c6d82721b9b317a86ecc11d60d07027bf41a1a54` | § SPECIFYING REVISIONS `<sha1>`; rendered lines **2179-2180** |
| GitHub permalinks | `curl -sS -L …` → **200**, no redirect, 190680 B | `0824dda4c0c8e675ae18dd51c7da96590a381d3a0e92eb6bc8bbf56d3be0efe7` | § Press Y…; prose line **13**, example URL line 15 |
| retry-fallback-chains | `curl -sS … raw.githubusercontent.com/can1357/oh-my-pi/79fa222e…/packages/coding-agent/src/session/retry-fallback-chains.ts` → **200**, 27438 B | `b5db529983630ee7e60621478868675dbbe93f149e3cf42eb1aee093a21774fc` | lines **180-190** (comment 188, `chain` 189) |

Validator: `bash /home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --file <scratch>/val/corpus/SOURCES.md`
— corpus copied to scratch, lane root entries symlinked beside it so used-by paths resolve as in the
lane, rows inserted inside `## Registry` after S270.

- **Run A** (exact draft state, knowledge entry absent): `exit=1`, 11 lines — 9 `W04` warnings (7
  pre-existing, plus `S271` vs `S253` and `S272` vs `S033`) and exactly two `E11`:
  `S271`/`S272` missing used-by `corpus/knowledge/round-gate-declared-pins.md`. No `E01`-`E10`, `E12`.
- **Run B** (+ a scratch-only one-line placeholder at that knowledge path, never created in the lane):
  **`exit=0`**, `file ok <path>` plus the same 9 `W04` warnings.

## Findings

1. **Brief correction (recorded, not a blocker).** The briefed path
   `packages/coding-agent/src/config/retry-fallback-chains.ts` **404s** at `79fa222e…` (14-byte body).
   The file is at `packages/coding-agent/src/session/retry-fallback-chains.ts` — found through
   `api.github.com/repos/can1357/oh-my-pi/git/trees/79fa222e…?recursive=1` (200, `truncated=false`,
   11222 entries, one matching blob). Its sha256 equals the r93 auxiliary capture `b5db5299…`, so the
   bytes r93 read are the bytes S273 cites.
2. **S272 is a new row, not a duplicate of S033.** Same page, adjacent sentences. S033 (2026-10-21)
   quotes the sentence about a branch-head URL changing and teaches *why a pin is needed*; S272's
   sentence teaches *where the pin sits in the URL* — the path segment a branch name occupies, which is
   precisely the segment the C1 rule splits on. S033 does not state the segment position, so S033
   cannot carry C1's grounding alone. Kept separate; S272's `anchor` cell points at S033.
3. **S271 shares a URL with S253** (`git-scm.com/docs/gitrevisions`) but quotes a different entry
   (`<sha1>` vs `rev:path`). Capture drift checked: r88's `open/gitrev.html` (`1ab7124a…`, 74654 B) vs
   my capture (`60bfaca3…`, 74526 B) differ in page shell only — tag-stripped text identical (585
   non-empty lines, `difflib` empty). A future byte-hash recheck of S271 must expect `60bfaca3…`, not
   S253's hash.
4. **Declared-pin effect of the three rows:** none new. S271/S272 URLs carry no hex path segment; S273
   carries the same `79fa222e8390…` pin S267-S269 already declare. Round 93's cited `79fa222e` stays
   `declared`, and nothing here widens the predicate (rejected-row filter and the `http(s)://`
   requirement are untouched).
5. **E11 dependency (routed, not mine to fix):** `corpus/knowledge/round-gate-declared-pins.md` does not
   exist at base `a6e4da96`; the rows cannot validate to `exit=0` in the lane until that entry lands.
   Flip: L1 append order = knowledge entry first, then the three rows (or both in one commit), then
   re-run `validate` in the lane. The knowledge-entry owner should also re-point
   `corpus/knowledge/seat-route-retry-fields.md`'s `chain` paragraph from the auxiliary capture to S273
   and drop its Routed bullet.
6. **Not done by this seat, deliberately:** no corpus file written, no id reserved in the lane, no
   knowledge entry drafted (sibling seat owns it), no candidate/READY inspection (seat is
   candidate-independent).

## Limits

- Quotes are from the served bytes on 2026-11-06; the GitHub Docs page is unversioned (S033 logged no
  Last-Modified either), so the row's own sha256 is the recheck anchor. The git page shell changes
  between fetches while its text does not (finding 3).
- `S272`'s sentence is quoted from a mid-sentence boundary (`put a commit ID…`); the elision is marked
  in `quotes.md`, and the segment-position claim also rests on the page's own example URL, quoted
  verbatim there.
- Row ids and the `used-by` targets are the plan/brief's; if another seat drafts rows in the same round,
  ids must be reconciled at integration (I claim S271-S273).
