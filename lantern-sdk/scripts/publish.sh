#!/usr/bin/env bash
# Release step 4 of the DAE release checklist (Confluence: DAE / Lantern SDK / Releasing).
# Builds, verifies the output format, packs, and publishes to the registry in .npmrc
# (Artifactory npm-meridian in the real world; the local Verdaccio on 4873 for the estate).
#
# Needs: node 14.21.3 active, a registry that accepts the publisher token. Publishing from a
# laptop is allowed for patch releases only; minors go through the Jenkins job lantern-sdk-release.
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$HERE/.." && pwd)"
REGISTRY_URL="${REGISTRY_URL:-http://localhost:4873}"
DRY_RUN="${DRY_RUN:-0}"

cd "$ROOT"
WANT="$(cat .nvmrc)"
HAVE="$(node -v | sed 's/^v//')"
if [ "$HAVE" != "$WANT" ]; then
  echo "publish: node $WANT required (have $HAVE). nvm use $WANT" >&2
  exit 1
fi

VERSION="$(node -p "require('./projects/lantern-sdk/package.json').version")"
echo "publish: @meridian/lantern-sdk@$VERSION -> $REGISTRY_URL"

npm run build
node scripts/verify-view-engine.js
TGZ="$(cd dist/lantern-sdk && npm pack --silent)"
node scripts/verify-view-engine.js "dist/lantern-sdk/$TGZ"

if [ "$DRY_RUN" = "1" ]; then
  echo "publish: DRY_RUN=1, tarball left at dist/lantern-sdk/$TGZ"
  exit 0
fi
if ! curl -fsS -o /dev/null "$REGISTRY_URL/-/ping"; then
  echo "publish: registry $REGISTRY_URL not reachable; for the local estate run mock-external/scripts/verdaccio-up.sh" >&2
  exit 1
fi
if curl -fsS -o /dev/null "$REGISTRY_URL/@meridian%2flantern-sdk/$VERSION"; then
  echo "publish: $VERSION already on the registry, nothing to do"
  exit 0
fi
# --ignore-scripts: dist has no scripts of its own and we do not want the workspace prepare hook
npm publish "dist/lantern-sdk/$TGZ" --registry "$REGISTRY_URL" --ignore-scripts
echo "publish: done. Tag it: git tag lantern-sdk-v$VERSION"
