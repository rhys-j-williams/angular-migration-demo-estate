import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideMockStore } from '@ngrx/store/testing';

import { LanternService } from '../../../../core/telemetry/lantern.service';

import { SharedModule } from '../../../../shared/shared.module';
import { ActivateCardComponent } from './activate-card.component';

describe('ActivateCardComponent', () => {
  let fixture: ComponentFixture<ActivateCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ActivateCardComponent],
      imports: [SharedModule, HttpClientTestingModule, RouterTestingModule, NoopAnimationsModule],
      providers: [provideMockStore(), { provide: LanternService, useValue: jasmine.createSpyObj<LanternService>('LanternService', ['track']) }]
    }).compileComponents();

    fixture = TestBed.createComponent(ActivateCardComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('validates last four and expiry format', () => {
    const c = fixture.componentInstance;
    c.form.setValue({ last4: '12a4', expiry: '13/29' });
    expect(c.form.valid).toBeFalse();
    c.form.setValue({ last4: '1234', expiry: '09/29' });
    expect(c.form.valid).toBeTrue();
  });
});
