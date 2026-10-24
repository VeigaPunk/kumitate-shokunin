# ScoutTierAudit — source-row audit

Source/quote snapshot: 2026-10-24T04:05:39Z, with the subsequently delivered S102 compatibility alternative inspected in an addendum. Document/source-byte inspection only; no lane integration.

## Axes and authority

Axes: tier honesty; scope specificity; grounded learner benefit; anchor reproducibility; verbatim-byte fidelity. Independent discovery, calibration and byte searches ran in concurrent tool batches; no source files were changed.

`corpus/SOURCES.md:3-8` delegates tier definitions rather than spelling them out. The authority was traced to fleet `.ufo/waves/kaika/SOURCES-CONTRACT-v1.md:24-47`, also carried in fleet `CORPUS.md:91-115`:

- A is primary/authoritative **for the row's scope**; B is strong secondary; C is lead-only. `community` is never A.
- Scope names the applicable claim/topic; teaches is one grounded learner benefit.
- Anchor names an exact section/heading/page/line **plus revision**, not a bare homepage.
- Every new row needs a located, <=25-word quote in the round lesson's Gate.
- The `kind` enum includes `spec`, not `standard`.

Calibration read four A rows and four B rows in full:

| Row | Calibration lesson |
|---|---|
| A S010 (`SOURCES.md:23`) | A specification is A for its named protocol revision; kind is `spec`. |
| A S015 (`:28`) | Builder's report is A for its own reported system, not universal effectiveness. |
| A S046 (`:59`) | Original paper, publication/section/page and saved digest ground a precise claim. |
| A S100 (`:113`) | Official manual's authority stays within a named clock's semantics. |
| B S016 (`:29`) | Opinionated community counterpoint is B, not promoted to general truth. |
| B S049 (`:62`) | Opening only an abstract does not ground a method-dependent percentage; row is rejected. |
| B S058 (`:71`) | Local incident narrative remains B despite an exact commit/digest. |
| B S059 (`:72`) | Vendor documentation cannot replace the primary for a different product's contract. |

## Per-row findings

### S102 — RFC 3339

Proposals inspected: `build/ScoutRfc3339/sources-row.txt:1` (original snapshot 9787) and subsequently delivered `build/ScoutRfc3339/sources-row-spec.txt:1` (compatibility snapshot 6E52), relative to `.ufo/waves/round-52/`.

**Finding: tier/scope/teaches/quote supported; original row's registration incompatibility is resolved by the inspected `spec` alternative. Confidence: high.**

- **Tier A: supported.** The saved primary text identifies RFC 3339, Standards Track, July 2002 (`rfc3339.txt:7-14`). Authority is scoped to RFC timestamp grammar, not JavaScript behavior or verifier correctness.
- **Scope: specific enough.** “grammar + offset rules” and teaches' “from this grammar” avoid claiming that all date syntaxes or application policies come from the RFC.
- **Teaches: supported.** Saved lines 414-415 define a numeric offset or `Z`; line 420 requires `time-offset`; line 422 connects that full-time production to date-time. This supports excluding zone-less date-times from this grammar.
- **Anchor: precise location.** §5.6 and saved lines 414-422 match the claim. The source's RFC number supplies its stable specification identity; explicitly adding “RFC 3339, July 2002” to the anchor would make the revision field unambiguous.
- **Quote: PASS.** The five-word excerpt below is an exact substring of saved line 422, with original internal spaces. The surrounding production chain, not this one line alone, establishes the offset requirement.
- **Original registration blocker; compatible alternative now available:** `sources-row.txt` uses kind `standard`; the frozen enum permits `spec` instead. S010/S011 provide lane precedent. Source owner explained that `standard` was explicitly requested in that seat's assignment, preserved that requested proposal, and supplied `sources-row-spec.txt`. The alternative was directly read and uses `spec` with the same supported tier/scope/anchor/teaches. Admit the compatible alternative, not the original, under the frozen contract. Neither has been integrated by this leaf.

Exact quote searched with the grep tool:

```text
date-time       = full-date "T" full-time
```

Match: `.ufo/waves/round-52/build/ScoutRfc3339/rfc3339.txt:422`.

Independent `sha256sum` observed:

```text
9ab2b8864a85dca73a88f49b0927bc7bc85f596926e4fd1890905777924e700a
```

`fetch.txt:3-12` records the canonical RFC Editor URL, HTTP 200, 2026-10-24T04:03:35Z capture and the same digest. This audit verified saved bytes, not a fresh network re-open.

**Scope boundary:** RFC §5.6 allows numeric offsets, variable fractional precision and lowercase t/z; §5.7 permits leap-second 60 in specified circumstances. The lane's uppercase UTC/millisecond/JavaScript round-trip policy is narrower. Do not attribute finite parsing, exact `toISOString()` equality, receipt ordering/window binding, or v2 correctness to this RFC excerpt.

### S103 — MDN Date.parse()

Proposal inspected: `build/ScoutCompanion/S103-row.md:1` (proposal snapshot 49F6).

**Finding: tier/scope/teaches/quote supported; anchor should carry the available content-revision date. Confidence: high.**

- **Tier B: supported, no inflation.** For general JavaScript/ECMAScript parsing behavior MDN is a strong secondary reference, not the normative standard or evidence that the lane's Node verifier behaved a particular way. The row explicitly acknowledges this boundary.
- **Scope: appropriately bounded.** Offset-less date-and-time input and portability are named; RFC 3339 normative authority is explicitly excluded.
- **Teaches: supported, not overgeneralized to date-only input.** Saved HTML 1765-1766 supplies the local-time example; 1760-1763 distinguishes date-only UTC interpretation; 1747 states other formats are implementation-defined and may differ across browsers.
- **Anchor: exact section and matching line locations.** Capture date, bytes and hash are reproducible snapshot metadata, but not a content revision. Saved HTML line 2011 explicitly provides page-last-modified `2025-07-10T09:07:55.000Z`. Add that labeled content date to meet the strict section-plus-revision wording. Do not substitute or mislabel HTTP Last-Modified `Sat, 24 Oct 2026 01:31:18 GMT` as publication/content revision.
- **Quote: PASS.** The 14-word excerpt in `quote.json:3` is a verbatim substring of saved HTML line 1765, with no intervening markup or whitespace normalization.

Exact quote searched with the grep tool:

```text
will be set to 2019-01-01 at 00:00:00 in the local timezone of the system
```

Match: `.ufo/waves/round-52/build/ScoutCompanion/mdn-date-parse.html:1765`.

Independent `sha256sum` observed:

```text
9c120292f6581b21e361dc5f443dd02653f6fb9d0c0e9be028487897daa0d140
```

`fetch.json:2-10` records the MDN URL, HTTP 200, 2026-10-24T04:03:47Z capture, 172329 bytes and the same digest. This audit verified saved bytes, not a fresh network re-open.

**Scope boundary:** this quote does not prove universal behavior for all malformed dates, browser compatibility completeness, actual lane TZ-dependent verdicts, or v2 correctness. Those require separate evidence.

## Dependencies, limits and containment

Both proposals arrived during independent calibration; neither remained a missing-artifact dependency at the audit snapshot. No waiting or orchestration runtime was used. The initial absent proposals were not treated as rejected rows. A broad contract filename glob timed out; its incomplete result was not treated as absence, and a targeted contract-reference search located the authority.

`mined` and `used-by` are proposed admission states. This leaf did not establish that the integrating entry exists or cites the rows, or run frozen counters/census/source checks. ScribeSources received the kind and content-date findings. No exported code definitions/callers were investigated; LSP semantic tracing was not applicable to this document-only audit.

Writes: own `build/ScoutTierAudit/` and own seat report only. Tool installations/updates: none. No builds, tests, formatters, linters, repository-state mutations or gates were run.
