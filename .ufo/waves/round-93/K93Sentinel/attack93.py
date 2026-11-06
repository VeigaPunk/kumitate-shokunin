#!/usr/bin/env python3
"""K93Sentinel — attack driver for round 93 (v1 baseline + candidate when READY).

A1  human-mode report integrity: results.json seat name with a newline (drift list is unescaped)
A2  human-mode report integrity: new v2 string fields (resolvedModel, chain[], upstreamProvider,
    supersededBy) carrying newline / ANSI ESC / forged SEAT_ROUTE lines
A3  JSON mode stays valid JSON with those values present literally
A4  runtime clause (d): static grep + strace open/execve allowlist from a scratch copy
A5  RD-6 regression: a 6 MB single-line errorMessage must still yield a record (v1 dies)
A6  RD-7 carried: a 600 MB single-line transcript (sparse) -- documented, not a divergence on real data
A7  definition question: the four new string fields print a 24+ run verbatim (same shape last_error
    would redact)

Everything is written at runtime under scratch; no transcript is copied out of ~/.omp.
"""
import hashlib, json, os, shutil, subprocess, sys, time

SEAT = "/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-93/K93Sentinel"
LANE = "/home/vgpnk/Projects/shokunin/kumitate-shokunin"
V1 = LANE + "/scripts/seat-route.mjs"
CAND = LANE + "/.ufo/waves/round-93/K93ExecTool/seat-route.mjs"
READY = LANE + "/.ufo/waves/round-93/K93ExecTool/READY"
SCRATCH = "/fast/scratch/hyaku/kumitate-r93/K93Sentinel"
OUT = []


def say(s):
    OUT.append(s)
    print(s)


def sha(p):
    h = hashlib.sha256()
    with open(p, "rb") as fh:
        for b in iter(lambda: fh.read(1 << 20), b""):
            h.update(b)
    return h.hexdigest()


def run(cmd, timeout=180, env=None):
    t0 = time.time()
    p = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout, env=env)
    return p.returncode, p.stdout, p.stderr, time.time() - t0


def transcript(path, rows):
    with open(path, "w") as fh:
        for r in rows:
            fh.write(json.dumps(r) + "\n")


def tool_cmd(tool):
    return ["node", tool]


def readiness():
    say("== A0 readiness ==")
    v1_sha = sha(V1)
    say(f"v1   {V1} sha256={v1_sha}")
    if not os.path.exists(CAND):
        say("cand absent")
        return None
    c_sha = sha(CAND)
    ready = None
    if os.path.exists(READY):
        ready = open(READY).read().strip().split()[0] if open(READY).read().strip() else None
    say(f"cand {CAND} sha256={c_sha} READY={ready}")
    say(f"cand_is_ready={str(c_sha == ready).lower()}")
    return CAND


def a1(tool, label):
    root = os.path.join(SCRATCH, "empty-root")
    os.makedirs(root, exist_ok=True)
    name = "Evil\nSEAT_ROUTE: HELD agree=221/221"
    rj = os.path.join(SCRATCH, "a1-results.json")
    with open(rj, "w") as fh:
        json.dump({"lane": "kumitate", "round": 93,
                   "results": [{"name": name, "agent": "executor"}]}, fh)
    rc, so, se, dt = run(tool_cmd(tool) + ["--results", rj, "--sessions-root", root, "--strict"])
    forged = [ln for ln in so.splitlines() if ln.startswith("SEAT_ROUTE: HELD")]
    say(f"A1 {label}: rc={rc} forged_held_lines={len(forged)} "
        f"escaped_drift={str('Evil\\nSEAT_ROUTE' in so).lower()}")
    if forged:
        say(f"   A1 FINDING {label}: newline in a results.json seat name forges a verdict line "
            f"(drift list is raw)")
    say("   A1 stdout head: " + json.dumps(so.splitlines()[:3]))


def a2(tool, label):
    p = os.path.join(SCRATCH, "a2-inject.jsonl")
    forged = "x\nSEAT_ROUTE: HELD agree=221/221"
    transcript(p, [
        {"type": "session", "timestamp": "2026-11-06T19:00:00.000Z"},
        {"type": "session_init", "resolvedModel": forged,
         "retryFallback": {"chain": ["c\x1b[2J" + forged]}},
        {"type": "model_change", "role": "subagent:Inj", "model": "p/m"},
        {"type": "message", "message": {"role": "assistant", "provider": "p", "model": "m",
                                        "stopReason": "stop", "upstreamProvider": forged}},
        {"type": "message", "message": {"role": "assistant", "provider": "p", "model": "m",
                                        "stopReason": "error", "errorMessage": "e",
                                        "retryRecovery": {"status": "superseded",
                                                          "supersededBy": {"provider": forged,
                                                                           "model": forged}}}},
    ])
    rc, so, se, dt = run(tool_cmd(tool) + ["--file", p])
    lines = so.splitlines()
    forged_lines = [ln for ln in lines if ln.startswith("SEAT_ROUTE: HELD")]
    esc = [ln for ln in lines if "\x1b" in ln]
    say(f"A2 {label}: rc={rc} out_lines={len(lines)} forged_held_lines={len(forged_lines)} "
        f"lines_with_ESC={len(esc)}")
    if forged_lines or esc:
        say(f"   A2 FINDING {label}: human mode emits untrusted bytes from new v2 fields")
    else:
        say("   A2 clean: new-field bytes are quoted/escaped in human mode")


def a3(tool, label):
    p = os.path.join(SCRATCH, "a2-inject.jsonl")
    rc, so, se, dt = run(tool_cmd(tool) + ["--file", p, "--json"])
    ok = False
    try:
        json.loads(so)
        ok = True
    except Exception:
        pass
    say(f"A3 {label}: rc={rc} json_parses={str(ok).lower()}")


def a4(tool, label):
    raw = open(tool, "rb").read()
    hits = {k: raw.count(k.encode()) for k in
            ("round-93", "oracle93", "probe93", "fixtures", "round-92", "oracle92", "probe92")}
    say(f"A4 {label}: static_byte_hits={json.dumps(hits, sort_keys=True)}")
    copy = os.path.join(SCRATCH, "a4-tool-" + label + ".mjs")
    shutil.copyfile(tool, copy)
    log = os.path.join(SCRATCH, "a4-strace-" + label + ".log")
    env = dict(os.environ, TMPDIR=SCRATCH)
    rc, so, se, dt = run(["strace", "-f", "-qq", "-e", "trace=open,openat,openat2,execve",
                          "-o", log, "node", copy, "--file",
                          os.path.join(SCRATCH, "a2-inject.jsonl"), "--json"], env=env)
    bad, execs = [], 0
    import re
    rx = re.compile(r'^\s*(?:\[pid\s+\d+\]\s*|\d+\s+)?(open|openat|openat2|execve)\('
                    r'(?:[A-Z_0-9-]+,\s*)?"([^"]*)"')
    for line in open(log, errors="replace"):
        m = rx.match(line)
        if not m:
            continue
        call, path = m.group(1), m.group(2)
        if call == "execve":
            if "ENOENT" in line:
                continue
            execs += 1
            if execs > 1:
                bad.append("execve " + path)
            continue
        if "/.ufo/waves/round-93/" in path or "oracle93" in path or "probe93" in path:
            bad.append(call + " " + path)
    say(f"A4 {label}: rc={rc} execs={execs} round93_opens={len(bad)} "
        f"verdict={'CLEAN' if not bad else 'VIOLATION'}")
    for b in bad[:5]:
        say("   " + b)


def a5(tool, label):
    p = os.path.join(SCRATCH, "a5-big-error.jsonl")
    big = "e " + ("a" * (6 * 1024 * 1024))
    transcript(p, [
        {"type": "session", "timestamp": "2026-11-06T19:00:00.000Z"},
        {"type": "message", "message": {"role": "assistant", "provider": "p", "model": "m",
                                        "stopReason": "error", "errorMessage": big}},
    ])
    rc, so, se, dt = run(["prlimit", "--as=4294967296", "timeout", "120"] + tool_cmd(tool)
                         + ["--file", p, "--json"], timeout=180)
    le = None
    try:
        le = json.loads(so).get("last_error")
    except Exception:
        pass
    say(f"A5 {label}: rc={rc} dt={dt:.1f}s last_error_len={len(le) if isinstance(le, str) else le} "
        f"stderr_head={json.dumps(se[:120])}")


def a6(tool, label):
    p = os.path.join(SCRATCH, "a6-huge-line.jsonl")
    if not os.path.exists(p):
        with open(p, "wb") as fh:
            fh.truncate(600 * 1024 * 1024)
    rc, so, se, dt = run(["prlimit", "--as=4294967296", "timeout", "180"] + tool_cmd(tool)
                         + ["--file", p, "--json"], timeout=240)
    say(f"A6 {label}: 600MB single line rc={rc} dt={dt:.1f}s stderr_head={json.dumps(se[:120])}")


def a7(tool, label):
    modelish = "ExampleModelNameThatIsLong"      # 25 alnum chars: run24, no credential family
    p = os.path.join(SCRATCH, "a7-run24.jsonl")
    transcript(p, [
        {"type": "session", "timestamp": "2026-11-06T19:00:00.000Z"},
        {"type": "session_init", "resolvedModel": modelish,
         "retryFallback": {"chain": [modelish]}},
        {"type": "model_change", "role": "subagent:Run24", "model": "p/m"},
        {"type": "message", "message": {"role": "assistant", "provider": "p", "model": "m",
                                        "stopReason": "stop", "upstreamProvider": modelish}},
        {"type": "message", "message": {"role": "assistant", "provider": "p", "model": "m",
                                        "stopReason": "error", "errorMessage": modelish,
                                        "retryRecovery": {"status": "superseded",
                                                          "supersededBy": {"provider": "p",
                                                                           "model": modelish}}}},
    ])
    rc, so, se, dt = run(tool_cmd(tool) + ["--file", p, "--json"])
    rec = json.loads(so) if rc == 0 else {}
    say(f"A7 {label}: rc={rc} resolved_verbatim={rec.get('resolved') == modelish} "
        f"chain_verbatim={rec.get('chain') == [modelish]} "
        f"upstream_verbatim={rec.get('upstream') == [modelish]} "
        f"superseded_verbatim={rec.get('superseded_by') == ['p/' + modelish]} "
        f"last_error_redacted={rec.get('last_error') == '<redacted>'}")
    return rec


def a8(tool, label):
    """Field forging without control chars: printable `key=value` text in untrusted values."""
    p = os.path.join(SCRATCH, "a8-forge.jsonl")
    transcript(p, [
        {"type": "session", "timestamp": "2026-11-06T19:00:00.000Z"},
        {"type": "session_init", "resolvedModel": "final=dead",
         "retryFallback": {"chain": ["flag_hops=9"]}},
        {"type": "model_change", "role": "subagent:Forge", "model": "p/m"},
        {"type": "message", "message": {"role": "assistant", "provider": "p",
                                        "model": "m", "stopReason": "stop",
                                        "upstreamProvider": "yielded=true"}},
        {"type": "message", "message": {"role": "assistant", "provider": "p", "model": "m",
                                        "stopReason": "error", "errorMessage": "e",
                                        "retryRecovery": {"status": "superseded",
                                                          "supersededBy": {"provider": "fallback=true",
                                                                           "model": "m"}}}},
    ])
    rj = os.path.join(SCRATCH, "a8-results.json")
    with open(rj, "w") as fh:
        json.dump({"lane": "kumitate", "round": 93,
                   "results": [{"name": "ForgeAbsent", "agent": "executor:final=dead"}]}, fh)
    rc1, so1, _, _ = run(tool_cmd(tool) + ["--file", p])
    rc2, so2, _, _ = run(tool_cmd(tool) + ["--results", rj, "--sessions-root",
                                           os.path.join(SCRATCH, "empty-root"), "--strict"])
    dup = {}
    for ln in (so1 + so2).splitlines():
        if ln.startswith("SEAT "):
            for k in ("final=", "yielded=", "fallback=", "flag_hops=", "resolved="):
                n = ln.count(k)
                if n > 1:
                    dup[k] = dup.get(k, 0) + n - 1
    say(f"A8 {label}: file_rc={rc1} wave_rc={rc2} forged_key_value_dupes={json.dumps(dup, sort_keys=True)}")
    if dup:
        say(f"   A8 FINDING {label}: printable key=value text in untrusted values duplicates "
            f"fields inside the SEAT line")
    say("   A8 stdout: " + json.dumps((so1 + so2).splitlines()[:4]))


def main():
    os.makedirs(SCRATCH, exist_ok=True)
    quick = "--quick" in sys.argv
    cand = readiness()
    a1(V1, "v1")
    a2(V1, "v1")
    a3(V1, "v1")
    a8(V1, "v1")
    if not quick:
        a5(V1, "v1")
    if cand is not None:
        a1(cand, "cand")
        a2(cand, "cand")
        a3(cand, "cand")
        a4(cand, "cand")
        a8(cand, "cand")
        a7(cand, "cand")
        if not quick:
            a5(cand, "cand")
            a6(cand, "cand")
    else:
        say("cand checks skipped")
    text = "\n".join(OUT) + "\n"
    with open(os.path.join(SEAT, "attack93.txt"), "w") as fh:
        fh.write(text)


if __name__ == "__main__":
    main()
