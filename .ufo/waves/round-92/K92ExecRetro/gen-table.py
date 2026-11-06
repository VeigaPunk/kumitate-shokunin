#!/usr/bin/env python3
"""Generate retro-table.md from the frozen oracle's per-round output (retro-r<N>.json)."""
import json, os

SEAT = "/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-92/K92ExecRetro"
FINAL = ("served", "dead", "aborted", "silent", "other", "absent")
out = []
w = out.append

w("# Retro table — kumitate rounds 80–91 w1, read with the frozen oracle")
w("")
w("Source: `probe/oracle92.py` (FROZEN; sha256 in `sha256.txt`) run as")
w("`python3 .ufo/waves/round-92/probe/oracle92.py --results .ufo/waves/round-<N>/w1-results.json`")
w("for N=80..91 from the lane root. Output per round: `retro-r<N>.json` (verbatim oracle JSON).")
w("No `w2-results.json` exists in any round 80..91 (`run-meta.txt`), so w1 is the whole record.")
w("")
w("Reading notes: `captured` is the route the seat was dispatched with (first `model_change` for")
w("`subagent:<seat>`, else the `default`/role-less one); `answered` is the distinct models whose turns")
w("actually stopped on `stop`/`toolUse`/`length`, in first-seen order. `dead` = last turn's stopReason")
w("is `error`; `answered` can still be non-empty for a dead seat (it answered, then died).")
w("")
w("## Timing and transcript size")
w("")
w("| round | oracle seconds | seats | located | sum of located transcript bytes | largest file |")
w("|---|---|---|---|---|---|")
tim = {}
for line in open(SEAT + "/timings.tsv").read().splitlines()[1:]:
    r, wave, sec, code, note = line.split("\t")
    tim[int(r)] = sec
sz = {}
mx = {}
for line in open(SEAT + "/sizes.tsv").read().splitlines()[1:]:
    r, wave, seat, b, fin = line.split("\t")
    r = int(r); b = int(b)
    if b < 0:
        continue
    sz[r] = sz.get(r, 0) + b
    if b > mx.get(r, (0, ""))[0]:
        mx[r] = (b, seat)
for n in range(80, 92):
    recs = json.load(open("%s/retro-r%d.json" % (SEAT, n)))
    loc = sum(1 for r in recs if r.get("session"))
    w("| %d | %s | %d | %d | %d | %s (%d B) |" % (
        n, tim[n], len(recs), loc, sz.get(n, 0), mx[n][1], mx[n][0]))
w("")
w("Total: 154 seats over 12 waves, 154 located, %d bytes of transcript scanned; largest single file"
  % sum(sz.values()))
bm, bs = max(((v[0], "%s/%s" % (k, v[1])) for k, v in mx.items()))
w("`%s` (%d B). Per-wave wall clock 0.25–0.42 s, one process per wave." % (bs, bm))
w("")
w("## Per-round summary")
w("")
w("| round | seats | located | served | dead | aborted | silent | other | absent | fallback | captured route never answered |")
w("|---|---|---|---|---|---|---|---|---|---|---|")
tot = {k: 0 for k in FINAL}
for n in range(80, 92):
    recs = json.load(open("%s/retro-r%d.json" % (SEAT, n)))
    c = {k: sum(1 for r in recs if r.get("final") == k) for k in FINAL}
    for k in FINAL:
        tot[k] += c[k]
    fb = sum(1 for r in recs if r.get("fallback"))
    never = sum(1 for r in recs if r.get("captured") and r.get("answered")
                and r["captured"] not in r["answered"])
    w("| %d | %d | %d | %d | %d | %d | %d | %d | %d | %d | %d |" % (
        n, len(recs), sum(1 for r in recs if r.get("session")), c["served"], c["dead"],
        c["aborted"], c["silent"], c["other"], c["absent"], fb, never))
w("| **80–91** | 154 | 154 | %d | %d | %d | %d | %d | %d | %d | %d |" % (
    tot["served"], tot["dead"], tot["aborted"], tot["silent"], tot["other"], tot["absent"],
    sum(1 for n in range(80, 92) for r in json.load(open("%s/retro-r%d.json" % (SEAT, n))) if r.get("fallback")),
    sum(1 for n in range(80, 92) for r in json.load(open("%s/retro-r%d.json" % (SEAT, n)))
        if r.get("captured") and r.get("answered") and r["captured"] not in r["answered"])))
w("")
w("## Per-round rows")
w("")
for n in range(80, 92):
    recs = json.load(open("%s/retro-r%d.json" % (SEAT, n)))
    w("### round %d — %d seats, %d served, %d dead" % (
        n, len(recs), sum(1 for r in recs if r["final"] == "served"),
        sum(1 for r in recs if r["final"] == "dead")))
    w("")
    w("| seat | role | final | captured | answered (first-seen order) | fallback | errors | aborted | yielded | last_error |")
    w("|---|---|---|---|---|---|---|---|---|---|")
    for r in recs:
        w("| `%s` | %s | **%s** | `%s` | %s | %s | %d | %d | %s | %s |" % (
            r["seat"], r.get("role"), r["final"], r.get("captured"),
            ", ".join("`%s`" % a for a in r.get("answered") or []) or "—",
            "**yes**" if r.get("fallback") else "no",
            r.get("errors", 0), r.get("aborted", 0),
            "yes" if r.get("yielded") else "no",
            ("`%s`" % r["last_error"].replace("|", "\\|")) if r.get("last_error") else "—"))
    w("")

open(SEAT + "/retro-table.md", "w").write("\n".join(out) + "\n")
print("wrote retro-table.md %d lines" % len(out))
