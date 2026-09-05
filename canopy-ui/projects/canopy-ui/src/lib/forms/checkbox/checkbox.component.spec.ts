import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CnCheckboxComponent } from './checkbox.component';
import { CnCheckboxModule } from './checkbox.module';

describe('CnCheckboxComponent', () => {
  let fixture: ComponentFixture<CnCheckboxComponent>;
  let component: CnCheckboxComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [CnCheckboxModule, NoopAnimationsModule] }).compileComponents();
    fixture = TestBed.createComponent(CnCheckboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
