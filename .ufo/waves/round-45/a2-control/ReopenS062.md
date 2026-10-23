RESULT ReopenS062 rev=a2e5b54c verdict=confirmed quotes_found=1/1

Re-derive of inherited candidate row S062 (git-worktree(1), Git 2.56.0). Source re-opened by ordinary means; every check VERIFIED on the bytes I fetched.

## Re-open (ordinary means, curl)
- Command: `mkdir -p /fast/scratch/hyaku/kumitate-r45/seats/a2-ReopenS062 && curl -L --silent --show-error --fail-with-body -w '\nHTTP_STATUS=%{http_code}\nFINAL_URL=%{url_effective}\n' -o .../git-worktree.html https://git-scm.com/docs/git-worktree && sha256sum ... && wc -c ... && file ...`
- Observed: `HTTP_STATUS=200`; `FINAL_URL=https://git-scm.com/docs/git-worktree`; sha256 `008ed08fa9414bbd65f7d47c4b7afb7f9e81d52fabfd5d704ef1e55064a35d0f`; 99050 bytes; `HTML document, Unicode text, UTF-8 text, with very long lines (454)`.

## Check 1 — locator exists and supports teaches/gloss: CONFIRMED
- § COMMANDS `add <path> [<commit-ish>]`, HTML lines 2482–2485 (anchor at line 2480): text reads "The new worktree is linked to the current repository, sharing everything except per-worktree files such as HEAD, index, etc." (19 words, `wc -w`; verbatim after tag-strip, whitespace-folded match confirmed).
- § REFS, h2 at line 2756, body 2759–2769: "all pseudo refs are per-worktree and all refs starting with refs/ are shared"; exceptions "refs/bisect, refs/worktree and refs/rewritten are not shared" (lines 2765–2769).
- § CONFIGURATION FILE, h2 at line 2793, body 2796–2815: "By default, the repository config file is shared across all worktrees." (line 2796); worktreeConfig extension text through line 2815 ("Older Git versions will refuse to access repositories with this extension.").
- Branch-checkout refusal: § COMMANDS lines 2513–2514 "otherwise the command will refuse to create the worktree (unless --force is used)".
- Version: line 1334 `git-worktree last updated in 2.56.0`; line 1341 links `/docs/git-worktree/2.56.0`. Text belongs to the Git 2.56.0 manual; installed `man git-worktree` footer `Git 2.56.0 2026-09-27` agrees (host git 2.56.0).

## Check 2 — verbatim quotes the inherited draft attributes to S062: 1/1 FOUND
- Draft (inherited-entry-draft.md) cites S062 on lines 1, 69–72, 123. Single verbatim quote attributed: «The new worktree is linked to the current repository, sharing everything except per-worktree files such as HEAD, index, etc.» Found verbatim in fetched bytes (K3 normalization: no guillemets/apostrophes in quote; whitespace-fold + tag-strip match) and sits under § COMMANDS `add`, HTML lines 2482–2485 — the named section.
- Draft's other S062 statements (M4) are paraphrase: refs shared except refs/bisect, refs/worktree, refs/rewritten (§ REFS 2765–2769 ✓); repository config shared (§ CONFIGURATION FILE 2796 ✓).

## Check 3 — pinned sha256 vs fetch: MATCH (no note needed)
- Row pins `008ed08fa9414bbd65f7d47c4b7afb7f9e81d52fabfd5d704ef1e55064a35d0f`; my fetch returned the identical sha256, HTTP 200, final URL unchanged.

## Check 4 — kind/tier: CONFIRMED
- kind=docs, tier=A. SOURCES-CONTRACT-v1 (frozen, .ufo/waves/kaika/) tire A = primary/authoritative for the scope (official docs, source, original paper, maintainer statement, lane's own gate output); `community` never A; tier C never sole support (QUALITY Q2). git-scm.com is the official git manual for scope "what a linked worktree shares / per-worktree state, Git 2.56.0". Correct.

## Check 5 — rejection reason: N/A (row status is `mined`, not rejected; no flip/rejection text to hold).

## Other row fields
- status=mined, opened=2026-10-23, recheck=on-release — consistent with contract (append-only fields; recheck cadence on-release allowed). used-by names corpus/knowledge/agent-isolation-substrates.md + corpus/lessons/round-45.md (entry commit pending, per round plan).

## Verdict
- confirmed. No correction to the row text needed. Row S062 as inherited stands.
