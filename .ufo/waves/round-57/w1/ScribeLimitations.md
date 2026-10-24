# ScribeLimitations — round-57 seat report (kumitate, hyaku run 5)

- Seat: `ScribeLimitations` (scribe, leaf; one-shot, no subagents).
- Axes: operability, coverage.
- Assignment: draft the round-57 report's **Limits** section from observed evidence —
  prepared-wave convention, E5 live-only arm, item-count supersession, B5c lineage — and
  cite the artifacts.
- Revisions observed (read-only git; full log in
  `.ufo/waves/round-57/build/ScribeLimitations/commands-and-outputs.md`):
  R1 `f0dc6d1160e66af65355bd353665adac22bbf4a9` (freeze + integrate; ancestor of R2);
  `b3bd0633` (gate + entry content, tree differs from R1); `798d4d23743487d0c642239ca54deba421021af3`
  (close receipts); R2 `c42afe1c189f2a1ecbe175f6e4ea4f9065c138d7` (receipt/SCORECARD commit).
  Scratch witness rev `1cd6d667e20075fd2e77e6e655bc755f95e3d940` is **not** an object in the
  lane repo (`git cat-file` exit 128) — freeze-time scratch clone only.
- Method: artifact reads + read-only git provenance checks. No probe re-runs, no
  mutating git/jj, no production writes. Lane-relative paths below root at
  `/home/vgpnk/Projects/shokunin/kumitate-shokunin`.

## Draft section — `## Limits` (for the round report)

### Limits

- **Prepared-wave convention (R56-V1 → R57-3).** Wave `kumitate-r57-w1` is *prepared and
  validated, not dispatched*. `.ufo/waves/round-57/w1-taskcall.json` records
  `status: "prepared"`, `dispatched: false`, `items: 64`, with the reason
  "orchestrator dispatches waves between rounds (R56-V1 convention); lane prepares and
  reports"; `.ufo/waves/round-57/w1-validate.json` records the v2-policy validation
  (`ufo-wave-policy-v2.json` band 64–128, attack ≥ 0.25): `totalSeats 64,
  attackShare 0.375, distinctItems true, leafOnly true`. `.ufo/waves/round-57/w1-spec.json`
  and `.ufo/waves/round-57/w1/swarm-registry.json` hold the prepared seats.
  No dispatch receipt exists at close and none is claimed: a non-dispatched wave is not a
  dispatch receipt — the dispatch act is the orchestrator's, outside this lane's write
  boundary. Named in `corpus/lessons/round-57.md` `## Mistakes` (R56-V1, fix R57-3) and
  `plan.md` §Routed-defect answers; convention carried from the r53–r56 reports.

- **E5 is D57's live-only arm (R51-4 class).** `doctrine57-probe.mjs` scores E1–E4 over the
  `git archive` extraction of `<rev>`; E5 instead `spawnSync`s the live fleet census
  `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root
  /home/vgpnk/Projects/shokunin kumitate` — the probe header and arm comment both mark it
  "(R51-4 class: live-only, recorded as a limit)". `DOCTRINE57_HELD` is therefore not a pure
  function of `<rev>`'s committed bytes: live-tree drift after R2 can flip E5 without a
  committed change, and a live repair can mask a rev-side gap the extracted-tree companion
  E4 (`SOURCES_CHECK: CLEAN`) does not reach. Observed `E5 PASS` at R1
  (`close/FINAL-doctrine57-R1.txt`), at `798d4d2` (`close/IDEMPOTENCE-798d4d2.txt`) and at R2
  (`close/IDEMPOTENCE-c42afe1c189f2a1ecbe175f6e4ea4f9065c138d7.txt`); the standalone close
  census re-run printed four `W04` duplicate-url warnings with `EXIT=0`
  (`close/harm-battery.txt`) — warnings do not gate the exit code. Precedent: `LOG.md`
  round-50 closure line, "R51-1..R51-4 honored (…; live-census limit)".

- **Item-count supersession is named counter-obsolescence, not regression (R56-V2 →
  R57-2).** Both H5 transcripts — `close/prior-probes.txt` (prior counters re-run at R1
  `f0dc6d1…`) and `close/prior-counters-at-close.txt` (at `b3bd0633…`) — show
  `ATTEST54_UNMET`, `ATTEST55_UNMET`, `ATTEST56_UNMET`, each `held=9/10` with only
  `B7 MISS row=true items=27 item24/25/26=true`: every named item-id→gate binding still
  holds; solely the frozen `exactly 24`/`exactly 25`/`exactly 26` checklist-count literals
  fail against the superseding 27-item `## Verifiable checklist`. Those three counters can
  never again print `HELD` at any revision carrying the 27-item checklist; their prior
  `HELD` receipts remain valid at their own rounds' revisions. A53 (17/17, `B7a`–`B7d`
  conjunct form carries no count literal) and all four D53–D56 doctrine counters (no
  checklist term) stay `HELD` in the same transcripts — the MISSes are the specific
  count-literal class, not drift. The same fate is reserved *by construction* for A57's own
  B7 (`items === 27` + full binding 24→`counter-pins.mjs`, 25→`source-capture.mjs`,
  26→`source-dupes.mjs`, 27→`readme-map.mjs`) at the next capability acquisition;
  `plan.md` §Harm battery H5 and `corpus/lessons/round-57.md` (R56-V2, fix R57-2) record
  this as the intended, named cost of a capability acquisition — never hidden, and future
  superseding rounds must re-express every item binding, not only the newest.

- **B5c lineage (R52-5) is transcript-attested, not judge-time re-derived.** Lineage:
  round-52 routed defect R52-5 — a hold-call-deleted counter printing vacuous
  `held=0/0 exit 0` — was answered by check B5c plus the probe's own checks-nonempty guard
  (`.ufo/waves/round-52/plan.md`; `attest52-probe.mjs` guard). The round-57 form
  (`attest57-probe.mjs` header "B5c VACUOUS-HELD guard (R52-5 lineage)", block `// B5/B5c`)
  requires the extracted tree to carry
  `.ufo/waves/round-57/build/MutCounter57/counter-mutant.txt` — committed at R2 (`git
  ls-tree` verified) — whose transcript shows the `sed 's/\bhold(/void(/g'` hold-call-deleted
  A57 mutant printing `ATTEST57: ATTEST57_UNMET held=0/0 checks=0 … | hold-call-deleted`,
  `exit=1`, plus a regex over this probe's own pinned bytes for the checks-nonempty guard;
  both are conjuncts of scored check **B5** (the receipt prints ten checks B1..B10 — there
  is no separately counted `B5c` line; the `B5 PASS` in `close/FINAL-attest57-R1.txt` and the
  R2 `IDEMPOTENCE` transcript covers both). Three limits ride on this: (i) the counter
  verifies the committed transcript by regex and never re-executes the mutant — the
  transcript's own claims (18 replaced sites, the sed recipe, the scratch rev) are committed
  data, not re-derivation; (ii) the referenced scratch conformant post-state rev
  `1cd6d667e20075fd2e77e6e655bc755f95e3d940` (shared by `witness/scratch-held-attest.txt` and
  `witness/scratch-held-doctrine.txt`, both HELD at that rev) is not an object in the lane
  repo (`git cat-file` exit 128) — the mutant run and the scratch-HELD witness are not
  reproducible from lane history alone; note the doctrine witness's `E5 PASS` at that scratch
  rev was still a live-tree census read, per the E5 arm above; (iii) the checks-nonempty
  guard is self-referential by design — the judged bytes carry the guard, pinned by sha256
  in `.ufo/pins/counter-pins.json` under B5.

## Evidence → conclusion map

| Limit | Key artifacts | Observed |
|---|---|---|
| Prepared-wave convention | `w1-taskcall.json`, `w1-validate.json`, `w1-spec.json`, `w1/swarm-registry.json`, `plan.md`, `corpus/lessons/round-57.md` | `prepared` / `dispatched:false` / 64 seats / 0.375 attack — corroborated |
| E5 live-only | `probe/doctrine57-probe.mjs` (header + E5 arm), `close/FINAL-doctrine57-R1.txt`, `close/IDEMPOTENCE-*.txt`, `close/harm-battery.txt`, `LOG.md` | spawnSync of live census path; `E5 PASS` at three revs; census `EXIT=0` w/ 4×W04 — corroborated |
| Item-count supersession | `close/prior-probes.txt`, `close/prior-counters-at-close.txt`, `plan.md` H5 + §Routed-defect, `corpus/lessons/round-57.md` | A54/A55/A56 `UNMET 9/10` `B7 MISS … items=27 item2n=true` at both close revs; A53 17/17, D53–D56 5/5 — corroborated |
| B5c lineage | `.ufo/waves/round-52/plan.md`, `probe/attest57-probe.mjs`, `build/MutCounter57/counter-mutant.txt`, `witness/scratch-held-*.txt`, `close/FINAL-attest57-R1.txt` | committed transcript `ATTEST57_UNMET held=0/0 checks=0 exit=1`; folded into B5 (no separate B5c receipt line); scratch rev absent from lane repo — corroborated |

## Conflicts / anomalies (verbatim, none falsifying)

1. `close/prior-counters-at-close.txt` prints `exit=0` after the `ATTEST55_UNMET` and
   `ATTEST56_UNMET` lines (the same transcript shows `[attest54] exit=1`). The probe
   contract is UNMET → exit 1; the stray `exit=0` echoes read as pipeline-exit capture
   artifacts. Not re-run (do-not-rerun discipline); both H5 transcripts agree on the
   substantive verdicts.
2. Transcript detail truncation: `prior-probes.txt` truncates the A54–A56 MISS details at
   80 chars (`items=27 it` cut-off); `prior-counters-at-close.txt` carries the full
   `item24/25/26=true` details. Reported, not repaired.
3. Commit message of `b3bd0633` ("round-57: readme-map capability gate + worker-heartbeat-
   liveness frontier entry (S117-S120)") overlaps R1's described tree; observed chain
   `f0dc6d1 → b3bd0633 → 798d4d2 → c42afe1`, trees differ. Receipts cite `f0dc6d1` as the
   measured close revision and `798d4d2`/`c42afe1` as re-run revs — consistent with the
   plan's R1/R2/R3 close sequence as committed.

## Known limits of this seat's evidence

- Reads the frozen/committed artifacts as committed at R2; prior-round probe internals
  (e.g., A54's exact B7 conjunct list) were not re-read — the MISS details in the transcripts
  are the ground for the supersession claim.
- Did not re-run A57/D57 or the census; all verdict citations are to the committed receipt
  and transcript files.
- The draft section above is a drop-in; integration into the round report is the
  report-author seat's call.

## Installs / tooling

None installed or updated (pacman paused host-wide; no install needed this round).

## Trailer

- Report: `.ufo/waves/round-57/w1/ScribeLimitations.md`
- Evidence capture: `.ufo/waves/round-57/build/ScribeLimitations/commands-and-outputs.md`
- Lane root: `/home/vgpnk/Projects/shokunin/kumitate-shokunin` — paths above are relative to it.
