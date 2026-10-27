#!/usr/bin/env python3
"""K68MutEntry mutant battery driver — fixture-local, restores pristine bytes after every run."""
import hashlib, json, os, re, subprocess, sys, shutil

S = "/fast/scratch/hyaku/kumitate-r68/K68MutEntry"
FX = f"{S}/lane"
PROBE = "/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-68/probe/deprec68-probe.mjs"
ENTRY = f"{FX}/corpus/knowledge/mcp-deprecation-registry.md"
B = "/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-68/build/K68ScribeEntry"
RESULTS = f"{S}/mutant-results.jsonl"

pristine = open(ENTRY, "rb").read()
PRISTINE_SHA = hashlib.sha256(pristine).hexdigest()

def section(text, name):
    L = text.split("\n")
    at = [i for i, l in enumerate(L) if re.match(rf"^## {name}\s*$", l.strip())]
    if not at:
        return None, None, None
    a = at[0]
    b = next((i for i in range(a + 1, len(L)) if L[i].startswith("## ")), len(L))
    return a, b, L

def sec_text(t, name):
    a, b, L = section(t, name)
    return "\n".join(L[a + 1:b]) if a is not None else None

# --- transforms (str -> str) -------------------------------------------------
def t_pristine(t): return t

def t_drop_s208_bullet(t):
    return t.replace('- S208 — "the number of months, at least twelve, that the feature must remain Deprecated before it is eligible for removal"\n', "", 1)

def t_drop_s207_one_bullet(t):
    return t.replace('- S207 — "the actual removal is a Core Maintainer decision taken during release preparation and may happen later"\n', "", 1)

def t_reword_cell(t):
    return t.replace("| Logging | SEP-2577 | `2026-07-28` | Log to `stderr` for stdio transports; use OpenTelemetry for observability | First revision released on or after 2027-07-28 |",
                     "| Logging | SEP-2577 | `2026-07-28` | Log to `stderr` for stdio transports; use OpenTelemetry for observability | First revision released on or after 2027-07-29 |", 1)

def t_drop_backticks(t):
    return t.replace("| Logging | SEP-2577 | `2026-07-28` |", "| Logging | SEP-2577 | 2026-07-28 |", 1)

def t_insert_0417(t):
    a, b, L = section(t, "The live clock")
    L.insert(b - 1, "A disproven reading dates the SEP's creation to 2026-04-17.")
    return "\n".join(L)

def t_insert_0518(t):
    a, b, L = section(t, "The live clock")
    L.insert(b - 1, "A disproven reading dates the PR merge to 2026-05-18.")
    return "\n".join(L)

def t_drop_18131(t):
    a, b, L = section(t, "Bearing on the installed OMP release")
    for i in range(a + 1, b):
        L[i] = L[i].replace("18.13.1", "18.13.0")
    return "\n".join(L)

def t_two_ids(t):
    L = t.split("\n")
    keep = re.compile(r"^\s*source\s*:\s*S20[78]\b")
    out, dropped = [], 0
    for l in L:
        if re.match(r"^\s*source\s*:", l) and not keep.match(l):
            dropped += 1
            continue
        out.append(l)
    assert dropped == 5, dropped
    return "\n".join(out)

def t_wrong_row_id(t):
    return t.replace('- S208 — "the number of months', '- S211 — "the number of months', 1)

def t_rename(t):  # handled specially: entry file renamed, no path left
    return None

def t_semantic_swap(t):
    # swap S211's quote for a DIFFERENT true sentence from the same capture
    old = '- S211 — "Clients and servers can maintain backwards compatibility with the deprecated [HTTP+SSE transport](https://modelcontextprotocol.io/specification/2024-11-05/basic/transports.md#http-with-sse) (from protocol version 2024-11-05) as follows:"'
    assert old in t, "S211 bullet not found"
    sent = "Without these protections, attackers could use DNS rebinding to interact with local MCP servers from remote websites."
    cap = open(f"{B}/captures/S211-transports-2025-11-25.md", encoding="utf-8").read()
    n = lambda s: re.sub(r"\s+", " ", re.sub(r"\*\*|__|`", "", re.sub(r"<[^>]+>", " ", s))).strip()
    assert re.search(rf"(^|[^A-Za-z0-9]){re.escape(sent)}([^A-Za-z0-9]|$)", n(cap)), "sent not in capture"
    assert len(sent.split()) <= 25, sent
    return t.replace(old, f'- S211 — "{sent}"', 1)

def t_reorder_snapshot(t):
    a, b, L = section(t, "Registry snapshot")
    rows = [i for i in range(a + 1, b) if L[i].startswith("|") and not re.match(r"^\|\s*Feature\s*\|", L[i])]
    assert len(rows) == 6, rows
    data = [L[i] for i in rows]
    data = data[::-1]
    for i, v in zip(rows, data):
        L[i] = v
    return "\n".join(L)

def t_swap_2027_quote(t):
    return t.replace('- S207 — "First revision released on or after 2027-07-28"\n', "", 1)

def t_swap_grace_quote(t):
    return t.replace('- S207 — "Three months after SEP-2596 reaches Final"\n', "", 1)

MUTANTS = [
    ("P0-pristine", t_pristine, "baseline: expect held=9/10 (M5 MISS no-live only)"),
    ("X1-drop-last-bullet-of-S208", t_drop_s208_bullet, "M4 via per-row (S208 loses only bullet)"),
    ("X2-drop-one-of-S207-bullets", t_drop_s207_one_bullet, "M4 count clause: 10->9 still >=6, row still covered -> expect SURVIVE"),
    ("X3-reword-snapshot-cell", t_reword_cell, "M6 earliest-removal equality"),
    ("X4-drop-backticks-in-cell", t_drop_backticks, "M6 delink does not strip backticks -> equality strict -> expect CAUGHT"),
    ("X5-insert-2026-04-17-clock", t_insert_0417, "M7 forbidden date"),
    ("X6-insert-2026-05-18-clock", t_insert_0518, "M7 forbidden date"),
    ("X7-drop-18.13.1-bearing", t_drop_18131, "M8 version mention"),
    ("X8-two-source-ids", t_two_ids, "M1 sources<3 (secondary: M4 no-capture for uncited bullets)"),
    ("X9-quote-wrong-row-id", t_wrong_row_id, "M4 quote-not-in-capture + no-bullet"),
    ("X10-rename-entry", t_rename, "M1 entry-absent"),
    ("X11-semantic-quote-swap", t_semantic_swap, "expected SURVIVE (syntactic binding only)"),
    ("X12-reorder-snapshot-rows", t_reorder_snapshot, "expected SURVIVE (M6 Feature-keyed order tolerance)"),
    ("X13-drop-2027-quote", t_swap_2027_quote, "M4 no-2027-07-28-quote (required-content clause)"),
    ("X14-drop-grace-quote", t_swap_grace_quote, "M4 no-three-months-quote (required-content clause)"),
]

def git(*a):
    return subprocess.run(["git", "-C", FX, *a], capture_output=True, text=True)

def run_counter():
    env = dict(os.environ)
    env["TMPDIR"] = S
    env.pop("NODE_OPTIONS", None)
    r = subprocess.run(["node", PROBE, FX, "HEAD", "--no-live"],
                       capture_output=True, text=True, env=env, timeout=600)
    return r.returncode, (r.stdout or "").strip(), (r.stderr or "").strip()[-200:]

out = open(RESULTS, "w")
for name, fn, expect in MUTANTS:
    if name == "X10-rename-entry":
        os.rename(ENTRY, ENTRY + ".bak")
        newpath = ENTRY + ".bak"
    else:
        mutated = fn(pristine.decode("utf-8"))
        open(ENTRY, "w").write(mutated)
    dirty = git("status", "--porcelain", "--", "corpus/knowledge/mcp-deprecation-registry.md").stdout.strip()
    if dirty:
        git("add", "corpus/knowledge/mcp-deprecation-registry.md")
        c = git("-c", "user.name=mut", "-c", "user.email=mut@invalid", "-c", "commit.gpgsign=false",
                "commit", "-q", "--no-verify", "-m", name)
        assert c.returncode == 0, c.stderr
    rev = git("rev-parse", "HEAD").stdout.strip()
    rc, so, se = run_counter()
    rec = {"name": name, "rev": rev, "exit": rc, "verdict": so.splitlines()[-1] if so else se,
           "expect": expect}
    out.write(json.dumps(rec) + "\n")
    out.flush()
    print(rec["verdict"][:160], flush=True)
    # restore pristine bytes + commit restoration
    if name == "X10-rename-entry":
        os.rename(newpath, ENTRY)
    else:
        open(ENTRY, "wb").write(pristine)
    cur = hashlib.sha256(open(ENTRY, "rb").read()).hexdigest()
    assert cur == PRISTINE_SHA, f"restoration mismatch after {name}"
    dirty = git("status", "--porcelain", "--", "corpus/knowledge/mcp-deprecation-registry.md").stdout.strip()
    if dirty:
        git("add", "corpus/knowledge/mcp-deprecation-registry.md")
        git("-c", "user.name=mut", "-c", "user.email=mut@invalid", "-c", "commit.gpgsign=false",
            "commit", "-q", "--no-verify", "-m", f"restore-after-{name}")
out.close()
final = hashlib.sha256(open(ENTRY, "rb").read()).hexdigest()
print("PRISTINE_SHA", PRISTINE_SHA)
print("FINAL_SHA", final)
print("BATTERY-DONE rows=", sum(1 for _ in open(RESULTS)))
