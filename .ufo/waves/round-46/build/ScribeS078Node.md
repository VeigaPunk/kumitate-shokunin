RESULT ScribeS078Node rev=516977af verdict=admit words=5 sha256=fa03f32419b4fa809b6b89bae1925df0f5c08ee03a21fbbddcc4b9dfb6d4353e

Behavior
- Admitted the official Node.js v24.21.0 child_process docs as tier A for the `env` default in `spawn()` and `spawnSync()`.
- The quoted text says only that `env` is environment key-value pairs and defaults to `process.env`; it does not itself establish a specific git invocation's environment behavior.

Evidence
- `mkdir -p /fast/scratch/hyaku/kumitate-r46/seats/w1-ScribeS078Node` → no output (success).
- `node --version` → `v24.21.0`.
- `curl --fail --location --max-filesize 10000000 --output /fast/scratch/hyaku/kumitate-r46/seats/w1-ScribeS078Node/child_process.html --write-out 'HTML_HTTP_STATUS=%{http_code}\n' https://nodejs.org/docs/v24.21.0/api/child_process.html` → `HTML_HTTP_STATUS=200`; fetched 215.5k.
- `sha256sum /fast/scratch/hyaku/kumitate-r46/seats/w1-ScribeS078Node/child_process.html` → `fa03f32419b4fa809b6b89bae1925df0f5c08ee03a21fbbddcc4b9dfb6d4353e`.
- In fetched HTML, section `child_process.spawn(command[, args][, options])`, line 983: `Environment key-value pairs. Default: process.env.`; same text in `child_process.spawnSync(command[, args][, options])`, line 1598. HTML page header is `Node.js v24.21.0` (line 7).
- `curl --fail --location --max-filesize 10000000 --output /fast/scratch/hyaku/kumitate-r46/seats/w1-ScribeS078Node/child_process.md --write-out 'RAW_HTTP_STATUS=%{http_code}\n' https://raw.githubusercontent.com/nodejs/node/v24.21.0/doc/api/child_process.md` → `RAW_HTTP_STATUS=200`; fetched 86669 bytes.
- `sha256sum /fast/scratch/hyaku/kumitate-r46/seats/w1-ScribeS078Node/child_process.md` → `32b3209c134878bfd556e50db453353b8360d810e5d72015e104fb254f52b03a`.
- Second channel: quote is verbatim after Markdown markup is ignored at `child_process.spawn()` line 680 and `spawnSync()` line 1368. Result: yes.
- `printf '%s' 'Environment key-value pairs. Default: process.env.' | wc -w` → `5`.
- Search `^\| S078 \|` in `corpus/SOURCES.md` → no matches; S078 is available after S077.
- `pgrep -af '[w]1-ScribeS078Node'` → no output; no process matching this scratch path remained.

Draft SOURCES.md row (11-column contract shape)
| S078 | Node.js v24.21.0 docs, child_process.spawn()/spawnSync() — https://nodejs.org/docs/v24.21.0/api/child_process.html | docs | A | `env` option defaults for child_process.spawn() and spawnSync() in Node.js v24.21.0 | § child_process.spawn(command[, args][, options]), HTML line 983; § child_process.spawnSync(command[, args][, options]), HTML line 1598; page header `Node.js v24.21.0`; body sha256 fa03f32419b4fa809b6b89bae1925df0f5c08ee03a21fbbddcc4b9dfb6d4353e; fetched 2026-10-23 (ScribeS078Node) | `env` is an Environment key-value object; its default is `process.env` | mined | 2026-10-23 | on-release | corpus/lessons/round-46.md |

Draft `## Gate` table row for the round lesson
| S078 | https://nodejs.org/docs/v24.21.0/api/child_process.html | 2026-10-23 | "Environment key-value pairs. Default: process.env." (§ child_process.spawn(command[, args][, options]), HTML line 983, 5 words) | admit A, mined — raw v24.21.0 source confirms verbatim (markup aside), lines 680 and 1368 |

Gates and limits
- No selftests, gates, frozen counters, or demos were run; this item establishes source evidence only. C1 after-state scoring remains with the L1.
- No tools were installed or updated.
- SOURCES.md and corpus/lessons/round-46.md were not edited; the two rows above are drafts in this report, per the lane write boundary.

Touched surfaces and artifacts
- Only lane file written: `.ufo/waves/round-46/build/ScribeS078Node.md`.
- Read-only source bodies: `/fast/scratch/hyaku/kumitate-r46/seats/w1-ScribeS078Node/child_process.html` and `child_process.md`.
- Source-contract path used: `/home/vgpnk/Projects/shokunin/CORPUS.md`; the initially supplied nested lane path `/home/vgpnk/Projects/shokunin/kumitate-shokunin/CORPUS.md` was absent.
