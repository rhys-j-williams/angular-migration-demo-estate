import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import * as moment from 'moment';
import { CN_DATE_RANGE_DEFAULT_PRESETS, CnDateRangeComponent } from './date-range.component';
import { CnDateRangeModule } from './date-range.module';

describe('CnDateRangeComponent', () => {
  let fixture: ComponentFixture<CnDateRangeComponent>;
  let component: CnDateRangeComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [CnDateRangeModule, NoopAnimationsModule] }).compileComponents();
    fixture = TestBed.createComponent(CnDateRangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('applies a preset and emits ISO strings', () => {
    let emitted = null as unknown;
    component.registerOnChange(v => (emitted = v));
    component.applyPreset(CN_DATE_RANGE_DEFAULT_PRESETS[0]);
    expect(component.activePresetId).toBe('last30');
    expect(emitted).toEqual({ start: moment().subtract(30, 'days').format('YYYY-MM-DD'), end: moment().format('YYYY-MM-DD') });
  });

  it('writes a value from the model and summarises it', () => {
    component.writeValue({ start: '2024-03-01', end: '2024-03-31' });
    expect(component.summary).toBe('Mar 1, 2024 \u2013 Mar 31, 2024');
  });
});
