import os
A='/home/ubuntu/repos/angular-migration-demo-estate/retail-web/src/app/features/alerts/components'
P='/home/ubuntu/repos/angular-migration-demo-estate/retail-web/src/app/features/profile/components'
def w(p,s):
    os.makedirs(os.path.dirname(p),exist_ok=True); open(p,'w').write(s.lstrip('\n'))
HEAD='''import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
'''
def spec(path, name, extra_imports='', providers='', body='', schemas=''):
    w(path, HEAD + extra_imports + f'''
import {{ SharedModule }} from '../../../../shared/shared.module';
import {{ {name} }} from './{os.path.basename(path).replace('.spec.ts','')}';

describe('{name}', () => {{
  let fixture: ComponentFixture<{name}>;

  beforeEach(async () => {{
    await TestBed.configureTestingModule({{
      declarations: [{name}],
      imports: [SharedModule, HttpClientTestingModule, RouterTestingModule, NoopAnimationsModule],
      providers: [{providers}]{schemas}
    }}).compileComponents();

    fixture = TestBed.createComponent({name});
    fixture.detectChanges();
  }});

  it('should create', () => {{
    expect(fixture.componentInstance).toBeTruthy();
  }});
{body}}});
''')

ALERTS_STATE = "{ [alertsFeatureKey]: { ids: [], entities: {}, loading: false, error: null, selectedId: null, loadedAt: null } }"

# ---------- alerts-home
w(f'{A}/alerts-home/alerts-home.component.ts','''
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

/** Tabs: preferences and history. Tab index is mirrored into the fragment so links can deep-link. */
@Component({
  selector: 'mol-alerts-home',
  templateUrl: './alerts-home.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlertsHomeComponent {
  tab = this.route.snapshot.fragment === 'quiet-hours' ? 1 : 0;

  constructor(private readonly route: ActivatedRoute, private readonly router: Router) {}

  onTab(index: number): void {
    this.tab = index;
    void this.router.navigate([], { relativeTo: this.route, fragment: index === 1 ? 'quiet-hours' : undefined, replaceUrl: true });
  }
}
''')
w(f'{A}/alerts-home/alerts-home.component.html','''
<cn-page-header title="Alerts" i18n-title="@@alerts.home.title" lede="Choose what we tell you about and how. Some alerts are required by law and cannot be switched off." i18n-lede="@@alerts.home.lede"></cn-page-header>

<div class="mol-page" fxLayout="column" fxLayoutGap="16px">
  <cn-tabs [selectedIndex]="tab" (selectedChange)="onTab($event)" ariaLabel="Alert settings">
    <ng-template cnTab label="Preferences" i18n-label="@@alerts.home.tabPreferences">
      <mol-alert-preferences></mol-alert-preferences>
    </ng-template>
    <ng-template cnTab label="Quiet hours" i18n-label="@@alerts.home.tabQuiet">
      <mol-quiet-hours></mol-quiet-hours>
    </ng-template>
  </cn-tabs>
  <a routerLink="history" class="mol-link" i18n="@@alerts.home.history">See alerts we have sent in the last 90 days</a>
</div>
''')
spec(f'{A}/alerts-home/alerts-home.component.spec.ts','AlertsHomeComponent', "import { NO_ERRORS_SCHEMA } from '@angular/core';\n", schemas=",\n      schemas: [NO_ERRORS_SCHEMA]")

# ---------- alert-preferences
w(f'{A}/alert-preferences/alert-preferences.component.ts','''
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { CnToastService } from '@meridian/canopy-ui/overlays';

import { AlertsApiService } from '../../../../core/api/alerts-api.service';
import { AlertPreference } from '../../../../core/api/models';
import { AppError } from '../../../../core/errors/app-error.model';
import { LanternService } from '../../../../core/telemetry/lantern.service';
import { alertsActions } from '../../store/alerts.actions';
import { alertsSelectors } from '../../store/alerts.selectors';

export interface AlertGroup {
  id: string;
  title: string;
  blurb: string;
  items: AlertPreference[];
}

const GROUPS: { id: string; prefix: string; title: string; blurb: string }[] = [
  { id: 'security', prefix: 'security.', title: 'Security', blurb: 'Sign-ins, new devices, password and contact changes. Required.' },
  { id: 'balance', prefix: 'balance.', title: 'Balances', blurb: 'Low balance, large deposits and overdraft warnings.' },
  { id: 'transactions', prefix: 'transaction.', title: 'Transactions', blurb: 'Card purchases, declines and transfers above an amount you choose.' },
  { id: 'card', prefix: 'card.', title: 'Cards', blurb: 'Card locked, card used abroad, card not present.' },
  { id: 'payments', prefix: 'payment.', title: 'Bills and payments', blurb: 'Bills due, payments sent, payments failed.' },
  { id: 'statements', prefix: 'statement.', title: 'Statements and documents', blurb: 'Statement ready, tax forms available.' }
];

/**
 * Grouped alert toggles with channel selection and thresholds. Regulatory alerts (Reg E, Reg DD
 * and the CAN-SPAM opt-out record) render but cannot be disabled; the BFF enforces that too, this
 * is only the UI half. Updates are optimistic with a rollback on failure.
 */
@Component({
  selector: 'mol-alert-preferences',
  templateUrl: './alert-preferences.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlertPreferencesComponent implements OnInit {
  readonly groups$: Observable<AlertGroup[]> = this.store.select(alertsSelectors.selectAll).pipe(map(items => AlertPreferencesComponent.group(items)));
  readonly loading$ = this.store.select(alertsSelectors.selectLoading);
  readonly error$ = this.store.select(alertsSelectors.selectError);
  saving = new Set<string>();

  constructor(
    private readonly store: Store,
    private readonly api: AlertsApiService,
    private readonly toast: CnToastService,
    private readonly lantern: LanternService
  ) {}

  ngOnInit(): void {
    this.store.dispatch(alertsActions.load());
  }

  retry(): void {
    this.store.dispatch(alertsActions.invalidate());
    this.store.dispatch(alertsActions.load());
  }

  update(before: AlertPreference, change: Partial<Pick<AlertPreference, 'enabled' | 'channels' | 'thresholdMinor'>>): void {
    if (before.regulatory && change.enabled === false) {
      this.toast.caution($localize`:@@alerts.prefs.regulatory:This alert is required and cannot be turned off.`);
      return;
    }
    this.saving.add(before.alertId);
    this.store.dispatch(alertsActions.upsert({ item: { ...before, ...change } }));
    this.api.updatePreference(before.alertId, change).subscribe({
      next: saved => {
        this.saving.delete(before.alertId);
        this.store.dispatch(alertsActions.upsert({ item: saved }));
        this.lantern.track('alerts.preference.updated', { code: before.code, enabled: saved.enabled, channels: saved.channels.length });
      },
      error: (err: AppError) => {
        this.saving.delete(before.alertId);
        this.store.dispatch(alertsActions.upsert({ item: before }));
        this.toast.error(err.title);
      }
    });
  }

  trackByGroup(_: number, g: AlertGroup): string {
    return g.id;
  }

  static group(items: AlertPreference[]): AlertGroup[] {
    const out: AlertGroup[] = GROUPS.map(g => ({ id: g.id, title: g.title, blurb: g.blurb, items: items.filter(i => i.code.startsWith(g.prefix)) }));
    const known = new Set(out.flatMap(g => g.items.map(i => i.alertId)));
    const other = items.filter(i => !known.has(i.alertId));
    if (other.length) out.push({ id: 'other', title: 'Other', blurb: '', items: other });
    return out.filter(g => g.items.length);
  }
}
''')
w(f'{A}/alert-preferences/alert-preferences.component.html','''
<div fxLayout="column" fxLayoutGap="16px">
  <mol-error-banner [error]="error$ | async" (retry)="retry()"></mol-error-banner>
  <mol-loading-panel *ngIf="(loading$ | async) && !(groups$ | async)?.length" [rows]="6"></mol-loading-panel>

  <mol-page-section *ngFor="let group of groups$ | async; trackBy: trackByGroup" [title]="group.title" [lede]="group.blurb">
    <mol-alert-preference-row
      *ngFor="let pref of group.items"
      [preference]="pref"
      [busy]="saving.has(pref.alertId)"
      (enabledChange)="update(pref, { enabled: $event })"
      (channelsChange)="update(pref, { channels: $event })"
      (thresholdChange)="update(pref, { thresholdMinor: $event })">
    </mol-alert-preference-row>
  </mol-page-section>

  <p class="mol-muted mol-small" i18n="@@alerts.prefs.footnote">Text message alerts go to the mobile number on your profile. Message and data rates may apply. Reply STOP to any alert text to switch off SMS for all optional alerts.</p>
</div>
''')
spec(f'{A}/alert-preferences/alert-preferences.component.spec.ts','AlertPreferencesComponent',
 "import { NO_ERRORS_SCHEMA } from '@angular/core';\nimport { provideMockStore } from '@ngrx/store/testing';\n\nimport { AlertPreference } from '../../../../core/api/models';\nimport { LanternService } from '../../../../core/telemetry/lantern.service';\nimport { alertsFeatureKey } from '../../store/alerts.reducer';\n",
 providers=f"provideMockStore({{ initialState: {ALERTS_STATE} }}), {{ provide: LanternService, useValue: jasmine.createSpyObj<LanternService>('LanternService', ['track']) }}",
 schemas=",\n      schemas: [NO_ERRORS_SCHEMA]",
 body='''
  it('groups preferences by code prefix and drops empty groups', () => {
    const pref = (alertId: string, code: string): AlertPreference => ({ alertId, customerId: 'c', code, label: code, description: '', regulatory: false, enabled: true, channels: ['email'] });
    const groups = AlertPreferencesComponent.group([pref('1', 'security.new-device'), pref('2', 'balance.low'), pref('3', 'balance.large-deposit'), pref('4', 'misc.thing')]);
    expect(groups.map(g => g.id)).toEqual(['security', 'balance', 'other']);
    expect(groups[1].items.length).toBe(2);
  });
''')

# ---------- alert-preference-row
w(f'{A}/alert-preference-row/alert-preference-row.component.ts','''
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { AlertPreference, Channel } from '../../../../core/api/models';

/** One alert: toggle, channels, threshold. Purely presentational; the parent owns persistence. */
@Component({
  selector: 'mol-alert-preference-row',
  templateUrl: './alert-preference-row.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlertPreferenceRowComponent {
  @Input() preference!: AlertPreference;
  @Input() busy = false;
  @Output() readonly enabledChange = new EventEmitter<boolean>();
  @Output() readonly channelsChange = new EventEmitter<Channel[]>();
  @Output() readonly thresholdChange = new EventEmitter<number>();

  editingThreshold = false;
  thresholdMajor: number | null = null;

  get hasThreshold(): boolean {
    return this.preference.thresholdMinor !== undefined;
  }

  startThreshold(): void {
    this.thresholdMajor = (this.preference.thresholdMinor ?? 0) / 100;
    this.editingThreshold = true;
  }

  saveThreshold(): void {
    if (this.thresholdMajor === null || this.thresholdMajor < 0) return;
    const minor = Math.round(this.thresholdMajor * 100);
    this.editingThreshold = false;
    if (minor !== this.preference.thresholdMinor) this.thresholdChange.emit(minor);
  }
}
''')
w(f'{A}/alert-preference-row/alert-preference-row.component.html','''
<div class="mol-pref-row" [class.mol-pref-row--busy]="busy" fxLayout="row" fxLayout.lt-md="column" fxLayoutAlign="space-between start" fxLayoutGap="16px">
  <div fxFlex fxLayout="column" fxLayoutGap="4px">
    <div fxLayout="row" fxLayoutAlign="start center" fxLayoutGap="8px">
      <strong>{{ preference.label }}</strong>
      <cn-badge *ngIf="preference.regulatory" tone="info" size="small" i18n="@@alerts.row.required">Required</cn-badge>
    </div>
    <span class="mol-muted">{{ preference.description }}</span>

    <div *ngIf="hasThreshold" class="mol-pref-row__threshold" fxLayout="row" fxLayoutAlign="start center" fxLayoutGap="8px">
      <ng-container *ngIf="!editingThreshold">
        <span i18n="@@alerts.row.threshold">When over {{ preference.thresholdMinor | minorAmount }}</span>
        <cn-button variant="tertiary" size="small" (pressed)="startThreshold()" [disabled]="!preference.enabled || busy" i18n="@@action.change">Change</cn-button>
      </ng-container>
      <ng-container *ngIf="editingThreshold">
        <mat-form-field appearance="outline" class="mol-pref-row__amount">
          <mat-label i18n="@@alerts.row.amount">Amount</mat-label>
          <cn-currency-input [(ngModel)]="thresholdMajor" [min]="0" [allowNegative]="false" molAutofocus></cn-currency-input>
        </mat-form-field>
        <cn-button variant="secondary" size="small" (pressed)="saveThreshold()" i18n="@@action.save">Save</cn-button>
        <cn-button variant="tertiary" size="small" (pressed)="editingThreshold = false" i18n="@@action.cancel">Cancel</cn-button>
      </ng-container>
    </div>

    <mol-channel-picker *ngIf="preference.enabled" [value]="preference.channels" [regulatory]="preference.regulatory" [disabled]="busy" (valueChange)="channelsChange.emit($event)"></mol-channel-picker>
  </div>

  <cn-toggle [checked]="preference.enabled" [disabled]="preference.regulatory || busy" [ariaLabel]="preference.label" onText="On" offText="Off" (changed)="enabledChange.emit($event)"></cn-toggle>
</div>
''')
spec(f'{A}/alert-preference-row/alert-preference-row.component.spec.ts','AlertPreferenceRowComponent', "import { NO_ERRORS_SCHEMA } from '@angular/core';\n", schemas=",\n      schemas: [NO_ERRORS_SCHEMA]",
 body='''
  it('emits the threshold in minor units only when it changed', () => {
    const c = fixture.componentInstance;
    const spy = spyOn(c.thresholdChange, 'emit');
    c.preference = { ...c.preference, thresholdMinor: 50000 };
    c.startThreshold();
    expect(c.thresholdMajor).toBe(500);
    c.saveThreshold();
    expect(spy).not.toHaveBeenCalled();
    c.thresholdMajor = 750;
    c.saveThreshold();
    expect(spy).toHaveBeenCalledWith(75000);
  });
''')
# preference input must be set before detectChanges in row spec
p=f'{A}/alert-preference-row/alert-preference-row.component.spec.ts'
s=open(p).read().replace("    fixture = TestBed.createComponent(AlertPreferenceRowComponent);\n    fixture.detectChanges();",
"    fixture = TestBed.createComponent(AlertPreferenceRowComponent);\n    fixture.componentInstance.preference = { alertId: 'a1', customerId: 'c', code: 'transaction.large', label: 'Large transaction', description: '', regulatory: false, enabled: true, channels: ['push'], thresholdMinor: 20000 };\n    fixture.detectChanges();")
open(p,'w').write(s)

# ---------- channel-picker
w(f'{A}/channel-picker/channel-picker.component.ts','''
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { CnFilterChip } from '@meridian/canopy-ui/data-display';

import { Channel } from '../../../../core/api/models';
import { selectProfile } from '../../../../core/store/session';

/**
 * Push / SMS / email / in-app chips. SMS is only offered when the profile has a mobile number;
 * in-app cannot be removed from regulatory alerts because it is the delivery of record.
 */
@Component({
  selector: 'mol-channel-picker',
  templateUrl: './channel-picker.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChannelPickerComponent implements OnInit {
  @Input() value: Channel[] = [];
  @Input() regulatory = false;
  @Input() disabled = false;
  @Output() readonly valueChange = new EventEmitter<Channel[]>();

  chips$!: Observable<CnFilterChip<Channel>[]>;

  constructor(private readonly store: Store) {}

  ngOnInit(): void {
    this.chips$ = this.store.select(selectProfile).pipe(
      map(profile => {
        const hasMobile = !!profile?.mobile;
        return [
          { value: 'in-app', label: 'In app', icon: 'notifications', disabled: this.regulatory },
          { value: 'push', label: 'Push', icon: 'phone_iphone' },
          { value: 'sms', label: hasMobile ? 'Text message' : 'Text message (add a mobile number)', icon: 'sms', disabled: !hasMobile },
          { value: 'email', label: 'Email', icon: 'mail' }
        ] as CnFilterChip<Channel>[];
      })
    );
  }

  onChange(next: Channel[]): void {
    const cleaned = this.regulatory && !next.includes('in-app') ? ['in-app', ...next] : next;
    if (!cleaned.length) return; // an enabled alert with no channel is meaningless; the parent toggles instead
    this.valueChange.emit(cleaned as Channel[]);
  }
}
''')
w(f'{A}/channel-picker/channel-picker.component.html','''
<cn-filter-chips *ngIf="chips$ | async as chips" [chips]="chips" [multiple]="true" [showClear]="false" [selected]="value" [disabled]="disabled" ariaLabel="Delivery channels" (selectionChange)="onChange($event)"></cn-filter-chips>
''')
spec(f'{A}/channel-picker/channel-picker.component.spec.ts','ChannelPickerComponent',
 "import { provideMockStore } from '@ngrx/store/testing';\n\nimport { sessionFeatureKey } from '../../../../core/store/session';\n",
 providers="provideMockStore({ initialState: { [sessionFeatureKey]: { profile: { mobile: '' } } } })",
 body='''
  it('keeps in-app on regulatory alerts', () => {
    const c = fixture.componentInstance;
    c.regulatory = true;
    const spy = spyOn(c.valueChange, 'emit');
    c.onChange(['email']);
    expect(spy).toHaveBeenCalledWith(['in-app', 'email']);
  });

  it('ignores an empty selection', () => {
    const c = fixture.componentInstance;
    const spy = spyOn(c.valueChange, 'emit');
    c.onChange([]);
    expect(spy).not.toHaveBeenCalled();
  });
''')

# ---------- quiet-hours
w(f'{A}/quiet-hours/quiet-hours.component.ts','''
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { forkJoin } from 'rxjs';
import { filter, take } from 'rxjs/operators';

import { CnToastService } from '@meridian/canopy-ui/overlays';

import { AlertsApiService } from '../../../../core/api/alerts-api.service';
import { AlertPreference } from '../../../../core/api/models';
import { alertsActions } from '../../store/alerts.actions';
import { alertsSelectors } from '../../store/alerts.selectors';

interface QuietHoursForm {
  enabled: FormControl<boolean>;
  start: FormControl<string>;
  end: FormControl<string>;
}

const TIME = /^([01]\\d|2[0-3]):[0-5]\\d$/;

/**
 * Do-not-disturb window for non-regulatory alerts. The BFF stores quiet hours per alert (legacy
 * of the 2019 notifications schema), so one window is fanned out to every optional alert. Times
 * are in the customer's profile time zone, which today is always Eastern (MOL-2201 never landed).
 */
@Component({
  selector: 'mol-quiet-hours',
  templateUrl: './quiet-hours.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QuietHoursComponent implements OnInit {
  readonly form: FormGroup<QuietHoursForm> = this.fb.group({
    enabled: this.fb.control(false),
    start: this.fb.control('22:00', [Validators.required, Validators.pattern(TIME)]),
    end: this.fb.control('07:00', [Validators.required, Validators.pattern(TIME)])
  });
  saving = false;
  private optional: AlertPreference[] = [];

  constructor(
    private readonly fb: NonNullableFormBuilder,
    private readonly store: Store,
    private readonly api: AlertsApiService,
    private readonly toast: CnToastService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.store.dispatch(alertsActions.load());
    this.store.select(alertsSelectors.selectAll).pipe(filter(list => list.length > 0), take(1)).subscribe(list => {
      this.optional = list.filter(p => !p.regulatory);
      const withWindow = this.optional.find(p => p.quietHours);
      if (withWindow?.quietHours) {
        this.form.patchValue({ enabled: true, start: withWindow.quietHours.start, end: withWindow.quietHours.end });
      }
      this.cdr.markForCheck();
    });
  }

  get spansMidnight(): boolean {
    const { start, end } = this.form.getRawValue();
    return start > end;
  }

  save(): void {
    if (this.form.invalid || this.saving) {
      this.form.markAllAsTouched();
      return;
    }
    const { enabled, start, end } = this.form.getRawValue();
    const quietHours = enabled ? { start, end } : undefined;
    this.saving = true;
    forkJoin(this.optional.map(p => this.api.updatePreference(p.alertId, { quietHours }))).subscribe({
      next: saved => {
        saved.forEach(item => this.store.dispatch(alertsActions.upsert({ item })));
        this.saving = false;
        this.form.markAsPristine();
        this.toast.success(enabled ? $localize`:@@alerts.quiet.saved:Quiet hours saved` : $localize`:@@alerts.quiet.cleared:Quiet hours turned off`);
        this.cdr.markForCheck();
      },
      error: () => {
        this.saving = false;
        this.toast.error($localize`:@@alerts.quiet.failed:We could not save quiet hours. Try again in a moment.`);
        this.cdr.markForCheck();
      }
    });
  }
}
''')
w(f'{A}/quiet-hours/quiet-hours.component.html','''
<mol-page-section title="Quiet hours" i18n-title="@@alerts.quiet.title" lede="Hold optional alerts overnight and deliver them in the morning. Security and regulatory alerts are always sent immediately." i18n-lede="@@alerts.quiet.lede">
  <form [formGroup]="form" (ngSubmit)="save()" novalidate fxLayout="column" fxLayoutGap="12px">
    <cn-toggle formControlName="enabled" onText="Quiet hours on" offText="Quiet hours off"></cn-toggle>

    <div *ngIf="form.controls.enabled.value" fxLayout="row" fxLayout.lt-md="column" fxLayoutGap="16px">
      <mat-form-field appearance="outline">
        <mat-label i18n="@@alerts.quiet.from">From</mat-label>
        <input matInput type="time" formControlName="start" step="900" />
      </mat-form-field>
      <mat-form-field appearance="outline">
        <mat-label i18n="@@alerts.quiet.until">Until</mat-label>
        <input matInput type="time" formControlName="end" step="900" />
        <mat-hint *ngIf="spansMidnight" i18n="@@alerts.quiet.nextDay">Next day</mat-hint>
      </mat-form-field>
    </div>
    <p class="mol-muted mol-small" i18n="@@alerts.quiet.tz">Times are Eastern. Alerts held overnight are delivered together when quiet hours end.</p>

    <div fxLayout="row" fxLayoutAlign="end">
      <cn-button type="submit" variant="primary" [loading]="saving" [disabled]="form.pristine || form.invalid" i18n="@@action.save">Save</cn-button>
    </div>
  </form>
</mol-page-section>
''')
spec(f'{A}/quiet-hours/quiet-hours.component.spec.ts','QuietHoursComponent',
 "import { provideMockStore } from '@ngrx/store/testing';\n\nimport { alertsFeatureKey } from '../../store/alerts.reducer';\n",
 providers=f"provideMockStore({{ initialState: {ALERTS_STATE} }})",
 body='''
  it('recognises a window that crosses midnight', () => {
    const c = fixture.componentInstance;
    c.form.patchValue({ start: '22:00', end: '07:00' });
    expect(c.spansMidnight).toBeTrue();
    c.form.patchValue({ start: '13:00', end: '14:00' });
    expect(c.spansMidnight).toBeFalse();
  });
''')

# ---------- alert-history
w(f'{A}/alert-history/alert-history.component.ts','''
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, scan, switchMap, tap } from 'rxjs/operators';

import { AlertsApiService } from '../../../../core/api/alerts-api.service';
import { AlertHistoryItem } from '../../../../core/api/models';

const PAGE = 50;

/** Alerts sent in the last 90 days, infinite-scroll style "show more". */
@Component({
  selector: 'mol-alert-history',
  templateUrl: './alert-history.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlertHistoryComponent implements OnInit {
  items$!: Observable<AlertHistoryItem[]>;
  exhausted = false;
  private readonly page$ = new BehaviorSubject<number>(1);

  constructor(private readonly api: AlertsApiService) {}

  ngOnInit(): void {
    this.items$ = this.page$.pipe(
      switchMap(page => this.api.history(page, PAGE)),
      tap(batch => (this.exhausted = batch.length < PAGE)),
      scan((all, batch) => [...all, ...batch], [] as AlertHistoryItem[]),
      map(list => list.sort((a, b) => b.sentAt.localeCompare(a.sentAt)))
    );
  }

  more(): void {
    this.page$.next(this.page$.value + 1);
  }

  byDay(items: AlertHistoryItem[]): { day: string; items: AlertHistoryItem[] }[] {
    const groups = new Map<string, AlertHistoryItem[]>();
    for (const i of items) {
      const day = i.sentAt.slice(0, 10);
      groups.set(day, [...(groups.get(day) ?? []), i]);
    }
    return [...groups.entries()].map(([day, list]) => ({ day, items: list }));
  }
}
''')
w(f'{A}/alert-history/alert-history.component.html','''
<cn-page-header title="Alert history" i18n-title="@@alerts.history.title" lede="Everything we have sent you in the last 90 days, across every channel." i18n-lede="@@alerts.history.lede" backLink="/alerts" backLabel="Alerts"></cn-page-header>

<div class="mol-page" fxLayout="column" fxLayoutGap="16px">
  <ng-container *ngIf="items$ | async as items; else loading">
    <ng-container *ngIf="items.length; else empty">
      <section *ngFor="let group of byDay(items)" class="mol-history-day">
        <h2 class="mol-history-day__title">{{ group.day | date:'fullDate' }}</h2>
        <ul>
          <li *ngFor="let a of group.items" fxLayout="row" fxLayoutAlign="space-between center" fxLayoutGap="12px" [class.mol-unread]="!a.read">
            <div fxFlex fxLayout="column">
              <span>{{ a.summary }}</span>
              <span class="mol-muted mol-small">{{ a.sentAt | date:'shortTime' }} &middot; {{ a.channel }}<ng-container *ngIf="a.accountId"> &middot; <a [routerLink]="['/accounts', a.accountId]" i18n="@@alerts.history.viewAccount">View account</a></ng-container></span>
            </div>
            <cn-badge *ngIf="!a.read" tone="brand" [dot]="true" size="small">New</cn-badge>
          </li>
        </ul>
      </section>
      <div fxLayout="row" fxLayoutAlign="center">
        <cn-button *ngIf="!exhausted" variant="secondary" (pressed)="more()" i18n="@@action.showMore">Show more</cn-button>
        <span *ngIf="exhausted" class="mol-muted mol-small" i18n="@@alerts.history.end">That is everything from the last 90 days.</span>
      </div>
    </ng-container>
  </ng-container>
  <ng-template #loading><mol-loading-panel [rows]="8"></mol-loading-panel></ng-template>
  <ng-template #empty>
    <mol-empty-state icon="notifications_none" title="No alerts sent yet" i18n-title="@@alerts.history.empty" body="Once an alert is triggered it will be listed here for 90 days." i18n-body="@@alerts.history.emptyBody"></mol-empty-state>
  </ng-template>
</div>
''')
spec(f'{A}/alert-history/alert-history.component.spec.ts','AlertHistoryComponent', "\nimport { AlertHistoryItem } from '../../../../core/api/models';\n",
 body='''
  it('groups alerts by calendar day', () => {
    const item = (id: string, sentAt: string): AlertHistoryItem => ({ id, code: 'balance.low', sentAt, channel: 'email', summary: '', read: true });
    const groups = fixture.componentInstance.byDay([item('1', '2026-09-01T09:00:00Z'), item('2', '2026-09-01T18:00:00Z'), item('3', '2026-08-30T08:00:00Z')]);
    expect(groups.length).toBe(2);
    expect(groups[0].items.length).toBe(2);
  });
''')

# ================= PROFILE
PROFILE_STATE = "{ [profileFeatureKey]: { ids: [], entities: {}, loading: false, error: null, selectedId: null, loadedAt: null } }"

w(f'{P}/profile-home/profile-home.component.ts','''
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { ProfileApiService } from '../../../../core/api/profile-api.service';
import { SecuritySettings } from '../../../../core/api/models';
import { selectProfile } from '../../../../core/store/session';

export interface SecurityPosture {
  score: 0 | 1 | 2 | 3;
  passwordAgeDays: number;
  mfaMethod: SecuritySettings['mfaMethod'];
  deviceCount: number;
  recentFailures: number;
}

/** Overview with contact summary and security posture. */
@Component({
  selector: 'mol-profile-home',
  templateUrl: './profile-home.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileHomeComponent implements OnInit {
  readonly profile$ = this.store.select(selectProfile);
  posture$!: Observable<SecurityPosture | null>;

  constructor(private readonly store: Store, private readonly api: ProfileApiService) {}

  ngOnInit(): void {
    this.posture$ = this.api.security().pipe(map(s => ProfileHomeComponent.posture(s)), catchError(() => of(null)));
  }

  static posture(s: SecuritySettings, now: Date = new Date()): SecurityPosture {
    const passwordAgeDays = Math.floor((now.getTime() - new Date(s.passwordChangedAt).getTime()) / 86_400_000);
    const recentFailures = s.loginHistory.filter(l => l.outcome === 'failed').length;
    let score = 3;
    if (s.mfaMethod === 'sms') score -= 1; // SIM swap risk; Security want everyone on authenticator or push
    if (passwordAgeDays > 365) score -= 1;
    if (recentFailures >= 3) score -= 1;
    return { score: Math.max(0, score) as SecurityPosture['score'], passwordAgeDays, mfaMethod: s.mfaMethod, deviceCount: s.trustedDevices.length, recentFailures };
  }

  postureTone(p: SecurityPosture): 'success' | 'caution' | 'warn' {
    return p.score === 3 ? 'success' : p.score === 2 ? 'caution' : 'warn';
  }

  postureLabel(p: SecurityPosture): string {
    return p.score === 3 ? $localize`:@@profile.posture.strong:Strong` : p.score === 2 ? $localize`:@@profile.posture.fair:Could be better` : $localize`:@@profile.posture.weak:Needs attention`;
  }
}
''')
w(f'{P}/profile-home/profile-home.component.html','''
<cn-page-header title="Profile and security" i18n-title="@@profile.home.title"></cn-page-header>

<div class="mol-page" fxLayout="row" fxLayout.lt-md="column" fxLayoutGap="16px">
  <cn-card fxFlex="1 1 0" [padded]="true" title="Contact details" i18n-title="@@profile.home.contact" *ngIf="profile$ | async as p">
    <dl class="mol-dl">
      <dt i18n="@@profile.home.name">Name</dt>
      <dd>{{ p.displayName }}</dd>
      <dt i18n="@@profile.home.email">Email</dt>
      <dd>{{ p.email }}</dd>
      <dt i18n="@@profile.home.mobile">Mobile</dt>
      <dd>{{ p.mobile || '—' }}</dd>
      <dt i18n="@@profile.home.address">Address</dt>
      <dd>{{ p.address.line1 }}<ng-container *ngIf="p.address.line2">, {{ p.address.line2 }}</ng-container><br />{{ p.address.city }}, {{ p.address.state }} {{ p.address.postalCode }}</dd>
      <dt i18n="@@profile.home.language">Language</dt>
      <dd>{{ p.preferredLanguage === 'es' ? 'Español' : 'English' }}</dd>
      <dt i18n="@@profile.home.since">Customer since</dt>
      <dd>{{ p.enrolledAt | date:'MMMM y' }}</dd>
    </dl>
    <div fxLayout="row" fxLayoutGap="8px" fxLayout.lt-md="column">
      <cn-button variant="secondary" size="small" routerLink="contact" i18n="@@profile.home.editContact">Edit email and mobile</cn-button>
      <cn-button variant="tertiary" size="small" routerLink="address" i18n="@@profile.home.editAddress">Change address</cn-button>
    </div>
  </cn-card>

  <cn-card fxFlex="1 1 0" [padded]="true" title="Security" i18n-title="@@profile.home.security">
    <ng-container *ngIf="posture$ | async as posture; else postureLoading">
      <div fxLayout="row" fxLayoutAlign="start center" fxLayoutGap="8px" class="mol-posture">
        <cn-badge [tone]="postureTone(posture)">{{ postureLabel(posture) }}</cn-badge>
        <span class="mol-muted" i18n="@@profile.home.postureBlurb">{{ posture.score }} of 3 checks passed</span>
      </div>
      <ul class="mol-checks">
        <li fxLayout="row" fxLayoutGap="8px" fxLayoutAlign="start center">
          <mat-icon [class.mol-ok]="posture.mfaMethod !== 'sms'" [class.mol-warn]="posture.mfaMethod === 'sms'" aria-hidden="true">{{ posture.mfaMethod !== 'sms' ? 'check_circle' : 'warning' }}</mat-icon>
          <span *ngIf="posture.mfaMethod !== 'sms'" i18n="@@profile.home.mfaOk">Two-step verification uses {{ posture.mfaMethod === 'push' ? 'push notifications' : 'an authenticator app' }}</span>
          <span *ngIf="posture.mfaMethod === 'sms'" i18n="@@profile.home.mfaSms">Two-step verification uses text messages. An authenticator app is safer.</span>
        </li>
        <li fxLayout="row" fxLayoutGap="8px" fxLayoutAlign="start center">
          <mat-icon [class.mol-ok]="posture.passwordAgeDays <= 365" [class.mol-warn]="posture.passwordAgeDays > 365" aria-hidden="true">{{ posture.passwordAgeDays <= 365 ? 'check_circle' : 'warning' }}</mat-icon>
          <span i18n="@@profile.home.passwordAge">Password last changed {{ posture.passwordAgeDays }} days ago</span>
        </li>
        <li fxLayout="row" fxLayoutGap="8px" fxLayoutAlign="start center">
          <mat-icon [class.mol-ok]="posture.recentFailures < 3" [class.mol-warn]="posture.recentFailures >= 3" aria-hidden="true">{{ posture.recentFailures < 3 ? 'check_circle' : 'warning' }}</mat-icon>
          <span i18n="@@profile.home.failures">{{ posture.recentFailures }} failed sign-in attempts recently, {{ posture.deviceCount }} trusted devices</span>
        </li>
      </ul>
    </ng-container>
    <ng-template #postureLoading><mol-loading-panel [rows]="3"></mol-loading-panel></ng-template>
    <cn-button variant="secondary" size="small" routerLink="security" i18n="@@profile.home.manageSecurity">Manage security settings</cn-button>
  </cn-card>
</div>
''')
spec(f'{P}/profile-home/profile-home.component.spec.ts','ProfileHomeComponent',
 "import { provideMockStore } from '@ngrx/store/testing';\n\nimport { SecuritySettings } from '../../../../core/api/models';\nimport { sessionFeatureKey } from '../../../../core/store/session';\n",
 providers="provideMockStore({ initialState: { [sessionFeatureKey]: { profile: null } } })",
 body='''
  it('scores SMS MFA, stale passwords and failed sign-ins down', () => {
    const base: SecuritySettings = { mfaMethod: 'authenticator', mfaEnrolledAt: '2024-01-01', passwordChangedAt: '2026-06-01', trustedDevices: [], loginHistory: [] };
    const now = new Date('2026-09-05');
    expect(ProfileHomeComponent.posture(base, now).score).toBe(3);
    expect(ProfileHomeComponent.posture({ ...base, mfaMethod: 'sms' }, now).score).toBe(2);
    expect(ProfileHomeComponent.posture({ ...base, mfaMethod: 'sms', passwordChangedAt: '2024-01-01' }, now).score).toBe(1);
  });
''')

# ---------- security-settings
w(f'{P}/security-settings/security-settings.component.ts','''
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { ProfileApiService } from '../../../../core/api/profile-api.service';
import { SecuritySettings } from '../../../../core/api/models';
import { AuthService } from '../../../../core/auth/auth.service';

/** MFA method, password age, username, devices, login history. Read on stage; keep it tidy. */
@Component({
  selector: 'mol-security-settings',
  templateUrl: './security-settings.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SecuritySettingsComponent implements OnInit {
  settings$!: Observable<SecuritySettings>;

  constructor(private readonly api: ProfileApiService, private readonly auth: AuthService) {}

  ngOnInit(): void {
    this.settings$ = this.api.security();
  }

  get username(): string {
    return this.auth.claims?.preferred_username ?? '';
  }

  mfaLabel(m: SecuritySettings['mfaMethod']): string {
    switch (m) {
      case 'sms': return $localize`:@@profile.security.mfaSms:Text message code`;
      case 'authenticator': return $localize`:@@profile.security.mfaApp:Authenticator app`;
      case 'push': return $localize`:@@profile.security.mfaPush:Push notification to the Meridian app`;
    }
  }

  lastFailed(s: SecuritySettings): string | null {
    return s.loginHistory.find(l => l.outcome === 'failed')?.at ?? null;
  }

  signOutEverywhere(): void {
    this.auth.logout('user-requested');
  }
}
''')
w(f'{P}/security-settings/security-settings.component.html','''
<cn-page-header title="Security" i18n-title="@@profile.security.title" backLink="/profile" backLabel="Profile"></cn-page-header>

<div class="mol-page" fxLayout="column" fxLayoutGap="16px" *ngIf="settings$ | async as s; else loading">
  <cn-list [interactive]="true" [dividers]="true" ariaLabel="Security settings" [items]="[
    { id: 'password', primary: 'Password', secondary: 'Last changed ' + (s.passwordChangedAt | date:'mediumDate'), icon: 'password', link: 'password' },
    { id: 'username', primary: 'Username', secondary: username, icon: 'badge', link: 'username' },
    { id: 'mfa', primary: 'Two-step verification', secondary: mfaLabel(s.mfaMethod), icon: 'verified_user', link: 'mfa' },
    { id: 'devices', primary: 'Trusted devices', secondary: s.trustedDevices.length + ' devices skip the code', icon: 'devices', link: 'devices' },
    { id: 'activity', primary: 'Sign-in activity', secondary: lastFailed(s) ? 'Last failed attempt ' + (lastFailed(s) | date:'medium') : 'No failed attempts recently', icon: 'history', link: 'activity' }
  ]"></cn-list>

  <cn-card [padded]="true" title="Sign out everywhere" i18n-title="@@profile.security.signOutTitle">
    <p class="mol-muted" i18n="@@profile.security.signOutBody">Ends every Meridian Online and mobile session, including this one. Trusted devices stay trusted; remove them separately if you think a device is compromised.</p>
    <cn-button variant="destructive" (pressed)="signOutEverywhere()" i18n="@@profile.security.signOut">Sign out of all devices</cn-button>
  </cn-card>

  <p class="mol-muted mol-small" i18n="@@profile.security.footnote">If you think someone else has access to your account, call the number on the back of your card. Our fraud line is open 24 hours.</p>
</div>
<ng-template #loading><mol-loading-panel [rows]="5"></mol-loading-panel></ng-template>
''')
spec(f'{P}/security-settings/security-settings.component.spec.ts','SecuritySettingsComponent',
 "\nimport { AuthService } from '../../../../core/auth/auth.service';\n",
 providers="{ provide: AuthService, useValue: { claims: { preferred_username: 'dana.k' }, logout: jasmine.createSpy('logout') } }",
 body='''
  it('describes each MFA method', () => {
    expect(fixture.componentInstance.mfaLabel('push')).toContain('Push');
    expect(fixture.componentInstance.username).toBe('dana.k');
  });
''')

# ---------- change-password (untyped forms: T23)
w(f'{P}/change-password/change-password.component.ts','''
import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { CnToastService } from '@meridian/canopy-ui/overlays';

import { ProfileApiService } from '../../../../core/api/profile-api.service';
import { AppError } from '../../../../core/errors/app-error.model';
import { HasUnsavedChanges } from '../../../../core/guards/unsaved-changes.guard';
import { LanternService } from '../../../../core/telemetry/lantern.service';

export interface StrengthRule {
  id: string;
  label: string;
  test: (value: string) => boolean;
}

export const PASSWORD_RULES: StrengthRule[] = [
  { id: 'length', label: 'At least 12 characters', test: v => v.length >= 12 },
  { id: 'upper', label: 'An upper case letter', test: v => /[A-Z]/.test(v) },
  { id: 'lower', label: 'A lower case letter', test: v => /[a-z]/.test(v) },
  { id: 'digit', label: 'A number', test: v => /\\d/.test(v) },
  { id: 'symbol', label: 'A symbol', test: v => /[^A-Za-z0-9]/.test(v) },
  { id: 'repeat', label: 'No character repeated four times in a row', test: v => !/(.)\\1{3}/.test(v) }
];

function passwordRules(control: AbstractControl): ValidationErrors | null {
  const v = String(control.value ?? '');
  const failed = PASSWORD_RULES.filter(r => !r.test(v)).map(r => r.id);
  return failed.length ? { rules: failed } : null;
}

function matches(group: AbstractControl): ValidationErrors | null {
  const next = group.get('next')?.value;
  const confirm = group.get('confirm')?.value;
  return next && confirm && next !== confirm ? { mismatch: true } : null;
}

/**
 * Password change with strength rules. Still on the untyped form API: this and the rest of
 * profile were written before Angular 14 and nobody has touched them since (MOL-4471 covers it).
 */
@Component({
  selector: 'mol-change-password',
  templateUrl: './change-password.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChangePasswordComponent implements HasUnsavedChanges {
  readonly form: UntypedFormGroup = this.fb.group(
    {
      current: ['', Validators.required],
      next: ['', [Validators.required, passwordRules]],
      confirm: ['', Validators.required]
    },
    { validators: matches }
  );
  readonly rules = PASSWORD_RULES;
  busy = false;
  error: AppError | null = null;
  private saved = false;

  constructor(
    private readonly fb: UntypedFormBuilder,
    private readonly api: ProfileApiService,
    private readonly router: Router,
    private readonly toast: CnToastService,
    private readonly lantern: LanternService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  hasUnsavedChanges(): boolean {
    return this.form.dirty && !this.saved;
  }

  passes(rule: StrengthRule): boolean {
    return rule.test(String(this.form.get('next')?.value ?? ''));
  }

  get reusesCurrent(): boolean {
    const { current, next } = this.form.value;
    return !!next && next === current;
  }

  submit(): void {
    if (this.form.invalid || this.reusesCurrent || this.busy) {
      this.form.markAllAsTouched();
      return;
    }
    this.busy = true;
    this.error = null;
    this.api.changePassword(this.form.value.current, this.form.value.next).subscribe({
      next: () => {
        this.saved = true;
        this.lantern.track('profile.password.changed');
        this.toast.success($localize`:@@profile.password.saved:Password changed. You will need it next time you sign in.`);
        void this.router.navigate(['/profile/security']);
      },
      error: (err: AppError) => {
        this.busy = false;
        this.error = err;
        if (err.code === 'PASSWORD_CURRENT_INCORRECT') this.form.get('current')?.setErrors({ incorrect: true });
        if (err.code === 'PASSWORD_RECENTLY_USED') this.form.get('next')?.setErrors({ reused: true });
        this.cdr.markForCheck();
      }
    });
  }
}
''')
w(f'{P}/change-password/change-password.component.html','''
<cn-page-header title="Change password" i18n-title="@@profile.password.title" backLink="/profile/security" backLabel="Security"></cn-page-header>

<div class="mol-page mol-narrow">
  <form [formGroup]="form" (ngSubmit)="submit()" novalidate fxLayout="column" fxLayoutGap="12px" autocomplete="off">
    <mol-error-banner [error]="error" [showRetry]="false"></mol-error-banner>

    <mat-form-field appearance="outline">
      <mat-label i18n="@@profile.password.current">Current password</mat-label>
      <input matInput type="password" formControlName="current" autocomplete="current-password" />
      <mat-error *ngIf="form.get('current')?.hasError('incorrect')" i18n="@@profile.password.incorrect">That is not your current password</mat-error>
      <mat-error *ngIf="form.get('current')?.hasError('required')" i18n="@@profile.password.currentRequired">Enter your current password</mat-error>
    </mat-form-field>

    <mat-form-field appearance="outline">
      <mat-label i18n="@@profile.password.next">New password</mat-label>
      <input matInput type="password" formControlName="next" autocomplete="new-password" />
      <mat-error *ngIf="form.get('next')?.hasError('reused')" i18n="@@profile.password.reused">You have used that password recently. Choose a different one.</mat-error>
    </mat-form-field>

    <ul class="mol-rules" aria-live="polite">
      <li *ngFor="let rule of rules" [class.mol-rules__ok]="passes(rule)" fxLayout="row" fxLayoutGap="6px" fxLayoutAlign="start center">
        <mat-icon aria-hidden="true">{{ passes(rule) ? 'check' : 'radio_button_unchecked' }}</mat-icon><span>{{ rule.label }}</span>
      </li>
      <li *ngIf="reusesCurrent" class="mol-warn" i18n="@@profile.password.sameAsCurrent">Your new password must be different from the current one</li>
    </ul>

    <mat-form-field appearance="outline">
      <mat-label i18n="@@profile.password.confirm">Confirm new password</mat-label>
      <input matInput type="password" formControlName="confirm" autocomplete="new-password" />
      <mat-error *ngIf="form.hasError('mismatch') && form.get('confirm')?.touched" i18n="@@profile.password.mismatch">The passwords do not match</mat-error>
    </mat-form-field>

    <div fxLayout="row" fxLayoutAlign="end" fxLayoutGap="8px">
      <cn-button variant="tertiary" routerLink="/profile/security" i18n="@@action.cancel">Cancel</cn-button>
      <cn-button type="submit" variant="primary" [loading]="busy" [disabled]="form.invalid || reusesCurrent" i18n="@@profile.password.submit">Change password</cn-button>
    </div>
  </form>
</div>
''')
spec(f'{P}/change-password/change-password.component.spec.ts','ChangePasswordComponent',
 "\nimport { LanternService } from '../../../../core/telemetry/lantern.service';\n",
 providers="{ provide: LanternService, useValue: jasmine.createSpyObj<LanternService>('LanternService', ['track']) }",
 body='''
  it('enforces the strength rules and confirmation match', () => {
    const c = fixture.componentInstance;
    c.form.setValue({ current: 'OldPassword!1', next: 'short', confirm: 'short' });
    expect(c.form.get('next')?.hasError('rules')).toBeTrue();
    c.form.setValue({ current: 'OldPassword!1', next: 'Correct-Horse-9x', confirm: 'Correct-Horse-8x' });
    expect(c.form.hasError('mismatch')).toBeTrue();
    c.form.patchValue({ confirm: 'Correct-Horse-9x' });
    expect(c.form.valid).toBeTrue();
  });

  it('refuses to reuse the current password', () => {
    const c = fixture.componentInstance;
    c.form.setValue({ current: 'Correct-Horse-9x', next: 'Correct-Horse-9x', confirm: 'Correct-Horse-9x' });
    expect(c.reusesCurrent).toBeTrue();
  });
''')

# ---------- mfa-settings
w(f'{P}/mfa-settings/mfa-settings.component.ts','''
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { CnRadioOption } from '@meridian/canopy-ui/forms';
import { CnToastService } from '@meridian/canopy-ui/overlays';

import { ProfileApiService } from '../../../../core/api/profile-api.service';
import { SecuritySettings } from '../../../../core/api/models';
import { AuthService } from '../../../../core/auth/auth.service';
import { AppError } from '../../../../core/errors/app-error.model';
import { LanternService } from '../../../../core/telemetry/lantern.service';

type MfaMethod = SecuritySettings['mfaMethod'];

/**
 * Choose SMS, authenticator or push. Changing the method is itself a sensitive action, so the
 * customer must have stepped up within the last ten minutes; otherwise we bounce through Keystone
 * and come back here.
 */
@Component({
  selector: 'mol-mfa-settings',
  templateUrl: './mfa-settings.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MfaSettingsComponent implements OnInit {
  readonly options: CnRadioOption<MfaMethod>[] = [
    { value: 'push', label: 'Push notification', description: 'Approve sign-ins in the Meridian mobile app. Recommended.' },
    { value: 'authenticator', label: 'Authenticator app', description: 'Six digit codes from an app such as any TOTP authenticator.' },
    { value: 'sms', label: 'Text message', description: 'Codes sent to your mobile. Least secure; vulnerable to SIM swap.' }
  ];
  current: MfaMethod | null = null;
  selected: MfaMethod | null = null;
  enrolledAt: string | null = null;
  busy = false;
  error: AppError | null = null;

  constructor(
    private readonly api: ProfileApiService,
    private readonly auth: AuthService,
    private readonly router: Router,
    private readonly toast: CnToastService,
    private readonly lantern: LanternService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.api.security().subscribe(s => {
      this.current = s.mfaMethod;
      this.selected = s.mfaMethod;
      this.enrolledAt = s.mfaEnrolledAt;
      this.cdr.markForCheck();
    });
  }

  get changed(): boolean {
    return this.selected !== null && this.selected !== this.current;
  }

  save(): void {
    if (!this.selected || !this.changed || this.busy) return;
    if (!this.auth.hasRecentMfa()) {
      this.auth.stepUp(this.router.url);
      return;
    }
    this.busy = true;
    this.error = null;
    this.api.setMfaMethod(this.selected).subscribe({
      next: s => {
        this.busy = false;
        this.current = s.mfaMethod;
        this.enrolledAt = s.mfaEnrolledAt;
        this.lantern.track('profile.mfa.method_changed', { method: s.mfaMethod });
        this.toast.success($localize`:@@profile.mfa.saved:Two-step verification updated`);
        this.cdr.markForCheck();
      },
      error: (err: AppError) => {
        this.busy = false;
        this.error = err;
        this.cdr.markForCheck();
      }
    });
  }
}
''')
w(f'{P}/mfa-settings/mfa-settings.component.html','''
<cn-page-header title="Two-step verification" i18n-title="@@profile.mfa.title" lede="We ask for a second step when you sign in from a new device and before large transfers." i18n-lede="@@profile.mfa.lede" backLink="/profile/security" backLabel="Security"></cn-page-header>

<div class="mol-page mol-narrow" fxLayout="column" fxLayoutGap="16px">
  <mol-error-banner [error]="error" [showRetry]="false"></mol-error-banner>
  <ng-container *ngIf="current; else loading">
    <cn-radio-group legend="How should we verify you?" i18n-legend="@@profile.mfa.legend" [options]="options" [(ngModel)]="selected" [disabled]="busy"></cn-radio-group>
    <p class="mol-muted mol-small" *ngIf="enrolledAt" i18n="@@profile.mfa.enrolled">Current method set up {{ enrolledAt | date:'mediumDate' }}.</p>
    <p class="mol-note" *ngIf="changed" i18n="@@profile.mfa.stepUpNote">We will ask you to verify with your current method before switching.</p>
    <div fxLayout="row" fxLayoutAlign="end">
      <cn-button variant="primary" [loading]="busy" [disabled]="!changed" (pressed)="save()" i18n="@@action.save">Save</cn-button>
    </div>
  </ng-container>
  <ng-template #loading><mol-loading-panel [rows]="3"></mol-loading-panel></ng-template>
</div>
''')
spec(f'{P}/mfa-settings/mfa-settings.component.spec.ts','MfaSettingsComponent',
 "\nimport { AuthService } from '../../../../core/auth/auth.service';\nimport { LanternService } from '../../../../core/telemetry/lantern.service';\n",
 providers="{ provide: AuthService, useValue: { hasRecentMfa: () => false, stepUp: jasmine.createSpy('stepUp') } }, { provide: LanternService, useValue: jasmine.createSpyObj<LanternService>('LanternService', ['track']) }",
 body='''
  it('sends the customer through step-up when the MFA claim is stale', () => {
    const c = fixture.componentInstance;
    c.current = 'sms';
    c.selected = 'push';
    c.save();
    expect(TestBed.inject(AuthService).stepUp).toHaveBeenCalled();
    expect(c.busy).toBeFalse();
  });
''')

# ---------- trusted-devices
w(f'{P}/trusted-devices/trusted-devices.component.ts','''
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';

import { CnDialogService, CnToastService } from '@meridian/canopy-ui/overlays';

import { ProfileApiService } from '../../../../core/api/profile-api.service';
import { TrustedDevice } from '../../../../core/api/models';
import { AppError } from '../../../../core/errors/app-error.model';
import { profileActions } from '../../store/profile.actions';
import { profileSelectors } from '../../store/profile.selectors';

/** Devices that skip step-up; remove any. Backed by the profile entity store (TrustedDevice). */
@Component({
  selector: 'mol-trusted-devices',
  templateUrl: './trusted-devices.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TrustedDevicesComponent implements OnInit {
  readonly devices$ = this.store.select(profileSelectors.selectAll);
  readonly loading$ = this.store.select(profileSelectors.selectLoading);
  readonly error$ = this.store.select(profileSelectors.selectError);

  constructor(
    private readonly store: Store,
    private readonly api: ProfileApiService,
    private readonly dialog: CnDialogService,
    private readonly toast: CnToastService
  ) {}

  ngOnInit(): void {
    this.store.dispatch(profileActions.load());
  }

  retry(): void {
    this.store.dispatch(profileActions.invalidate());
    this.store.dispatch(profileActions.load());
  }

  icon(d: TrustedDevice): string {
    const p = d.platform.toLowerCase();
    if (p.includes('ios') || p.includes('android')) return 'smartphone';
    if (p.includes('ipad') || p.includes('tablet')) return 'tablet';
    return 'computer';
  }

  remove(d: TrustedDevice): void {
    this.dialog
      .confirm({
        title: $localize`:@@profile.devices.removeTitle:Remove ${d.label}:device:?`,
        message: d.current
          ? $localize`:@@profile.devices.removeCurrent:This is the device you are using now. You will be asked for a verification code next time you sign in here.`
          : $localize`:@@profile.devices.removeOther:That device will need a verification code the next time it signs in.`,
        confirmLabel: $localize`:@@action.remove:Remove`,
        destructive: true
      })
      .subscribe(ok => {
        if (!ok) return;
        this.api.removeDevice(d.deviceId).subscribe({
          next: remaining => {
            this.store.dispatch(profileActions.loaded({ items: remaining }));
            this.toast.success($localize`:@@profile.devices.removed:Device removed`);
          },
          error: (err: AppError) => this.toast.error(err.title)
        });
      });
  }

  trackById(_: number, d: TrustedDevice): string {
    return d.deviceId;
  }
}
''')
w(f'{P}/trusted-devices/trusted-devices.component.html','''
<cn-page-header title="Trusted devices" i18n-title="@@profile.devices.title" lede="These devices skip two-step verification for 90 days. Remove anything you do not recognise." i18n-lede="@@profile.devices.lede" backLink="/profile/security" backLabel="Security"></cn-page-header>

<div class="mol-page" fxLayout="column" fxLayoutGap="16px">
  <mol-error-banner [error]="error$ | async" (retry)="retry()"></mol-error-banner>
  <ng-container *ngIf="devices$ | async as devices">
    <mol-loading-panel *ngIf="(loading$ | async) && !devices.length" [rows]="3"></mol-loading-panel>
    <ul class="mol-devices" *ngIf="devices.length">
      <li *ngFor="let d of devices; trackBy: trackById" fxLayout="row" fxLayoutAlign="space-between center" fxLayoutGap="12px">
        <mat-icon aria-hidden="true">{{ icon(d) }}</mat-icon>
        <div fxFlex fxLayout="column">
          <span>{{ d.label }} <cn-badge *ngIf="d.current" tone="brand" size="small" i18n="@@profile.devices.thisDevice">This device</cn-badge></span>
          <span class="mol-muted mol-small">{{ d.platform }} &middot; <ng-container i18n="@@profile.devices.lastSeen">Last used {{ d.lastSeenAt | relativeDate }}</ng-container></span>
        </div>
        <cn-button variant="tertiary" size="small" (pressed)="remove(d)" i18n="@@action.remove">Remove</cn-button>
      </li>
    </ul>
    <mol-empty-state *ngIf="!devices.length && !(loading$ | async)" icon="devices" title="No trusted devices" i18n-title="@@profile.devices.empty" body="You will be asked for a verification code every time you sign in." i18n-body="@@profile.devices.emptyBody"></mol-empty-state>
  </ng-container>
</div>
''')
spec(f'{P}/trusted-devices/trusted-devices.component.spec.ts','TrustedDevicesComponent',
 "import { provideMockStore } from '@ngrx/store/testing';\n\nimport { profileFeatureKey } from '../../store/profile.reducer';\n",
 providers=f"provideMockStore({{ initialState: {PROFILE_STATE} }})",
 body='''
  it('picks a device icon from the platform string', () => {
    const c = fixture.componentInstance;
    const d = { deviceId: '1', label: '', platform: 'iOS 17', lastSeenAt: '', current: false };
    expect(c.icon(d)).toBe('smartphone');
    expect(c.icon({ ...d, platform: 'Windows 11' })).toBe('computer');
  });
''')

# ---------- login-history
w(f'{P}/login-history/login-history.component.ts','''
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ProfileApiService } from '../../../../core/api/profile-api.service';
import { LoginHistoryItem } from '../../../../core/api/models';

/** Recent sign-ins with location and device. Failed attempts are called out; step-ups shown quietly. */
@Component({
  selector: 'mol-login-history',
  templateUrl: './login-history.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginHistoryComponent implements OnInit {
  history$!: Observable<LoginHistoryItem[]>;

  constructor(private readonly api: ProfileApiService) {}

  ngOnInit(): void {
    this.history$ = this.api.security().pipe(map(s => [...s.loginHistory].sort((a, b) => b.at.localeCompare(a.at))));
  }

  tone(o: LoginHistoryItem['outcome']): 'success' | 'warn' | 'info' {
    return o === 'success' ? 'success' : o === 'failed' ? 'warn' : 'info';
  }

  label(o: LoginHistoryItem['outcome']): string {
    return o === 'success' ? $localize`:@@profile.activity.success:Signed in` : o === 'failed' ? $localize`:@@profile.activity.failed:Failed attempt` : $localize`:@@profile.activity.stepUp:Verified identity`;
  }

  failures(list: LoginHistoryItem[]): number {
    return list.filter(l => l.outcome === 'failed').length;
  }
}
''')
w(f'{P}/login-history/login-history.component.html','''
<cn-page-header title="Sign-in activity" i18n-title="@@profile.activity.title" lede="The last 30 days of sign-ins to Meridian Online and the mobile app." i18n-lede="@@profile.activity.lede" backLink="/profile/security" backLabel="Security"></cn-page-header>

<div class="mol-page" fxLayout="column" fxLayoutGap="16px">
  <ng-container *ngIf="history$ | async as list; else loading">
    <mol-error-banner *ngIf="failures(list) >= 3" [error]="{ kind: 'unknown', status: 0, title: 'There have been ' + failures(list) + ' failed sign-in attempts recently.', detail: 'If this was not you, change your password and remove any trusted devices you do not recognise.', retryable: false, url: '', method: '' }" [showRetry]="false"></mol-error-banner>
    <table class="mol-table" *ngIf="list.length; else empty">
      <caption class="cdk-visually-hidden" i18n="@@profile.activity.caption">Sign-in history</caption>
      <thead>
        <tr>
          <th scope="col" i18n="@@profile.activity.when">When</th>
          <th scope="col" i18n="@@profile.activity.outcome">Outcome</th>
          <th scope="col" i18n="@@profile.activity.where">Where</th>
          <th scope="col" i18n="@@profile.activity.device">Device</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let l of list">
          <td>{{ l.at | date:'medium' }}</td>
          <td><cn-badge [tone]="tone(l.outcome)" size="small">{{ label(l.outcome) }}</cn-badge></td>
          <td>{{ l.city }}</td>
          <td>{{ l.deviceLabel }} <span class="mol-muted">({{ l.channel }})</span></td>
        </tr>
      </tbody>
    </table>
  </ng-container>
  <ng-template #loading><mol-loading-panel [rows]="6"></mol-loading-panel></ng-template>
  <ng-template #empty><mol-empty-state icon="history" title="No sign-ins recorded" i18n-title="@@profile.activity.empty"></mol-empty-state></ng-template>
</div>
''')
spec(f'{P}/login-history/login-history.component.spec.ts','LoginHistoryComponent', body='''
  it('counts failed attempts', () => {
    const c = fixture.componentInstance;
    expect(c.failures([
      { at: '1', outcome: 'failed', channel: 'web', city: '', deviceLabel: '' },
      { at: '2', outcome: 'success', channel: 'web', city: '', deviceLabel: '' }
    ])).toBe(1);
    expect(c.tone('failed')).toBe('warn');
  });
''')
