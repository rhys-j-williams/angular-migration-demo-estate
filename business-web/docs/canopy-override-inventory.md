# Canopy override inventory (MBZ-2140)

Owner: @meridian/business-digital. Status: in progress, not merged. Do not treat as complete.

Why. ADR 0004 pins Canopy at 3.5.0 until we know every place this application reaches into Canopy or
Material internals. The 3.6.0 bump (MBZ-2160, reverted the next day) proved we did not know. This is
the list, produced with grep, not with judgement. Each line needs an owner and a decision before the
pin moves: keep (Canopy 3.6 exposes an input for it), rewrite (Canopy does not and never will), or
delete (nobody remembers why it is there).

## `::ng-deep` and `ViewEncapsulation.None`

- `src/app/features/accounts/transaction-list/transaction-list.component.scss`
- `src/app/features/accounts/transaction-list/transaction-list.component.ts`
- `src/app/features/ach/ach-template-editor/ach-template-editor.component.scss`
- `src/app/features/ach/nacha-upload/nacha-upload.component.scss`
- `src/app/features/ach/nacha-upload/nacha-upload.component.ts`
- `src/app/features/ach/nacha-validation-report/nacha-validation-report.component.scss`
- `src/app/features/alerts/alert-card/alert-card.component.scss`
- `src/app/features/approvals/approvals-queue/approvals-queue.component.ts`
- `src/app/features/payroll/employee-list/employee-list.component.scss`
- `src/app/features/payroll/new-payroll-run/new-payroll-run.component.scss`
- `src/app/features/payroll/new-payroll-run/new-payroll-run.component.ts`
- `src/app/features/payroll/payroll-line-editor/payroll-line-editor.component.scss`
- `src/app/features/payroll/payroll-runs/payroll-runs.component.scss`
- `src/app/features/payroll/payroll-runs/payroll-runs.component.ts`
- `src/app/features/reports/report-preview/report-preview.component.scss`
- `src/app/features/reports/report-preview/report-preview.component.ts`
- `src/app/features/users/entitlements-editor/entitlements-editor.component.ts`
- `src/app/features/users/limits-form/limits-form.component.scss`
- `src/app/features/users/permission-matrix/permission-matrix.component.scss`
- `src/app/features/wires/new-wire/new-wire.component.scss`
- `src/app/layout/shell/shell.component.scss`
- `src/app/layout/shell/shell.component.ts`
- `src/app/shared/components/confirm-action-dialog/confirm-action-dialog.component.ts`
- `src/styles.scss`

## Direct `@angular/material` consumers

These import Material rather than going through Canopy. The `.mat-*` selectors in `styles.scss` exist
for them. Canopy 3.6 moves the internal table markup and every one of these will need looking at.

- `src/app/features/accounts/transaction-detail-dialog/transaction-detail-dialog.component.ts`
- `src/app/features/accounts/transaction-list/transaction-list.component.ts`
- `src/app/features/ach/ach-template-editor/ach-template-editor.component.ts`
- `src/app/features/ach/ach-templates/ach-templates.component.ts`
- `src/app/features/alerts/alert-list/alert-list.component.ts`
- `src/app/features/alerts/alert-threshold-dialog/alert-threshold-dialog.component.ts`
- `src/app/features/alerts/alerts.module.ts`
- `src/app/features/approvals/approval-decision-dialog/approval-decision-dialog.component.ts`
- `src/app/features/approvals/approval-detail/approval-detail.component.ts`
- `src/app/features/approvals/approvals-queue/approvals-queue.component.ts`
- `src/app/features/payroll/new-payroll-run/new-payroll-run.component.ts`
- `src/app/features/payroll/payroll-runs/payroll-runs.component.ts`
- `src/app/features/reports/report-preview/report-preview.component.ts`
- `src/app/features/users/invite-user-dialog/invite-user-dialog.component.ts`
- `src/app/features/users/user-list/user-list.component.ts`
- `src/app/features/users/users.module.ts`
- `src/app/features/wires/wire-detail/wire-detail.component.ts`
- `src/app/shared/components/confirm-action-dialog/confirm-action-dialog.component.ts`
- `src/app/shared/shared.module.ts`

## Notes

- The transaction list row height override (MBZ-880 / MBZ-314) is the one customers will notice if it
  goes. Accountants persona, 2020 complaint, still open.
- Approvals queue status colouring relies on `ViewEncapsulation.None` and the cell class names in
  `cn-data-table`. Canopy design system say a `cellClass` input is on their backlog (CNPY-2188).
- Nobody has tried 3.6.1 since the revert. Do not try it on `develop`.
