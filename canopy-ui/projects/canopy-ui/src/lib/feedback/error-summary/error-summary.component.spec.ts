import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CnErrorSummaryComponent } from './error-summary.component';
import { CnErrorSummaryModule } from './error-summary.module';

describe('CnErrorSummaryComponent', () => {
  let fixture: ComponentFixture<CnErrorSummaryComponent>;
  let component: CnErrorSummaryComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [CnErrorSummaryModule] }).compileComponents();
    fixture = TestBed.createComponent(CnErrorSummaryComponent);
    component = fixture.componentInstance;
    component.form = new FormGroup({
      amount: new FormControl<number | null>(null, Validators.required),
      memo: new FormControl('ok')
    });
    component.messages = { amount: { required: 'Enter an amount' } };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('lists one link per invalid control using the message map', () => {
    const links: NodeListOf<HTMLAnchorElement> = fixture.nativeElement.querySelectorAll('.cn-error-summary__link');
    expect(links.length).toBe(1);
    expect(links[0].textContent).toBe('Enter an amount');
    expect(links[0].getAttribute('href')).toBe('#amount');
  });
});
