import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { SharedModule } from '../../../../shared/shared.module';
import { ThreadViewComponent } from './thread-view.component';

describe('ThreadViewComponent', () => {
  let fixture: ComponentFixture<ThreadViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ThreadViewComponent],
      imports: [SharedModule, HttpClientTestingModule, RouterTestingModule, NoopAnimationsModule],
      providers: [
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ThreadViewComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
