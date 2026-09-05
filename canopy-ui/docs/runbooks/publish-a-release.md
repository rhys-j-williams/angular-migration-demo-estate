# Runbook: publish a Canopy release

Audience: Canopy design system engineers. Nobody else publishes Canopy.
Last exercised: 3.7.2, November 2024 (S. Whitfield).

## Preconditions

- `develop` is green on Jenkins (`cswt/canopy-ui/develop`).
- `CHANGELOG.md` has a heading for the version you are cutting, moved out of `[Unreleased]`.
- `projects/canopy-ui/package.json` `version` matches that heading. `npm run changelog:check`
  passes locally.
- `docs/api/*.api.md` is up to date (`npm run api:check`). If the report changed, the version bump
  must be at least a minor. If a symbol was removed, stop: that is a major, and CONTRIBUTING.md
  says why.
- You have a change record if we are inside a freeze window. Outside a freeze, none needed;
  Canopy is a library, not a deployment.

## Steps

1. Merge `develop` to `main` through a pull request titled
   `Merge develop into main for canopy-ui vX.Y.Z`. Two approvals as usual.
2. Tag `main`:

   ```
   git tag -a canopy-ui/vX.Y.Z -m "canopy-ui X.Y.Z"
   git push origin canopy-ui/vX.Y.Z
   ```

   The tag must be namespaced `canopy-ui/`. The monorepo has other components with their own
   version lines; an unprefixed `v3.7.2` will publish nothing and will confuse the release
   dashboard.
3. Jenkins picks the tag up (`cswt/canopy-ui/tags`) and runs `scripts/publish.sh`. The script
   reads the version from the tag, refuses to run if it does not match `package.json`, builds,
   stamps `gitHead`, and publishes to the registry in `.npmrc`.
4. Check the package page on Artifactory. `gitHead` in `package.json` should be the tagged commit.
5. Post in `#canopy-consumers` with the CHANGELOG entry. Tag the consumer team leads if there is
   a deprecation.
6. Bump `develop` to the next patch version with `-dev` is NOT our convention. Leave the version
   alone until the next release is being cut.

## Local publish (for testing a consumer against an unreleased build)

Use the estate Verdaccio, never Artifactory.

```
NPM_REGISTRY=http://localhost:4873 bash scripts/publish.sh canopy-ui/v3.7.2
```

Point the consumer's `.npmrc` at the same registry and `npm install @meridian/canopy-ui@3.7.2`.
Verdaccio will refuse to overwrite an existing version; `npm unpublish --force` it first if you are
iterating. Do not commit the consumer's `.npmrc` change.

## If it goes wrong

- Publish succeeded but the build is broken: publish a patch. Do not unpublish from Artifactory;
  the retention policy makes the version reappear from the remote cache and consumers who already
  installed it will not notice either way. `npm deprecate` the bad version with the ticket key.
- Publish failed at `npm publish` with 403: the Jenkins credential `artifactory-npm-canopy` has
  expired. Platform engineering rotate it; raise a PLAT ticket, do not use a personal token.
- Tag created from a commit that is not on `main` (it has happened): delete the tag locally and
  remotely, re-tag from `main`. Jenkins will have failed the version check anyway.
- 3.4.0 / INC0412876: someone published from a laptop with uncommitted changes. This is why
  `publish.sh` checks for a clean tree and why the credential is no longer in anyone's
  `~/.npmrc`.
