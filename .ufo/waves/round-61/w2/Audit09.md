# Audit09 — Source-Quote: S195 Temporal capture (round 61 / w2)

Target claim (SOURCES row S195, `corpus/SOURCES.md:147`): quote field is the
Pinned-Workflow guarantee sentence from `https://docs.temporal.io/worker-versioning.md`,
captured at `.ufo/waves/round-61/build/ScoutSourceWorkerVersioning/body.md` with
sha256 `8ef2ee5f5e196d9d14fc8c85449442764e812f3e4f0f6e2bb1bdc12895f0f8fc`.
Attacked artifact: `.ufo/waves/round-61/w1/ScoutSourceWorkerVersioning.md` +
`corpus/knowledge/temporal-worker-versioning-pinning.md`.

## Verdict

**Quote verified byte-for-byte — VERIFIED.** All three artifacts carry the identical
86-byte string; the committed-capture hash matches the claim and a live re-fetch
taken during this audit. One minor recheck-sentinel defect found in the knowledge
entry; one residual-risk note on what is actually committed in VCS.

## Evidence

| Check | Result | Exact pointer |
|---|---|---|
| Capture hash | `sha256 8ef2ee5f5e196d9d14fc8c85449442764e812f3e4f0f6e2bb1bdc12895f0f8fc`, 9645 bytes — matches SOURCES field 6 and w1 report | `.ufo/waves/round-61/build/ScoutSourceWorkerVersioning/body.md` |
| Live re-fetch (2026-10-25, this audit) | HTTP 200 `text/markdown`, 9645 B, **identical sha256** | `/tmp/kumitate-r61/Audit09/worker-versioning.md` |
| Quote in capture | occurs exactly **once** (`bytes.count == 1`); first sentence of `body.md:39` under heading `### Pinned Workflows` at `body.md:37`; section path `## Versioning behaviors` at `body.md:31` | `body.md:37,39` |
| Quote in SOURCES | field 7 of `corpus/SOURCES.md:147` — byte-equal (len 86, `==` on Python str after field-strip) | `corpus/SOURCES.md:147` |
| Quote in knowledge entry | curly-quoted string in § "Pinned and Auto-Upgrade behaviors" — byte-equal to canonical | `corpus/knowledge/temporal-worker-versioning-pinning.md` |
| Quote form | `A **Pinned** Workflow is guaranteed to complete on a single Worker Deployment Version.` — 13 words as claimed; quote-bytes sha256 `bd18e7c3baa6e9cacfa5aa388d2c4267d79b94a29c948c928d2f753285ef3c91` | — |
| findings.md line cites spot-checked | `body.md:94` ("Auto-upgrade Workflows never inherit versions."), `body.md:95` (Pinned children inherit), `body.md:43` (Auto-Upgrade replay-safe sentence) — all accurate | `.ufo/waves/round-61/build/ScoutSourceWorkerVersioning/findings.md:44,31` |

## Findings

**F1 — minor (recheck sentinel wrong):** the knowledge entry's `recheck:` line
claims `curl -fsSL 'https://docs.temporal.io/worker-versioning.md' | grep -c 'Pinned Workflows'`
is "expected 1". Actual count is **2** (`body.md:37` heading, `body.md:50` bullet).
The recheck would fire a false-positive drift alert on the unchanged page. Fix:
count `^### Pinned Workflows` (or expected 2). Severity: operational noise only;
does not corrupt the quote.

**F2 — residual risk (commit coverage):** at git HEAD `be4a820` none of the wave-1
artifacts are committed: `.ufo/waves/round-61/build/`, `w1/`, and
`corpus/knowledge/temporal-worker-versioning-pinning.md` are untracked
(`git status --porcelain` → `??`), and the S195 row is an uncommitted `M
corpus/SOURCES.md`. jj `@` `4fd1ebf` (working-copy commit) contains the SOURCES
modification only (`git ls-tree 4fd1ebf` lacks `build/ScoutSourceWorkerVersioning/`
and the knowledge entry; `jj status` lists them as `?` untracked — not
gitignored). So the "committed Temporal capture" premise holds only for the
working-tree bytes verified above; nothing in VCS yet pins them against loss or
rewrite before a snapshot lands. The bytes themselves are correct — this is a
durability gap, not a content defect.

## Method

- `sha256sum` on committed-capture path and on a fresh `curl -fsSL` download
  (same 9645 B body ⇒ upstream unchanged since capture).
- Python byte-compare of the quote string across `body.md`, `SOURCES.md` field 7,
  and the knowledge entry's curly-quoted span; `bytes.count` for uniqueness;
  line numbers via `grep -n` / `sed -n`.
- VCS state via `git status --porcelain`, `git diff`, `git ls-tree 4fd1ebf`,
  `jj status`, `git log -S 'S195'` (only hit: `4fd1ebf`).

No tools installed. No files outside `/tmp/kumitate-r61/Audit09/` written.
