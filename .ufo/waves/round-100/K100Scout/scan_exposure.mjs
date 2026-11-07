#!/usr/bin/env node
/**
 * scan_exposure.mjs (K100Scout, round 100) -- fleet exposure scan for the two
 * SOURCES row-id readers, in exact ECMAScript semantics.
 *
 *   node scan_exposure.mjs <file>...        # one JSON blob on stdout
 *   SUMMARY=1 node scan_exposure.mjs ...    # omit the id lists
 *
 * For every file it reports:
 *   census   : the census row_pass model (gawk RS=LF; row gate `^ {0,3}\|`;
 *              id cell = field 2 trimmed of ASCII SP/TAB only; id `^S[0-9]{3,}$`;
 *              rows counted only inside `## Registry`)
 *   cite     : the cite-sources.mjs row reader (text.split('\n') then
 *              line.match(/.../), no `m` flag -> `^` anchors at record start)
 *   capture  : the source-capture.mjs row reader (raw.matchAll(/.../gm))
 *   exposure : class (i) breaker chars, (ii) non-0-3-SP indent on an id row,
 *              (iii) non-blank pad in a census id cell, plus reader/census
 *              id divergence.
 *
 * The two reader regexes are asserted verbatim against the lane sources.
 */
import { readFileSync } from 'node:fs';

const CITE_SRC = '/home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/cite-sources.mjs';
const CAP_SRC = '/home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/source-capture.mjs';

// ECMAScript line terminators (MDN Lexical grammar): LF, CR, LS, PS.
const BREAK_RE = new RegExp('[\\n\\r\\u2028\\u2029]');
// ECMAScript line terminators that are NOT LF (the census record separator).
const NON_LF_BREAK_RE = new RegExp('[\\r\\u2028\\u2029]');

function rowRegexFrom(src, label, expectInner, expectFlags) {
  const literal = '/' + expectInner + '/' + expectFlags;
  const lines = src.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(literal)) {
      return { literal, inner: expectInner, flags: expectFlags, line: i + 1,
               srcLine: lines[i].trim(), label };
    }
  }
  throw new Error(`literal ${literal} not found in ${label}`);
}

const citeRx = rowRegexFrom(readFileSync(CITE_SRC, 'utf8'), CITE_SRC,
  '^ {0,3}\\|\\s*(S[0-9]{3,})\\s*\\|', '');
const capRx = rowRegexFrom(readFileSync(CAP_SRC, 'utf8'), CAP_SRC,
  '^\\s*\\|\\s*(S[0-9]{3,})\\s*\\|', 'gm');
const citeRe = new RegExp(citeRx.inner, citeRx.flags);          // no `m`
const capRe = new RegExp(capRx.inner, capRx.flags);              // `gm`

// census helpers ---------------------------------------------------------
const trimCensus = (s) => s.replace(/^[ \t]+/, '').replace(/[ \t]+$/, '');
const ID_RE = /^S[0-9]{3,}$/;
const ROW_GATE = /^ {0,3}\|/;

const cp = (ch) => 'U+' + ch.codePointAt(0).toString(16).toUpperCase().padStart(4, '0');
const cps = (s) => [...s].map(cp).join('');

// leading / trailing whitespace run of a string, by JS \s plus U+0085 NEL
// (NEL is whitespace for the census' purposes but is NOT an ECMAScript
// WhiteSpace or LineTerminator, so the JS readers do not trim it)
const PAD_CLASS = '[\\s\u0085]';
const leadRun = (s) => { const m = new RegExp('^' + PAD_CLASS + '+').exec(s); return m ? m[0] : ''; };
const trailRun = (s) => { const m = new RegExp(PAD_CLASS + '+$').exec(s); return m ? m[0] : ''; };

function scanFile(path) {
  const raw = readFileSync(path, 'utf8');
  const records = raw.split('\n');           // gawk RS = LF
  const out = {
    file: path,
    records: records.length,
    censusRows: 0,          // row-gate rows inside ## Registry
    censusValidIds: [],     // in Registry, id valid
    censusInvalidIds: [],   // in Registry, id present but invalid (E02)
    censusOutsideIds: [],   // row-gate rows outside ## Registry (E12 shape)
    breakers: [],
    badIndent: [],
    nonBlankPad: [],
    intraRecordRows: [],
    citeIds: [],
    captureIds: [],
    captureCrossRecord: [],
  };
  let inRegistry = false;

  for (let i = 0; i < records.length; i++) {
    const line = records[i];
    const lineno = i + 1;

    // --- class (i): breaker characters --------------------------------
    for (let k = 0; k < line.length; k++) {
      const c = line.charCodeAt(k);
      if (c === 0x0d) {
        out.breakers.push({ line: lineno, col: k,
          kind: k === line.length - 1 ? 'CR-crlf-tail' : 'CR' });
      } else if (c === 0x2028) out.breakers.push({ line: lineno, col: k, kind: 'U+2028-LS' });
      else if (c === 0x2029) out.breakers.push({ line: lineno, col: k, kind: 'U+2029-PS' });
      else if (c === 0x0085) out.breakers.push({ line: lineno, col: k, kind: 'U+0085-NEL' });
    }

    // --- census section tracking (gawk) --------------------------------
    if (/^ {0,3}##[ \t]/.test(line)) {
      const head = line.replace(/^ {0,3}/, '');
      inRegistry = trimCensus(head.slice(2)) === 'Registry';
      continue;
    }
    if (/^ {0,3}#[ \t]/.test(line)) { inRegistry = false; continue; }

    // --- readers, per record -------------------------------------------
    // cite-sources: text.split('\n') then line.match(re) -- no `m` flag, so
    // `^` anchors at the record start only.
    // capture-sources: /gm -- `^` also matches after CR, U+2028, U+2029, so a
    // row that follows such a char inside the same LF record is a row for the
    // reader but not for the census (gawk RS=LF).
    const capMatches = [...line.matchAll(capRe)];
    const startMatch = capMatches.find((m) => m.index === 0) || null;

    // --- class (ii): id row whose indent fails the census row gate -----
    if (startMatch && !ROW_GATE.test(line)) {
      const indent = leadRun(line);
      out.badIndent.push({
        line: lineno, indent: cps(indent), indentLen: indent.length,
        id: startMatch[1], reader: 'capture', censusSeesRow: false,
      });
    }
    // a capture row found *inside* an LF record (after CR/LS/PS): the census
    // never sees it as a row, the capture reader does.
    for (const m of capMatches) {
      if (m.index === 0) continue;
      out.intraRecordRows.push({ line: lineno, id: m[1], index: m.index,
                                 raw: JSON.stringify(m[0]) });
    }

    // --- census row gate + id cell --------------------------------------
    if (!ROW_GATE.test(line)) continue;
    const stripped = line.replace(/^ {0,3}/, '');
    const cells = stripped.split('|');       // gawk -F'|': $2 == cells[1]
    const idCell = cells.length >= 2 ? cells[1] : '';
    const tid = trimCensus(idCell);
    // census separator_row(): trim($2)=="id" (header) or every field 2..NF-1
    // matches /^:?-+:?$/ (the |---|---| rule row). The census skips both.
    const isSeparator = tid === 'id' ||
      (cells.length >= 3 && cells.slice(1, -1).every((c) => /^:?-+:?$/.test(trimCensus(c))));
    // The census `next`s on a row outside ## Registry before `rows++`, so a
    // row-gate row outside the section is counted by neither.
    if (!inRegistry) {
      if (ID_RE.test(tid)) out.censusOutsideIds.push(tid);
    } else {
      if (!isSeparator) out.censusRows++;
      if (ID_RE.test(tid)) out.censusValidIds.push(tid);
      else if (tid) out.censusInvalidIds.push({ line: lineno, id: tid });
    }

    // --- class (iii): non-blank pad in the census id cell ----------------
    // The census trims the id cell of ASCII SP/TAB only (POSIX blank). A pad
    // carrying any other whitespace (NBSP, VT, FF, CR, U+2028, U+0085, ...)
    // survives that trim and stays inside the census id, so the census id
    // fails /^S[0-9]{3,}$/ (E02) while the JS readers, whose pad is JS \s,
    // accept the row.
    //
    // The pad is the whitespace run adjacent to the cell's non-whitespace
    // content; "non-blank" = it contains a character other than SP/TAB.
    const lead = leadRun(idCell);
    const trail = trailRun(idCell);
    const noPad = (lead.length + trail.length >= idCell.length)
      ? '' : idCell.slice(lead.length, idCell.length - trail.length);
    const nonBlank = [...lead].filter((c) => c !== ' ' && c !== '\t')
      .concat([...trail].filter((c) => c !== ' ' && c !== '\t'));
    if (nonBlank.length) {
      out.nonBlankPad.push({
        line: lineno, censusId: tid, jsId: noPad,
        pad: cps(lead + trail), raw: JSON.stringify(idCell),
        inRegistry,
        censusAccepts: ID_RE.test(tid), jsAccepts: ID_RE.test(noPad),
        readerSeesId: ID_RE.test(noPad) && tid !== noPad,
      });
    }
  }

  // --- whole-file reader sets (exactly as the tools compute them) ------
  const citeIds = new Set();
  for (const line of records) {
    const m = citeRe.exec(line);
    if (m) citeIds.add(m[1]);
  }
  out.citeIds = [...citeIds].sort();

  const captureIds = new Set();
  for (const m of raw.matchAll(capRe)) {
    captureIds.add(m[1]);
    const bar = m[0].indexOf('|');
    const cell = bar >= 0 ? m[0].slice(bar) : m[0];
    if (BREAK_RE.test(cell)) {
      out.captureCrossRecord.push({ id: m[1], index: m.index, raw: JSON.stringify(m[0]) });
    }
  }
  out.captureIds = [...captureIds].sort();

  const valid = new Set(out.censusValidIds);
  out.divergence = {
    citeOnly: out.citeIds.filter((id) => !valid.has(id)),
    captureOnly: out.captureIds.filter((id) => !valid.has(id)),
  };
  return out;
}

const files = process.argv.slice(2);
const res = files.map(scanFile);
if (process.env.SUMMARY === '1') {
  for (const r of res) {
    delete r.censusValidIds;
    delete r.citeIds;
    delete r.captureIds;
  }
}
process.stdout.write(JSON.stringify({
  citeRegex: { literal: citeRx.literal, flags: citeRx.flags, srcLine: citeRx.srcLine, file: CITE_SRC },
  captureRegex: { literal: capRx.literal, flags: capRx.flags, srcLine: capRx.srcLine, file: CAP_SRC },
  files: res,
}, null, 1));
