# K75ScribeNote — round 75 (2026-11-04)

## Behavior and touched surfaces

Axes: coverage:omp (C1 note binding), operability (auditable source/mode distinctions).
Complete proposed note: `.ufo/waves/round-75/build/K75ScribeNote/omp-agent-root.md`.
Only that draft and this report were written. The lane knowledge note, census, SOURCES.md and fleet files were not edited. No commits, tool installations, fixtures or scratch directories were created; no scratch cleanup was necessary.

Preserved all existing sections and historical claims, explicitly labelling old counts recalled. Added lsp.json (file, host ceiling 0600), nine explicit family ids (splitting two formerly combined rows), the three new families, and Note binding. Updated source/verified-at/recheck. The header revision is the observed lane HEAD `fd7862d4331beeee8fccde9b35aa16287f149f87`, from `git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin rev-parse HEAD` (exit 0), not an invented landing revision.

## Gates exercised

Only the requested lexical draft-binding check was run; no census, build, selftest, cite-check, strict claims check or round gate was run by this seat. Exact command (cwd lane root):

```sh
node -e 'const fs=require("node:fs"); const p="/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-75/build/K75ScribeNote/omp-agent-root.md"; const s=fs.readFileSync(p,"utf8"); const bases=["RULES.md","agent.db","agents","blobs","cache","config.yml","custom-session-files","history.db","hooks","kimi-device-id","last-changelog-version","mcp.json","mcp.json.rea.backup","models.db","models.yml","predict","sessions","skill-descriptions.db","terminal-sessions","themes","tools","commands","prompts","memories","extensions","lsp.json"]; const families=["agent-pre-restore","agent-recovered","history-corrupt","agent-corrupt","mcp-pre-disable","mcp-rea-backup-recovery","config-pre","agent-pre-named","models-corrupt"]; let bound=0; for(const [kind,tokens] of [["base",bases],["family",families]]) for(const token of tokens){const count=s.split(token).length-1; bound+=count>0; console.log(`${kind}\t${token}\t${count}`)} console.log(`NOTE_TOKEN_BINDING: ${bound===35?"PASS":"FAIL"} bound=${bound}/35 base=${bases.length} families=${families.length}`); process.exitCode=bound===35?0:1;'
```

Observed exit 0:

```text
base RULES.md 1
base agent.db 9
base agents 4
base blobs 1
base cache 1
base config.yml 7
base custom-session-files 1
base history.db 4
base hooks 1
base kimi-device-id 2
base last-changelog-version 1
base mcp.json 6
base mcp.json.rea.backup 2
base models.db 5
base models.yml 1
base predict 1
base sessions 2
base skill-descriptions.db 2
base terminal-sessions 1
base themes 1
base tools 1
base commands 1
base prompts 1
base memories 1
base extensions 2
base lsp.json 4
family agent-pre-restore 1
family agent-recovered 1
family history-corrupt 1
family agent-corrupt 1
family mcp-pre-disable 1
family mcp-rea-backup-recovery 1
family config-pre 1
family agent-pre-named 1
family models-corrupt 1
NOTE_TOKEN_BINDING: PASS bound=35/35 base=26 families=9
```

Counts are literal, non-overlapping substring occurrences (not a claim of one-to-one semantic proof). Every family id also occurs naturally as a table id. The executor was given the draft path for its separate `--note` receipt; no executor outcome is claimed here.

## Provenance and quality criteria applied

Read the frozen plan, live note, census BASE_MEMBERS/CHAIN_FAMILIES, and corpus/QUALITY.md. Source files read through file tools; initial pinned-tree searches for `lsp\.json`, `\.pre-`, `pre-\$\{` did not establish OMP provenance: the pin is ufo-fsd-alpha, not oh-my-pi.

S224: directly read scout `build/K75ScoutLspDocs/lsp-config.md`, `config-file-sources.ts`, and `v18.15.0/docs_lsp-config.md:20-46`. Exact doc quote at line 40: “User-wide preferences → active native agent directory's `lsp.json`”; default-profile spelling at line 36. Scout's coordination receipt supplies tag commit `3fedf8d53267e32a6d7521ce725fdcc4a36fdc67`, main `ff0a986b88c223a0a746ed95cda8ddada236140c` and identical-file SHA-256 `04b56a7d86663141a68dacb79f61d660acee1a33d56cc7a994367b8a90baf9da`; these comparisons were not rerun by this seat. Main catalog 18.16.0 versus installed 18.15.0 is disclosed, not erased by file identity.

S225: scout coordination receipt names fleet run7 lines 13,78 (commit `4e94cae9fe88644ec842fdb54b8242fcf73b9529`) and run9 lines 340,349 (commit `5c8af59c9308607b5ce16b08f2e44823492d0b1c`). A read-only targeted fleet search independently displayed the same backup records. Standalone S224/S225 draft paths were not yet present when read; citations use the scouts' supplied anchors and the source excerpts, not invented line numbers. SOURCES row admission remains L1 work.

Applied Q1 header triple, Q2 source attribution, Q3 dated command for new declaration counts/recalled labels for old counts, Q4 UNKNOWN for models-store opt-in, Q5 shape-only credential boundary, Q8 named version skew, Q9 single-domain scope, Q14 durable repo-relative receipts and Q18 distinction between template evidence and caller opt-in. Q6 automated admission gates remain unexercised, not PASS. Existing historical no-writer and layout claims were retained as historical rather than independently swept anew.

Additional observed shell command, shape-only (no member contents opened):

```sh
ls -la /home/vgpnk/.omp/agent | awk '{print $1, $NF}' | grep -E 'pre-|corrupt|lsp' | sort | uniq -c | sort -rn | head -50
```

Exit 0; output included `-rw------- lsp.json`, operator backup names and models-corrupt names. This used shell search/paging despite the specialized-tool preference; it is disclosed, not rerun for decoration. No credential values were printed.

## Findings, conflicts and limits

- Models quarantine is a store-agnostic S054 template; the per-store `recoverCorruption` opt-in was not located. Scout bundle inspection found the generic guard, not a models.db caller. The note does not assert that caller exists.
- Operator records sample backup naming; they do not authenticate all live names or sidecar writers. LSP 0600 is a host restriction/observed shape, not a documented upstream write guarantee.
- Frozen plan: “7 `agent.db.pre-<slug>-<YYYYMMDD>` (4 files + 3 SQLite sidecars)”. Scout receipt: “7 agent.db.pre-* (3 bases + 4 sidecars; bases kimi58-unblock-20261027 and kimiroute-20261027 NAMED, merge-20261103 UNNAMED).” The shape-only listing agrees with three base files plus four sidecars. This discrepancy does not change the total seven and is not silently reconciled.
- The frozen 35 declarations are contract names, not proof that every possible OMP member is declared. Existing open limits remain.
- Live census, mutation kills, bogus-member discrimination, SOURCES append, citation admission and byte-exact landing are out of scope for this scribe; no result is asserted.

## Self-evaluation

Accuracy 4/5: scoped UNKNOWN and host policy explicitly; legacy anchors retained rather than revalidated. Completeness 4/5: full draft and all 35 counts delivered; automated admission remains L1-owned. Clarity 4/5: historical/current provenance separated, but the preserved note is dense. Actionability 4/5: byte-copyable draft and exact count command; source rows still require L1 admission. Conciseness 4/5: report includes lengthy exact command because auditability requires it. Overall 4.0/5. Improvement priorities: L1 admission gates, then immutable S224 URL normalization if its registry prefers commit URLs. Would the user agree: likely, provided this draft is not represented as landed or gate-admitted.
