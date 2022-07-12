import { ChangeDetectionStrategy, Component, EventEmitter, Inject, Input, OnChanges, OnInit, Output, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { CnIconRegistry } from '@meridian/canopy-ui/icons';

import { ChatSessionService } from '../core/chat-session.service';
import { OrchestratorClientService } from '../core/orchestrator-client.service';
import { TranscriptExportService } from '../core/transcript-export.service';
import { DEFAULT_WIDGET_CONFIG, IRIS_WIDGET_CONFIG, IrisWidgetConfig } from '../core/widget-config';
import { environment } from '../../environments/environment';

/**
 * The component behind <meridian-iris-widget>. Attributes on the element arrive as inputs
 * (Angular Elements maps orchestrator-url to orchestratorUrl and so on).
 *
 * Providers are declared here rather than on the module so that every mounted element gets its own
 * session state. The config token is a mutable object filled in from the inputs on every change;
 * services read it lazily so attribute order on the host element does not matter.
 *
 * ViewEncapsulation.Emulated, not ShadowDom. We tried ShadowDom in IRIS-0418 and Material's overlay
 * container (which the toast uses) renders outside the shadow root and lost its styles. The host
 * page's CSS can therefore leak in; retail-web's global `button` rule did exactly that once
 * (MOL-4188). The .iris-root class scoping is the mitigation.
 *
 * Change detection is Default on purpose. Elements inputs are set from outside Angular and the
 * OnPush variant missed the first bearer-token update in the WebView (IRIS-0522). Children are OnPush.
 */
@Component({
  selector: 'iris-widget',
  templateUrl: './iris-widget.component.html',
  styleUrls: ['./iris-widget.component.scss'],
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.Default,
  providers: [
    { provide: IRIS_WIDGET_CONFIG, useFactory: (): IrisWidgetConfig => ({ ...DEFAULT_WIDGET_CONFIG, orchestratorUrl: environment.orchestratorUrl }) },
    OrchestratorClientService,
    ChatSessionService,
    TranscriptExportService,
  ],
})
export class IrisWidgetComponent implements OnInit, OnChanges {
  @Input() orchestratorUrl: string | null = null;
  @Input() channel: string | null = null;
  /** Customer's Keystone access token. Host sets it after login and clears it on logout. */
  @Input() bearerToken: string | null = null;
  /** Absolute or host-relative URL of canopy-sprite.svg when it is not under /assets/widgets. */
  @Input() spriteUrl: string | null = null;
  /** Open the panel on mount. The help page uses this when arriving from the "Chat with us" CTA. */
  @Input() open: boolean | string = false;

  /** Fired on the element as `irisOpen` / `irisClose`; retail-web's analytics listen for these. */
  @Output() irisOpen = new EventEmitter<void>();
  @Output() irisClose = new EventEmitter<void>();

  isOpen = false;
  readonly buildLabel = environment.buildLabel;

  constructor(
    @Inject(IRIS_WIDGET_CONFIG) private readonly config: IrisWidgetConfig,
    private readonly icons: CnIconRegistry,
    readonly session: ChatSessionService,
  ) {}

  ngOnInit(): void {
    this.icons.register(this.spriteUrl ?? undefined);
    if (this.open === true || this.open === '' || this.open === 'true') {
      this.toggle(true);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['orchestratorUrl'] && this.orchestratorUrl) {
      this.config.orchestratorUrl = this.orchestratorUrl;
    }
    if (changes['channel'] && this.channel) {
      this.config.channel = this.channel;
    }
    if (changes['bearerToken']) {
      const had = this.config.bearerToken;
      this.config.bearerToken = this.bearerToken || null;
      if (had && !this.config.bearerToken) {
        // Logout. Drop the conversation; the next open starts a fresh, unauthenticated attempt.
        this.session.reset();
      }
    }
    if (changes['spriteUrl'] && this.spriteUrl && !changes['spriteUrl'].firstChange) {
      this.icons.register(this.spriteUrl);
    }
  }

  toggle(force?: boolean): void {
    const next = force ?? !this.isOpen;
    if (next === this.isOpen) {
      return;
    }
    this.isOpen = next;
    if (next) {
      this.session.start();
      this.irisOpen.emit();
    } else {
      this.irisClose.emit();
    }
  }
}
