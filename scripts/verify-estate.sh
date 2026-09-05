#!/usr/bin/env bash
#
# Acceptance checks for the Meridian estate. Prints a pass / fail table.
#
#   scripts/verify-estate.sh              everything
#   scripts/verify-estate.sh --quick      skip installs, builds and test runs
#   scripts/verify-estate.sh canopy-ui    one component only
#
# Components that have not been built yet are reported SKIP, not FAIL, so the script is useful
# while the estate is still going up.

set -uo pipefail
cd "$(dirname "$0")/.."
ROOT="$(pwd)"

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
  if scripts/check-forbidden-strings.sh worktree >/dev/null 2>&1; then
    pass repo "no forbidden strings (worktree)"
  else
    fail repo "no forbidden strings (worktree)" "run the script for the matches"
  fi

  if scripts/check-forbidden-strings.sh history >/dev/null 2>&1; then
    pass repo "no forbidden strings (history)"
  else
    fail repo "no forbidden strings (history)"
  fi

  for required in CLAUDE.md BUILD_LOG.md PORTS.md README.md .gitignore; do
    [[ -f "${required}" ]] && pass repo "root file ${required}" \
                           || fail repo "root file ${required}" "missing"
  done

  for required in README.md TRAPS.md PLAYBOOKS.md KNOWLEDGE.md ASK-DEVIN-PROMPTS.md \
                  MIGRATION-REPORT-TEMPLATE.md expected-ng-update-15-output.md; do
    [[ -f "_demo-notes/${required}" ]] && pass repo "handover _demo-notes/${required}" \
                                       || fail repo "handover _demo-notes/${required}" "missing"
  done

  if git ls-files | grep -qE '(^|/)node_modules/|(^|/)dist/|(^|/)coverage/'; then
    fail repo "no build output committed"
  else
    pass repo "no build output committed"
  fi

  if git grep -nE '"[^"]+": "[\^~]' -- '**/package.json' >/dev/null 2>&1; then
    fail repo "exact dependency versions" "caret or tilde range found"
  else
    pass repo "exact dependency versions"
  fi

  trap_out="$(scripts/verify-traps.sh 2>/dev/null | tail -1)"
  if [[ "${trap_out}" == *"missing 0"* ]]; then
    pass repo "traps intact" "${trap_out}"
  else
    fail repo "traps intact" "${trap_out}"
  fi
fi

# ---------------------------------------------------------------- Angular components
# component | min commits | required tags
ANGULAR="canopy-ui:220: retail-web:300: business-web:200: keystone-web:150:
         ledgerline-web:120: iris-widget:40: lantern-sdk:30:"

for entry in ${ANGULAR}; do
  IFS=':' read -r component min_commits _ <<< "${entry}"
  selected "${component}" || continue

  if [[ ! -d "${component}" ]]; then
    skip "${component}" "component built" "directory not present"
    continue
  fi

  [[ -f "${component}/package.json" ]] && pass "${component}" "package.json present" \
                                       || fail "${component}" "package.json present"
  [[ -f "${component}/.nvmrc" ]] && pass "${component}" ".nvmrc present" \
                                 || fail "${component}" ".nvmrc present"

  lock=0
  for candidate in package-lock.json npm-shrinkwrap.json yarn.lock; do
    [[ -f "${component}/${candidate}" ]] && lock=1
  done
  [[ ${lock} -eq 1 ]] && pass "${component}" "lockfile committed" \
                      || fail "${component}" "lockfile committed"

  commits="$(git log --oneline -- "${component}" 2>/dev/null | wc -l | tr -d ' ')"
  if [[ "${commits}" -ge "${min_commits}" ]]; then
    pass "${component}" "history depth" "${commits} >= ${min_commits}"
  else
    fail "${component}" "history depth" "${commits} < ${min_commits}"
  fi

  authors="$(git log --format='%an' -- "${component}" 2>/dev/null | sort -u | wc -l | tr -d ' ')"
  if [[ "${authors}" -ge 5 ]]; then
    pass "${component}" "author spread" "${authors} authors"
  else
    fail "${component}" "author spread" "only ${authors} authors"
  fi

  if git tag --list "${component}/*" | grep -q .; then
    pass "${component}" "namespaced tags" "$(git tag --list "${component}/*" | tr '\n' ' ')"
  else
    fail "${component}" "namespaced tags" "none found"
  fi

  if [[ ${QUICK} -eq 1 ]]; then
    skip "${component}" "install, test, build" "--quick"
    continue
  fi

  use_node "${component}"

  if run "${component}" npm ci; then
    pass "${component}" "npm ci"
  else
    fail "${component}" "npm ci" "is Verdaccio running on 4873?"
    continue
  fi

  if grep -q '"lint"' "${component}/package.json"; then
    run "${component}" npm run lint && pass "${component}" "lint" \
                                    || fail "${component}" "lint"
  else
    skip "${component}" "lint" "no lint script"
  fi

  if grep -q '"test"' "${component}/package.json"; then
    run "${component}" npm test -- --watch=false --browsers=ChromeHeadlessNoSandbox \
      && pass "${component}" "unit tests" || fail "${component}" "unit tests"
  else
    skip "${component}" "unit tests" "no test script"
  fi

  summary="${component}/coverage/coverage-summary.json"
  if [[ -f "${summary}" ]]; then
    pct="$(python3 -c "import json,sys;print(json.load(open('${summary}'))['total']['lines']['pct'])" 2>/dev/null)"
    pass "${component}" "coverage reported" "${pct}% lines"
  else
    skip "${component}" "coverage reported" "no coverage-summary.json"
  fi

  run "${component}" npm run build -- --configuration production \
    && pass "${component}" "production build" || fail "${component}" "production build"
done

# retail-web ships two locales
if selected retail-web && [[ -d retail-web/dist ]]; then
  if [[ -d retail-web/dist/retail-web/en-US && -d retail-web/dist/retail-web/es ]]; then
    pass retail-web "localised builds" "en-US and es"
  else
    fail retail-web "localised builds" "expected en-US and es output"
  fi
fi

# ---------------------------------------------------------------- lantern-sdk packaging
if selected lantern-sdk && [[ -d lantern-sdk/dist ]]; then
  if grep -rqI -e '"ngcc_version"' -e '__ivy_ngcc__' -e 'ɵɵngDeclareComponent' lantern-sdk/dist 2>/dev/null; then
    fail lantern-sdk "View Engine output (T39)" "Ivy markers found — the trap is gone"
  else
    pass lantern-sdk "View Engine output (T39)" "no Ivy markers"
  fi
fi

# ---------------------------------------------------------------- platform-services
if selected platform-services; then
  if [[ ! -d platform-services ]]; then
    skip platform-services "component built" "directory not present"
  else
    [[ -f platform-services/COVERAGE.md ]] && pass platform-services "COVERAGE.md" \
                                           || fail platform-services "COVERAGE.md" "missing"
    [[ -d platform-services/copybooks ]] && pass platform-services "copybooks" \
                                         || fail platform-services "copybooks" "missing"

    if [[ -d platform-services/libs/ts/domain-fixtures ]]; then
      if [[ ${QUICK} -eq 1 ]]; then
        skip platform-services "domain-fixtures tests" "--quick"
      elif run platform-services/libs/ts/domain-fixtures npx jest --runInBand; then
        pass platform-services "domain-fixtures tests"
      else
        fail platform-services "domain-fixtures tests"
      fi
    else
      fail platform-services "domain-fixtures present" "missing"
    fi

    if [[ ${QUICK} -eq 0 ]]; then
      while IFS= read -r pom; do
        service="$(basename "$(dirname "${pom}")")"
        if run "$(dirname "${pom}")" mvn -q -B verify; then
          pass "${service}" "mvn verify"
        else
          fail "${service}" "mvn verify"
        fi
      done < <(find platform-services -mindepth 2 -maxdepth 2 -name pom.xml 2>/dev/null)
    fi

    # T45: the two Python services must have no test framework at all
    for py in statements-api exposure-calc; do
      dir="platform-services/${py}"
      [[ -d "${dir}" ]] || { skip "${py}" "no test framework (T45)" "not built"; continue; }
      if find "${dir}" \( -name 'test_*.py' -o -name 'pytest.ini' -o -name 'tox.ini' \) \
           | grep -q .; then
        fail "${py}" "no test framework (T45)" "tests found — the trap is gone"
      else
        pass "${py}" "no test framework (T45)"
      fi
    done
  fi
fi

# ---------------------------------------------------------------- mock-external
if selected mock-external; then
  if [[ ! -d mock-external ]]; then
    skip mock-external "component built" "directory not present"
  else
    for script in estate-up.sh estate-down.sh smoke.sh; do
      if [[ -x "mock-external/${script}" ]]; then
        pass mock-external "${script} executable"
      else
        fail mock-external "${script} executable" "missing or not +x"
      fi
    done
  fi
fi

# ---------------------------------------------------------------- platform-tooling
if selected platform-tooling; then
  if [[ ! -d platform-tooling ]]; then
    skip platform-tooling "component built" "directory not present"
  else
    for var in meridianNodePipeline meridianJavaPipeline; do
      [[ -f "platform-tooling/jenkins-shared-library/vars/${var}.groovy" ]] \
        && pass platform-tooling "${var}.groovy" \
        || fail platform-tooling "${var}.groovy" "missing"
    done

    if command -v groovyc >/dev/null 2>&1 && [[ ${QUICK} -eq 0 ]]; then
      if groovyc -d /tmp/groovy-verify platform-tooling/jenkins-shared-library/vars/*.groovy \
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
    done < <(find . -name 'Jenkinsfile*' -not -path './node_modules/*' 2>/dev/null)
    [[ ${bad} -eq 0 ]] && pass platform-tooling "Jenkinsfile agent labels" \
                       || fail platform-tooling "Jenkinsfile agent labels"

    if command -v helm >/dev/null 2>&1 && [[ -d platform-tooling/helm ]]; then
      helm lint platform-tooling/helm/* >/dev/null 2>&1 \
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
