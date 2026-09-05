import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CnSkeletonComponent } from './skeleton.component';
import { CnSkeletonModule } from './skeleton.module';

describe('CnSkeletonComponent', () => {
  let fixture: ComponentFixture<CnSkeletonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [CnSkeletonModule] }).compileComponents();
    fixture = TestBed.createComponent(CnSkeletonComponent);
    fixture.componentInstance.lines = 3;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders one bone per line', () => {
    expect(fixture.nativeElement.querySelectorAll('.cn-skeleton__bone').length).toBe(3);
  });
});
