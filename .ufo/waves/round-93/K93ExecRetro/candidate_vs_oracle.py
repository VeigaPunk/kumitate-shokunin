#!/usr/bin/env python3
"""candidate_vs_oracle.py — diff the round-93 candidate against the frozen oracle on r85..r92.

Compares every oracle field type-strictly (ints are ints, bools are bools, lists are lists) and
`session` after realpath, per the probe's own rule. Records the candidate's sha256 so a later
byte change invalidates the receipt.

  python3 candidate_vs_oracle.py <candidate.mjs> <scratch>
"""
import hashlib, json, os, subprocess, sys

WAVES = list(range(85, 93))
FIELDS = ["captured", "answered", "error_attempts", "recovered_attempts", "superseded_by", "upstream",
          "resolved", "chain", "flag_hops", "revert_hops", "aborted", "fallback", "final",
          "last_error", "yielded", "parse_errors"]


def main(tool, scratch):
    lane = "/home/vgpnk/Projects/shokunin/kumitate-shokunin"
    sha = hashlib.sha256(open(tool, "rb").read()).hexdigest()
    print("candidate=%s sha256=%s" % (tool, sha))
    agree = disagree = seats = 0
    per_wave = {}
    for n in WAVES:
        res = "%s/.ufo/waves/round-%d/w1-results.json" % (lane, n)
        orec = json.load(open(os.path.join(scratch, "o%d.json" % n)))
        cpath = os.path.join(scratch, "c%d.json" % n)
        p = subprocess.run(["node", tool, "--results", res, "--json"], capture_output=True, text=True)
        open(cpath, "w").write(p.stdout)
        if p.returncode != 0:
            print("r%d CANDIDATE_EXIT %d %s" % (n, p.returncode, p.stderr.strip()[:160]))
            disagree += 1
            continue
        try:
            crec = json.loads(p.stdout)
        except Exception as e:
            print("r%d CANDIDATE_BAD_JSON %s" % (n, e))
            disagree += 1
            continue
        by = {r.get("seat"): r for r in crec if isinstance(r, dict)}
        wok = wbad = 0
        for o in orec:
            seats += 1
            got = by.get(o["seat"])
            if got is None:
                print("r%d MISSING %s" % (n, o["seat"]))
                wbad += 1
                continue
            if isinstance(got.get("session"), str):
                got = dict(got, session=os.path.realpath(got["session"]))
            for f in FIELDS:
                a, b = got.get(f, "<missing>"), o[f]
                if type(a) is not type(b) or a != b:
                    print("r%d DISAGREE %s %s cand=%r oracle=%r" % (n, o["seat"], f, a, b))
                    wbad += 1
                else:
                    wok += 1
            if isinstance(got.get("session"), str) and got["session"] != os.path.realpath(o["session"]):
                print("r%d DISAGREE %s session cand=%r oracle=%r" % (n, o["seat"], got["session"], o["session"]))
                wbad += 1
        if len(crec) != len(orec):
            print("r%d RECORD_COUNT cand=%d oracle=%d" % (n, len(crec), len(orec)))
            wbad += 1
        agree += wok
        disagree += wbad
        per_wave[n] = (wok, wbad)
    print("CANDIDATE_VS_ORACLE: waves=%d seats=%d fields_agree=%d fields_disagree=%d" %
          (len(WAVES), seats, agree, disagree))
    print("PER_WAVE: " + " ".join("r%d=%d/%d" % (n, a, a + b) for n, (a, b) in per_wave.items()))
    return 0 if disagree == 0 else 1


if __name__ == "__main__":
    sys.exit(main(sys.argv[1], sys.argv[2]))
