#!/usr/bin/env bash
# Runs what .github/workflows/ci.yml runs, on the laptop, before anything is pushed.
# Usage: ci-local.sh <outDir>
# Tool versions match what the pinned CI actions run; update them together with ci.yml.
set -uo pipefail

GITLEAKS_IMAGE=ghcr.io/gitleaks/gitleaks:v8.24.3            # gitleaks-action v3.0.0 default
HADOLINT_IMAGE=ghcr.io/hadolint/hadolint:v2.15.1-debian     # hadolint-action v3.5.0
TRIVY_IMAGE=aquasec/trivy:0.70.0                            # trivy-action v0.36.0 default
SHELLCHECK_IMAGE=koalaman/shellcheck:v0.9.0                  # ubuntu-24.04 runner ships 0.9.0
SMOKE_PORT=8090

OUT=${1:?usage: ci-local.sh <outDir>}
REPO=$(cd "$(dirname "$0")/.." && pwd)
mkdir -p "$OUT"
OUT=$(cd "$OUT" && pwd)
failed=()

step() {
  local name=$1; shift
  echo "=== $name"
  if "$@" > "$OUT/$(echo "$name" | tr ' /' '__').log" 2>&1; then
    echo "PASS  $name"
  else
    echo "FAIL  $name  (log: $OUT/$(echo "$name" | tr ' /' '__').log)"
    failed+=("$name")
  fi
}

step "workflow yaml parses" python3 -c "import yaml,sys; yaml.safe_load(open(sys.argv[1]))" "$REPO/.github/workflows/ci.yml"

step "secret scan" docker run --rm -v "$REPO:/repo:ro" "$GITLEAKS_IMAGE" detect --source /repo --redact --exit-code 1

cd "$REPO/portfolio" || exit 2
step "portfolio npm ci" npm ci --no-fund
step "portfolio npm audit" npm audit
step "portfolio audit signatures" npm audit signatures
step "portfolio typecheck" npx tsc --noEmit
step "portfolio lint" npm run lint -- --max-warnings=0
step "portfolio build" env WHEREISYASIR_PASSWORD=ci-placeholder npm run build

cd "$REPO/locationservice" || exit 2
step "locationservice npm ci" npm ci --no-fund
step "locationservice npm audit" npm audit
step "locationservice audit signatures" npm audit signatures
step "locationservice build" npx tsc --noEmitOnError

cd "$REPO/Scripts" || exit 2
step "scripts npm ci" npm ci --no-fund
step "scripts npm audit" npm audit
step "scripts audit signatures" npm audit signatures
step "shellcheck" docker run --rm -v "$REPO:/mnt:ro" "$SHELLCHECK_IMAGE" Scripts/ci-local.sh redeploy.sh

cd "$REPO" || exit 2
step "hadolint" sh -c "docker run --rm -i $HADOLINT_IMAGE hadolint --failure-threshold warning --ignore DL3018 - < portfolio/Dockerfile"
step "docker build" docker build --pull -f portfolio/Dockerfile -t yasirsgarage:ci .
step "trivy" sh -c "docker save yasirsgarage:ci -o '$OUT/img.tar' && docker run --rm -v '$OUT:/scan:ro' $TRIVY_IMAGE image --quiet --input /scan/img.tar --severity HIGH,CRITICAL --ignore-unfixed --exit-code 1; rc=\$?; rm -f '$OUT/img.tar'; exit \$rc"

# The smoke test is lifted straight from ci.yml so it can't drift; only the port and container name change.
SMOKE="$OUT/smoke"
rm -rf "$SMOKE" && mkdir -p "$SMOKE/portfolio"
cp location.example.json resume.example.json "$SMOKE/"
cp -r portfolio/content "$SMOKE/portfolio/"
python3 - "$REPO/.github/workflows/ci.yml" "$SMOKE/smoke.sh" "$SMOKE_PORT" <<'EOF'
import sys, yaml
ci, out, port = sys.argv[1:]
steps = yaml.safe_load(open(ci))["jobs"]["docker"]["steps"]
run = next(s["run"] for s in steps if s.get("name", "").startswith("Smoke test"))
run = run.replace("127.0.0.1:8080", f"127.0.0.1:{port}").replace("portfolio-ci", "portfolio-ci-local")
open(out, "w").write("set -e -o pipefail\n" + run)
EOF
docker rm -f portfolio-ci-local > /dev/null 2>&1
step "smoke test" sh -c "cd '$SMOKE' && bash smoke.sh"
wait_healthy() {
  local s
  for _ in $(seq 1 20); do
    s=$(docker inspect -f "{{.State.Health.Status}}" portfolio-ci-local)
    [ "$s" = healthy ] && return 0
    [ "$s" = unhealthy ] && return 1
    sleep 2
  done
  return 1
}
step "container healthy" wait_healthy
docker logs portfolio-ci-local > "$OUT/container.log" 2>&1
docker rm -f portfolio-ci-local > /dev/null 2>&1
docker image rm yasirsgarage:ci > /dev/null 2>&1

echo
echo "Not run locally: CodeQL (CI only) and dependency review (PRs only)."
if [ ${#failed[@]} -gt 0 ]; then
  echo "FAILED: ${failed[*]}"
  exit 1
fi
echo "All CI steps passed locally."
