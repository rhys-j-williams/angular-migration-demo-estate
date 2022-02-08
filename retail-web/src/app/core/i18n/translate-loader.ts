import { HttpClient } from '@angular/common/http';
import { TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { environment } from '../../../environments/environment';

/**
 * Two i18n systems live in this app and it is worth knowing which is which before touching text.
 *
 * $localize (compile time, XLF in src/locale) handles template copy: labels, headings, buttons,
 * anything static. The build emits one bundle per locale (en-US, es) and nginx serves /es/ to
 * customers whose preference says Spanish.
 *
 * ngx-translate (runtime, JSON in assets/i18n) handles the content that comes from the BFF as
 * codes: BFF error codes, alert catalogue labels, transaction categories, disclosure titles.
 * Those change between trains without a front end deploy, so they cannot be baked into the
 * bundle. It also covers the handful of strings built at runtime with interpolation that
 * $localize's ICU support could not express in 2021 (MOL-1604).
 *
 * The plan of record is to consolidate on one; that is a story under MOL-4471.
 */
export function translateLoaderFactory(http: HttpClient): TranslateLoader {
  return new TranslateHttpLoader(http, 'assets/i18n/', `.json?v=${environment.version}`);
}
