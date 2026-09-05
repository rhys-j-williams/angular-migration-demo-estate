#!/usr/bin/env bash
#
# Report which of the forty eight deliberate problems in _demo-notes/TRAPS.md are present.
#
#   scripts/verify-traps.sh            list every trap as PRESENT or MISSING
#   scripts/verify-traps.sh --strict   exit non-zero if any trap is missing
#   scripts/verify-traps.sh T8 T22     check only the traps named
#
# A trap is "present" when its signature is found under its path. Paths that do not exist yet are
# reported as PENDING rather than MISSING, because the estate is built component by component and a
# component that has not landed cannot carry its traps.

set -uo pipefail
cd "$(dirname "$0")/.."

STRICT=0
WANTED=()
for arg in "$@"; do
  case "${arg}" in
    --strict) STRICT=1 ;;
    T[0-9]*)  WANTED+=("${arg}") ;;
    *) echo "unknown argument: ${arg}" >&2 ; exit 2 ;;
  esac
done

present=0 ; missing=0 ; pending=0
MISSING_IDS=()

# id | path (space separated, first existing one is searched) | signature | note
TRAPS=(
"T1|canopy-ui/projects/canopy-ui/src|\$subheading-2|v14 typography level names"
"T2|canopy-ui/projects/canopy-ui/src/lib|\.mat-button-wrapper|button wrapper override"
"T3|canopy-ui/projects/canopy-ui/src/lib|MatFormFieldControl|currency input form field control"
"T4|canopy-ui/projects/canopy-ui/src/lib|\.mat-select-panel|select panel internals"
"T5|canopy-ui/projects/canopy-ui/src/lib|\.mat-slide-toggle-bar|toggle bar override"
"T6|canopy-ui/projects/canopy-ui/src/lib|MatMomentDateModule|moment date adapter"
"T7|canopy-ui/projects/canopy-ui/src/lib|\.mat-header-cell|data table density styles"
"T8|canopy-ui/projects/canopy-ui/src/lib|MatChipList|pre-MDC chips"
"T9|canopy-ui/projects/canopy-ui/src/lib|thumbLabel|pre-MDC slider inputs"
"T10|canopy-ui/projects/canopy-ui/src/lib|\.mat-ink-bar|tab ink bar override"
"T11|canopy-ui/projects/canopy-ui/src/lib|\.mat-dialog-container|dialog padding override"
"T12|canopy-ui/projects/canopy-ui/src/lib|\.mat-simple-snackbar|snackbar override"
"T13|canopy-ui/projects/canopy-ui/src/lib|\.mat-tooltip|tooltip class override"
"T14|canopy-ui/projects/canopy-ui/src/lib|\.mat-progress-bar-fill|progress fill override"
"T15|canopy-ui/projects/canopy-ui/src/lib retail-web/src/app|fxLayout|flex-layout usage"
"T16|canopy-ui/projects/canopy-ui/src/lib|bypassSecurityTrustHtml|disclosure innerHTML"
"T17|canopy-ui/projects/canopy-ui/src/lib|mat-header-cell|spec asserting Material internals"
"T18|retail-web/src/polyfills.ts|zone.js/dist/zone|deep zone.js import"
"T19|retail-web/src/app|CanLoad|CanLoad guards"
"T20|retail-web/src/app|HttpClientXsrfModule|module-based HttpClient and XSRF"
"T21|retail-web/src/app|relativeLinkResolution|legacy relative link resolution"
"T22|retail-web/src/app|LanternModule|View Engine SDK integration"
"T23|retail-web/src/app|UntypedFormBuilder|untyped forms leftovers"
"T24|retail-web/src/app|toPromise|toPromise in cards and statements"
"T25|retail-web/e2e|protractor|Protractor e2e"
"T26|retail-web/tsconfig.json|\"strict\": false|loose TypeScript config"
"T27|retail-web/package.json|overrides|pinned transitive overrides"
"T28|retail-web/.npmrc|strict-ssl|registry security smell"
"T29|retail-web/SPIKE_NOTES.md|spike|abandoned Angular 15 spike"
"T30|business-web/src|::ng-deep|Canopy and Material internals from a consumer"
"T31|business-web/package.json|\"rxjs\": \"6|RxJS 6"
"T32|business-web/tslint.json|codelyzer|TSLint and codelyzer"
"T33|business-web/.npmrc|engine-strict|Node 14 floor enforced"
"T34|business-web/Jenkinsfile|nodejs14-rhel7|out of support build agent"
"T35|iris-widget/src retail-web/src/index.html|meridian-iris-widget|two Angular bundles, one Zone.js"
"T36|keystone-web/src|legacy-|mixed MatLegacy and MDC"
"T37|ledgerline-web/patches|canopy-ui|patch-package patch against Canopy"
"T38|ledgerline-web/src|canopy-compat|local chips reimplementation"
"T39|lantern-sdk/tsconfig.lib.prod.json|enableIvy|View Engine build"
"T40|retail-web/angular.json business-web/angular.json|build-angular:browser|Webpack browser builder"
"T41|retail-web/ngsw-config.json|assetGroups|service worker pinned to the app"
"T42|retail-web/src/locale|messages.es|dual i18n mechanisms"
"T43|business-web/src canopy-ui/projects|\r|CRLF files"
"T44|platform-services/beacon-notifications/src/main|equence|untested per-customer ordering"
"T45|platform-services/statements-api|fastapi|no test framework configured"
"T46|platform-services/pii-vault-service/src/main|oken|thin coverage on tokenisation"
"T47|business-web/package.json|\"@meridian/canopy-ui\": \"3.5.0\"|consumer pinned to an old Canopy"
"T48|canopy-ui/CONTRIBUTING.md|frozen|public API contract"
)

wanted() {
  [[ ${#WANTED[@]} -eq 0 ]] && return 0
  local id="$1"
  for want in "${WANTED[@]}"; do [[ "${want}" == "${id}" ]] && return 0; done
  return 1
}

printf '%-5s %-9s %s\n' "TRAP" "STATE" "WHAT"
printf '%-5s %-9s %s\n' "----" "-----" "----"

for row in "${TRAPS[@]}"; do
  IFS='|' read -r id paths signature note <<< "${row}"
  wanted "${id}" || continue

  found_path=""
  for candidate in ${paths}; do
    if [[ -e "${candidate}" ]]; then found_path="${found_path} ${candidate}"; fi
  done

  if [[ -z "${found_path// /}" ]]; then
    printf '%-5s %-9s %s\n' "${id}" "PENDING" "${note} (not built yet: ${paths})"
    pending=$((pending + 1))
    continue
  fi

  # shellcheck disable=SC2086
  if grep -rqI --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=coverage \
       -e "${signature}" ${found_path} 2>/dev/null; then
    printf '%-5s %-9s %s\n' "${id}" "PRESENT" "${note}"
    present=$((present + 1))
  else
    printf '%-5s %-9s %s\n' "${id}" "MISSING" "${note} — expected ${signature} under${found_path}"
    missing=$((missing + 1))
    MISSING_IDS+=("${id}")
  fi
done

echo
echo "present ${present}, missing ${missing}, pending ${pending}"

if [[ ${missing} -gt 0 ]]; then
  echo "missing: ${MISSING_IDS[*]}"
  echo "a missing trap means it was removed or never placed. Check _demo-notes/TRAPS.md."
fi

if [[ ${STRICT} -eq 1 && ${missing} -gt 0 ]]; then
  exit 1
fi
exit 0
