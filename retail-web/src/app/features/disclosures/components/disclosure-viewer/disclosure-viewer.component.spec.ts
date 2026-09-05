import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { SharedModule } from '../../../../shared/shared.module';
import { DisclosureViewerComponent } from './disclosure-viewer.component';

describe('DisclosureViewerComponent', () => {
  let fixture: ComponentFixture<DisclosureViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DisclosureViewerComponent],
      imports: [SharedModule, RouterTestingModule, NoopAnimationsModule],
      providers: [
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DisclosureViewerComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
