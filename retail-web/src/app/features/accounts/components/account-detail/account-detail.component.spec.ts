import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideMockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';

import { SharedModule } from '../../../../shared/shared.module';
import { AccountDetails } from '../../../../core/api/models';
import { LanternService } from '../../../../core/telemetry/lantern.service';
import { AccountDetailComponent } from './account-detail.component';

const DETAILS: AccountDetails = {
  accountId: 'acc-1', customerId: 'cus-1', type: 'checking', nickname: 'Everyday Checking', accountNumber: '****4411',
  accountNumberFull: '000000004411', routingNumber: '021000000', currency: 'USD', currentBalanceMinor: 152030,
  availableBalanceMinor: 148030, openedAt: '2019-03-04', status: 'open', statementCycleDay: 12, paperlessStatements: true
};

describe('AccountDetailComponent', () => {
  let fixture: ComponentFixture<AccountDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AccountDetailComponent],
      imports: [SharedModule, HttpClientTestingModule, RouterTestingModule, NoopAnimationsModule],
      providers: [
        provideMockStore(),
        { provide: ActivatedRoute, useValue: { data: of({ details: DETAILS }) } },
        { provide: LanternService, useValue: jasmine.createSpyObj<LanternService>('LanternService', ['page']) }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(AccountDetailComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('maps bank account types onto Canopy account kinds', () => {
    const s = fixture.componentInstance.summary({ ...DETAILS, type: 'credit-card', creditLimitMinor: 500000 });
    expect(s.kind).toBe('credit');
    expect(s.creditLimit).toBe(5000);
    expect(s.last4).toBe('4411');
  });

  it('treats restricted accounts as frozen for display', () => {
    expect(fixture.componentInstance.summary({ ...DETAILS, status: 'restricted' }).status).toBe('frozen');
  });
});
