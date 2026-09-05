import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { SharedModule } from '../../../../shared/shared.module';
import { ConfigService } from '../../../../core/config/config.service';
import { Transaction } from '../../../../core/api/models';
import { TransactionDetailComponent } from './transaction-detail.component';

const TXN: Transaction = {
  transactionId: 'txn-1', accountId: 'acc-1', postedAt: '2026-08-30T10:00:00Z', settledAt: null, description: 'POS PURCHASE',
  merchantName: 'Harbor Market', merchantCategoryCode: '5411', category: 'groceries', amountMinor: -4210, runningBalanceMinor: 100000,
  status: 'posted', channel: 'card'
};

describe('TransactionDetailComponent', () => {
  let fixture: ComponentFixture<TransactionDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TransactionDetailComponent],
      imports: [SharedModule, HttpClientTestingModule, RouterTestingModule, NoopAnimationsModule],
      providers: [{ provide: ConfigService, useValue: { value: { apiBaseUrl: '/api/v1' } } }]
    }).compileComponents();

    fixture = TestBed.createComponent(TransactionDetailComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('allows a dispute on a recent posted card debit', () => {
    expect(fixture.componentInstance.canDispute(TXN, new Date('2026-09-05'))).toBeTrue();
  });

  it('refuses disputes on credits, pending items and old transactions', () => {
    const c = fixture.componentInstance;
    expect(c.canDispute({ ...TXN, amountMinor: 500 }, new Date('2026-09-05'))).toBeFalse();
    expect(c.canDispute({ ...TXN, status: 'pending' }, new Date('2026-09-05'))).toBeFalse();
    expect(c.canDispute(TXN, new Date('2027-01-05'))).toBeFalse();
    expect(c.canDispute({ ...TXN, channel: 'internal' }, new Date('2026-09-05'))).toBeFalse();
  });
});
