import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { AppComponent } from './app.component';
import { LocaleService } from './core/i18n/locale.service';
import { WebVitalsReporter } from './core/telemetry/web-vitals.reporter';

describe('AppComponent', () => {
  let locale: jasmine.SpyObj<LocaleService>;
  let vitals: jasmine.SpyObj<WebVitalsReporter>;

  beforeEach(async () => {
    locale = jasmine.createSpyObj<LocaleService>('LocaleService', ['initialise']);
    vitals = jasmine.createSpyObj<WebVitalsReporter>('WebVitalsReporter', ['start']);
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [AppComponent],
      providers: [
        { provide: LocaleService, useValue: locale },
        { provide: WebVitalsReporter, useValue: vitals }
      ]
    })
      .overrideComponent(AppComponent, { set: { template: '<router-outlet></router-outlet>' } })
      .compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('initialises locale and web vitals on init', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    expect(locale.initialise).toHaveBeenCalled();
    expect(vitals.start).toHaveBeenCalled();
  });
});
