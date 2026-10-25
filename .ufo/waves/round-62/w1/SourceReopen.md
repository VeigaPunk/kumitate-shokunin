# SourceReopen — S195 live source vs lane capture vs round-62 claim support

Seat: L1Kumitate62.SourceReopen (round-62 w1, reports-only). Assignment: open the source cited by round-61 S195 directly from its URL, compare bytes/quote/locator to the lane capture, and check whether this source supports the round-62 frozen claim. No corpus edits; none made. No verdict on any round-62 claim — evidence findings only.

## 1. Live access record (2026-10-25)

| Field | Value |
|---|---|
| URL | `https://docs.temporal.io/worker-versioning.md` (raw markdown; `.md` suffix per llms.txt convention) |
| Fetch | `curl -sS -L` (direct; `url_effective` == request URL, no redirect) |
| HTTP | `HTTP/2 200`; `content-type: text/markdown; charset=utf-8` |
| Response date | `Sun, 25 Oct 2026 13:20:04 GMT` |
| `last-modified` | `Sat, 24 Oct 2026 00:21:02 GMT` |
| `etag` | `"689e2563eb73d2382351d119ee1d4ad5"` |
| Cache | `x-vercel-cache: HIT` (served via Vercel CDN; evidence is of the cached representation) |
| Byte size | 9645 (`wc -c`) |
| sha256 | `8ef2ee5f5e196d9d14fc8c85449442764e812f3e4f0f6e2bb1bdc12895f0f8fc` |

Both fetch-time headers (`last-modified`, `etag`) are identical to the values recorded at capture time in `.ufo/waves/round-61/build/ScoutSourceWorkerVersioning/findings.md` (fetched 2026-10-25T09:40:58Z). The page entity is unchanged between the capture window and this reopen.

## 2. Byte comparison vs lane capture

`diff <live> <capture>` is empty: the live fetch is **byte-identical** to `.ufo/waves/round-61/build/ScoutSourceWorkerVersioning/body.md` (same 9645 bytes, same sha256 `8ef2ee5f…`). Line numbers coincide, so every locator in the capture is valid on the live page.

Committed-bytes check at lane tip `0cbe0d75e5a08718e2256408329692908c837766` (spot-check commit; tracked worktree clean): `git show 0cbe0d7:.ufo/waves/round-61/build/ScoutSourceWorkerVersioning/body.md` hashes to `8ef2ee5f…`, equal to the sha256 cell of the S195 row. The committed capture satisfies the E4 pin as of tip.

## 3. Quote / locator verification

- Quote sentence: `A **Pinned** Workflow is guaranteed to complete on a single Worker Deployment Version.` — present at **line 39** of both the live page and the capture, and occurs **exactly once** (`grep -c` = 1 in both).
- Heading chain (live page): `## Versioning behaviors` (line 31) → `### Pinned Workflows` (line 37) → quote (line 39). This matches the S195 anchor `§ Versioning behaviors → § Pinned Workflows`.
- Recheck-cadence command from the entry header, `curl -fsSL 'https://docs.temporal.io/worker-versioning.md' | grep -c 'guaranteed to complete on a single Worker Deployment Version'` → prints `1` (expected 1).
- S195 row at committed tip, `git show 0cbe0d7:corpus/SOURCES.md`, line 147, `## Registry` section. `split('|')` produces 13 fields including the two edge empties ⇒ **11 contract cells**, with `cells[8]=mined`, `cells[9]=2026-10-25`, `cells[11]=corpus/knowledge/temporal-worker-versioning-pinning.md` — exactly the cell contract R61-V2 prescribes (indices 8/9/11). The row also carries the sha256 pin `8ef2ee5f…` in cell 6.

## 4. Does this source support the round-62 frozen claim?

Constraint: the round-62 claim sentences are frozen in the parent plan; the lane's `.ufo/waves/round-62/plan/` is empty at this writing, so the exact frozen sentences are not readable here. Support is evaluated against the only observable round-62 targets: the six routed defects (R61-V1..V6, per `corpus/lessons/round-61-verifier-spotcheck.md`) and the surfaces this wave attacks.

**Supported by live source + committed bytes today:**

1. E4 pin equality: the sha256 pin in the S195 row equals both the live bytes and the committed capture bytes (`8ef2ee5f…`). The quoted evidence is reproducible at the live URL, byte-for-byte.
2. Locator truth: the 13-word guarantee sentence exists exactly once under `§ Pinned Workflows` at body.md:39 / live line 39 — the locator in the row and in the entry's Grounding block is accurate.
3. Recheck cadence returns the expected 1.
4. Row-cell data for the R61-V2 fix: the honest S195 registry row has cells 8/9/11 = `mined` / `2026-10-25` / entry path, matching the contract indices. Source-side data does not obstruct the honest-row pass of a fixed counter.

**Not supported / gaps to hold:**

- If any round-62 claim cites the how-to page `/production-deployment/worker-deployments/worker-versioning` or the legacy Build-ID page `/encyclopedia/worker-versioning-legacy.md`, this source cannot ground it — those are different documents, never opened (single-document brief; noted in findings.md).
- The concepts page body carries no publish/version date; freshness rests solely on the `last-modified` header (2026-10-24) and `etag`.
- The quoted guarantee is scoped to "complete on a single Worker Deployment Version". The page states nothing about which version a top-level pinned retry uses when inheritance conditions do not apply (entry marks that UNKNOWN), and nothing that would support an exactly-once reading. Any claim asserting either would exceed this source.
- Counter behavior (E3/E4/E5 reading revision vs worktree, `\s` vs `[[:space:]]`) is probe code, not source content; this page neither supports nor refutes it. What this reopen can say is that the committed data (capture, row, pin) is consistent with a revision-only honest pass.

No drift found: live bytes today equal the pinned capture. Flag: both fetches read the Vercel CDN representation (`x-vercel-cache: HIT`, same etag); evidence is of that cached entity, not an origin figure.

## 5. Remaining unknowns

- Exact round-62 frozen claim sentences (parent plan not present in lane; `.ufo/waves/round-62/plan/` empty at writing).
- No other S195 document opened; any cross-page fact (SDK flags, CLI behavior) is unverified.

## Verification commands used

```
curl -sS -L -o /tmp/live-worker-versioning.md -w "HTTP %{http_code} url=%{url_effective} size=%{size_download}\n" https://docs.temporal.io/worker-versioning.md
sha256sum /tmp/live-worker-versioning.md <lane>/.ufo/waves/round-61/build/ScoutSourceWorkerVersioning/body.md
diff /tmp/live-worker-versioning.md <lane>/.ufo/waves/round-61/build/ScoutSourceWorkerVersioning/body.md
curl -fsSL 'https://docs.temporal.io/worker-versioning.md' | grep -c 'guaranteed to complete on a single Worker Deployment Version'
git -C <lane> show 0cbe0d75e5a08718e2256408329692908c837766:corpus/SOURCES.md | grep -n "^| S195 |"
git -C <lane> show 0cbe0d75e5a08718e2256408329692908c837766:.ufo/waves/round-61/build/ScoutSourceWorkerVersioning/body.md | sha256sum
```
