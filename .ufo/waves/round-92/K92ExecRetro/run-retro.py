#!/usr/bin/env python3
"""K92ExecRetro driver: run the FROZEN oracle92.py over rounds 80..91 w1 (+w2 if present).

Writes retro-r<N>.json (oracle output, verbatim), timings.tsv, sizes.tsv.
Read-only on the lane: only reads w*-results.json and the host session tree.
"""
import json, os, subprocess, sys, time

LANE = "/home/vgpnk/Projects/shokunin/kumitate-shokunin"
ORACLE = LANE + "/.ufo/waves/round-92/probe/oracle92.py"
SEAT = LANE + "/.ufo/waves/round-92/K92ExecRetro"
WAVES = LANE + "/.ufo/waves"

timings, sizes, meta = [], [], []
for n in range(80, 92):
    for w in ("w1", "w2"):
        rj = "%s/round-%d/%s-results.json" % (WAVES, n, w)
        if not os.path.exists(rj):
            meta.append((n, w, "absent"))
            continue
        t0 = time.time()
        p = subprocess.run([sys.executable, ORACLE, "--results", rj],
                           capture_output=True, text=True)
        dt = time.time() - t0
        if p.returncode != 0:
            timings.append((n, w, "%.3f" % dt, p.returncode, p.stderr.strip()[:200]))
            meta.append((n, w, "oracle-exit-%d" % p.returncode))
            continue
        recs = json.loads(p.stdout)
        out = "%s/retro-r%d.json" % (SEAT, n)
        with open(out, "w") as fh:
            json.dump(recs, fh, indent=1, sort_keys=True)
            fh.write("\n")
        timings.append((n, w, "%.3f" % dt, 0, "%d seats" % len(recs)))
        for r in recs:
            s = r.get("session")
            sizes.append((n, w, r["seat"], (os.path.getsize(s) if s else -1), r.get("final")))
        meta.append((n, w, "ok %d" % len(recs)))

with open(SEAT + "/timings.tsv", "w") as fh:
    fh.write("round\twave\tseconds\texit\tnote\n")
    for t in timings:
        fh.write("\t".join(str(x) for x in t) + "\n")
with open(SEAT + "/sizes.tsv", "w") as fh:
    fh.write("round\twave\tseat\tbytes\tfinal\n")
    for s in sizes:
        fh.write("\t".join(str(x) for x in s) + "\n")
with open(SEAT + "/run-meta.txt", "w") as fh:
    for m in meta:
        fh.write("\t".join(str(x) for x in m) + "\n")
print("\n".join("\t".join(str(x) for x in t) for t in timings))
