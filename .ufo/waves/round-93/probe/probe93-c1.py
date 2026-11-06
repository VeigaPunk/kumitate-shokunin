#!/usr/bin/env python3
"""probe93-c1.py — FROZEN counter for kumitate round 93, claim C1 (capability `seat-route` v2,
contract `kumitate-seat-route-v2`). Built to Q86 (corpus/QUALITY.md, round 92).

Scores a candidate tool against the frozen reference reading (oracle93.py) in four sets:
  A  the round-92 frozen stratified sample (pre-freeze real transcripts; scored, not held out),
  F  the synthetic member set probe/fixtures/*.jsonl (Q86: discriminating members for fields the
     real population lacks; tests the definitions' text, not omp),
  H  HELD OUT: real transcripts under the sessions root whose first `session` row timestamp is
     >= --after (a literal frozen in plan.md, later than the freeze commit), not modified in the last
     900 s; ordered by sha256("r93-H" NUL path), first --h-max taken. These files did not exist when
     the candidate's contract and this counter were frozen, so no author can compute the set.
  W  wave mode on each --waves results file; the LAST one must be the round-93 wave (post-freeze).
Comparison is TYPE-STRICT: a record agrees when, for every key of the oracle record, the canonical
JSON (sort_keys) of the tool's value equals the oracle's (so 0 != false, 1 != true, [] != null).
Field coverage (Q86): every compared field must take >= 2 distinct canonical values across the
scored oracle records; the receipt prints per-field distinct counts for all sets and for real sets.

Runtime independence (kill clause d): the tool is run once more on the last wave under
`strace -f -e trace=open,openat,openat2,execve`; any opened path under `/.ufo/waves/round-93/`
other than the given results file, any path naming oracle93/probe93, or any execve after the first
reads `RUNTIME: VIOLATION`; strace missing reads `RUNTIME: UNAVAILABLE`. Printed separately; the
frozen predicate requires `C93_C1: HELD` AND `RUNTIME: CLEAN`. `--runtime off` skips it (controls).

  python3 probe93-c1.py --tool T --sample-a A --fixtures DIR --after ISO --waves R1[,R2]
        [--sessions-root D] [--h-max 120] [--min-h 60] [--min-wave-located 8] [--runtime on|off]
        [--out RECEIPT]
Verdict: C93_C1: HELD ... exit 0 | UNMET exit 1 | FAIL-CLOSED exit 2 | usage 64.
HELD requires: every scored record agrees; A >= 55 scored; F = all fixtures scored; H >= --min-h
scored; the LAST wave has >= --min-wave-located seats the oracle locates; every compared field
has >= 2 distinct values.
"""
import hashlib, json, os, re, shutil, subprocess, sys, tempfile, time

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import oracle93

LIVE_S = 900
MISSING = object()


def canon(v):
    return json.dumps(v, sort_keys=True)


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


def diff(orc, rec):
    if not isinstance(rec, dict):
        return ["not-a-record"]
    bad = []
    for k, v in orc.items():
        got = rec.get(k, MISSING)
        if got is MISSING or canon(got) != canon(v):
            bad.append(k)
    return bad


def live(p, now):
    try:
        return now - os.stat(p).st_mtime < LIVE_S
    except OSError:
        return True


def draw_h(sroot, after, hmax, now):
    pool = []
    for dirpath, dirnames, filenames in os.walk(sroot):
        for fn in filenames:
            if not fn.endswith(".jsonl"):
                continue
            p = os.path.join(dirpath, fn)
            ts = oracle93.first_ts(p)
            if ts and ts >= after and not live(p, now):
                pool.append(p)
    pool.sort(key=lambda p: hashlib.sha256(("r93-H\0" + p).encode()).hexdigest())
    return len(pool), pool[:hmax]


def score_files(tool, items, log, label, seen):
    agree = scored = 0
    now = time.time()
    for p in items:
        if label != "F" and live(p, now):
            log.append("SKIP %s %s live-or-vanished" % (label, p))
            continue
        orc = oracle93.read_one(p)
        rec, err = run_tool(tool, ["--file", p, "--json"], 120)
        scored += 1
        seen.append((label, orc))
        bad = [err] if err else diff(orc, rec)
        if bad:
            log.append("DISAGREE %s %s fields=%s" % (label, p, ",".join(bad)))
        else:
            agree += 1
    return agree, scored


def score_wave(tool, results, sroot, log, seen):
    orc = oracle93.read_wave(results, sroot)
    located = sum(1 for r in orc if r.get("session"))
    recs, err = run_tool(tool, ["--results", results, "--sessions-root", sroot, "--json"], 1800)
    agree = 0
    by = {}
    if isinstance(recs, list):
        for r in recs:
            if isinstance(r, dict) and isinstance(r.get("seat"), str):
                by.setdefault(r["seat"], []).append(r)
    for o in orc:
        seen.append(("W", o))
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


FIELDS = ["captured", "answered", "error_attempts", "recovered_attempts", "superseded_by", "upstream",
          "resolved", "chain", "flag_hops", "revert_hops", "aborted", "fallback", "final", "last_error",
          "yielded", "parse_errors"]


def field_cover(seen):
    out = {}
    for f in FIELDS:
        allv = {canon(o[f]) for _, o in seen if f in o}
        realv = {canon(o[f]) for lab, o in seen if lab != "F" and f in o}
        out[f] = (len(allv), len(realv))
    return out


OPEN_RE = re.compile(r'^\s*(?:\[pid\s+\d+\]\s*|\d+\s+)?(open|openat|openat2|execve)\((?:[A-Z_0-9-]+,\s*)?"([^"]*)"')


def runtime_check(tool, results, sroot, scratch):
    if not shutil.which("strace"):
        return "UNAVAILABLE", ["strace-missing"]
    log = os.path.join(scratch, "strace.log")
    try:
        subprocess.run(["strace", "-f", "-qq", "-e", "trace=open,openat,openat2,execve", "-o", log]
                       + tool_cmd(tool) + ["--results", results, "--sessions-root", sroot, "--json"],
                       capture_output=True, timeout=1800)
    except subprocess.TimeoutExpired:
        return "VIOLATION", ["timeout"]
    res = os.path.realpath(results)
    bad, execs = [], 0
    for line in open(log, errors="replace"):
        m = OPEN_RE.match(line)
        if not m:
            continue
        call, path = m.group(1), m.group(2)
        if call == "execve":
            if "ENOENT" in line:
                continue
            execs += 1
            if execs > 1:
                bad.append("execve %s" % path)
            continue
        if "oracle93" in path or "probe93" in path:
            bad.append("open %s" % path)
        elif "/.ufo/waves/round-93/" in path:
            rp = os.path.realpath(path) if os.path.exists(path) else path
            if rp != res:
                bad.append("open %s" % path)
    return ("VIOLATION" if bad else "CLEAN"), bad


def main(argv):
    a = {"--sessions-root": os.path.expanduser("~/.omp/agent/sessions"), "--min-wave-located": "8",
         "--h-max": "120", "--min-h": "60", "--runtime": "on"}
    i = 0
    while i < len(argv):
        if not argv[i].startswith("--") or i + 1 >= len(argv):
            sys.stderr.write("C93_C1: USAGE bad argument %s\n" % argv[i])
            return 64
        a[argv[i]] = argv[i + 1]
        i += 2
    for k in ("--tool", "--sample-a", "--fixtures", "--after", "--waves"):
        if k not in a:
            sys.stderr.write("C93_C1: USAGE missing %s\n" % k)
            return 64
    tool = a["--tool"]
    tsha = hashlib.sha256(open(tool, "rb").read()).hexdigest() if os.path.isfile(tool) else "absent"
    try:
        sample_a = [l.rstrip("\n").split("\t")[1] for l in open(a["--sample-a"]) if l.strip()]
        fixtures = sorted(os.path.join(a["--fixtures"], f) for f in os.listdir(a["--fixtures"]) if f.endswith(".jsonl"))
        if not fixtures:
            raise ValueError("no fixtures")
    except Exception as e:
        print("C93_C1: FAIL-CLOSED inputs-unreadable %s" % e)
        return 2
    now = time.time()
    log, seen = [], []
    aa, na = score_files(tool, sample_a, log, "A", seen)
    af, nf = score_files(tool, fixtures, log, "F", seen)
    hpool, hitems = draw_h(a["--sessions-root"], a["--after"], int(a["--h-max"]), now)
    ah, nh = score_files(tool, hitems, log, "H", seen)
    aw = nw = 0
    last_located = 0
    waves = [x for x in a["--waves"].split(",") if x]
    for w in waves:
        g, n, loc = score_wave(tool, w, a["--sessions-root"], log, seen)
        aw += g
        nw += n
        last_located = loc
    cover = field_cover(seen)
    thin = [f for f, (al, _) in cover.items() if al < 2]
    total, agree = na + nf + nh + nw, aa + af + ah + aw
    held = (agree == total and na >= 55 and nf == len(fixtures) and nh >= int(a["--min-h"])
            and last_located >= int(a["--min-wave-located"]) and not thin)
    verdict = "HELD" if held else "UNMET"
    line = ("C93_C1: %s agree=%d/%d A=%d/%d F=%d/%d H=%d/%d W=%d/%d h_pool=%d last_wave_located=%d thin_fields=%d after=%s tool_sha256=%s"
            % (verdict, agree, total, aa, na, af, nf, ah, nh, aw, nw, hpool, last_located, len(thin), a["--after"], tsha))
    rt_line = "RUNTIME: SKIPPED"
    rt_bad = []
    if a["--runtime"] == "on" and waves:
        scratch = tempfile.mkdtemp(prefix="probe93-rt-")
        try:
            rt, rt_bad = runtime_check(tool, waves[-1], a["--sessions-root"], scratch)
        finally:
            shutil.rmtree(scratch, ignore_errors=True)
        rt_line = "RUNTIME: %s findings=%d" % (rt, len(rt_bad))
    body = ["cmd=python3 %s %s" % (os.path.abspath(__file__), " ".join(argv)),
            "at=%s" % time.strftime("%Y-%m-%dT%H:%M:%S%z"),
            "probe_sha256=%s" % hashlib.sha256(open(os.path.abspath(__file__), "rb").read()).hexdigest(),
            "oracle_sha256=%s" % hashlib.sha256(open(os.path.join(HERE, "oracle93.py"), "rb").read()).hexdigest()]
    body += ["H_ITEM %s" % p for p in hitems]
    body += ["FIELD %s distinct_all=%d distinct_real=%d" % (f, al, rl) for f, (al, rl) in cover.items()]
    body += log + ["RUNTIME_FINDING %s" % b for b in rt_bad] + [rt_line, line]
    if "--out" in a:
        with open(a["--out"], "w") as fh:
            fh.write("\n".join(body) + "\n")
    for l in log[:40]:
        print(l)
    print(rt_line)
    print(line)
    return 0 if held else 1


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
