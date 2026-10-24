# k28asia — Asian-Source Intelligence Sweep Plan

Mission: what CN/JP/KR/RU-language sources report about "Kimi 2.8 / K2.8 Preview" (Moonshot AI / 月之暗面) that English coverage misses. Axis: ASIAN-SOURCE INTEL ONLY. Siblings own k28arch (identity/params) and k28delta (capability delta).

> *Executed 2026-09-17 — plan artifact retained verbatim.* Report: `.ufo/inquiries/kimi28-asia-report.md`.
> *2026-09-21 (nc3-docs r13):* that report is no longer on the host
> (`.ufo/inquiries/` is gone; a full-tree sweep finds no `*kimi28*` file);
> this plan remains the retained record.

## 1. Data walk findings (grounded, 2026-09-17)

Release date: **2026-09-11**, full rollout on Kimi Code + Kimi Work. Model ID unchanged: `kimi-for-coding`.

| Source class | Density | Notes |
|---|---|---|
| CN primary media | **Dense** | 量子位 qbitai.com/2026/09/487688.html is the origin article; syndicated to 163.com, ifeng, techflowpost, 17173, ITBear. Plus AI-aggregator blogs (aipuzi, okyn, ai-bio, airebao, ruanfujia, accesspath, aigc.bar, openi). |
| CN official | **Confirmed** | kimi.com/code/docs/kimi-code/whats-new.html changelog (v0.40.0/v0.41.0 per cocoloop); kimi-k2.org blog mirror. |
| CN community | **Real but thin for K2.8** | V2EX t/1241371 (naming jokes "3.1-flash", pricing guesses, speed vs Flash, DS v4.1 comparisons). Zhihu: NO K2.8-specific 实测 yet — only K2.7/K2.6 (302.AI lab). Bilibili: no K2.8 video yet (6 days old). |
| JP | **Near-zero** | Only lunabot K2 timeline; no note/Zenn/Qiita K2.8 hits. Absence itself is a finding. |
| KR | **Near-zero** | No K2.8-specific hits surfaced. |
| RU | **Sparse** | apimaster.ai mentions K2.8 Preview (reseller); aitunnel.ru covers K3; matveev.tech K2.7. Habr/vc.ru unprobed. |

### Claims already surfaced (baseline for divergence check)
- 1M context (1,048,576 tok) for ALL membership tiers; K3 gates 1M behind Allegretto+ (¥199/mo).
- Pricing tiers: Adagio free / Andante ¥49 / Moderato ¥99 / Allegretto ¥199 / Allegro ¥699.
- Thinking effort low/high/max (default max); thinking-off routes K3 AND K2.8 requests to K2.8 Preview no-think.
- Image + video input support.
- "无感升级" — zero-config swap, works in Claude Code/OpenCode/Codex/VS Code plugin.
- Moonshot ARR >$1B (Aug 2024), IPO angle, unit-cost reduction strategy.
- Community pain: quota burn, 429/402/403 rate limits (from K2.7 threads — check if K2.8 repeats).
- K3 instability claim: sensitive to thinking-history replay; K2.8 positioned as stable daily driver.

## 2. Source-class map

- **(a) CN primary**: 量子位 (origin), 机器之心, 智东西, 36氪, InfoQ中文, 凤凰网科技, 网易科技 — find reporting independent of the 量子位 syndication.
- **(b) CN official**: kimi.com/code/docs changelog, platform.moonshot.cn, Moonshot 公众号/官方博客, kimi-k2.org.
- **(c) CN community**: V2EX, 知乎 (专栏+问答), 微信公众号, CSDN/掘金, 即刻, 小红书, bilibili.
- **(d) Adjacent Asian**: JP (note/Zenn/Qiita/X-ja), KR (Naver/AI community), RU (habr, vc.ru, aitunnel, apimaster, telegram).

## 3. Scout batch (8 scouts, read-only, each uses `web_search` + `read` on URLs)

> *2026-09-20:* this 8-lane batch predates the wave band (`waveMinLanes=16`/`waveMaxLanes=32`, config/ufo.json); re-spec before any dispatch.
> *2026-09-21 (nc3-docs r13):* the band has since widened — `waveMinLanes=16`/`waveMaxLanes=100`
> (config/ufo.json); the 32 figure above is as-of 2026-09-20.

| # | Scout | Targets | Seed queries |
|---|---|---|---|
| 1 | ScoutCnOfficial | kimi.com/code/docs/whats-new, platform.moonshot.cn changelog, Moonshot 公众号, kimi-k2.org | `Kimi K2.8 Preview site:kimi.com`, `platform.moonshot.cn K2.8`, `月之暗面 K2.8 公告` |
| 2 | ScoutCnPrimary | 量子位 original + 机器之心/智东西/36氪/InfoQ中文 — hunt NON-syndicated reporting | `Kimi K2.8 site:jiqizhixin.com`, `K2.8 site:36kr.com`, `Kimi K2.8 site:infoq.cn`, `K2.8 智东西` |
| 3 | ScoutCnForum | V2EX (t/1241371 + site search), 知乎 | `Kimi K2.8 site:v2ex.com`, `K2.8 site:zhihu.com`, `Kimi K2.8 体验 知乎` |
| 4 | ScoutCnPractitioner | 微信公众号 (via search), CSDN, 掘金, 即刻, 小红书 | `Kimi K2.8 site:csdn.net`, `K2.8 site:juejin.cn`, `Kimi K2.8 Claude Code 配置`, `K2.8 实测 公众号` |
| 5 | ScoutCnVideo | bilibili, 抖音 — K2.8 实测/测评 videos; also 302.AI-style labs for early numbers | `Kimi K2.8 site:bilibili.com`, `K2.8 实测 视频`, `K2.8 benchmark 测评` |
| 6 | ScoutJp | note.com, Zenn, Qiita, Japanese AI news, X-ja | `Kimi K2.8 site:note.com`, `Kimi K2.8 site:zenn.dev`, `Kimi K2.8 site:qiita.com`, `Kimi K2.8 使ってみた` |
| 7 | ScoutKr | Naver blog, Korean AI communities, KR tech news | `Kimi K2.8 site:naver.com`, `Kimi K2.8 후기`, `Kimi K2.8 리뷰` |
| 8 | ScoutRu | habr, vc.ru, aitunnel, apimaster, RU telegram/AI blogs | `Kimi K2.8 site:habr.com`, `Kimi K2.8 site:vc.ru`, `Kimi K2.8 обзор`, `K2.8 Preview русский` |

### Per-scout output contract
Each returns: `URL | exact claim | verbatim snippet (original language) | one-line EN gloss | source-class | syndication-origin (if traceable)`. Empty lane = report "no coverage found" — that IS a finding (e.g., JP silence 6 days post-launch).

## 4. Verification gates

- **G0 pre-dispatch**: scouts carry the §1 baseline claim list; each claim must be CONFIRMED / REFUTED / NOT-FOUND per lane.
- **G1 fetch**: every claim needs a fetchable URL (verify via `read`) + verbatim snippet. No snippet → claim dropped to "unverified" bucket.
- **G2 dedup/syndication**: trace claims to origin. 量子位-syndicated copies count ONCE; flag independent corroboration separately.
- **G3 divergence** (below).

## 5. Divergence-detection procedure vs English coverage

Baseline EN set: PANews EN, cocoloop EN, kimi-k2.org EN — thin: launch fact, model-ID, 1M context, thinking tiers, "close to K3".

For each Asian-source claim, tag:
- **NEW-INFO**: absent from EN baseline (expected: pricing tiers ¥, ARR/IPO, routing internals, quota complaints, K3 instability rationale, video-input detail, tier-gating politics).
- **CONTRADICTS**: conflicts with EN baseline or sibling k28arch/k28delta findings → escalate to L1.
- **CONFIRMS**: matches EN baseline (low value, dedup).
- **NOISE**: aggregator regurgitation with no original claim.

Priority queue for L1: CONTRADICTS > NEW-INFO with independent corroboration > NEW-INFO single-source > CONFIRMS.

## 6. Degrade-never-die

Failed/empty lanes continue locally; failures logged as telemetry. JP/KR near-zero is expected — a scout confirming absence is a successful lane, not a failure.
