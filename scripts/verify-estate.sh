#!/usr/bin/env bash
#
# Acceptance checks for the Meridian estate. Prints a pass / fail table.
#
#   scripts/verify-estate.sh              everything
#   scripts/verify-estate.sh --quick      skip installs, builds and test runs
#   scripts/verify-estate.sh retail-web   one component only
#
# The estate is one workspace directory with each repository cloned under its GitHub name
# (meridian-retail-web, meridian-platform-services, ...). This repository is the workspace root
# documentation and is expected to sit in the same directory; MERIDIAN_WORKSPACE overrides that.
# Repositories that are not checked out are reported SKIP, not FAIL.

set -uo pipefail
cd "$(dirname "$0")/.."
ROOT="$(pwd)"
WORKSPACE="${MERIDIAN_WORKSPACE:-$(cd "${ROOT}/.." && pwd)}"

COMPONENTS="retail-web business-web keystone-web ledgerline-web iris-widget lantern-sdk
            platform-services mock-external platform-tooling"

D() { printf '%s' "${WORKSPACE}/meridian-$1"; }   # checkout of a component repository
G() { git -C "$(D "$1")" "${@:2}"; }                # git in that checkout

QUICK=0
ONLY=()
for arg in "$@"; do
  case "${arg}" in
    --quick) QUICK=1 ;;
    -*) echo "unknown flag: ${arg}" >&2; exit 2 ;;
    *) ONLY+=("${arg}") ;;
  esac
done

PASS=0; FAIL=0; SKIP=0
FAILED_CHECKS=()

row() { # state, component, check, detail
  printf '%-6s %-18s %-34s %s\n' "$1" "$2" "$3" "${4:-}"
}
pass() { row PASS "$1" "$2" "${3:-}"; PASS=$((PASS+1)); }
skip() { row SKIP "$1" "$2" "${3:-}"; SKIP=$((SKIP+1)); }
fail() { row FAIL "$1" "$2" "${3:-}"; FAIL=$((FAIL+1)); FAILED_CHECKS+=("$1/$2"); }

selected() {
  [[ ${#ONLY[@]} -eq 0 ]] && return 0
  for want in "${ONLY[@]}"; do [[ "${want}" == "$1" ]] && return 0; done
  return 1
}

# the Jenkins agents export CHROME_BIN; on a laptop point karma at whatever Chrome is on PATH
if [[ -z "${CHROME_BIN:-}" ]]; then
  for bin in google-chrome google-chrome-stable chromium chromium-browser; do
    command -v "${bin}" >/dev/null 2>&1 && export CHROME_BIN="$(command -v "${bin}")" && break
  done
fi

use_node() { # honour the component's .nvmrc
  local dir="$1"
  [[ -s "${HOME}/.nvm/nvm.sh" ]] || return 1
  # shellcheck disable=SC1091
  . "${HOME}/.nvm/nvm.sh"
  if [[ -f "${dir}/.nvmrc" ]]; then nvm use "$(cat "${dir}/.nvmrc")" >/dev/null 2>&1; fi
}

run() { ( cd "$1" && shift && "$@" ) >/dev/null 2>&1; }

printf '%-6s %-18s %-34s %s\n' STATE COMPONENT CHECK DETAIL
printf '%-6s %-18s %-34s %s\n' ----- --------- ----- ------

# ---------------------------------------------------------------- repository wide

if selected repo; then
  for required in PORTS.md README.md .gitignore; do
    [[ -f "${required}" ]] && pass repo "root file ${required}" \
                           || fail repo "root file ${required}" "missing"
  done

  present=0
  for c in ${COMPONENTS}; do
    [[ -d "$(D "${c}")/.git" ]] && present=$((present+1))
  done
  pass repo "repositories checked out" "${present}/9 under ${WORKSPACE}"
fi

# Repository wide checks, run in each checkout that is present
for c in ${COMPONENTS}; do
  selected "${c}" || continue
  [[ -d "$(D "${c}")/.git" ]] || continue

  if scripts/check-forbidden-strings.sh worktree "$(D "${c}")" >/dev/null 2>&1; then
    pass "${c}" "no forbidden strings (worktree)"
  else
    fail "${c}" "no forbidden strings (worktree)" "run the script for the matches"
  fi

  if [[ ${QUICK} -eq 1 ]]; then
    skip "${c}" "no forbidden strings (history)" "--quick"
  elif scripts/check-forbidden-strings.sh history "$(D "${c}")" >/dev/null 2>&1; then
    pass "${c}" "no forbidden strings (history)"
  else
    fail "${c}" "no forbidden strings (history)"
  fi

  if G "${c}" ls-files | grep -qE '(^|/)node_modules/|(^|/)dist/|(^|/)coverage/'; then
    fail "${c}" "no build output committed"
  else
    pass "${c}" "no build output committed"
  fi

  # Ranges are only wrong in the workspaces we install: a publishable library manifest (one that
  # declares peers) states ranges on purpose (Canopy's Angular 14 peer range, CNPY-2140).
  ranged="$(G "${c}" ls-files --full-name '*package.json' | python3 -c '
import json, sys, os
root = sys.argv[1]
for path in sys.stdin.read().split():
    path = os.path.join(root, path)
    with open(path) as handle:
        try:
            pkg = json.load(handle)
        except ValueError:
            continue
    if pkg.get("peerDependencies"):
        continue
    for block in ("dependencies", "devDependencies"):
        for name, spec in (pkg.get(block) or {}).items():
            if isinstance(spec, str) and spec[:1] in "^~":
                print(f"{os.path.relpath(path, root)} {name} {spec}")
' "$(D "${c}")")"
  if [[ -n "${ranged}" ]]; then
    fail "${c}" "exact dependency versions" "$(echo "${ranged}" | head -1) (+$(($(echo "${ranged}" | wc -l) - 1)) more)"
  else
    pass "${c}" "exact dependency versions"
  fi
done

# ---------------------------------------------------------------- Angular components
# component | min commits | ticket key
ANGULAR="retail-web:180:MOL business-web:200:MBZ keystone-web:140:KEY
         ledgerline-web:120:LDG iris-widget:40:IRIS lantern-sdk:30:LNTN"

for entry in ${ANGULAR}; do
  IFS=':' read -r component min_commits key <<< "${entry}"
  selected "${component}" || continue

  if [[ ! -d "$(D "${component}")/.git" ]]; then
    skip "${component}" "repository checked out" "no checkout at $(D "${component}")"
    continue
  fi

  [[ -f "$(D "${component}")/package.json" ]] && pass "${component}" "package.json present" \
                                       || fail "${component}" "package.json present"
  [[ -f "$(D "${component}")/.nvmrc" ]] && pass "${component}" ".nvmrc present" \
                                 || fail "${component}" ".nvmrc present"

  lock=0
  for candidate in package-lock.json npm-shrinkwrap.json yarn.lock; do
    [[ -f "$(D "${component}")/${candidate}" ]] && lock=1
  done
  [[ ${lock} -eq 1 ]] && pass "${component}" "lockfile committed" \
                      || fail "${component}" "lockfile committed"

  commits="$(G "${component}" rev-list --count HEAD 2>/dev/null || echo 0)"
  if [[ "${commits}" -ge "${min_commits}" ]]; then
    pass "${component}" "history depth" "${commits} >= ${min_commits}"
  else
    fail "${component}" "history depth" "${commits} < ${min_commits}"
  fi

  authors="$(G "${component}" log --format='%an' 2>/dev/null | sort -u | wc -l | tr -d ' ')"
  if [[ "${authors}" -ge 4 ]]; then
    pass "${component}" "author spread" "${authors} authors"
  else
    fail "${component}" "author spread" "only ${authors} authors"
  fi

  if G "${component}" tag --list 'v*' | grep -q .; then
    pass "${component}" "release tags" "$(G "${component}" tag --list 'v*' | tr '\n' ' ')"
  else
    fail "${component}" "release tags" "none found"
  fi

  if [[ ${QUICK} -eq 1 ]]; then
    skip "${component}" "install, test, build" "--quick"
    continue
  fi

  use_node "$(D "${component}")"

  if run "$(D "${component}")" npm ci; then
    pass "${component}" "npm ci"
  else
    fail "${component}" "npm ci" "is Verdaccio running on 4873?"
    continue
  fi

  if grep -q '"lint"' "$(D "${component}")/package.json"; then
    run "$(D "${component}")" npm run lint && pass "${component}" "lint" \
                                    || fail "${component}" "lint"
  else
    skip "${component}" "lint" "no lint script"
  fi

  if grep -q '"test"' "$(D "${component}")/package.json"; then
    # every karma workspace defines the ChromeHeadlessCI launcher (the Jenkins agents run as
    # root, no sandbox); ledgerline is jest and ignores the extra flags via --
    if grep -q '"test": "jest' "$(D "${component}")/package.json"; then
      run "$(D "${component}")" npm test -- --ci --coverage
    else
      run "$(D "${component}")" npm test -- --watch=false --browsers=ChromeHeadlessCI --code-coverage
    fi && pass "${component}" "unit tests" || fail "${component}" "unit tests"
  else
    skip "${component}" "unit tests" "no test script"
  fi

  # line coverage from coverage-summary.json where the reporter writes one, else summed from lcov.info;
  # the three apps with a stated target in the brief must land within three points of it
  pct="$(python3 - "$(D "${component}")" <<'PY' 2>/dev/null
import glob, json, sys
root = sys.argv[1] + "/coverage"
summaries = glob.glob(root + "/**/coverage-summary.json", recursive=True)
if summaries:
    print(json.load(open(summaries[0]))["total"]["lines"]["pct"]); sys.exit()
lf = lh = 0
for path in glob.glob(root + "/**/lcov.info", recursive=True):
    for line in open(path, errors="ignore"):
        if line.startswith("LF:"): lf += int(line[3:])
        elif line.startswith("LH:"): lh += int(line[3:])
if lf: print(round(100.0 * lh / lf, 1))
PY
)"
  case "${component}" in
    retail-web) target=34 ;; business-web) target=22 ;; *) target="" ;;
  esac
  if [[ -z "${pct}" ]]; then
    skip "${component}" "coverage reported" "no coverage output"
  elif [[ -z "${target}" ]]; then
    pass "${component}" "coverage reported" "${pct}% lines"
  elif python3 -c "import sys; sys.exit(0 if abs(float('${pct}') - ${target}) <= 3 else 1)"; then
    pass "${component}" "coverage near target" "${pct}% lines, target ${target}"
  else
    fail "${component}" "coverage near target" "${pct}% lines, target ${target} ±3"
  fi

  run "$(D "${component}")" npm run build -- --configuration production \
    && pass "${component}" "production build" || fail "${component}" "production build"
done

# retail-web ships two locales
if selected retail-web && [[ -d "$(D retail-web)/dist" ]]; then
  if [[ -d "$(D retail-web)/dist/retail-web/en-US" && -d "$(D retail-web)/dist/retail-web/es" ]]; then
    pass retail-web "localised builds" "en-US and es"
  else
    fail retail-web "localised builds" "expected en-US and es output"
  fi
fi

# ---------------------------------------------------------------- lantern-sdk packaging
if selected lantern-sdk && [[ -d "$(D lantern-sdk)/dist" ]]; then
  if grep -rqI -e '"ngcc_version"' -e '__ivy_ngcc__' -e 'ɵɵngDeclareComponent' "$(D lantern-sdk)/dist" 2>/dev/null; then
    fail lantern-sdk "View Engine output (LNTN-401)" "Ivy markers found; consumers on ngcc expect View Engine"
  else
    pass lantern-sdk "View Engine output (LNTN-401)" "no Ivy markers"
  fi
fi

# ---------------------------------------------------------------- platform-services
if selected platform-services; then
  if [[ ! -d "$(D platform-services)/.git" ]]; then
    skip platform-services "repository checked out" "no checkout at $(D platform-services)"
  else
    [[ -f "$(D platform-services)"/COVERAGE.md ]] && pass platform-services "COVERAGE.md" \
                                           || fail platform-services "COVERAGE.md" "missing"
    [[ -d "$(D platform-services)"/copybooks ]] && pass platform-services "copybooks" \
                                         || fail platform-services "copybooks" "missing"

    if [[ -d "$(D platform-services)"/libs/ts/domain-fixtures ]]; then
      if [[ ${QUICK} -eq 1 ]]; then
        skip platform-services "domain-fixtures tests" "--quick"
      elif run "$(D platform-services)"/libs/ts/domain-fixtures npx jest --runInBand; then
        pass platform-services "domain-fixtures tests"
      else
        fail platform-services "domain-fixtures tests"
      fi
    else
      fail platform-services "domain-fixtures present" "missing"
    fi

    if [[ ${QUICK} -eq 0 ]]; then
      # the Makefile knows which JDK each service is pinned to (Java 11 for the Boot 2.7 fleet,
      # Java 17 for entitlements) and installs common-starter first
      if run "$(D platform-services)" make test; then
        pass platform-services "make test (mvn verify + jest)"
      else
        fail platform-services "make test (mvn verify + jest)" "run make test in meridian-platform-services"
      fi
    fi

    # PLAT-2310: the two Python services are covered by contract tests in platform-tooling, not pytest
    for py in statements-api exposure-calc; do
      dir="$(D platform-services)/services/${py}"
      [[ -d "${dir}" ]] || { skip "${py}" "no test framework (PLAT-2310)" "not built"; continue; }
      if find "${dir}" \( -name 'test_*.py' -o -name 'pytest.ini' -o -name 'tox.ini' \) \
           | grep -q .; then
        fail "${py}" "no test framework (PLAT-2310)" "unexpected pytest layout found"
      else
        pass "${py}" "no test framework (PLAT-2310)"
      fi
    done
  fi
fi

# ---------------------------------------------------------------- mock-external
if selected mock-external; then
  if [[ ! -d "$(D mock-external)/.git" ]]; then
    skip mock-external "repository checked out" "no checkout at $(D mock-external)"
  else
    for script in estate-up.sh estate-down.sh smoke.sh; do
      if [[ -x "$(D mock-external)/${script}" ]]; then
        pass mock-external "${script} executable"
      else
        fail mock-external "${script} executable" "missing or not +x"
      fi
    done
  fi
fi

# ---------------------------------------------------------------- platform-tooling
if selected platform-tooling; then
  if [[ ! -d "$(D platform-tooling)/.git" ]]; then
    skip platform-tooling "repository checked out" "no checkout at $(D platform-tooling)"
  else
    for var in meridianNodePipeline meridianJavaPipeline; do
      [[ -f "$(D platform-tooling)/jenkins-shared-library/vars/${var}.groovy" ]] \
        && pass platform-tooling "${var}.groovy" \
        || fail platform-tooling "${var}.groovy" "missing"
    done

    if command -v groovyc >/dev/null 2>&1 && [[ ${QUICK} -eq 0 ]]; then
      if groovyc -d /tmp/groovy-verify "$(D platform-tooling)"/jenkins-shared-library/vars/*.groovy \
           >/dev/null 2>&1; then
        pass platform-tooling "groovy syntax"
      else
        fail platform-tooling "groovy syntax"
      fi
    else
      skip platform-tooling "groovy syntax" "groovyc unavailable"
    fi

    # every Jenkinsfile must reference an agent label the platform actually offers
    labels='nodejs14-rhel7|nodejs16-rhel8|nodejs18-rhel9|maven-jdk11-rhel8|maven-jdk17-rhel9'
    bad=0
    while IFS= read -r jf; do
      grep -qE "${labels}" "${jf}" || { bad=1; echo "    unknown agent label in ${jf}"; }
    done < <(find "${WORKSPACE}"/meridian-*/ -name 'Jenkinsfile*' -not -path '*/node_modules/*' -not -path '*/.venvs/*' 2>/dev/null)
    [[ ${bad} -eq 0 ]] && pass platform-tooling "Jenkinsfile agent labels" \
                       || fail platform-tooling "Jenkinsfile agent labels"

    if command -v helm >/dev/null 2>&1 && [[ -d "$(D platform-tooling)"/helm ]]; then
      helm lint "$(D platform-tooling)"/helm/* >/dev/null 2>&1 \
        && pass platform-tooling "helm lint" || fail platform-tooling "helm lint"
    else
      skip platform-tooling "helm lint" "helm unavailable"
    fi
  fi
fi

echo
echo "pass ${PASS}, fail ${FAIL}, skip ${SKIP}"
if [[ ${FAIL} -gt 0 ]]; then
  echo "failed: ${FAILED_CHECKS[*]}"
  exit 1
fi
exit 0
