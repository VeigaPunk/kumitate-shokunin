#!/usr/bin/env python3
"""m2-teeth.py <M2 sources-check.mjs> <scratch> — do the M2 arms kill the shapes that survived M's suite?

Each shape is an L1 re-construction of a K99Mutation survivor or K99CriticA HELD construction, applied to the M2 bytes.
Prints one line per shape (KILLED/SURVIVED + the failing r99trim arms) and `M2_TEETH: killed=K/N reference=PASS|FAIL`.
"""
import os, pathlib, re, shutil, subprocess, sys

LANE = '/home/vgpnk/Projects/shokunin/kumitate-shokunin'
src = pathlib.Path(sys.argv[1]).read_text()
scr = pathlib.Path(sys.argv[2]); scr.mkdir(parents=True, exist_ok=True)
TRIM = "function trim(value) { return value.replace(/^[ \\t]+|[ \\t]+$/g, ''); }"
assert src.count(TRIM) == 1
def t(body): return src.replace(TRIM, "function trim(value) { return " + body + "; }")
ID_FORM = "    } else add('error', 'ID_FORM', 'corpus/SOURCES.md', index + 1, `id=${id || '(empty)'}`);"
assert src.count(ID_FORM) == 1, 'ID_FORM line'
EMPTY = "    if (id === '') {"
assert src.count(EMPTY) == 1
TEXT = "      scope: trim(fields[5]),"
assert src.count(TEXT) == 1
READ = "  const sourceLines = sourceText.split(/\\r?\\n/).map(normalizeMarkdownIndent);"
assert src.count(READ) == 1
shapes = {
    'm15-nocaret (unanchored trim)': t("value.replace(/[ \\t]+|[ \\t]+$/g, '')"),
    'm23-idform-empty (non-blank pad-only id reported empty)': src.replace(ID_FORM, ID_FORM.replace("${id || '(empty)'}", "${id.trim() || '(empty)'}")),
    'k01 blank+NUL': t("value.replace(/^[ \\t\\x00]+|[ \\t\\x00]+$/g, '')"),
    'k02 blank+U+0080': t("value.replace(/^[ \\t\\x80]+|[ \\t\\x80]+$/g, '')"),
    'k03 blank cap {1,17}': t("value.replace(/^[ \\t]{1,17}|[ \\t]{1,17}$/g, '')"),
    'k04 JS trim on text cells': src.replace(TEXT, "      scope: fields[5].trim(),").replace("      teaches: trim(fields[7]),", "      teaches: fields[7].trim(),"),
    'k08 empty-id rows counted': src.replace(EMPTY, "    if (id === '') { counts.rows += 1;"),
    'k09 BOM sniff (JS trim when file starts with U+FEFF)': src.replace(READ, READ + "\n  const r99Bom = sourceText.startsWith('\\ufeff');").replace(
        "    const id = trim(fields[1] ?? '');", "    const id = r99Bom ? (fields[1] ?? '').trim() : trim(fields[1] ?? '');"),
    'BASE JS trim': t("value.trim()"),
}
env = {**os.environ, 'TMPDIR': str(scr), 'SHOKUNIN_ROOT': '/home/vgpnk/Projects/shokunin'}
def run(name, text):
    d = scr / re.sub(r'[^a-z0-9]+', '-', name.lower())
    (d / 'scripts').mkdir(parents=True, exist_ok=True)
    (d / 'scripts' / 'sources-check.mjs').write_text(text)
    for h in ('cap-spawn.mjs', 'cap-run.mjs'):
        shutil.copy(f'{LANE}/scripts/{h}', d / 'scripts' / h)
    r = subprocess.run(['node', str(d / 'scripts' / 'sources-check.mjs'), '--selftest'], capture_output=True, text=True, env=env, timeout=600)
    tally = next((l for l in r.stdout.splitlines() if l.startswith('SOURCES_SELFTEST:')), '?')
    fails = [l.split(':')[0][5:] for l in r.stdout.splitlines() if l.startswith('FAIL ')]
    return r.returncode, tally, fails
rc, tally, _ = run('reference', src)
ref = 'PASS' if rc == 0 else 'FAIL'
print(f'reference exit={rc} {tally}')
killed = 0
for name, text in shapes.items():
    assert text != src, name
    rc, tally, fails = run(name, text)
    killed += rc != 0
    print(f"{name}: {'KILLED' if rc else 'SURVIVED'} exit={rc} {tally} failing=[{', '.join(fails)[:240]}]")
print(f"M2_TEETH: killed={killed}/{len(shapes)} reference={ref}")
shutil.rmtree(scr, ignore_errors=True)
