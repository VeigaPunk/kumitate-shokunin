# K94Connector — sibling overlap and fleet-contract scan (kumitate round 94)

Seat: connector (leaf, no dispatch). Lane HEAD `791b1fdd` (gate/SOURCES/SCORECARD/LOG byte-identical to
freeze `73317eca`; `git -C … diff --stat 73317eca 791b1fdd -- scripts/round-gate.mjs corpus/SOURCES.md`
→ empty). Fleet reports read at pin `87de49a6` (`git diff --stat 87de49a6 HEAD -- <the four reports>` → empty;
fleet HEAD `a976dd52`). Origin probe tree `/home/vgpnk/Projects/ufo-fsd-alpha`.
Receipts: `.ufo/waves/round-94/K94Connector/receipts/0{1..7}-*.txt`, scripts `…/K94Connector/scripts/`,
data `…/K94Connector/data/`.

## 1. Fleet rule — quote and verdict

Quoted with `nl -ba PROTOCOL.md | sed -n '116,126p;194,205p;228,233p;344,347p;366,370p'` and
`nl -ba scripts/hyaku/closure-prompt.md | sed -n '19,24p'` (receipt `01-fleet-rule.txt`):

- `PROTOCOL.md:117-121` — "A lane report **lands last** … must cite that commit's hash. Landed means
  committed … **The cited hash is the lane repo's `HEAD` when the report is written: a hash the repo does
  not contain fails verification, and one that is not an ancestor of `HEAD` at closure is a conformance
  defect** (`git merge-base --is-ancestor <hash> HEAD` is the check)."
- `PROTOCOL.md:230-231` (integrator step 1) — "verifies each **cited child-repo commit** exists *and is an
  ancestor of the lane repo's `HEAD`*".
- `PROTOCOL.md:196` (minimum content) — a real report carries "a checkable commit-hash citation".
- `PROTOCOL.md:345-346` (evidence) — "a repo path, a command and its output, a commit, **or an external
  document** — never a naked assertion."
- `closure-prompt.md:22-23` — "every **cited lane commit** exists and `git -C {{LANE_CWD}} merge-base
  --is-ancestor <hash> <branch>` holds".
- No `declared`/external-pin category exists anywhere in either fleet contract file:
  `grep -n -i "upstream pin\|external citation\|declared pin" PROTOCOL.md PROTOCOL-APPENDIX.md` → **no match**.

**Verdict.** The fleet's identity check is scoped to **child-repo commits**, not to every backticked hex.
A `declared` upstream pin therefore **passes as provenance** (an external document, `:345-346`; the r93
closer already ruled it "not a defect of ancestry", `corpus/lessons/round-93-verifier-spotcheck.md:24`) and
**fails if offered as the round-work citation** (`:117-121`: the cited hash must be in the lane repo; with no
resolvable commit the report is a marker → `failed`, `:196-205`).

**Stricter or looser after the change?** Neither — the two checks are not nested.

| surface | fleet | lane gate (BASE) | lane gate (after) |
|---|---|---|---|
| lane-resolving token not ancestor | fails | fails (`COMMIT_CITED_NOT_ANCESTOR`) | same |
| declared upstream pin as provenance | passes (external document) | **fails** (stricter) | passes (equal) |
| undeclared external token (`23e476e21`, `/tmp` revs) | passes as document | fails | **fails** (still stricter) |
| report citing **no** lane commit | marker → `failed` | **passes** (no such check; `round-gate.mjs:405` is ok when `unresolved=0`, incl. `tokens=0`) | **passes** → one more passing shape: *all citations declared* |

The last row is the only real widening: the gate never required a lane-commit citation, and the change adds a
shape (only-declared citations) that reads CLEAN where the fleet would record a marker. The driver is no
backstop — `report_of()` (`scripts/shokunin-watchdog.sh:183-190`) checks only SHONEN, size and a digest
baseline; it never inspects a hash. The gate is the only lane-side citation check that exists.

## 2. Transfer table (where the same rule would apply)

`python3 …/K94Connector/scripts/scan_sources.py` (row regex `^ {0,3}\|\s*S\d{3,}\s*\|`, 8th cell status,
URL split on `/`, `?`, `#`); cross-checked by `python3 …/scripts/transfer_scan.py` (gate tokenisation,
`git cat-file --batch-check <tok>^{commit}` over lane → fleet main → origin). Receipts `03`, `04`.

| lane | rows | declarable pinned rows | declarable segments | rejected pinned rows |
|---|---|---|---|---|
| revenger | 509 | 117 | 101 | 3 |
| mado | 438 | 136 | 20 | 2 |
| mori | 416 | 37 | 21 | 0 |
| kengaku | 341 | 183 | 11 | 25 |
| kama | 335 | 103 | 8 | 5 |
| kaidoku | 233 | 15 | 14 | 0 |
| kake | 224 | 2 | 3 | 0 |
| chousa | 213 | 3 | 2 | 0 |
| kotoba | 211 | 17 | 12 | 0 |
| **kumitate** | 208 | **23** | **9** | **1** (`S045`, `e7f1a99…`) |
| tabi | 179 | 13 | 3 | 0 |
| tameshi | 177 | 4 | 3 | 0 |
| tsukuroi | 354 | 4 | 3 | 0 |
| game-dev-3d | 36 | 4 | 4 | 0 |
| kagi | 107 | 3 | 3 | 0 |

15 of 21 lanes carry a commit-pinned URL on a non-rejected row (664 rows, 217 distinct 40-hex segments; 36
rejected pinned rows / 11 rejected segments). **But only kumitate ships `scripts/round-gate.mjs`**
(`ls */scripts/round-gate.mjs | wc -l` → 1), so the transfer is latent: no sibling's reading changes today.

Sibling practice exists but is a *different* convention (`06-sibling-instruments.txt`): kake's
`scripts/citation_lint.py` classifies externals **lexically** — a repository named on the same line
(`EXTERNAL_RE`, `:44-47`) plus an adjudication ledger — and `scripts/instrument_receipts.py` requires a
declared receipt revision to resolve as a commit **and** be an ancestor (`:63-66`), the opposite of a
declared allowlist. Neither reads `corpus/SOURCES.md` (`grep -c SOURCES` → 0, 0). The r94 rule is novel in the
fleet and lane-local, not a convention being followed elsewhere (independently reached in
`w1/K94Scout.md:267-277`).

Latent impact if the gate were copied: **61 filed reports across 13 lanes would gain a `declared` token** —
kengaku 29 (`2fd12b88…`, the Terminal-Bench 2.0 pin, cited in 30 report files), kama 7, mado 5, kaidoku 4,
revenger 4, kake 3, chousa 2, kotoba 2, and one each in game-dev-3d, kumitate, mori, tabi, tsukuroi
(`…/data/transfer.json`). Porting precondition: a lane must re-derive its own KEEP set with this scan; the
rule is registry-scoped, so kumitate's seven-red expectation does not carry over.

Broad measure, for scale: a backticked 40-hex token sits within ±100 chars of `github.com`/`upstream`/`pin`
wording in **431 places across 238 (lane, round) files in 20 lanes** (`07-report-scan.txt`). Most are lane-commit
pins (which resolve and are unaffected); the rule-relevant subset is the 61 reports above — tokens that resolve
in *no* probeable repo and prefix a registry pin.

## 3. Closure history — how the same surface was treated then

`receipts/05-closure-history.txt` (`nl -ba` + `grep -c` over the six spotchecks, `round-12.md`, the reports).

| round | unresolved token | what it is (source line) | closer's disposition |
|---|---|---|---|
| 12 | `23e476e21` | origin-lane reorder, `lessons/round-12.md:149` "owner: origin runtime lane" | **external ownership**; no `round-12-verifier-spotcheck.md` exists. The r12 "citation gate is red" at `:97` is `scripts/cite-check.mjs`, a different instrument |
| 46 | `7af3d978` (+3) | scratch-clone control commits (`spotcheck:25`) | **defect R46-4**, `fatal: Not a valid object name` for all four; fix = mark scratch-only |
| 53 | `b717dc03…` | "scratch repo rev" (`report:35`) | **accepted**: "K5 scratch-HELD witness committed at scratch rev `b717dc03…` (17/17, 5/5)" (`spotcheck:32`) |
| 57 | `1cd6d667…` | scratch witness in a `/tmp` clone (`report:80-85`) | **silent** — 0 mentions in the spotcheck |
| 61 | `ab902da2…`, `4247d2d` | `/tmp` fixture revs | **defect R61-V1** ("do not resolve in the lane repo … only in /tmp", `spotcheck:41,213`) |
| 62 | `4247d2da…` | inherited forged-bundle revision | **carried** as R61-V2 open, not a citation defect (`spotcheck:59`) |
| 63 | `9237a72` | Q51 grounding hash "that resolves nowhere" | **carried** D5 (`spotcheck:91`); answered in r64 |
| 93 | `79fa222e` (+ full) | oh-my-pi pin, 4 registry rows | **"not a defect of ancestry"**; gate repair routed (`spotcheck:24,119-120`) |

One surface, seven dispositions across eight rounds: defect (46, 61), accepted (53), carried (62, 63),
silent (57), external ownership (12), explicitly not-a-defect (93). The frozen rule settles exactly the r93
class and nothing else.

## 4. Does the seven-red set survive? (independent check)

`node scripts/round-gate.mjs --round N --json` for N ∈ {12,46,53,57,61,62,63,93} (receipt `02`) reproduces the
frozen unresolved sets. Against kumitate's registry (23 declarable rows, 9 declarable segments + `S045`
rejected): **none of the eight red tokens is a prefix of any 40-hex on any registry row** — the superset that
includes non-URL positions and rejected rows — so certainly none on a non-rejected row (`03`). The oh-my-pi
pin is declared by **four** rows `S266–S269`, all `mined` (the plan says S267–S269; S266 also pins it). The
rule cannot touch the KEEP set.

Precision note: kumitate has 24 forty-hex tokens on registry rows, only 10 in URL position; 14 are non-URL-only
(anchor/prose) pins. None is cited by any filed report, so the URL-only restriction is exercised **only** by
synthetic fixture (d) — this independently confirms the plan's disclosed limit and shows the restriction is not
load-bearing on the real corpus. Cross-seat corroboration: `K94Scout/filed-reports-declared.txt` and
`pin-counts.txt` reach the same 9-pin / r93-only result.

## 5. Contradictions (stated, not smoothed)

1. **No fleet category.** The gate gains a `declared` class the fleet contract does not have; a report whose
   only hash is a declared pin is gate-CLEAN and fleet-`failed` (marker). The change does not create the gap
   (zero-token reports already passed) but adds one shape.
2. **Revocable green.** `corpus/SOURCES.md` is "append-only except `status`, `recheck`, `used-by`" (`:7-8`), so a
   later `rejected` status can flip a historical round. r93 is shielded by four independent rows — all four
   would have to be re-statused — but nothing in the gate pins the registry revision it read.
3. **Closure inconsistency.** The same token class was defect in r46/r61 and accepted in r53; the new rule
   imposes one reading on a surface that had seven.
4. **Improvement ceiling this round.** The counter's predicate (c) compares full `(id, ok)` vectors and exit
   codes (`probe94-c1.mjs:130-148`), so the candidate must not add a check kind; any improvement must be
   output/docs only.

## 6. Proposed move (one, bounded)

**Surface the declaration on the success path.** On the audit path, non-JSON, emit one line before the verdict
when `citations.declared.length > 0`:

    ROUND_GATE  note  COMMIT_CITED_DECLARED  declared=<n> [<token> …]

Why non-obvious: `summarize()` filters `!c.ok` (`round-gate.mjs:596-600`), so the candidate's `declared=N`
detail inside `COMMIT_CITED_UNRESOLVED` is printed **only when that check is red** — i.e. exactly when the
declared list is not doing its job. On the fixed round 93 the gate now prints only `ROUND_GATE: CLEAN`; the
two upstream pins vanish from text output, which is what an integrator reads.

- Affected axes: **operability** (the instrument is legible at the point of decision; the one self-declared
  allowlist is visible when it fires). Coverage untouched.
- Harms checked: exit code, `checks` vector and `--json` unchanged (counter reads `--json` only); declared-empty
  rounds (all KEEP rounds, fixture d2) byte-identical; `--tracked` untouched — `runTracked` never computes
  citations (`round-gate.mjs:537-586`); note starts with `ROUND_GATE  note`, so the selftest's
  `^ROUND_GATE  (error|warning)` parser (`:895`) cannot match it.
- Risks: (i) `pin.round-gate` must be re-pinned — already required by K3; (ii) the selftest should gain/keep an
  arm asserting the note appears only when declared is non-empty, else K2's mutant surface grows; (iii) a
  consumer that asserts "verdict is the last line" still holds (note precedes it), but anything diffing full
  stdout on r93 would change — none exists in `scripts/` (`grep -rn "ROUND_GATE" scripts/ | grep -v round-gate.mjs`
  → empty).
- Optional variant, not required: name the declaring S-ids instead of tokens (`declaredPins` already parses the
  rows); tokens suffice for a grep.

Verification: `node <cand> --round 93` → note line with 2 tokens + `ROUND_GATE: CLEAN`; `--round 46` → no note,
same DRIFT line as BASE; `node <cand> --selftest` exit 0 `VERDICT: PASS`; frozen counter `C94_C1: HELD`.

## 7. Evidence map

| claim | command | receipt |
|---|---|---|
| fleet wording, no declared category | `nl -ba PROTOCOL.md \| sed -n …`; `grep -n -i … PROTOCOL.md PROTOCOL-APPENDIX.md` | `01-fleet-rule.txt` |
| driver is hash-blind | `sed -n '/report_of()/,/^}/p' scripts/shokunin-watchdog.sh` | `01-fleet-rule.txt` |
| gate citation code + red rounds | `node scripts/round-gate.mjs --round N --json` ×8; `nl -ba scripts/round-gate.mjs` | `02-gate-citation.txt` |
| per-lane registry counts | `python3 K94Connector/scripts/scan_sources.py` | `03-sources-table.txt`, `data/final_table.json` |
| 61 flips / 15 lanes | `python3 K94Connector/scripts/transfer_scan.py` | `04-transfer.txt`, `data/transfer.json` |
| broad pin-citation count | `python3 K94Connector/scripts/scan_reports2.py` | `07-report-scan.txt` |
| sibling instruments (kake) | `grep -n "EXTERNAL_RE\|cat-file\|is-ancestor" kake-shokunin/scripts/{citation_lint,instrument_receipts}.py`; `grep -c SOURCES …` | `06-sibling-instruments.txt` |
| closure dispositions | `nl -ba corpus/lessons/round-{46,53,57,61,62,63}-verifier-spotcheck.md`; `nl -ba corpus/lessons/round-12.md` | `05-closure-history.txt` |
| spot-check resolution | `git -C <lane> cat-file -e <tok>^{commit}` over kengaku, chousa, fleet, origin | `04-transfer.txt` |

No tool installed or upgraded (node v24.21.0 pre-existing; no pacman/uv/npx use). No lane file written outside
`.ufo/waves/round-94/K94Connector/` and this report.
