import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { SharedModule } from '../../../../shared/shared.module';
import { GenericErrorComponent } from './generic-error.component';

describe('GenericErrorComponent', () => {
  let fixture: ComponentFixture<GenericErrorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GenericErrorComponent],
      imports: [SharedModule, HttpClientTestingModule, RouterTestingModule, NoopAnimationsModule],
      providers: [
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(GenericErrorComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
