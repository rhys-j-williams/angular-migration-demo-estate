import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { CnPageShellComponent } from './page-shell.component';
import { CnPageShellModule } from './page-shell.module';

describe('CnPageShellComponent', () => {
  let fixture: ComponentFixture<CnPageShellComponent>;
  let component: CnPageShellComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [CnPageShellModule, RouterTestingModule, NoopAnimationsModule] }).compileComponents();
    fixture = TestBed.createComponent(CnPageShellComponent);
    component = fixture.componentInstance;
    component.appName = 'Meridian Online';
    component.nav = [{ id: 'home', label: 'Home', icon: 'cn:home', link: '/' }, { id: 'pay', label: 'Payments', link: '/pay', badge: 2 }];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders the skip link, main landmark and nav items', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('a.cn-page-shell__skip')).toBeTruthy();
    expect(el.querySelector('main#cn-main')).toBeTruthy();
    expect(el.querySelectorAll('.cn-page-shell__nav-link').length).toBe(2);
  });
});
