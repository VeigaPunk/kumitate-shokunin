VERDICT: One medium-severity URL-classification defect; actual cited URLs classify correctly, S207 decoded bytes were stable across four live fetches, and offline M11 fails closed.

## Evidence
Axes: freshness, origin authenticity, deterministic byte comparison, offline fail-closure. Review recommendation only; no admission or integration.
Frozen assignment: `.ufo/waves/round-69/plan.md:142-168`, freeze `9401d8655970d542b81d318bdad558d6dea39397`.
Counter reviewed: `.ufo/waves/round-69/probe/deprec69-probe.mjs`, SHA256 `af021f87a33f50bb529bf7f06780cc910e2aeb2d230db294d7edfb36dd2852e7`.
LSP unavailable: `read xd://lsp` returned `No such tool: xd://lsp`; textual review and executable extracted-arm tests are not semantic-reference proof.

Command (exit 0):
`node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-69/build/K69ReviewM11Origin/origin-attack.mjs`
Verbatim selected output (full receipt in build):
```text
PINNED embedded_foreign_url=true https://example.invalid/?next=https://raw.githubusercontent.com/a/b/v1.2.3/file.md
PINNED patch_suffix=true https://github.com/a/b/commit/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa.patch-not-a-patch
ISOLATED offline: M11 MISS no-live
ISOLATED offline: synthetic_fetches=0
LIVE {"name":"default-1","status":200,"url":"https://modelcontextprotocol.io/specification/2026-07-28/deprecated.md","encoding":"br","bytes":3839,"sha256":"c12c3cb7d6b8a30cd4df8ea8162a819df071a42745da6d20165e8fdf94b28baa"}
LIVE {"name":"default-2","status":200,"url":"https://modelcontextprotocol.io/specification/2026-07-28/deprecated.md","encoding":"br","bytes":3839,"sha256":"c12c3cb7d6b8a30cd4df8ea8162a819df071a42745da6d20165e8fdf94b28baa"}
LIVE {"name":"gzip","status":200,"url":"https://modelcontextprotocol.io/specification/2026-07-28/deprecated.md","encoding":"gzip","bytes":3839,"sha256":"c12c3cb7d6b8a30cd4df8ea8162a819df071a42745da6d20165e8fdf94b28baa"}
LIVE {"name":"identity","status":200,"url":"https://modelcontextprotocol.io/specification/2026-07-28/deprecated.md","encoding":null,"bytes":3839,"sha256":"c12c3cb7d6b8a30cd4df8ea8162a819df071a42745da6d20165e8fdf94b28baa"}
LIVE_COMPARE all_success=true same_digests=true
```
The first run's same-bytes synthetic fetch lookup was faulty and produced `origin-unreachable`; that is a harness failure, not a counter finding. Fixed only the seat-owned driver; reran only that failed arm, without repeating the successful live fetches.
Command (exit 0): `node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-69/build/K69ReviewM11Origin/origin-attack.mjs --mirror-only`
```text
ISOLATED same-bytes-mirror: M11 PASS ok
ISOLATED same-bytes-mirror: synthetic_fetches=10
```
This extracts the unchanged M11 block and its real helpers, supplies current subject rows/captures, and substitutes an in-memory S214 capture equal to S207 plus synthetic matching network bodies. It proves acceptance logic, NOT that the actual upstream mirror currently serves identical whole-file bytes. No source/capture was edited.

Canonical command (exit 1, 58.82 seconds):
`env TMPDIR=/fast/scratch/hyaku/kumitate-r69/K69ReviewM11Origin node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-69/probe/deprec69-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin 9401d8655970d542b81d318bdad558d6dea39397 --no-live`
```text
DEPREC69_UNMET held=8/11 checks=11 rev=9401d8655970d542b81d318bdad558d6dea39397 rule=M69 live=no-live(vacuous-declared) | M5 MISS no-live | M9 MISS readme-map-exit=1 | M11 MISS origin-section-absent
```
Freeze has no origin section; the isolated current-subject arm separately exercised `bad11.push('no-live')` at counter line 522 with zero fetches. Both reject offline. Counter comment at line 53 says offline exit 2, but actual footer line 552 and the observed command return 1: diagnostic documentation mismatch, not an authentication bypass.

## Findings
1. **K69ReviewM11Origin-1 — Medium, future-ratchet issue: PINNED_URL recognizes embedded strings instead of the fetched URL's authority and complete pathname.** Counter `.ufo/waves/round-69/probe/deprec69-probe.mjs:445-446` uses unanchored regexes. The two verbatim cases above return true although one actual authority is `example.invalid` and the other is not a commit `.patch` pathname. At lines 465-468 that classification skips the required non-content-pinned mirror arm; at line 478 it can also accept a non-pinned mirror address. An attacker-controlled HTTPS endpoint could [INFERENCE] return current capture bytes and satisfy digest equality without providing the promised pinned carrier. Live hashing still authenticates the URL actually fetched: this does NOT prove arbitrary-byte capture forgery against the present legitimate rows or full 11/11 admission. Reproduce with the `--mirror-only` command above (the regex cases run before the mirror arm). Later-round strengthening: parse URL, require exact HTTPS hostname and owner/repo/ref/path boundaries, and require `.patch` to terminate the pathname. Do not patch this frozen round's predicate.

## Artifacts
- `.ufo/waves/round-69/w1/K69ReviewM11Origin.md` — report.
- `.ufo/waves/round-69/build/K69ReviewM11Origin/origin-attack.mjs` — reproducible extracted-arm driver.
- `.ufo/waves/round-69/build/K69ReviewM11Origin/origin-attack.txt` — first-run URL classification, offline arm, four live receipts, and explicitly superseded mirror harness failure.
- `.ufo/waves/round-69/build/K69ReviewM11Origin/mirror-attack.txt` — corrected isolated mirror acceptance receipt.
- `.ufo/waves/round-69/build/K69ReviewM11Origin/s207-{default-1,default-2,gzip,identity}.bin` — four durable live bodies.

## Limits
- All S207–S216 URL forms were classified: only S207/S208/S211 require mirrors; tags S209/S212, commit S210, patch S213 and mirrors S214–S216 are accepted. No current cited URL is wrongly rejected.
- Moving semver tags are real residual immutability risk, already explicitly admitted by frozen plan lines 162-165; not a new defect. Re-tagging to different bytes would MISS against the old capture. Live matching alone cannot authenticate historical tag identity if capture pins are also replaced.
- Node fetch returned the same decoded 3839 bytes for Brotli, gzip and identity, including newline bytes. `arrayBuffer()` here is decoded body content, not compressed wire bytes. No encoding hazard reproduced; four concurrent same-host fetches cannot prove future CDN/edge stability. A future newline/content change honestly triggers digest mismatch, as the plan states.
- Equal canonical/mirror bytes are honest corroboration, not forgery, when distinct declared URLs independently serve those bytes. M11 requires distinct row IDs and live verification of each URL, not unequal hashes or independent authors; actual entry states this at `corpus/knowledge/mcp-deprecation-registry.md:127-137`. Only S207 has table cross-carrier equivalence; no extra semantic-equivalence guarantee is claimed here.
- Redirect target pinning is not checked (counter lines 515-519); no actual redirect-chain attack or full forged 11/11 tree was exercised. No resume/runtime rerouting behavior falls in this assignment.
- Current worktree subject was read during integration, not certified as a committed final revision. Only the offline canonical receipt names a revision. No full live final counter run, repository-wide diagnostics, or unrelated checks performed. No tools installed or updated; scratch removed before yielding.
- Self-evaluation: accuracy 4 (synthetic mirror is explicitly not a live-origin proof); completeness 4 (no full-tree spoof admission attempted); clarity 4 (failed harness receipt retained and superseded); actionability 4 (precise later-round fix, frozen rule unchanged); conciseness 4 (durable receipts require detail). Overall 4.0; user-facing limits are explicit.
