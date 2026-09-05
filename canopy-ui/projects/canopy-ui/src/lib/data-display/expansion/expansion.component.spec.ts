import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CnExpansionComponent } from './expansion.component';
import { CnExpansionModule } from './expansion.module';

describe('CnExpansionComponent', () => {
  let fixture: ComponentFixture<CnExpansionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [CnExpansionModule, NoopAnimationsModule] }).compileComponents();
    fixture = TestBed.createComponent(CnExpansionComponent);
    fixture.componentInstance.title = 'Details';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
