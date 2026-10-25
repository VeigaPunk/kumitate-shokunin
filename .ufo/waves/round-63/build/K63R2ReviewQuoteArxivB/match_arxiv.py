#!/usr/bin/env python3
"""K63R2ReviewQuoteArxivB — independent matcher for arXiv 2512.08296v3 (live fetch).
Locates every number in the decision table + Limits of
corpus/knowledge/multi-agent-coordinator-topologies.md, with its section."""
import re
from html.parser import HTMLParser

SRC = '/tmp/kumitate-r63/K63R2ReviewQuoteArxivB/live.html'

def norm(s: str) -> str:
    reps = {
        '\u2212': '-', '\ufe63': '-', '\uff0d': '-', '\u2013': '-', '\u2014': '-',
        '\u2019': "'", '\u2018': "'", '\u201c': '"', '\u201d': '"', '\u00a0': ' ',
        '\u2264': '<=', '\u2265': '>=', '\u2248': '~', '\u00d7': 'x',
        '\u03b2': 'BETA', '\u03c3': 'SIGMA', '\u2260': '!=',
    }
    for k, v in reps.items():
        s = s.replace(k, v)
    s = re.sub(r'\\%', '%', s)
    s = re.sub(r'\\beta\b', 'BETA', s)
    s = re.sub(r'\\sigma\b', 'SIGMA', s)
    s = re.sub(r'\\(le|leq)\b', '<=', s)
    s = re.sub(r'\\(ge|geq)\b', '>=', s)
    s = re.sub(r'\\approx', '~', s)
    s = re.sub(r'\\pm', '+/-', s)
    s = re.sub(r'\\text\s*\{([^}]*)\}', r'\1', s)
    s = re.sub(r'\\,|\\;|\\!|\\quad|\\qquad|\\ ', ' ', s)
    s = re.sub(r'\\[A-Za-z]+', ' ', s)
    s = re.sub(r'[{}$]', '', s)
    s = re.sub(r'\s+', ' ', s)
    return s.strip()

class Extractor(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.sections = []
        self.cur_id = 'DOC'; self.cur_title = 'preamble'; self.buf = []
        self.title_depth = 0; self.title_buf = []
        self.math_depth = 0
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        cls = a.get('class', '')
        if tag == 'section':
            self.sections.append((self.cur_id, self.cur_title, norm(' '.join(self.buf))))
            self.cur_id = a.get('id', '?'); self.cur_title = ''
            self.buf = []
        elif tag == 'math':
            self.math_depth += 1
            alt = a.get('alttext')
            if alt: self.buf.append(' ' + alt + ' ')
        elif re.match(r'h[1-6]$', tag):
            if 'ltx_title' in cls:
                self.title_depth += 1; self.title_buf = []
    def handle_startendtag(self, tag, attrs):
        if tag == 'math':
            a = dict(attrs); alt = a.get('alttext')
            if alt: self.buf.append(' ' + alt + ' ')
    def handle_endtag(self, tag):
        if tag == 'math':
            self.math_depth = max(0, self.math_depth - 1)
        elif re.match(r'h[1-6]$', tag) and self.title_depth:
            self.title_depth -= 1
            t = norm(' '.join(self.title_buf))
            if t: self.cur_title = (self.cur_title + ' ' + t).strip()
            self.title_buf = []
    def handle_data(self, data):
        if self.math_depth: return
        if self.title_depth: self.title_buf.append(data)
        else: self.buf.append(data)

ITEMS = [
    ('N-260-experiments',      r'260\s+experiments|260'),
    ('N-mean-effect-0.3',      r'-\s?0\.3\s?%'),
    ('N-ci-lower-58.7',        r'58\.7'),
    ('N-ci-upper-77.2',        r'77\.2'),
    ('N-sigma-37.5',           r'37\.5'),
    ('N-thr-45pct',            r'45\s?%'),
    ('N-fin-cent-80.8',        r'80\.8'),
    ('N-fin-cent-0.631',       r'0\.631'),
    ('N-fin-sas-0.349',        r'0\.349'),
    ('N-fin-range-57',         r'\+\s?57(\.0)?\s?%|57\.0\s?%|57%'),
    ('N-bcp-dec-9.2',          r'9\.2'),
    ('N-bcp-cent-0.2',         r'0\.2\s?%'),
    ('N-wb-dec-5.6',           r'5\.6'),
    ('N-wb-1.2',               r'1\.2'),
    ('N-wb-range-11',          r'-\s?11\s?%|11\s?%'),
    ('N-wb-range-6',           r'\+\s?6\s?%|6\s?%'),
    ('N-fin-dec-74.5',         r'74\.5'),
    ('N-pc-ind-70',            r'-\s?70(\.0)?\s?%|70\.0\s?%|70%'),
    ('N-pc-cent-50.3',         r'50\.3'),
    ('N-pc-dec-41.5',          r'41\.5'),
    ('N-pc-hyb-39.1',          r'39\.1'),
    ('N-D-0.40',               r'0\.40|0\.4(?![0-9])'),
    ('N-beta-0.236',           r'0\.236'),
    ('N-p-0.004',              r'0\.004'),
    ('N-swe-2.1',              r'-\s?2\.1|2\.1'),
    ('N-swe-14.9',             r'14\.9'),
    ('N-tb-ind-1.7',           r'1\.7'),
    ('N-tb-ind-0.350',         r'0\.350'),
    ('N-tb-cent-19.2',         r'19\.2'),
    ('N-tb-cent-0.278',        r'0\.278'),
    ('N-tb-tools-2',           r'2\s+tools|two tools|tools per agent'),
    ('N-T-le-4',               r'T\s*<=\s*4|T\s*=\s*4'),
    ('N-beta-0.096',           r'0\.096'),
    ('N-p-0.002',              r'0\.002'),
    ('N-amp-1.0',              r'1\.0'),
    ('N-amp-4.4',              r'4\.4'),
    ('N-amp-5.1',              r'5\.1'),
    ('N-amp-7.8',              r'7\.8'),
    ('N-amp-17.2',             r'17\.2'),
    ('N-bcp-ind-35',           r'-\s?35\s?%|35\s?%'),
    ('N-isolates-parallelism', r'isolates the effect of parallelism'),
    ('N-pred-87',              r'87\s?%|87\.0|0\.87'),
    ('N-rand-20',              r'20\s?%'),
    ('N-cap-54',               r'54\s?%|0\.54'),
    ('N-six-benchmarks',       r'six benchmarks|6 benchmarks'),
    ('N-four-variants',        r'four\s+(multi-agent\s+)?(variants|architectures)|4\s+(multi-agent\s+)?(variants|architectures)'),
    ('N-20-instances',         r'20\s+instances|20-instance|instance subsets|subsets? of 20'),
    ('N-up-to-nine',           r'up to nine|nine agents|n\s*=\s*9|nine\b'),
    ('N-4800-tokens',          r'4,?\s?800'),
    ('N-superlinear',          r'superlinear'),
    ('N-identical-archs',      r'identical base|same base (architecture|model)|differing in scale|role prompts'),
    ('N-prompts-not-tuned',    r'not (been )?tuned|no per-model|without (model-specific|per-model) tuning|prompt tuning'),
    ('N-no-cost-latency',      r'wall-clock|latency|monetary cost|\bcost\b'),
    ('N-amplification',        r'amplification'),
    ('N-heldout',              r'held-out|heldout'),
    ('N-saturation-45-quote',  r'exceeds?\s+45\s?%|already exceeds'),
]

QUOTES = {
    'Q5': 'This suggests that sequential interdependence, rather than complexity alone, determines coordination viability.',
    'Q6': 'tool-rich environments amplify the coordination tax, making simpler architectures more effective',
    'Q7': 'tasks where single-agent performance already exceeds 45% accuracy experience negative returns from additional agents',
    'Q8': 'Centralized introduces hierarchical verification and bottleneck control.',
    'Q9': 'All MAS and SAS configurations were matched for total reasoning-token budget (mean 4,800 tokens per trial) and tool-call access to isolate coordination effects.',
    'Q10': 'Our framework systematically compares canonical coordination structures with preliminary exploration of scaling number of agents up to nine.',
}

def soft(s, tier):
    s = norm(s).lower()
    if tier == 1:
        s = re.sub(r"[^a-z0-9%,.\-+]+", ' ', s)
    else:
        s = re.sub(r'[^a-z0-9]+', ' ', s)
    return re.sub(r'\s+', ' ', s).strip()

def main():
    raw = open(SRC, encoding='utf-8', errors='replace').read()
    ex = Extractor(); ex.feed(raw)
    ex.sections.append((ex.cur_id, ex.cur_title, norm(' '.join(ex.buf))))
    secs = [(i, t, x) for (i, t, x) in ex.sections if x]
    print(f'== SECTIONS == count={len(secs)} total_chars={sum(len(x) for _,_,x in secs)}')
    for i, t, x in secs:
        print(f'SECTION id={i} title={t!r} len={len(x)}')
    print()
    for name, pat in ITEMS:
        rx = re.compile(pat)
        print(f'--- {name}  /{pat}/')
        n = 0
        for sid, ttl, txt in secs:
            for m in rx.finditer(txt):
                a = max(0, m.start()-130); b = min(len(txt), m.end()+130)
                print(f'  [{sid}] ({ttl}) ...{txt[a:b]}...')
                n += 1
                if n >= 12: break
            if n >= 12: break
        if n == 0: print('  NO MATCH')
    print()
    for qid, q in QUOTES.items():
        words = len(q.split())
        print(f'--- {qid} words={words} "{q}"')
        for tier in (1, 2):
            sq = soft(q, tier)
            hits = []
            for sid, ttl, txt in secs:
                st = soft(txt, tier)
                pos = st.find(sq)
                if pos >= 0:
                    hits.append((sid, ttl))
            if hits:
                print(f'  tier{tier} FOUND in: ' + '; '.join(f'[{i}] {t}' for i, t in hits[:4]))
                break
        else:
            print('  NOT FOUND in live text (either tier)')

if __name__ == '__main__':
    main()
