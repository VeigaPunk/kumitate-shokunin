RESULT ReopenS039 rev=- verdict=agree quotes=2/2

# ReopenS039 — re-open S039 (pitest.org home + FAQ) by plain HTTPS

Scope: re-open the source behind the S039 row (`corpus/SOURCES.md:52`) and the round-42 lesson's
Gate quote (`corpus/lessons/round-42.md:44-48`), by plain `curl` over HTTPS, no headless browser,
no challenge bypass. Also checked that the cited anchor sections exist and that each quote sits
inside the section it is attributed to. Lane repo was read-only throughout; scratch is
`/fast/scratch/hyaku/kumitate-r42/falsify/ReopenS039/`. No code edits, no gates run, no processes
spawned; no pacman (transactions paused), no tool installs.

## Verdict

`agree` for both quotes and all three anchor sections. Two observations that do not falsify the
row: (1) the home-page sentence is verbatim in rendered text but not in raw bytes, because
`killed` is wrapped in `<strong>` and the line breaks after `then`; (2) the FAQ heading uses
typographic apostrophes (`I’m`, `what’s`, U+2019) while the row and lesson write ASCII `'`.

## Evidence

Access: 2026-10-22T20:59:02Z. Commands run from `/fast/scratch/hyaku/kumitate-r42/falsify/ReopenS039`.

1. `curl -sS -o home.html -D home.hdr -w 'HTTP %{http_code} ...' https://pitest.org/`
   → `HTTP 200 time_total=0.040552s size=12023`; headers `server: GitHub.com`,
   `content-type: text/html; charset=utf-8`, `last-modified: Wed, 03 Jun 2026 08:45:38 GMT`,
   `date: Thu, 22 Oct 2026 20:59:02 GMT`. No redirect (single 200).
2. `curl ... https://pitest.org/faq/` → `HTTP 200 time_total=0.173310s size=20845`;
   `last-modified: Wed, 03 Jun 2026 08:45:37 GMT`, `date: Thu, 22 Oct 2026 20:59:03 GMT`.
3. Row claims `Last-Modified ... 08:45:38 GMT (home) / 08:45:37 GMT (faq)` → observed values
   match to the second.
4. `sha256sum home.html faq_.html` → `b0c7e0505c51c95b596060ef27babbce08e72d5aaf4557eb002c2637d2bf10cc`
   and `ccf6ac493d6935e2f0a90b716254c57024973d5e2bf1bf3c1e8e60b9772629c1`; these equal the digests
   recorded at `.ufo/waves/round-42/build/ScoutMutationSource.md:18,20` and abbreviated in the row.
   The bodies are byte-identical to the wave-1 fetch, so this reopening tests the same bytes.
5. Row quote (SOURCE row `corpus/SOURCES.md:52`): "If your tests fail then the mutation is killed,
   if your tests pass then the mutation lived." — found in tag-stripped, entity-decoded,
   whitespace-collapsed `home.html`: `quote exact: True`.
6. Lesson Gate quote `corpus/lessons/round-42.md:46-47` reassembles to the identical string
   (it wraps after `the`): normalized lesson text contains the quote → `True`; the C1 body copy
   at `:20-21` likewise → `True`.
7. Word count of the quote: `len(q.split())` → `17`, matching the lesson's "(17 words)" and the
   ≤25-word cap.
8. Home anchor 1 exists byte-exactly: `grep -c '<h1>What is mutation testing?</h1>' home.html` → `1`.
9. Home anchor 2 exists byte-exactly: `grep -c '<h1>How to use it?</h1>' home.html` → `1`.
10. Quote placement: `find('<h1>What is mutation testing?</h1>') < find('If your tests fail then the
    mutation is') < find('<h1>What?</h1>')` → `True`; the sentence is inside the section the row
    and lesson name, and it is a complete sentence ("...your tests are run. If your tests fail ...").
11. FAQ anchor exists: `<h2 id="im-seeing-a-lot-of-timeouts-whats-going-on">I’m seeing a lot of
    timeouts, what’s going on?</h2>`; normalized FAQ text contains the heading → `True`.
12. The row's FAQ anchor is not the quote's source (correct: the row cites the FAQ only for
    timeouts); the row quote appears nowhere in `faq_.html` (`quote exact: False`), as expected.
13. Range observation on the raw bytes: `q in home.html` → `False`, while `q in` the rendered text
    → `True`. Raw HTML reads `If your tests fail then the mutation is <strong>killed</strong>, if
    your tests pass then⏎ the mutation lived.` A raw-byte grep is not a valid check for this row;
    the rendered-text claim holds.
14. Anchor-label nit: `grep -c "I'm seeing a lot of timeouts" faq_.html` → `0` (exit 1). The page
    spells it with U+2019 apostrophes; the row and the lesson's Gate text spell it with ASCII `'`.
    The section is identifiable by name and id, and no quote is attributed to that heading, so
    this does not weaken the claim — it is a character-fidelity nit only.
15. Anchor-form nit: the home page's `<h1>` headings carry no `id` attribute, so a `#fragment`
    URL does not exist for them. The row cites them as `§ Title`, not as fragments, so nothing is
    overclaimed.
16. Teaches-column support in the cited `How to use it?` section (normalized text, offsets ordered
    heading 2544 < 2612 < 2768): "The most effective way to use mutation testing is to run it
    frequently against only the code that has been changed. Once it has been integrated into the
    build file, pitest can be run locally by developers, or automatically against pull requests
    and merge requests using arcmutate." The row's `run against only the code that changed and
    wire it to the build or pull requests` is a paraphrase inside this section.
17. Timeout claim support in the FAQ section: normalized FAQ contains "PIT measures the normal
    execution time of each test without any mutations present" and "normal time * x + y"; the
    row's `timeouts are found by timing the unmutated test (normal time * x + y)` matches the
    page's wording.
18. `grep -rn "If your tests fail" --include=*.mjs --include=*.json corpus scripts SKILL.md
    SCORECARD.md` → no output, `exit=1`; an earlier repo-wide run returned hits only in
    `corpus/SOURCES.md:52`, `corpus/lessons/round-42.md:20,46` and the wave-1 build notes, so no
    second copy of the quote exists that could drift from this one.
19. No leftover processes owned by this seat: it ran only `curl`, `grep`, `sha256sum` and local
    `python3`; no mutant or selftest was started, so the `setsid prlimit` rule did not apply.
    (`pgrep -c -f 'gate-mutants|cite-check|wave-census'` printed `6` — those are other seats'
    concurrent runs in their own clones, not processes this seat started.)
20. Unopened sources: none. Both URLs answered 200 over plain HTTPS; no bot challenge appeared and
    no access-control workaround was used; no tool was installed.

## Remaining unknowns

- What the page said before its 2026-06-03 build was not checked; the claim is about the bytes the
  lane recorded, and those are the bytes re-observed here.
- The row's `fetched 2026-10-22T19:56Z` is the scout's access time, not observable now; the
  byte-identical digest is the strongest available corroboration that the 19:56Z fetch saw this
  content (the wave-1 receipt logs header reads at 19:58:02Z).
