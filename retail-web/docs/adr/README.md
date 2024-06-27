# Architecture decision records, Meridian Online

Numbered, immutable once accepted. Superseding an ADR means writing a new one and linking both
ways. Reviews go to @meridian/cswt-architecture via CODEOWNERS; they are slow, plan for it.

| # | Title | Status | Date |
|---|---|---|---|
| 0001 | Angular CLI application, single repo | Accepted | 2020-09 |
| 0002 | Keystone authorization code + PKCE, no implicit flow | Accepted | 2020-10 |
| 0003 | NgRx per feature module | Accepted | 2020-11 |
| 0004 | Runtime configuration via env.json and APP_INITIALIZER | Accepted | 2020-11 |
| 0005 | Angular Material through Canopy | Accepted | 2021-03 |
| 0006 | Lazy feature modules with entitlement CanLoad guards | Accepted | 2021-04 |
| 0007 | Splunk HEC for client telemetry, Lantern for product analytics | Accepted | 2021-06 |
| 0008 | Session storage for tokens (GIS-STD-021) | Accepted | 2021-11 |
| 0009 | Two i18n mechanisms, $localize plus ngx-translate | Accepted | 2022-02 |
| 0010 | Service worker for shell caching only | Accepted | 2022-08 |
| 0011 | Angular 14 upgrade | Accepted | 2022-11 |
| 0012 | Untyped forms retained in profile and onboarding | Accepted | 2023-01 |
| 0013 | Iris chat widget moved out of retail-web | Accepted | 2023-09 |
| 0014 | Defer the Angular 15+ upgrade to 2025 | Accepted | 2024-06 |

Only 0005 and 0014 are in this directory in full. The rest were written in the wiki before we moved
ADRs into the repo (MOL-2905) and were never migrated. The wiki space is `CSWT-ARCH`, search by
number.
