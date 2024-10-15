# Runbook: releasing iris-widget

The widget does not deploy anywhere by itself. A release is an artefact in Artifactory that the
host team picks up. This is deliberately not a service pipeline, although the Jenkinsfile uses the
service library because that is what the library supports.

## Steps

1. `develop` green. `npm run harness:check` passed in the pipeline (verify stage).
2. Bump `version` in `package.json` and add the CHANGELOG entry. Semver by the contract: a change
   to attributes, events, output paths or the Angular/Zone pairing is a **major**, even if it feels
   small. IRIS-0745 was a minor that renamed an attribute and it cost retail-web a hotfix.
3. Tag `iris-widget/v<version>` on `develop`. The pipeline publishes `dist/iris-widget/` to
   `cswt-generic/iris-widget/<version>/` and posts the manifest to `#retail-digital`.
4. Tell the retail-web release manager. Their vendor script pins a version; they bump it in their
   own ticket on their own train. We do not deploy to their environments.
5. If the Angular or Zone version changed: **do not tag until retail-web have confirmed their Zone
   matches `zoneJsCompatible`** in the manifest. ADR 0002. This is a conversation, not a pipeline
   step, because IRIS-0790 is still open.

## Freeze

Quarter-end freeze applies to us through retail-web: we can publish, they cannot vendor. So there is
no point publishing in the last two weeks of a quarter unless you enjoy being asked why nothing
happened.

## Hotfix

Branch `hotfix/IRIS-<n>-...` from the tag, fix, tag `iris-widget/v<patch>`, retail-web vendor and
deploy under their CAB reference. Has happened twice (1.6.1, 1.9.1).
