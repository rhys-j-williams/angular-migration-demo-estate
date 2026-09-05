import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideMockStore } from '@ngrx/store/testing';

import { LanternService } from '../../../../core/telemetry/lantern.service';
import { accountsFeatureKey } from '../../../accounts/store/accounts.reducer';

import { SharedModule } from '../../../../shared/shared.module';
import { PaperlessSettingsComponent } from './paperless-settings.component';

describe('PaperlessSettingsComponent', () => {
  let fixture: ComponentFixture<PaperlessSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PaperlessSettingsComponent],
      imports: [SharedModule, HttpClientTestingModule, RouterTestingModule, NoopAnimationsModule],
      providers: [provideMockStore({ initialState: { [accountsFeatureKey]: { ids: [], entities: {}, loading: false, error: null, selectedId: null, loadedAt: null } } }), { provide: LanternService, useValue: jasmine.createSpyObj<LanternService>('LanternService', ['track']) }]
    }).compileComponents();

    fixture = TestBed.createComponent(PaperlessSettingsComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
