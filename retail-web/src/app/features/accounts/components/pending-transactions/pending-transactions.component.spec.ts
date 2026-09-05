import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { SharedModule } from '../../../../shared/shared.module';
import { ConfigService } from '../../../../core/config/config.service';
import { Transaction } from '../../../../core/api/models';
import { PendingTransactionsComponent } from './pending-transactions.component';

function txn(id: string, amountMinor: number): Transaction {
  return { transactionId: id, accountId: 'a', postedAt: '2026-09-01T00:00:00Z', settledAt: null, description: id, merchantName: '', merchantCategoryCode: '',
    category: 'dining', amountMinor, runningBalanceMinor: 0, status: 'pending', channel: 'card' };
}

describe('PendingTransactionsComponent', () => {
  let fixture: ComponentFixture<PendingTransactionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PendingTransactionsComponent],
      imports: [SharedModule, HttpClientTestingModule, RouterTestingModule, NoopAnimationsModule],
      providers: [{ provide: ConfigService, useValue: { value: { apiBaseUrl: '/api/v1' } } }]
    }).compileComponents();

    fixture = TestBed.createComponent(PendingTransactionsComponent);
    fixture.componentInstance.accountId = 'acc-1';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('shows three rows until expanded', () => {
    const rows = [txn('1', -100), txn('2', -200), txn('3', -300), txn('4', -400)];
    const c = fixture.componentInstance;
    expect(c.visible(rows).length).toBe(3);
    c.showAll = true;
    expect(c.visible(rows).length).toBe(4);
    expect(c.total(rows)).toBe(-1000);
  });
});
