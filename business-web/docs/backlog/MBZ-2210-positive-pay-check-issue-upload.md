# MBZ-2210 Positive Pay check issue upload

Epic owner: product (Meridian Business). Engineering: @meridian/business-digital. Descoped once
already in 2020 (MBZ-790); back on the roadmap because Treasury Operations want to stop taking issue
files by email.

## What it is

Customers upload a check issue file (fixed width, one line per check: account, check number, amount,
issue date, payee) and Positive Pay exceptions come back from bff-business the next business day.
The exceptions screen itself is Ledgerline's problem for corporate; for small business it lands here.

## Shape

- Route `/positive-pay` replaces the placeholder in `legacy/positive-pay`. Keep the placeholder route
  until the feature flag `positivePay` is on in production, bookmarks exist.
- Upload reuses the NACHA upload component's drop zone and the 2MB / ASCII checks (MBZ-145). Parsing
  is a new pure TypeScript service alongside `nacha-parser.service.ts`, same shape, two
  characterisation tests to start with.
- Exceptions list on `cn-data-table`. Decision (pay / return) goes through the approvals store as a
  new `ApprovalItemKind`, so dual approval applies for free.
- bff-business endpoints do not exist yet. PLAT ticket to be raised; until then the fixture layer.

## Open questions

1. Does the issue file need dual approval on upload, or only on exception decisions? Compliance
   asked in 2020 and never answered.
2. Amount tolerance on match. Treasury Ops say exact; product wants a cents tolerance. Exact until
   told otherwise.
3. This is the first new feature since 2023. Whoever picks it up should read ADR 0004 first; do not
   pull Canopy 3.7 components in for the upload screen.
