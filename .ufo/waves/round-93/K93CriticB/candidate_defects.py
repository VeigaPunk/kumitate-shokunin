#!/usr/bin/env python3
"""K93CriticB / candidate defect receipts (clause (c) class).

Three minimal synthetic transcripts, each scored with the counter's own diff(), plus one
end-to-end counter run whose --fixtures dir holds the null-errorMessage member.
"""
import importlib.util, json, os, shutil, subprocess, sys

LANE = "/home/vgpnk/Projects/shokunin/kumitate-shokunin"
PROBE = os.path.join(LANE, ".ufo/waves/round-93/probe")
CAND = os.path.join(LANE, ".ufo/waves/round-93/K93ExecTool/seat-route.mjs")
S = "/fast/scratch/hyaku/kumitate-r93/K93CriticB"
FX = os.path.join(S, "deffix")
OUT = os.path.join(LANE, ".ufo/waves/round-93/K93CriticB/candidate_defects.receipt.txt")

sys.path.insert(0, PROBE)
import oracle93  # noqa: E402
_spec = importlib.util.spec_from_file_location("probe93", os.path.join(PROBE, "probe93-c1.py"))
probe93 = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(probe93)


def case(name, errmsg_json):
    p = os.path.join(FX, name + ".jsonl")
    rows = ['{"type": "session", "timestamp": "2026-11-06T00:00:00.000Z"}',
            '{"type": "model_change", "role": "subagent:%s", "model": "p/one"}' % name,
            '{"type": "message", "message": {"role": "assistant", '
            '"stopReason": "error", "provider": "p", "model": "one", "errorMessage": %s}}' % errmsg_json]
    with open(p, "w") as fh:
        fh.write("\n".join(rows) + "\n")
    return p


def main():
    if os.path.isdir(FX):
        shutil.rmtree(FX)
    os.makedirs(FX)
    tool = os.path.join(S, "cand.mjs")
    shutil.copyfile(CAND, tool)
    lines = ["candidate=%s sha=%s" % (CAND, probe93.hashlib.sha256(open(tool, "rb").read()).hexdigest())]
    cases = [
        ("X99NullErr", "null", "errorMessage is JSON null (a non-string) => plan says \"\""),
        ("X99BomErr", '"\\ufeffbom first line"', "first line starts U+FEFF; python strip keeps it, node trim drops it"),
        ("X99NelErr", '"\\u0085nel lead"', "first line starts U+0085; python strip drops it, node trim keeps it"),
    ]
    for name, val, why in cases:
        p = case(name, val)
        orc = oracle93.read_one(p)
        pr = subprocess.run(["node", tool, "--file", p, "--json"], capture_output=True, text=True)
        rec = json.loads(pr.stdout)
        d = probe93.diff(orc, rec)
        lines.append("CASE %s  why=%s" % (name, why))
        lines.append("  transcript=%s" % open(p).read().splitlines()[-1])
        lines.append("  oracle last_error=%s  tool last_error=%s  diff=%s"
                     % (probe93.canon(orc["last_error"]), probe93.canon(rec.get("last_error")), d))
    # end-to-end: put the null member in a --fixtures dir and let the frozen counter score it
    fdir = os.path.join(S, "deffix-fixtures")
    if os.path.isdir(fdir):
        shutil.rmtree(fdir)
    os.makedirs(fdir)
    shutil.copyfile(os.path.join(FX, "X99NullErr.jsonl"), os.path.join(fdir, "X99NullErr.jsonl"))
    recfile = os.path.join(S, "defects_counter.receipt.txt")
    cmd = ["python3", os.path.join(PROBE, "probe93-c1.py"), "--tool", tool,
           "--sample-a", os.path.join(LANE, ".ufo/waves/round-92/probe/sampleA.tsv"),
           "--fixtures", fdir, "--after", "2026-11-06T21:40:00.000Z",
           "--sessions-root", os.path.join(S, "emptyroot"),
           "--waves", os.path.join(LANE, ".ufo/waves/round-91/w1-results.json"),
           "--runtime", "off", "--out", recfile]
    p = subprocess.run(cmd, capture_output=True, text=True, timeout=1800)
    lines.append("counter_cmd=" + " ".join(cmd))
    lines.append("counter_rc=%d" % p.returncode)
    lines += [l.rstrip() for l in open(recfile) if l.startswith(("DISAGREE", "C93_C1:"))]
    with open(OUT, "w") as fh:
        fh.write("\n".join(lines) + "\n")
    print("\n".join(lines))
    return 0


if __name__ == "__main__":
    sys.exit(main())
