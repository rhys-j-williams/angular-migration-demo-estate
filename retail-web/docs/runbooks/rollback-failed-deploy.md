# Runbook: rolling back a failed Meridian Online deploy

Owner: @meridian/retail-digital on call. Last exercised: INC-2024-0388 (2024-03-21, the
ngsw.json mismatch). Last reviewed: 2024-09.

This is for the web tier only. If the BFF is the problem, that is PLAT's runbook
(`platform-services/retail-bff/RUNBOOK.md`) and you page them; rolling the web tier back does
not help and usually makes it worse because the old bundle expects the old BFF contract.

## Decide first

Rollback if any of these are true within 30 minutes of the deploy completing:

- Login success rate below 97% on the Splunk dashboard `MOL Prod Overview` (normal is 99.3+).
- JS error rate above 2 per 100 sessions (normal is under 0.3). Panel `client_errors_by_release`.
- Any Sev 1 or Sev 2 raised by the contact centre.
- White screen reports from more than one customer. One is usually a browser extension.

Do not rollback for:
- A single feature misbehaving that is behind a Semaphore flag. Turn the flag off instead
  (Semaphore console, `retail-web` environment, flag off, propagates in under five minutes).
- Translation mistakes in `es`. Ship a fix in the next train; do not roll the whole tier.

If it is 17:00-19:00 New York on a Thursday you are probably looking at the release deploy
itself. Check `#retail-digital-releases` before doing anything; the release manager may already
be on it.

## Rollback

The web tier is a static bundle behind the CDN with the service worker in front of it. There are
three layers to roll back and the order matters.

### 1. Helm

```
helm history retail-web -n retail-digital-prod
helm rollback retail-web <previous-revision> -n retail-digital-prod
```

The previous revision is normally the one before the top. Confirm the image tag on it matches the
last good release tag on `main` (`git tag --list 'v2026.*'`). Pods roll in about two minutes.

### 2. CDN

The Akamai-equivalent (see PORTS.md for the local stand-in; in prod it is whatever the platform
team have this year) caches `index.html` for 60 seconds and hashed assets forever. Purge
`index.html` and `ngsw.json` only:

```
platform-tooling/cdn/purge.sh retail-web /index.html /ngsw.json /es/index.html /es/ngsw.json
```

Do not purge `/*`. INC-2023-0917 was made worse by a full purge that sent every customer to
origin at once.

### 3. Service worker

This is the layer people forget. Customers with the bad release cached will keep getting it from
the worker until it sees a new `ngsw.json`. After the Helm rollback and the purge, the old
release's `ngsw.json` is being served again with a different hash than what the worker has, so it
will update on the customer's next navigation. That is the normal path and takes one page load.

If the bad release broke the worker itself (it happened once, MOL-3310), customers are stuck.
The escape hatch is the `ngsw-bypass` query parameter, and the contact centre script for that is
in the knowledge base under "Meridian Online white screen". You can also push `safety-worker.js`
by setting `SW_SAFETY_MODE=1` on the deployment, which serves Angular's safety worker at
`/ngsw-worker.js` and unregisters everything. Undo it once the fix is out or nobody gets the
worker back.

## Verify

- `curl -sI https://<prod-host>/index.html | grep -i x-release` shows the previous release tag.
- Splunk `client_errors_by_release` shows the new tag's error count flatlining.
- Log in as one of the UAT test customers (Vault path `secret/retail-web/uat-customers`, do not
  use your own account) and complete a small internal transfer in production. Yes, in production.
  The transfer goes between two test accounts at the test branch; Finance know.
- Post in `#retail-digital-releases` with the incident number, the Helm revisions and what you
  saw.

## Afterwards

Open an incident review ticket (`MOL`, label `incident-review`) within one business day. The
CAB will want the `tools/verify-ngsw.js` output from the failed build attached; it is in the
Jenkins artefacts for the release job.

Known gap: there is no automated rollback. It was on the platform roadmap for 2023 (PLAT-1401),
then 2024. Ask.
