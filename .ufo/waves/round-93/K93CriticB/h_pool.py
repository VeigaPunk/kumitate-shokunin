#!/usr/bin/env python3
"""K93CriticB / H feasibility + rate measurement on the REAL sessions root (read-only).

draw_h() must open 28 006 .jsonl files to read their first `session` row, so the counter pays that
cost on every run. This measures the same population cheaply (only files touched in the last 8 h)
and reports how many could ever satisfy the frozen H gate after=21:40:00Z, plus the arrival rate.
"""
import json, os, sys, time

SROOT = os.path.expanduser("~/.omp/agent/sessions")
OUT = "/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-93/K93CriticB/h_pool.receipt.txt"
AFTER = "2026-11-06T21:40:00.000Z"
FREEZE = "2026-11-06T20:53:14.000Z"


def first_ts(p):
    try:
        with open(p, "rb") as fh:
            head = fh.read(8192).decode("utf-8", "replace").splitlines()
    except OSError:
        return ""
    for line in head[:51]:
        try:
            o = json.loads(line)
        except Exception:
            continue
        if isinstance(o, dict) and o.get("type") == "session":
            return str(o.get("timestamp") or "")
    return ""


def main():
    now = time.time()
    horizon = now - 8 * 3600
    hits = []          # (first_ts, mtime, path)
    n_files = n_fresh = 0
    t0 = time.time()
    for dirpath, dirnames, filenames in os.walk(SROOT):
        for fn in filenames:
            if not fn.endswith(".jsonl"):
                continue
            n_files += 1
            p = os.path.join(dirpath, fn)
            try:
                mt = os.stat(p).st_mtime
            except OSError:
                continue
            if mt < horizon:
                continue
            n_fresh += 1
            ts = first_ts(p)
            if ts:
                hits.append((ts, mt, p))
    dt = time.time() - t0
    hits.sort()
    lines = []
    lines.append("sessions_root=%s files=%d touched_last_8h=%d with_session_row=%d walk_s=%.1f"
                 % (SROOT, n_files, n_fresh, len(hits), dt))
    lines.append("now=%s local=%s" % (time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(now)),
                                      time.strftime("%Y-%m-%dT%H:%M:%S%z", time.localtime(now))))
    # hourly histogram of first session timestamps (UTC hour)
    hist = {}
    for ts, mt, p in hits:
        hist[ts[:13]] = hist.get(ts[:13], 0) + 1
    for k in sorted(hist):
        lines.append("HOUR %s count=%d" % (k, hist[k]))
    for label, cut in (("freeze", FREEZE), ("after", AFTER)):
        sel = [(ts, mt, p) for ts, mt, p in hits if ts >= cut]
        old = [x for x in sel if now - x[1] >= 900]
        lines.append("CUTOFF %s (%s): started=%d non_live_now=%d" % (label, cut, len(sel), len(old)))
    # arrival rate: session rows per minute in the last 90 min
    recent = [ts for ts, mt, p in hits if ts >= time.strftime("%Y-%m-%dT%H:%M:%S", time.gmtime(now - 5400))]
    lens = [ts for ts, mt, p in hits]
    lines.append("started_last_90min=%d => approx %.1f/min" % (len(recent), len(recent) / 90.0))
    # how many must still start after AFTER for the gate: 60 + the 900 s live lag
    lines.append("GATE needs >=60 transcripts whose first session ts >= %s AND mtime>=900s before scoring" % AFTER)
    # earliest local time at which H can be non-zero
    time.sleep(0)
    with open(OUT, "w") as fh:
        fh.write("\n".join(lines) + "\n")
    print("\n".join(lines))
    return 0


if __name__ == "__main__":
    sys.exit(main())
