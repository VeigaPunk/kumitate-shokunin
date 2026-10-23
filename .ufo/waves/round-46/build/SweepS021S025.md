RESULT SweepS021S025 rev=516977af verdict=clean rows=5 defects=0

Anti-loop source re-open sweep, rows S021–S025 of corpus/SOURCES.md at 516977af2216b1cc426ee970d260dee53714bf4f. Method: admission quotes located with `git grep -n 'S02x' 516977af… -- corpus/lessons/` (round-35 lesson `## Source rows opened this round` + round-35-verifier-spotcheck gate table); sources re-opened by ordinary means 2026-10-23 (curl / GitHub raw + API / git in a fresh clone); quotes matched verbatim with `grep -F` on the fetched bytes — for S024 after stripping backtick markup (markup aside); for S022/S023/S025 the HTML quotes match verbatim inside text nodes (tags stripped for context display). No pinned body sha256 exists in any of the five rows (HTTP sha256s below are this sweep's own). None of the five rows is rejected (S021–S023 `mined`, S024–S025 `queued`), so no reject-reason check applies. Scratch: /fast/scratch/hyaku/kumitate-r46/seats/w1-SweepS021S025/ (no stray processes at close, pgrep clean). Tools installed: none (host curl, git, coreutils only).

ROW S021 verdict=holds — upstream range 964f443e..31c465f1 (own-work)
- Re-open: fresh `git clone -q --no-hardlinks /home/vgpnk/Projects/ufo-fsd-alpha` into scratch, detached at 31c465f1, GIT_DIR/GIT_WORK_TREE/GIT_INDEX_FILE unset (the round-35 clone /fast/scratch/kumitate-r36/src no longer exists; local repo objects used, both revs resolve).
- `git log --oneline 964f443e..31c465f1 -- scripts crates/ufo-core-runtime/src crates/ufo-cli/src` line 1: "routing: grammar admits org-prefixed model ids (provider/org/model; per-component charset, no ./..) in parseRoute + build.rs; mirror + seat tables regenerated …" — admission quote verbatim, 15 words (`wc -w`), matching corpus/lessons/round-35.md:55.
- `git diff --name-status 964f443e 31c465f1 -- scripts | awk …uniq -c` → `2 A / 6 D / 61 M` = anchor cell exactly. `git log -1 --format='%H %cI' 31c465f1` → `31c465f15669f744848bd9f5d56191c5085670f7 2026-10-20T07:25:51-03:00` = anchor's range head and commit time.
- teaches "dev-verify.sh and six shell or extensionless files are outside the member patterns": A = omp-route-grammar.mjs, ufo-swarm-registry.mjs; D = dev-verify.sh + the 5 files of frozen s-deleted-5.txt (frozen set excludes dev-verify.sh); diff-M minus frozen s-modified-members-55.tsv (cut -f1, 55 lines) = exactly gates.sh, self-iter.sh, smoke.sh, ufo-night-watchdog-lib.sh, ufo-night-watchdog.sh, ufo-sighting — five .sh + one extensionless.
- teaches "universe 91 → 88 members": arithmetic 91 − 5 + 2 = 88 holds on the frozen member sets (the 91 baseline itself rests on the round-35 census, not re-derived from the diff — noted in the round-35 scribe report as [INFERENCE] there too).

ROW S022 verdict=holds — Kimi slash-commands page
- Re-open: `curl https://moonshotai.github.io/kimi-code/en/reference/slash-commands.html` → HTTP 200, body sha256 943e24fc8bf636d47c52fd8bbfbc60cb04dc9885e88d5ac6e8383ccc6b940bdb. Header now `Last-Modified: Fri, 23 Oct 2026 08:04:12 GMT` vs the row's fetch-time `Mon, 19 Oct 2026 10:22:06 GMT` — page has moved since 2026-10-20 (no body sha pinned in the row; anchor honestly records the fetch-time header, so no pin drift).
- Admission quote verbatim in today's bytes (1 hit): "Configure MCP servers and handle MCP OAuth login." under § Built-in skill commands, /mcp-config row.
- teaches "/mcp lists server connection status and is always available": § Information & Status table has an `Always available` column; /mcp row = "List MCP servers and their connection status in the current session" + Yes.
- teaches "/mcp-config is an idle-only built-in skill": page states "All built-in Skill commands are only available in the idle state."

ROW S023 verdict=holds — Stryker mutant states and metrics
- Re-open: `curl https://stryker-mutator.io/docs/mutation-testing-elements/mutant-states-and-metrics/` → HTTP 200, body sha256 5295e9bb464367c8287d4d56d822b01710edd744a2445fd73a222f405e4cc450.
- Admission quote verbatim (1 hit): "When at least one test failed while this mutant was active, the mutant is killed." under § Mutant states.
- teaches "survived = all tests passed": page says "When all tests passed while this mutant was active, the mutant survived."
- teaches "mutation score = detected / valid": § Metrics table prints the formula "detected / valid * 100" (mutation score row), and defines both operands ("The number of mutants detected by your tests." / "The number of valid mutants.").
- Anchor "page undated": no publication date or Last-Modified header found in the fetched bytes — consistent.

ROW S024 verdict=holds — OMP docs/mcp-config.md
- Re-open: raw.githubusercontent.com at the row's pinned main 10b9b493 AND current main 0b5c27ab24719c86a5986b95ee55f4e75bc1aaa0 (ls-remote today) — both HTTP 200, identical bytes, sha256 8d612764ebda528a32c4579876928fbb0c1545eab32d7e596113b02a3a3fe4fc; main moved but this file did not.
- Admission quote verbatim at :22 of § Preferred config locations with backticks stripped (markup aside): "The native provider also reads .omp/.mcp.json and ~/.omp/agent/.mcp.json for compatibility, but OMP writes to the primary mcp.json paths above."
- teaches: lines 19–20 list the primary files "Project: `.omp/mcp.json`" and "User: `~/.omp/agent/mcp.json`"; line 22 carries the legacy-compatibility sentence — both cells located.
- Anchor "file last changed 4ab6de0b (2026-10-16)": GitHub API commits?path=docs/mcp-config.md → head sha 4ab6de0b20b54c0bd4ced8295b723e58f7971e52, date 2026-10-16T14:01:35Z.

ROW S025 verdict=holds — Anthropic Building effective agents
- Re-open: `curl https://www.anthropic.com/research/building-effective-agents` → HTTP 200, body sha256 6acbc3bc9ba7416e9b49b50ecad38439109fc493209c5c2708f2759d4e1e76b3; /engineering/ path verified 308 → /research/ URL, matching the anchor's note.
- Admission quote verbatim in § What are agents? (in text and in the page's embedded JSON): "Workflows are systems where LLMs and tools are orchestrated through predefined code paths." (14 words)
- Anchor dates exact: JSON-LD "datePublished":"2024-12-19T00:00:00.000Z", "dateModified":"2026-10-09T06:34:08.000Z".
- teaches "five workflow patterns": exactly five "Workflow:" sections — Prompt chaining, Routing, Parallelization, Orchestrator-workers, Evaluator-optimizer.
- teaches "agents direct their own process; simplest solution first": page says agents "dynamically direct their own processes and tool usage" and "we recommend finding the simplest solution possible, and only increasing complexity when needed" — fair paraphrases, nothing beyond the located bytes.

Residual risk / verification gaps:
- S021's 91-member baseline (teaches "91 → 88") is arithmetic on frozen round-35 member sets, not an independent recount from the census member patterns; the diff-level claims (2A/6D/61M, set differences) are all re-derived first-hand. The clone source was the local ufo-fsd-alpha working repo, not a network fetch.
- S022's body changed since the row's fetch (Last-Modified 19→23 Oct); quotes and taught cells still hold in today's bytes, but the row's `recheck: on-release` should re-run before any future claim rides the new revision.
- S025 body sha256 differs from any earlier fetch on record (no pin kept in the row); quotes verified in today's bytes only.
- No row in scope carries a pinned body sha256, so the sweep's sha256 values are new observations, not comparisons; S021 has no HTTP body by nature (git objects).
