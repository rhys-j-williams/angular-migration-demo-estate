import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CnA11yModule } from './a11y.module';

@Component({
  template: `<div cnFocusTrap><button>one</button><button>two</button></div>`
})
class HostComponent {}

describe('CnFocusTrapDirective', () => {
  let fixture: ComponentFixture<HostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [CnA11yModule], declarations: [HostComponent] }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.cn-focus-trap')).toBeTruthy();
  });
});
