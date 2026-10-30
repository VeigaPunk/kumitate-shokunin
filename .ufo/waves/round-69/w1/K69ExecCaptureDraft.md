VERDICT: Captured all three commit-pinned MCP mirror files with SHA-256/byte counts; proposed pins validated against scratch copies and the source-capture gate.

## Evidence
- `curl -fLsS <pinned raw URL> -o <build file>` for each S214/S215/S216 succeeded.
- `wc -c` / `sha256sum`:
  - `deprecated.mdx`: `5031`; `6ec5fc903d1be37e5ab0afda2acd7765aaf2909b90a2dca405e1aaea8936225b`
  - `feature-lifecycle.mdx`: `9534`; `b4f7436905c6162801f19565518342238bd76c1e7d23ade6f1fae24c22c3ec7c`
  - `transports.mdx`: `15986`; `a247fdbb3cc25c805ef43124db18d9b60a56669b3e65bd163dffb76f4129dfc0`
- Scratch validation: `node <scratch>/scripts/source-capture.mjs --registry <scratch>/.ufo/pins/source-captures.json --sources <scratch>/corpus/SOURCES.md` → `SOURCE_CAPTURE: CLEAN captures=48 exemptions=107` (exit 0).
- Scratch was created by extracting `git archive HEAD`; rows/pins and all captured paths were added only in scratch. Scratch directory removed after validation.

## Findings
1. K69ExecCaptureDraft-1 — informational; capture-entry proposal covers S214/S215/S216 with paths matching the requested L1Capture mirror layout. Reproduce by inspecting the JSON artifact and running the scratch command above with equivalent appended source rows and entries.

## Artifacts
- `.ufo/waves/round-69/build/K69ExecCaptureDraft/deprecated.mdx`
- `.ufo/waves/round-69/build/K69ExecCaptureDraft/feature-lifecycle.mdx`
- `.ufo/waves/round-69/build/K69ExecCaptureDraft/transports.mdx`
- `.ufo/waves/round-69/build/K69ExecCaptureDraft/capture-entries.json`

## Limits
- Did not alter integration-owned `corpus/SOURCES.md` or `.ufo/pins/source-captures.json`; the entries are a JSON snippet for integration.
- Did not run live deprecation counter or other checks.
