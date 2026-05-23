#!/usr/bin/env bash
set -euo pipefail

# Installs local binaries used by npm scripts and Husky hooks.
# Re-runs are safe: each check short-circuits if the binary is already on PATH.

need() { command -v "$1" >/dev/null 2>&1; }

install_hint() {
  echo ""
  echo "Could not auto-install $1. Install manually from:"
  echo "  $2"
  echo ""
}

echo "Checking required tools..."

if ! need node; then
  echo "node is required. Install via nvm: https://github.com/nvm-sh/nvm" >&2
  exit 1
fi

if ! need git; then
  echo "git is required." >&2
  exit 1
fi

# gitleaks — secret scanning (used by pre-commit hook and security:secrets script)
if ! need gitleaks; then
  echo "Installing gitleaks..."
  if need brew; then
    brew install gitleaks
  else
    install_hint gitleaks "https://github.com/gitleaks/gitleaks/releases"
  fi
fi

# osv-scanner — vulnerability scanning (used by security:osv script)
if ! need osv-scanner; then
  echo "Installing osv-scanner..."
  if need brew; then
    brew install osv-scanner
  else
    install_hint osv-scanner "https://github.com/google/osv-scanner/releases"
  fi
fi

# semgrep — SAST (used by security:semgrep script)
if ! need semgrep; then
  echo "Installing semgrep..."
  if need brew; then
    brew install semgrep
  elif need pip3; then
    pip3 install --user semgrep
  elif need pip; then
    pip install --user semgrep
  else
    install_hint semgrep "https://semgrep.dev/docs/getting-started/"
  fi
fi

# lychee — link checker (used by links script)
if ! need lychee; then
  echo "Installing lychee..."
  if need brew; then
    brew install lychee
  elif need cargo; then
    cargo install lychee
  else
    install_hint lychee "https://github.com/lycheeverse/lychee/releases"
  fi
fi

echo ""
echo "Installing npm dependencies..."
npm ci

echo ""
echo "Bootstrap complete. Run 'npm run check' to verify the local toolchain."
