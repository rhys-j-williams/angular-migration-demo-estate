import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { LegacyMaterialModule } from '../../../shared/legacy/legacy-material.module';
import { CredentialFormComponent, Credentials } from './credential-form.component';

describe('CredentialFormComponent', () => {
  let fixture: ComponentFixture<CredentialFormComponent>;
  let component: CredentialFormComponent;

  beforeEach(async () => {
    localStorage.removeItem('ks.username');
    await TestBed.configureTestingModule({
      declarations: [CredentialFormComponent],
      imports: [ReactiveFormsModule, LegacyMaterialModule, NoopAnimationsModule, HttpClientTestingModule],
    }).compileComponents();
    fixture = TestBed.createComponent(CredentialFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => localStorage.removeItem('ks.username'));

  it('does not submit an empty form', () => {
    const spy = spyOn(component.submitted, 'emit');
    component.submit();
    expect(spy).not.toHaveBeenCalled();
    expect(component.usernameError).toBe('Enter your username');
  });

  it('emits trimmed username and clears the password control after submit', () => {
    let emitted: Credentials | undefined;
    component.submitted.subscribe((c) => (emitted = c));
    component.form.setValue({ username: '  p.fixture ', password: 'CHANGEME-not-a-real-password', rememberUsername: false });
    component.submit();
    expect(emitted).toEqual({ username: 'p.fixture', password: 'CHANGEME-not-a-real-password' });
    expect(component.form.controls.password.value).toBe('');
  });

  it('remembers only the username, never the password', () => {
    component.form.setValue({ username: 'p.fixture', password: 'CHANGEME-not-a-real-password', rememberUsername: true });
    component.submit();
    expect(localStorage.getItem('ks.username')).toBe('p.fixture');
    expect(JSON.stringify(localStorage)).not.toContain('CHANGEME-not-a-real-password');
  });

  it('rejects usernames with spaces or odd characters', () => {
    component.form.controls.username.setValue('p fixture');
    component.form.controls.username.markAsTouched();
    expect(component.usernameError).toContain('Usernames only contain');
  });

  it('disables the form when told to', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    expect(component.form.disabled).toBeTrue();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('.ks-cred__submit');
    expect(button.disabled).toBeTrue();
  });

  it('toggles password visibility', () => {
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input[formcontrolname="password"]');
    expect(input.type).toBe('password');
    component.toggleShowPassword();
    fixture.detectChanges();
    expect(input.type).toBe('text');
  });
});
