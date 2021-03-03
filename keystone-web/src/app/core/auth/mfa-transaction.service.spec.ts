import { MfaTransactionService } from './mfa-transaction.service';

describe('MfaTransactionService', () => {
  let svc: MfaTransactionService;

  beforeEach(() => {
    svc = new MfaTransactionService();
  });

  it('starts empty', () => {
    expect(svc.snapshot).toBeNull();
  });

  it('begins on sms with five attempts', () => {
    svc.begin('txn-1', 'p.fixture', '+1 *** *** 4471', '/return');
    expect(svc.snapshot).toEqual(jasmine.objectContaining({ txn: 'txn-1', channel: 'sms', attemptsRemaining: 5 }));
  });

  it('spends the transaction after five failures', () => {
    svc.begin('txn-1', 'p.fixture', undefined, null);
    for (let i = 4; i >= 1; i--) {
      expect(svc.recordFailure()).toBe(i);
    }
    expect(svc.recordFailure()).toBe(0);
    expect(svc.snapshot).toBeNull();
  });

  it('expires after ten minutes', () => {
    jasmine.clock().install();
    jasmine.clock().mockDate(new Date('2024-03-01T09:00:00Z'));
    svc.begin('txn-1', 'p.fixture', undefined, null);
    jasmine.clock().mockDate(new Date('2024-03-01T09:10:01Z'));
    expect(svc.snapshot).toBeNull();
    jasmine.clock().uninstall();
  });

  it('switches channel without losing attempts', () => {
    svc.begin('txn-1', 'p.fixture', undefined, null);
    svc.recordFailure();
    svc.switchChannel('totp');
    expect(svc.snapshot?.channel).toBe('totp');
    expect(svc.snapshot?.attemptsRemaining).toBe(4);
  });
});
