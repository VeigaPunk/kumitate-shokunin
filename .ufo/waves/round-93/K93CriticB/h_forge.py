#!/usr/bin/env python3
"""K93CriticB / H-gate padding demo.

Builds 60 FABRICATED transcripts under a scratch sessions root (never ~/.omp), each carrying a
forged first `session` timestamp >= --after and a backdated mtime, then runs the frozen counter
with the reference reading as the tool and the FROZEN --min-h 60 / --h-max 120 defaults.
"""
import json, os, shutil, subprocess, sys

LANE = "/home/vgpnk/Projects/shokunin/kumitate-shokunin"
PROBE = os.path.join(LANE, ".ufo/waves/round-93/probe")
AFTER = "2026-11-06T21:40:00.000Z"
S = "/fast/scratch/hyaku/kumitate-r93/K93CriticB"
SROOT = os.path.join(S, "forgeroot")
OUT = os.path.join(LANE, ".ufo/waves/round-93/K93CriticB/h_forge.receipt.txt")
REC = os.path.join(S, "h_forge_counter.receipt.txt")
N = 60


def main():
    if os.path.isdir(SROOT):
        shutil.rmtree(SROOT)
    d = os.path.join(SROOT, "-Projects-shokunin", "2026-11-06T21-45-00-000Z_forged0000")
    os.makedirs(d)
    old = 1_600_000_000
    for i in range(N):
        p = os.path.join(d, "Forged%03d.jsonl" % i)
        rows = [
            {"type": "session", "timestamp": "2026-11-06T21:45:%02d.000Z" % (i % 60), "cwd": "/nonexistent"},
            {"type": "model_change", "role": "subagent:Forged%03d" % i, "model": "fake/primary"},
            {"type": "message", "message": {"role": "assistant", "stopReason": "stop",
                                            "provider": "fake", "model": "fake/served"}},
        ]
        with open(p, "w") as fh:
            for r in rows:
                fh.write(json.dumps(r) + "\n")
        os.utime(p, (old, old))
    tool = os.path.join(S, "oracle-as-tool.py")
    shutil.copyfile(os.path.join(PROBE, "oracle93.py"), tool)
    cmd = ["python3", os.path.join(PROBE, "probe93-c1.py"), "--tool", tool,
           "--sample-a", os.path.join(LANE, ".ufo/waves/round-92/probe/sampleA.tsv"),
           "--fixtures", os.path.join(PROBE, "fixtures"), "--after", AFTER,
           "--sessions-root", SROOT,
           "--waves", os.path.join(LANE, ".ufo/waves/round-91/w1-results.json") + "," +
                    os.path.join(LANE, ".ufo/waves/round-92/w1-results.json"),
           "--runtime", "off", "--out", REC]
    p = subprocess.run(cmd, capture_output=True, text=True, timeout=1800)
    lines = ["cmd=" + " ".join(cmd), "rc=%d" % p.returncode]
    lines += [l.rstrip() for l in open(REC) if l.startswith("C93_C1:")]
    lines.append("forged_members=%d all_first_ts_forged_ge_after=true all_mtime=%d" % (N, old))
    with open(OUT, "w") as fh:
        fh.write("\n".join(lines) + "\n")
    print("\n".join(lines))
    return 0


if __name__ == "__main__":
    sys.exit(main())
