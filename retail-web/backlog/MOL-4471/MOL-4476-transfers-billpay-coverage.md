# MOL-4476 Test coverage: transfers and bill pay

Parent: MOL-4471. Can start now, does not depend on the others. Payments-platform to pair.

Current state: the transfers and bill pay feature modules have a real reducer spec each and
almost nothing at component level. Twenty-odd components with no spec file. The transfer wizard,
review step, confirmation, payee verification, scheduled payments, autopay settings. This is the
money-moving code and it is the least tested code in the application, which is backwards, and
compliance have noticed (see the 2024 SOX IT general controls walkthrough notes, finding 7).

Why it got this way: the wizard was built fast in 2021 against untyped forms and mocked BFF
responses, the tests were "next sprint", and every release since has changed the copy or a
validation rule without adding any. The `UntypedFormBuilder` in profile and onboarding (ADR
0012) is a separate thing; transfers uses typed forms and is simply untested.

Target for this story: behaviour specs, not creation-only, for
- TransferWizardComponent step transitions and the MFA hand-off
- TransferReviewStepComponent amount and cut-off display
- VerifyPayeeComponent micro-deposit flow
- PayBillComponent and AutopaySettingsComponent validation
- CancelTransferComponent / CancelPaymentComponent eligibility rules

Use `TEST_CONFIG` from `src/testing/test-config.ts` for the runtime config, and the fixture
customers from `@meridian/domain-fixtures`, never hand-written accounts.

Coverage will go up. That is a side effect, not the goal; do not chase the number.

## Progress

- 2026-08-28: bill-pay-home covered. Transfers wizard steps next; the MFA threshold fixture
  (MOL-4188) needs sorting before quick-transfer can come off xit.
