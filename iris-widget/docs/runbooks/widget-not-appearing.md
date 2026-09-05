# Runbook: Iris not appearing on the retail-web help page

Severity: Sev 4 on its own. The help page falls back to the "chat unavailable" tile with the
contact number, so customers have a path. Sev 3 if the orchestrator is also down and it is a
statement-cycle week.

Not paged. Picked up by whoever is on retail-digital rotation the next working morning.

## Triage, in order

1. Open the help page in a browser with devtools. Look for lines starting `[iris-widget]`.
2. Network tab, filter `widgets/`. Is `iris.js` 200? Is `canopy-sprite.svg` 200?
   - 404 on `iris.js`: retail-web's build did not vendor the bundle, or vendored the hashed name and
     the template asks for the stable one. Check `iris.manifest.json` in their deployed assets
     against what `help-page.component.ts` loads. This was INC0155002 (their vendor script ran
     before our artefact was published; the pipeline ordering was fixed in TOOL-1140).
3. Is `customElements.get('meridian-iris-widget')` defined in the console?
   - No, and no `[iris-widget]` error: bundle loaded but threw before `main.ts` ran. Almost always
     a Zone version problem after a host deploy. Compare `zoneJsCompatible` in the manifest with
     retail-web's `package-lock.json` `zone.js` entry. ADR 0002.
   - No, with `Zone.js is not present`: script order. The help page appends our tag before
     Angular's own bundles finished. Has not happened since MOL-3811 but there is nothing stopping it.
4. Defined, launcher visible, panel opens, then a system message "Iris isn't available":
   orchestrator. Not us. `curl -i https://<host>/iris/v1/sessions -X POST -H "Authorization: Bearer ..."`.
   Hand to platform-services on call. Their runbook is in `platform-services/iris-orchestrator/docs/`.
5. Defined, launcher not visible: z-index or the host's CSS. Inspect `.iris-root`. If a Canopy
   variable is `unset`, retail-web's global reset has grown a rule that hits us (MOL-4188 pattern).

## Rollback

There is nothing to roll back on our side unless we shipped a bad bundle, in which case retail-web
re-vendors the previous version from Artifactory and redeploys. Their runbook, their change.

## After

Raise an IRIS ticket with the console output attached. If the cause was step 3, link IRIS-0790 and
add a comment saying it happened again.
