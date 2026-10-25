VERDICT: S199 opens clean — the Firefox Source Docs jj page (HTTP 200) carries the stale-workspace trigger, the remedy command and the exact config knob `snapshot.auto-update-stale`; 8 quotes verified against the frozen counter's norm(), with two spacing traps for quote authors (see Findings).

## Evidence
Fetch (cwd = build/K64ScoutFirefoxOpen/capture):
```
curl -sSL -A 'Mozilla/5.0 (kumitate-r64)' -o firefox-jujutsu.html -w 'HTTP %{http_code} size_download=%{size_download} url=%{url_effective}\n' https://firefox-source-docs.mozilla.org/contributing/jujutsu.html
HTTP 200 size_download=53233 url=https://firefox-source-docs.mozilla.org/contributing/jujutsu.html
53233 firefox-jujutsu.html
abbe47cfa45e809694b224d0db0ea7d6b00e9846b94086d077aea0604db7b3d2  firefox-jujutsu.html
```
Page: `<title>Introduction to Jujutsu &mdash; Firefox Source Docs documentation</title>`; Sphinx + sphinx_rtd_theme. Section: `<section id="working-with-multiple-workspaces">` `<h3>Working with multiple workspaces`, nested under "Firefox Main Tips". The page's own source link: https://github.com/mozilla-firefox/firefox/blob/main/docs/contributing/jujutsu.md . The page states no last-updated date and no jj version (only "Recent versions of jj default to being co-located").
Normalisation: `norm()` copied byte-for-byte from `.ufo/waves/round-64/probe/jj64-probe.mjs:56-63` into `build/K64ScoutFirefoxOpen/norm.mjs` -> `capture/firefox-jujutsu.norm.txt` (12106 chars). `node verify.mjs` output (all quotes in-section and in-page):
```
1 8w  in-section=true in-page=true
2 14w in-section=true in-page=true
3 22w in-section=true in-page=true
4 21w in-section=true in-page=true
5 21w in-section=true in-page=true
6 13w in-section=true in-page=true
7 22w in-section=true in-page=true
8 23w in-section=true in-page=true
9 15w in-section=true in-page=true   (9th quote = optional extra, not in the 8 below)
```
Sentence "Page does not carry it" does NOT apply: the setting is carried (quote 1/2), including its default value and who sets it.

## Findings
- K64ScoutFirefoxOpen-1 (medium, quote authoring vs frozen norm): norm() replaces every HTML tag with a space, so text after an inline `<code>` gets a space before punctuation. A quote that ends `...update-stale.` or contains `= true, which` does NOT match; the page text normalises to `snapshot.auto-update-stale = true , which` and `jj workspace update-stale .` (I hit both failures in verify.mjs run 1). Repro: `node -e` on capture/firefox-jujutsu.norm.txt `.includes("jj workspace update-stale.")` -> false, `.includes("jj workspace update-stale")` -> true. Mitigation: end quotes before the code-adjacent punctuation, as in the list below.
- K64ScoutFirefoxOpen-2 (medium, verbatim vs matchable): the config command is Pygments-split into per-token spans (`<span class="n">snapshot</span><span class="o">.</span><span class="n">auto</span><span class="o">-</span>...`), so a human-verbatim quote `jj config set --workspace snapshot.auto-update-stale false` is NOT found after norm() (verify.mjs prints false); the matchable form is `jj config set -- workspace snapshot . auto - update - stale false`. Repro: `grep -c 'snapshot.auto-update-stale false' capture/firefox-jujutsu.norm.txt` -> 0. Use the verbatim-matching spaced form only if the counter must find it; otherwise cite the knob via the prose quote (1), which is one span and matches, and the remedy via quote 6, also single-span.
- K64ScoutFirefoxOpen-3 (low): the typographic apostrophe in the page (workspace’s) is mapped to ' by norm(); quotes must carry ASCII ' (done below).

## Ready-to-paste (section: "Working with multiple workspaces"; every line verified by verify.mjs)
- S199 — "By default, ./mach vcs-setup configures snapshot.auto-update-stale = true"
- S199 — "which causes jj to automatically update a workspace's working copy when it becomes stale."
- S199 — "A workspace becomes stale when a commit it depends on is rewritten from another workspace, for example by rebasing, editing, or squashing."
- S199 — "We recommend this default because some mach commands invoke jj and can fail, sometimes silently, if the working copy is stale."
- S199 — "for example to avoid triggering a slow rebuild after rebasing patches in bulk from another workspace, you can disable this per-workspace:"
- S199 — "jj config set -- workspace snapshot . auto - update - stale false"   (norm-matchable form of the page's `jj config set --workspace snapshot.auto-update-stale false`; see -2)
- S199 — "With auto-update disabled, most jj commands will refuse to run on a stale workspace until you manually update with jj workspace update-stale"
- S199 — "this is only relevant when you modify one workspace's ancestor from another workspace, which is what causes the former workspace to become stale."
(Optional extra, verified: "you only touch the current workspace's ancestors, then you won't encounter stale workspaces very often.")

Facts covered: stale trigger (rewrite of a depended-on commit from another workspace), remedy (`jj workspace update-stale`), knob (`snapshot.auto-update-stale`, default true via `./mach vcs-setup`, per-workspace disable by `jj config set --workspace`), failure mode when disabled (jj commands refuse to run on a stale workspace), and why the default (mach commands invoking jj can silently fail).

## Tier argument
The page is Mozilla's first-party contributor documentation (firefox-source-docs.mozilla.org, built from docs/contributing/jujutsu.md in github.com/mozilla-firefox/firefox, the Firefox source repo). Tier A for its scope: how jj multi-workspace stale handling behaves and is configured in a Firefox checkout set up by `./mach vcs-setup` (the vendor documents its own tooling default, and the trigger/remedy text is first-hand operational guidance from a large real user of jj workspaces). Only B for general jj semantics: it is a downstream user guide, not the jj project's docs; it carries no jj version, no date, and its page body ("Introduction to Jujutsu", links to third-party tutorials) is community-authored within the repo. [INFERENCE: authorship beyond the repo path.] The stale-workspace facts agree with, but do not replace, upstream jj docs (https://jj-vcs.github.io/jj/latest/); cite upstream (A) for jj behaviour, and this page as A-for-Firefox-config / B-for-jj-generic.

## Artifacts
- build/K64ScoutFirefoxOpen/capture/firefox-jujutsu.html (53233 B, sha256 abbe47cf…7b3d2)
- build/K64ScoutFirefoxOpen/capture/firefox-jujutsu.norm.txt
- build/K64ScoutFirefoxOpen/norm.mjs, verify.mjs
- w1/K64ScoutFirefoxOpen.md (this file)

## Limits
Did not run the frozen counter itself (no entry exists yet); did not fetch jj upstream docs or confirm `snapshot.auto-update-stale` against jj's config schema; did not check Wayback/previous page versions; no tool installs.
