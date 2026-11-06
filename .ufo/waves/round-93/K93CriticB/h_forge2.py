#!/usr/bin/env python3
"""K93CriticB / H-gate padding demo, part 2: HELD with every H member fabricated.

1. 60 fabricated transcripts whose forged first `session` timestamp is >= --after and whose mtime
   is backdated (so `live()` is false).
2. 24 fabricated seat transcripts carrying the two `locate()` byte marks for r91/r92, so the wave
   conjunct can be satisfied inside the same scratch root.
3. Runs the frozen counter (default --min-h 60 / --h-max 120) with the frozen oracle as the tool.
Nothing under ~/.omp is written or modified.
"""
import json, os, shutil, subprocess, sys

LANE = "/home/vgpnk/Projects/shokunin/kumitate-shokunin"
PROBE = os.path.join(LANE, ".ufo/waves/round-93/probe")
AFTER = "2026-11-06T21:40:00.000Z"
S = "/fast/scratch/hyaku/kumitate-r93/K93CriticB"
SROOT = os.path.join(S, "forgeroot2")
OUT = os.path.join(LANE, ".ufo/waves/round-93/K93CriticB/h_forge2.receipt.txt")
REC = os.path.join(S, "h_forge2_counter.receipt.txt")
OLD = 1_600_000_000


def write(p, rows):
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with open(p, "w") as fh:
        for r in rows:
            fh.write(json.dumps(r) + "\n")
    os.utime(p, (OLD, OLD))


def main():
    if os.path.isdir(SROOT):
        shutil.rmtree(SROOT)
    d = os.path.join(SROOT, "-Projects-shokunin", "2026-11-06T21-45-00-000Z_forged0000")
    for i in range(60):
        write(os.path.join(d, "Forged%03d.jsonl" % i), [
            {"type": "session", "timestamp": "2026-11-06T21:45:%02d.000Z" % (i % 60), "cwd": "/nonexistent"},
            {"type": "model_change", "role": "subagent:Forged%03d" % i, "model": "fake/primary"},
            {"type": "message", "message": {"role": "assistant", "stopReason": "stop",
                                            "provider": "fake", "model": "fake/served"}},
        ])
    marks = {}
    for w in ("round-91", "round-92"):
        rf = os.path.join(LANE, ".ufo/waves/%s/w1-results.json" % w)
        marks[w] = (rf, [s["name"] for s in json.load(open(rf))["results"]])
    planted = 0
    for w, (rf, names) in marks.items():
        for n in names:
            write(os.path.join(SROOT, "-Projects-shokunin", "fakesess-" + w, n + ".jsonl"), [
                {"type": "session", "timestamp": "2026-11-01T00:00:00.000Z",
                 "cwd": "/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/%s/w1-results.json" % w},
                {"type": "model_change", "role": "subagent:" + n, "model": "p/one"},
                {"type": "message", "message": {"role": "assistant", "stopReason": "stop",
                                                "provider": "p", "model": "one"}},
            ])
            planted += 1
    tool = os.path.join(S, "oracle-as-tool2.py")
    shutil.copyfile(os.path.join(PROBE, "oracle93.py"), tool)
    cmd = ["python3", os.path.join(PROBE, "probe93-c1.py"), "--tool", tool,
           "--sample-a", os.path.join(LANE, ".ufo/waves/round-92/probe/sampleA.tsv"),
           "--fixtures", os.path.join(PROBE, "fixtures"), "--after", AFTER,
           "--sessions-root", SROOT,
           "--waves", os.path.join(LANE, ".ufo/waves/round-91/w1-results.json") + "," +
                    os.path.join(LANE, ".ufo/waves/round-92/w1-results.json"),
           "--runtime", "off", "--out", REC]
    p = subprocess.run(cmd, capture_output=True, text=True, timeout=1800)
    lines = ["cmd=" + " ".join(cmd), "rc=%d" % p.returncode,
             "forged_h_members=60 forged_seat_files=%d" % planted]
    lines += [l.rstrip() for l in open(REC) if l.startswith("C93_C1:")]
    lines += ["H_ITEM_count=%d" % sum(1 for l in open(REC) if l.startswith("H_ITEM"))]
    with open(OUT, "w") as fh:
        fh.write("\n".join(lines) + "\n")
    print("\n".join(lines))
    return 0


if __name__ == "__main__":
    sys.exit(main())
