#!/usr/bin/env python3
"""Read only assigned round inputs; emit counts and filenames, never matches."""
import json
import re
from pathlib import Path

HERE = Path(__file__).resolve().parent
LANE = HERE.parents[4]
ROUND = LANE / '.ufo/waves/round-79'
PATTERNS = {
    'private_key': r'-----BEGIN (?:[A-Z0-9]+ )*PRIVATE KEY-----',
    'github_token': r'(?:ghp_|github_pat_)[A-Za-z0-9_]*',
    'sk_prefix': r'\bsk-[A-Za-z0-9_-]+',
    'aws_access_id': r'\bAKIA[A-Z0-9]*',
    'password_reference': r'op://[^\s<>"\x27`]+',
    'bearer': r'Bearer[ ]+[^\s<>"\x27`]*',
    'slack_token': r'\bxox[baprs]-[A-Za-z0-9-]*',
    'long_hex': r'(?<![A-Za-z0-9])[a-fA-F0-9]{32,}(?![A-Za-z0-9])',
    'long_base64': r'(?<![A-Za-z0-9+/])[A-Za-z0-9+/]{40,}={0,2}(?![A-Za-z0-9+/])',
    'session_cookie': r'(?i)(?:set-cookie\s*:|(?:session(?:id|_id)?|auth_token|access_token|refresh_token)\s*[=:]\s*["\x27]?[A-Za-z0-9_./+%-]{8,})',
    'username_home_path': r'/home/[^/\s<>"\x27`]+(?:/[^\s<>"\x27`]*)?',
}
files = [ROUND / name for name in ('plan.md', 'w1-spec.json', 'w1-dispatch.json')]
for folder in ('controls', 'open', 'probe', 'build/L1/captures'):
    files += sorted(p for p in (ROUND / folder).rglob('*') if p.is_file())
rows = []
for path in files:
    text = path.read_text(errors='replace')
    rows.append({'file': str(path.relative_to(LANE)), 'bytes': path.stat().st_size,
                 'counts': {k: len(re.findall(v, text)) for k, v in PATTERNS.items()}})
print(json.dumps({'patterns': PATTERNS, 'files': rows, 'total_files': len(files),
                  'totals': {k: sum(row['counts'][k] for row in rows) for k in PATTERNS}}, indent=2))
