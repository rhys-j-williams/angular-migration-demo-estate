# Release checklist, keystone-web

Run before cutting `release/*`. Ten minutes if nothing is wrong.

1. `npm ci && npm run lint && npm test -- --watch=false && npm run build:prod && npm run csp:check`
2. `grep -rn "password" src/app --include=*.ts | grep -v spec`. Expected hits, all in
   `credential-form.component.ts` and `idp-client.service.ts` (`submitCredentials` body). Anything
   else: stop, tag GIS on the PR.
3. `grep -rn "atob\|jwt_decode\|jwtDecode" src/`. Expected: nothing.
4. `grep -rn "localStorage\|sessionStorage" src/app --include=*.ts | grep -v spec`. Expected:
   `credential-form.component.ts` only (remembered username, KEY-0388).
5. Check the mock IdP flow end to end locally (`docs/runbooks/local-login-flow.md`), including one
   OTP failure and one rate limit (six bad passwords).
6. Confirm `dist/keystone-web/index.html` has SRI `integrity` attributes on all three scripts.
7. Confirm the Canopy sprite is in `dist/keystone-web/assets/canopy/`.
8. Tag build in Jenkins. Watch the downstream smoke jobs for retail-web, business-web and
   ledgerline-web. If any go red, roll back before triaging (INC0142270 lesson).
9. Announce in `#identity-platform` and `#digital-release-train`.

Do not skip 2 through 4 because "nothing changed in auth". KEY-2230 came from a change to the
locked-out screen.
