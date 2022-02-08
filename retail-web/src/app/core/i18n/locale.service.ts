import { DOCUMENT } from '@angular/common';
import { Inject, Injectable, LOCALE_ID } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { CookieService } from 'ngx-cookie-service';

export type SupportedLocale = 'en-US' | 'es';

/**
 * Keeps the two i18n mechanisms pointed at the same language. The compile-time locale is fixed
 * per bundle (LOCALE_ID); ngx-translate is told to use the matching runtime language, and the
 * customer's choice is remembered in the `mol_lang` cookie that nginx reads to pick the bundle on
 * the next full load (helm/templates/configmap-nginx.yaml, the map block).
 *
 * Switching language is therefore a full page load to the other bundle, not an in-app change.
 * Customers found that acceptable in the 2022 usability round; it happens once.
 */
@Injectable({ providedIn: 'root' })
export class LocaleService {
  static readonly COOKIE = 'mol_lang';
  static readonly SUPPORTED: SupportedLocale[] = ['en-US', 'es'];

  constructor(
    @Inject(LOCALE_ID) private readonly localeId: string,
    private readonly translate: TranslateService,
    private readonly cookies: CookieService,
    @Inject(DOCUMENT) private readonly document: Document
  ) {}

  get current(): SupportedLocale {
    return this.localeId.startsWith('es') ? 'es' : 'en-US';
  }

  get language(): 'en' | 'es' {
    return this.current === 'es' ? 'es' : 'en';
  }

  initialise(): void {
    this.translate.setDefaultLang('en');
    this.translate.use(this.language);
    this.document.documentElement.lang = this.language;
  }

  switchTo(locale: SupportedLocale): void {
    if (locale === this.current) {
      return;
    }
    this.cookies.set(LocaleService.COOKIE, locale, { path: '/', sameSite: 'Lax', secure: location.protocol === 'https:' });
    const path = this.document.location.pathname.replace(/^\/es(\/|$)/, '/');
    this.document.location.assign((locale === 'es' ? '/es' : '') + path);
  }
}
