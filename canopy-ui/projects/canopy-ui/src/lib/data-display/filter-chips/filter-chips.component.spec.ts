import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CnFilterChipsComponent } from './filter-chips.component';
import { CnFilterChipsModule } from './filter-chips.module';

describe('CnFilterChipsComponent', () => {
  let fixture: ComponentFixture<CnFilterChipsComponent<string>>;
  let component: CnFilterChipsComponent<string>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [CnFilterChipsModule, NoopAnimationsModule] }).compileComponents();
    fixture = TestBed.createComponent<CnFilterChipsComponent<string>>(CnFilterChipsComponent);
    component = fixture.componentInstance;
    component.chips = [
      { value: 'debit', label: 'Debits', count: 42 },
      { value: 'credit', label: 'Credits', count: 7 },
      { value: 'pending', label: 'Pending' }
    ];
    component.multiple = true;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders selectable Material chips', () => {
    const chips: NodeListOf<HTMLElement> = fixture.nativeElement.querySelectorAll('mat-chip.mat-chip');
    expect(chips.length).toBe(3);
    expect(fixture.nativeElement.querySelector('mat-chip-list')).toBeTruthy();
  });

  it('toggles selection on user click and emits the values', () => {
    const emitted: string[][] = [];
    component.selectionChange.subscribe(v => emitted.push(v));
    const chips: NodeListOf<HTMLElement> = fixture.nativeElement.querySelectorAll('mat-chip');
    chips[0].click();
    chips[1].click();
    fixture.detectChanges();
    expect(emitted[emitted.length - 1]).toEqual(['debit', 'credit']);
    expect(chips[0].classList).toContain('mat-chip-selected');
    chips[0].click();
    fixture.detectChanges();
    expect(component.selected).toEqual(['credit']);
  });

  it('clears everything from the clear button', () => {
    component.writeValue(['debit']);
    fixture.detectChanges();
    const clear: HTMLButtonElement = fixture.nativeElement.querySelector('.cn-filter-chips__clear');
    expect(clear).toBeTruthy();
    clear.click();
    expect(component.selected).toEqual([]);
  });
});
