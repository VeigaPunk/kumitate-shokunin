# K80ReviewSplit — adversarial review of `spotcheck-adopt` v3 semantics (round 80, w1)

Target: `scripts/spotcheck-adopt.mjs` + its oracle child `scripts/readme-map.mjs` at scaffolding
`6d03402fddf44cc9797ec590f0f888e933db4677` (worktree verified byte-identical: `git diff 6d03402f --
scripts/spotcheck-adopt.mjs scripts/readme-map.mjs` empty; `6d03402f` is an ancestor of lane HEAD
`509afb1d`). Lane tree untouched; all fixtures under `/fast/scratch/hyaku/kumitate-r80/K80ReviewSplit/`
(deleted after the review; every cited byte is inlined below). Driver: `driver.mjs` (fixtures F1–F11) +
`followup.mjs` (F6c, F12) — plain `node` scripts, no tooling installed (node v24.21.0 present; no
pacman use). Baseline sanity: `--selftest` at the same bytes → `SPOTCHECK_ADOPT_SELFTEST: PASS
(28/28)`, exit 0. No `lsp` device exists in this environment, so all semantic checks are full text
reads plus black-box fixtures (recorded per role rules); line anchors below are from the read source.

Finding vocabulary (from `readme-map.mjs` docstring and code): rows = lines matching
`^\|\s*`((?:knowledge|lessons)/[^`]+)`\s*\|` (whole-file scan, any section, key allows any
non-backtick chars incl. spaces); `uncovered` = live `*.md` without a row; `unpinned` = live `*.md`
not in pin `covered`; `duplicate-row` = exact key seen twice; `orphan-row` = row key with no file;
`format-unmapped` = corpus-shaped first cell that is not a clean backticked row. `--adopt`'s
pre-check refuses the whole run on `format-unmapped|duplicate-row` (spotcheck-adopt.mjs:193); the
post-write check is `!after.valid || target.row || target.pin || !sameOther` (:231 area) where
`otherFindings` (:40) drops any finding whose text merely CONTAINS the target key, sorted+deduped.

## Findings by severity

### R1 — HIGH (contract inconsistency; seat item 3): `recover()` still decides on the v2 global-clean map; under `--check` it destroys a fully-landed, delta-valid adoption because of an unrelated defect

`recover()` (spotcheck-adopt.mjs:110) runs the oracle and branches on `if (!result.clean)` (:141) —
global cleanliness, not the delta rule that v3 introduced for `--adopt`. Fixture F8:

1. Fresh fixture (target present; README lacks its row; pin lacks the key).
2. `SPOTCHECK_ADOPT_TEST_CRASH=pin node $TOOL --lane $D --adopt corpus/lessons/round-75-verifier-spotcheck.md`
   → SIGKILL after BOTH writes landed. State: README sha16 `d434d44067b0b787`, PIN `c1f467e73b03ed5c`;
   oracle at this instant: `README_MAP: CLEAN files=2 rows=2 covered=2`.
3. Unrelated defect added during the interrupted window: `corpus/knowledge/late.md`
   → oracle: `README_MAP: DRIFT … bad=2 first=uncovered:knowledge/late.md` (unrelated only; the
   target's delta is perfect).
4. `node $TOOL --lane $D --check` → exit 1:
   `RECOVERED corpus/lessons/round-75-verifier-spotcheck.md rolled-back` +
   `SPOTCHECK_COVERAGE: DRIFT spotchecks=1 uncovered=1 first=corpus/lessons/round-75-verifier-spotcheck.md` +
   `MAP: DRIFT first=uncovered:knowledge/late.md`. Bytes after: README `ba6cfbf735a956fd`,
   PIN `7b08e8aa94e1a202` — both destinations restored to pre-adoption images; journal retired.

The rolled-back state is exactly the state v3's own `--adopt` accepts: the immediately following
`--adopt corpus/lessons/round-75-verifier-spotcheck.md` exits 0 `SPOTCHECK_ADOPT: ADOPTED …
wrote=both` and lands files byte-identical to what recovery just destroyed (README `d434d440…`,
PIN `c1f467e7…`). Mirror F8b: the same crash WITHOUT the unrelated file recovers as
`RECOVERED … complete`, keeps the bytes, `--check` exit 0. Identical landed bytes, opposite verdicts,
decided solely by an unrelated map defect.

Why it is a defect of the delta rule, not a nit: the round's claim sentence says `--adopt`
"validates its own delta … instead of demanding a globally clean map". The recovery oracle question
was not updated, so it is wrong in both directions: (i) red-for-unrelated → force-rollback of an
adoption the new rule considers landed (work destroyed, journal retired, no retry); (ii) the rollback
fires under `--check`, a nominally read-only arm, and mutates two files by a criterion the tool
elsewhere rejects. Suggested direction (for L1 to weigh; not applied): decide completion by the same
delta predicate (target resolves + other findings unchanged), not `result.clean`.

### R2 — MEDIUM (delta-check blind spot; seat items b+c converge): the post-write check never re-runs the `duplicate-row`/`format-unmapped` scan, and `otherFindings`' substring filter exempts every finding whose text embeds the target key — v3 adopts into a state one whitespace from a bricked map

F4 — whitespace twin row. Pre-state README contains
`| ` + "`lessons/round-75-verifier-spotcheck.md `" + `| Ghost twin | fixture |` (one trailing space
inside the backticks). The oracle classifies it as its OWN key → finding
`orphan-row:lessons/round-75-verifier-spotcheck.md ` — text CONTAINS the target key →
`otherFindings` drops it on both sides (observed: pre and post `otherFindings = []`).
`--adopt` → exit 0 `SPOTCHECK_ADOPT: ADOPTED corpus/lessons/round-75-verifier-spotcheck.md
wrote=both` + `README_MAP: DRIFT files=2 rows=3 covered=2 bad=1
first=orphan-row:lessons/round-75-verifier-spotcheck.md`. Post README now carries two rows whose
keys differ by one invisible space, and every future `--check` prints
`MAP: DRIFT first=orphan-row:lessons/round-75-verifier-spotcheck.md` with coverage CLEAN exit 0 —
indistinguishable, to a reader, from the target's own row being orphaned.

F12 — the cost. Hand-normalizing the twin (deleting the one space, the obvious cleanup) makes it an
exact duplicate of the target row; from then on EVERY arm including `--check` exits 2
`REFUSED_ORACLE` (the :193 pre-check refuses the duplicate class). The tool never warned that it
wrote into a map containing the near-collision, and its own verdict space goes from exit 0 to bricked
off by a one-keystroke edit after its adoption.

Construction proof that the literal item (b) ("duplicate row appears only after the write") is
unreachable: an exact pre-existing target row suppresses `uncovered:target`, so `insertRow` never
runs (F5b: exact row + missing pin → `wrote=pin`, README byte-identical); a pre-existing exact
duplicate is refused pre-write (F5: exit 2, README sha unchanged). The write cannot mint a duplicate —
but F4 is the nearest reachable state, created silently, and F12 is its price.

F6c — the exemption is total for key-embedding corpus defects. With
`corpus/lessons/round-75-verifier-spotcheck.md.md` present, the oracle emits
`uncovered:lessons/round-75-verifier-spotcheck.md.md` + `unpinned:…md.md` — both embed the target key;
together with the target's own findings, ALL findings are delta-exempt (observed:
`otherFindings(pre) = otherFindings(post) = []`). Any change to such defects between the two oracle
runs (a second writer inside the adopt window) is invisible to the delta check. The docstring's
"every other finding byte-identical" holds only for findings that do not embed the key; the tool's
one-writer assumption is what contains this, and the exemption itself is undisclosed. (F6, the
lookalike `knowledge/see-lessons-…` row I first tried, does NOT collide — `see-lessons-round` has a
hyphen, not a slash; it stays in `otherFindings` and is delta-checked normally.)

Minimal hardening directions (not applied): anchor the filter to the finding's key field
(`f === 'uncovered:'+key || f === 'unpinned:'+key` for the target; exact-key comparisons otherwise)
and re-run the duplicate/format refusal scan on the after-state.

### R3 — LOW-MEDIUM (vacuous green; seat item e): an empty spotcheck set reads `SPOTCHECK_COVERAGE: CLEAN spotchecks=0 uncovered=0` exit 0

F9: lessons dir empty (knowledge baseline present) → `--check` exit 0, `SPOTCHECK_COVERAGE: CLEAN
spotchecks=0 uncovered=0` + `MAP: CLEAN`. F9b: lessons holding only a non-spotcheck `notes.md` →
same `CLEAN spotchecks=0` while the MAP line discloses `uncovered:lessons/notes.md` and exit stays 0.
No refusal, no write. A lane that lost all its spotcheck artifacts reads CLEAN on the coverage line;
nothing floors the population. The vacuity predates v3 (the count existed in v2's single line), so
this is not a regression — but v3's dedicated coverage line makes it read as a positive verdict.
For L1: consider a floor (`REFUSED_NO_SPOTCHECKS`, or DRIFT at `spotchecks=0`).

### R4 — LOW (refusal asymmetry): unrelated `duplicate-row` / `format-unmapped` anywhere still refuse every arm globally, while unrelated `uncovered` / `orphan-row` are delta-tolerated

F11: an unrelated knowledge-side duplicate (`knowledge/base.md` twice) → `--adopt` exits 2
`REFUSED_ORACLE`, bytes unchanged. Defensible (those classes mean the row structure the write parses
and extends is not trustworthy), but it is a residual global-map demand in two classes that the claim
sentence's wording ("instead of demanding a globally clean map") does not carry, and the frozen arms
(3, 4, 8) exercise only the tolerated classes. Disclose in the round lesson so arm 8's semantics are
not over-read as "any unrelated defect is tolerated".

### R5 — LOW (diagnostics; seat item f): symlinked spotcheck entries are counted by the coverage set but are unadoptable, and the token does not say why

F10: `corpus/lessons/round-75-verifier-spotcheck.md` as a symlink to a real file → `--check` exit 1
counting it (`spotchecks=1 uncovered=1 first=corpus/lessons/round-75-verifier-spotcheck.md`);
`--adopt` → exit 2 `REFUSED_OUT_OF_SCOPE`, bytes unchanged (the `lstatSync(full).isFile()` check at
:181). F10b (dangling symlink): identical. The refusal is consistent with the oracle's own convention
(symlinks are not files; covered symlinks read `covered-not-file`), but the coverage DRIFT names the
entry as if it were an adoptable spotcheck while no invocation can ever clear it, and
`REFUSED_OUT_OF_SCOPE` reads as a path-shape error rather than "symlink". A `REFUSED_SYMLINK` token
or a coverage-line annotation would close the loop. Theoretical corner also noted: if
`corpus/lessons` itself were a symlink, :181 compares the resolved parent against the UNRESOLVED
literal `join(realpathSync(lane), 'corpus/lessons')` and would refuse legitimate files (the lane's
`corpus/lessons` is a real directory, so out of scope today).

### R6 — COSMETIC: `appendPin` adds the new entry at a fixed 2-space indent

F2 after-bytes: `"knowledge/base.md",` at 4 spaces, the added `"lessons/round-75-verifier-spotcheck.md"`
at 2, closing `]` at 2 — valid JSON, oracle-clean, existing bytes preserved exactly as documented;
pure diff noise in the pin whenever the pin's style differs from 2-space entries.

## Verified-consistent behaviors (no defect found)

- (a) half-writes are correct on red maps: pin pre-lists target → `wrote=row`, PIN byte-identical
  (F1: PIN sha `84102e07…` before and after); row pre-present → `wrote=pin`, README byte-identical
  (F2); both missing + unrelated `knowledge/late.md` → `wrote=both`, unrelated finding survives,
  exit 0 (F3; arm-8 replica).
- (d) a journal whose manifest target (round-76, internally consistent, pre-image hashes valid)
  differs from the requested target (round-75) is processed WITHOUT refusal (F7):
  `RECOVERED corpus/lessons/round-76-verifier-spotcheck.md rolled-back` then `ADOPTED …
  round-75… wrote=both` exit 0. Recovery is lane-scoped; the manifest target is decorative (it only
  feeds the RECOVERED line); rollback is gated by the pre-image sha256s, so no byte corruption is
  reachable through the mismatch itself. Its wrong-criterion risk is exactly R1.
- Refusal paths leave bytes untouched and journals clean (F5, F10, F10b, F11); corrupt-pre-image
  fails closed (`REFUSED_ORACLE` exit 2, journal retained) reproducing the frozen arm 11 expectation;
  `--selftest` 28/28 at the target bytes.

## Residual risk / verification gaps

- R2's exemption was demonstrated with single-writer fixtures; the second-writer flip (a
  key-embedding defect appearing/vanishing between the two oracle runs) is argued from the filter
  code, not separately fixtured with real concurrency.
- `recover()`'s completion path (oracle clean → retire) can bless a journal whose target was never
  written (crash at `journal` stage, target covered by hand during the window) — analyzed as harmless
  (pre-images equal current bytes; retirement correct); not separately fixtured.
- The live lane at `6d03402f` carries no twin/duplicate constructs (spotchecks=46, `--check` CLEAN
  per the plan's open receipts), so R2's precondition is absent today; it is a latent trap for future
  adoption windows, not a live defect.
- Findings are recommendations; no lane byte was changed by this seat. Counter arms were not
  re-run (out of seat scope); arms 8/9 semantics were independently reproduced (F3, F5) and agree
  with the counter's expectations.
