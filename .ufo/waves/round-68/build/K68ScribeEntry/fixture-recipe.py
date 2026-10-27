#!/usr/bin/env python3
"""Build a scratch fixture of the lane with seat K68ScribeEntry's C2 draft integrated,
so the frozen counter deprec68-probe.mjs can be run against a real revision.
Writes ONLY inside the given clone."""
import json, shutil, subprocess, sys, hashlib, pathlib

LANE = pathlib.Path("/home/vgpnk/Projects/shokunin/kumitate-shokunin")
CLONE = pathlib.Path(sys.argv[1])
BUILD = LANE / ".ufo/waves/round-68/build/K68ScribeEntry"
CAPS = BUILD / "captures"

ROWS = [
 ("S207", "MCP Deprecated Features, revision 2026-07-28 — https://modelcontextprotocol.io/specification/2026-07-28/deprecated.md", "spec", "A",
  "the Deprecated/Removed registry of MCP revision 2026-07-28",
  "§ Deprecated table and § Removed; revision 2026-07-28, fetched 2026-10-27, 3839 bytes, sha256 c12c3cb7d6b8a30cd4df8ea8162a819df071a42745da6d20165e8fdf94b28baa",
  "MCP's deprecation registry: six features with a Deprecation SEP, the revision each was Deprecated in, a migration path and an earliest removal; removal is a Core Maintainer decision, not a date; no feature removed yet; the page calls itself a derived view",
  "mined", "2026-10-27", "90d", "corpus/knowledge/mcp-deprecation-registry.md"),
 ("S208", "MCP community feature-lifecycle and deprecation policy — https://modelcontextprotocol.io/community/feature-lifecycle.md", "docs", "A",
  "the MCP feature lifecycle: minimum deprecation window, its anchor, and expedited removal",
  "§ Deprecating a Feature (minimum window), § Removing a Feature, § Expedited Removal; fetched 2026-10-27, 8794 bytes, sha256 3f3371911512591e61d80d8e1bf07ac6a93df4e930d1379d24b78034349e74ee",
  "A deprecation SEP states a minimum window of at least twelve months, counted from the release of the revision that first marks the feature Deprecated and not from the SEP reaching Final; expedited removal still leaves at least ninety days",
  "mined", "2026-10-27", "90d", "corpus/knowledge/mcp-deprecation-registry.md"),
 ("S209", "oh-my-pi v18.12.6, packages/coding-agent/src/mcp/transports/sse.ts — https://raw.githubusercontent.com/can1357/oh-my-pi/v18.12.6/packages/coding-agent/src/mcp/transports/sse.ts", "code", "A",
  "the legacy HTTP+SSE transport shipped by oh-my-pi at tag v18.12.6",
  "sse.ts:46-47 (LegacySseTransport), :39 (endpoint-timeout error), :439 (createSseTransport); tag v18.12.6; fetched 2026-10-27, 15183 bytes, sha256 0b69229a69b01a372117d3d86833ec40e8f5118efe1049fdc4993ae1c677fbb0",
  "The release the lane measured in round 65 ships the deprecated 2024-11-05 HTTP+SSE transport in its coding-agent MCP client; byte-identical to S212, so the file did not change between the two tags",
  "mined", "2026-10-27", "90d", "corpus/knowledge/mcp-deprecation-registry.md"),
 ("S210", "SEP-2596: Specification Feature Lifecycle and Deprecation Policy, read at the commit that marked it Final — https://raw.githubusercontent.com/modelcontextprotocol/modelcontextprotocol/183238ddacd0118a22399cd4743a5b5eaa43dbdd/seps/2596-spec-feature-lifecycle-and-deprecation.md", "spec", "A",
  "SEP-2596's transition provisions for the two features deprecated before the policy existed",
  "header (:3-6), § Transition provisions (the three-month grace and the two-row HTTP+SSE / includeContext table); pinned at 183238ddac, fetched 2026-10-27, 26389 bytes, sha256 6608969be1213cafd12edc27269519be54b3fadb0443ff0f1b5fc76f75752de4",
  "Both pre-policy deprecations get a three-month grace period counted from the date the SEP reaches Final; the window is a floor for eligibility and removal still follows a maintainer decision",
  "mined", "2026-10-27", "90d", "corpus/knowledge/mcp-deprecation-registry.md"),
 ("S211", "MCP Transports, revision 2025-11-25 — https://modelcontextprotocol.io/specification/2025-11-25/basic/transports.md", "spec", "A",
  "how the 2025-11-25 revision carried the already-deprecated HTTP+SSE transport",
  "§ Streamable HTTP note (replaces the 2024-11-05 HTTP+SSE transport) and § Backwards Compatibility (the deprecated wording and the instruction to keep hosting both old endpoints); fetched 2026-10-27, 16321 bytes, sha256 ae9bb7be00604a66a8f70f439ef028eced174bce4a5cb0f6fc11bbeaa625afcc",
  "At 2025-11-25 the specification already called the HTTP+SSE transport deprecated and told servers to keep hosting both old endpoints for backwards compatibility, with no removal date stated",
  "mined", "2026-10-27", "90d", "corpus/knowledge/mcp-deprecation-registry.md"),
 ("S212", "oh-my-pi v18.13.1, packages/coding-agent/src/mcp/transports/sse.ts — https://raw.githubusercontent.com/can1357/oh-my-pi/v18.13.1/packages/coding-agent/src/mcp/transports/sse.ts", "code", "A",
  "the legacy HTTP+SSE transport shipped by the oh-my-pi release installed on this host (18.13.1)",
  "sse.ts:46-47 (LegacySseTransport), :39 (endpoint-timeout error), :439 (createSseTransport); tag v18.13.1; fetched 2026-10-27, 15183 bytes, sha256 0b69229a69b01a372117d3d86833ec40e8f5118efe1049fdc4993ae1c677fbb0",
  "The release installed on this host still ships the deprecated HTTP+SSE transport while the registry's grace for it has elapsed; the bytes equal S209's, so the tag bump did not drop or change it",
  "mined", "2026-10-27", "90d", "corpus/knowledge/mcp-deprecation-registry.md"),
 ("S213", "modelcontextprotocol commit 183238ddac, Mark SEPs as final (the record that SEP-2596 reached Final) — https://github.com/modelcontextprotocol/modelcontextprotocol/commit/183238ddacd0118a22399cd4743a5b5eaa43dbdd.patch", "code", "A",
  "the commit record that dates SEP-2596 reaching Final",
  "patch header (author date, subject) and the seps/2596 hunk removing Status Draft and adding Status Final; commit 183238ddacd0118a22399cd4743a5b5eaa43dbdd, Wed 3 Jun 2026; fetched 2026-10-27, 43988 bytes, sha256 ff518cf333b141ab8de8d23baddeecf698e6b6f7a6143d8d0fc8a2aa2a6fa919",
  "SEP-2596 reached Final on 2026-06-03, the date the HTTP+SSE grace runs from; the PR merge commit 219f8242 still read Draft, so the merge timestamp is not the Final date",
  "mined", "2026-10-27", "90d", "corpus/knowledge/mcp-deprecation-registry.md"),
]

def main():
    # 1. entry
    shutil.copy2(BUILD / "mcp-deprecation-registry.md", CLONE / "corpus/knowledge/mcp-deprecation-registry.md")
    # 2. captures, at the same repo-relative paths the pins will name
    dest = CLONE / ".ufo/waves/round-68/build/K68ScribeEntry/captures"
    dest.mkdir(parents=True, exist_ok=True)
    for f in CAPS.iterdir():
        if f.is_file():
            shutil.copy2(f, dest / f.name)
    # 3. registry rows: after the last S-row of the ## Registry table
    src = CLONE / "corpus/SOURCES.md"
    lines = src.read_text().split("\n")
    last = max(i for i, l in enumerate(lines) if l.startswith("| S"))
    rows = ["| " + " | ".join(r) + " |" for r in ROWS]
    lines[last + 1:last + 1] = rows
    src.write_text("\n".join(lines))
    # 4. pins
    pins_path = CLONE / ".ufo/pins/source-captures.json"
    pins = json.loads(pins_path.read_text())
    caps = {c["sourceId"]: c for c in pins["captures"]}
    names = {"S207": "S207-deprecated-2026-07-28.md", "S208": "S208-feature-lifecycle.md",
             "S209": "S209-omp-v18.12.6-sse.ts", "S210": "S210-sep2596.md",
             "S211": "S211-transports-2025-11-25.md", "S212": "S212-omp-v18.13.1-sse.ts",
             "S213": "S213-commit-183238ddac.patch"}
    for sid, name in names.items():
        buf = (dest / name).read_bytes()
        caps[sid] = {"sourceId": sid,
                     "path": f".ufo/waves/round-68/build/K68ScribeEntry/captures/{name}",
                     "sha256": hashlib.sha256(buf).hexdigest(), "bytes": len(buf),
                     "captured": "2026-10-27"}
    pins["captures"] = list(caps.values())
    pins_path.write_text(json.dumps(pins, indent=1) + "\n")
    # 5. PROVINCE band line
    prov = CLONE / "PROVINCE.md"
    pl = prov.read_text().split("\n")
    idx = next(i for i, l in enumerate(pl) if l.startswith("- MCP protocol revisions as they bear on orchestration"))
    pl.insert(idx + 1, "  - second entry, round 68: `corpus/knowledge/mcp-deprecation-registry.md` (S207–S213) — the Deprecated table at `2026-07-28`, the policy's revision-anchored floor, the SEP-2596 grace that elapsed on 2026-09-03, and the legacy HTTP+SSE transport still present in the source of the installed release `omp/18.13.1`.")
    prov.write_text("\n".join(pl))
    # 6. commit inside the clone only
    assert subprocess.run(["git", "-C", str(CLONE), "rev-parse", "--show-toplevel"],
                          capture_output=True, text=True).stdout.strip() == str(CLONE)
    subprocess.run(["git", "-C", str(CLONE), "add", "-A"], check=True)
    r = subprocess.run(["git", "-C", str(CLONE), "-c", "user.name=K68ScribeEntry",
                        "-c", "user.email=seat@kumitate.invalid", "commit", "-q", "-m",
                        "fixture: K68ScribeEntry C2 draft + S207-S213 rows + pins + PROVINCE line"],
                       capture_output=True, text=True)
    print(r.returncode, r.stdout.strip(), r.stderr.strip())
    print(subprocess.run(["git", "-C", str(CLONE), "rev-parse", "HEAD"],
                         capture_output=True, text=True).stdout.strip())

main()
