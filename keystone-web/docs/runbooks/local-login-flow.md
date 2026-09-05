# Runbook: how a local login actually works

For when the page just sits there. The flow against `keystone-idp-mock` on 4400.

1. Browser hits `http://localhost:4202/`. `LoginPageComponent` finds no `txn` in the query string
   and calls `AuthSessionService.startLogin()`, which is `OAuthService.initCodeFlow()`. Full page
   redirect to `http://localhost:4400/authorize?...code_challenge...`.
2. The mock validates the client (`keystone-web`, redirect `http://localhost:4202/callback`),
   creates a transaction and redirects **back to us** at `/?txn=<id>`. This is the bit that
   confuses people: the IdP does not render its own login form, it delegates the UI to us and keeps
   the transaction state.
3. We render the credential form. On submit `IdpClientService.submitCredentials` POSTs
   `txn, username, password` as a form body to `http://localhost:4400/login` with
   `withCredentials`. The mock answers `303 -> /mfa?txn=...`. XHR follows redirects silently, so
   what we see is a 200 whose `url` contains `/mfa`. That is how `interpretCredentialResponse`
   knows MFA is required. 401 is bad credentials, 423 is locked.
4. `/mfa/otp?txn=` in our router. The mock's OTP is fixed (see its `users.ts`). POST to
   `http://localhost:4400/mfa` with `txn, code`. On success the mock issues `303 -> http://localhost:4202/callback?code=...&state=...`
   and again XHR follows it, so `res.url` is our callback URL. `AuthSessionService.followIdpRedirect`
   checks it is a registered callback with a `code` and then sets `location.href` to it.
5. `CallbackComponent` runs `tryLoginCodeFlow()`. The library exchanges the code with the mock's
   `/token` (PKCE verifier included), validates the id token against `/jwks`, and we land on
   `/signed-in` or, if `state` carried a step-up return URL, redirect to the calling application.

Things that go wrong:

- **Stuck on step 2 with a CORS error**: the mock's allowed origin list does not include 4202.
  Check `mock-external/keystone-idp-mock/src/clients.ts`.
- **"invalid_grant" at step 5**: you refreshed the callback page. Codes are single use. Start again.
- **Nothing happens after OTP**: `followIdpRedirect` rejected the URL. It only accepts the
  configured `redirectUri` origin+path. Look for `redirectTo` in the network tab.
- **Rate limit banner appears immediately**: the mock counts failures per username across
  restarts of *your* browser but not of itself. Restart the mock.
- **`Error retrieving icon cn:...` in the console**: the Canopy sprite did not copy. Check the
  `assets` glob in `angular.json` and that `@meridian/canopy-ui` actually installed from 4873.
