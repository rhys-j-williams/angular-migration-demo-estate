import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { CnPageHeaderComponent } from './page-header.component';
import { CnPageHeaderModule } from './page-header.module';

describe('CnPageHeaderComponent', () => {
  let fixture: ComponentFixture<CnPageHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [CnPageHeaderModule, RouterTestingModule] }).compileComponents();
    fixture = TestBed.createComponent(CnPageHeaderComponent);
    fixture.componentInstance.title = 'Transfers';
    fixture.componentInstance.breadcrumbs = [{ label: 'Home', link: '/' }, { label: 'Transfers' }];
    fixture.detectChanges();
  });

  it('renders an h1 and breadcrumb trail', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('h1')!.textContent).toBe('Transfers');
    expect(el.querySelectorAll('.cn-page-header__crumb').length).toBe(2);
    expect(el.querySelector('[aria-current="page"]')!.textContent).toBe('Transfers');
  });
});
