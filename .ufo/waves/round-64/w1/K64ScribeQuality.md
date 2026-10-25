VERDICT: Q60 and Q61 are drafted as appendable QUALITY.md rows with every quoted number re-derived on this host (arm red at round 64's own plan commit, tool DRIFT on r60 and CLEAN on r63), plus an append-only Q51-C1 correction because Q51's grounding hash `9237a72` resolves in neither repo and is a transposition of the real lane commit `923a172`.

## Evidence

All commands run from `/home/vgpnk/Projects/shokunin/kumitate-shokunin` (lane) unless stated; fleet = `/home/vgpnk/Projects/shokunin`; lane tip read-only at `dd1a3e6f19dc82c54ef67864c9ba87e4eb7c24ef` (plan commit, `git log --diff-filter=A --format=%H -- ':(glob).ufo/waves/round-64/plan.md'` → that hash).

**Format copied** from `corpus/QUALITY.md:938-997` (Q56–Q59): rule sentence + `Grounding:` + `Who checks` / `Command` / `Fails when` / `Shown able to fail` / `Limit`, with Q58's extra `Field`/`Epoch` sub-bullets. Q59 is the file's last row, so Q60/Q61 are the next free numbers.

**Q60 — round-start readme-map gate.**
- Red at the commit that carries the plan, my own archive run (not the guard's receipt):
  `git archive dd1a3e6f… | tar -x -C /tmp/kumitate-r64/K64ScribeQuality/archive-dd1a3e6 && (cd … && node scripts/readme-map.mjs)`
  → `README_MAP: note unpinned:lessons/round-63-verifier-spotcheck.md` / `README_MAP: DRIFT files=154 rows=153 covered=153 bad=2 first=uncovered:lessons/round-63-verifier-spotcheck.md`, `exit=1` (`.ufo/waves/round-64/build/K64ScribeQuality/q60-readme-map-at-plan-commit.txt`).
- The arm exists as a draft (`build/K64ExecReadmeGuard/plan-before-ready.sh`, 18105 bytes, landed while I worked). I re-ran it read-only:
  `bash .ufo/waves/round-64/build/K64ExecReadmeGuard/plan-before-ready.sh --round 64` →
  `PLAN_BEFORE_READY: FAIL rev=dd1a3e6f19dc82c54ef67864c9ba87e4eb7c24ef round=64 dir=.ufo/waves/round-64 reason=MAP_DRIFT plan=dd1a3e6f19dc82c54ef67864c9ba87e4eb7c24ef plan_ct=1792967888 marker=- marker_kind=- marker_ct=- marker_path=- map=DRIFT map_exit=1 map_first=uncovered:lessons/round-63-verifier-spotcheck.md`, `exit=1`.
  Round 63 for contrast → `reason=MAP_DRIFT plan=b38a2065ab8ac5b198f6569b9013d04411c3d40d … map_first=uncovered:lessons/round-62-verifier-spotcheck.md`, `exit=1` (`q60-draft-arm-run.txt`).
- Sweep: `--all` → `PLAN_BEFORE_READY_SUMMARY: pass=10 fail=12 na=8 rounds=all(30) rev=dd1a3e6f… exit=1 failed=35,36,37,38,39,40,58,60,61,62,63,64 na_rounds=49,52,53,54,55,56,57,59`. Of these, five are the map arm: 58, 60, 61, 63, 64 — four on the *previous* round's spot-check file (58 is `orphan-row:lessons/round-58.md`). Green side is live too: round 57's plan `f0dc6d11…` `map=CLEAN files=135 rows=135 covered=135`, round 59's plan `c5494332…` `map=CLEAN files=141 rows=141 covered=141` (`q60-draft-arm-sweep.txt`).
- Arm semantics read from the draft: RED = `MAP_DRIFT` / `MAP_NO_VERDICT` / `MAP_UNRUNNABLE`, fail-closed `MAP_ABSENT` / `MAP_FAIL_CLOSED`, pre-epoch `map=SKIP reason=MAP_PRE_EPOCH`, and it runs *before* the marker arms so an in-flight round cannot read `NA` over a red map (draft lines 26-46, 137-199).

**Q61 — report diffed against committed receipts.**
- `node scripts/report-receipt-diff.mjs --lane <lane> --round 60 --report /tmp/kumitate-r64/K64ScribeQuality/r60-report.md --rev dd1a3e6f… --fleet <fleet>` → `REPORT_RECEIPT: DRIFT PLACEHOLDER,TALLY_UNRECEIPTED (round=60 rev=dd1a3e6f… bytes=13611)`, six `PLACEHOLDER` lines (`__TIP__`, `__MEASURED__`×4, `__COMMITS__`) and `TALLY_UNRECEIPTED DISPATCH60_HELD held=10/10`, `exit=1`; independent `grep -o '__[A-Z][A-Z0-9_]*__' | wc -l` on the same bytes → `6`. The contradicted receipt: `git show HEAD:.ufo/waves/round-60/close/dispatch60-tip.txt` → `DISPATCH60: DISPATCH60_UNMET held=8/10 checks=10 rev=a745a3b0e02253e722834ef95042d97ed92e5e53 rule=A60` (`q61-r60-report-drift.txt`).
- `--round 63 --report <r63 as filed>` → `REPORT_RECEIPT: CLEAN (round=63 rev=dd1a3e6f… bytes=17479)`, `exit=0`; `--selftest` → `REPORT_RECEIPT_SELFTEST: PASS (20/20)` `exit=0`; `ls .ufo/waves/round-64/controls/receipt | wc -l` → `16` (`q61-r63-report-clean.txt`).
- Declared limits read from the tool header (`scripts/report-receipt-diff.mjs:5-23`): labelled tallies only; a lane-written receipt is trusted as written; `HASH_DEAD` cannot resolve an external repo's hash. One limit measured, not quoted: a report claiming `held=9/10` (unlabelled) against round 64's base receipt reading `held=0/5` → `REPORT_RECEIPT: CLEAN (round=64 … bytes=437)`, `exit=0` (`q61-cheap-lie-bare-tally.txt`).

**Q51 grounding hash.**
- `git -C <lane> cat-file -t 9237a72` → `fatal: Not a valid object name 9237a72`, `exit=128`; same in the fleet; `git cat-file --batch-all-objects --batch-check | grep -c '^9237'` → `0`. The intended object is `923a172` (`cat-file -t` → `commit`, `round-49: record addendum — C2 re-scored 16/16 at 01b70bb0, LOG line for prior-art citations and the mount-binds disambiguation`), cited correctly at `corpus/lessons/round-49-verifier-spotcheck.md:10`. Q51's other instances resolve: `01b70bb`, `c432cc9`, `e7a0711`, `26c886d` → `commit` (`q51-hash-resolution.txt`).
- Blanket sweep of `corpus/QUALITY.md` (55 distinct hex tokens) → 9 non-resolving: `0011223344556677`/`aabbccddeeff0011` (seeds, line 546), `03a258d6`, `0c1f9b22`, `3a32dd34`, `6faa34ab`, `d6068d1b` (content digests, lines 766/845/320/745/320), `c7f7c401` (pinned in `source-captures.json`, `source-dupes.json`), and `9237a72` — the only one presented as a commit.

## Findings

**K64ScribeQuality-1 (medium) — the new map arm is unexercised by its own selftest, so Q60's "command that can fail" rests on live history only.**
Attacks: the criterion I drafted. `bash .ufo/waves/round-64/build/K64ExecReadmeGuard/plan-before-ready.sh --selftest` → `PLAN_BEFORE_READY_SELFTEST: PASS (10/10)`, `exit=0`, and 9 of the 10 case verdict lines read `map=SKIP` (`MAP_PRE_EPOCH`, or `NO_PLAN`); the tenth case (`all-rounds-enumeration`) prints only a summary line. No fixture plan commit has a red map, a green map, or a removed gate, so a refactor that stops calling the arm still passes 10/10. Reproduce: `bash .ufo/waves/round-64/build/K64ExecReadmeGuard/plan-before-ready.sh --selftest | grep -c 'map=SKIP'` → `9` of `grep -c 'SELFTEST ok'` → `10` (receipt `q60-draft-arm-selftest.txt`). Fix belongs to the guard/L1: three cases (red-map → `FAIL reason=MAP_DRIFT`, green-map → PASS with `map=CLEAN`, gate-removed → `reason=MAP_ABSENT`) and a selftest floor of 13/13.

**K64ScribeQuality-2 (medium) — round 64's own plan is frozen on a red map; the plan's declared repair is not yet landed.**
Attacks: Q60's green side for this round and the plan's "Maintenance repairs (not claims): `readme-map` DRIFT … must read clean at the tip". At lane tip `dd1a3e6f`, `node scripts/readme-map.mjs` → `README_MAP: DRIFT files=154 rows=153 covered=153 bad=2 first=uncovered:lessons/round-63-verifier-spotcheck.md`, `exit=1` (worktree, not archive). The arm therefore reads `FAIL reason=MAP_DRIFT` for round 64 today; my row marks round 64 RED-BEFORE and not re-judged, but the L1 must land the row + `covered` pin (and any later corpus file's row in the same change, per Q48) before the round's tip or the round ends red on its own new criterion.

**K64ScribeQuality-3 (low) — Q51's grounding cites a commit that resolves nowhere; the object is `923a172` (digit transposition).**
Attacks: Q51's credibility and Q52's "every citation names a real object". `git -C <lane> cat-file -t 9237a72` → `fatal: Not a valid object name 9237a72`, `exit=128`; the fleet read is identical; no lane object begins `9237`. Reproduce with `q51-hash-resolution.txt`'s loop. Drafted as an append-only `Q51-C1` row (Q51's bytes untouched).

**K64ScribeQuality-4 (low) — `report-receipt-diff` accepts an unlabelled overstatement.**
Attacks: Q61. This is the tool's declared limit, now measured rather than quoted: a probe report claiming `held=9/10` twice against `.ufo/waves/round-64/base/receipt64-base.txt` (`held=0/5`) reads `REPORT_RECEIPT: CLEAN`, `exit=0`. Not a defect against the frozen predicate (the plan states the limit); the ratchet should pin the behaviour as a control so a future tightening is visible. Reproduce: `node scripts/report-receipt-diff.mjs --lane <lane> --round 64 --report /tmp/kumitate-r64/K64ScribeQuality/bare-tally-lie.md --rev dd1a3e6f…`.

**K64ScribeQuality-5 (low) — Q52's scope excludes `corpus/QUALITY.md`, so the admission bar's own grounding hashes are never resolved.**
Attacks: the bar's internal consistency. Q52 names "a committed report, scorecard section or lesson"; a blanket resolution loop over `QUALITY.md` finds `9237a72` (a commit claim) and eight legitimate digest/seed tokens. Either Q52's scope gains `QUALITY.md` (with its pin carve-out, which already covers `c7f7c401`) or Q51-C1 is the only catch, by hand. Reproduce: the sweep in `q51-hash-resolution.txt`.

## Artifacts

- `.ufo/waves/round-64/build/K64ScribeQuality/Q60-Q61.md` — the three appendable rows (Q60, Q61, Q51-C1), receipts referenced inline.
- `.ufo/waves/round-64/build/K64ScribeQuality/q60-readme-map-at-plan-commit.txt` — archive read at `dd1a3e6f`, exit 1.
- `…/q60-draft-arm-run.txt` — draft arm on rounds 64 and 63, both `reason=MAP_DRIFT`, exit 1.
- `…/q60-draft-arm-sweep.txt` — `--all`, `pass=10 fail=12 na=8`, five map-arm failures.
- `…/q60-draft-arm-selftest.txt` — `PASS (10/10)`, all ten `map=SKIP`.
- `…/q61-r60-report-drift.txt`, `…/q61-r63-report-clean.txt`, `…/q61-cheap-lie-bare-tally.txt`.
- `…/q51-hash-resolution.txt` (+ `q-hashes.txt`, the 55-token set).
- Scratch: `/tmp/kumitate-r64/K64ScribeQuality/` (report extracts, `archive-dd1a3e6/`, probe report).
- No tool installed or upgraded; no package transaction run; no lane file, index, jj state or frozen input touched.

## Limits

- I did not integrate anything: `scripts/`, `corpus/QUALITY.md`, `SCORECARD.md`, `.ufo/pins/` are untouched; the rows are drafts for the L1, and the Q60 row's command names the arm's draft path (`build/K64ExecReadmeGuard/plan-before-ready.sh`) — at integration the L1 must re-point it at `scripts/plan-before-ready.sh` and keep the reason tokens (`MAP_DRIFT`, `MAP_NO_VERDICT`, `MAP_UNRUNNABLE`, `MAP_ABSENT`, `MAP_FAIL_CLOSED`) as the draft defines them.
- The guard's own RED-BEFORE receipt was not in `build/K64ExecReadmeGuard/` when I read it (only `plan-before-ready.sh`); my `q60-readme-map-at-plan-commit.txt` and `q60-draft-arm-run.txt` are independent re-derivations, not a substitute for its receipt.
- `corpus/lessons/round-64.md` did not exist at my read (`ls` → No such file), so Q60 cites it as the plan names it (§Mistakes row 1) without having read its bytes; the L1 must reconcile the row's wording with the lesson as filed.
- Q61's row states the tool's *declared* limits plus one measured hole; I did not attempt a full forgery sweep of the other six finding ids (the 16 committed controls cover them, and wave-2 forge seats are the plan's designated attackers).
- The map arm's behaviour under a 300 s timeout, a missing `node`, or a corrupt archive was read from the draft's code, not exercised.

Summary:
Q60 and Q61 are drafted as QUALITY.md-format rows with every figure re-derived on this host: the readme-map arm reads `FAIL reason=MAP_DRIFT` at round 64's own plan commit (and at 58/60/61/63), and `report-receipt-diff` reads DRIFT on r60 (6 tokens + `DISPATCH60_HELD held=10/10` vs receipt `8/10`) and CLEAN on r63.
Q51's grounding hash `9237a72` resolves in neither repo — it is a transposition of lane commit `923a172` — so an append-only `Q51-C1` correction row is drafted and Q51 is not rewritten.
Five findings filed, two medium: the new arm's selftest cannot fire it (10/10 pass, all `map=SKIP`), and round 64's map is still red so the round needs the declared repair before its tip.
