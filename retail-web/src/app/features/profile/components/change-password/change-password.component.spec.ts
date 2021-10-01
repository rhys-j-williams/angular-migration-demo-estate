import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { LanternService } from '../../../../core/telemetry/lantern.service';

import { SharedModule } from '../../../../shared/shared.module';
import { ChangePasswordComponent } from './change-password.component';

describe('ChangePasswordComponent', () => {
  let fixture: ComponentFixture<ChangePasswordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ChangePasswordComponent],
      imports: [SharedModule, HttpClientTestingModule, RouterTestingModule, NoopAnimationsModule],
      providers: [{ provide: LanternService, useValue: jasmine.createSpyObj<LanternService>('LanternService', ['track']) }]
    }).compileComponents();

    fixture = TestBed.createComponent(ChangePasswordComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('enforces the strength rules and confirmation match', () => {
    const c = fixture.componentInstance;
    c.form.setValue({ current: 'OldPassword!1', next: 'short', confirm: 'short' });
    expect(c.form.get('next')?.hasError('rules')).toBeTrue();
    c.form.setValue({ current: 'OldPassword!1', next: 'Correct-Horse-9x', confirm: 'Correct-Horse-8x' });
    expect(c.form.hasError('mismatch')).toBeTrue();
    c.form.patchValue({ confirm: 'Correct-Horse-9x' });
    expect(c.form.valid).toBeTrue();
  });

  it('refuses to reuse the current password', () => {
    const c = fixture.componentInstance;
    c.form.setValue({ current: 'Correct-Horse-9x', next: 'Correct-Horse-9x', confirm: 'Correct-Horse-9x' });
    expect(c.reusesCurrent).toBeTrue();
  });
});
