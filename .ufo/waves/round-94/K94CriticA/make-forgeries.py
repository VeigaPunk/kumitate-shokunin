#!/usr/bin/env python3
"""make-forgeries.py — K94CriticA wrong-but-plausible gates for the frozen C1 counter.

Usage: python3 make-forgeries.py <base round-gate.mjs> <out dir>

Each file is the frozen BASE round-gate (sha256 09d4d792...) with ONE patch class:
a `declared` array plus a declared rule wired into the citation scan. Variants marked
`RULE:` differ from the frozen rule on purpose. Every patch anchor is asserted once.
"""
import hashlib
import os
import sys

base_path, out = sys.argv[1], sys.argv[2]
base = open(base_path, encoding='utf-8').read()
assert hashlib.sha256(base.encode()).hexdigest() == \
    '09d4d79238f44dd74a0fa727c8f6b193c3fa87200c02340e2f4b3dcc6b354594', 'base drift'

INIT_OLD = "  const citations = {\n    checked: 0, external: [], unresolved: [], notAncestor: [], unverifiable: [],\n"
INIT_NEW = "  const citations = {\n    checked: 0, external: [], declared: [], unresolved: [], notAncestor: [], unverifiable: [],\n"
LOOP_OLD = "      } else if (mainProbeableNow() && originProbeableNow()) {\n        citations.unresolved.push(t);\n"
FN_ANCHOR = "function runChecks({ repo, reportsDir, round, lane, close, mainRepo, origin }) {\n"


def loop_new(cond):
    return ("      } else if (" + cond + ") {\n        citations.declared.push(t);\n" + LOOP_OLD)


def pins_fn(row_re=r"^ {0,3}\|\s*S\d{3,}\s*\|",
            status_test="/^rejected$/i.test(cells[8] ?? '')",
            splitter=r"/[/?#]/",
            url_re=r"https?:\/\/[^\s|)`'\"<>]+",
            hex_anywhere=False):
    """declaredPins94(dir): 40-hex path segments of http(s) URLs on live registry rows."""
    pred = ("    for (const m of line.matchAll(/" + url_re + "/g)) {\n"
            "      for (const seg of m[0].split(" + splitter + ")) if (/^[0-9a-f]{40}$/.test(seg)) pins.push(seg);\n"
            "    }\n")
    if hex_anywhere:
        pred = ("    for (const m of line.matchAll(/[0-9a-f]{40}/g)) pins.push(m[0]);\n")
    return ("function declaredPins94(dir) {\n"
            "  const pins = [];\n"
            "  const text = readText(join(dir, 'corpus', 'SOURCES.md'));\n"
            "  if (text === null) return pins;\n"
            "  for (const line of text.split('\\n')) {\n"
            "    if (!/" + row_re + "/.test(line)) continue;\n"
            "    const cells = line.split('|').map((c) => c.trim());\n"
            "    if (" + status_test + ") continue;\n"
            + pred +
            "  }\n"
            "  return pins;\n"
            "}\n\n")


def build(fn, cond):
    s = base
    for old, new in ((INIT_OLD, INIT_NEW), (LOOP_OLD, loop_new(cond)), (FN_ANCHOR, fn + FN_ANCHOR)):
        assert s.count(old) == 1, (old[:60], s.count(old))
        s = s.replace(old, new)
    return s


POS = "declaredPins94(repo).some((p) => p.startsWith(t))"

# --- construction 1: RULE token length >= 8 (the rule's token floor is 7) --------------
c_len8 = build(pins_fn(), "t.length >= 8 && " + POS)

# --- construction 2: RULE hardcode the round-93 pin, no registry read -----------------
c_hard = build("", "t === '79fa222e' || t === '79fa222e8390aed3494f4bc6746814e6c74c21cf'")

# --- construction 3: RULE every unresolvable token in round 93 is declared -----------
c_r93 = build("", "round === 93")

# --- construction 4: RULE registry read from --main-repo, not --repo -----------------
c_main = build(pins_fn(), "declaredPins94(mainRepo).some((p) => p.startsWith(t))")

# --- construction 5: RULE status cell must be `mined` (rule: anything but `rejected`) -
c_mined = build(pins_fn(status_test="!/^mined$/i.test(cells[8] ?? '')"), POS)

# --- construction 6: RULE split on / and # only (rule names `?` too) -----------------
c_noq = build(pins_fn(splitter=r"/[\/#]/"), POS)

# --- construction 7: RULE registry rows must start at column 0 (rule allows 0-3 sp) --
c_col0 = build(pins_fn(row_re=r"^\|\s*S\d{3,}\s*\|"), POS)

# --- construction 8: RULE whole row scanned for `rejected` (rule: the 8th column) ----
c_linescan = build(pins_fn(status_test="/rejected/i.test(line)"), POS)

# --- construction 9: RULE any 40-hex on the row, no http requirement -----------------
c_nonhttp = build(pins_fn(hex_anywhere=True), POS)

# --- construction 10: correct rule + an unrelated check weakened to always-true ------
c_unrel = build(pins_fn(), POS)
for old, new in (
    ("add('SCORECARD_PLAN_MISSING', 'warning', false, `no ## Planned section in ${scorecardPath}`);",
     "add('SCORECARD_PLAN_MISSING', 'warning', true, `no ## Planned section in ${scorecardPath}`);"),
    ("      const mentions = future.length > 0;\n      add('SCORECARD_PLAN_MISSING', 'warning', mentions, mentions",
     "      const mentions = future.length > 0;\n      add('SCORECARD_PLAN_MISSING', 'warning', true, mentions"),
):
    assert c_unrel.count(old) == 1, old[:60]
    c_unrel = c_unrel.replace(old, new)

# --- construction 11: correct rule + a bogus extra `declared` entry on round 93 -------
c_extra = build(pins_fn(), POS)
_old = "    citations.mainProbeable = mainProbeable;\n"
assert c_extra.count(_old) == 1
c_extra = c_extra.replace(_old, "    if (round === 93) citations.declared.push('deadbeef');\n" + _old)

# --- construction 12: correct rule + an unrelated threshold weakened 1024 -> 512 -----
# the 77 filed reports are 122 or >= 2256 bytes, and the selftest's thin fixture is far
# below 512, so neither (c) nor (e) can see the weakened REPORT_THIN check.
c_thin = build(pins_fn(), POS)
_old = "const REPORT_MIN_BYTES = 1024;\n"
assert c_thin.count(_old) == 1
c_thin = c_thin.replace(_old, "const REPORT_MIN_BYTES = 512;\n")

controls = {
    'w-thin512': c_thin,
    'w-extra-declared': c_extra,
    'w-len8': c_len8,
    'w-hardcode': c_hard,
    'w-round93': c_r93,
    'w-mainrepo': c_main,
    'w-minedonly': c_mined,
    'w-nosplit-q': c_noq,
    'w-col0': c_col0,
    'w-linescan-rejected': c_linescan,
    'w-nonhttp': c_nonhttp,
    'w-unrelated-plan-warning': c_unrel,
}

os.makedirs(out, exist_ok=True)
for name, text in controls.items():
    p = os.path.join(out, name + '.mjs')
    with open(p, 'w', encoding='utf-8') as f:
        f.write(text)
    print(name, hashlib.sha256(text.encode()).hexdigest())
