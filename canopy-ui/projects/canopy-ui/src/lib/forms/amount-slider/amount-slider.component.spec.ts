import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CnAmountSliderComponent } from './amount-slider.component';
import { CnAmountSliderModule } from './amount-slider.module';

describe('CnAmountSliderComponent', () => {
  let fixture: ComponentFixture<CnAmountSliderComponent>;
  let component: CnAmountSliderComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [CnAmountSliderModule, NoopAnimationsModule] }).compileComponents();
    fixture = TestBed.createComponent(CnAmountSliderComponent);
    component = fixture.componentInstance;
    component.min = 500;
    component.max = 25000;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('abbreviates thousands in the thumb label', () => {
    expect(component.formatLabel(12500)).toBe('$12.5k');
    expect(component.formatLabel(750)).toBe('$750');
  });
});
