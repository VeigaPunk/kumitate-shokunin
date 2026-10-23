# ReopenS098 — re-open the strace manual for S098

**Verdict: HOLDS.** The draft row in `.ufo/waves/round-48/build/ScribeStraceManual.md`
reproduces the upstream manual exactly; every citation re-verifies against an
independent re-fetch. The L1 may land S098.

## Method

Independent fetch 2026-10-23 (~this run), saved to `/tmp/reopen-s098/strace.1.in`:

```sh
curl -fsSL --max-time 60 -o /tmp/reopen-s098/strace.1.in \
  'https://raw.githubusercontent.com/strace/strace/v7.2/doc/strace.1.in'
sha256sum /tmp/reopen-s098/strace.1.in
```

Observed: `c16859e07dacc5cda882c7ab5f2e353803645a6ca449a0ac41eda1034e67ae9a`,
file is 2242 lines — **byte-identical hash to the draft's claimed body sha256**
(the draft's `11:52:26 GMT` fetch and this re-fetch got the same bytes; the tag is
immutable on this path and the hash proves content equality regardless of Date).

## Verified claims (all byte-exact)

| Draft claim | Observed at fetched file |
|---|---|
| `:832-835` is the `-a`/`--columns` heading; `:835` = "Aligns return values in a specific column (default column 40)." | `.TP 12` `:831`, `.BI "\-a " column` `:832`, `.TQ`/`.BR "\-\-columns" = \fIcolumn\fR` `:833-834`, the quoted sentence `:835` — exact |
| `:148-158` interleaving + unfinished/resumed | `:148` "If a system call is being executed while another is called from a different" (exact); `:149-150` "thread or process, `.B strace`"; `:151` "will attempt to preserve the order of these events and mark the ongoing call as" (exact); `:152` `.IR unfinished .`; `:153` "When the call returns, it will be marked as" (exact); `:154` `.IR resumed .`; `:156` unfinished select sample; `:157` a second PID's `clock_gettime`; `:158` `[pid 28772] <... select resumed> )      = 1 (in [3])` (od-verified: 6 spaces of column padding between `)` and `=`, demonstrating the column-40 alignment claim) |

Every quoted string in the draft is byte-identical to the fetched file; all quotes
are ≤25 words as the draft asserts.

## Draft's downstream claims spot-checked against the frozen probe

Probe `.ufo/waves/round-48/probe/caproute48-probe.mjs` sha256
`f24a3af55add0708943526435fde93e02f4ef0c9d4b8e494a9111a5fec890cf2` — the frozen
counter sha256. Draft cites `:171-175` for `\)\s+=` end-of-record return match
(regex at `:173`, alignment comment `:171-172` — inside the cited window) and
`:153-167,193-196` for unfinished bookkeeping / unmatched-resume / pending
fail-closed (`second unfinished` `:156`, `no pending entry` `:164`,
`never resumed` die at `:193-196`; the cited `153-167` window ends one line before
the resumed block's closing brace at `:168` — a one-line under-cite, immaterial).

## Draft self-framing

`status=queued` and the row's `used-by` field
(`caproute48-probe.mjs, corpus/lessons/round-48.md`) are marked as proposed
targets, not observed citations — the draft explicitly notes
`corpus/lessons/round-48.md` is absent at report time. No overclaim found.

## Findings

None blocking. Residual nit (non-blocking, no action required): the `:153-167`
probe line window excludes the resumed block's close brace at `:168`.

## Artifact

`/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/r48/ReopenS098.md`
