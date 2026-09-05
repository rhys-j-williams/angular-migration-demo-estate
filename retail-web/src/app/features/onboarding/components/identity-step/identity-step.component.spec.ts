import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { SharedModule } from '../../../../shared/shared.module';
import { ContentApiService } from '../../../../core/api/content-api.service';
import { IdentityStepComponent } from './identity-step.component';

describe('IdentityStepComponent', () => {
  let fixture: ComponentFixture<IdentityStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [IdentityStepComponent],
      imports: [SharedModule, RouterTestingModule, NoopAnimationsModule],
      providers: [
        { provide: ContentApiService, useValue: {} },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(IdentityStepComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
