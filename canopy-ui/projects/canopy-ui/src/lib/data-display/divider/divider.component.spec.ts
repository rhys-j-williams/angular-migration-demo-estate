import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CnDividerComponent } from './divider.component';
import { CnDividerModule } from './divider.module';

describe('CnDividerComponent', () => {
  let fixture: ComponentFixture<CnDividerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [CnDividerModule] }).compileComponents();
    fixture = TestBed.createComponent(CnDividerComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
