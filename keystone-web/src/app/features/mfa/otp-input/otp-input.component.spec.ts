import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { OtpInputComponent } from './otp-input.component';

@Component({
  standalone: true,
  imports: [OtpInputComponent, ReactiveFormsModule],
  template: `<ks-otp-input [formControl]="code" [invalid]="code.touched && code.invalid" (completed)="done = $event"></ks-otp-input>`,
})
class HostComponent {
  code = new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/^\d{6}$/)] });
  done: string | null = null;
}

function boxes(fixture: ComponentFixture<unknown>): HTMLInputElement[] {
  return Array.from(fixture.nativeElement.querySelectorAll('input.ks-otp__box'));
}

function type(box: HTMLInputElement, value: string): void {
  box.value = value;
  box.dispatchEvent(new Event('input', { bubbles: true }));
}

function key(box: HTMLInputElement, k: string): KeyboardEvent {
  const ev = new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true });
  box.dispatchEvent(ev);
  return ev;
}

function paste(box: HTMLInputElement, text: string): void {
  const data = new DataTransfer();
  data.setData('text', text);
  box.dispatchEvent(new ClipboardEvent('paste', { clipboardData: data, bubbles: true, cancelable: true }));
}

describe('OtpInputComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let otp: OtpInputComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent, NoopAnimationsModule] }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    otp = fixture.debugElement.children[0].componentInstance as OtpInputComponent;
  });

  it('renders six labelled digit boxes with one-time-code autofill on the first', () => {
    const b = boxes(fixture);
    expect(b.length).toBe(6);
    expect(b[0].getAttribute('autocomplete')).toBe('one-time-code');
    expect(b[1].getAttribute('autocomplete')).toBe('off');
    expect(b[2].getAttribute('aria-label')).toBe('Digit 3 of 6');
    expect(b[0].getAttribute('inputmode')).toBe('numeric');
  });

  it('advances focus as digits are typed and updates the form control', () => {
    const b = boxes(fixture);
    b[0].focus();
    type(b[0], '4');
    expect(document.activeElement).toBe(b[1]);
    type(b[1], '2');
    expect(document.activeElement).toBe(b[2]);
    expect(host.code.value).toBe('42');
    expect(host.done).toBeNull();
  });

  it('drops non digit input without moving on', () => {
    const b = boxes(fixture);
    b[0].focus();
    type(b[0], 'a');
    expect(host.code.value).toBe('');
    expect(b[0].value).toBe('');
    expect(document.activeElement).toBe(b[0]);
    const ev = key(b[0], 'x');
    expect(ev.defaultPrevented).toBeTrue();
    const digitEv = key(b[0], '7');
    expect(digitEv.defaultPrevented).toBeFalse();
  });

  it('emits completed exactly once when the sixth digit lands', () => {
    const b = boxes(fixture);
    let emissions = 0;
    otp.completed.subscribe(() => emissions++);
    '123456'.split('').forEach((d, i) => type(b[i], d));
    expect(host.code.value).toBe('123456');
    expect(host.done).toBe('123456');
    expect(emissions).toBe(1);
    // Re-typing the same last digit does not re-emit.
    type(b[5], '6');
    expect(emissions).toBe(1);
  });

  it('re-emits after a digit is changed to a different complete code', () => {
    const b = boxes(fixture);
    const seen: string[] = [];
    otp.completed.subscribe((c) => seen.push(c));
    '123456'.split('').forEach((d, i) => type(b[i], d));
    type(b[5], '9');
    expect(seen).toEqual(['123456', '123459']);
  });

  it('fills every box from a pasted six digit code, ignoring separators', () => {
    const b = boxes(fixture);
    paste(b[3], '83-91 27');
    expect(host.code.value).toBe('839127');
    expect(b.map((x) => x.value).join('')).toBe('839127');
    expect(host.done).toBe('839127');
    expect(document.activeElement).toBe(b[5]);
  });

  it('pastes a partial code from the focused box onwards', () => {
    const b = boxes(fixture);
    type(b[0], '1');
    paste(b[1], '23');
    expect(host.code.value).toBe('123');
    expect(document.activeElement).toBe(b[3]);
  });

  it('ignores a paste with no digits in it', () => {
    const b = boxes(fixture);
    paste(b[0], 'hello');
    expect(host.code.value).toBe('');
  });

  it('backspace on an empty box clears the previous one and moves back', () => {
    const b = boxes(fixture);
    type(b[0], '5');
    type(b[1], '6');
    // focus now on b[2], which is empty
    const ev = key(b[2], 'Backspace');
    expect(ev.defaultPrevented).toBeTrue();
    expect(host.code.value).toBe('5');
    expect(b[1].value).toBe('');
    expect(document.activeElement).toBe(b[1]);
  });

  it('backspace on a filled box lets the browser clear it in place', () => {
    const b = boxes(fixture);
    type(b[0], '5');
    b[0].focus();
    const ev = key(b[0], 'Backspace');
    expect(ev.defaultPrevented).toBeFalse();
    type(b[0], '');
    expect(host.code.value).toBe('');
  });

  it('arrow keys move focus without changing values', () => {
    const b = boxes(fixture);
    type(b[0], '5');
    b[1].focus();
    key(b[1], 'ArrowLeft');
    expect(document.activeElement).toBe(b[0]);
    key(b[0], 'ArrowRight');
    expect(document.activeElement).toBe(b[1]);
    key(b[0], 'ArrowLeft');
    expect(document.activeElement).toBe(b[1]);
    expect(host.code.value).toBe('5');
  });

  it('handles two characters delivered in one input event', () => {
    const b = boxes(fixture);
    type(b[2], '78');
    expect(host.code.value).toBe('78');
    expect(b[2].value).toBe('7');
    expect(b[3].value).toBe('8');
  });

  it('writes a value from the form control into the boxes', () => {
    host.code.setValue('4711');
    fixture.detectChanges();
    expect(boxes(fixture).map((x) => x.value).join('')).toBe('4711');
    host.code.setValue('ab12cd34ef56gh78');
    fixture.detectChanges();
    expect(boxes(fixture).map((x) => x.value).join('')).toBe('123456');
  });

  it('reset clears every box, the control, and focuses the first', () => {
    const b = boxes(fixture);
    '123456'.split('').forEach((d, i) => type(b[i], d));
    otp.reset();
    expect(host.code.value).toBe('');
    expect(b.every((x) => x.value === '')).toBeTrue();
    expect(document.activeElement).toBe(b[0]);
    // and can complete again afterwards
    '654321'.split('').forEach((d, i) => type(b[i], d));
    expect(host.done).toBe('654321');
  });

  it('marks the control touched on blur', () => {
    const b = boxes(fixture);
    expect(host.code.touched).toBeFalse();
    b[0].dispatchEvent(new Event('blur'));
    expect(host.code.touched).toBeTrue();
  });

  it('propagates disabled state from the form control', () => {
    host.code.disable();
    fixture.detectChanges();
    expect(boxes(fixture).every((x) => x.disabled)).toBeTrue();
    host.code.enable();
    fixture.detectChanges();
    expect(boxes(fixture).every((x) => !x.disabled)).toBeTrue();
  });

  it('flags aria-invalid when the host says so', () => {
    host.code.setValue('12');
    host.code.markAsTouched();
    fixture.detectChanges();
    expect(boxes(fixture)[0].getAttribute('aria-invalid')).toBe('true');
    expect(fixture.nativeElement.querySelector('.ks-otp--invalid')).not.toBeNull();
  });

  it('respects a different length', async () => {
    @Component({ standalone: true, imports: [OtpInputComponent], template: `<ks-otp-input [length]="4"></ks-otp-input>` })
    class FourHost {}
    const f = TestBed.createComponent(FourHost);
    f.detectChanges();
    const b = boxes(f);
    expect(b.length).toBe(4);
    expect(b[3].getAttribute('aria-label')).toBe('Digit 4 of 4');
  });
});
