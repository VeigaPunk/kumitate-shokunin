RESULT ReopenS070 rev=a2e5b54c verdict=confirmed quotes_found=0/0

Re-opened source (ordinary means; row line 11 of inherited-rows.md, full row read):
- git clone -q https://github.com/containers/bubblewrap into scratch seat dir; checkout --detach 362936aea0d5c6e70f7af75d2d44b5a914cb4ba2; `git rev-parse HEAD` -> 362936aea0d5c6e70f7af75d2d44b5a914cb4ba2; `git describe --tags 362936ae…` -> v0.13.1; `git log -1` -> "362936ae… Prepare 0.13.1 release HEAD, tag: v0.13.1".
- Fetch record: `curl -sSL -o bw-fetch.c -w 'HTTP %{http_code} FINAL %{url_effective}\n' https://raw.githubusercontent.com/containers/bubblewrap/362936aea0d5c6e70f7af75d2d44b5a914cb4ba2/bubblewrap.c` -> HTTP 200 FINAL https://raw.githubusercontent.com/containers/bubblewrap/362936aea0d5c6e70f7af75d2d44b5a914cb4ba2/bubblewrap.c; body sha256 de141c805cb88f8faff9af1b3bb49098191fc67833b51b51fea84510ea4426ce; `cmp -s bw-fetch.c bwrap/bubblewrap.c` -> IDENTICAL. Version the text belongs to: tag v0.13.1 (= pinned commit); host bwrap 0.13.1 (host facts) matches.

Check 1 — locator exists and says what teaches/gloss claims: CONFIRMED
- :2490 is the `xclearenv ();` call inside the `--clearenv` argument branch (sed -n '2489,2491p' shows `{ xclearenv (); }`).
- :3487-3495 is the pid-namespace fork path: `pid = fork ();` (3487), `if (pid != 0)` (3491), comment at 3481-3484: "We have to have a pid 1 in the pid namespace, because otherwise we'll get a bunch of zombies as nothing reaps them." — 23 words (`printf '%s' "…" | wc -w`).
- Reaper never execs: forked pid-1 side runs `do_init` (comment 578-581: "This is pid 1 in the app sandbox. It is needed because we're using pid namespaces, and someone has to reap zombies in it." — 24 words); body is a `wait(&status)` loop with eventfd write and exit, no exec call.
- :3555 is `if (execvp (exec_path, argv) == -1)`; xclearenv runs at option-parse time (2490) before this execvp, so the gloss "edits bwrap's own environ before execvp of the command; PID 1 is a forked reaper that never execs, so its exec-time environment stays readable at /proc/1/environ" is grounded in the named lines.

Check 2 — draft-attributed quotes: 0 marked quotes attributed to S070 in inherited-entry-draft.md (`grep -n 'S070'` -> one hit, M5 line 84). The only guillemet quote on that line, «bwrap is running a minimal pid 1 process», belongs to the S069 (bwrap.xml) clause and is found verbatim at bwrap.xml:62-64 in the same clone — "bwrap is running a minimal pid 1 process" (8 words). S070's attribution on that line is prose (mechanism claims), all verified under the named lines in check 1. quotes_found=0/0.

Check 3 — pinned sha256 matches fetch: CONFIRMED. Row pins de141c805cb88f8faff9af1b3bb49098191fc67833b51b51fea84510ea4426ce; my clone file and raw-fetch body both hash to it. Stable tag, not a live page drift case.

Check 4 — kind/tier: CONFIRMED. Frozen contract read at /home/vgpnk/Projects/shokunin/.ufo/waves/kaika/SOURCES-CONTRACT-v1.md:24-30: kind enum includes `code`; tier A = "primary or authoritative for that scope (spec, official docs, source code, original paper, maintainer statement, …)"; `community` is never A; tier scoped to scope. Upstream bubblewrap source at its official release tag v0.13.1 is primary for the scope "why --clearenv does not empty /proc/1/environ inside the sandbox". kind=code, tier=A correct.

Check 5 — rejected-row reason: N/A. Row status is `mined` (used-by: corpus/knowledge/agent-isolation-substrates.md, corpus/lessons/round-45.md), not rejected; no rejection text to hold.

Observation (seat report, not row): DemoBwrapEnv build report quotes the pid-1 comment as "lines 3488-3492"; the comment actually sits at 3481-3484 (3488-3492 are the fork/if(pid!=0) code lines). The S070 row's own anchor (:3487-3495) is accurate; no row correction needed. No corrected row text.
