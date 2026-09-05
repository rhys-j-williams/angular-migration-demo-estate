import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CnButtonModule, CnIconButtonModule } from '@meridian/canopy-ui/actions';
import { CN_ICON_SPRITE_URL, CnIconModule } from '@meridian/canopy-ui/icons';
import { CnToastModule } from '@meridian/canopy-ui/overlays';

import { ChatPanelComponent } from '../panel/chat-panel/chat-panel.component';
import { ComposerComponent } from '../panel/composer/composer.component';
import { DisclosureNoticeComponent } from '../panel/disclosure-notice/disclosure-notice.component';
import { HandoffBannerComponent } from '../panel/handoff-banner/handoff-banner.component';
import { MessageBubbleComponent } from '../panel/message-bubble/message-bubble.component';
import { MessageListComponent } from '../panel/message-list/message-list.component';
import { QuickRepliesComponent } from '../panel/quick-replies/quick-replies.component';
import { TypingIndicatorComponent } from '../panel/typing-indicator/typing-indicator.component';
import { IrisWidgetComponent } from './iris-widget.component';
import { LauncherComponent } from './launcher/launcher.component';

/**
 * The one "does it render" test. Deliberately shallow: the widget team's position (IRIS-0490) is
 * that the harness (scripts/harness) proves the thing that matters, which is that the element
 * mounts in a page that is not ours.
 */
describe('IrisWidgetComponent', () => {
  let fixture: ComponentFixture<IrisWidgetComponent>;
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        IrisWidgetComponent,
        LauncherComponent,
        ChatPanelComponent,
        MessageListComponent,
        MessageBubbleComponent,
        QuickRepliesComponent,
        TypingIndicatorComponent,
        HandoffBannerComponent,
        ComposerComponent,
        DisclosureNoticeComponent,
      ],
      imports: [
        HttpClientTestingModule,
        NoopAnimationsModule,
        FormsModule,
        MatIconModule,
        CnIconModule,
        CnIconButtonModule,
        CnButtonModule,
        CnToastModule,
      ],
      providers: [{ provide: CN_ICON_SPRITE_URL, useValue: '/assets/canopy/canopy-sprite.svg' }],
    }).compileComponents();
    fixture = TestBed.createComponent(IrisWidgetComponent);
    http = TestBed.inject(HttpTestingController);
  });

  it('renders closed with only the launcher, and does not call the orchestrator', () => {
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.iris-launcher')).toBeTruthy();
    expect(el.querySelector('#iris-panel')).toBeNull();
    // the only request allowed is the icon registry fetching the sprite
    http.expectNone((r) => r.url.includes('/iris/v1/'));
  });

  it('opening starts a session against the configured orchestrator and shows the greeting', () => {
    fixture.componentInstance.orchestratorUrl = 'http://orchestrator.test';
    fixture.componentInstance.bearerToken = 'tok';
    fixture.componentInstance.ngOnChanges({
      orchestratorUrl: { currentValue: 'http://orchestrator.test', previousValue: null, firstChange: true, isFirstChange: () => true },
      bearerToken: { currentValue: 'tok', previousValue: null, firstChange: true, isFirstChange: () => true },
    });
    fixture.detectChanges();

    (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('.iris-launcher')!.click();
    fixture.detectChanges();

    const req = http.expectOne('http://orchestrator.test/iris/v1/sessions');
    expect(req.request.headers.get('Authorization')).toBe('Bearer tok');
    req.flush({ sessionId: 's', intent: 'greeting', confidence: 1, messages: ["Hi, I'm Iris."], quickReplies: ['Talk to someone'], ended: false });
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('#iris-panel')).toBeTruthy();
    expect(el.textContent).toContain("Hi, I'm Iris.");
    expect(el.querySelectorAll('.iris-quick__chip').length).toBe(1);
  });
});
