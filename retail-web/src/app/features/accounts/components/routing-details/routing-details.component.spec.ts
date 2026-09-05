import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Clipboard } from '@angular/cdk/clipboard';

import { SharedModule } from '../../../../shared/shared.module';
import { AccountDetails } from '../../../../core/api/models';
import { LanternService } from '../../../../core/telemetry/lantern.service';
import { RoutingDetailsComponent } from './routing-details.component';

const DETAILS: AccountDetails = {
  accountId: 'acc-1', customerId: 'cus-1', type: 'checking', nickname: 'Everyday', accountNumber: '****4411', accountNumberFull: '000000004411',
  routingNumber: '021000000', currency: 'USD', currentBalanceMinor: 1, availableBalanceMinor: 1, openedAt: '2019-03-04', status: 'open',
  statementCycleDay: 12, paperlessStatements: true
};

describe('RoutingDetailsComponent', () => {
  let fixture: ComponentFixture<RoutingDetailsComponent>;
  let lantern: jasmine.SpyObj<LanternService>;

  beforeEach(async () => {
    lantern = jasmine.createSpyObj<LanternService>('LanternService', ['track']);
    await TestBed.configureTestingModule({
      declarations: [RoutingDetailsComponent],
      imports: [SharedModule, HttpClientTestingModule, RouterTestingModule, NoopAnimationsModule],
      providers: [{ provide: LanternService, useValue: lantern }]
    }).compileComponents();

    fixture = TestBed.createComponent(RoutingDetailsComponent);
    fixture.componentInstance.details = DETAILS;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('masks everything but the last four until revealed', () => {
    expect(fixture.componentInstance.maskedFull.endsWith('4411')).toBeTrue();
    expect(fixture.componentInstance.maskedFull).not.toContain('0000');
  });

  it('tracks a reveal without sending the number', () => {
    fixture.componentInstance.toggle();
    expect(lantern.track).toHaveBeenCalledWith('account.number.revealed', { accountType: 'checking' });
    const args = JSON.stringify(lantern.track.calls.mostRecent().args);
    expect(args).not.toContain('4411');
  });

  it('copies the routing number to the clipboard', () => {
    const clipboard = TestBed.inject(Clipboard);
    const spy = spyOn(clipboard, 'copy').and.returnValue(true);
    fixture.componentInstance.copy('routing');
    expect(spy).toHaveBeenCalledWith('021000000');
  });
});
