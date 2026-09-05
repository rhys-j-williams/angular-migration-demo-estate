import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { SharedModule } from '../../../../shared/shared.module';
import { ContentApiService } from '../../../../core/api/content-api.service';
import { ContactStepComponent } from './contact-step.component';

describe('ContactStepComponent', () => {
  let fixture: ComponentFixture<ContactStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ContactStepComponent],
      imports: [SharedModule, HttpClientTestingModule, RouterTestingModule, NoopAnimationsModule],
      providers: [
        { provide: ContentApiService, useValue: {} },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ContactStepComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
