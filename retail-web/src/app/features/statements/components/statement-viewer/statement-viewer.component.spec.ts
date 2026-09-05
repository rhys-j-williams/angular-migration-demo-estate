import { ComponentFixture, TestBed } from '@angular/core/testing';

import { provideTestConfig } from '../../../../../testing/test-config';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { LanternService } from '../../../../core/telemetry/lantern.service';

import { SharedModule } from '../../../../shared/shared.module';
import { StatementViewerComponent } from './statement-viewer.component';

describe('StatementViewerComponent', () => {
  let fixture: ComponentFixture<StatementViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StatementViewerComponent],
      imports: [SharedModule, HttpClientTestingModule, RouterTestingModule, NoopAnimationsModule],
      providers: [provideTestConfig(), { provide: LanternService, useValue: jasmine.createSpyObj<LanternService>('LanternService', ['track']) }]
    }).compileComponents();

    fixture = TestBed.createComponent(StatementViewerComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
