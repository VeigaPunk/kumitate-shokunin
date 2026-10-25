# ExecQualCriterion — round 61 w1

Seat: `L1Kumitate61.ExecQualCriterion` (executor, leaf). Milestone: quality criteria from R60 defects. Judged on: operability.

## Appended ids

**Q52, Q53, Q54, Q55** were appended to `corpus/QUALITY.md` at lines 910–936, after Q51. The change is append-only: `git diff --stat corpus/QUALITY.md` shows `28 insertions(+)` and the diff has 0 removed lines. No other criterion was touched.

| id | criterion | grounding (file:line) |
|---|---|---|
| Q52 | every citation names a real object; `__TIP__`/`__MEASURED__`/`__COMMITS__` rejected | `corpus/lessons/round-60-verifier-spotcheck.md:171-174` (R60-V2), §1 `:26` |
| Q53 | a report's claimed score equals its committed receipt and the SCORECARD section | `…spotcheck.md:175-177` (R60-V3), §2 `:77-78` |
| Q54 | a dispatch claim cites a committed record in the gate's schema; every dead seat is named with its last error text | `…spotcheck.md:181-185` (R60-V5), `:186-191` (R60-V6), §2 `:59-75` |
| Q55 | a tip/after receipt exists at the measured revision and carries the real observed line | `…spotcheck.md:178-180` (R60-V4), §2 `:67-69` |

Each criterion has the same parts as Q51: Who checks, Command, Fails when, Shown able to fail, Limit. Every "shown able to fail" line was observed on committed bytes this round with grep, awk, jq or git. I ran no lane gate or probe.

## Retained evidence (observed this session)

- **Q52.** `grep -cE '__[A-Z][A-Z0-9_]*__' .ufo/reports/round-60/kumitate.md` (fleet repo, commit `7b0581ed`) → `6` hits, at lines 4, 5, 73, 88, 96 and 190.
  - **Live at lane HEAD `be4a820c`:** the committed `SCORECARD.md` still has `__MEASURED__` at lines 2833 and 2847. Nobody had routed this. It fails Q52 today.
  - **Hash half:** 6 commit tokens in the report resolve. The one miss, `c7f7c401`, is a sha256 prefix, found twice in `.ufo/pins/source-captures.json`.
- **Q53.** The three numbers for the work commit disagree:
  - report line 85: `held=9/10`, "only miss is A10";
  - `close/dispatch60-work.txt`, committed in `165b8304`: `held=8/10 … rev=a745a3b0… | A7 MISS | A10 MISS`;
  - `SCORECARD.md:2830`: `held=8/10`.
- **Q54.** In `.ufo/waves/round-60/w1` at `165b8304`:
  - `dispatch-actual.json` is absent.
  - `jq '.members|type' swarm-registry.json` → `object`; the count of non-null `agentId` values is `0`.
  - `awk` over `launcher-progress.tsv` → `exit0=5 dead=27`.
  - Of the 27 dead seats, only `ConnectorSiblings` appears in the report at all (line 198), as a path to its seat report, not as a dead seat.
  - `w1-launcher.log:68` reads `ValueError: dictionary update sequence element #6 has length 1; 2 is required`.
  - The gate's registry constant is `dispatch-actual.json` (`scripts/dispatch-evidence.mjs:29`), and it requires `members` to be an array (`:132-145`).
- **Q55.** Both cited tip receipts were absent at filing (spot-check §2). Round 61 committed them in `be4a820c`:
  - `close/dispatch60-tip.txt` reads `DISPATCH60_UNMET held=8/10 … rev=a745a3b0…`. `grep -cF 'DISPATCH60_HELD held=10/10'` → `0`, against the report's line 88. The receipt now exists, but its content contradicts the claim.
  - `close/doctrine60-tip.txt` reads `DOCTRINE60_HELD held=6/6`, which agrees with the report's held count. Its `rev=` cannot be matched, because the report's measured revision is still `__MEASURED__`.

Scratch: `/tmp/kumitate-r61/ExecQualCriterion/dead.txt` (the 27 dead seat names).

## Risks / notes for L1

- Q52 also fails on the current committed `SCORECARD.md` (lines 2833 and 2847). Repair it with an appended correction in the same pass as the R60-V2 erratum. That repair is not in this seat's scope.
- Q53 and Q55 both still fail for round 60 after `be4a820c`: the real tip receipt reads `8/10`, while the report claims `9/10` for the work commit and `10/10` at the measured revision. Only an erratum that quotes the receipt's actual line closes them.
- Q52's hash command can match digests as well as commits. The criterion states that every miss must resolve to a pinned digest; the reader applies that rule by hand.
- Q54's schema half is stated as the gate's CLEAN, with a `jq` equivalent. I did not execute the gate (wave in flight; the parent owns gates).

## Checks for the parent after integration

- `git diff corpus/QUALITY.md`: additions only, at lines 909–936.
- `node scripts/readme-map.mjs`: unaffected, because no corpus file was added.
- Optionally, `node scripts/dispatch-evidence.mjs --root . --round 60 --wave w1`, expected to fail closed `REGISTRY_UNREADABLE`. That is Q54's live fail.

Tool installs: none. Mutations outside assigned paths: none. No jj/git mutating commands.
