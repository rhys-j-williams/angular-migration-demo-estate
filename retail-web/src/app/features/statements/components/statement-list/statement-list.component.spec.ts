import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideMockStore } from '@ngrx/store/testing';

import { Statement } from '../../../../core/api/models';
import { LanternService } from '../../../../core/telemetry/lantern.service';
import { accountsFeatureKey } from '../../../accounts/store/accounts.reducer';
import { statementsFeatureKey } from '../../store/statements.reducer';

import { SharedModule } from '../../../../shared/shared.module';
import { StatementListComponent } from './statement-list.component';

describe('StatementListComponent', () => {
  let fixture: ComponentFixture<StatementListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StatementListComponent],
      imports: [SharedModule, HttpClientTestingModule, RouterTestingModule, NoopAnimationsModule],
      providers: [provideMockStore({ initialState: { ...{ [statementsFeatureKey]: { ids: [], entities: {}, loading: false, error: null, selectedId: null, loadedAt: null } }, [accountsFeatureKey]: { ids: [], entities: {}, loading: false, error: null, selectedId: null, loadedAt: null } } }), { provide: LanternService, useValue: jasmine.createSpyObj<LanternService>('LanternService', ['track']) }]
    }).compileComponents();

    fixture = TestBed.createComponent(StatementListComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('filters by year and account and excludes tax forms', () => {
    const s = (statementId: string, accountId: string, periodEnd: string, type: Statement['type'] = 'monthly'): Statement => ({ statementId, accountId, type, periodStart: periodEnd, periodEnd, pages: 2, sizeBytes: 1, available: true });
    const out = StatementListComponent.filter([s('1', 'a', '2026-01-31'), s('2', 'b', '2026-02-28'), s('3', 'a', '2025-12-31'), s('4', 'a', '2026-03-31', 'tax-1099-int')], 'a', 2026);
    expect(out.map(x => x.statementId)).toEqual(['1']);
    expect(StatementListComponent.fileName(out[0])).toBe('meridian-monthly-2026-01-31.pdf');
  });
});
