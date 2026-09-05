import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideMockStore } from '@ngrx/store/testing';

import { SharedModule } from '../../../../shared/shared.module';
import { RewardsActivityComponent } from './rewards-activity.component';

describe('RewardsActivityComponent', () => {
  let fixture: ComponentFixture<RewardsActivityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RewardsActivityComponent],
      imports: [SharedModule, RouterTestingModule, NoopAnimationsModule],
      providers: [
        provideMockStore({ initialState: { rewards: { ids: [], entities: {}, loading: false, error: null, selectedId: null, loadedAt: null } } }),
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RewardsActivityComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
