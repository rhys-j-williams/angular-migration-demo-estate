/**
 * bff-retail contract (openapi: platform-services/bff-retail/openapi.yaml, v1). These mirror the
 * domain-fixtures types field for field because the BFF passes most entities through unchanged;
 * they are duplicated rather than imported so the web app does not take a runtime dependency on a
 * package that also ships generators (MOL-2201). Money is always minor units, USD.
 */
export type AccountType =
  | 'checking'
  | 'savings'
  | 'credit-card'
  | 'mortgage'
  | 'auto-loan'
  | 'certificate'
  | 'business-checking'
  | 'business-savings'
  | 'treasury-operating';

export type AccountStatus = 'open' | 'dormant' | 'restricted' | 'closed';

export interface Account {
  accountId: string;
  customerId: string;
  type: AccountType;
  nickname: string;
  /** Masked by the BFF: last four only. Full number is only ever on the account details endpoint. */
  accountNumber: string;
  routingNumber: string;
  currency: 'USD';
  currentBalanceMinor: number;
  availableBalanceMinor: number;
  openedAt: string;
  status: AccountStatus;
  interestRateBasisPoints?: number;
  creditLimitMinor?: number;
}

export interface AccountDetails extends Account {
  accountNumberFull: string;
  statementCycleDay: number;
  overdraftProtectionAccountId?: string;
  paymentDueAt?: string;
  minimumPaymentMinor?: number;
  paperlessStatements: boolean;
}

export type TransactionCategory =
  | 'groceries' | 'dining' | 'fuel' | 'travel' | 'utilities' | 'healthcare' | 'entertainment'
  | 'transfers' | 'income' | 'fees' | 'insurance' | 'home-improvement' | 'education' | 'charity'
  | 'payroll' | 'taxes';

export type TransactionStatus = 'pending' | 'posted' | 'disputed' | 'reversed';
export type TransactionChannel = 'card' | 'ach' | 'wire' | 'internal' | 'paylink' | 'check' | 'atm' | 'fee';

export interface Transaction {
  transactionId: string;
  accountId: string;
  postedAt: string;
  settledAt: string | null;
  description: string;
  merchantName: string;
  merchantCategoryCode: string;
  category: TransactionCategory;
  amountMinor: number;
  runningBalanceMinor: number;
  status: TransactionStatus;
  channel: TransactionChannel;
  disputeId?: string;
}

export interface TransactionQuery {
  accountId: string;
  from?: string;
  to?: string;
  search?: string;
  category?: TransactionCategory;
  status?: TransactionStatus;
  minAmountMinor?: number;
  maxAmountMinor?: number;
  page: number;
  pageSize: number;
}

export interface Page<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
}

export type CardStatus = 'active' | 'locked' | 'replaced' | 'expired';

export interface Card {
  cardId: string;
  customerId: string;
  accountId: string;
  /** Masked by the BFF except on the reveal endpoint. */
  cardNumber: string;
  network: 'meridian-debit' | 'meridian-credit';
  expiryMonth: number;
  expiryYear: number;
  status: CardStatus;
  contactlessEnabled: boolean;
  travelNoticeUntil?: string;
  digitalWallet: { applePay: boolean; googlePay: boolean; samsungPay: boolean };
}

export interface CardControls {
  cardId: string;
  internationalEnabled: boolean;
  onlineEnabled: boolean;
  atmEnabled: boolean;
  contactlessEnabled: boolean;
  dailySpendLimitMinor: number | null;
  blockedMerchantCategories: string[];
}

export type PayeeType = 'bill-pay' | 'external-transfer' | 'paylink';

export interface Payee {
  payeeId: string;
  customerId: string;
  name: string;
  nickname: string;
  accountNumberLastFour: string;
  routingNumber: string;
  type: PayeeType;
  verified: boolean;
  addedAt: string;
}

export type TransferType = 'internal' | 'external' | 'paylink' | 'wire';
export type TransferFrequency = 'once' | 'weekly' | 'biweekly' | 'monthly';
export type TransferStatus = 'scheduled' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface TransferRequest {
  type: TransferType;
  fromAccountId: string;
  toAccountId?: string;
  payeeId?: string;
  amountMinor: number;
  memo?: string;
  scheduledFor: string;
  frequency: TransferFrequency;
  endAfterOccurrences?: number;
  /** Client generated UUID; the BFF de-duplicates on it. */
  idempotencyKey: string;
}

export interface Transfer extends TransferRequest {
  transferId: string;
  status: TransferStatus;
  createdAt: string;
  confirmationNumber: string;
  feeMinor: number;
  estimatedArrival: string;
  failureCode?: string;
}

export interface TransferLimits {
  dailyExternalLimitMinor: number;
  dailyExternalUsedMinor: number;
  perTransactionInternalMinor: number;
  perTransactionExternalMinor: number;
  wireEnabled: boolean;
  cutoffLocalTime: string;
  nextBusinessDay: string;
}

export type BillStatus = 'due' | 'scheduled' | 'paid' | 'overdue' | 'cancelled';

export interface Bill {
  billId: string;
  payeeId: string;
  payeeName: string;
  amountDueMinor: number;
  dueAt: string;
  status: BillStatus;
  ebill: boolean;
  autopay: boolean;
  lastPaidAt?: string;
}

export interface BillPayment {
  paymentId: string;
  payeeId: string;
  fromAccountId: string;
  amountMinor: number;
  sendOn: string;
  deliverBy: string;
  status: TransferStatus;
  confirmationNumber: string;
  memo?: string;
}

export type StatementType = 'monthly' | 'annual' | 'tax-1099-int' | 'tax-1098' | 'notice';

export interface Statement {
  statementId: string;
  accountId: string;
  type: StatementType;
  periodStart: string;
  periodEnd: string;
  pages: number;
  sizeBytes: number;
  available: boolean;
}

export type Channel = 'push' | 'sms' | 'email' | 'in-app';

export interface AlertPreference {
  alertId: string;
  customerId: string;
  code: string;
  label: string;
  description: string;
  regulatory: boolean;
  enabled: boolean;
  channels: Channel[];
  thresholdMinor?: number;
  quietHours?: { start: string; end: string };
}

export interface AlertHistoryItem {
  id: string;
  code: string;
  sentAt: string;
  channel: Channel;
  summary: string;
  read: boolean;
}

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: 'US';
}

export interface Profile {
  customerId: string;
  segment: 'consumer' | 'small-business' | 'treasury';
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  mobile: string;
  address: Address;
  enrolledAt: string;
  preferredLanguage: 'en' | 'es';
  paperless: boolean;
}

export interface TrustedDevice {
  deviceId: string;
  label: string;
  platform: string;
  lastSeenAt: string;
  current: boolean;
}

export interface LoginHistoryItem {
  at: string;
  outcome: 'success' | 'failed' | 'step-up';
  channel: 'web' | 'mobile';
  city: string;
  deviceLabel: string;
}

export interface SecuritySettings {
  mfaMethod: 'sms' | 'authenticator' | 'push';
  mfaEnrolledAt: string;
  passwordChangedAt: string;
  usernameLastChangedAt?: string;
  trustedDevices: TrustedDevice[];
  loginHistory: LoginHistoryItem[];
}

export interface SecureMessageThread {
  threadId: string;
  subject: string;
  topic: string;
  status: 'open' | 'awaiting-customer' | 'closed';
  updatedAt: string;
  unread: boolean;
  messageCount: number;
}

export interface SecureMessage {
  messageId: string;
  threadId: string;
  from: 'customer' | 'bank';
  agentName?: string;
  sentAt: string;
  body: string;
  attachments: { name: string; sizeBytes: number }[];
}

export interface RewardsSummary {
  programme: string;
  pointsBalance: number;
  pointsPending: number;
  pointsExpiringMinor: number;
  pointsExpiringAt?: string;
  tier: 'standard' | 'plus' | 'premier';
  cashValueMinor: number;
}

export interface RewardsActivity {
  id: string;
  at: string;
  description: string;
  points: number;
}

export interface RedemptionOption {
  optionId: string;
  label: string;
  pointsRequired: number;
  kind: 'statement-credit' | 'deposit' | 'gift-card' | 'travel';
}

export interface Disclosure {
  key: string;
  title: string;
  version: string;
  effectiveFrom: string;
  html: string;
}

export interface OnboardingApplication {
  applicationId: string;
  step: 'identity' | 'contact' | 'product' | 'funding' | 'review' | 'submitted';
  createdAt: string;
  productCode?: string;
}
