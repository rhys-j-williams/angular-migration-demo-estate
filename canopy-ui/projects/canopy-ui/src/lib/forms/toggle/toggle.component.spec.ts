import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CnToggleComponent } from './toggle.component';
import { CnToggleModule } from './toggle.module';

describe('CnToggleComponent', () => {
  let fixture: ComponentFixture<CnToggleComponent>;
  let component: CnToggleComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [CnToggleModule, NoopAnimationsModule] }).compileComponents();
    fixture = TestBed.createComponent(CnToggleComponent);
    component = fixture.componentInstance;
    component.onText = 'Locked';
    component.offText = 'Active';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders the Material track and thumb the styles target', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.mat-slide-toggle-bar')).toBeTruthy();
    expect(el.querySelector('.mat-slide-toggle-thumb')).toBeTruthy();
  });

  it('shows the off text until checked', () => {
    expect(component.stateText).toBe('Active');
    component.writeValue(true);
    expect(component.stateText).toBe('Locked');
  });
});
