VERDICT: S207–S213 all match their captured SHA256 on 2026-10-30; the requested sources census exits 0 with six W04 warnings.

## Evidence

Axes: freshness, reproducibility, non-interference. Frozen plan read; no subject, counter, pin or frozen receipt was modified.
Source URLs: `corpus/SOURCES.md:159-165`; registry source declarations: `corpus/knowledge/mcp-deprecation-registry.md:1-9`; capture pins: `.ufo/pins/source-captures.json:271-317`. Paths in this report are relative to `/home/vgpnk/Projects/shokunin/kumitate-shokunin` unless absolute.

Executed for each listed URL: `curl -fsSL --max-time 120 -o <seat-scratch>/<id>.body -w '%{http_code}\t%{size_download}\t%{url_effective}\t%{content_type}' <URL>`, then SHA256 of the downloaded bytes. All seven curl exits were 0, HTTP 200; no effective URL changed. Exact URLs and results are preserved in `build/K69ScoutDrift/fetch-results.json` under this round's wave directory.

| id | live sha256 | capture sha256 | match/drift |
|---|---|---|---|
| S207 | c12c3cb7d6b8a30cd4df8ea8162a819df071a42745da6d20165e8fdf94b28baa | c12c3cb7d6b8a30cd4df8ea8162a819df071a42745da6d20165e8fdf94b28baa | MATCH |
| S208 | 3f3371911512591e61d80d8e1bf07ac6a93df4e930d1379d24b78034349e74ee | 3f3371911512591e61d80d8e1bf07ac6a93df4e930d1379d24b78034349e74ee | MATCH |
| S209 | 0b69229a69b01a372117d3d86833ec40e8f5118efe1049fdc4993ae1c677fbb0 | 0b69229a69b01a372117d3d86833ec40e8f5118efe1049fdc4993ae1c677fbb0 | MATCH |
| S210 | 6608969be1213cafd12edc27269519be54b3fadb0443ff0f1b5fc76f75752de4 | 6608969be1213cafd12edc27269519be54b3fadb0443ff0f1b5fc76f75752de4 | MATCH |
| S211 | ae9bb7be00604a66a8f70f439ef028eced174bce4a5cb0f6fc11bbeaa625afcc | ae9bb7be00604a66a8f70f439ef028eced174bce4a5cb0f6fc11bbeaa625afcc | MATCH |
| S212 | 0b69229a69b01a372117d3d86833ec40e8f5118efe1049fdc4993ae1c677fbb0 | 0b69229a69b01a372117d3d86833ec40e8f5118efe1049fdc4993ae1c677fbb0 | MATCH |
| S213 | ff518cf333b141ab8de8d23baddeecf698e6b6f7a6143d8d0fc8a2aa2a6fa919 | ff518cf333b141ab8de8d23baddeecf698e6b6f7a6143d8d0fc8a2aa2a6fa919 | MATCH |

Verbatim primary fetch output (SHA256 values above; effective URLs recorded in JSON):
```text
S207 rc= 0 http= 200 bytes= 3839
S208 rc= 0 http= 200 bytes= 8794
S209 rc= 0 http= 200 bytes= 15183
S210 rc= 0 http= 200 bytes= 26389
S211 rc= 0 http= 200 bytes= 16321
S212 rc= 0 http= 200 bytes= 15183
S213 rc= 0 http= 200 bytes= 43988
```
Additional `curl -fsSL --compressed --max-time 120` fetches of S207/S208/S211 all exited 0 and produced the same hashes and lengths. `sha256sum` over all seven capture files named by the pins also produced the capture hashes in the table, with matching lengths (command exit 0).

Requested command, verbatim output (stdout followed by stderr), and exit:
```text
$ bash /home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin kumitate
kumitate	W04	S034 duplicate url stryker-mutator.io/docs/mutation-testing-elements/mutant-states-and-metrics across scopes
kumitate	W04	S068 duplicate url github.com/can1357/oh-my-pi/tree/45c35e40c46166dc726ccc52f5d27f40f2449f99 across scopes
kumitate	W04	S084 duplicate url infection.github.io/guide across scopes
kumitate	W04	S095 duplicate url raw.githubusercontent.com/containers/bubblewrap/v0.13.1/bwrap.xml across scopes
kumitate	W04	S123 duplicate url docs.langchain.com/oss/python/langgraph/checkpointers across scopes
kumitate	W04	S126 duplicate url docs.temporal.io/encyclopedia/detecting-activity-failures across scopes
kumitate	ok	/home/vgpnk/Projects/shokunin/kumitate-shokunin/corpus/SOURCES.md

EXIT=0
```

## Findings

1. **K69ScoutDrift-1 — informational, C2/M11 live-origin freshness:** observed 7/7 live digest matches, no drift finding and no recapture required by this probe. Confidence: high for these responses only. Reproduce with `curl -fsSL '<URL from corpus/SOURCES.md:159-165>' | sha256sum` and compare with the corresponding pin at `.ufo/pins/source-captures.json:271-317`.
2. **K69ScoutDrift-2 — informational, census:** observed `ok`, exit 0, with the six carried W04 duplicate-URL warnings listed above. Reproduce with the exact census command above. No newly blocking census error observed.

## Artifacts

- `.ufo/waves/round-69/w1/K69ScoutDrift.md`
- `.ufo/waves/round-69/build/K69ScoutDrift/fetch-results.json` — seven exact URLs, HTTP/curl statuses, lengths and hashes.
- `.ufo/waves/round-69/build/K69ScoutDrift/S207.live` through `S213.live` — downloaded response bodies.
- `.ufo/waves/round-69/build/K69ScoutDrift/census.txt` — requested command output and exit.

## Limits

Only S207–S213 were probed; S214–S216 mirrors and the full M69 counter were not run. This is a worktree-source/pin comparison, not a git-archive verdict or a claim that all M69 arms hold. Live agreement is time-specific and authenticates fetched HTTPS bytes, not source meaning or future stability. No code contract investigation, LSP tracing, MCP sessions, package installations or upgrades were performed. Scratch was removed after evidence preservation.
