import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CnAccountCardComponent, CnAccountSummary } from './account-card.component';
import { CnAccountCardModule } from './account-card.module';

const ACCOUNT: CnAccountSummary = {
  id: 'acc-1',
  nickname: 'Everyday Checking',
  kind: 'checking',
  last4: '4821',
  currency: 'USD',
  currentBalance: 2450.12,
  availableBalance: 2300,
  changeSinceYesterday: -120.5
};

describe('CnAccountCardComponent', () => {
  let fixture: ComponentFixture<CnAccountCardComponent>;
  let component: CnAccountCardComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [CnAccountCardModule, NoopAnimationsModule] }).compileComponents();
    fixture = TestBed.createComponent(CnAccountCardComponent);
    component = fixture.componentInstance;
    component.account = ACCOUNT;
    component.clickable = true;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('masks the account number and formats the balance', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.cn-account-card__number')!.textContent).toContain('4821');
    expect(el.querySelector('.cn-account-card__number')!.textContent).not.toContain('021000000');
    expect(el.querySelector('.cn-account-card__balance-value')!.textContent).toContain('$2,450.12');
  });

  it('hides balances behind the eye toggle', () => {
    component.toggleHidden(new Event('click'));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.cn-account-card__balance-value').textContent).not.toContain('2,450');
  });

  it('is keyboard operable when clickable', () => {
    const selected: CnAccountSummary[] = [];
    component.selected.subscribe(a => selected.push(a));
    const card: HTMLElement = fixture.nativeElement.querySelector('[role="button"]');
    card.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(selected.length).toBe(1);
  });

  it('reports utilisation for credit accounts', () => {
    component.account = { ...ACCOUNT, kind: 'credit', currentBalance: -1500, creditLimit: 5000 };
    expect(component.utilisation).toBe(30);
    expect(component.trend).toBe('down');
  });
});
