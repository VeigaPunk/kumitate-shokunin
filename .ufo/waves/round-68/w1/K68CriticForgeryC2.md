VERDICT: The complete self-consistent forgery passes every offline content/gate check (9/10); only M5 rejects it, first because `--no-live` is defined as a miss, then because the fabricated quotes are absent from the real URLs.

## Evidence

Fixture: scratch clone `/fast/scratch/hyaku/kumitate-r68/K68CriticForgeryC2/lane`; forged commit `04c78822f2a6e5ba099ee604f5792026d7870f9f`. The fixture added S207–S213, seven constructed capture files, matching recomputed SHA-256/byte pins, the required snapshot/clock/release sections, and repaired inherited README-map drift.

Command: `TMPDIR=/fast/scratch/hyaku/kumitate-r68/K68CriticForgeryC2 node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-68/probe/deprec68-probe.mjs /fast/scratch/hyaku/kumitate-r68/K68CriticForgeryC2/lane 04c78822f2a6e5ba099ee604f5792026d7870f9f --no-live`

Verbatim output: `DEPREC68_UNMET held=9/10 checks=10 rev=04c78822f2a6e5ba099ee604f5792026d7870f9f rule=M68 | M5 MISS no-live`

Command: `TMPDIR=/fast/scratch/hyaku/kumitate-r68/K68CriticForgeryC2 timeout 600 node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-68/probe/deprec68-probe.mjs /fast/scratch/hyaku/kumitate-r68/K68CriticForgeryC2/lane 04c78822f2a6e5ba099ee604f5792026d7870f9f`

Verbatim output: `DEPREC68_UNMET held=9/10 checks=10 rev=04c78822f2a6e5ba099ee604f5792026d7870f9f rule=M68 | M5 MISS S207:quote-not-live,S207:quote-not-live,S208:quote-not-live,S209:quote-not-live,S210:quote-not-live`

The first result establishes M1–M4 and M6–M10 held, including the archive gates. The second establishes that the five displayed fabricated quotes do not match live fetches; the counter truncates the displayed M5 failures after five.

## Findings

1. **K68CriticForgeryC2-1 — Critical, offline provenance is not established by M3/M4.** M3 verifies that the committed bytes match the pin's self-asserted digest and size; it does not authenticate the bytes as a capture of the row's URL. M4 only locates quotes in those same self-asserted bytes. Reproducer: the `--no-live` command above returns 9/10 with M5 as the sole miss, despite all seven captures being fabricated. Plan M3/M4 language and frozen probe implementation: `.ufo/waves/round-68/plan.md` C2 M3–M5; `.ufo/waves/round-68/probe/deprec68-probe.mjs` `captureOf`/M3 and M4/M5 blocks.

2. **K68CriticForgeryC2-2 — High, M5 checks consistency with the row URL, not source identity.** The real-URL run rejects this forgery (`quote-not-live`), as expected. But M5's predicate is only `wb(quote, fetched body)` at the URL parsed from the same mutable SOURCES row; it does not authenticate the URL's identity or bind the row to an independently trusted origin. Therefore M5 distinguishes these invented quotes from the selected live pages, not arbitrary falsified rows from genuine grounding. Reproducer: the live command above; inspect the probe's M5 `fetch(m[0])` block and M2's URL-presence-only check.

**Calibration / answer:** No offline check catches fabricated-but-self-consistently-pinned bytes: M3 is an integrity pin, not provenance; M4 compares the entry to those bytes. `--no-live` itself forces M5 MISS, so 9/10 is not evidence that a forgery passed M5 offline. If the forger copies the actual page bytes and the quoted material is present, the capture is grounded in those bytes; recomputing its pin does not make it forged. The distinguishing property is correspondence of the capture/quote to the claimed source, not whether the hash was recomputed. M5 tests correspondence at counting time, subject to URL identity and live availability; it cannot attest when those bytes were first captured or independently prove the source URL is authoritative.

## Artifacts

- `.ufo/waves/round-68/w1/K68CriticForgeryC2.md` — this report.
- Scratch-only fixture and generator under `/fast/scratch/hyaku/kumitate-r68/K68CriticForgeryC2/`; no lane subject files were edited.

## Limits

- Did not run a controlled-origin/loopback M5 bypass; the evidence above is the requested real-URL forgery attempt and rejection.
- Did not test a real-page-byte grounded variant or verify every live URL's status independently; the frozen probe's M5 run is the cited live-fetch evidence.
- No build/tests/linters beyond the two required frozen-counter runs.
