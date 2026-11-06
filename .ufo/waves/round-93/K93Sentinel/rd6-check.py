#!/usr/bin/env python3
"""K93Sentinel — RD-6 re-check: does a huge single-line errorMessage still abort v1 / the candidate?

r92 RD-6 claimed `String.replace(/[A-Za-z0-9_-]{24,}/g, …)` throws RangeError above ~5,767,168
chars on node v24.21.0. This re-runs the same primitive through both tools at the r92 threshold and
at 50 MB / 200 MB, under prlimit --as=4 GiB and a 120 s timeout. A record (rc 0, last_error
`e <redacted>`) at every size means the r92 threshold does not reproduce here.
"""
import json, os, subprocess, time

LANE = "/home/vgpnk/Projects/shokunin/kumitate-shokunin"
V1 = LANE + "/scripts/seat-route.mjs"
CAND = LANE + "/.ufo/waves/round-93/K93ExecTool/seat-route.mjs"
S = "/fast/scratch/hyaku/kumitate-r93/K93Sentinel"
SIZES = (5767168, 50 * 1024 * 1024, 200 * 1024 * 1024)


def main():
    os.makedirs(S, exist_ok=True)
    print(f"v1={V1}")
    print(f"cand={CAND}")
    for n in SIZES:
        p = os.path.join(S, f"rd6-{n}.jsonl")
        with open(p, "w") as fh:
            fh.write(json.dumps({"type": "message", "message": {
                "role": "assistant", "provider": "p", "model": "m",
                "stopReason": "error", "errorMessage": "e " + "a" * n}}) + "\n")
        for label, tool in (("v1", V1), ("cand", CAND)):
            t0 = time.time()
            r = subprocess.run(["prlimit", "--as=4294967296", "timeout", "120",
                                "node", tool, "--file", p, "--json"],
                               capture_output=True, text=True)
            dt = time.time() - t0
            le = None
            try:
                le = json.loads(r.stdout).get("last_error")
            except Exception:
                pass
            print(f"n={n} {label} rc={r.returncode} dt={dt:.1f}s "
                  f"last_error={le!r} stderr={r.stderr[:80].strip()!r}")
        os.remove(p)


if __name__ == "__main__":
    main()
