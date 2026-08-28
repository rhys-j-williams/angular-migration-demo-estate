import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MockStore, provideMockStore } from '@ngrx/store/testing';

import { SharedModule } from '../../../../shared/shared.module';
import { billPayActions } from '../../store/bill-pay.actions';
import { billPayFeatureKey, initialBillPayState } from '../../store/bill-pay.reducer';
import { BillPayHomeComponent } from './bill-pay-home.component';

// First real spec in bill pay (MOL-4476). The compliance review asked for dispatch and navigation
// coverage on every entry point before anything else.
describe('BillPayHomeComponent', () => {
  let fixture: ComponentFixture<BillPayHomeComponent>;
  let store: MockStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BillPayHomeComponent],
      imports: [SharedModule, HttpClientTestingModule, RouterTestingModule, NoopAnimationsModule],
      providers: [provideMockStore({ initialState: { [billPayFeatureKey]: initialBillPayState } })]
    }).compileComponents();

    store = TestBed.inject(MockStore);
    spyOn(store, 'dispatch').and.callThrough();
    fixture = TestBed.createComponent(BillPayHomeComponent);
    fixture.detectChanges();
  });

  it('loads bills on init', () => {
    expect(store.dispatch).toHaveBeenCalledWith(billPayActions.load());
  });

  it('reload dispatches load again', () => {
    fixture.componentInstance.reload();
    expect(store.dispatch).toHaveBeenCalledTimes(2);
  });

  it('opens the bill detail route for a row', () => {
    const router = TestBed.inject(Router);
    const navigate = spyOn(router, 'navigate').and.resolveTo(true);
    fixture.componentInstance.open({ billId: 'bill-0001' } as never);
    expect(navigate).toHaveBeenCalledWith(['/bill-pay/bills', 'bill-0001']);
  });
});
