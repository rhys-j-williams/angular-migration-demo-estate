import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { SharedModule } from '../../../../shared/shared.module';
import { QuietHoursComponent } from './quiet-hours.component';

describe('QuietHoursComponent', () => {
  let fixture: ComponentFixture<QuietHoursComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [QuietHoursComponent],
      imports: [SharedModule, RouterTestingModule, NoopAnimationsModule],
      providers: [
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(QuietHoursComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
