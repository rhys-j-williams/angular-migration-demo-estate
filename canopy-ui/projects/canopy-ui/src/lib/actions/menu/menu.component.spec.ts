import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CnMenuComponent } from './menu.component';
import { CnMenuModule } from './menu.module';

describe('CnMenuComponent', () => {
  let fixture: ComponentFixture<CnMenuComponent>;
  let component: CnMenuComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [CnMenuModule, NoopAnimationsModule] }).compileComponents();
    fixture = TestBed.createComponent(CnMenuComponent);
    component = fixture.componentInstance;
    component.items = [
      { id: 'rename', label: 'Rename account' },
      { id: 'close', label: 'Close account', destructive: true, dividerBefore: true, disabled: true }
    ];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('emits selected for enabled items only', () => {
    const emitted: string[] = [];
    component.selected.subscribe(i => emitted.push(i.id));
    component.select(component.items[0]);
    component.select(component.items[1]);
    expect(emitted).toEqual(['rename']);
  });

  it('opens the panel into the overlay', () => {
    component.open();
    fixture.detectChanges();
    const panel = document.querySelector('.cn-menu__panel');
    expect(panel).toBeTruthy();
    expect(document.querySelectorAll('[data-cn-menu-item]').length).toBe(2);
    component.close();
  });
});
