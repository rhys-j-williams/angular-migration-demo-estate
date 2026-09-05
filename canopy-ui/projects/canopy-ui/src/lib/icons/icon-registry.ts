import { Inject, Injectable, InjectionToken, Optional } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

/** Where the application serves the sprite from. Defaults to the ng-add copied asset path. */
export const CN_ICON_SPRITE_URL = new InjectionToken<string>('CN_ICON_SPRITE_URL');

export const CN_DEFAULT_SPRITE_URL = 'assets/canopy/canopy-sprite.svg';

/**
 * The set of icon ids in the sprite. Kept in step with canopy-sprite.svg by the sprite build;
 * `cn-icon-button` validates against it in dev mode so a typo fails loudly rather than rendering
 * an empty box.
 */
export const CN_ICON_NAMES = [
  'account', 'arrow-up', 'arrow-down', 'arrow-right', 'transfer', 'card', 'lock', 'unlock', 'alert',
  'info', 'check', 'close', 'search', 'filter', 'download', 'calendar', 'menu', 'more',
  'chevron-down', 'chevron-right', 'bell', 'user', 'settings', 'home', 'help', 'eye', 'eye-off',
  'trend-flat', 'document', 'external'
] as const;

export type CnIconName = typeof CN_ICON_NAMES[number];

export const CN_ICON_NAMESPACE = 'cn';

/**
 * Registers the Canopy sprite with Material's `MatIconRegistry` under the `cn` namespace, so a
 * template writes `<mat-icon svgIcon="cn:transfer">`.
 */
@Injectable({ providedIn: 'root' })
export class CnIconRegistry {
  private registered = false;

  constructor(private readonly matIconRegistry: MatIconRegistry,
              private readonly sanitizer: DomSanitizer,
              @Optional() @Inject(CN_ICON_SPRITE_URL) private readonly spriteUrl: string | null) {}

  register(url: string = this.spriteUrl || CN_DEFAULT_SPRITE_URL): void {
    if (this.registered) {
      return;
    }
    // The sprite ships inside our own package and is served from the application's assets, so a
    // resource URL trust is the documented way to hand it to MatIconRegistry.
    this.matIconRegistry.addSvgIconSetInNamespace(
      CN_ICON_NAMESPACE,
      this.sanitizer.bypassSecurityTrustResourceUrl(url)
    );
    this.registered = true;
  }

  isKnown(name: string): name is CnIconName {
    return (CN_ICON_NAMES as readonly string[]).includes(name);
  }
}
