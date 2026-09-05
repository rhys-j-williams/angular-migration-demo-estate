import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { SharedModule } from '../../../../shared/shared.module';
import { CardControlsComponent } from './card-controls.component';

describe('CardControlsComponent', () => {
  let fixture: ComponentFixture<CardControlsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CardControlsComponent],
      imports: [SharedModule, HttpClientTestingModule, RouterTestingModule, NoopAnimationsModule],
      providers: [
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CardControlsComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
