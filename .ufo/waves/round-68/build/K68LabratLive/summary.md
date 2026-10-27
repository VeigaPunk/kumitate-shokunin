# M5 live-fetch reliability probe — K68ScoutLiveTrials, kumitate r68 w1

Date: 2026-10-27. Three `curl -sS -L --max-time 45` trials per candidate URL; status + `time_total`
recorded in `trials.tsv`. URLs are the seven prepared S-ids S207–S213 as drafted by K68ScribeRows
(`.ufo/waves/round-68/w1/K68ScribeRows.md:8-15`); S211 is the corrected 2025-11-25 variant
(the briefed 2025-11-05 URL is a live 404, per K68ScribeRows-4).

## Results

| URL | trials | http codes | times (s) | max |
|---|---|---|---|---|
| S207 modelcontextprotocol.io/specification/2026-07-28/deprecated.md | 3 | 200,200,200 | 0.453, 0.310, 0.264 | 0.453 |
| S208 modelcontextprotocol.io/community/feature-lifecycle.md | 3 | 200,200,200 | 0.426, 0.378, 0.344 | 0.426 |
| S209 raw.githubusercontent.com/can1357/oh-my-pi/v18.12.6/.../sse.ts | 3 | 200,200,200 | 0.221, 0.014, 0.013 | 0.221 |
| S210 github.com/modelcontextprotocol/modelcontextprotocol/pull/2596 | 3 | 200,200,200 | 2.165, 0.093, 0.097 | 2.165 |
| S211 modelcontextprotocol.io/specification/2025-11-25/basic/transports.md | 3 | 200,200,200 | 0.480, 0.368, 0.292 | 0.480 |
| S212 raw.githubusercontent.com/can1357/oh-my-pi/v18.13.1/.../sse.ts | 3 | 200,200,200 | 0.014, 0.013, 0.013 | 0.014 |
| S213 api.github.com/repos/modelcontextprotocol/modelcontextprotocol/commits/183238ddac | 3 | 200,200,200 | 0.369, 0.064, 0.063 | 0.369 |

- Flaky: none — all 21 fetches returned HTTP 200 (curl exit 0), no status changes across trials.
- Slow (>10 s): none — worst single fetch 2.165 s (S210 cold fetch of GitHub PR HTML, ~500 KB).
- Sum of per-URL worst trials: ≈ 4.0 s. Observed M5-style serial wall time ≈ 4.0 s
  (the three S210 trials differ because the first was a cold fetch; warm fetches are ~0.09 s).

## Worst-case wall time for M5's serial fetch

M5 (`deprec68-probe.mjs:252-270`) awaits one `fetch` per **bullet** in `## Located quotes`
(not per unique row URL), each bounded by a 45 s `AbortController` timeout, serially.
Bound: `worst_case_s = n_bullets × 45`. With the minimum 6 bullets ⇒ 270 s; if the entry cites
one bullet per each of the 7 rows ⇒ 315 s; if any row is cited by k bullets the bound scales.
There is no dedup: two bullets on the same row fetch the URL twice.

Observed bound vs measured: measured wall ≈ 4 s vs theoretical worst 315 s — 99% of the
timeout budget is headroom; a fully hung URL set would stall the counter ~5.3 min before
`unreachable` is recorded.

## Note for L1 (Limits)

All seven URLs are currently reachable and fast; none needs a Limits note for flakiness.
The one network caveat worth recording is upstream of this probe: the **briefed** S211 URL
(…/2025-11-05/basic/transports) returns 404 today — already flagged as K68ScribeRows-4; only
the corrected 2025-11-25 URL should enter a SOURCES row. S210 is a ~500 KB GitHub HTML page;
a content-moving page could flip a quote-not-live later even though status stays 200.

## Reproduce

```sh
cd <scratch>; while read sid url; do for t in 1 2 3; do
  curl -sS -L --max-time 45 -o /dev/null -w "$sid $t %{http_code} %{time_total}\n" "$url";
done; done < urls.txt
```
