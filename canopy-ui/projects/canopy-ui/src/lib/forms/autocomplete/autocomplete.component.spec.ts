import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { CnAutocompleteComponent } from './autocomplete.component';
import { CnAutocompleteModule } from './autocomplete.module';

describe('CnAutocompleteComponent', () => {
  let fixture: ComponentFixture<CnAutocompleteComponent<string>>;
  let component: CnAutocompleteComponent<string>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [CnAutocompleteModule, NoopAnimationsModule] }).compileComponents();
    fixture = TestBed.createComponent<CnAutocompleteComponent<string>>(CnAutocompleteComponent);
    component = fixture.componentInstance;
    component.source = q => of([{ value: q.toUpperCase(), label: `Payee ${q}` }]);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('queries the source after the debounce once minLength is reached', fakeAsync(() => {
    component.query.setValue('a');
    tick(300);
    expect(component.options.length).toBe(0);
    component.query.setValue('ac');
    tick(300);
    expect(component.options[0].label).toBe('Payee ac');
    expect(component.searched).toBeTrue();
  }));
});
