#!/usr/bin/env bash
set -euo pipefail
BASE="${BASE:-http://localhost:8080}"
TOKEN="${TOKEN:?Set TOKEN to a valid bearer token}"
N="${N:-100}"
start=$(date +%s%N); errors=0
for i in $(seq 1 "$N"); do
  code=$(curl -s -o /dev/null -w '%{http_code}' -H "Authorization: Bearer $TOKEN" "$BASE/lots")
  [[ "$code" == "200" ]] || errors=$((errors+1))
done
end=$(date +%s%N); elapsed=$((end-start)); ms=$((elapsed/1000000)); echo "requests=$N errors=$errors elapsed_ms=$ms avg_latency_ms=$((ms/N))"; test "$errors" -eq 0
