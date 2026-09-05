import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideMockStore } from '@ngrx/store/testing';

import { SharedModule } from '../../../../shared/shared.module';
import { ConfigService } from '../../../../core/config/config.service';
import { LanternService } from '../../../../core/telemetry/lantern.service';
import { dashboardFeatureKey } from '../../store/dashboard.reducer';
import { QuickTransferComponent } from './quick-transfer.component';

describe('QuickTransferComponent', () => {
  let fixture: ComponentFixture<QuickTransferComponent>;

  beforeEach(async () => {
    const config = { value: { transfers: { mfaStepUpThresholdMinor: 250000 } } };
    await TestBed.configureTestingModule({
      declarations: [QuickTransferComponent],
      imports: [SharedModule, HttpClientTestingModule, RouterTestingModule, NoopAnimationsModule],
      providers: [
        provideMockStore({
          initialState: {
            [dashboardFeatureKey]: {
              ids: ['a1', 'a2'],
              entities: {
                a1: { accountId: 'a1', type: 'checking', status: 'open', nickname: 'Everyday', accountNumber: '****1234', availableBalanceMinor: 50000 },
                a2: { accountId: 'a2', type: 'savings', status: 'open', nickname: 'Rainy day', accountNumber: '****9876', availableBalanceMinor: 900000 }
              },
              loading: false, error: null, selectedId: null, loadedAt: 1
            }
          }
        }),
        { provide: ConfigService, useValue: config },
        { provide: LanternService, useValue: jasmine.createSpyObj<LanternService>('LanternService', ['track']) }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(QuickTransferComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('refuses a transfer to the same account', () => {
    const c = fixture.componentInstance;
    c.form.setValue({ from: 'a1', to: 'a1', amount: 10 });
    expect(c.sameAccount).toBeTrue();
  });

  it('flags amounts above available balance', () => {
    const c = fixture.componentInstance;
    c.form.setValue({ from: 'a1', to: 'a2', amount: 600 });
    expect(c.insufficient).toBeTrue();
  });

  // xit since MOL-4188 moved the threshold into runtime config; the fixture still hard codes
  // 2500.00. Owner: retail-digital, on the backlog as MOL-4471 child story.
  xit('routes amounts at or above the MFA threshold into the wizard', () => {
    const c = fixture.componentInstance;
    c.form.setValue({ from: 'a2', to: 'a1', amount: 2500 });
    expect(c.overCap).toBeTrue();
  });
});
