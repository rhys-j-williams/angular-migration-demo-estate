import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CnProgressComponent } from './progress.component';
import { CnProgressModule } from './progress.module';

describe('CnProgressComponent', () => {
  let fixture: ComponentFixture<CnProgressComponent>;
  let component: CnProgressComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [CnProgressModule, NoopAnimationsModule] }).compileComponents();
    fixture = TestBed.createComponent(CnProgressComponent);
    component = fixture.componentInstance;
    component.value = 85;
    component.thresholds = { caution: 80, warn: 100 };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders the Material fill element and picks the tone from thresholds', () => {
    expect(fixture.nativeElement.querySelector('.mat-progress-bar-fill')).toBeTruthy();
    expect(component.effectiveTone).toBe('caution');
    component.value = 120;
    expect(component.effectiveTone).toBe('warn');
    expect(component.clamped).toBe(100);
  });
});
