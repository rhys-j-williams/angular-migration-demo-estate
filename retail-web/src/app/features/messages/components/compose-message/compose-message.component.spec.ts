import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideMockStore } from '@ngrx/store/testing';

import { SharedModule } from '../../../../shared/shared.module';
import { MessagesApiService } from '../../../../core/api/messages-api.service';
import { ComposeMessageComponent } from './compose-message.component';

describe('ComposeMessageComponent', () => {
  let fixture: ComponentFixture<ComposeMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ComposeMessageComponent],
      imports: [SharedModule, HttpClientTestingModule, RouterTestingModule, NoopAnimationsModule],
      providers: [
        provideMockStore({ initialState: { messages: { ids: [], entities: {}, loading: false, error: null, selectedId: null, loadedAt: null } } }),
        { provide: MessagesApiService, useValue: {} },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ComposeMessageComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
