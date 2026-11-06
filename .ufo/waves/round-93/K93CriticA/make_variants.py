#!/usr/bin/env python3
"""make_variants.py — K93CriticA: derive wrong-but-plausible constructions from base.py, each wrong on
ONE v2 definition. Every variant is a full standalone file (no import of base/oracle at runtime).
Writes t-*.py into this seat dir and a manifest with each variant's single defect."""
import os

HERE = os.path.dirname(os.path.abspath(__file__))
BASE = open(os.path.join(HERE, "base.py")).read()

VARIANTS = {
    # 1. captured read as the LAST matching model_change instead of the first.
    "t-captured-last": [
        ("""        if r.get("type") == "model_change" and r.get("role") == sub:
            captured = r.get("model") if isinstance(r.get("model"), str) else None
            break""",
         """        if r.get("type") == "model_change" and r.get("role") == sub:
            captured = r.get("model") if isinstance(r.get("model"), str) else None"""),
        ("""            if r.get("type") == "model_change" and r.get("role") in (None, "default"):
                captured = r.get("model") if isinstance(r.get("model"), str) else None
                break""",
         """            if r.get("type") == "model_change" and r.get("role") in (None, "default"):
                captured = r.get("model") if isinstance(r.get("model"), str) else None"""),
    ],
    # 2. a subagent model_change with a non-string model is skipped, not terminal.
    "t-captured-skip-nonstring": [
        ("""        if r.get("type") == "model_change" and r.get("role") == sub:
            captured = r.get("model") if isinstance(r.get("model"), str) else None
            break""",
         """        if (r.get("type") == "model_change" and r.get("role") == sub
                and isinstance(r.get("model"), str)):
            captured = r.get("model")
            break"""),
    ],
    # 3. resolvedModel "" reads as null instead of the empty string.
    "t-resolved-empty-null": [
        ("""            resolved = rm if isinstance(rm, str) else None""",
         """            resolved = rm if isinstance(rm, str) and rm else None"""),
    ],
    # 4. chain taken from the LAST session_init row instead of the first (resolved stays first).
    "t-chain-last": [
        ("""    resolved, chain = None, None
    for r in rows:
        if r.get("type") == "session_init":
            rm = r.get("resolvedModel")
            resolved = rm if isinstance(rm, str) else None
            rf = r.get("retryFallback")
            if isinstance(rf, dict) and isinstance(rf.get("chain"), list):
                chain = [c for c in rf["chain"] if isinstance(c, str)]
            break""",
         """    resolved, chain, first_si = None, None, True
    for r in rows:
        if r.get("type") != "session_init":
            continue
        if first_si:
            rm = r.get("resolvedModel")
            resolved = rm if isinstance(rm, str) else None
            first_si = False
        rf = r.get("retryFallback")
        chain = ([c for c in rf["chain"] if isinstance(c, str)]
                 if isinstance(rf, dict) and isinstance(rf.get("chain"), list) else None)"""),
    ],
    # 5. recovered_attempts counted on every turn, served turns included.
    "t-recovered-all-turns": [
        ("""                if rr.get("status") == "recovered":
                    recovered += 1""",
         """                if rr.get("status") == "recovered":
                    pass"""),
        ("""    if not turns:
        final = "silent\"""",
         """    recovered = sum(1 for m in turns if isinstance(m.get("retryRecovery"), dict)
                    and m["retryRecovery"].get("status") == "recovered")
    if not turns:
        final = "silent\""""),
    ],
    # 6. error_attempts counts only attempts that were not superseded.
    "t-err-excl-superseded": [
        ("""        elif sr == "error":
            error_attempts += 1""",
         """        elif sr == "error":
            if not (isinstance(m.get("retryRecovery"), dict)
                    and m["retryRecovery"].get("status") == "superseded"):
                error_attempts += 1"""),
    ],
    # 7. superseded_by read from the LAST error turn only (list overwritten, not accumulated).
    "t-superseded-last": [
        ("""                if isinstance(sb, dict):
                    add(superseded, pm(sb))""",
         """                if isinstance(sb, dict):
                    superseded = [pm(sb)]"""),
    ],
    # 8. upstream reported sorted instead of first-seen order.
    "t-upstream-sorted": [
        ("""    if not turns:
        final = "silent\"""",
         """    upstream = sorted(set(upstream))
    if not turns:
        final = "silent\""""),
    ],
    # 9. last_error read from the FIRST error turn instead of the last.
    "t-last-error-first": [
        ("""            error_attempts += 1
            last_error = head(m.get("errorMessage"))""",
         """            error_attempts += 1
            if last_error is None:
                last_error = head(m.get("errorMessage"))"""),
    ],
}

for name, edits in VARIANTS.items():
    text = BASE
    for old, new in edits:
        if text.count(old) != 1:
            raise SystemExit("%s: anchor count %d for %r" % (name, text.count(old), old[:60]))
        text = text.replace(old, new)
    if text == BASE:
        raise SystemExit("%s: no edit applied" % name)
    path = os.path.join(HERE, name + ".py")
    with open(path, "w") as fh:
        fh.write(text)
    print("wrote %s (%d bytes, %d edit(s))" % (path, len(text), len(edits)))
