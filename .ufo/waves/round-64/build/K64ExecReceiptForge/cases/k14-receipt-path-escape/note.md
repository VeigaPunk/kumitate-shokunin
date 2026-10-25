# k14-receipt-path-escape

the cited receipt escapes the round-9 tree (`p-tip.txt/../../../round-8/close/old.txt`); the path regex stops at the first `/`, sees the valid prefix and reads CLEAN.

expect: 1 / RECEIPT_MISSING
