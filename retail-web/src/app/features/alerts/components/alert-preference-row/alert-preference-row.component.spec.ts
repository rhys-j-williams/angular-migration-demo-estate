import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { SharedModule } from '../../../../shared/shared.module';
import { AlertPreferenceRowComponent } from './alert-preference-row.component';

describe('AlertPreferenceRowComponent', () => {
  let fixture: ComponentFixture<AlertPreferenceRowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AlertPreferenceRowComponent],
      imports: [SharedModule, RouterTestingModule, NoopAnimationsModule],
      providers: [
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AlertPreferenceRowComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
