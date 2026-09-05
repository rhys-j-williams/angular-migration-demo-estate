import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LANTERN_CONFIG } from './lantern.config';
import { LanternService } from './lantern.service';
import { LanternTrackDirective } from './lantern-track.directive';

@Component({
  template: `
    <button id="send" lanternTrack="transfer.submit" [lanternProps]="{ amountBand: 'lt-500' }">Send 1,250.00</button>
    <a id="bare" lanternTrack>Statements</a>
    <button id="off" lanternTrack="never" [lanternEnabled]="false">Quiet</button>
    <button id="attr" lanternTrack data-lantern-event="cards.freeze">Freeze</button>
  `
})
class HostComponent {}

describe('LanternTrackDirective', () => {
  let fixture: ComponentFixture<HostComponent>;
  let track: jasmine.Spy;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HostComponent, LanternTrackDirective],
      providers: [{ provide: LANTERN_CONFIG, useValue: { writeKey: 'wk_test', appName: 'spec' } }]
    });
    track = spyOn(TestBed.inject(LanternService), 'track');
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
  });

  function click(id: string): void {
    (fixture.nativeElement.querySelector('#' + id) as HTMLElement).click();
  }

  it('tracks a click with props and masked label', () => {
    click('send');
    expect(track).toHaveBeenCalledWith('transfer.submit', jasmine.objectContaining({
      amountBand: 'lt-500', elementTag: 'button', elementId: 'send', elementText: 'Send #,###.##'
    }));
  });

  it('falls back to data-lantern-event, then to click:<tag>#<id>', () => {
    click('attr');
    click('bare');
    expect(track.calls.argsFor(0)[0]).toBe('cards.freeze');
    expect(track.calls.argsFor(1)[0]).toBe('click:a#bare');
  });

  it('sends nothing when lanternEnabled is false', () => {
    click('off');
    expect(track).not.toHaveBeenCalled();
  });
});
