VERDICT: S213 is grounded — live GitHub API fetch on 2026-10-27 confirms commit 183238ddacd0118a22399cd4743a5b5eaa43dbdd ("Mark SEPs as final", 2026-06-03T20:45:19Z) flipped SEP-2596 Draft→Final in both `seps/` and `docs/seps/` files; the 2026-06-03 Final date and the 2026-09-03 grace-elapsed reading of the staged theme stand, and the 2026-04-17/2026-05-18 readings are confirmed as Created/merge, not Final.

## Evidence

Live fetch (cwd /fast/scratch/hyaku/kumitate-r68/K68ScoutS213, executed once each, 2026-10-27 ~14:54 UTC):

```
$ curl -sS -D captures/pr2596-commits-api.headers -o captures/pr2596-commits-api.json \
    https://api.github.com/repos/modelcontextprotocol/modelcontextprotocol/pulls/2596/commits
HTTP 200                                   # 102170 bytes, 18 commits

$ curl -sS -D captures/mark-seps-final.headers -o captures/mark-seps-final.json \
    https://api.github.com/repos/modelcontextprotocol/modelcontextprotocol/commits/183238ddac
HTTP 200                                   # 58610 bytes; response headers include
date: Tue, 27 Oct 2026 14:54:30 GMT
last-modified: Wed, 03 Jun 2026 20:45:19 GMT
etag: W/"8e37c3db83b55f35ca96e1faf3be7c22f8203280d3a4c04b0458b0c753cff1ce"
```

Parsed single-commit record (body of captures/mark-seps-final.json):

```
sha        = 183238ddacd0118a22399cd4743a5b5eaa43dbdd
message    = 'Mark SEPs as final'
author.date= 2026-06-03T20:45:19Z
committer  = 2026-06-03T20:45:19Z Caitie McCaffrey
parents    = ['a20715022ca8a8fe8fd814f32709f73758984daa']
files (20): docs/seps/*.mdx x10 (+3/-3 each), docs/seps/index.mdx (+44/-47),
            docs/docs.json (+9/-24), seps/*.md x10 (+1/-1 each)
```

The SEP-2596 hunks, verbatim from the capture:

```
seps/2596-spec-feature-lifecycle-and-deprecation.md  @@ -1,6 +1,6 @@
-- **Status**: Draft
+- **Status**: Final
docs/seps/2596-spec-feature-lifecycle-and-deprecation.mdx
-  <Badge color="gray" shape="pill">
-    Draft
+  <Badge color="green" shape="pill">
+    Final
-| **Status**    | Draft   ->   | **Status**    | Final
```

PR #2596 pulls-API record (round-66 capture `pr2596-pulls-api.json`, re-read for cross-check):
`merged_at = 2026-05-18T18:09:21Z`, `merge_commit_sha = 219f82421ce13f6b0d9f786e603cf9a659fd5216`.
Live commits list for the PR (18 commits): last branch commit `de05e1ef4911` 2026-05-18T17:31:18Z
("Merge main into sep/spec-feature-lifecycle-and-deprecation"); 183238ddac is NOT among them —
it is a later mainline commit, not a PR-branch commit.

## Findings

- **K68ScoutS213-1** (supports claim C2 / check M7): SEP-2596's Final date is 2026-06-03, set by
  commit `183238ddac` "Mark SEPs as final" (author+committer 2026-06-03T20:45:19Z). Severity: none —
  this is the grounding the registry's `## The live clock` needs; `elapsed = 2026-09-03` follows from
  the SEP's three-month grace. Repro:
  `curl -sS https://api.github.com/repos/modelcontextprotocol/modelcontextprotocol/commits/183238ddac | python3 -c "import json,sys; d=json.load(sys.stdin); print(d['commit']['message'], d['commit']['committer']['date'])"` → `Mark SEPs as final 2026-06-03T20:45:19Z`.

- **K68ScoutS213-2** (precision, low): the row scope phrase "merge/final record of PR #2596" spans two
  distinct events — merge of the PR (2026-05-18T18:09:21Z, sha 219f82421ce13f…, status stayed Draft)
  and the later Final flip (2026-06-03, sha 183238ddac…). The S213 row names only the Final record;
  the 2026-05-18 merge date is the staged theme's disproven clock reading and is excluded per plan.
  Both captures are committed so the L1 can cite either bound. Repro: compare `merged_at` /
  `merge_commit_sha` in `round-66/build/K66ScribeGate/captures/pr2596-pulls-api.json` against
  `body.commit.committer.date` in `captures/mark-seps-final.json`.

- **K68ScoutS213-3** (coverage note): the commit touched 20 files — 11 SEPs flipped Draft→Final
  (2106, 2164, 2207, 2322, 2468, 2484, 2549, 2575, 2596 among them) plus `docs/seps/index.mdx` and
  `docs/docs.json` navigation churn; only the two 2596 paths matter for this row. Repro:
  `python3 -c "import json; [print(f['filename']) for f in json.load(open('captures/mark-seps-final.json'))['body']['files']]"`.

- **K68ScoutS213-4** (M5-safety, advisory): row URL is the api.github.com commits endpoint because a
  live re-fetch returns `"Mark SEPs as final"` and `"2026-06-03T20:45:19Z"` verbatim; the html_url
  (github.com/…/commit/183238dd…) renders an HTML page that may not carry the ISO timestamp verbatim.
  If the L1 prefers the html_url in the row, the M4 bullets must be restricted to strings rendered
  in the page (e.g. the message) — the date quote would be at risk.

## Artifacts

- `.ufo/waves/round-68/build/K68ScoutS213/captures/pr2596-commits-api.json` — live PR commits list (HTTP 200), `_fetched` header block + raw body. sha256 b6c711c85d1801a9616df303ad8933a580a430ee33778b0734185a4ff1461175.
- `.ufo/waves/round-68/build/K68ScoutS213/captures/mark-seps-final.json` — live single-commit record for 183238ddac (HTTP 200), `_fetched` header block + raw body. sha256 75f4c688364527cedceafa54ee090a6a472822f75a8810c1cc2d88f09f368271.
- `.ufo/waves/round-68/build/K68ScoutS213/quotes.txt` — 3 located quotes, each ≤ 25 words, all verbatim in the mark-seps-final capture.
- `.ufo/waves/round-68/build/K68ScoutS213/row-S213.md` — draft 11-cell SOURCES row (kind `docs`, tier `A`, opened 2026-10-27, used-by `corpus/knowledge/mcp-deprecation-registry.md`).

## Limits

- Did not verify the commit via the HTML commit page or the checks/statuses endpoints; the REST commit record plus `last-modified` response header are the dated evidence used.
- Did not re-fetch the PR #2596 pulls record itself live (round-66 capture reused as cross-check only); the commits list it links was re-fetched live.
- Patch truncation: the returned `files[]` patches cover the hunks shown; large-file fields beyond the 20 listed files were not applicable (commit has exactly 20 files).
- Unauthenticated API (rate limit 60/h); no X-RateLimit exhaustion observed (remaining 53).
