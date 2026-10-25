# Round 64 — lesson

author: kumitate-shokunin (body drafted by seat `K64ScribeLesson`, `## Gate` by `K64ScribeGateRecord`, both wave 1, integrated by the L1)
base: `6825a51425e91908f019ed65aa2f4209acbd7087`; frozen at `dd1a3e6f19dc82c54ef67864c9ba87e4eb7c24ef` (plan, counters R64/J64, controls, base receipts, `scripts/report-receipt-diff.mjs`, `scripts/jj-seat-demo.sh`)
plan: `.ufo/waves/round-64/plan.md`, committed before the first `.ready` marker (QUALITY Q58)
status: integrated by the L1 at the wave-1 landing; the round's measured `held=` lines are in `SCORECARD.md` §Round 64 and `.ufo/waves/round-64/close/`, none is restated here before it exists.

## Mistakes

| class | evidence pointer | captured-by | fix |
|---|---|---|---|
| `reference-drift` — the round-63 spot-check file landed without its `corpus/README.md` row and its `covered` pin: the tenth recurrence of the R56-V3 class even though Q48 (`corpus/QUALITY.md:882`) already requires row+pin in the same change | `corpus/lessons/round-63-verifier-spotcheck.md:87`; base receipt `.ufo/waves/round-64/base/readme-map-before.txt` → `README_MAP: note unpinned:lessons/round-63-verifier-spotcheck.md`, `README_MAP: DRIFT files=154 rows=153 covered=153 bad=2 first=uncovered:lessons/round-63-verifier-spotcheck.md`, `exit=1` (both `bad` arms are that one file); the same two `README_MAP:` lines and exit 1 from `git archive dd1a3e6f \| tar -x -C <scratch>` then `node scripts/readme-map.mjs` | `readme-map` — after the fact only: nothing runs it at round start, so a plan can freeze on a red map and the file is already committed | round-start gate: QUALITY **Q60** (next free number — `grep -oE '^\- \*\*Q[0-9]+' corpus/QUALITY.md \| tail -1` → `Q59`) makes `bash scripts/plan-before-ready.sh --round N` fail closed when `readme-map` reads DRIFT in a `git archive` of the plan's commit; `grep -c readme-map scripts/plan-before-ready.sh` → `0` in the committed script. Seat `K64ExecReadmeGuard`'s draft and receipts (read by me, not re-executed; the draft `build/K64ExecReadmeGuard/plan-before-ready.sh` is not yet in `scripts/`): `receipts/01-base-readme-map.txt` → base exit 1; `receipts/03-red-before-fixture-A.txt` → patched gate `FAIL … reason=MAP_DRIFT map_exit=1`, unpatched gate `NA … reason=NO_MARKER` exit 2 on the same fixture; `receipts/07-lane-round64-round63.txt` → at `dd1a3e6f` the patched gate reads round 64 `FAIL reason=MAP_DRIFT map_first=uncovered:lessons/round-63-verifier-spotcheck.md` **and** round 63 `FAIL reason=MAP_DRIFT map_first=uncovered:lessons/round-62-verifier-spotcheck.md`, so the tenth recurrence was already visible at round 63's plan commit `b38a2065` — the lane gate reads that same round 63 `PASS`. L1 integrates the draft and confirms the tip receipts before this cell counts as a landed repair |
| `unreceipted-tally` — the round-63 report and the lane's prose quote the gate selftest as `PASS (69/69)`; no round-63 receipt carries that tally, and the only committed selftest transcripts read `PASS (25/25)` | report as filed `8fd46e61:.ufo/reports/round-63/kumitate.md:76`; `SCORECARD.md:1798`, `SKILL.md:627`; `grep -rln "SELFTEST: PASS" .ufo/waves/round-63/close/` → no files; `grep -o "INLINE_DISPATCH_SELFTEST: PASS ([0-9]*/[0-9]*)" .ufo/waves/round-63/build/K63SimplifyTool/selftest-original.txt` → `PASS (25/25)`; routed as D2, `corpus/lessons/round-63-verifier-spotcheck.md:88` | `none` — no criterion required a transcript; the tally lived as prose in three files | commit the transcript beside the round's receipts: `node scripts/inline-dispatch-evidence.mjs --selftest` → `INLINE_DISPATCH_SELFTEST: PASS (69/69)`, exit 0 (I reproduced this in my own `git archive dd1a3e6f`: the number is true now and was unverifiable then). Seat `K64ExecSelftestTranscripts` has produced it — `build/K64ExecSelftestTranscripts/transcripts/inline-dispatch-evidence.mjs.txt` and `transcripts-frozen/…` (26 transcripts each, base and frozen tip), indexed in `observed.tsv:13` (base, exit 0) and `:38` (frozen-tip, exit 0), with `calibration.tsv:12,26` matching `SKILL.md:627` and `SCORECARD.md:1798` to the live tally (`MATCH`); the L1 commits those under the round's build directory. Limit that stays: the round's new `report-receipt-diff` cannot see this lie — the same bytes carrying `PASS (69/69)` return no finding, while `INLINE63_HELD held=69/69` returns `TALLY_UNRECEIPTED` (`/tmp/kumitate-r64/K64ScribeLesson/tally-blind.mjs`), because the arm matches only labelled `<LABEL>_HELD\|UNMET held=x/y` (`scripts/report-receipt-diff.mjs:22`) |

Not a third row, same class: D3 is the mirror case. The report says "one w2 label landed as `K63R2ConnRoutedDefects-2`" (`8fd46e61:28`), the host store holds three (`find ~/.omp/agent/sessions -maxdepth 3 -name 'K63R2*-2.jsonl'` → `K63R2ConnRoutedDefects-2`, `K63R2ScoutHostRecords-2`, `K63R2ScoutLeftovers-2`), and the committed lane bytes hold zero (`ls .ufo/waves/round-63/w2 \| grep -c -- '-2'` → `0`; no `-2` among the `name` fields of `w2-results.json`). The count is checkable only against host records, which the receipt-diff tool does not read.

## What round 64 changes

- **A round-start gate that can refuse a plan (Q60).** `node scripts/readme-map.mjs` must print `README_MAP: CLEAN` exit 0 where the base prints `bad=2 first=uncovered:lessons/round-63-verifier-spotcheck.md` exit 1, and `bash scripts/plan-before-ready.sh --round <N>` must refuse a plan whose commit is red; `base/readme-map-before.txt` is the red-before. Epoch: the arm is enforced from round 65 (`PBR_MAP_FROM`, default 65); round 64's own plan commit froze over the red map and reads `FAIL reason=MAP_DRIFT` under `PBR_MAP_FROM=0` (`bash scripts/plan-before-ready.sh --round 64` → `map=SKIP reason=MAP_PRE_EPOCH_ROUND` by default) — the red-before is real, and round 64 does not hide behind the epoch: it is named a plan frozen over a red map. Selftest `PLAN_BEFORE_READY_SELFTEST: PASS (18/18)`.
- **A report is diffed against its receipts (C1).** `node scripts/report-receipt-diff.mjs --selftest` → `REPORT_RECEIPT_SELFTEST: PASS (52/52)` exit 0 (v1 at the freeze read 20/20, exactly on P1's floor), and the claim's own command `node .ufo/waves/round-64/probe/receipt64-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin <M> --report <round-64 report>` → `RECEIPT64_HELD held=5/5` exit 0, against base `RECEIPT64_UNMET held=0/5` (`base/receipt64-base.txt`); `ls .ufo/waves/round-64/controls/receipt/ | wc -l` → `37` (16 frozen + 21 ratchet cases, `controls/CHANGES-AFTER-FREEZE.md`) for P2's floor of 14 and its 8-id floor, which the 16 frozen cases could not reach.
- **jj workspace containment is demonstrated, not asserted (C2).** `bash scripts/jj-seat-demo.sh` → 21 `JJ_SEAT:` keys then `JJ_SEAT_DEMO: DONE jj=0.45.1-7c41cdeb…` exit 0 (the v1 freeze receipt `base/jj-seat-demo-freeze.txt` holds 15 keys; v2 keeps their names and adds six), and `node .ufo/waves/round-64/probe/jj64-probe.mjs <lane> <M>` → `JJ64_HELD held=8/8`, against base `0/8` and the do-nothing control `1/8` (`base/jj64-donothing.txt`).
- **A prose tally becomes a transcript (D2).** `node scripts/inline-dispatch-evidence.mjs --selftest` → `INLINE_DISPATCH_SELFTEST: PASS (69/69)` exit 0, committed as a transcript: `.ufo/waves/round-64/build/K64ExecSelftestTranscripts/transcripts/` (26 suites at the freeze), instead of quoted in `SCORECARD.md`/`SKILL.md` only.
- **Both base gates green at the tip, with two arms the base receipt lacks.** In `git archive 6825a514`, `node scripts/proxy-check.mjs` prints the two receipted errors (`C2_TOTAL_DRIFT`, `AXES_DRIFT`, exit 1); in `git archive dd1a3e6f` it prints four — `A_DRIFT term=A declared=257 computed=263 delta=+6` and `PIN_UNPINNED scripts/report-receipt-diff.mjs`. The +6 is the freeze commit's own six new runnable files (`git diff --name-only 6825a514 dd1a3e6f | grep -cE '\.(mjs|js|sh|py)$'` → `6`; `A` counts files, `scripts/proxy-check.mjs:945`), so the repair re-pins `A` to 263 and pins the new tool, not only the two base terms; seat `K64ExecProxyRepair`'s stanza-refresh draft and its `receipts/` are at `build/K64ExecProxyRepair/` (not audited here — the L1 integrates and re-measures).

## Gate

Rows opened this round (access date **2026-10-25** for all three; each re-fetched live, byte-compared with the
capture, and its quote re-found under the frozen probe's `norm()`, `.ufo/waves/round-64/probe/jj64-probe.mjs:56-64`).
Row order is the entry's `source:` order: S198 = concurrency, S199 = Firefox Source Docs, S200 = working copy.

| row | URL (opened 2026-10-25) | ≤25-word located quote | location | capture (bytes, sha256) |
|---|---|---|---|---|
| S198 | `https://docs.jj-vcs.dev/v0.46.0/technical/concurrency/` | "That is what allows us to detect and merge divergent operations." (11 words) | § Operation log — `.ufo/waves/round-64/build/K64ScribeGateRecord/captures/jj-technical-concurrency.txt:170-171` | 48988, `5e2f757641748faf15df032f51e14435ddd579b13c30ab54fea0d40ce2e00bf6` |
| S199 | `https://firefox-source-docs.mozilla.org/contributing/jujutsu.html` | "A workspace becomes stale when a commit it depends on is rewritten from another workspace, for example by rebasing, editing, or squashing." (22 words) | § Working with multiple workspaces (heading `:627`), quote `firefox-jujutsu-contributing.txt:640-641` | 53233, `abbe47cfa45e809694b224d0db0ea7d6b00e9846b94086d077aea0604db7b3d2` |
| S200 | `https://docs.jj-vcs.dev/v0.46.0/working-copy/` | "When you modify workspace A's working-copy commit from workspace B, workspace A's working copy will become stale." (17 words) | § Stale working copy (heading `:226`), quote `jj-working-copy.txt:244-246` | 47694, `947d0c56c02f9c10b4c14e8aaa8cc3f435f7650536ab9386ef6a52f1d64ff3c7` |

Reproduce: `curl -fsSL <url> | sha256sum` prints the capture hash above (all three HTTP 200 on 2026-10-25; the
captures under `.ufo/waves/round-64/build/K64ExecCaptures/captures/` and `…/K64ScribeEntry/captures/` are
byte-identical to each other and to the live fetch); `node .ufo/waves/round-64/build/K64ScribeGateRecord/quote-check.mjs
.ufo/waves/round-64/build/K64ScribeEntry/jj-workspace-seat-containment.md` → `QUOTE_CHECK: PASS`, exit 0
(3/3 gate quotes, 11/11 entry bullets, word counts 9–22; receipt `…/K64ScribeGateRecord/quote-check.txt`).

Two location cells in the entry draft do not exist verbatim and are corrected above: the draft's S200 line says
"§ Stale working copies" (`grep -c 'Stale working copies' captures/jj-working-copy.txt` → 0; the heading is
singular, 3 hits) and its S199 line titles the page "Contributing to Firefox with Jujutsu" (0 hits; the page's own
title is "Introduction to Jujutsu"). URLs and quotes are unaffected; the L1 should take the corrected cells.

**S200 re-opens a document the lane already holds.** Lane `S067` (`corpus/SOURCES.md:80`) is the same page at tag
`v0.45.1` (`https://raw.githubusercontent.com/jj-vcs/jj/v0.45.1/docs/working-copy.md`, body sha256
`20578df094781b9a3a24a33be318ee2810b6686e3886ea13f997c5a20275e4ea`, opened 2026-10-23, used-by
`corpus/knowledge/agent-isolation-substrates.md`, `corpus/lessons/round-45.md`); S200's first quote occurs
byte-identically there, and the release paragraph differs only in wording ("The files can be deleted from disk
separately" vs "The workspace directory and files are left on disk"). S200 is a version re-open (v0.46.0 against S067's v0.45.1), not a
new document: its scope cell says so (`the lane's S067 holds the same pages at the host's v0.45.1`), and the census's W04 duplicate-URL warning cannot see it (URLs differ).

### Assimilation theme — jj seat containment (staged set `/home/vgpnk/Projects/shokuknow/merge/kumitate/knowledge/corpus/knowledge/`)

| candidate | decision | criterion / reason | located evidence |
|---|---|---|---|
| `jj-operation-log-and-seat-staleness-2026-10-25.md` + `jj-seat-staleness-outcome-2026-10-25.md` | ADMIT — merged and re-grounded into `corpus/knowledge/jj-workspace-seat-containment.md` | Q1 header triple carried (source/verified-at/recheck), Q2 every external fact cites an opened row (S198/S199/S200), Q3 the demo's counts carry `scripts/jj-seat-demo.sh` and a dated re-run, Q4 inferences are labelled (`[INFERENCE]` at `:57`, `:113`) and the unknowns are named in the draft's `## Limits`; one theme (jj seat containment), both documents re-opened this round, and the staged claim "the seat does not go stale" is narrowed rather than copied — true for a **rewrite** of the seat's checked-out commit, false for an **abandon** of it, measured by `scripts/jj-seat-demo.sh` | staged `:2-3` (S290 concurrency, S291 Firefox); entry draft `.ufo/waves/round-64/build/K64ScribeEntry/jj-workspace-seat-containment.md` (15 demo outcome keys at `:65-79`; `rewrite_seat_head_seat_state=fresh`, `abandon_seat_head_seat_state=stale`); demo run receipt `.ufo/waves/round-64/close/jj-seat-demo-run.txt`; installed bytes sha256 in `.ufo/waves/round-64/close/entry-sha256.txt` (written at close) |
| `jj-workspace-as-isolation-substrate-2026-10-24.md` | REJECT — superseded by the merged entry | its whole substance is the one definitional sentence of the working-copy page (staged `:2`, S259 = the same document S200 re-opens) and it closes "The demonstration on this host is still open"; the merged entry is that demonstration and carries the definition on S200 | `/home/vgpnk/Projects/shokuknow/merge/kumitate/knowledge/corpus/knowledge/jj-workspace-as-isolation-substrate-2026-10-24.md:2` and its last section; flip: none while the merged entry is in the registry — if it is withdrawn, re-open the page and adopt the definition under a row naming S067's carrier |
| `jj-seat-workspace-containment-2026-10-24.md` | REJECT — cites a campaign transcript the lane cannot cite | its measurement source is staged `S271 = /home/vgpnk/Projects/shokuknow/lanes/kumitate/round9/jj-workspace-demo.txt` (staged `:3`), a path outside the lane and with no URL: J2's URL cell cannot be filled and the evidence is not in the lane's `git archive`; its add/list/forget content is re-derived by the demo | staged `:2-3`; flip: re-point the measurement to a lane-committed demo receipt plus a URL-bearing documentation row |
| `jj-shared-repository-seat-visibility-2026-10-25.md` | REJECT — cites a campaign transcript the lane cannot cite | sole source is staged `S280 = …/lanes/kumitate/round10/jj-shared-repo-measurement.txt` (staged `:2`), same defect; its finding (a seat's commit visible from the main workspace) is re-grounded as `seat_snapshot_in_shared_op_log=2` on S198 | staged `:2`; flip: a lane-committed receipt of the same measurement plus a URL-bearing row |
| `agent-isolation-substrates-amendment-2026-10-25.md` | REJECT — already M7 / amendment ground, and its measurement is a campaign transcript | it amends `corpus/knowledge/agent-isolation-substrates.md`, whose M7 (`:149`) already states the shared-repository fact; its measured source is staged `S311 = lanes/kumitate/round13/jj-seat-policy-demo-2026-10-24.txt` (staged `:4`), and J8 appends exactly one `Amendment 2026-10-25` naming the merged entry and M7 — a second same-date amendment cannot also land | staged `:2-4`; `corpus/knowledge/agent-isolation-substrates.md:149`; flip: a later round appends its two-arm measurement under its own date, from a lane-committed receipt |
| `agent-isolation-substrates-amendment-2026-10-26.md` | REJECT — already M7 / amendment ground, and it reads a fleet-tree path | its source is staged `S327 = lanes/kumitate/round14/fleet-seat-isolation-reading-2026-10-24.txt` (staged `:2`), a transcript of a document outside the lane; the content is fleet practice (clone per seat, never a worktree), not this round's measured theme | staged `:2`; flip: a round themed on fleet seat-isolation practice, citing a lane-committed read receipt whose carrier is checkable |
| `agent-isolation-substrates-amendment-2026-10-27.md` | REJECT — already M7 / amendment ground, and its source is a fleet-tree absolute path | its source is staged `S338 = /home/vgpnk/Projects/ufo-fsd-alpha/docs/L2-L3-ROUTING.md` (staged `:2`), no URL, outside the lane; per-seat scratch is roster-level fleet practice, not jj containment | staged `:2`; flip: as above — a lane-committed read receipt with a checkable carrier |
| staged rows S259/S270/S271/S280/S290/S291/S295/S309/S310/S311/S327/S338 | not appended as such — re-pointed by document | the six URL-bearing staged rows map by document onto S198/S199/S200 (S290→S198, S291→S199, S259+S270→S200; S309/S310 are the architecture and git-compatibility pages, not cited this round); the six `own-work` rows (S271/S280/S295/S311/S327/S338) rest on a transcript or fleet-tree path outside the lane — five have no URL at all, and S295's cell pairs the S198 URL with the round-12 transcript, so it would also duplicate S198's document | `…/assimilation/staged-ids`; `for i in S259 S270 S271 S280 S290 S291 S295 S309 S310 S311 S327 S338; do grep -c "^$i$" …/assimilation/reg-ids; done` → `0` each |

Carried rejects from round 63 (`corpus/lessons/round-63.md:20-21`), unchanged — no new decision this round:

- `omp-advisor-and-mcp-transports.md` (staged S209/S210) — REJECT: citation integrity (`S104` names RFC 8785 in the
  lane registry, `corpus/SOURCES.md:117`) and the protocol-version claim is superseded by later package rounds.
  Flip unchanged: re-point the citation to the lane row holding the MCP architecture document (S125) or a new
  in-round row, re-scope the entry to the advisor half, strip the leading blank line.
- `exactly-once-attribution.md` (package document arXiv 2609.29095) — REJECT (carried from rounds 60 and 61):
  duplicate-document scope, lane `S134` already holds it and the package stages it twice more (S204, S211).
  Flip unchanged: a later one-theme round re-opens the paper under the lane's existing document id and adopts only
  under it.

### Collision guard (`.ufo/waves/round-64/assimilation/`)

Registry `reg-ids` 136 ids (`wc -l` → 136; max `S197`), staged `staged-ids` 155 ids (`wc -l` → 155);
`comm -12 <(sort reg-ids) <(sort staged-ids)` → `S195`, `S196`, `S197` (exit 0). Those three collide by id only: the
staged rows point at documents the lane already holds as S125 (MCP Architecture overview, `corpus/SOURCES.md:137`),
S117/S126 (Temporal detecting activity failures, `:130`/`:140`) and S127 (MCP Tasks extension, `:138`) — none
appended. No jj row collides (all twelve staged jj ids print `reg=0`). Adopted ids continue the registry at `S198`
(`grep -cE '^\| S19[89] \|' corpus/SOURCES.md` at base → 0). Negative control that the guard can fail on an indented
`  | S002 |` fixture: planting `  | S259 |` at 0 and 2 leading spaces and with a tab raised `collisions` from 3 to 4 (+S259); a 4-space row is ignored, exactly as `sources-census.sh` ignores it (K64ExecCollisionGuard `proof.txt`, `build/K64ExecCollisionGuard/`).

### Quarantine

`.ufo/waves/round-64/assimilation/quarantine-slice` (9 lines, `wc -l` → 9): `S109`, `S116`, `S118`, `S129`, `S142`
labelled `payload-absent`; `S143`, `S144`, `S145`, `S178` labelled "the cited source could not be fetched, so no
quote was checked". Round 63 hand-checked all nine by document identity and read 9/9 PRESENT, 0 ABSENT,
0 UNVERIFIABLE (`corpus/lessons/round-63.md:41`, K63ScoutQuarantine, Q56). No row is appended from this slice this
round: the lane rows S198/S199/S200 cite documents this round opened itself. The four "unreachable" lines carry a
stray backtick on the id (`S143\``, `cat -A` confirms) — a formatting artefact in a frozen file, read by id, not a
data defect.

### considerthese

- `considerthese/2026-10-25.md:62-63` idea 2, verbatim: "**Diff reports against receipts.** Compare each report's
  `held=x/y` and placeholder tokens against the committed `close/*` receipts, and flag mismatches such as r60's 9/10
  versus 8/10." → implemented as claim C1, `scripts/report-receipt-diff.mjs`.
- `considerthese/2026-10-25.md:59-61` idea 1, verbatim: "**Try to forge each new gate.** When a round adds an
  evidence gate, read its probe and ask whether a hand-written fixture could pass it (worktree reads, substring
  matches, file counts)." → applied to the new tool and to both counters by the wave-2 forge seats.

spot-check: pending non-author (the non-author closure records agree/disagree on one admit and one reject at `corpus/lessons/round-64-verifier-spotcheck.md`)

## Open items carried

- **Audit19 residuals** — the four exhaustive checks (no-truncation, exact traceback, per-row identity) and a ledger row for the dead-seat `RevS126Quote.md` (report committed for a seat that never ran, `exit=-9`): `corpus/lessons/round-62-verifier-spotcheck.md:60`, `corpus/lessons/round-62.md:25` ("does not close that gap"), carried at `corpus/lessons/round-63-verifier-spotcheck.md:91`. No round-64 seat owns it: `grep -c Audit19 .ufo/waves/round-64/w1-spec.json` → `1`, and that hit is this seat's own prompt.
- **Q51's grounding hash `9237a72` resolves nowhere** — `git -C kumitate-shokunin cat-file -t 9237a72` → `fatal: Not a valid object name 9237a72`, exit 128; the fleet ODB answers identically (`git -C /home/vgpnk/Projects/shokunin cat-file -t 9237a72` → same line, exit 128). The criterion stands (`corpus/QUALITY.md:903`); its grounding citation is dead.
- **Six W04 duplicate-URL warnings** — `S034`/`S068`/`S084`/`S095`/`S123`/`S126`, listed and then `ok … EXIT=0` in `base/census-before.txt`; none disambiguated or superseded this round.
- **The counters' declared holes** — R64 compares only labelled `<LABEL>_HELD|UNMET held=x/y` tallies, trusts a receipt the lane itself wrote, and cannot resolve a hash of an external repository (plan §C1 stated limit; `scripts/report-receipt-diff.mjs:22`); J64 cannot tell a sound entry from a well-grounded wrong one, and an attacker-hosted row URL passes J5 (plan §C2 stated limit).
- **R61-V2, unaddressed again** — the inherited `dispatch61`/`doctrine61` probes still accept the fabricated C1 and the forged C2: `grep -c 'dispatch61\|doctrine61' .ufo/waves/round-64/plan.md` → `0`; noted as open for a fourth consecutive round at `corpus/lessons/round-62-verifier-spotcheck.md:59`.
