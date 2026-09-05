import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { SharedModule } from '../../../../shared/shared.module';
import { LoginHistoryComponent } from './login-history.component';

describe('LoginHistoryComponent', () => {
  let fixture: ComponentFixture<LoginHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoginHistoryComponent],
      imports: [SharedModule, RouterTestingModule, NoopAnimationsModule],
      providers: [
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginHistoryComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
