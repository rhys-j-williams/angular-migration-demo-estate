import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { DoBootstrap, Injector, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BrowserModule } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CnButtonModule, CnIconButtonModule } from '@meridian/canopy-ui/actions';
import { CN_ICON_SPRITE_URL, CnIconModule } from '@meridian/canopy-ui/icons';
import { CnToastModule } from '@meridian/canopy-ui/overlays';

import { ChatPanelComponent } from './panel/chat-panel/chat-panel.component';
import { ComposerComponent } from './panel/composer/composer.component';
import { DisclosureNoticeComponent } from './panel/disclosure-notice/disclosure-notice.component';
import { HandoffBannerComponent } from './panel/handoff-banner/handoff-banner.component';
import { MessageBubbleComponent } from './panel/message-bubble/message-bubble.component';
import { MessageListComponent } from './panel/message-list/message-list.component';
import { QuickRepliesComponent } from './panel/quick-replies/quick-replies.component';
import { TypingIndicatorComponent } from './panel/typing-indicator/typing-indicator.component';
import { IrisWidgetComponent } from './widget/iris-widget.component';
import { LauncherComponent } from './widget/launcher/launcher.component';

/**
 * No `bootstrap` array and an empty ngDoBootstrap: main.ts registers the custom element instead.
 * Everything here is an old-style NgModule declaration because the widget started on Angular 13
 * and nobody has had a reason to convert it. Standalone components would work; the element
 * factory does not care.
 *
 * NoopAnimationsModule rather than BrowserAnimationsModule: the host page already has the
 * animations engine, and the toast is the only thing in here that animates. Saves ~30 KB and
 * avoids double-registering the animation renderer factory (IRIS-0445).
 */
@NgModule({
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
    BrowserModule,
    NoopAnimationsModule,
    CommonModule,
    FormsModule,
    HttpClientModule,
    MatIconModule,
    MatButtonModule,
    CnIconModule,
    CnIconButtonModule,
    CnButtonModule,
    CnToastModule,
  ],
  providers: [
    // The sprite ships next to the bundle. Hosts that mount us from a different path override this
    // through the sprite-url attribute; see IrisWidgetComponent.
    { provide: CN_ICON_SPRITE_URL, useValue: '/assets/widgets/assets/canopy/canopy-sprite.svg' },
  ],
})
export class IrisWidgetModule implements DoBootstrap {
  constructor(private readonly injector: Injector) {}

  ngDoBootstrap(): void {
    // Intentionally empty. See main.ts. The injector is kept so a future second element
    // (IRIS-0801 branch locator) can be registered from here without another platform.
    void this.injector;
  }
}
