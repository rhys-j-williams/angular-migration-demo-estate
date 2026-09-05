import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CnCardComponent } from './card.component';
import { CnCardModule } from './card.module';

describe('CnCardComponent', () => {
  let fixture: ComponentFixture<CnCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [CnCardModule] }).compileComponents();
    fixture = TestBed.createComponent(CnCardComponent);
    fixture.componentInstance.title = 'Offers';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
