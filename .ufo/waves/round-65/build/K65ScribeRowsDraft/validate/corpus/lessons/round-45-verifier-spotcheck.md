author: hyaku closure (non-author integrator, @m_opus)

# Round 45 — verifier spot-check (non-author)

Closure session `HyakuCloseKumitate45-3`, 2026-10-23. Inputs: report `.ufo/reports/round-45/kumitate.md` (fleet
`a25198dd`), prompt `.ufo/prompts/kumitate-round-45.md`, lane base `3632602c6f68945ce973043f6d47bf3990afff13`, tip
`330ebfeb0bc7a361ab1b69d43adf1e76d21e5cfc`. Every command below was run by this session on 2026-10-23 (07:05–07:40Z).
Read-only seats: two spawn calls of five reviewer seats were both refused at the 100-job limit, so no seat started.
Every check here was run by the closure session itself.

## 1. Conformance (step 1)

| check | command | observed | result |
|---|---|---|---|
| report committed by lane identity | `git log --format='%an %H' -- .ufo/reports/round-45/kumitate.md` | `kumitate-shokunin a25198ddb915d8dcc6c1f0e42e58544764eff129` | ok |
| `SHONEN` heading, one line per box | read report:152-157 | 4 lines, `[ ]`/`[~]` + pointer | ok |
| cited hashes exist and are ancestors of `refs/heads/master` | `git merge-base --is-ancestor <h> refs/heads/master` for the 14 cited hashes (3632602c … 330ebfeb) | 14 × ok | ok |
| pushed, nothing uncommitted | `scripts/hyaku/jj-lane.sh state …` ; `git status --porcelain \| wc -l` | `local=remote=330ebfeb… ahead=0 behind=0 tracked=0 untracked=0` ; `0` | ok |
| remote ref | `git ls-remote origin refs/heads/master` | `330ebfeb0bc7a361ab1b69d43adf1e76d21e5cfc` | ok |
| prompt carries template contract | unified diff of `kimi-shokunin/templates/round-prompt.md` (141 lines) against prompt lines 1-140 | 23 changed lines, all `{{LANE}}/{{ROUND}}/{{FLEET_ROOT}}/{{AXES}}` substitutions; §6 hyaku addendum appended at :141 | ok |
| leftovers not cited | `/usr/bin/find` over `/fast/scratch/hyaku/kumitate-r45/a3/untracked-snapshot/`; per file `git cat-file -e 330ebfeb:<p>` + sha256; path-qualified `git grep -F <dir>/<file> 330ebfeb` | 46 files (report says 45). 4 are tracked byte-identical at tip (`a2-falsify-spec.json`, `a2-falsify-dispatch.json`, `a2-falsify/dispatch-note.txt`, `a2-falsify/swarm-registry.json`), committed at `9c4785ea` as a disclosed dead-wave record. 42 are absent from the tip. No corpus file or entry cites one. One committed pointer names one: `plan.md:93` (`ca5b0aac`, attempt 1) — "Written … from `build/CritRoundShape.md`" — which no longer resolves in the lane | defect D1 (minor) |
| seat count honesty | spec `items` counts; committed receipts per wave | build 40 (snapshot spec and registry, uncommitted), a2-control 50 / 49 receipts, a2-falsify 44 / 0, a3-falsify 33 / 33, a3-residual 7 / 7 → 174 | consistent with report:174-188 |

Not a marker: 13 lane commits carry checkable work. The report's dead-attempt account (2 dead L1s, no seat resent)
matches the committed record (`9c4785ea` dead-wave record, E10 at `plan.md:204-218`).

## 2. Claim C1 — exploratory, axis coverage (frontier band "Isolation substrates for parallel agents")

Re-measured surface:
- `git show 3632602c:corpus/knowledge/agent-isolation-substrates.md` → `fatal: path … exists on disk, but not in '3632602c'`.
- `git grep -c agent-isolation-substrates 330ebfeb -- corpus/README.md PROVINCE.md` → `1` and `1`; at `3632602c` → no
  match (rc=1).
- `git show <rev>:corpus/SOURCES.md | grep -c '^| S[0-9]'` → 61 at `3632602c`, 77 at `330ebfeb` (report: 61 → 77).
- `git diff --numstat 6b2a4517 330ebfeb -- corpus/knowledge/agent-isolation-substrates.md` → `94 0` (append-only,
  as reported).

Checklist checks against the committed receipts (frozen rule `plan.md:127-129`: any failed item makes C1 `unprovable`):
- **K2′ re-runs (evidence-verified).** `grep -HE 'baseline=|control_clean=' a3-falsify/Abl*Row.md` → six `RESULT` lines,
  all `rev=6b2a4517 … baseline=reproduces control_clean=yes`. Five of the six carry `verdict=defect` against the judged
  table: AblBwrapRow, AblGitWriteRow, AblMemCapRow, AblReadOnlyRow and AblScrubRow. Only AblCloneRow `holds`. The
  defects are answered by appended errata (X1 `git diff` writes the index, X4 row-3 guard fails open, X7
  `MemorySwapMax=0` necessary). K2 as frozen (`plan.md:133-134`) admits a named appended erratum. Result: holds with
  errata.
- **K0, K1′, K4, K5′ (evidence-verified, not re-derived row by row).** I accept KSheetFull's holds. The lesson tally at
  `lessons/round-45.md:210-220` agrees with it, and AblScrubRow confirms X4. Not independently re-scored: no seat could
  be started.
- **Close receipts (evidence-verified, rev-bound).** `close/proxy-strict-close.txt`: `rev=9e3e3ed9…`, `PROXY: MATCH
  (… C2=102/102 …)`, exit=0. `close/sources-q32-close.txt`: `SOURCES_CHECK: CLEAN (rows=77 …)`, `Q32 out=[]`. No
  sibling gate was executed.

### Ruling on the K3′ literal exceptions (`plan.md:186-191`)

| item | re-opened (this session) | observed | ruling |
|---|---|---|---|
| S068 quote spans `//` | raw `oh-my-pi/45c35e40…/packages/coding-agent/src/task/worktree.ts` | :677 `… a private,` / :678 `// frozen repo that …`; only a newline, tabs and the comment leader intervene; no word | **holds.** A comment leader is source syntax, not a word, and K3′ resolves a script MISSING by reading the bytes |
| S069 quote split by XML tag | raw `bubblewrap/v0.13.1/bwrap.xml` sha256 `2cb77df2…` (= row pin) | :62 `<command>bwrap</command>` / :63 `is running a minimal pid 1 process`; tag-stripped text contains the quote | **holds.** Markup, no intervening word |
| S066–S070 no in-text release marker | the four raw/blob URLs; `grep 0.45.1\|0.13.1\|18.12.6` → none; `git ls-remote` | `v0.45.1`=`7c41cdeb…`; `v0.13.1^{}`=`362936ae…`; oh-my-pi `v18.12.6`=`45c35e40…`. The sha256 pins reproduce for S066, S067, S069 and S070 | **holds.** Each URL names an immutable tag or commit that resolves to the claimed release. The duty catches a page whose marker contradicts the claim (probe D), and an absent marker contradicts nothing |
| S063 footer names 2.49.0 | `https://git-scm.com/docs/gitrepository-layout` sha256 `d497ee1e…` (= row pin); tag sources | page text: `gitrepository-layout last updated in 2.49.0` **and** `gitrepository-layout manual 2.49.1 → 2.56.0 no changes`. `Documentation/gitrepository-layout.adoc` at v2.49.0 and v2.56.0: both `39ce8d13…`, 11890 B. Quote found under the `common` entry | **holds.** The page's own version history states that 2.56.0 carries this text |
| S077 added after the freeze | `https://nodejs.org/docs/v24.21.0/api/process.html` sha256 `1224adf1…` (= row pin) | header `Node.js v24.21.0`; the quote is verbatim with tags removed (`<code>ArrayBuffer</code>s`) | **outside K3′'s judged scope.** The entry at `6b2a4517` does not cite S077; only erratum X7 does. Re-opened anyway: a sound admit |

**K3′ fails on an item the author did not list: S073's `teaches` at the judged commit overstates its source.**
- `git show 6b2a4517:corpus/SOURCES.md | grep '^| S073 '` teaches: "--max-old-space-size sets the size of V8's old memory
  section only; Buffers share ArrayBuffer backing memory outside it".
- I re-opened both of the row's locators:
  - `cli.html` § `--max-old-space-size`: no "Buffer".
  - `buffer.html:1616-1630`: Buffers share an ArrayBuffer's memory, but nothing places that memory outside the old
    space.
- The lane's own XChanS073 found the clause in no channel.
- K3′ requires that "the row's teaches does not overstate it" (`plan.md:189`). K3 and K3′ carry no erratum clause; K2
  alone does. The fix (S073 cell edited after the freeze, X7, S077) is correct and honest, but it is a post-freeze
  repair of a failed item.

**Verdict C1: `unprovable`.** Under the frozen rule, a failed K item ends the claim before any taste judgment. I add, as
taste and not as a rule, that the operative decision table was judged with defects in five of its six rows, including
a fail-open guard (X4). Even with errata I would not certify the judged object as better than the prior state. The
entry with X1–X20 appended is a sound base for a re-claim.

**Axis verdicts:**
- **coverage `unprovable`.** No integer moves.
- **operability `unchanged`.** It stays 9.
- No axis is harmed.
- **SCORECARD check.** `git diff 3632602c 330ebfeb -- SCORECARD.md` adds notes and the round-45 section, and moves C2 99
  → 102, which matches `proxy --strict`. The `| 43 |` move-log row is re-placed byte-identical (checked with `diff`).
  The `96 → 98` → `96 → 99` record line is edited in place (routed R44-6).

## 3. Discernment spot-check (`lessons/round-45.md` § Gate)

| item | gate decision | re-opened source | agree / disagree | reason |
|---|---|---|---|---|
| S077 | admit A, mined | process.html v24.21.0, pin `1224adf1…` reproduces | agree | quote verbatim; marker `Node.js v24.21.0`; it supports X7 and nothing more |
| S063 | admit A, mined | gitrepository-layout page, pin `d497ee1e…`; tags v2.49.0 = v2.56.0 (`39ce8d13…`) | agree | quote under `common`; the page itself states "2.49.1 → 2.56.0 no changes" |
| S076 | reject | `/docs/gitrepository-layout/2.56.0`: 632 B, pin `c4cd4197…`, `rel=canonical` → `/2.49.0` | agree on the decision; reason partly wrong | the URL serves only a redirect, no manual text, so the reject stands. "Not manual text for the host version" is wrong: by the page's own history the 2.49.0 text is the 2.56.0 text |
| S075 | reject | `/docs/githooks/2.56.0`: 596 B, pin `9df1e5c7…`, canonical → `/2.54.0` | agree | a redirect wrapper with no text; S064 (tag v2.56.0 raw) is the stronger source |
| S073 (as judged at `6b2a4517`) | admit with teaches "… outside it" | cli.html, buffer.html v24.21.0 | disagree (at the judged commit) | the teaches overstated its source. The lane caught this itself (XChanS073) and corrected it after the freeze |

New SOURCES row quote check: S077's 13-word quote (`printf '%s' … \| wc -w` → 13) is ≤25 words and verbatim. S068 (4
words) and S069 (8 words) are verbatim under reading, as ruled above.

Census: `scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin kumitate` → `W04 S034 …`, `W04 S068
duplicate url … across scopes`, `kumitate ok …/corpus/SOURCES.md`, exit=0. This matches `close/census-close.txt`.

## 4. Trend verdicts

- **expansion — improved.**
  - Rows go 61 → 77: 16 new, of which 14 are mined and 2 are rejects with flip conditions.
  - S013 and S027 move from `queued` to `mined`.
  - The frontier band gains its first entry (README and PROVINCE rows: 1 each).
  - The eight sha256 pins I re-fetched all reproduce.
- **quality — improved.**
  - Every defect found was marked: X1–X20 are appended (94 insertions, 0 deletions) and S072/S073 are corrected.
  - Q32 replays with no DRIFT at the close (`Q32 out=[]`, `PROXY: MATCH`).
  - Nothing was found false and left unmarked.
- **discernment — improved.**
  - This spot-check agrees with the gate on 2 sampled admits (S077, S063) and 2 rejects (S075, S076).
  - The one disagreement (S073 as judged) was found by the lane and mined into errata.
  - The S076 reason defect is routed below (D3).

## 5. Routed defects (lane fixes next round)

- **D1.** `plan.md:93` cites the uncommitted attempt-1 receipt `build/CritRoundShape.md` as the source of errata
  E1–E6. Fix: append a plan or lesson note that marks E1–E6 as resting on an untrusted, unresolvable receipt. Also
  correct the leftover count: the snapshot holds 46 files, not 45.
- **D2.** K3/K3′ carry no erratum clause, yet the report reads S067/S072/S073 as "corrected by X7–X9" under K2.
  - Fix: in future frozen checklists, state per item whether an appended erratum cures a failure.
  - Add a QUALITY criterion: a row's `teaches` is checked against every locator before the entry commit (S073).
- **D3.** S076's reject reason contradicts S063's admit. The page's own version history says 2.56.0 has the 2.49.0
  text. Fix: re-word S076's reason to "redirect wrapper, no manual text".
- **D4.** A guard tested in one form was prescribed in another (X4), and 5 of 6 table rows failed ablation at the
  judged commit. Fix: carry the round-46 practice (guards copied byte-exact from the tested receipt) into a QUALITY
  criterion with a shown-able-to-fail command.
- **SHONEN** (operator note): none of the four boxes is fully checkable by a non-author from this round. Two stay
  `[~]` as author-asserted, which matches what I observed.
