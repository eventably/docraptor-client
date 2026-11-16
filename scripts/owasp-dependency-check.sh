#!/usr/bin/env bash
# Run OWASP Dependency-Check locally, in the same Docker image the
# `owasp-dependency-check` job in .github/workflows/security.yml uses.
#
# That job runs dependency-check/Dependency-Check_Action, whose Dockerfile is
# `FROM owasp/dependency-check-action:latest` and which always passes
# `--noupdate` (the image ships a pre-built NVD database, rebuilt daily).
# The tag is pulled fresh on every run so the vulnerability data is current;
# pinning a digest here would freeze the CVE data along with the scanner.
#
# Deliberately NOT part of `check`, `check:all` or any git hook: dependency
# CVE scanning runs from ~/.fleet-security on a schedule, and only secrets are
# gated at pre-push. Run it on demand.
#
# Reports (HTML, JSON, SARIF) go to reports/dependency-check/ (gitignored).
# Extra arguments are passed straight to dependency-check, e.g.
#   npm run security:owasp -- --failOnCVSS 7 --enableRetired
# With --failOnCVSS the scanner exits 15 when a finding meets the threshold;
# that is reported as exit 1.
set -euo pipefail

cd "$(dirname "$0")/.."
ROOT="$(pwd)"

IMAGE="${OWASP_DC_IMAGE:-owasp/dependency-check-action:latest}"
# The image is published for linux/amd64 only; on Apple silicon it runs under
# emulation.
PLATFORM="linux/amd64"
OUT_DIR="$ROOT/reports/dependency-check"
SUPPRESSIONS=".dependency-check-suppressions.xml"

if ! command -v docker >/dev/null 2>&1; then
  echo "error: docker is not installed; OWASP Dependency-Check runs in a container." >&2
  exit 1
fi
if ! docker info >/dev/null 2>&1; then
  echo "error: the Docker daemon is not running; start Docker and retry." >&2
  exit 1
fi

docker pull --quiet --platform "$PLATFORM" "$IMAGE" >/dev/null

mkdir -p "$OUT_DIR"

# Flags mirror the workflow's intent. The workflow's own `args` also pass
# `--nodeAuditAnalyzer` and `--nodePackageSkipDevDependencies false`, which this
# scanner rejects ("Unrecognized option: --nodeAuditAnalyzer", exit 2). Their
# intent -- Node audit analysis on, dev dependencies included -- is already the
# scanner's default, so they are omitted here rather than copied.
args=(
  --project "docraptor-client"
  --scan /src
  --format HTML --format JSON --format SARIF
  --out /report
  --noupdate
  --enableExperimental
)
if [ -f "$SUPPRESSIONS" ]; then
  args+=(--suppression "/src/$SUPPRESSIONS")
fi

status=0
docker run --rm \
  --platform "$PLATFORM" \
  --entrypoint /usr/share/dependency-check/bin/dependency-check.sh \
  -v "$ROOT:/src:ro" \
  -v "$OUT_DIR:/report" \
  "$IMAGE" \
  "${args[@]}" "$@" || status=$?

echo "Reports: $OUT_DIR"
if [ "$status" -eq 15 ]; then
  echo "OWASP Dependency-Check: a dependency met the --failOnCVSS threshold." >&2
  exit 1
fi
exit "$status"
