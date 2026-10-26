#!/usr/bin/env python3
"""clean.py — clean-room second implementation of contract kumitate-report-receipt-diff-v2.

Written from the contract header comment of scripts/report-receipt-diff.mjs (lines 1-35) and
the QUALITY.md Q61 row only; the tool's code was not read.  Same CLI:

  clean.py --lane <lane-dir> --round N --report <file> [--rev <lane-rev>] [--fleet <fleet-dir>]

Findings (ids exactly as the contract names them): PLACEHOLDER, TALLY_UNRECEIPTED,
TALLY_CHECKS_MISMATCH, RECEIPT_MISSING, RECEIPT_EMPTY, HASH_DEAD, HASH_ORPHAN,
SECTION_MISSING, SHONEN_COUNT.  Exit 0 CLEAN / 1 DRIFT / 2 fail-closed / 64 usage.
stdlib only.
"""
import os
import re
import subprocess
import sys

SECTIONS = [
    'Work performed',
    'Landed changes',
    'Before → after measurements',
    'Sources & frontier',
    'Trend verdicts',
    'SHONEN',
]

USAGE = ('usage: clean.py --lane <lane-dir> --round N --report <file> '
         '[--rev <lane-rev>] [--fleet <fleet-dir>]')


def die(code, msg):
    if msg:
        sys.stderr.write(msg + '\n')
    sys.exit(code)


def parse_args(argv):
    opts = {'lane': None, 'round': None, 'report': None, 'rev': None, 'fleet': None,
            'angle': 'literal', 'boxes': 'lines', 'tally': 'strict',
            'hash': 'literal'}
    i = 0
    while i < len(argv):
        a = argv[i]
        if a in ('-h', '--help'):
            die(64, USAGE)
        if not a.startswith('--'):
            die(64, 'unexpected argument: %s\n%s' % (a, USAGE))
        if '=' in a:
            name, val = a[2:].split('=', 1)
            i += 1
        else:
            name = a[2:]
            if i + 1 >= len(argv):
                die(64, 'missing value for --%s\n%s' % (name, USAGE))
            val = argv[i + 1]
            i += 2
        if name not in opts:
            die(64, 'unknown option --%s\n%s' % (name, USAGE))
        opts[name] = val
    if not opts['lane'] or not opts['round'] or not opts['report']:
        die(64, USAGE)
    if not re.fullmatch(r'\d+', opts['round']):
        die(64, '--round must be an integer\n' + USAGE)
    opts['round'] = int(opts['round'])
    return opts


def run(argv, cwd=None):
    return subprocess.run(argv, cwd=cwd, capture_output=True, text=True)


def git_ok(lane, *args):
    r = run(['git', '-C', lane] + list(args))
    return r.returncode == 0, r.stdout


# ---------------------------------------------------------------- prose / fences

def strip_fences(text):
    """Blank out fenced code blocks: a heading inside a fence is a quotation."""
    out = []
    fence = None
    for line in text.split('\n'):
        m = re.match(r'^\s*(`{3,}|~{3,})', line)
        if m:
            mark = m.group(1)[0]
            if fence is None:
                fence = mark
                out.append('')
                continue
            if fence == mark:
                fence = None
                out.append('')
                continue
        out.append('' if fence is not None else line)
    return out


HEADING_RE = re.compile(r'^(#{1,6})\s*\**\s*(.+?)\s*\**\s*$')


def heading_of(line):
    m = HEADING_RE.match(line)
    if not m:
        return None
    return len(m.group(1)), m.group(2)


def norm_heading(s):
    return re.sub(r'\s+', ' ', s).strip().lower()


def find_headings(prose_lines, name):
    want = norm_heading(name)
    hits = []
    for idx, line in enumerate(prose_lines):
        h = heading_of(line)
        if h and norm_heading(h[1]) == want:
            hits.append((idx, h[0]))
    return hits


BOX_RE = re.compile(r'^\s*[-*+]\s+`?\[[ xX~!\-/]\]`?')
BOX_ANY_RE = re.compile(r'`?\[[ xX~!\-/]\]`?')


# ---------------------------------------------------------------- findings

def placeholders(text, angle_mode='literal'):
    """PLACEHOLDER: a template token left in the report.  Contract list:
    __name__, {{NAME}}, XXXX, "to be filled", <measured>, LANE_HASH, TBD;
    the command-template arguments <tip>/<lane>/<rev> are not flagged.

    angle_mode=literal reads the parenthetical as an enumeration (only <measured>,
    case-insensitive); angle_mode=general reads the exclusion clause as licensing
    any lower-case angle-bracket word except <tip>/<lane>/<rev>."""
    pats = [
        ('dunder', re.compile(r'__[A-Za-z][A-Za-z0-9_]*__')),
        ('braces', re.compile(r'\{\{[^{}\n]{1,80}\}\}')),
        ('xxxx', re.compile(r'\bX{3,}\b')),
        ('to-be-filled', re.compile(r'to\s+be\s+filled', re.I)),
        ('angle', re.compile(r'<([A-Za-z][A-Za-z0-9_-]*)>')),
        ('lane-hash', re.compile(r'\bLANE_HASH\b')),
        ('tbd', re.compile(r'\bTBD\b')),
    ]
    allowed_angle = {'tip', 'lane', 'rev'}
    hits = []
    for kind, pat in pats:
        for m in pat.finditer(text):
            if kind == 'angle':
                word = m.group(1)
                if angle_mode == 'literal' and word.lower() != 'measured':
                    continue
                if word.lower() in allowed_angle:
                    continue
            hits.append((m.start(), kind, m.group(0)))
    hits.sort()
    return [h for h in hits]


TALLY_RE = re.compile(
    r'([A-Za-z][A-Za-z0-9_]*_(?:HELD|UNMET))\s*held\s*=\s*(\d+)\s*/\s*(\d+)',
    re.I)
CHECKS_RE = re.compile(r'checks\s*=\s*(\d+)', re.I)
RECEIPT_PATH_RE = re.compile(
    r'\.ufo/waves/round-(\d+)/(?:base|close)/[^\s`\'"<>()\[\],;]+')


ZERO_WIDTH = '\u200b\u200c\u200d\ufeff'


def normalize_tally(text, mode):
    """mode=strict: contract words only (case/spacing).  mode=relaxed: also strip
    zero-width characters and let a table cell boundary stand in for spacing."""
    if mode == 'relaxed':
        for ch in ZERO_WIDTH:
            text = text.replace(ch, '')
        text = re.sub(r'\|', ' ', text)
    return text


def tallies(text, round_no, mode='strict'):
    """Yield (label, x, y, checks_or_None, line_text) for each labelled verdict."""
    text = normalize_tally(text, mode)
    out = []
    lines = text.split('\n')
    offsets = []
    pos = 0
    for line in lines:
        offsets.append(pos)
        pos += len(line) + 1
    for m in TALLY_RE.finditer(text):
        start = m.start()
        li = 0
        for k, off in enumerate(offsets):
            if off <= start:
                li = k
            else:
                break
        line = lines[li]
        # the checks= that belongs to this claim is the nearest one after it on its line
        cm = CHECKS_RE.search(line, max(0, start - offsets[li] + (m.end() - m.start())))
        out.append((m.group(1), int(m.group(2)), int(m.group(3)),
                    int(cm.group(1)) if cm else None, line))
    return out


def receipt_paths(text, round_no):
    """Unique `.ufo/waves/round-N/(base|close)/<file>` paths the report names."""
    seen = []
    for m in RECEIPT_PATH_RE.finditer(text):
        if int(m.group(1)) != round_no:
            continue
        p = m.group(0).rstrip('.').rstrip(',')
        if p not in seen:
            seen.append(p)
    return seen


HASH_RE = re.compile(r'(?<![0-9a-fA-F])[0-9a-fA-F]{39,40}(?![0-9a-fA-F])')


def is_url_component(text, pos):
    """hash mode=url: a hash that is a path component of a URL is not a commit claim."""
    if pos == 0 or text[pos - 1] != '/':
        return False
    lo = pos
    while lo > 0 and not text[lo - 1].isspace() and text[lo - 1] not in '`\'"<>()':
        lo -= 1
    word = text[lo:pos]
    return '://' in word or bool(re.match(r'^[A-Za-z0-9.-]+\.[A-Za-z]{2,}/', word))


# ---------------------------------------------------------------- receipt reading

def read_receipts(lane, round_no, rev):
    """Return dict path -> {'symlink': bool, 'dir': bool, 'bytes': bytes|None}."""
    prefix = '.ufo/waves/round-%d/' % round_no
    if rev:
        ok, _ = git_ok(lane, 'rev-parse', '--verify', '--quiet', rev + '^{commit}')
        if not ok:
            die(2, 'clean.py: cannot resolve rev %s in %s' % (rev, lane))
        r = run(['git', '-C', lane, 'ls-tree', '-r', '-z', '--full-tree', rev,
                 '--', prefix + 'base', prefix + 'close'])
        if r.returncode != 0:
            die(2, 'clean.py: ls-tree failed: %s' % r.stderr.strip())
        entries = {}
        for rec in r.stdout.split('\0'):
            if not rec:
                continue
            meta, path = rec.split('\t', 1)
            mode, typ, sha = meta.split()
            entries[path] = {'mode': mode, 'type': typ, 'sha': sha,
                             'symlink': mode == '120000', 'dir': typ == 'tree',
                             'bytes': None}
        for path, e in entries.items():
            if e['type'] == 'blob':
                g = run(['git', '-C', lane, 'cat-file', 'blob', e['sha']])
                e['bytes'] = g.stdout.encode()
        return entries
    root = os.path.join(lane, prefix)
    entries = {}
    for sub in ('base', 'close'):
        d = os.path.join(root, sub)
        if not os.path.isdir(d):
            continue
        for dirpath, dirnames, filenames in os.walk(d):
            for name in sorted(dirnames) + sorted(filenames):
                full = os.path.join(dirpath, name)
                rel = os.path.relpath(full, lane).replace(os.sep, '/')
                is_link = os.path.islink(full)
                is_dir = os.path.isdir(full) and not is_link
                data = None
                if not is_dir and not is_link:
                    try:
                        with open(full, 'rb') as fh:
                            data = fh.read()
                    except OSError:
                        data = None
                entries[rel] = {'symlink': is_link, 'dir': is_dir, 'bytes': data,
                                'type': 'blob' if not is_dir else 'tree'}
    return entries


def main(argv):
    opts = parse_args(argv)
    lane, round_no, report, rev, fleet = (opts['lane'], opts['round'], opts['report'],
                                          opts['rev'], opts['fleet'])
    box_mode = opts['boxes']
    try:
        with open(report, 'rb') as fh:
            raw = fh.read()
    except OSError as exc:
        die(2, 'clean.py: cannot read report %s: %s' % (report, exc))
    text = raw.decode('utf-8', 'replace')
    nbytes = len(raw)

    receipts = read_receipts(lane, round_no, rev)
    prose = strip_fences(text)

    findings = []  # (id, message)

    for pos, kind, tok in placeholders(text, opts['angle']):
        line_no = text.count('\n', 0, pos) + 1
        findings.append(('PLACEHOLDER', '%s token %r at line %d' % (kind, tok, line_no)))

    # sections
    for name in SECTIONS:
        if not find_headings(prose, name):
            findings.append(('SECTION_MISSING', 'heading %r absent from prose' % name))
    shonen = find_headings(prose, 'SHONEN')
    if len(shonen) != 1:
        findings.append(('SHONEN_COUNT', 'SHONEN heading occurs %d times in prose'
                         % len(shonen)))
    else:
        idx, level = shonen[0]
        boxes = 0
        for line in prose[idx + 1:]:
            h = heading_of(line)
            if h and h[0] <= level:
                break
            if BOX_RE.match(line):
                boxes += len(BOX_ANY_RE.findall(line)) if box_mode == 'boxes' else 1
        if boxes < 4:
            findings.append(('SHONEN_COUNT', 'SHONEN section has %d box lines (%s)'
                             % (boxes, box_mode)))

    # receipts named by the report
    named = receipt_paths(text, round_no)
    for path in named:
        if '..' in path.split('/'):
            findings.append(('RECEIPT_MISSING', '%s escapes the round tree' % path))
            continue
        if '*' in path or '?' in path:
            rx = re.compile('^' + re.escape(path).replace(r'\*', '[^/]*')
                            .replace(r'\?', '[^/]') + '$')
            matches = [p for p in receipts if rx.match(p)]
            if not matches:
                findings.append(('RECEIPT_MISSING', 'glob %s matches nothing' % path))
            continue
        e = receipts.get(path)
        if e is None:
            findings.append(('RECEIPT_MISSING', '%s does not exist at %s'
                             % (path, rev or 'worktree')))
        elif e.get('symlink'):
            findings.append(('RECEIPT_MISSING', '%s is a symlink' % path))
        elif e.get('dir'):
            findings.append(('RECEIPT_MISSING', '%s is a directory' % path))
        elif not e.get('bytes'):
            findings.append(('RECEIPT_EMPTY', '%s carries no bytes' % path))

    # tallies
    all_receipt_text = {}
    for p, e in receipts.items():
        if e.get('bytes') and not e.get('symlink'):
            all_receipt_text[p] = e['bytes'].decode('utf-8', 'replace')
    for label, x, y, checks, line in tallies(text, round_no, opts['tally']):
        cited = [p for p in named if p in line]
        cands = cited if cited else list(all_receipt_text)
        carried = []
        for p in cands:
            body = all_receipt_text.get(p)
            if body is None:
                continue
            for rl, rx, ry, rchk, _ in tallies(body, round_no, opts['tally']):
                if rl.lower() == label.lower() and rx == x and ry == y:
                    carried.append((p, rchk))
        if not carried:
            scope = ('cited receipts %s' % ','.join(cited)) if cited else 'any receipt'
            findings.append(('TALLY_UNRECEIPTED',
                             '%s held=%d/%d not carried by %s' % (label, x, y, scope)))
        elif checks is not None:
            for p, rchk in carried:
                if rchk is not None and rchk != checks:
                    findings.append(('TALLY_CHECKS_MISMATCH',
                                     '%s held=%d/%d checks=%d but %s carries checks=%d'
                                     % (label, x, y, checks, p, rchk)))
                    break

    # hashes
    lane_is_repo, _ = git_ok(lane, 'rev-parse', '--git-dir')
    fleet_is_repo = False
    if fleet:
        fleet_is_repo, _ = git_ok(fleet, 'rev-parse', '--git-dir')
    resolved_rev = None
    if rev and lane_is_repo:
        ok, out = git_ok(lane, 'rev-parse', '--verify', '--quiet', rev + '^{commit}')
        resolved_rev = out.strip() if ok else None
    seen_hash = set()
    for m in HASH_RE.finditer(text):
        h = m.group(0)
        if opts['hash'] == 'url' and is_url_component(text, m.start()):
            continue
        if h.lower() in seen_hash:
            continue
        seen_hash.add(h.lower())
        in_lane = False
        if lane_is_repo:
            ok, _ = git_ok(lane, 'cat-file', '-e', h + '^{commit}')
            in_lane = ok
        in_fleet = False
        if fleet_is_repo:
            ok, _ = git_ok(fleet, 'cat-file', '-e', h + '^{commit}')
            in_fleet = ok
        if not in_lane and not in_fleet:
            findings.append(('HASH_DEAD', '%s resolves in neither repo' % h))
            continue
        if in_lane and len(h) == 40 and resolved_rev:
            ok, _ = git_ok(lane, 'merge-base', '--is-ancestor', h, resolved_rev)
            if not ok:
                findings.append(('HASH_ORPHAN', '%s is not an ancestor of %s'
                                 % (h, resolved_rev)))

    ids = sorted({f[0] for f in findings})
    if not ids:
        print('REPORT_RECEIPT: CLEAN (round=%d rev=%s bytes=%d)'
              % (round_no, rev or 'worktree', nbytes))
        return 0
    print('REPORT_RECEIPT: DRIFT %s (round=%d rev=%s bytes=%d)'
          % (','.join(ids), round_no, rev or 'worktree', nbytes))
    for fid, msg in findings:
        print('%s %s' % (fid, msg))
    return 1


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
