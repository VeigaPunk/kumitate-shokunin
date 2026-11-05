#!/usr/bin/env python3
"""probe92-c1.py — FROZEN counter for kumitate round 92, claim C1 (capability `seat-route`).

Scores a candidate tool against the frozen reference reading (oracle92.py) of real omp seat
transcripts in three sets:
  A  the frozen stratified sample (sampleA.tsv, drawn at freeze),
  C  a stratified sample drawn at scoring time from the frozen index (index92.tsv) with
     salt = sha256 of the candidate tool's bytes (or --salt), so it is unknown until the tool
     is final and changes whenever the tool changes,
  W  wave mode on each given <wave>-results.json (the round-92 wave is held out: its seat
     transcripts do not exist at freeze).
A record agrees when every key of the oracle record equals the tool's value for that key.

  python3 probe92-c1.py --tool T --index I --sample-a A --waves R1[,R2] [--salt S]
        [--sessions-root D] [--min-wave-located 8] [--out RECEIPT]
Verdict: C92_C1: HELD agree=n/n ... exit 0 | UNMET exit 1 | FAIL-CLOSED exit 2 | usage 64.
HELD requires: every scored record agrees, A scored >= 55, C scored >= 55, and the LAST wave
in --waves has >= --min-wave-located seats the oracle locates.
"""
import hashlib, json, os, subprocess, sys, time

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import oracle92

QUOTA = [("fallback", 12), ("dead", 6), ("aborted", 6), ("silent", 4), ("errfix", 8),
         ("multi", 8), ("clean", 12), ("redact", 4), ("parseerr", 2), ("capnone", 4)]
LIVE_S = 900
MISSING = object()


def tool_cmd(tool):
    return ["python3", tool] if tool.endswith(".py") else ["node", tool]


def run_tool(tool, args, timeout):
    if not os.path.isfile(tool):
        return None, "tool-absent"
    try:
        p = subprocess.run(tool_cmd(tool) + args, capture_output=True, timeout=timeout)
    except subprocess.TimeoutExpired:
        return None, "timeout"
    try:
        return json.loads(p.stdout.decode("utf-8", "replace")), None
    except Exception:
        return None, "unparsable-stdout rc=%d" % p.returncode


def diff(oracle_rec, tool_rec):
    if not isinstance(tool_rec, dict):
        return ["not-a-record"]
    bad = []
    for k, v in oracle_rec.items():
        if tool_rec.get(k, MISSING) != v:
            bad.append(k)
    return bad


def load_index(path):
    rows = []
    for line in open(path):
        p, size, mt, st = line.rstrip("\n").split("\t")
        rows.append((p, st.split(",")))
    return rows


def draw(index, salt, exclude, now):
    chosen, out = set(exclude), []
    for stratum, n in QUOTA:
        cands = [p for p, st in index if stratum in st and p not in chosen]
        cands.sort(key=lambda p: hashlib.sha256((salt + "\0" + p).encode()).hexdigest())
        took = 0
        for p in cands:
            if took >= n:
                break
            try:
                if now - os.stat(p).st_mtime < LIVE_S:
                    continue
            except OSError:
                continue
            chosen.add(p)
            out.append((stratum, p))
            took += 1
    return out


def score_files(tool, items, log, label):
    agree = scored = 0
    for stratum, p in items:
        try:
            if time.time() - os.stat(p).st_mtime < LIVE_S:
                log.append("SKIP %s %s live" % (label, p))
                continue
        except OSError:
            log.append("SKIP %s %s vanished" % (label, p))
            continue
        orc = oracle92.read_one(p)
        rec, err = run_tool(tool, ["--file", p, "--json"], 120)
        scored += 1
        bad = [err] if err else diff(orc, rec)
        if bad:
            log.append("DISAGREE %s %s %s fields=%s" % (label, stratum, p, ",".join(bad)))
        else:
            agree += 1
    return agree, scored


def score_wave(tool, results, sroot, log):
    orc = oracle92.read_wave(results, sroot)
    located = sum(1 for r in orc if r.get("session"))
    recs, err = run_tool(tool, ["--results", results, "--sessions-root", sroot, "--json"], 1800)
    agree = 0
    by = {}
    if isinstance(recs, list):
        for r in recs:
            if isinstance(r, dict) and isinstance(r.get("seat"), str):
                by.setdefault(r["seat"], []).append(r)
    for o in orc:
        if err:
            log.append("DISAGREE W %s %s %s" % (results, o["seat"], err))
            continue
        got = by.get(o["seat"], [])
        if len(got) != 1:
            log.append("DISAGREE W %s %s records=%d" % (results, o["seat"], len(got)))
            continue
        t = dict(got[0])
        if isinstance(t.get("session"), str):
            t["session"] = os.path.realpath(t["session"])
        bad = diff(o, t)
        if bad:
            log.append("DISAGREE W %s %s fields=%s" % (results, o["seat"], ",".join(bad)))
        else:
            agree += 1
    if isinstance(recs, list) and len(recs) != len(orc):
        log.append("DISAGREE W %s record-count tool=%d oracle=%d" % (results, len(recs), len(orc)))
        agree = min(agree, len(orc) - 1)
    return agree, len(orc), located


def main(argv):
    a = {"--sessions-root": os.path.expanduser("~/.omp/agent/sessions"), "--min-wave-located": "8"}
    i = 0
    while i < len(argv):
        if not argv[i].startswith("--") or i + 1 >= len(argv):
            sys.stderr.write("C92_C1: USAGE bad argument %s\n" % argv[i])
            return 64
        a[argv[i]] = argv[i + 1]
        i += 2
    for k in ("--tool", "--index", "--sample-a", "--waves"):
        if k not in a:
            sys.stderr.write("C92_C1: USAGE missing %s\n" % k)
            return 64
    tool = a["--tool"]
    tsha = hashlib.sha256(open(tool, "rb").read()).hexdigest() if os.path.isfile(tool) else "absent"
    salt = a.get("--salt", tsha)
    try:
        index = load_index(a["--index"])
        sample_a = [tuple(l.rstrip("\n").split("\t")[:2]) for l in open(a["--sample-a"]) if l.strip()]
    except Exception as e:
        print("C92_C1: FAIL-CLOSED inputs-unreadable %s" % e)
        return 2
    now = time.time()
    log = []
    aa, na = score_files(tool, sample_a, log, "A")
    sample_c = draw(index, salt, {p for _, p in sample_a}, now)
    ac, nc = score_files(tool, sample_c, log, "C")
    aw = nw = 0
    last_located = 0
    for w in [x for x in a["--waves"].split(",") if x]:
        g, n, loc = score_wave(tool, w, a["--sessions-root"], log)
        aw += g
        nw += n
        last_located = loc
    total, agree = na + nc + nw, aa + ac + aw
    held = agree == total and na >= 55 and nc >= 55 and last_located >= int(a["--min-wave-located"])
    verdict = "HELD" if held else "UNMET"
    line = ("C92_C1: %s agree=%d/%d A=%d/%d C=%d/%d W=%d/%d last_wave_located=%d salt=%s tool_sha256=%s"
            % (verdict, agree, total, aa, na, ac, nc, aw, nw, last_located, salt[:16], tsha))
    body = ["cmd=python3 %s %s" % (os.path.abspath(__file__), " ".join(argv)),
            "at=%s" % time.strftime("%Y-%m-%dT%H:%M:%S%z"),
            "probe_sha256=%s" % hashlib.sha256(open(os.path.abspath(__file__), "rb").read()).hexdigest(),
            "oracle_sha256=%s" % hashlib.sha256(open(os.path.join(HERE, "oracle92.py"), "rb").read()).hexdigest()]
    body += ["C_ITEM %s %s" % s for s in sample_c] + log + [line]
    if "--out" in a:
        with open(a["--out"], "w") as fh:
            fh.write("\n".join(body) + "\n")
    for l in log[:40]:
        print(l)
    print(line)
    return 0 if held else 1


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
