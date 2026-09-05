import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CnRadioGroupComponent } from './radio-group.component';
import { CnRadioGroupModule } from './radio-group.module';

describe('CnRadioGroupComponent', () => {
  let fixture: ComponentFixture<CnRadioGroupComponent<string>>;
  let component: CnRadioGroupComponent<string>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [CnRadioGroupModule, NoopAnimationsModule] }).compileComponents();
    fixture = TestBed.createComponent<CnRadioGroupComponent<string>>(CnRadioGroupComponent);
    component = fixture.componentInstance;
    component.legend = 'Speed';
    component.options = [{ value: 'std', label: 'Standard' }, { value: 'wire', label: 'Wire' }];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders a legend and one radio per option', () => {
    expect(fixture.nativeElement.querySelector('legend').textContent).toContain('Speed');
    expect(fixture.nativeElement.querySelectorAll('mat-radio-button').length).toBe(2);
  });
});
