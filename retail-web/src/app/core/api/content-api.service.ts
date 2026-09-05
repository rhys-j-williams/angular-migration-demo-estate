import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { BearerTokenInterceptor } from '../interceptors/bearer-token.interceptor';
import { ConfigService } from '../config/config.service';
import { ApiBase } from './api-base';
import { Disclosure, OnboardingApplication } from './models';

/** Unauthenticated content: disclosures, help articles, onboarding. */
@Injectable({ providedIn: 'root' })
export class ContentApiService extends ApiBase {
  constructor(http: HttpClient, config: ConfigService) {
    super(http, config);
  }

  disclosure(key: string): Observable<Disclosure> {
    return this.http.get<Disclosure>(this.url(`/content/disclosures/${encodeURIComponent(key)}`), {
      headers: { [BearerTokenInterceptor.ANONYMOUS_HEADER]: '1', ...this.headerMap(this.cached(3600)) }
    });
  }

  helpArticles(query?: string): Observable<{ id: string; title: string; summary: string; body: string }[]> {
    return this.http.get<{ id: string; title: string; summary: string; body: string }[]>(this.url('/content/help'), {
      params: this.params({ q: query }),
      headers: { [BearerTokenInterceptor.ANONYMOUS_HEADER]: '1' }
    });
  }

  startApplication(productCode: string): Observable<OnboardingApplication> {
    return this.http.post<OnboardingApplication>(this.url('/onboarding/applications'), { productCode }, {
      headers: { [BearerTokenInterceptor.ANONYMOUS_HEADER]: '1' }
    });
  }

  saveApplicationStep(applicationId: string, step: OnboardingApplication['step'], payload: Record<string, unknown>): Observable<OnboardingApplication> {
    return this.http.put<OnboardingApplication>(this.url(`/onboarding/applications/${encodeURIComponent(applicationId)}/${step}`), payload, {
      headers: { [BearerTokenInterceptor.ANONYMOUS_HEADER]: '1' }
    });
  }

  private headerMap(headers: HttpHeaders): Record<string, string> {
    const out: Record<string, string> = {};
    for (const k of headers.keys()) {
      out[k] = headers.get(k) ?? '';
    }
    return out;
  }
}
