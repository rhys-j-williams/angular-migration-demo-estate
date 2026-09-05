import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { SharedModule } from '../../../../shared/shared.module';
import { AlertsHomeComponent } from './alerts-home.component';

describe('AlertsHomeComponent', () => {
  let fixture: ComponentFixture<AlertsHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AlertsHomeComponent],
      imports: [SharedModule, RouterTestingModule, NoopAnimationsModule],
      providers: [
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AlertsHomeComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
