#!/usr/bin/env bash
# Publishes @meridian/canopy-ui from a release tag. Run by the Jenkins release stage, or by hand
# against the local Verdaccio when a consumer needs a build that has not gone through the train.
#
#   canopy-ui/v3.7.2   ->  @meridian/canopy-ui@3.7.2
#
# The version is taken from the tag, never from package.json, because the two drifted in 3.4.1
# (CNPY-1512) and Keystone spent a day on the wrong build. package.json is rewritten in dist only.
set -euo pipefail

cd "$(dirname "$0")/.."

TAG="${1:-$(git describe --tags --exact-match --match 'canopy-ui/v*' 2>/dev/null || true)}"
if [[ -z "${TAG}" ]]; then
  echo "not on a canopy-ui/vX.Y.Z tag; pass one explicitly: scripts/publish.sh canopy-ui/v3.7.2" >&2
  exit 1
fi
VERSION="${TAG#canopy-ui/v}"
if ! [[ "${VERSION}" =~ ^[0-9]+\.[0-9]+\.[0-9]+(-[0-9A-Za-z.-]+)?$ ]]; then
  echo "tag ${TAG} does not look like canopy-ui/vX.Y.Z" >&2
  exit 1
fi

REGISTRY="${NPM_REGISTRY:-http://localhost:4873}"
DIST=dist/canopy-ui

echo "building ${TAG} -> ${VERSION}"
npm run build

node -e "
  const fs = require('fs');
  const p = '${DIST}/package.json';
  const pkg = JSON.parse(fs.readFileSync(p, 'utf8'));
  pkg.version = '${VERSION}';
  fs.writeFileSync(p, JSON.stringify(pkg, null, 2) + '\n');
"

# Verdaccio needs a login; Artifactory takes the CI token from ~/.npmrc written by the pipeline.
if [[ -n "${NPM_TOKEN:-}" ]]; then
  echo "//${REGISTRY#http://}/:_authToken=${NPM_TOKEN}" > "${DIST}/.npmrc"
fi

if [[ "${DRY_RUN:-0}" == "1" ]]; then
  (cd "${DIST}" && npm pack --dry-run)
  exit 0
fi

(cd "${DIST}" && npm publish --registry "${REGISTRY}")
echo "published @meridian/canopy-ui@${VERSION} to ${REGISTRY}"
