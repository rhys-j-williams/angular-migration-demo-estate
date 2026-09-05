import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CnBottomSheetComponent } from './bottom-sheet.component';
import { CnBottomSheetModule } from './bottom-sheet.module';

describe('CnBottomSheetComponent', () => {
  let fixture: ComponentFixture<CnBottomSheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [CnBottomSheetModule] }).compileComponents();
    fixture = TestBed.createComponent(CnBottomSheetComponent);
    fixture.componentInstance.title = 'Quick actions';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
