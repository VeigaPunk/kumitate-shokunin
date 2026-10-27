# QUALITY row drafts — round 68 (seat K68ScribeQuality)

Append-only. Insertion point: end of `corpus/QUALITY.md`, after `Q51-C1`'s `**Supersedes.**` bullet
(current last line, `corpus/QUALITY.md:1064`). No existing byte is rewritten; Q60, Q61 and Q51-C1 stay as
they are. Style copied from Q56–Q61 (`- **Qn — sentence.** Grounding: …` + the `**Who checks.**` /
`**Command.**` / `**Fails when.**` / `**Shown able to fail.**` / `**Limit.**` / `**Supersedes.**` bullets).

Every row cites the lesson that produced it (`corpus/lessons/round-68.md`, landed by the L1 this round) and
carries its evidence pointer. Q65 is drafted: the wave surfaced a further mistake — this round's own frozen plan
cites receipts at paths that do not exist and quotes a tally its receipt contradicts
(`plan-vs-receipts.txt`), which is the claim-sentence arm Q63 does not cover.

---

- **Q62 — a capability's registry home is three places or it is not home (round 68) — a `SKILL.md`
  gate-registry row naming the script, a `corpus/QUALITY.md` criterion naming the capability, and a
  `SCORECARD.md` `## Capabilities` row whose first cell names it — and all three name the same round.**
  Grounding: `corpus/lessons/round-68.md` §Mistakes (`registry-home`, round 68). Measured at the round-68
  freeze `39f61816d4ee7a8d401df42c1818c91a9c537bce`: `grep -c 'routed-ledger\.mjs' SKILL.md` → `0`,
  `grep -c 'routed-ledger' corpus/QUALITY.md` → `0`, `grep -c '^| \`routed-ledger\`' SCORECARD.md` → `0`,
  while `grep -c 'routed-ledger' SCORECARD.md` → `1` — `SCORECARD.md:3003`, the round-66 C1 line that itself
  reads "No capability row is entered". The three arms are already the tool's own L6 predicates, and read
  all-false at round 66: `LEDGER66_UNMET held=0/6 checks=6 rev=8d557f85312de4fcc82e09ff735d21436bc3746d
  rule=L66 seed=0d44321a076abff3 | … | L6 MISS skill-row=false quality=false capability-row=false`
  (`.ufo/waves/round-66/base/ledger66-base.txt`). The split-round precedent the third arm exists to catch:
  `receipt-evidence` landed one round after its acquisition — `SCORECARD.md:1797` carries first-working round
  `58` and the row text "Row added in round 59: the round-58 acquisition landed the gate and the pin, and the
  capabilities table did not gain the row (R58-V6)".
  - **Who checks.** The lane L1 in the integration change that lands the capability, before the round's
    close; the non-author closure re-runs the three greps at the round's tip and compares the round token.
  - **Field.** Three independent documents: `SKILL.md`'s gate table (`| name | kind | entry command | self-test |
    pinned values live in |`, header at `SKILL.md:605`) — a data row whose first cell is the gate name and whose
    entry command names the script; `corpus/QUALITY.md` — one criterion whose bold sentence names the capability
    and carries its `(round N)`; `SCORECARD.md` `## Capabilities` (`SCORECARD.md:1777`) — a table row whose
    **first cell** is the backticked capability name. Prose, a `## Round criteria` paragraph, a move-log line or
    the inventory paragraph above the table is not a row.
  - **Command.** For capability `<cap>` and round `<N>`:
    `grep -c "<cap>\.mjs" SKILL.md` ≥ 1; `grep -c "<cap>" corpus/QUALITY.md` ≥ 1 with the matching row carrying
    `(round <N>)`; `grep -c "^| \`<cap>\`" SCORECARD.md` ≥ 1 whose last cell reads `<N>`. The lane's own counter
    for the capability must read `L6 … capability-row=true` at the judged revision. Receipt:
    `build/K68ScribeQuality/registry-home-census.txt`.
  - **Fails when.** Any of the three counts is 0; a capability is named only in SCORECARD prose, a QUALITY
    narrative, a LOG bullet or a report; a SKILL row names the file but not the entry command; or the three
    documents carry different rounds (`First-working round 58` / row "added in round 59" / a SKILL parenthetical
    naming another round) for one capability.
  - **Shown able to fail.** The census command above at the round-68 freeze prints `0 / 0 / 0` against a
    capability that `SCORECARD.md:3003` already discusses by name (`SCORECARD_prose_mentions=1`) — the prose arm
    is not the row arm. Round 66's counter reads the same three arms false on the same capability
    (`.ufo/waves/round-66/base/ledger66-base.txt`). The row-late precedent is `SCORECARD.md:1797`
    (`receipt-evidence`) and `cite-sources` (`SKILL checklist item 29`, first-working round 59).
  - **Limit.** It binds the existence and the round token of three rows, not their agreement in content: a SKILL
    row can carry a stale entry command, a QUALITY criterion can state a weaker rule than the tool implements, and
    a SCORECARD row can overstate what the capability does — all three still pass. It also cannot tell a row
    landed before the round's `.ready` from one written at close (Q58's limit): the three-row check is a
    presence-and-round test, and the round column is lane-authored.
  - **Supersedes.** None. Q53 (report = receipt = SCORECARD section) and Q48/Q60 (corpus rows and map coverage)
    stay in force; this row is the capability-scoped, three-document form of the same bar.

- **Q63 — a receipt names the revision it measured: every probe receipt carries `rev=<full 40-hex sha>` on its
  verdict line, and a receipt that quotes a tip without that tip's committed receipt is a routed defect
  (round 68).** Grounding: `corpus/lessons/round-68.md` §Mistakes (`unreceipted-tip`, round 68), from the r67
  routed D2 lineage (`corpus/lessons/round-67-verifier-spotcheck.md:71`). The r67 freeze commit
  `993a7b16` carries `.ufo/waves/round-67/plan.md` and `.ufo/waves/round-67/probe/ledger67-probe.mjs` and
  nothing else; its `base/` and `controls/` are empty, git cannot commit an empty directory, and yet the plan's
  Before lines name six base receipts and two base tallies — `plan.md:77` (`LEDGER67_UNMET held=0/7` exit 1,
  `base/ledger67-base.txt`), `:79`, `:81`, `:132` (`DEPREC67_UNMET held=0/10`, `base/deprec67-base.txt`), `:134`,
  `:141` — all at base `f29eb699`, none committed. The positive side is this round's own freeze: both base
  receipts carry the full sha (`ledger68-base.txt` and `deprec68-base.txt`, each `rev=d23892ad44b41e1af63b3edb949d265ca1dd812d`).
  - **Who checks.** The lane before it commits a round's `base/` freeze receipts and again at close for `close/`;
    the non-author closure re-derives each receipt's `rev=` and resolves the commit itself, never the report's copy.
  - **Command.** For every receipt under `.ufo/waves/round-<N>/{base,close}/` that carries a verdict or a
    `<LABEL>_HELD|_UNMET ... held=x/y` tally: the line matches `rev=[0-9a-f]{40}\b`, and
    `git -C <lane> cat-file -e <rev>^{commit}` exits 0; a report or plan sentence of the form "at tip/cutoff/base
    `<sha>`" must be backed by a receipt in the same round's `base/` or `close/` naming that sha. Receipts:
    `build/K68ScribeQuality/freeze-receipts-r67-vs-r68.txt`.
  - **Fails when.** A verdict/tally receipt carries no `rev=`; `rev=` is abbreviated, a branch name, `HEAD`, a
    date, a worktree path or a scratch path; the named revision does not resolve in the lane at close and the
    receipt does not say why; or a quoted tip has no committed receipt of its own. A **fixture** receipt
    (a do-nothing control, a mutant fixture, a self-built repo) may name a revision that is deliberately
    throwaway, but then the line must say so and carry what makes the run reproducible: the fixture-creation
    command and the sha256 of the tool bytes it ran. A bare unresolvable `rev=` with neither is
    indistinguishable from a fabricated one.
  - **Shown able to fail.** r67: `git ls-tree -r --name-only 993a7b16 .ufo/waves/round-67/` →
    `plan.md`, `probe/ledger67-probe.mjs`; `ls -la .ufo/waves/round-67/base/` → an empty directory — so the six
    receipts the plan names cannot exist at the freeze (receipt `build/K68ScribeQuality/freeze-receipts-r67-vs-r68.txt`).
    This is round 60's `__MEASURED__`/`__TIP__` class (Q61) at the freeze edge rather than at filing. Round 68's own
    controls, same arm: `controls/c1-donothing.txt` (`rev=3ec65c91b208142392690aec43c44657fbdc16ad`),
    `controls/c1-autoledger.txt` (`rev=3ab64d18c37ce2db0851af755d6ebe3633f4dd6a`) and
    `controls/c2-donothing.txt` (`rev=70434c290f7dd2f32ea868a75989f357d0ff0f3b`) each fail
    `git cat-file -e <rev>^{commit}` in **both** the lane and the fleet repo, and none carries a `fixture` token or
    a fixture-creation command — so the do-nothing controls cannot be re-verified from their receipts
    (`grep '^control=' .ufo/waves/round-68/controls/c1-donothing.txt` prints `control=donothing exit=1 rev=3ec65c91…`).
  - **Limit.** Scoped to receipts that carry a verdict or tally: 20 of the 43 base receipts under rounds 64–68
    carry no `rev=` (`grep -L 'rev=' .ufo/waves/round-6[4-8]/base/*.txt | wc -l` → `20`) and are census, selftest
    or preflight dumps, which this row does not judge — a scope boundary, not an exemption to widen silently. A
    `rev=` binds bytes to a revision, not to a clock, a machine or an author (Q39, Q44): a receipt written after
    the fact can name the right sha and still be fabricated, so `receipt-attest`'s nonce arm and Q61's
    `HASH_DEAD`/`TALLY_UNRECEIPTED` stay in force. A scratch or `/tmp` argv echoed into a receipt is not citable
    evidence, whatever its `rev=`.
  - **Supersedes.** None. It adds the missing arm of Q55 (a cited receipt exists and carries the quoted line):
    Q55 never required the receipt to name the revision it measured.

- **Q64 — a frozen counter carries its exercised base receipt in the same freeze commit: a counter whose first
  run happens after dispatch is unexercised and cannot freeze (round 68).** Grounding:
  `corpus/lessons/round-68.md` §Mistakes (`unexercised-counter`, round 68) — the r67 draft counter
  `.ufo/waves/round-67/probe/ledger67-probe.mjs` was committed at `993a7b16` without ever having run: its preamble
  creates `${TMPDIR}/archive` (`ledger67-probe.mjs:71`), `extract()` calls `mkdirSync(dst)` on that same path
  (`:79`), and the call at `:92` therefore throws before any check — no verdict line, exit 1. The plan the wrap-up
  committed alongside it declares the receipts that never existed (`plan.md:77`, `:132`).
  - **Who checks.** The lane L1 at the freeze, **before** it commits the round's `.ready`; the non-author closure
    re-runs each base receipt's argv inside the archive of the freeze commit and compares the final line.
  - **Command.** For each counter the plan names:
    `git ls-tree -r --name-only <freeze> .ufo/waves/round-<N>/base/` lists a receipt whose line carries that
    counter's own label and `<UNMET|HELD> held=<x>/<y> checks=<y> rev=<base>` plus its exit; then re-run the
    receipt's argv verbatim against the archived tree and require the identical final line. Round-68 positive:
    `git ls-tree -r --name-only 39f61816 .ufo/waves/round-68/base/` →
    `census-before.txt`, `deprec68-base.txt`, `ledger68-base.txt`, the last two reading
    `… rev=d23892ad44b41e1af63b3edb949d265ca1dd812d rule=L68` / `… rule=M68`.
  - **Fails when.** A counter named in the plan has no base receipt in the freeze commit; a receipt exists but
    carries no verdict line (crash, usage exit 64, or FAIL-CLOSED on its own base); its `rev=` is not the base the
    plan declares; or the re-run's final line differs from the receipt's.
  - **Shown able to fail.** `node build/K68ScribeQuality/ledger67-probe-as-frozen.mjs <lane>
    d23892ad44b41e1af63b3edb949d265ca1dd812d --seed 2583a841b9d97d5e` → `Error: EEXIST: file already exists,
    mkdir '…/archive' at extract (…ledger67-probe-as-frozen.mjs:79:3)`, exit 1, no verdict line
    (`build/K68ScribeQuality/r67-unexercised-counter-crash.txt`; the exercised copy's blob hash `3a3a45a99daf…`
    equals `993a7b16:.ufo/waves/round-67/probe/ledger67-probe.mjs`, so it is the frozen draft, not a rewrite).
    r67's freeze tree carries no receipt at all (`build/K68ScribeQuality/freeze-receipts-r67-vs-r68.txt`).
  - **Limit.** It judges exercise, not adequacy: a counter that runs and returns UNMET on its base proves the code
    path executes and fails honestly there — it does not prove its checks are satisfiable at all (C1's L1..L7 and
    C2's M1..M10 with their controls, Q57). A receipt committed in the same commit as the plan still does not
    prove the run preceded dispatch (Q58's limit); the arm removes the "never ran" class only. `--seed`-carrying
    counters must repeat the seed or the mutant set differs; a counter whose base arm is vacuous by design (C2's
    M5 at base) must say so in its own receipt.
  - **Supersedes.** None. Q57 (do-nothing control re-run by a non-author) and Q58 (plan committed before the first
    marker) stay in force; this row is the third freeze-time fact: the counter itself has run.

- **Q65 — a claim sentence cites its receipt by a path that resolves at the freeze commit and quotes that
  receipt's verdict line byte-for-byte, `held=x/y` included (round 68).** Grounding:
  `corpus/lessons/round-68.md` §Mistakes (`plan-quotes-receipt`, round 68) — `plan.md:86` reads
  "`Before (base `d23892ad`):` `LEDGER68_UNMET held=0/7` exit 1" while the receipt it names,
  `base/ledger68-base.txt:1`, reads `LEDGER68_UNMET held=1/7 checks=7 rev=d23892ad44b41e1af63b3edb949d265ca1dd812d
  rule=L68 seed=2583a841b9d97d5e` (six printed MISS lines over seven checks, so the one pass is L7 —
  `check('L7', bad.length === 0)` at `probe/ledger68-probe.mjs:459`), and `plan.md:87-90` and `:143-144` cite
  `base/ledger68-donothing.txt`, `base/ledger68-autoledger.txt` and `base/deprec68-donothing.txt`, none of which
  exists at the freeze commit `39f61816` — the committed receipts are `controls/c1-donothing.txt`,
  `controls/c1-autoledger.txt`, `controls/c2-donothing.txt`. Evidence pointer:
  `build/K68ScribeQuality/plan-vs-receipts.txt`.
