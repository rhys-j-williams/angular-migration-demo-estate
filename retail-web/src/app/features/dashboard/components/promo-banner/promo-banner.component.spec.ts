import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { SharedModule } from '../../../../shared/shared.module';
import { PromoBannerComponent } from './promo-banner.component';

describe('PromoBannerComponent', () => {
  let fixture: ComponentFixture<PromoBannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PromoBannerComponent],
      imports: [SharedModule, RouterTestingModule, NoopAnimationsModule],
      providers: [
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PromoBannerComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
