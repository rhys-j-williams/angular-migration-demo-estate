import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { SharedModule } from '../../../../shared/shared.module';
import { AlertsDigestComponent } from './alerts-digest.component';

describe('AlertsDigestComponent', () => {
  let fixture: ComponentFixture<AlertsDigestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AlertsDigestComponent],
      imports: [SharedModule, RouterTestingModule, NoopAnimationsModule],
      providers: [
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AlertsDigestComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
