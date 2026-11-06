#!/usr/bin/env python3
"""K93Sentinel — inherited oracle trust-boundary checks on the r93 instrument.

O1  FIFO named `<Seat>.jsonl` in the sessions root: oracle93 `--results` blocks (no S_ISREG check);
    the candidate must return `absent` without blocking.
O2  symlinked `<Seat>.jsonl` pointing outside the sessions root: oracle93 follows it and reports a
    `session` realpath outside the root; the candidate's `entry.isFile()` skips symlinks -> `absent`.
O3  `--file` on a FIFO: oracle hangs, candidate fail-closes.
"""
import json, os, shutil, subprocess, sys, time

LANE = "/home/vgpnk/Projects/shokunin/kumitate-shokunin"
ORACLE = LANE + "/.ufo/waves/round-93/probe/oracle93.py"
CAND = LANE + "/.ufo/waves/round-93/K93ExecTool/seat-route.mjs"
S = "/fast/scratch/hyaku/kumitate-r93/K93Sentinel"


def run(cmd, timeout=8):
    t0 = time.time()
    try:
        p = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout)
        return p.returncode, p.stdout.strip(), p.stderr.strip(), time.time() - t0
    except subprocess.TimeoutExpired:
        return 124, "", "timeout", time.time() - t0


def session_row():
    return json.dumps({"type": "session", "timestamp": "2026-11-06T19:00:00.000Z",
                       "cwd": "/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-93/",
                       "note": "kumitate-shokunin"}) + "\n"


def main():
    os.makedirs(S, exist_ok=True)
    out = []

    def say(s):
        out.append(s)
        print(s)

    # O1 FIFO in the sessions root
    root = os.path.join(S, "fifo-root", "cwd", "orch")
    shutil.rmtree(os.path.join(S, "fifo-root"), ignore_errors=True)
    os.makedirs(root)
    fifo = os.path.join(root, "FifoSeat.jsonl")
    os.mkfifo(fifo)
    rj = os.path.join(S, "fifo-results.json")
    with open(rj, "w") as fh:
        json.dump({"lane": "kumitate", "round": 93, "results": [{"name": "FifoSeat"}]}, fh)
    rc, so, se, dt = run(["python3", ORACLE, "--results", rj, "--sessions-root",
                          os.path.join(S, "fifo-root")])
    say(f"O1 oracle  --results rc={rc} dt={dt:.1f}s out={so[:120]!r}")
    rc, so, se, dt = run(["node", CAND, "--results", rj, "--sessions-root",
                          os.path.join(S, "fifo-root"), "--json"])
    say(f"O1 cand    --results rc={rc} dt={dt:.1f}s out={so[:160]!r}")

    # O2 symlinked transcript escaping the root
    shutil.rmtree(os.path.join(S, "sym-root"), ignore_errors=True)
    outside = os.path.join(S, "sym-outside")
    os.makedirs(outside)
    real = os.path.join(outside, "EscapeSeat.jsonl")
    with open(real, "w") as fh:
        fh.write(session_row())
        fh.write(json.dumps({"type": "message", "message": {"role": "assistant",
                                                            "provider": "p", "model": "m",
                                                            "stopReason": "stop"}}) + "\n")
    root = os.path.join(S, "sym-root", "cwd", "orch")
    os.makedirs(root)
    os.symlink(real, os.path.join(root, "EscapeSeat.jsonl"))
    rj = os.path.join(S, "sym-results.json")
    with open(rj, "w") as fh:
        json.dump({"lane": "kumitate", "round": 93, "results": [{"name": "EscapeSeat"}]}, fh)
    rc, so, se, dt = run(["python3", ORACLE, "--results", rj, "--sessions-root",
                          os.path.join(S, "sym-root")])
    esc = None
    try:
        esc = json.loads(so)[0].get("session")
    except Exception:
        pass
    say(f"O2 oracle  rc={rc} session_outside_root={str(bool(esc) and not esc.startswith(os.path.join(S, 'sym-root'))).lower()} "
        f"final={(json.loads(so)[0].get('final') if rc == 0 else None)}")
    rc, so, se, dt = run(["node", CAND, "--results", rj, "--sessions-root",
                          os.path.join(S, "sym-root"), "--json"])
    rec = json.loads(so)[0] if rc == 0 else {}
    say(f"O2 cand    rc={rc} final={rec.get('final')} session={rec.get('session')}")

    # O3 --file on a FIFO
    rc, so, se, dt = run(["python3", ORACLE, "--file", fifo])
    say(f"O3 oracle  --file fifo rc={rc} dt={dt:.1f}s")
    rc, so, se, dt = run(["node", CAND, "--file", fifo, "--json"])
    say(f"O3 cand    --file fifo rc={rc} dt={dt:.1f}s stderr={se[:120]!r}")

    with open(os.path.join(LANE, ".ufo/waves/round-93/K93Sentinel/fifo-symlink-check.txt"), "w") as fh:
        fh.write("\n".join(out) + "\n")


if __name__ == "__main__":
    main()
