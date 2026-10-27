VERDICT: All seven candidate URLs (S207–S213) are live and fast — 21/21 fetches returned HTTP 200 in ≤ 2.17 s, none flaky, none slow — so M5's live arm adds ≈ 4 s to counting, with a 315 s worst-case bound (7 URLs × 45 s serial timeout, scaling per cited bullet not per row).

## Evidence

- URL set taken from the prepared rows draft: `.ufo/waves/round-68/w1/K68ScribeRows.md:8-15` (S211 = corrected `2025-11-25` variant; the briefed `2025-11-05` URL 404s — K68ScribeRows-4).
- Command: `curl -sS -L --max-time 45 -o /dev/null -w '%{http_code} %{time_total}' <url>`, three trials per URL, all seven URL-triplets run concurrently (each triplet's trials serial), exit 0 for all 21:

```
S207  200 0.453 / 200 0.310 / 200 0.264
S208  200 0.426 / 200 0.378 / 200 0.344
S209  200 0.221 / 200 0.014 / 200 0.013
S210  200 2.165 / 200 0.093 / 200 0.097
S211  200 0.480 / 200 0.368 / 200 0.292
S212  200 0.014 / 200 0.013 / 200 0.013
S213  200 0.369 / 200 0.064 / 200 0.063
```

- M5 fetch semantics read from the frozen counter `deprec68-probe.mjs:252-270`: one awaited `fetch` per `## Located quotes` bullet (no dedup by row URL), `AbortController` timeout 45 s each, `redirect:'follow'`; on non-ok → `http-<status>` MISS, on throw → `unreachable` MISS.
- Worst-case serial wall time: `n_bullets × 45 s`. Minimum-entry 6 bullets ⇒ 270 s; one bullet per each of 7 rows ⇒ 315 s; more bullets per row scale it linearly. Observed actual: sum of worst trials ≈ 4.0 s.

## Findings

**K68ScoutLiveTrials-1 — INFO — no URL is flaky or slow; M5's live arm is cheap on today's network.**

Attacks nothing; confirms the plan's stated M5 limit ("needs the network at counting time") is a ≤ ~4 s cost, not a reliability risk, for these seven URLs. Slowest is S210 (GitHub PR HTML, ~500 KB): 2.165 s cold, 0.09 s warm. Reproduce: the curl loop in `build/K68LabratLive/summary.md`.

**K68ScoutLiveTrials-2 — LOW — M5 fetches once per bullet, not per row URL; bullet count sets the worst-case bound.**

Attacks the naive "7 URLs × 45 s" reading: if the entry cites two bullets on the same row, the URL is fetched twice; `worst_case = n_bullets × 45 s` (`deprec68-probe.mjs:254-269` iterates `bullets`). With ≥ 6 bullets the bound is ≥ 270 s before any dedup. Not a defect — a sizing note: an entry with many bullets and one hung origin stalls the counter minutes. Reproduce: `sed -n '250,270p' .ufo/waves/round-68/probe/deprec68-probe.mjs`.

**K68ScoutLiveTrials-3 — LOW — S210's live target is a ~500 KB moving GitHub HTML page; status stays 200 while quote content can drift.**

Attacks M5's quote-reverification for the S210 bullet specifically: `github.com/…/pull/2596` HTML embeds live thread state (K68ScribeRows-7 already flags this for pinning); a future comment render could flip `quote-not-live` with status still 200. Mitigation already exists: S213 (api.github.com commit JSON) is static. Reproduce: `curl -sS -L -o /dev/null -w '%{size_download}\n' https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2596` → ~502434 B.

## Artifacts

- `.ufo/waves/round-68/build/K68LabratLive/trials.tsv` — 21 rows: sid, trial, curl_rc, http_code, time_total_s
- `.ufo/waves/round-68/build/K68LabratLive/summary.md` — per-URL table, worst-case math, L1 Limits note
- `.ufo/waves/round-68/w1/K68ScoutLiveTrials.md` — this report

## Limits

- Probed at one instant (2026-10-27 ~15:0xZ) from this host; says nothing about the counting-time network.
- Did not verify quote bodies (M5 does `wb(quote, body)`); only status/timing measured.
- S211 correction (2025-11-05 → 2025-11-25) is taken from K68ScribeRows' draft; if the L1 keeps the 404 variant, M5 fails — that risk is already routed as K68ScribeRows-4, not re-scored here.
- curl UA vs node `fetch` UA may differ marginally (GitHub rate-limits/api behaviour); all endpoints here are anonymous-friendly (200s today).
