#!/usr/bin/env python3
"""K79ScoutOpen independent measurement of the filed r78 report's backticked pointers.
Token model: inline `code spans` + ``` fenced blocks; a token counts when its last
segment ends in an allow-listed extension after stripping a trailing :N / :N-M
selector; tokens containing '://' (or a scheme prefix) are skipped; first occurrence
wins (document order). Resolution order per token: (1) lane root, (2) the report's own
directory, (3) <lane>/.ufo/waves/round-78.
Writes refs.txt (all 47), refs-toolscope.txt (glob + bare `<cmd>.sh` excluded, 44),
dead-list.txt (both scopes, with this command named)."""
import re, os
REPORT = "/home/vgpnk/Projects/shokunin/.ufo/reports/round-78/kumitate.md"
LANE   = "/home/vgpnk/Projects/shokunin/kumitate-shokunin"
ROUND  = os.path.join(LANE, ".ufo/waves/round-78")
RPT    = os.path.dirname(REPORT)
EXT = {"txt","json","jsonl","md","mjs","js","sh","py","html","tsv","csv","log"}
text = open(REPORT, encoding="utf-8").read()
spans = [(m.start(1), m.group(1)) for m in re.finditer(r"```[^\n]*\n(.*?)```", text, re.S)]
masked = list(text)
for m in re.finditer(r"```[^\n]*\n(.*?)```", text, re.S):
    for i in range(m.start(), m.end()): masked[i] = "\x00"
masked = "".join(masked)
spans += [(m.start(1), m.group(1)) for m in re.finditer(r"`([^`\n]+)`", masked)]
spans.sort()
SPLIT = re.compile(r"[\s()\[\]{}<>,'\";|]+")
def clean(t): return t.strip().rstrip(".,:;)]}").lstrip("([{\"'")
seen, sset = [], set()
for _pos, body in spans:
    for raw in SPLIT.split(body):
        raw = clean(raw)
        if not raw or "://" in raw: continue
        cand = re.sub(r":\d+(-\d+)?$", "", raw).rstrip("/")
        b = cand.split("/")[-1]
        if "." not in b or b.rsplit(".", 1)[1].lower() not in EXT: continue
        if cand in sset: continue
        sset.add(cand); seen.append(cand)
def resolve(ref):
    for name, root in (("lane", LANE), ("report", RPT), ("round78", ROUND)):
        if os.path.exists(os.path.normpath(os.path.join(root, ref))): return name
    return None
open("refs.txt","w").write("\n".join(
    f"{'resolved' if resolve(r) else 'dead'} {r} {resolve(r) or '-'}" for r in seen) + "\n")
scoped = [r for r in seen if not any(c in r for c in "*?[]") and not (r.endswith(".sh") and "/" not in r)]
open("refs-toolscope.txt","w").write("\n".join(
    f"{'resolved' if resolve(r) else 'dead'} {r} {resolve(r) or '-'}" for r in scoped) + "\n")
d_all = [r for r in seen if not resolve(r)]
d_sc  = [r for r in scoped if not resolve(r)]
with open("dead-list.txt","w") as f:
    f.write("# K79ScoutOpen independent measurement of the filed r78 report's backticked pointers\n")
    f.write("# report: " + REPORT + "\n# lane:   " + LANE + "\n")
    f.write("# bases:  1) lane root  2) report dir (" + RPT + ")  3) " + ROUND + "\n")
    f.write("# exact command that produced this file (cwd /fast/scratch/hyaku/kumitate-r79/K79ScoutOpen):\n")
    f.write("#   python3 refs-measure-v2.py\n")
    f.write(f"# RAW SCOPE: refs={len(seen)} dead={len(d_all)}\n")
    for r in d_all: f.write(f"dead {r} -\n")
    f.write(f"# POINTER SCOPE (glob tokens and bare `<cmd>.sh` command names excluded): refs={len(scoped)} dead={len(d_sc)}\n")
    for r in d_sc: f.write(f"dead {r} -\n")
print(f"refs={len(seen)} dead={len(d_all)} first={d_all[0]}")
print(f"scoped refs={len(scoped)} dead={len(d_sc)} first={d_sc[0]}")
