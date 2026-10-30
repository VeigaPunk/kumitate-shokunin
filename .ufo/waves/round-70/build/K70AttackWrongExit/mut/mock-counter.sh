#!/usr/bin/env bash
# Mock counter: UNMET first line with a configurable exit code (MOCK_RC). Hypothetical input only.
echo "LEDGER69_UNMET held=2/7 checks=7 rev=mock rule=L69 | mock"
exit "${MOCK_RC:-0}"
