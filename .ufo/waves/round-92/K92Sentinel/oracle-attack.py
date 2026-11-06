#!/usr/bin/env python3
"""K92Sentinel step 2b: attack the FROZEN oracle (the positive control) with the same fixtures.

The oracle is the reference reading and the positive control scores 133/133 through it, so any
hostile-input behaviour of the oracle is inherited by the counter.
"""
import json, os, shutil, subprocess, sys, tempfile, time

LANE = "/home/vgpnk/Projects/shokunin/kumitate-shokunin"
ORACLE = LANE + "/.ufo/waves/round-92/probe/oracle92.py"
SC = "/fast/scratch/hyaku/kumitate-r92/K92Sentinel/oracle-attack"
MARK = "/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-92/"
R = []


def rec(name, ok, detail):
    R.append((name, ok, detail))
    print(f"[{'PASS' if ok else 'FAIL'}] {name}: {detail}")


def body(ts="2026-11-01T00:00:00.000Z", error=None):
    rows = [{"type": "session", "timestamp": ts, "cwd": MARK},
            {"type": "model_change", "role": "subagent:S", "model": "cap/model"},
            {"type": "message", "message": {"role": "assistant", "provider": "p", "model": "m",
                                            "stopReason": "error" if error else "stop",
                                            "content": [], **({"errorMessage": error} if error else {})}}]
    return "\n".join(json.dumps(r) for r in rows) + "\n"


def run(args, timeout=20):
    t0 = time.time()
    try:
        p = subprocess.run(["timeout", str(timeout), "python3", ORACLE] + args,
                           capture_output=True, text=True, timeout=timeout + 20)
        return p.returncode, p.stdout, p.stderr, time.time() - t0
    except subprocess.TimeoutExpired:
        return "HUNG", "", "", time.time() - t0


def main():
    if os.path.isdir(SC):
        subprocess.run(["chmod", "-R", "u+rwX", SC])
        shutil.rmtree(SC)
    os.makedirs(SC)
    base = tempfile.mkdtemp(dir=SC)
    root = os.path.join(base, "sessions")
    os.makedirs(os.path.join(root, "d"), exist_ok=True)
    good = os.path.join(root, "d", "GoodSeat.jsonl")
    open(good, "w").write(body())
    outside = os.path.join(base, "outside", "EscapeSeat.jsonl")
    os.makedirs(os.path.dirname(outside), exist_ok=True)
    open(outside, "w").write(body("2026-11-02T00:00:00.000Z", error="OUTSIDE_ROOT_CANARY"))
    os.symlink(outside, os.path.join(root, "EscapeSeat.jsonl"))
    os.symlink(root, os.path.join(root, "loop"))
    os.mkfifo(os.path.join(root, "FifoSeat.jsonl"))
    res = {"lane": "kumitate", "round": "92",
           "results": [{"name": n, "agent": "task"} for n in
                       ["GoodSeat", "EscapeSeat", "FifoSeat", "../x", "/etc/passwd"]]}
    rp = os.path.join(base, "w1-results.json")
    open(rp, "w").write(json.dumps(res))

    rc, out, err, dt = run(["--results", rp, "--sessions-root", root, "--json"], 15)
    hung = rc == "HUNG" or rc == 124
    rec("O1-oracle-terminates-with-fifo-in-root", not hung,
        f"rc={rc} dt={dt:.1f}s (124 = timeout killed it) err={err.strip()[:100]!r}")
    os.unlink(os.path.join(root, "FifoSeat.jsonl"))
    rc, out, err, dt = run(["--results", rp, "--sessions-root", root, "--json"], 15)
    rec("O1b-oracle-terminates-without-fifo", not (rc == "HUNG" or rc == 124), f"rc={rc} dt={dt:.1f}s")
    if not (rc == "HUNG" or rc == 124):
        try:
            recs = {r["seat"]: r for r in json.loads(out)}
        except Exception:
            recs = {}
        esc = recs.get("EscapeSeat")
        rec("O2-oracle-reads-outside-root-via-symlink",
            esc is not None and esc.get("session") is not None,
            f"session={esc.get('session') if esc else None} (outside root => containment absent)")
        for bad in ("../x", "/etc/passwd"):
            r = recs.get(bad)
            rec(f"O3-oracle-traversal-{bad!r}", r is not None and r.get("session") is None,
                f"rec={json.dumps(r)[:80] if r else None}")
        fifo = recs.get("FifoSeat")
        rec("O4-oracle-fifo-seat", fifo is not None and fifo.get("session") is None,
            f"rec={json.dumps(fifo)[:80] if fifo else None}")
    print("\nSUMMARY " + " ".join(f"{n}={'ok' if ok else 'FAIL'}" for n, ok, _ in R))
    print("FAILS=" + ",".join(n for n, ok, _ in R if not ok))
    return 0


if __name__ == "__main__":
    sys.exit(main())
