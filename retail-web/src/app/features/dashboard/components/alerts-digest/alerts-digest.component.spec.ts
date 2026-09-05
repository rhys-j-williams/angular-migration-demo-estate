import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { SharedModule } from '../../../../shared/shared.module';
import { AlertsDigestComponent } from './alerts-digest.component';

describe('AlertsDigestComponent', () => {
  let fixture: ComponentFixture<AlertsDigestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AlertsDigestComponent],
      imports: [SharedModule, HttpClientTestingModule, RouterTestingModule, NoopAnimationsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(AlertsDigestComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('picks an icon by alert code family', () => {
    const c = fixture.componentInstance;
    expect(c.iconFor('security.new-device')).toBe('shield');
    expect(c.iconFor('card.declined')).toBe('credit_card');
    expect(c.iconFor('anything-else')).toBe('notifications');
  });
});
