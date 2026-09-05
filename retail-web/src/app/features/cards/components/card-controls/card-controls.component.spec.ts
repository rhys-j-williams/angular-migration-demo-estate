import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { LanternService } from '../../../../core/telemetry/lantern.service';

import { SharedModule } from '../../../../shared/shared.module';
import { CardControlsComponent } from './card-controls.component';

describe('CardControlsComponent', () => {
  let fixture: ComponentFixture<CardControlsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CardControlsComponent],
      imports: [SharedModule, HttpClientTestingModule, RouterTestingModule, NoopAnimationsModule],
      providers: [{ provide: LanternService, useValue: jasmine.createSpyObj<LanternService>('LanternService', ['track']) }]
    }).compileComponents();

    fixture = TestBed.createComponent(CardControlsComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('translates the form into minor-unit controls', () => {
    const c = fixture.componentInstance;
    c.form.patchValue({ limitEnabled: true, dailySpendLimit: 250.5, onlineEnabled: false, blockedMerchantCategories: ['gambling'] });
    const p = c.toPayload();
    expect(p.dailySpendLimitMinor).toBe(25050);
    expect(p.onlineEnabled).toBeFalse();
    expect(p.blockedMerchantCategories).toEqual(['gambling']);
    c.form.patchValue({ limitEnabled: false });
    expect(c.toPayload().dailySpendLimitMinor).toBeNull();
  });
});
