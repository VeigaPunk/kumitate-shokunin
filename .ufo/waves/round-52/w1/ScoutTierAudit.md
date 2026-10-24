# ScoutTierAudit

Axes: tier honesty; scope specificity; learner-benefit grounding; anchor reproducibility; verbatim-byte fidelity.

Detailed per-row evidence: [.ufo/waves/round-52/build/ScoutTierAudit/audit.md](../build/ScoutTierAudit/audit.md).

## Observed findings — high confidence

- **S102:** A is justified for RFC 3339 grammar/offset rules; scope and teaches are grounded. The original `sources-row.txt` uses invalid kind `standard`; the subsequently inspected `sources-row-spec.txt` resolves that incompatibility with `spec`. Use that compatible alternative. §5.6/lines 414-422 are accurate; adding “RFC 3339, July 2002” makes the specification revision explicit.
- **S103:** B is appropriately secondary; scope/teaches distinguish offset-less date-and-time parsing from date-only UTC input. Anchor sections/lines are accurate, but capture time/hash is not a content revision. Saved MDN HTML line 2011 gives page-last-modified **2025-07-10T09:07:55.000Z**; add that labeled date, not HTTP Last-Modified **2026-10-24**. ScribeSources received this finding.
- **Both proposed quotes PASS exact-substring grep:** RFC `date-time       = full-date "T" full-time` at saved text line 422; MDN `will be set to 2019-01-01 at 00:00:00 in the local timezone of the system` at saved HTML line 1765. They are 5 and 14 words respectively.
- Independent `sha256sum` matched saved fetch metadata: RFC `9ab2b8864a85dca73a88f49b0927bc7bc85f596926e4fd1890905777924e700a`; MDN `9c120292f6581b21e361dc5f443dd02653f6fb9d0c0e9be028487897daa0d140`.
- Calibration: four A rows S010/S015/S046/S100 and four B rows S016/S049/S058/S059. `SOURCES.md:3-8` delegates definitions; frozen authority located at fleet `.ufo/waves/kaika/SOURCES-CONTRACT-v1.md:24-47`, reproduced in `CORPUS.md:91-115`.

## Inference and unresolved boundaries

The source material supports explicit-zone validation as a policy motivation, not proof of actual lane TZ-dependent verdicts or v2 correctness. RFC 3339 does not prescribe JavaScript finite/round-trip checks; MDN does not establish universal malformed-input behavior. Admission state (`mined`/`used-by`), content-date integration and live gates were not verified. No missing proposal dependency remained; no peer was waited on. No code/exported-contract tracing was needed, so LSP was not applicable.

Only owned auxiliary/report files were written. No tests, builds, linters, formatters, gates, repo-state mutations or orchestration runtime. Tool installs/updates: none.

Report: .ufo/waves/round-52/w1/ScoutTierAudit.md
