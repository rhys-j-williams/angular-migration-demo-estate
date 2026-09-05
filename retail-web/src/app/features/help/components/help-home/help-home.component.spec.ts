import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { SharedModule } from '../../../../shared/shared.module';
import { HelpHomeComponent } from './help-home.component';

describe('HelpHomeComponent', () => {
  let fixture: ComponentFixture<HelpHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HelpHomeComponent],
      imports: [SharedModule, RouterTestingModule, NoopAnimationsModule],
      providers: [
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HelpHomeComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
