import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CnSelectComponent } from './select.component';
import { CnSelectModule } from './select.module';

describe('CnSelectComponent', () => {
  let fixture: ComponentFixture<CnSelectComponent<string>>;
  let component: CnSelectComponent<string>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [CnSelectModule, NoopAnimationsModule] }).compileComponents();
    fixture = TestBed.createComponent<CnSelectComponent<string>>(CnSelectComponent);
    component = fixture.componentInstance;
    component.options = [
      { value: 'chk', label: 'Everyday Checking', group: 'Deposit' },
      { value: 'sav', label: 'Reserve Savings', group: 'Deposit' },
      { value: 'cc', label: 'Rewards Card', group: 'Credit' }
    ];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('groups options by group name preserving order', () => {
    expect(component.groups.map(g => g.name)).toEqual(['Deposit', 'Credit']);
    expect(component.groups[0].options.length).toBe(2);
  });
});
