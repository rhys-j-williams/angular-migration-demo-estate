import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';

import { SharedModule } from '../../../../shared/shared.module';
import { Account } from '../../../../core/api/models';
import { AccountActionsMenuComponent } from './account-actions-menu.component';

const ACCOUNT: Account = {
  accountId: 'acc-9', customerId: 'cus-1', type: 'credit-card', nickname: 'Rewards Card', accountNumber: '****7788', routingNumber: '021000000',
  currency: 'USD', currentBalanceMinor: -32000, availableBalanceMinor: 468000, openedAt: '2021-01-09', status: 'open', creditLimitMinor: 500000
};

describe('AccountActionsMenuComponent', () => {
  let fixture: ComponentFixture<AccountActionsMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AccountActionsMenuComponent],
      imports: [SharedModule, HttpClientTestingModule, RouterTestingModule, NoopAnimationsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(AccountActionsMenuComponent);
    fixture.componentInstance.account = ACCOUNT;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('offers a payment rather than a transfer on liability accounts', () => {
    const transfer = fixture.componentInstance.items.find(i => i.id === 'transfer');
    expect(transfer?.label).toBe('Make a payment');
    expect(fixture.componentInstance.items.find(i => i.id === 'routing')?.disabled).toBeTrue();
  });

  it('navigates to the transfer wizard with the account preselected', () => {
    const router = TestBed.inject(Router);
    const spy = spyOn(router, 'navigate').and.resolveTo(true);
    fixture.componentInstance.select({ id: 'transfer', label: '' });
    expect(spy).toHaveBeenCalledWith(['/transfers/new'], { queryParams: { from: 'acc-9' } });
  });
});
