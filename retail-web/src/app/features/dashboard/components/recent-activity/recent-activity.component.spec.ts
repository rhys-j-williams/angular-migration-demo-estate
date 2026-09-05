import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { SharedModule } from '../../../../shared/shared.module';
import { RecentActivityComponent } from './recent-activity.component';

describe('RecentActivityComponent', () => {
  let fixture: ComponentFixture<RecentActivityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RecentActivityComponent],
      imports: [SharedModule, HttpClientTestingModule, RouterTestingModule, NoopAnimationsModule],
      providers: [
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RecentActivityComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
