import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideMockStore } from '@ngrx/store/testing';

import { SharedModule } from '../../../../shared/shared.module';
import { ThreadListComponent } from './thread-list.component';

describe('ThreadListComponent', () => {
  let fixture: ComponentFixture<ThreadListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ThreadListComponent],
      imports: [SharedModule, RouterTestingModule, NoopAnimationsModule],
      providers: [
        provideMockStore({ initialState: { messages: { ids: [], entities: {}, loading: false, error: null, selectedId: null, loadedAt: null } } }),
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ThreadListComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
