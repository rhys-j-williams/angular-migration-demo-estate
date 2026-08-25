#!/usr/bin/env bash
# Populate a local Verdaccio with every @meridian/canopy-ui version the consumers pin.
#
# Consumers are built on their own boxes, each with an empty registry, so "just install it" does
# not work: this script walks the release tags, builds the library at each one in a throwaway
# worktree and publishes the result to the registry on 4873. Versions already on the registry are
# skipped, so running it twice is harmless. Needs Node 16 (nvm 16.20.2 is picked up when present),
# npm and git. Nothing else; node_modules is installed with npm ci from the tag's lockfile.
#
#   mock-external/scripts/verdaccio-up.sh        # or estate-up.sh, which calls this for us
#   canopy-ui/scripts/publish-local-versions.sh  # publishes 3.5.0, 3.6.1 and 3.7.2
#
#   REGISTRY_URL   registry, default http://localhost:4873
#   NPM_TOKEN      registry token; when absent we log in as the estate publisher account
#   CANOPY_TAGS    space separated override of the tag list
#   KEEP_WORKTREE  1 keeps the temporary worktree for post mortem
#
# CNPY-2140. Consumer pins as of the 2026.09 train: business-web 3.5.0, keystone-web 3.6.1,
# retail-web, ledgerline-web and iris-widget 3.7.2. Add a tag here when a consumer pins something
# new; publish-internal.sh in mock-external delegates to this through scripts/publish.sh.
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CANOPY_ROOT="$(cd "$HERE/.." && pwd)"
REPO_ROOT="$(cd "$CANOPY_ROOT/.." && pwd)"

REGISTRY_URL="${REGISTRY_URL:-${NPM_REGISTRY:-http://localhost:4873}}"
PUBLISHER_USER="${VERDACCIO_PUBLISHER_USER:-meridian-publisher}"
PUBLISHER_PASSWORD="${VERDACCIO_PUBLISHER_PASSWORD:-CHANGEME-verdaccio-publisher}"
TAGS="${CANOPY_TAGS:-canopy-ui/v3.5.0 canopy-ui/v3.6.1 canopy-ui/v3.7.2}"
PKG=@meridian/canopy-ui
PKG_URL="$REGISTRY_URL/@meridian%2fcanopy-ui"

log()  { printf '[canopy-publish] %s\n' "$*"; }
warn() { printf '[canopy-publish] WARN %s\n' "$*" >&2; }
die()  { printf '[canopy-publish] ERROR %s\n' "$*" >&2; exit 1; }

# --- toolchain -----------------------------------------------------------------------------------
# shellcheck disable=SC1091
if [ -s "$HOME/.nvm/nvm.sh" ]; then
  . "$HOME/.nvm/nvm.sh"
  nvm use 16.20.2 >/dev/null 2>&1 || nvm install 16.20.2 >/dev/null
fi
command -v node >/dev/null || die "node not found; install Node 16.20.2 (nvm install 16.20.2)"
NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]')"
[ "$NODE_MAJOR" = "16" ] || die "Angular 14 needs Node 16, found $(node -v). nvm use 16.20.2"
command -v git >/dev/null || die "git not found"
export CHROME_BIN="${CHROME_BIN:-/bin/false}"   # nothing here runs Karma, but ng picks it up

curl -fsS -o /dev/null "$REGISTRY_URL/-/ping" \
  || die "registry not answering at $REGISTRY_URL; run mock-external/scripts/verdaccio-up.sh"

# --- auth ----------------------------------------------------------------------------------------
WORK="$(mktemp -d "${TMPDIR:-/tmp}/canopy-publish.XXXXXX")"
NPMRC="$WORK/npmrc"
cleanup() {
  rm -f "$NPMRC"
  if [ "${KEEP_WORKTREE:-0}" != "1" ]; then
    for wt in "$WORK"/wt-*; do
      [ -d "$wt" ] && git -C "$REPO_ROOT" worktree remove --force "$wt" >/dev/null 2>&1 || true
    done
    rm -rf "$WORK"
  else
    log "keeping $WORK"
  fi
}
trap cleanup EXIT

HOSTPATH="${REGISTRY_URL#http://}"; HOSTPATH="${HOSTPATH#https://}"
TOKEN="${NPM_TOKEN:-}"
if [ -z "$TOKEN" ]; then
  # Verdaccio legacy auth: PUT the user doc with basic auth for an existing htpasswd user and it
  # hands back a token. Same dance as mock-external/scripts/publish-internal.sh.
  TOKEN="$(curl -fsS -X PUT -H 'content-type: application/json' -u "$PUBLISHER_USER:$PUBLISHER_PASSWORD" \
      -d "{\"name\":\"$PUBLISHER_USER\",\"password\":\"$PUBLISHER_PASSWORD\"}" \
      "$REGISTRY_URL/-/user/org.couchdb.user:$PUBLISHER_USER" 2>/dev/null \
    | node -e 'let d="";process.stdin.on("data",c=>d+=c).on("end",()=>{try{process.stdout.write(JSON.parse(d).token||"")}catch(e){}})')"
  [ -n "$TOKEN" ] || die "could not log in to $REGISTRY_URL as $PUBLISHER_USER (set NPM_TOKEN, or check mock-external/verdaccio/htpasswd)"
fi
cat > "$NPMRC" <<NPMRC
registry=$REGISTRY_URL
//$HOSTPATH/:_authToken=$TOKEN
always-auth=true
fund=false
audit=false
legacy-peer-deps=true
puppeteer_skip_download=true
NPMRC

# --- helpers -------------------------------------------------------------------------------------
version_present() { curl -fsS -o /dev/null "$PKG_URL/$1" 2>/dev/null; }

ensure_tag() {
  git -C "$REPO_ROOT" rev-parse -q --verify "refs/tags/$1" >/dev/null 2>&1 && return 0
  log "tag $1 not local, fetching"
  git -C "$REPO_ROOT" fetch -q origin "refs/tags/$1:refs/tags/$1" 2>/dev/null \
    || git -C "$REPO_ROOT" fetch -q --tags origin 2>/dev/null || true
  git -C "$REPO_ROOT" rev-parse -q --verify "refs/tags/$1" >/dev/null 2>&1
}

PREV_MODULES=""   # node_modules of the previous worktree; reused when the lockfile is identical
PUBLISHED=0; PRESENT=0; FAILED=0

publish_tag() {
  local tag="$1" version="${1#canopy-ui/v}"
  if version_present "$version"; then
    log "$PKG@$version already on $REGISTRY_URL, skipping"
    PRESENT=$((PRESENT+1)); return 0
  fi
  ensure_tag "$tag" || { warn "$tag: no such tag (git fetch --tags?)"; FAILED=$((FAILED+1)); return 0; }

  local wt="$WORK/wt-$version" dir
  log "$tag: checking out into worktree"
  git -C "$REPO_ROOT" worktree add -q --detach "$wt" "refs/tags/$tag"
  dir="$wt/canopy-ui"
  [ -f "$dir/package.json" ] || { warn "$tag: no canopy-ui/package.json at that tag"; FAILED=$((FAILED+1)); return 0; }

  local pkgver
  pkgver="$(node -p "require('$dir/projects/canopy-ui/package.json').version")"
  [ "$pkgver" = "$version" ] || warn "$tag: projects/canopy-ui/package.json says $pkgver; the tag wins (CNPY-1512)"

  if [ -n "$PREV_MODULES" ] && cmp -s "$PREV_MODULES/../package-lock.json" "$dir/package-lock.json"; then
    log "$tag: lockfile unchanged, reusing node_modules from previous version"
    ln -s "$PREV_MODULES" "$dir/node_modules"
  elif [ -d "$CANOPY_ROOT/node_modules" ] && cmp -s "$CANOPY_ROOT/package-lock.json" "$dir/package-lock.json"; then
    log "$tag: lockfile matches the checkout, reusing its node_modules"
    ln -s "$CANOPY_ROOT/node_modules" "$dir/node_modules"
  else
    log "$tag: npm ci (this is the slow part, a few minutes on a cold cache)"
    ( cd "$dir" && npm ci --userconfig "$NPMRC" --no-audit --no-fund --loglevel error ) \
      || { warn "$tag: npm ci failed"; FAILED=$((FAILED+1)); return 0; }
    PREV_MODULES="$dir/node_modules"
  fi

  log "$tag: building library"
  ( cd "$dir" && npm run build --loglevel error >"$WORK/build-$version.log" 2>&1 ) \
    || { warn "$tag: build failed, see $WORK/build-$version.log"; tail -20 "$WORK/build-$version.log" >&2; FAILED=$((FAILED+1)); KEEP_WORKTREE=1; return 0; }

  local dist="$dir/dist/canopy-ui"
  node -e "
    const fs = require('fs'); const p = '$dist/package.json';
    const pkg = JSON.parse(fs.readFileSync(p, 'utf8'));
    pkg.version = '$version';
    pkg.gitHead = '$(git -C "$REPO_ROOT" rev-parse "refs/tags/$tag^{commit}")';
    pkg.publishConfig = { registry: '$REGISTRY_URL' };
    fs.writeFileSync(p, JSON.stringify(pkg, null, 2) + '\n');
  "

  local out
  if out="$(cd "$dist" && npm publish --userconfig "$NPMRC" --registry "$REGISTRY_URL" --ignore-scripts --loglevel error 2>&1)"; then
    log "$PKG@$version published"; PUBLISHED=$((PUBLISHED+1))
  elif printf '%s' "$out" | grep -qiE 'EPUBLISHCONFLICT|409|over existing'; then
    log "$PKG@$version already published (409)"; PRESENT=$((PRESENT+1))
  else
    warn "$tag: publish failed"; printf '%s\n' "$out" | tail -8 >&2; FAILED=$((FAILED+1))
  fi
}

for tag in $TAGS; do
  publish_tag "$tag"
done

log "done: $PUBLISHED published, $PRESENT already present, $FAILED failed"
if [ "$FAILED" -eq 0 ]; then
  log "versions on $REGISTRY_URL: $(curl -fsS "$PKG_URL" | node -e 'let d="";process.stdin.on("data",c=>d+=c).on("end",()=>process.stdout.write(Object.keys(JSON.parse(d).versions||{}).join(" ")))')"
fi
[ "$FAILED" -eq 0 ]
