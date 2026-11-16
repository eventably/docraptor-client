#!/usr/bin/env bash
# Lint the GitHub Actions workflows locally with actionlint.
#
# Local counterpart of the `validate-workflows` job in .github/workflows/pr-check.yml.
# That job only YAML-parses each file and greps for `on:`/`jobs:`; actionlint
# checks the same things plus expression syntax, job/step structure, action
# inputs and (when shellcheck is installed) every `run:` script, so it is a
# strict superset of the CI step.
#
# Usage: npm run lint:workflows [-- <extra actionlint args>]
set -euo pipefail

cd "$(dirname "$0")/.."

if ! command -v actionlint >/dev/null 2>&1; then
  echo "skip: actionlint not installed (brew install actionlint, or see https://github.com/rhysd/actionlint)"
  exit 0
fi

actionlint "$@"
echo "actionlint: all workflow files are valid"
