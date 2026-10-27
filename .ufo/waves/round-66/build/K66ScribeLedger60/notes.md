# K66ScribeLedger60 — closure notes (round 60)

Open rows: **none** (9 of 9 closed). Nothing is left open, so no "why still open" note is
required; the three rows whose closure rests on a *superseding* artifact rather than on the
defective bytes being rewritten are argued below, so the L1 can overturn any of them.

- **R60-V1** — closed on `.ufo/waves/round-61/w1/ScribeErratum.md:14` ("Fixed by `165b8304`:
  V1 and V7"). Independently re-checked at the lane tip: `git merge-base --is-ancestor
  165b83044d33cbd52fc2209aefe57edfd7e6590a HEAD` → yes; the five `.ufo/waves/round-60/close/`
  files are in `HEAD`; `git status --porcelain -- .ufo/waves/round-60` → 0 lines.
- **R60-V2** — closed on `SCORECARD.md:2956` (R61-V4: "the filed fleet report's six
  placeholders are mapped, one occurrence each, in `w2/R60Erratum.md`"). The ledger row is
  closed on the *erratum*, which is exactly the repair the item names ("An erratum naming the
  real hashes is the only repair (filed bytes are not rewritten)"). The filed fleet report
  `/home/vgpnk/Projects/shokunin/.ufo/reports/round-60/kumitate.md` still carries 6 placeholder
  tokens (`grep -c '__TIP__\|__MEASURED__\|__COMMITS__'` → 6); that is expected and is not a
  re-open, because filed bytes are out of the lane's writable scope.
- **R60-V3** — closed on `SCORECARD.md:2887` ("exit 1, with `A7 MISS row-absent` and `A10 MISS
  exit=2`"), the append-only round-61 correction that supersedes the round-60 score sentence.
  The filed report's line-85 `held=9/10` is superseded, not rewritten (policy).
- **R60-V5** — closed on `.ufo/waves/round-61/close/a2-tip-dispatch61.txt:4` (`P2 PASS gate=0
  clean=true reports=32`): the *next* round's record is emitted in the gate's schema and the
  real gate reads it CLEAN, which is the item's ask ("before the next round's A-style check").
  Residual, stated so it cannot be mistaken for a repair of round 60 itself: round 60's own
  record was never emitted — `.ufo/waves/round-60/w1/dispatch-actual.json` is still absent at
  the lane tip. `scripts/make-dispatch-actual.mjs` (present, pinned) could synthesize it from
  `swarm-registry.json` + `launcher-progress.tsv`, but that is a 66-round decision, not mine.
  Note the cited receipt is an UNMET probe overall (`held=2/4`); only its P2 term speaks to V5.
- **R60-V8** — closed on `corpus/README.md:181` ("Row added in round 61 (R60-V8) …"). The other
  two terms the item demanded are evidenced separately: the `covered` entry is
  `.ufo/pins/readme-map.json:143`, and `node scripts/readme-map.mjs` at the current lane tip
  reads `README_MAP: CLEAN files=160 rows=160 covered=160`. The proxy stanza drifted again for
  round-66 reasons (`PROXY: DRIFT`, A 351/460 …) — that is the plan's carried D4, not V8's
  term, so it does not re-open this row.
- **R60-V9** — closed on `corpus/lessons/round-61.md:13`: the round-61 Gate reject cites the
  package rows `S204`/`S211` and lane `S134`, which is the re-point the item asked for.

Class slugs follow seat `K66ScribeClasses`' canonical 13-slug vocabulary (its IRC message,
verified by my own `--classes` run): `uncommitted-work` (V1, V7 — V7's LOG entry existed but
was uncommitted at `a745a3b0`), `dangling-pointer` (V2, V4 — token or cited object resolves to
nothing), `tally-drift` (V3), `dispatch-accounting` (V5), `report-fidelity` (V6),
`dangling-pointer`/`reference-drift` split as sent (V8 `reference-drift`), `citation-integrity`
(V9). My first pass used `placeholder`, `dispatch-evidence`, `dead-seat`, `registry-home` and
`reference-drift` for V2/V4/V5/V6/V7; those were re-slugged after the seat's message so one
defect gets one family in the merged `--classes` output. Seven families, `rows=9`.
