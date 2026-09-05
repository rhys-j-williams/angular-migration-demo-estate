import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CnIconButtonComponent } from './icon-button.component';
import { CnIconButtonModule } from './icon-button.module';

describe('CnIconButtonComponent', () => {
  let fixture: ComponentFixture<CnIconButtonComponent>;
  let component: CnIconButtonComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [CnIconButtonModule, NoopAnimationsModule] }).compileComponents();
    fixture = TestBed.createComponent(CnIconButtonComponent);
    component = fixture.componentInstance;
    component.ariaLabel = 'Notifications';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('labels the button for assistive tech', () => {
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    expect(button.getAttribute('aria-label')).toBe('Notifications');
  });

  it('hides the badge when the count is zero', () => {
    component.badge = 0;
    expect(component.showBadge).toBeFalse();
    component.badge = 3;
    expect(component.showBadge).toBeTrue();
  });
});
