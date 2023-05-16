import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CN_CONTENT_BASE_URL } from './content.service';
import { CnDisclosureComponent } from './disclosure.component';
import { CnDisclosureModule } from './disclosure.module';

describe('CnDisclosureComponent', () => {
  let fixture: ComponentFixture<CnDisclosureComponent>;
  let component: CnDisclosureComponent;
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CnDisclosureModule, HttpClientTestingModule],
      providers: [{ provide: CN_CONTENT_BASE_URL, useValue: '/content' }]
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(CnDisclosureComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('renders inline html as given', () => {
    component.html = '<p>Rates as of <sup>1</sup> March</p>';
    component.ngOnChanges({ html: { currentValue: component.html, previousValue: null, firstChange: true, isFirstChange: () => true } });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.cn-disclosure__content sup')).toBeTruthy();
  });

  it('fetches a fragment by key', () => {
    component.key = 'deposits.reg-dd';
    component.ngOnChanges({ key: { currentValue: component.key, previousValue: null, firstChange: true, isFirstChange: () => true } });
    fixture.detectChanges();
    http.expectOne('/content/fragments/deposits.reg-dd').flush({ html: '<p>Fees apply.</p>', version: '2024.3' });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.cn-disclosure__content').textContent).toBe('Fees apply.');
    expect(component.version).toBe('2024.3');
  });
});
