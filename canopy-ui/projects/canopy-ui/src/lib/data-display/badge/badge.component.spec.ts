import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CnBadgeComponent } from './badge.component';
import { CnBadgeModule } from './badge.module';

describe('CnBadgeComponent', () => {
  let fixture: ComponentFixture<CnBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [CnBadgeModule] }).compileComponents();
    fixture = TestBed.createComponent(CnBadgeComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
