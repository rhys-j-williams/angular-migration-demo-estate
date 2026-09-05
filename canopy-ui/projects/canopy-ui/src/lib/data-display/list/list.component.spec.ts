import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CnListComponent } from './list.component';
import { CnListModule } from './list.module';

describe('CnListComponent', () => {
  let fixture: ComponentFixture<CnListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [CnListModule] }).compileComponents();
    fixture = TestBed.createComponent(CnListComponent);
    fixture.componentInstance.items = [{ id: '1', primary: 'Coffee', meta: '-$4.50' }];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
