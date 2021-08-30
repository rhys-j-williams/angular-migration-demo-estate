import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideMockStore } from '@ngrx/store/testing';

import { sessionFeatureKey } from '../../../../core/store/session';

import { SharedModule } from '../../../../shared/shared.module';
import { ChannelPickerComponent } from './channel-picker.component';

describe('ChannelPickerComponent', () => {
  let fixture: ComponentFixture<ChannelPickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ChannelPickerComponent],
      imports: [SharedModule, HttpClientTestingModule, RouterTestingModule, NoopAnimationsModule],
      providers: [provideMockStore({ initialState: { [sessionFeatureKey]: { profile: { mobile: '' } } } })]
    }).compileComponents();

    fixture = TestBed.createComponent(ChannelPickerComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('keeps in-app on regulatory alerts', () => {
    const c = fixture.componentInstance;
    c.regulatory = true;
    const spy = spyOn(c.valueChange, 'emit');
    c.onChange(['email']);
    expect(spy).toHaveBeenCalledWith(['in-app', 'email']);
  });

  it('ignores an empty selection', () => {
    const c = fixture.componentInstance;
    const spy = spyOn(c.valueChange, 'emit');
    c.onChange([]);
    expect(spy).not.toHaveBeenCalled();
  });
});
