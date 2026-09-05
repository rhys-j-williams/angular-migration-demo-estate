import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CnVirtualListComponent } from './virtual-list.component';
import { CnVirtualListModule } from './virtual-list.module';

describe('CnVirtualListComponent', () => {
  let fixture: ComponentFixture<CnVirtualListComponent<string>>;
  let component: CnVirtualListComponent<string>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [CnVirtualListModule, NoopAnimationsModule] }).compileComponents();
    fixture = TestBed.createComponent<CnVirtualListComponent<string>>(CnVirtualListComponent);
    component = fixture.componentInstance;
    component.items = Array.from({ length: 5000 }, (_, i) => `Row ${i}`);
    component.height = '200px';
    component.itemHeight = 40;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders only a window of rows', async () => {
    await fixture.whenStable();
    fixture.detectChanges();
    const rendered = fixture.nativeElement.querySelectorAll('.cn-virtual-list__item').length;
    expect(rendered).toBeGreaterThan(0);
    expect(rendered).toBeLessThan(100);
  });

  it('moves the active row with the arrow keys and activates on Enter', () => {
    const activated: string[] = [];
    component.activate.subscribe(v => activated.push(v));
    component.onKeydown(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    component.onKeydown(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    component.onKeydown(new KeyboardEvent('keydown', { key: 'End' }));
    expect(component.activeIndex).toBe(4999);
    component.onKeydown(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(activated).toEqual(['Row 4999']);
  });
});
