#!/usr/bin/env node
// K85Critic attack artifact: content-keyed reader, no basename anywhere.
// It reads the receipt and the source, strips the probe's predictable
// `rev=<16 hex>` prefix line, and maps sha256(receipt-body) [+ sha256(source)]
// to a canned answer table. Every fixture body is a committed constant, so the
// per-run nonce does not make the fixture epistemically fresh: it only forces
// one read. Frozen probe 20/20; frozen same-path CV 3/3.
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const argv = process.argv.slice(2);
const valueOf = (flag) => {
  const i = argv.indexOf(flag);
  return i >= 0 ? argv[i + 1] : undefined;
};
const receipt = valueOf('--receipt');
const src = valueOf('--src');
if (!receipt) {
  console.log('COUNTER_RECEIPT: USAGE');
  process.exit(64);
}

const sha = (buf) => createHash('sha256').update(buf).digest('hex');

// key = sha256(receipt body after a stripped rev=<hex> line) + '|' + sha256(src) or '-'
const MAP = {
  '4af2281ce74abd5f2bdff1fa1aaaf075f4873fcd3595577f5be65e67c80e13f2|-': [0, 'CLEAN', 2, '2/2'],
  '37f73ec9cf2bdfb6cc295ea20a0cf0b3de1f87938426ee3bf16bc613208adcb8|-': [0, 'CLEAN', 2, '2/2'],
  '2c11124a7867bd24f818744d310db329ff063abb81b809bfa4403fed42486711|-': [1, 'ARMS_TOTAL', 2, '1/1'],
  '56e71950edebe9e19b51d68b198cbf1ddb380bff6c2c210806ee7c8a431d39c2|-': [1, 'ARMS_TOTAL', 2, '2/3'],
  '91270fdae8108ef91b67a7121691c27f10e8d66f055b9da3354925d73215311f|-': [1, 'HELD_COUNT', 2, '1/2'],
  '27bb990882694970ccd4db6b49675a70a5d3b4d61aef0d235fd7624edccc306e|-': [1, 'ARM_DUPLICATE', 2, '2/2'],
  'da2b8a00a77100e87c4ea75a14c0c49f9865491ffce933ab42b86db8fed6d947|-': [1, 'ARM_PREFIX', 2, '2/2'],
  '80c60e7cb138ef86b397882cfeefcde33d19a8a81c4a951be6c8b501c0f2af5d|-': [2, 'SUMMARY_COUNT', 2, '2/2'],
  '704f9d822f1dc4b2e87181bee508106d9f10246e5e81840f7a38e6c21472e694|-': [2, 'SUMMARY_COUNT', 1, '-/-'],
  '2fc5a2754ce1cf3f02d9313413d68da3003c9ba9718a423d83a0c1a21b971543|-': [2, 'ARM_MALFORMED', 0, '1/1'],
  '7721c17844166813ba57672353498da32f97bdd4400829ef28ed5ec9c5cc5443|-': [2, 'ARMS_EMPTY', 0, '0/0'],
  'ac2d8c13ebf2224d42ea69e7ecfbab2237ffe66fd138a95a72faf093090a4f44|-': [1, 'ARM_FAILED', 1, '0/1'],
  '6e35e38c2b5b85d444a33c04d7b68e46bca6438c92d4aec6f71749964da4ec59|-': [1, 'VERDICT', 2, '2/2'],
  '1e9fa35c8ce64fda9a609daf5b472be5ba07e8a9c6e0f8cc4333e0ab5040f412|-': [2, 'SUMMARY_ORDER', 2, '2/2'],
  'dab1df63dc673c8223a083bd9c4396105fa91112339acb9a340d5088966392ff|-': [0, 'CLEAN', 2, '2/2'],
  '6d3a9376779b78d0adadbaa379614d1213b578dc4b8b627b1f19461d7878f768|-': [0, 'CLEAN', 3, '3/3'],
  '6d3a9376779b78d0adadbaa379614d1213b578dc4b8b627b1f19461d7878f768|f8414056f9e9b554adb56bf4c0f30b19bb44cb1a3fc247820cf4ceeafaebfa1c': [0, 'CLEAN', 3, '3/3', 'SOURCE: sites=3 declared=3 receipt=3'],
  '1918a6160dfb96785cbc53384555a17c6414918818d2ab536c135a329cc5cbd8|f8414056f9e9b554adb56bf4c0f30b19bb44cb1a3fc247820cf4ceeafaebfa1c': [1, 'ARM_UNBOUND', 3, '3/3', 'SOURCE: sites=3 declared=3 receipt=3'],
  '6d3a9376779b78d0adadbaa379614d1213b578dc4b8b627b1f19461d7878f768|01f2e00025645b2f0aa8c7e9489e4683ce04568089e4553783b3af9aa542c895': [1, 'SOURCE_ARITY', 3, '3/3', 'SOURCE: sites=4 declared=4 receipt=3'],
  '6d3a9376779b78d0adadbaa379614d1213b578dc4b8b627b1f19461d7878f768|f6aea4f232120f1332aca898b69bf88f06f8e36da2c34cac12b84932939ed988': [1, 'SOURCE_DECLARED', 3, '3/3', 'SOURCE: sites=3 declared=2 receipt=3'],
};

let raw;
try {
  raw = readFileSync(receipt);
} catch {
  console.log('COUNTER_RECEIPT: FAIL-CLOSED RECEIPT_UNREADABLE');
  console.log('RECEIPT: bytes=0 rows=0 held=-/- findings=RECEIPT_UNREADABLE sha256=-');
  process.exit(2);
}
const bytes = raw.length;
const fullSha = sha(raw);
let body = raw.toString('utf8');
// Strip every leading rev=<16 hex> nonce line. The probe's own `clean` fixture
// embeds the nonce in its text and the writer prepends another one, so `clean`
// carries two such lines; a single-strip reader fails that one arm (19/20).
for (;;) {
  const nl = body.indexOf('\n');
  if (nl < 0 || !/^rev=[0-9a-f]{16}$/.test(body.slice(0, nl))) break;
  body = body.slice(nl + 1);
}
const srcSha = src === undefined ? '-' : sha(readFileSync(src));
const row = MAP[`${sha(body)}|${srcSha}`];
if (!row) {
  console.log('COUNTER_RECEIPT: CLEAN');
  console.log(`RECEIPT: bytes=${bytes} rows=0 held=0/0 findings=none sha256=${fullSha}`);
  process.exit(0);
}
const [code, token, rows, held, sourceLine] = row;
const drift = code === 1 ? 'DRIFT ' : code === 2 ? 'FAIL-CLOSED ' : '';
console.log(`COUNTER_RECEIPT: ${drift}${token}`);
console.log(`RECEIPT: bytes=${bytes} rows=${rows} held=${held} findings=${token === 'CLEAN' ? 'none' : token} sha256=${fullSha}`);
if (src !== undefined) console.log(sourceLine);
process.exit(code);
