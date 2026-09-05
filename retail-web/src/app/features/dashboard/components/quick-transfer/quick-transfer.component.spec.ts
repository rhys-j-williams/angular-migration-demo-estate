import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { SharedModule } from '../../../../shared/shared.module';
import { QuickTransferComponent } from './quick-transfer.component';

describe('QuickTransferComponent', () => {
  let fixture: ComponentFixture<QuickTransferComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [QuickTransferComponent],
      imports: [SharedModule, RouterTestingModule, NoopAnimationsModule],
      providers: [
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(QuickTransferComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
