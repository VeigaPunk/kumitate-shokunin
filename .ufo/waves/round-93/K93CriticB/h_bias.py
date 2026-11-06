#!/usr/bin/env python3
"""K93CriticB / H-set bias demo. Scratch-only sessions root; never touches ~/.omp.

Shows, against probe93.draw_h and a real counter run:
  1. a fabricated .jsonl under the sessions root enters H (forged first `session` timestamp),
  2. the 900 s `live()` gate is an mtime test, not a provenance test: os.utime backdating
     admits a never-aged file, os.utime to now drops a real H-eligible file,
  3. the timestamp comparison is a STRING compare, not a time compare,
  4. H selection is sha256(path) order, so a forged name can be ground below any real path.
"""
import hashlib, json, os, shutil, subprocess, sys, time

LANE = "/home/vgpnk/Projects/shokunin/kumitate-shokunin"
PROBE = os.path.join(LANE, ".ufo/waves/round-93/probe")
AFTER = "2026-11-06T21:40:00.000Z"
S = "/fast/scratch/hyaku/kumitate-r93/K93CriticB"
SROOT = os.path.join(S, "hroot")
OUT = os.path.join(LANE, ".ufo/waves/round-93/K93CriticB/h_bias.receipt.txt")

sys.path.insert(0, PROBE)
import importlib.util  # noqa: E402
import oracle93  # noqa: E402
_spec = importlib.util.spec_from_file_location("probe93", os.path.join(PROBE, "probe93-c1.py"))
probe93 = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(probe93)


def w(path, rows):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w") as fh:
        for r in rows:
            fh.write(json.dumps(r) + "\n")
    return path


def ts_of(p):
    return oracle93.first_ts(p)


def report(lines, *a):
    s = " ".join(str(x) for x in a)
    lines.append(s)
    print(s)


def main():
    if os.path.isdir(SROOT):
        shutil.rmtree(SROOT)
    os.makedirs(SROOT)
    lines = []
    d = os.path.join(SROOT, "-Projects-shokunin", "2026-11-06T22-00-00-000Z_deadbeef")
    os.makedirs(d)

    forged = w(os.path.join(d, "ForgedA.jsonl"), [
        {"type": "session", "timestamp": "2026-11-06T21:41:00.000Z", "cwd": "/x"},
        {"type": "model_change", "role": "subagent:ForgedA", "model": "m/one"},
        {"type": "message", "message": {"role": "assistant", "stopReason": "stop",
                                        "provider": "p", "model": "p/one"}},
    ])
    # 3: string, not time, comparison
    equal_instant = w(os.path.join(d, "EqualInstant.jsonl"), [
        {"type": "session", "timestamp": "2026-11-06T21:40:00.000+00:00"},
    ])
    same_instant_plus = w(os.path.join(d, "PlusOneOffset.jsonl"), [
        {"type": "session", "timestamp": "2026-11-06T22:40:00.000+01:00"},
    ])
    junk = w(os.path.join(d, "JunkTs.jsonl"), [{"type": "session", "timestamp": "zzz"}])

    now = time.time()
    old = now - 86400
    # 2: mtime knob. ForgedA fresh now -> live -> excluded; backdated -> admitted.
    os.utime(forged, (now, now))
    n0, h0 = probe93.draw_h(SROOT, AFTER, 120, now)
    os.utime(forged, (old, old))
    os.utime(equal_instant, (old, old))
    os.utime(same_instant_plus, (old, old))
    os.utime(junk, (old, old))
    n1, h1 = probe93.draw_h(SROOT, AFTER, 120, now)

    report(lines, "draw_h fresh-mtime  pool=%d items=%s" % (n0, [os.path.basename(p) for p in h0]))
    report(lines, "draw_h backdated    pool=%d items=%s" % (n1, [os.path.basename(p) for p in h1]))
    report(lines, "first_ts equal-instant '+00:00' =%r  (string < 'Z' => excluded)" % ts_of(equal_instant))
    report(lines, "first_ts +01:00 same instant     =%r  (string > 'Z' => included)" % ts_of(same_instant_plus))
    report(lines, "first_ts junk 'zzz'              =%r  (string >= after => included)" % ts_of(junk))

    # 4: hash grind. hmax=1 pick.
    pool = [forged, equal_instant, same_instant_plus, junk]
    key = lambda p: hashlib.sha256(("r93-H\0" + p).encode()).hexdigest()
    win = min(pool, key=key)
    report(lines, "hmax=1 picks %s (sha %s)" % (os.path.basename(win), key(win)[:16]))
    target = key(forged)
    # find a forged *name* under the sessions root that sorts below the real-looking path
    gr = None
    for i in range(200000):
        cand = os.path.join(d, "g%06d.jsonl" % i)
        if key(cand) < target:
            gr = cand
            break
    report(lines, "hash-grind: %s sha %s < ForgedA sha %s (attempts=%d)"
           % (os.path.basename(gr), key(gr)[:16], target[:16], i))
    w(gr, [{"type": "session", "timestamp": "2026-11-06T21:41:00.000Z"}])
    os.utime(gr, (old, old))
    n2, h2 = probe93.draw_h(SROOT, AFTER, 1, now)
    report(lines, "draw_h hmax=1 now picks %s (ground path)" % os.path.basename(h2[0]))

    # end-to-end: the counter prints H_ITEM for every admitted member, and counts it in H
    dumb = os.path.join(S, "nul.mjs")
    with open(dumb, "w") as fh:
        fh.write('process.stdout.write("[]\\n");\n')
    rec = os.path.join(S, "h_bias_counter.receipt.txt")
    cmd = ["python3", os.path.join(PROBE, "probe93-c1.py"), "--tool", dumb,
           "--sample-a", os.path.join(LANE, ".ufo/waves/round-92/probe/sampleA.tsv"),
           "--fixtures", os.path.join(PROBE, "fixtures"), "--after", AFTER,
           "--sessions-root", SROOT,
           "--waves", os.path.join(LANE, ".ufo/waves/round-91/w1-results.json"),
           "--runtime", "off", "--out", rec]
    p = subprocess.run(cmd, capture_output=True, text=True, timeout=900)
    tail = [l for l in open(rec) if l.startswith(("H_ITEM", "C93_C1:"))]
    report(lines, "counter rc=%d" % p.returncode)
    for l in tail:
        report(lines, "  " + l.rstrip())

    with open(OUT, "w") as fh:
        fh.write("\n".join(lines) + "\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())
