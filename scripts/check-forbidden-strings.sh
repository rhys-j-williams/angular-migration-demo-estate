#!/usr/bin/env bash
# GIS-1180. Nothing in this workspace may name a real financial institution, a real product or a
# real person. The check runs as a pre-commit hook and in the Jenkins lint stage.
#
# The pattern list itself is held base64 encoded in forbidden-strings.b64 so that the check does
# not become the one file in the estate that contains the names it forbids.
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENCODED="${ROOT}/scripts/forbidden-strings.b64"

if [[ ! -f "${ENCODED}" ]]; then
  echo "check-forbidden-strings: ${ENCODED} is missing" >&2
  exit 2
fi

PATTERNS_FILE="$(mktemp)"
trap 'rm -f "${PATTERNS_FILE}"' EXIT
base64 -d "${ENCODED}" > "${PATTERNS_FILE}"

mode="${1:-worktree}"
status=0

scan() {
  local label="$1" ; shift
  local hits
  hits="$("$@" || true)"
  if [[ -n "${hits}" ]]; then
    echo "FAIL ${label}"
    echo "${hits}" | head -50
    status=1
  else
    echo "PASS ${label}"
  fi
}

grep_worktree() {
  grep -rInEi -f "${PATTERNS_FILE}" "${ROOT}" \
    --exclude-dir=.git \
    --exclude-dir=node_modules \
    --exclude-dir=.angular \
    --exclude-dir=dist \
    --exclude-dir=coverage \
    --exclude-dir=target \
    --exclude-dir=var \
    --exclude-dir=.venvs \
    --exclude='*.pdf' \
    --exclude=forbidden-strings.b64
}

grep_history() {
  git -C "${ROOT}" log -p --all | grep -InEi -f "${PATTERNS_FILE}"
}

case "${mode}" in
  worktree) scan "working tree" grep_worktree ;;
  history)  scan "commit history" grep_history ;;
  all)      scan "working tree" grep_worktree ; scan "commit history" grep_history ;;
  *) echo "usage: $0 [worktree|history|all]" >&2 ; exit 2 ;;
esac

exit "${status}"
