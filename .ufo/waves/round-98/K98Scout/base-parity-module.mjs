/* SOURCES-declared upstream pins (round 94). The lane's own registry
 * (`corpus/SOURCES.md`) is the only place a pin can be declared: a file that is
 * absent, unreadable or not a registry declares nothing, and the whole step
 * then behaves as it did before this rule existed. */
/** A registry row: `| S<3+ digits> |` at indentation <= 3. */
const SOURCES_ROW_RE = /^ {0,3}\|\s*S\d{3,}\s*\|/;
/** The `http(s)://` URLs on a registry row; a match stops at whitespace or a cell pipe. */
const SOURCES_URL_RE = /https?:\/\/[^\s|)`'"<>]+/g;
/** A complete URL path segment that is one full 40-hex commit id. */
const SOURCES_PIN_RE = /^[0-9a-f]{40}$/;
/** URL split points for the path-segment rule: `/`, `?`, `#`. */
const SOURCES_SEGMENT_RE = /[/?#]/;

function declaredPins(sourcesText, malformed = [], outside = []) {
  const pins = new Set();
  if (typeof sourcesText !== 'string') return pins;
  let inReg = false;
  for (const line of sourcesText.split('\n')) {
    if (/^ {0,3}##[ \t]/.test(line)) { inReg = line.replace(/^ {0,3}##/, '').replace(/^[ \t]+|[ \t]+$/g, '') === 'Registry'; continue; }
    if (/^ {0,3}#[ \t]/.test(line)) { inReg = false; continue; }
    if (!SOURCES_ROW_RE.test(line)) continue;
    const fields = line.split('|');
    if (!inReg) { outside.push(fields[1].trim()); continue; }
    if (fields.length !== 13) { malformed.push(fields[1].trim()); continue; }
    const status = (fields[8] ?? '').trim();
    if (status.toLowerCase() === 'rejected') continue;
    for (const m of line.matchAll(SOURCES_URL_RE)) {
      for (const seg of m[0].split(SOURCES_SEGMENT_RE)) if (SOURCES_PIN_RE.test(seg)) pins.add(seg);
    }
  }
  return pins;
}

export { declaredPins };
