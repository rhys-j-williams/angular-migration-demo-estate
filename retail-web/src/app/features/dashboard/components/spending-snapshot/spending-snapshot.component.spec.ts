import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideMockStore } from '@ngrx/store/testing';

import { SharedModule } from '../../../../shared/shared.module';
import { dashboardFeatureKey } from '../../store/dashboard.reducer';
import { SpendingSnapshotComponent } from './spending-snapshot.component';

describe('SpendingSnapshotComponent', () => {
  let fixture: ComponentFixture<SpendingSnapshotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SpendingSnapshotComponent],
      imports: [SharedModule, HttpClientTestingModule, RouterTestingModule, NoopAnimationsModule],
      providers: [provideMockStore({ initialState: { [dashboardFeatureKey]: { ids: [], entities: {}, loading: false, error: null, selectedId: null, loadedAt: null } } })]
    }).compileComponents();

    fixture = TestBed.createComponent(SpendingSnapshotComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('builds a conic gradient whose stops add up to the slice shares', () => {
    const css = fixture.componentInstance.gradient([
      { category: 'groceries', label: 'Groceries', minor: 6000, share: 60, colour: '#111' },
      { category: 'fuel', label: 'Fuel', minor: 4000, share: 40, colour: '#222' }
    ]);
    expect(css).toBe('conic-gradient(#111 0% 60%, #222 60% 100%)');
  });
});
