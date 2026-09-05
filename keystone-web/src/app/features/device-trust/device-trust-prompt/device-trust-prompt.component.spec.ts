import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { DeviceTrustPromptComponent } from './device-trust-prompt.component';

describe('DeviceTrustPromptComponent', () => {
  let fixture: ComponentFixture<DeviceTrustPromptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [DeviceTrustPromptComponent, HttpClientTestingModule] }).compileComponents();
    fixture = TestBed.createComponent(DeviceTrustPromptComponent);
    fixture.detectChanges();
  });

  it('emits accepted when trusted', () => {
    const spy = spyOn(fixture.componentInstance.accepted, 'emit');
    (fixture.nativeElement.querySelector('button[color="primary"]') as HTMLButtonElement).click();
    expect(spy).toHaveBeenCalled();
  });

  it('hides itself and emits declined on Not now', () => {
    const spy = spyOn(fixture.componentInstance.declined, 'emit');
    fixture.componentInstance.dismiss();
    fixture.detectChanges();
    expect(spy).toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('.ks-dt-prompt')).toBeNull();
  });
});
