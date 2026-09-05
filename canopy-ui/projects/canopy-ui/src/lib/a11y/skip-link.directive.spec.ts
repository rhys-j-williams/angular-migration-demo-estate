import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { CnA11yModule } from './a11y.module';

@Component({
  template: `
    <a cnSkipLink="content"></a>
    <main id="content"><h1>Accounts</h1></main>
  `
})
class HostComponent {}

describe('CnSkipLinkDirective', () => {
  let fixture: ComponentFixture<HostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [CnA11yModule], declarations: [HostComponent] }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
  });

  it('fills in default text and href', () => {
    const anchor: HTMLAnchorElement = fixture.debugElement.query(By.css('a')).nativeElement;
    expect(anchor.textContent).toBe('Skip to main content');
    expect(anchor.getAttribute('href')).toBe('#content');
  });

  it('moves focus to the target on click', () => {
    const anchor: HTMLAnchorElement = fixture.debugElement.query(By.css('a')).nativeElement;
    anchor.click();
    const main = fixture.nativeElement.querySelector('#content') as HTMLElement;
    expect(main.getAttribute('tabindex')).toBe('-1');
    expect(document.activeElement).toBe(main);
  });
});
