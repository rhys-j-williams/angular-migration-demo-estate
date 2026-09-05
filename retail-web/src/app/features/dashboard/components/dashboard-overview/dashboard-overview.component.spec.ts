import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideMockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';

import { SharedModule } from '../../../../shared/shared.module';
import { FeatureFlagService } from '../../../../core/flags/feature-flag.service';
import { sessionFeatureKey } from '../../../../core/store/session';
import { DashboardOverviewComponent } from './dashboard-overview.component';

describe('DashboardOverviewComponent', () => {
  let fixture: ComponentFixture<DashboardOverviewComponent>;

  beforeEach(async () => {
    const flags = jasmine.createSpyObj<FeatureFlagService>('FeatureFlagService', ['isEnabled$']);
    flags.isEnabled$.and.returnValue(of(false));
    await TestBed.configureTestingModule({
      declarations: [DashboardOverviewComponent],
      imports: [SharedModule, HttpClientTestingModule, RouterTestingModule, NoopAnimationsModule],
      providers: [
        provideMockStore({ initialState: { [sessionFeatureKey]: { profile: { firstName: 'Dana' } } } }),
        { provide: FeatureFlagService, useValue: flags }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardOverviewComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('greets the customer by first name', () => {
    const header = fixture.nativeElement.querySelector('cn-page-header') as HTMLElement;
    expect(header.getAttribute('ng-reflect-title')).toContain('Dana');
  });
});
