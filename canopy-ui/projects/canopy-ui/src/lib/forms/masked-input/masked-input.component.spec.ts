import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NgxMaskModule } from 'ngx-mask';
import { CnMaskedInputComponent } from './masked-input.component';
import { CnMaskedInputModule } from './masked-input.module';

describe('CnMaskedInputComponent', () => {
  let fixture: ComponentFixture<CnMaskedInputComponent>;
  let component: CnMaskedInputComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CnMaskedInputModule, NgxMaskModule.forRoot(), NoopAnimationsModule]
    }).compileComponents();
    fixture = TestBed.createComponent(CnMaskedInputComponent);
    component = fixture.componentInstance;
    component.preset = 'routing-number';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('resolves the preset mask', () => {
    expect(component.activeMask).toBe('000000000');
    expect(component.inputMode).toBe('numeric');
  });
});
