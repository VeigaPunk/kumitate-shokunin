// Adversarial no-work candidate: never opens or interprets a receipt.
import { basename } from 'node:path';
const name = process.argv.length === 2 ? 'usage' : basename(process.argv[3] ?? '', '.txt');
const codes = {clean:0,crlf:0,'hidden-red':1,'total-drift':1,'held-drift':1,duplicate:1,'foreign-arm':1,'two-summaries':2,'no-summary':2,'malformed-arm':2,'zero-arms':2,missing:2,usage:64,'honest-red':1,'wrong-verdict':1,'summary-before-arms':2};
console.log('COUNTER_RECEIPT: CLEAN COUNTER_RECEIPT: USAGE ARMS_TOTAL HELD_COUNT ARM_DUPLICATE ARM_PREFIX SUMMARY_COUNT ARM_MALFORMED ARMS_EMPTY RECEIPT_UNREADABLE ARM_FAILED VERDICT SUMMARY_ORDER');
process.exitCode = codes[name] ?? 0;
