import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatTooltip } from '@angular/material/tooltip';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CnTooltipModule } from './tooltip.module';

@Component({ template: `<button cnTooltip="Excludes pending">Balance</button>` })
class HostComponent {}

describe('CnTooltipDirective', () => {
  let fixture: ComponentFixture<HostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [CnTooltipModule, NoopAnimationsModule], declarations: [HostComponent] }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
  });

  it('configures the underlying MatTooltip with the Canopy class', () => {
    const tooltip = fixture.debugElement.query(d => d.name === 'button').injector.get(MatTooltip);
    expect(tooltip.message).toBe('Excludes pending');
    expect(tooltip.tooltipClass).toBe('cn-tooltip');
  });
});
