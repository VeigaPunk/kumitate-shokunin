REVIEW checklist items=14 pass=14 manual-fails=0

# ReviewChecklist — SKILL.md checklist rewrite (round 36, C1/f)

Lane at `cb80bc1` (integration `3d5760a`; `cb80bc1` is the LOG.md-only correction that withdraws the
C1 fidelity verdict); `git status` clean except `.ufo/waves/round-36/build/` reports. `scripts/*.mjs`
and `SKILL.md` are byte-identical to my audited state (mtimes 02:40:09 / 02:39:23), so every run below
is against the committed gate, not an intermediate tree.
Parse uses the real `CHECKLIST_RE` lifted by text from `scripts/surface-probe.mjs:182`
(`/fast/scratch/kumitate-r36/w/ReviewChecklist/parse.mjs`), not a hand copy. No `lsp` server is
mounted for this leaf; every call/definition check below is CLI execution or text inspection of the
exact diagnostic line, and none is presented as semantic proof.

## Verdict

- 14 `- [ ]` lines, 14 parse, 0 malformed, 0 `SKIP(self)` (no command contains `--checklists`).
- `node scripts/surface-probe.mjs --checklists` → `CHECKLIST_SKIPPED: 0`, `CHECKLIST: 14/14 pass`,
  `VERDICT: PASS`, exit 0 (11.6 s) at `cb80bc1`.
- Manual replay of each command (`bash -c`, cwd = lane root, combined stdout+stderr, declared exit
  set, expected substring, 180 s cap): 14/14 pass, 0 fail.
- `grep -c '^\s*- \[' SKILL.md` = 14; all in `## Verifiable checklist` (SKILL.md:627-640); no task
  line exists elsewhere in the file.

## Per-item table (manual replay at cwd=/home/vgpnk/Projects/shokunin/kumitate-shokunin)

| # | SKILL line | label | exit (exp) | substring | verdict |
|---|---|---|---|---|---|
| 1 | 627 | Citation gate verdict | 1 (0\|1) | `CITE_CHECK:` hit | PASS |
| 2 | 628 | Citation gate hermetic suite | 0 (0) | `VERDICT: PASS` hit | PASS |
| 3 | 629 | Live sighting-surface conformance | 0 (0) | `SURFACE_PROBE: CLEAN` hit, carries `src-rev=31c465f15669`, `known=1` | PASS |
| 4 | 630 | Surface-probe hermetic suite | 0 (0) | `VERDICT: PASS` hit | PASS |
| 5 | 631 | Round-gate hermetic suite | 0 (0) | `VERDICT: PASS` hit | PASS |
| 6 | 632 | Round-close artifact audit | 0 (0) | `ROUND_GATE: CLEAN` hit (round=36, warnings=1 `SCORECARD_PLAN_MISSING`, non-gating) | PASS |
| 7 | 633 | Filed-report tracking | 0 (0) | `ROUND_GATE: CLEAN` hit (mode=tracked) | PASS |
| 8 | 634 | Proxy recompute | 0 (0) | `PROXY: MATCH` hit, carries `src-rev=31c465f15669` | PASS |
| 9 | 635 | Proxy-check hermetic suite | 0 (0) | `VERDICT: PASS` hit | PASS |
| 10 | 636 | Member-claims gate | 0 (0) | `CLAIMS: MATCH` hit, carries `src-rev=31c465f15669` | PASS |
| 11 | 637 | Kimi-substrate census | 0 (0) | `KIMI_CENSUS: CLEAN` hit | PASS |
| 12 | 638 | Sources-registry gate | 0 (0) | `SOURCES_CHECK: CLEAN` hit | PASS |
| 13 | 639 | Sources-check hermetic suite | 0 (0) | `VERDICT: PASS` hit | PASS |
| 14 | 640 | Anchor fidelity | 0 (0) | `FIDELITY: CLEAN` hit, `notes=20 anchors=1574 nonok=0 src-rev=31c465f15669` | PASS |

Every item's expected substring is produced at the pin (3/8/10/14) or is pin-independent
(1/2/4/5/6/7/9/11/12/13). The SKILL prose (SKILL.md:620-625) matches: items 3, 8, 10, 14 are the
pin-aware four and each verdict carries `src-rev=`; item 1 keeps an explicit `--src`.

## Item 14 is not vacuous — but it can be defeated

Failure mode confirmed on the shipped gate (`scripts/claims-check.mjs`), fixture ratchet with
ceilings 0 against a tree that has debt (pristine `0614092` corpus in scratch):
`--self baseline --fidelity --fidelity-ratchet fid-fixture-zero.json` →
`FIDELITY_TOTAL anchors=1494 ok=317 elsewhere=461 absent=82 dead=168 noid=466 nonok=543` then
`FIDELITY: DRIFT (RATCHET_NOTE …; RATCHET_TOTAL nonok=543 ceiling=0 src-rev=31c465f15669)`, exit 1.
Fail-closed arms on the same tool: stale revision → `FIDELITY: FAIL-CLOSED (RATCHET_REV_STALE …)`
exit 2; missing/malformed ratchet → `RATCHET_MALFORMED` exit 2; pin clone HEAD ≠ pin revision →
`SRC_REV_MISMATCH` exit 2 (`baseline HEAD 0614092e0804 != pin 31c465f15669`).

### Finding 1 (HIGH) — a wrong anchor hides behind an adjacent anchor span; the adjudication rule is not the frozen pairing rule

`scripts/claims-check.mjs:300-303` selects the adjacent span positionally and then rejects it as
`noid` if it fails the shape guards — it does **not** fall back to the previous span when the right
neighbour is itself an anchor. FIDELITY v1 says "the next span … (right first), **else** the previous
span …; the paired span must not itself be an anchor … No such span => `noid`", which reads as
fallback-on-failure. Same file, only that rule changed (`tool/lane-fallback.mjs` in
`/fast/scratch/kumitate-r36/w/ReviewChecklist/`): final tree
`anchors=1574 ok=880 elsewhere=15 absent=10 dead=168 noid=501 nonok=25` → `FIDELITY: DRIFT`, vs the
shipped `elsewhere=0 absent=0 noid=539 nonok=0` → `CLEAN`. The 25 gated anchors are real lines, not
phantom sections (per note): cost-and-profile 1, ops-watchers 16, remaining-scripts-census 2,
route-probe-cluster 2, sighting-wall 4.

Mutation proof on a scratch copy of the corpus (`--self mut`, same gate, same ratchet):
- line 87 of `cost-and-profile.md` with `:448` changed to `:1` **and** the neighbouring `` `:447` `` span
  left in place → `FIDELITY: CLEAN … nonok=0`, exit 0. The wrong anchor is silently `noid`.
- same line with `:2` and the neighbouring span removed → `cost-and-profile.md … nonok=1`,
  `FIDELITY: DRIFT`, exit 1.
So the item's "cannot trivially pass" property holds only for anchors with no adjacent anchor span.
L1 correction `cb80bc1` (LOG.md, appended) already states the committed code is plain right-first and
"NOT admitted as anchor truth": its own reviewer found 105 of 163 changed anchors in
`remaining-scripts-census.md` pairing the wrong (next) symbol, and an independent implementation reads
`nonok=2` there. My mutation above shows the same class from the opposite side (a *wrong* anchor made
invisible). The executor's IRC says the L1 sent a FINAL rule superseding right-first and that it
shipped a different variant (both-sides→noid); the tree ships the `next ?? prev` variant. Required: either (a) restore the fallback
reading (same scan, 3-line change at :300-302) and re-anchor the 25 anchors (list reproducible with
`node tool/lane-fallback-log.mjs --self <lane> --fidelity --fidelity-ratchet .ufo/pins/fidelity-ratchet.json`),
or (b) record this interpretation as an explicit, dated deviation in SCORECARD/report — not as
"FIDELITY v1" — and keep the mutation above as a known blind spot.

### Finding 2 (MEDIUM) — ratchet ceilings cannot be exercised: CLEAN also requires `total.nonok === 0`

`scripts/claims-check.mjs:355` passes only when `violations.length === 0 && total.nonok === 0`, so a
ratchet with nonzero ceilings can never read CLEAN even when every ceiling holds. Contract: "a listed
note must be <= its ceiling; the total must be <= `total`". Measured: baseline `0614092` corpus,
fixture listing all 18 notes at 1000 with `total:1000` (debt 543) → contract expects CLEAN, gate prints
`FIDELITY: DRIFT (nonok=543 src-rev=31c465f15669)` exit 1. Today's `.ufo/pins/fidelity-ratchet.json`
is all-zero (`notes: 15 × 0`, `total: 0`), so item 14 is unaffected; the burn-down mechanism the
contract describes is unavailable.

### Finding 3 (LOW) — vacuous CLEAN when no member section resolves

A registry whose rows resolve no notes/sections yields `FIDELITY: CLEAN (notes=0 anchors=0 …)` exit 0
(reproduced with a two-line fixture scorecard + `--self`; `runFidelity` has no `notes > 0` guard at
:355-357). Unreachable today (lane walk = 20 notes / 1574 anchors, and a note-resolution failure turns
item 10 red), but a fidelity-only run can be vacuous. Suggest a fail-closed arm when `walk.notes.size === 0`.

## Verified claims (SKILL prose and pin wiring)

- `.ufo/pins/{origin,fidelity-ratchet,surface-known}.json` are tracked (`git ls-files .ufo/pins` = 3);
  the item commands that read them are reproducible from the commit, not from untracked state.
- Items 3/8/10/14 verdict lines each contain `src-rev=31c465f15669`; the pin clone
  `/fast/scratch/kumitate-r36/src` is `dr-xr-xr-x`, HEAD `31c465f1…`, and `find <clone> -newer
  scripts/surface-probe.mjs -type f` = 0 after the probe runs. Dispatcher isolation
  (`scripts/surface-probe.mjs:501-512`, `mkdtempSync` + `UFO_STATE_DIR`/`UFO_PENDING_WORK_PATH`) is
  present and exercised by item 3.
- Pin fail-closed for the checklist path is real: `SRC_REV_MISMATCH` exit 2 when the pin clone is at
  the wrong revision, so the item cannot pass on a stale tree.

## Residual risk / gaps

- Item 1 passes on `CITE_CHECK: DRIFT (files=86 tokens=8651 errors=445 warnings=449)` because its
  declared exit set is `0|1`; checklist green is not a citation-clean statement (unchanged semantics,
  documented in SKILL).
- Item 14's green depends on Finding 1's reading; any later re-integration of the executor's
  both-sides→noid variant changes the rule again. The executor's own clone reports `nonok=357` on the
  pre-re-anchor corpus, which is not comparable to the lane's numbers.
- I did not re-derive `R_sections 92/92`/`C=14` (other seats own it); item 10's `CLAIMS: MATCH
  (rows=19 yes=19 notes=27 sections=184 adv=4 src-rev=31c465f15669)` and item 8's `PROXY: MATCH
  (… C2=82/82 coverage=10; S=88/88 …; R=92/92 …; pins=6 match; src-rev=31c465f15669)` are quoted as
  observed lines only.
- Scratch artifacts (not lane files): `/fast/scratch/kumitate-r36/w/ReviewChecklist/{parse.mjs,
  run-items.mjs,counter.mjs,diag.mjs,lane-fallback.mjs,lane-fallback-log.mjs,fid-fixture-*.json,
  lane-fid.txt,base-lines.txt}`.
