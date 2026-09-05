import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { SharedModule } from '../../../../shared/shared.module';
import { OnboardingStartComponent } from './onboarding-start.component';

describe('OnboardingStartComponent', () => {
  let fixture: ComponentFixture<OnboardingStartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OnboardingStartComponent],
      imports: [SharedModule, HttpClientTestingModule, RouterTestingModule, NoopAnimationsModule],
      providers: [
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(OnboardingStartComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
