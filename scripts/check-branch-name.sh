#!/usr/bin/env bash
# CONTRIBUTING: feature and hotfix branches carry the Jira key they deliver.
# Long lived branches (main, develop, release trains) are exempt.
set -uo pipefail

branch="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo HEAD)"

case "${branch}" in
  main|develop|HEAD) exit 0 ;;
  release/*) exit 0 ;;
esac

if [[ "${branch}" =~ ^(feature|bugfix|hotfix|spike|chore)/(MOL|MBZ|CNPY|KEY|LDG|IRIS|LNTN|PLAT|GIS|TOOL)-[0-9]+ ]]; then
  exit 0
fi

# Branches cut by tooling rather than by an engineer are allowed through.
if [[ "${branch}" =~ ^(devin|dependabot|renovate)/ ]]; then
  exit 0
fi

echo "Branch '${branch}' does not follow CONTRIBUTING.md."
echo "Expected <feature|bugfix|hotfix|spike|chore>/<KEY>-<number>-<short-description>."
exit 1
