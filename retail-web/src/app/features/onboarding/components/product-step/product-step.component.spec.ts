import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { SharedModule } from '../../../../shared/shared.module';
import { ContentApiService } from '../../../../core/api/content-api.service';
import { ProductStepComponent } from './product-step.component';

describe('ProductStepComponent', () => {
  let fixture: ComponentFixture<ProductStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProductStepComponent],
      imports: [SharedModule, RouterTestingModule, NoopAnimationsModule],
      providers: [
        { provide: ContentApiService, useValue: {} },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductStepComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
