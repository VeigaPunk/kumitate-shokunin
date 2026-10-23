RESULT ReopenS084 verdict=HOLDS
Defects: none. The pinned guide is the Infection introduction, not a fabricated or off-topic page. Both gate quotes are verbatim at the stated lines, each and both are ≤25 words, tier A fits official docs, and `supersedes S047` names the restored row whose teaching these bytes contradict.

# ReopenS084 — SOURCES row S084 against the pinned Infection guide

Row: `corpus/SOURCES.md` S084 (working tree, byte-identical to `HEAD`). Gate: `corpus/lessons/round-47.md:32`. Drafting seat (not re-scored here): `.ufo/waves/round-47/build/SupersedeS047.md`. Fetched 2026-10-23. No tools installed. No processes left.

## Fetch

Pinned bytes (the anchor's commit file):

`timeout -k 10 60 curl -sS -D headers-pinned.txt -o guide-index.md -w 'http_code=%{http_code}…' --max-filesize 2000000 --max-time 45 https://raw.githubusercontent.com/infection/infection.github.io/4d7570f512c9ce6e76203ec192b0009a0b3ac4ce/guide/index.md`

- HTTP/2 200, `content-type: text/plain; charset=utf-8`, `content-length: 5041`, `date: Fri, 23 Oct 2026 11:52:46 GMT`
- `sha256sum` → `8a3d6254e64d469b0c7be70957d92c0cf44d174f2917b428bf730f42eae105dc` (64 hex). `wc -l -c` → `139 5041`. Equals the row's `file sha256`.

Canonical URL (the gate URL and the row's source cell):

`curl` of `https://infection.github.io/guide/` → HTTP/2 200, `content-type: text/html; charset=utf-8`, `content-length: 43231`, `last-modified: Wed, 14 Oct 2026 09:58:05 GMT`, `date: Fri, 23 Oct 2026 11:52:51 GMT`. Body sha256 `3c540f69dc6bc630c6496258524964ef0f7429f557a6bd328e5e5f2e8b336ef5` (64 hex). `<title>Introduction | Infection</title>`. The killed-mutant sentence is in the HTML as `called a <em>killed mutant</em>`; the formula is the same tokens split across Shiki `<span>`s (`TotalDefeatedMutants`, `KilledCount`, `TimedOutCount`, `ErrorCount`).

Commit: `GET https://api.github.com/repos/infection/infection.github.io/commits/4d7570f512c9ce6e76203ec192b0009a0b3ac4ce` → HTTP 200, sha `4d7570f512c9ce6e76203ec192b0009a0b3ac4ce`, committer `2026-10-14T09:57:05Z`, message `Document the new --threads=auto option (#4)`. `GET …/commits/main` returns that same sha. Default branch `main`, `pushed_at` `2026-10-14T10:05:03Z`. The row's repo name `infection/infection.github.io` is the repo that serves this commit. S047's `infection/site` is the locator this row replaces.

Bytes kept at `/fast/scratch/hyaku/kumitate-r48/seats/w1-ReopenS084/guide-index.md` (and `guide/*.md` for the negative sweep below).

## Quoted sentences (gate, round-47.md:32)

Gate: `"If mutated program produces failing tests, this is called a *killed mutant*." / "TotalDefeatedMutants = KilledCount + TimedOutCount + ErrorCount;" (:13, :99; 20 words)`.

Both are substrings of the pinned file, not paraphrases:

- Line 13 contains `If mutated program produces failing tests, this is called a *killed mutant*.` (`q1 in L13 True`).
- Line 99 is exactly `TotalDefeatedMutants = KilledCount + TimedOutCount + ErrorCount;` (`q2 == lines[98]`). The same formula is also at line 125, outside the gate locator.

`wc -w` (this reopen):

- quote 1 alone: 12
- quote 2 alone: 7
- quote 1, space, quote 2: 19
- quote 1, ` / `, quote 2: 20
- the gate cell's two quoted strings plus the separator slash, quotation marks attached to the edge words: 20

Each quote is ≤25. The pair without the separator is 19, also ≤25. The gate's "(20 words)" is `wc -w` of the pair **with the `/` separator counted as a word** — the same string the drafting seat printed (`SupersedeS047.md:16`, asterisks stripped, slash kept) and recorded as 20. The ≤25 check holds. The separator is not part of either quote; it does not push either sentence, or the pair, over 25.

## Locator lines (anchor `guide/index.md:13, 35, 94, 99-101`)

Fetched lines, verbatim:

```
13: Mutation testing involves modifying a program in small ways. Each mutated version is called a **Mutant**. To assess the quality of a given test set, these mutants are executed against the input test set to see if the seeded faults can be detected. If mutated program produces failing tests, this is called a *killed mutant*. If tests are green with mutated code, then we have an *escaped* mutant.
23: Infection is a **PHP mutation testing library** based on AST (Abstract Syntax Tree) mutations. It works as a CLI tool and can be executed from your project's root.
35: * collects the results of killed, escaped Mutants, errors and timeouts
94: MSI is 47%. This means that 47% of all generated mutations were detected (i.e. kills, timeouts or fatal errors). The MSI is the primary Mutation Testing metric. Given the code coverage of 67%, there is a 20% difference so Code Coverage was a terrible quality measurement in this example.
99: TotalDefeatedMutants = KilledCount + TimedOutCount + ErrorCount;
100:
101: MSI = (TotalDefeatedMutants / TotalMutantsCount) * 100;
```

Line 100 is blank; 99 and 101 are the two formula lines inside one `shell` fence. The range is the right span.

Those lines ground `teaches`:

- "Killed means failing tests" — line 13, failing tests are a killed mutant.
- "escaped means green" — line 13, green tests on mutated code are an escaped mutant.
- "collects errors/timeouts" — line 35 names errors and timeouts beside killed and escaped.
- "includes kills, timeouts, and errors in MSI" — line 94 ("detected (i.e. kills, timeouts or fatal errors)") and lines 99–101 (`ErrorCount` is added into `TotalDefeatedMutants`, and MSI divides that by `TotalMutantsCount`). Line 94 says "fatal errors"; the formula's identifier is `ErrorCount`; line 35 says "errors". The teaches word "errors" matches the formula and line 35.
- "no exit-status/verdict-line rule for K43 (b)-(c)" — K43 (b) is a numeric non-zero exit and (c) is the exact stdout line `VERDICT: FAIL` (`corpus/lessons/round-43.md:16-21`). A case-insensitive sweep of `guide/index.md` for `exit`, `verdict`, `status`, and `K43` hits nothing. The same sweep over every `guide/*.md` at this commit (tree `recursive=1`, 19 markdown files, each HTTP 200) finds no `verdict`. The only exit-code sentences are not that rule:

```
command-line-options.md:472: All mutant processes returns `0` exit code. It is expected that all Mutants are escaped.
command-line-options.md:559: Ignore MSI violations when no mutations are generated. This will force Infection to return a zero exit code even when the required MSI is not reached.
```

Line 472 is `--dry-run` (tests not run; processes return 0; mutants are expected escaped). Line 559 is `--ignore-msi-with-no-mutations` (force exit 0 when no mutations exist). Neither states that a kill is a non-zero exit, and neither names a verdict line. `mutators.md:415` matched the sweep only as a substring false positive ("not supported"), not an exit rule.

## Tier

`kind=docs`, `tier=A`. The page is Infection's own guide (`title: Introduction`, line 23: "Infection is a PHP mutation testing library"). Scope is killed vs escaped outcomes and the MSI aggregate, which lines 13, 35, 94, and 99–101 state. Official docs for that scope are tier A (`CORPUS.md` tier rule). Not `community`, so not tier inflation. Row shape: 13 `|`-fields, status `mined`, opened `2026-10-23`, recheck `180d`.

## Supersedes target

`teaches` opens `supersedes S047 —`. `git show 2b2bf7bb:corpus/SOURCES.md` S047 and `HEAD` S047 are byte-identical (739 bytes): the round-46 in-place rewrite was restored, and the correction lives in S084.

S047, same URL `https://infection.github.io/guide/`, scope still says errors and timeouts are "not the MSI aggregate", anchor still says `infection/site` and only lines 13 and 35, and teaches still says a kill "is read off the run's reported failure (K43 (b)-(c))" and "never cite it for the MSI sum". Lines 94 and 99–101 are that sum. S084 is the right target, the right direction, and the append-only shape Rule 2 asks for.

## Observations that are not defects

- Census W04 (`open/census-open.txt`): S084 and S047 share `infection.github.io/guide` under different scope strings. A supersede of the same URL with a corrected scope produces that warning; it does not fail the quote, locator, tier, or target checks.
- `used-by` is `SKILL.md, corpus/lessons/round-43.md`. Both paths exist. They cite S047, not the string S084 (`SKILL.md` S084 count 0, S047 count 1 at the gate-mutants row, which still says "a kill is read off the run's reported failure"; `round-43.md` S084 count 0, S047 count 7). That is the predecessor's citation list, copied onto the new row. It is not a false quote or a wrong supersede target.
- Drafting report `SupersedeS047.md:3` records live-HTML sha256 `3c540f69dc6bc630c6496258524964ef0f7429f557a6bd328e5f2e8b336ef5` (62 hex). This fetch's body digest is 64 hex and matches that string with `e5` inserted at index 51. The row and the gate do not store the HTML digest; the pinned markdown digest in the row matches this fetch in full.

## Commands (verbatim results above)

Pinned curl, live curl, commit API, `sha256sum`, `wc -w` via Python `subprocess` on the quote strings, `git show 2b2bf7bb:corpus/SOURCES.md` vs `HEAD` for S047, guide-tree sweep. No counter, selftest, or strace. No install.
