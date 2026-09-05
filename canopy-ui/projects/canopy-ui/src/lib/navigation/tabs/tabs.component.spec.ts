import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CnTabsModule } from './tabs.module';

@Component({
  template: `
    <cn-tabs (selectedChange)="index = $event">
      <ng-template cnTab label="Activity" [badge]="3"><p class="body-a">Activity body</p></ng-template>
      <ng-template cnTab label="Statements"><p class="body-b">Statements body</p></ng-template>
    </cn-tabs>`
})
class HostComponent {
  index = 0;
}

describe('CnTabsComponent', () => {
  let fixture: ComponentFixture<HostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [CnTabsModule, NoopAnimationsModule], declarations: [HostComponent] }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
  });

  it('renders a Material tab label per cnTab with the ink bar', () => {
    const labels = fixture.nativeElement.querySelectorAll('.mat-tab-label');
    expect(labels.length).toBe(2);
    expect(labels[0].textContent).toContain('Activity');
    expect(labels[0].querySelector('.cn-tabs__badge').textContent.trim()).toBe('3');
    expect(fixture.nativeElement.querySelector('.mat-ink-bar')).toBeTruthy();
  });

  it('renders bodies lazily', () => {
    expect(fixture.nativeElement.querySelector('.body-a')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.body-b')).toBeNull();
  });
});
