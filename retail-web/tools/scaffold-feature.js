#!/usr/bin/env node
/*
 * Feature scaffolder. Reads tools/feature-spec.json and writes module, routing, NgRx store and
 * component files for a feature under src/app/features/<feature>/.
 *
 *   node tools/scaffold-feature.js rewards            # one feature
 *   node tools/scaffold-feature.js --all              # every feature in the spec
 *   node tools/scaffold-feature.js rewards --force    # overwrite files that already exist
 *
 * Without --force existing files are left alone, so hand-edited components survive a re-run.
 * This started life as `ng generate component` in a shell loop (MOL-1710); the templating grew
 * because every generated component then needed the same twenty lines of store wiring by hand.
 * It is not a code generator in the schematics sense and does not try to be.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SPEC = JSON.parse(fs.readFileSync(path.join(__dirname, 'feature-spec.json'), 'utf8'));
const args = process.argv.slice(2);
const force = args.includes('--force');
const targets = args.includes('--all') ? Object.keys(SPEC.features) : args.filter(a => !a.startsWith('--'));

if (!targets.length) {
  console.error('usage: scaffold-feature.js <feature>|--all [--force]');
  process.exit(1);
}

const pascal = s => s.replace(/(^|-)(\w)/g, (_, __, c) => c.toUpperCase());
const camel = s => pascal(s).replace(/^./, c => c.toLowerCase());
const written = [];

function write(rel, content) {
  const abs = path.join(ROOT, rel);
  if (fs.existsSync(abs) && !force) return;
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, content.replace(/\n{3,}/g, '\n\n').trimStart());
  written.push(rel);
}

// ---------------------------------------------------------------------------------------------
// templates
// ---------------------------------------------------------------------------------------------

function fieldControl(f, untyped) {
  const init = f.type === 'toggle' ? 'false' : f.type === 'currency' ? 'null' : f.type === 'select' ? 'null' : "''";
  const validators = [];
  if (f.required) validators.push('Validators.required');
  if (f.maxLength) validators.push(`Validators.maxLength(${f.maxLength})`);
  if (f.type === 'currency') validators.push('Validators.min(1)');
  const v = validators.length ? `, [${validators.join(', ')}]` : '';
  if (untyped) return `      ${f.name}: [${init}${v}]`;
  const t = f.type === 'toggle' ? 'boolean' : f.type === 'currency' ? 'number | null' : f.type === 'select' ? 'string | null' : 'string';
  return `      ${f.name}: new FormControl<${t}>(${init}, { nonNullable: ${f.type === 'toggle' || (f.type !== 'currency' && f.type !== 'select')}${v ? `, validators: ${v.slice(2)}` : ''} })`;
}

function fieldTemplate(f) {
  const label = `i18n-label="@@${f.i18n}" label="${f.label}"`;
  switch (f.type) {
    case 'currency':
      return `      <mat-form-field appearance="outline" fxFlex>
        <mat-label i18n="@@${f.i18n}">${f.label}</mat-label>
        <cn-currency-input formControlName="${f.name}" [min]="0"></cn-currency-input>
        <mat-error *ngIf="form.get('${f.name}')?.hasError('required')" i18n="@@validation.amountRequired">Enter an amount</mat-error>
      </mat-form-field>`;
    case 'select':
      return `      <cn-select formControlName="${f.name}" ${label} [options]="${f.name}Options" [required]="${!!f.required}" fxFlex></cn-select>`;
    case 'toggle':
      return `      <cn-toggle formControlName="${f.name}" ${f.hint ? `hint="${f.hint}"` : ''}><span i18n="@@${f.i18n}">${f.label}</span></cn-toggle>`;
    case 'date':
      return `      <mat-form-field appearance="outline" fxFlex>
        <mat-label i18n="@@${f.i18n}">${f.label}</mat-label>
        <input matInput formControlName="${f.name}" type="date" [min]="today">
      </mat-form-field>`;
    case 'textarea':
      return `      <mat-form-field appearance="outline" fxFlex="100">
        <mat-label i18n="@@${f.i18n}">${f.label}</mat-label>
        <textarea matInput formControlName="${f.name}" rows="4" ${f.maxLength ? `maxlength="${f.maxLength}"` : ''}></textarea>
        ${f.maxLength ? `<mat-hint align="end">{{ form.get('${f.name}')?.value?.length || 0 }}/${f.maxLength}</mat-hint>` : ''}
      </mat-form-field>`;
    case 'masked':
      return `      <cn-masked-input formControlName="${f.name}" ${label} preset="${f.preset || 'phone'}" [required]="${!!f.required}" fxFlex></cn-masked-input>`;
    default:
      return `      <mat-form-field appearance="outline" fxFlex>
        <mat-label i18n="@@${f.i18n}">${f.label}</mat-label>
        <input matInput formControlName="${f.name}" molTrimOnBlur ${f.maxLength ? `maxlength="${f.maxLength}"` : ''} ${f.autocomplete ? `autocomplete="${f.autocomplete}"` : ''}>
        <mat-error *ngIf="form.get('${f.name}')?.hasError('required')" i18n="@@validation.required">This field is required</mat-error>
      </mat-form-field>`;
  }
}

function pageHeader(c) {
  const back = c.backLink ? ` [backLink]="'${c.backLink}'"` : '';
  const lede = c.lede ? ` lede="${c.lede}" i18n-lede="@@${c.i18n}.lede"` : '';
  return `<cn-page-header title="${c.title}" i18n-title="@@${c.i18n}.title"${lede}${back}></cn-page-header>`;
}

function listTemplate(f, c) {
  const cols = (c.columns || []).map(col => `    { key: '${col.key}', header: $localize\`:@@${c.i18n}.col.${col.key}:${col.header}\`${col.type ? `, type: '${col.type}'` : ''}${col.align ? `, align: '${col.align}'` : ''} }`).join(',\n');
  return {
    html: `${pageHeader(c)}

<div class="mol-page" fxLayout="column" fxLayoutGap="16px">
  <mol-error-banner [error]="error$ | async" (retry)="reload()"></mol-error-banner>

  <mol-page-section title="${c.sectionTitle || c.title}" i18n-title="@@${c.i18n}.section">
    <ng-container *ngIf="loading$ | async; else table">
      <mol-loading-panel [rows]="6"></mol-loading-panel>
    </ng-container>
    <ng-template #table>
      <cn-data-table *ngIf="(rows$ | async)?.length; else empty" [columns]="columns" [rows]="(rows$ | async) ?? []"
        caption="${c.title}" i18n-caption="@@${c.i18n}.caption" [pageSize]="25" [showPaginator]="true" (rowClick)="open($event)"></cn-data-table>
    </ng-template>
    <ng-template #empty>
      <mol-empty-state icon="${c.emptyIcon || 'inbox'}" title="${c.emptyTitle || 'Nothing to show yet'}" i18n-title="@@${c.i18n}.empty"
        body="${c.emptyBody || ''}" i18n-body="@@${c.i18n}.emptyBody"></mol-empty-state>
    </ng-template>
  </mol-page-section>
</div>
`,
    ts: `import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';

import { CnColumn } from '@meridian/canopy-ui/data-display';

import { ${f.entity} } from '../../../../core/api/models';
import { ${f.storeName}Actions } from '../../store/${f.name}.actions';
import { ${f.selectorsName} } from '../../store/${f.name}.selectors';

/** ${c.purpose} */
@Component({
  selector: 'mol-${c.name}',
  templateUrl: './${c.name}.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ${pascal(c.name)}Component implements OnInit {
  readonly rows$ = this.store.select(${f.selectorsName}.selectAll);
  readonly loading$ = this.store.select(${f.selectorsName}.selectLoading);
  readonly error$ = this.store.select(${f.selectorsName}.selectError);

  readonly columns: CnColumn<${f.entity}>[] = [
${cols}
  ];

  constructor(private readonly store: Store, private readonly router: Router) {}

  ngOnInit(): void {
    this.store.dispatch(${f.storeName}Actions.load());
  }

  reload(): void {
    this.store.dispatch(${f.storeName}Actions.load());
  }

  open(row: ${f.entity}): void {
    ${c.rowLink ? `void this.router.navigate(['${c.rowLink}', row.${f.idKey}]);` : `this.store.dispatch(${f.storeName}Actions.select({ id: row.${f.idKey} }));`}
  }
}
`
  };
}

function detailTemplate(f, c) {
  const rows = (c.fields || []).map(fl => `      <div class="mol-dl__row" fxLayout="row" fxLayout.lt-md="column" fxLayoutGap="16px">
        <dt fxFlex="220px" i18n="@@${c.i18n}.${fl.name}">${fl.label}</dt>
        <dd fxFlex>{{ ${fl.expr} }}</dd>
      </div>`).join('\n');
  return {
    html: `${pageHeader(c)}

<div class="mol-page" fxLayout="column" fxLayoutGap="16px" *ngIf="item$ | async as item; else loading">
  <cn-card [padded]="true">
    <dl class="mol-dl">
${rows}
    </dl>
  </cn-card>
</div>
<ng-template #loading>
  <mol-loading-panel [rows]="5"></mol-loading-panel>
</ng-template>
`,
    ts: `import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { ${f.entity} } from '../../../../core/api/models';
import { ${f.storeName}Actions } from '../../store/${f.name}.actions';
import { ${f.selectorsName} } from '../../store/${f.name}.selectors';

/** ${c.purpose} */
@Component({
  selector: 'mol-${c.name}',
  templateUrl: './${c.name}.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ${pascal(c.name)}Component implements OnInit {
  readonly item$: Observable<${f.entity} | undefined> = this.route.paramMap.pipe(
    map(p => p.get('${c.param || 'id'}') ?? ''),
    switchMap(id => this.store.select(${f.selectorsName}.selectById(id)))
  );

  constructor(private readonly store: Store, private readonly route: ActivatedRoute) {}

  ngOnInit(): void {
    this.store.dispatch(${f.storeName}Actions.load());
  }
}
`
  };
}

function formTemplate(f, c) {
  const untyped = !!c.untyped;
  const fields = c.fields || [];
  const selects = fields.filter(x => x.type === 'select');
  const controls = fields.map(x => fieldControl(x, untyped)).join(',\n');
  const groups = [];
  for (let i = 0; i < fields.length; i += 2) groups.push(fields.slice(i, i + 2));
  const html = groups.map(g => `    <div fxLayout="row" fxLayout.lt-md="column" fxLayoutGap="16px">\n${g.map(fieldTemplate).join('\n')}\n    </div>`).join('\n');
  const formsImport = untyped
    ? `import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';`
    : `import { FormControl, FormGroup, Validators } from '@angular/forms';`;
  const formDecl = untyped
    ? `  readonly form: UntypedFormGroup = this.fb.group({\n${controls}\n  });`
    : `  readonly form = new FormGroup({\n${controls}\n  });`;
  const ctorExtra = untyped ? 'private readonly fb: UntypedFormBuilder, ' : '';
  const selectOptions = selects.map(s => `  readonly ${s.name}Options: CnSelectOption<string>[] = [\n${(s.options || []).map(o => `    { value: '${o.value}', label: $localize\`:@@${c.i18n}.${s.name}.${o.value}:${o.label}\` }`).join(',\n')}\n  ];`).join('\n');
  return {
    html: `${pageHeader(c)}

<form class="mol-page mol-form" [formGroup]="form" (ngSubmit)="submit()" novalidate fxLayout="column" fxLayoutGap="16px">
  <cn-error-summary [form]="form" *ngIf="submitted && form.invalid"></cn-error-summary>
  <mol-error-banner [error]="error" [showRetry]="false"></mol-error-banner>

  <cn-card [padded]="true">
${html}
  </cn-card>

  <div fxLayout="row" fxLayout.lt-md="column" fxLayoutGap="8px" fxLayoutAlign="end">
    <cn-button variant="tertiary" type="button" (pressed)="cancel()" i18n="@@action.cancel">Cancel</cn-button>
    <cn-button variant="primary" type="submit" [loading]="saving" i18n="@@${c.i18n}.submit">${c.submitLabel || 'Save'}</cn-button>
  </div>
</form>
`,
    ts: `import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
${formsImport}
import { Router } from '@angular/router';
${f.entity ? "import { Store } from '@ngrx/store';\n" : ''}
${selects.length ? `import { CnSelectOption } from '@meridian/canopy-ui/forms';\n` : ''}import { CnToastService } from '@meridian/canopy-ui/overlays';

import { AppError } from '../../../../core/errors/app-error.model';
import { HasUnsavedChanges } from '../../../../core/guards/unsaved-changes.guard';
import { ${f.apiService} } from '../../../../core/api/${f.apiFile}';
${f.entity ? `import { ${f.storeName}Actions } from '../../store/${f.name}.actions';\n` : ''}
/** ${c.purpose} */
@Component({
  selector: 'mol-${c.name}',
  templateUrl: './${c.name}.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ${pascal(c.name)}Component implements HasUnsavedChanges {
${formDecl}
${selectOptions}
  readonly today = new Date().toISOString().slice(0, 10);
  submitted = false;
  saving = false;
  error: AppError | null = null;

  constructor(
    ${ctorExtra}private readonly api: ${f.apiService},
${f.entity ? '    private readonly store: Store,\n' : ''}    private readonly router: Router,
    private readonly toast: CnToastService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  hasUnsavedChanges(): boolean {
    return this.form.dirty && !this.saving;
  }

  submit(): void {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }
    this.saving = true;
    this.error = null;
    ${c.submitCall}.subscribe({
      next: () => {
        this.saving = false;
        this.form.markAsPristine();
        this.toast.success($localize\`:@@${c.i18n}.saved:${c.successToast || 'Saved'}\`);
${f.entity ? `        this.store.dispatch(${f.storeName}Actions.load());\n` : ''}        void this.router.navigate(['${c.afterSubmit || '..'}']);
      },
      error: (err: AppError) => {
        this.saving = false;
        this.error = err;
        this.cdr.markForCheck();
      }
    });
  }

  cancel(): void {
    void this.router.navigate(['${c.afterSubmit || '..'}']);
  }
}
`
  };
}

function widgetTemplate(f, c) {
  return {
    html: `<cn-card title="${c.title}" i18n-title="@@${c.i18n}.title" [padded]="true" class="mol-widget">
  <a cnCardAction *ngIf="link" [routerLink]="link" class="mol-widget__link" i18n="@@${c.i18n}.viewAll">${c.linkLabel || 'View all'}</a>
  <ng-container *ngIf="loading$ | async; else content">
    <mol-loading-panel [rows]="3"></mol-loading-panel>
  </ng-container>
  <ng-template #content>
    <cn-list *ngIf="(items$ | async)?.length; else empty" [items]="(items$ | async) ?? []" [dense]="true" [interactive]="!!link" (itemSelect)="open($event)"></cn-list>
  </ng-template>
  <ng-template #empty>
    <mol-empty-state [icon]="null" title="${c.emptyTitle || 'Nothing to show'}" i18n-title="@@${c.i18n}.empty"></mol-empty-state>
  </ng-template>
</cn-card>
`,
    ts: `import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { CnListItem } from '@meridian/canopy-ui/data-display';

import { ${f.entity} } from '../../../../core/api/models';
import { ${f.storeName}Actions } from '../../store/${f.name}.actions';
import { ${f.selectorsName} } from '../../store/${f.name}.selectors';

/** ${c.purpose} */
@Component({
  selector: 'mol-${c.name}',
  templateUrl: './${c.name}.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ${pascal(c.name)}Component implements OnInit {
  @Input() limit = ${c.limit || 5};
  @Input() link: string | null = ${c.link ? `'${c.link}'` : 'null'};

  readonly loading$ = this.store.select(${f.selectorsName}.selectLoading);
  readonly items$: Observable<CnListItem<${f.entity}>[]> = this.store
    .select(${f.selectorsName}.selectAll)
    .pipe(map(rows => rows.slice(0, this.limit).map(r => this.toItem(r))));

  constructor(private readonly store: Store, private readonly router: Router) {}

  ngOnInit(): void {
    this.store.dispatch(${f.storeName}Actions.load());
  }

  open(item: CnListItem<${f.entity}>): void {
    if (this.link) {
      void this.router.navigate([this.link, item.id]);
    }
  }

  private toItem(r: ${f.entity}): CnListItem<${f.entity}> {
    return { id: r.${f.idKey}, primary: ${c.primary}, secondary: ${c.secondary || 'undefined'}, meta: ${c.meta || 'undefined'}, data: r };
  }
}
`
  };
}

function staticTemplate(f, c) {
  const paras = (c.paragraphs || []).map((p, i) => `  <p i18n="@@${c.i18n}.p${i + 1}">${p}</p>`).join('\n');
  return {
    html: `${pageHeader(c)}

<div class="mol-page mol-prose" fxLayout="column" fxLayoutGap="12px">
${paras}
${c.disclosureKey ? `  <cn-disclosure key="${c.disclosureKey}" tone="boxed" [collapsible]="true"></cn-disclosure>` : ''}
${c.actions ? c.actions.map(a => `  <cn-button variant="${a.variant || 'secondary'}" routerLink="${a.link}" i18n="@@${c.i18n}.${a.id}">${a.label}</cn-button>`).join('\n') : ''}
</div>
`,
    ts: `import { ChangeDetectionStrategy, Component } from '@angular/core';

/** ${c.purpose} */
@Component({
  selector: 'mol-${c.name}',
  templateUrl: './${c.name}.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ${pascal(c.name)}Component {}
`
  };
}

function dialogTemplate(f, c) {
  return {
    html: `<cn-dialog-shell title="${c.title}" i18n-title="@@${c.i18n}.title" [busy]="busy" [destructive]="${!!c.destructive}">
  <p i18n="@@${c.i18n}.body">${c.body}</p>
  <mol-error-banner [error]="error" [showRetry]="false"></mol-error-banner>
  <div cnDialogActions fxLayout="row" fxLayoutGap="8px" fxLayoutAlign="end">
    <cn-button variant="tertiary" (pressed)="ref.close(false)" i18n="@@action.cancel">Cancel</cn-button>
    <cn-button variant="${c.destructive ? 'destructive' : 'primary'}" [loading]="busy" (pressed)="confirm()" i18n="@@${c.i18n}.confirm">${c.confirmLabel || 'Confirm'}</cn-button>
  </div>
</cn-dialog-shell>
`,
    ts: `import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { AppError } from '../../../../core/errors/app-error.model';
import { ${f.apiService} } from '../../../../core/api/${f.apiFile}';

export interface ${pascal(c.name)}Data {
  ${c.dataFields || 'id: string;'}
}

/** ${c.purpose} */
@Component({
  selector: 'mol-${c.name}',
  templateUrl: './${c.name}.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ${pascal(c.name)}Component {
  busy = false;
  error: AppError | null = null;

  constructor(
    readonly ref: MatDialogRef<${pascal(c.name)}Component, boolean>,
    @Inject(MAT_DIALOG_DATA) readonly data: ${pascal(c.name)}Data,
    private readonly api: ${f.apiService},
    private readonly cdr: ChangeDetectorRef
  ) {}

  confirm(): void {
    this.busy = true;
    this.error = null;
    ${c.confirmCall}.subscribe({
      next: () => this.ref.close(true),
      error: (err: AppError) => {
        this.busy = false;
        this.error = err;
        this.cdr.markForCheck();
      }
    });
  }
}
`
  };
}

const TEMPLATES = { list: listTemplate, detail: detailTemplate, form: formTemplate, widget: widgetTemplate, static: staticTemplate, dialog: dialogTemplate };

function specTemplate(f, c) {
  const kind = c.kind;
  const needsStore = kind !== 'static' && kind !== 'dialog' && !!f.entity;
  const needsApi = kind === 'form' || kind === 'dialog';
  const needsDialog = kind === 'dialog';
  return `import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
${needsStore ? "import { provideMockStore } from '@ngrx/store/testing';\n" : ''}${needsDialog ? "import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';\n" : ''}
import { SharedModule } from '../../../../shared/shared.module';
${needsApi ? `import { ${f.apiService} } from '../../../../core/api/${f.apiFile}';\n` : ''}import { ${pascal(c.name)}Component } from './${c.name}.component';

describe('${pascal(c.name)}Component', () => {
  let fixture: ComponentFixture<${pascal(c.name)}Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [${pascal(c.name)}Component],
      imports: [SharedModule, HttpClientTestingModule, RouterTestingModule, NoopAnimationsModule],
      providers: [
${needsStore ? `        provideMockStore({ initialState: { ${f.name}: { ids: [], entities: {}, loading: false, error: null, selectedId: null, loadedAt: null } } }),\n` : ''}${needsApi ? `        { provide: ${f.apiService}, useValue: {} },\n` : ''}${needsDialog ? `        { provide: MatDialogRef, useValue: { close: () => undefined } },\n        { provide: MAT_DIALOG_DATA, useValue: { id: 'TEST-1' } },\n` : ''}      ]
    }).compileComponents();

    fixture = TestBed.createComponent(${pascal(c.name)}Component);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
`;
}

// ---------------------------------------------------------------------------------------------
// store
// ---------------------------------------------------------------------------------------------

function storeFiles(f) {
  const base = `src/app/features/${f.name}/store/${f.name}`;
  write(`${base}.actions.ts`, `
import { createActionGroup, emptyProps, props } from '@ngrx/store';

import { ${f.entity} } from '../../../core/api/models';
import { AppError } from '../../../core/errors/app-error.model';

export const ${f.storeName}Actions = createActionGroup({
  source: '${pascal(f.name)}',
  events: {
    Load: emptyProps(),
    Loaded: props<{ items: ${f.entity}[] }>(),
    'Load Failed': props<{ error: AppError }>(),
    Select: props<{ id: string | null }>(),
    Upsert: props<{ item: ${f.entity} }>(),
    Remove: props<{ id: string }>(),
    Invalidate: emptyProps()
  }
});
`);
  write(`${base}.reducer.ts`, `
import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';

import { ${f.entity} } from '../../../core/api/models';
import { AppError } from '../../../core/errors/app-error.model';
import { ${f.storeName}Actions } from './${f.name}.actions';

export const ${f.storeName}FeatureKey = '${f.name}';

export interface ${pascal(f.name)}State extends EntityState<${f.entity}> {
  loading: boolean;
  error: AppError | null;
  selectedId: string | null;
  /** Epoch ms of the last successful load; effects skip a reload inside the stale window. */
  loadedAt: number | null;
}

export const ${f.storeName}Adapter = createEntityAdapter<${f.entity}>({
  selectId: item => item.${f.idKey}${f.sortBy ? `,\n  sortComparer: ${f.sortBy}` : ''}
});

export const initial${pascal(f.name)}State: ${pascal(f.name)}State = ${f.storeName}Adapter.getInitialState({
  loading: false,
  error: null,
  selectedId: null,
  loadedAt: null
});

export const ${f.storeName}Reducer = createReducer(
  initial${pascal(f.name)}State,
  on(${f.storeName}Actions.load, state => ({ ...state, loading: true, error: null })),
  on(${f.storeName}Actions.loaded, (state, { items }) => ${f.storeName}Adapter.setAll(items, { ...state, loading: false, loadedAt: Date.now() })),
  on(${f.storeName}Actions.loadFailed, (state, { error }) => ({ ...state, loading: false, error })),
  on(${f.storeName}Actions.select, (state, { id }) => ({ ...state, selectedId: id })),
  on(${f.storeName}Actions.upsert, (state, { item }) => ${f.storeName}Adapter.upsertOne(item, state)),
  on(${f.storeName}Actions.remove, (state, { id }) => ${f.storeName}Adapter.removeOne(id, state)),
  on(${f.storeName}Actions.invalidate, state => ({ ...state, loadedAt: null }))
);
`);
  write(`${base}.selectors.ts`, `
import { createFeatureSelector, createSelector } from '@ngrx/store';

import { ${f.storeName}Adapter, ${f.storeName}FeatureKey, ${pascal(f.name)}State } from './${f.name}.reducer';

const selectState = createFeatureSelector<${pascal(f.name)}State>(${f.storeName}FeatureKey);
const { selectAll, selectEntities, selectTotal } = ${f.storeName}Adapter.getSelectors(selectState);

export const ${f.selectorsName} = {
  selectState,
  selectAll,
  selectEntities,
  selectTotal,
  selectLoading: createSelector(selectState, s => s.loading),
  selectError: createSelector(selectState, s => s.error),
  selectLoadedAt: createSelector(selectState, s => s.loadedAt),
  selectSelectedId: createSelector(selectState, s => s.selectedId),
  selectSelected: createSelector(selectState, selectEntities, (s, e) => (s.selectedId ? e[s.selectedId] : undefined)),
  selectById: (id: string) => createSelector(selectEntities, e => e[id])
};
`);
  write(`${base}.effects.ts`, `
import { Injectable } from '@angular/core';
import { Actions, concatLatestFrom, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { catchError, filter, map, switchMap } from 'rxjs/operators';

import { ${f.apiService} } from '../../../core/api/${f.apiFile}';
import { AppError } from '../../../core/errors/app-error.model';
import { ${f.storeName}Actions } from './${f.name}.actions';
import { ${f.selectorsName} } from './${f.name}.selectors';

/** Anything loaded in the last ${f.staleSeconds || 60}s is fresh enough; the HTTP cache below this is the second line. */
const STALE_MS = ${(f.staleSeconds || 60) * 1000};

@Injectable()
export class ${pascal(f.name)}Effects {
  readonly load$ = createEffect(() =>
    this.actions$.pipe(
      ofType(${f.storeName}Actions.load),
      concatLatestFrom(() => this.store.select(${f.selectorsName}.selectLoadedAt)),
      filter(([, loadedAt]) => loadedAt === null || Date.now() - loadedAt > STALE_MS),
      switchMap(() =>
        this.api.${f.apiMethod}().pipe(
          map(items => ${f.storeName}Actions.loaded({ items })),
          catchError((error: AppError) => of(${f.storeName}Actions.loadFailed({ error })))
        )
      )
    )
  );

  constructor(private readonly actions$: Actions, private readonly store: Store, private readonly api: ${f.apiService}) {}
}
`);
  write(`${base}.reducer.spec.ts`, `
import { AppError } from '../../../core/errors/app-error.model';
import { ${f.storeName}Actions } from './${f.name}.actions';
import { initial${pascal(f.name)}State, ${f.storeName}Reducer } from './${f.name}.reducer';

describe('${f.storeName}Reducer', () => {
  const error: AppError = { kind: 'server', status: 500, title: 'boom', retryable: true, url: '/x', method: 'GET' };

  it('sets loading on load', () => {
    const state = ${f.storeName}Reducer(initial${pascal(f.name)}State, ${f.storeName}Actions.load());
    expect(state.loading).toBeTrue();
    expect(state.error).toBeNull();
  });

  it('stores items and stamps loadedAt on loaded', () => {
    const state = ${f.storeName}Reducer({ ...initial${pascal(f.name)}State, loading: true }, ${f.storeName}Actions.loaded({ items: [] }));
    expect(state.loading).toBeFalse();
    expect(state.loadedAt).not.toBeNull();
    expect(state.ids.length).toBe(0);
  });

  it('keeps the error on failure', () => {
    const state = ${f.storeName}Reducer({ ...initial${pascal(f.name)}State, loading: true }, ${f.storeName}Actions.loadFailed({ error }));
    expect(state.loading).toBeFalse();
    expect(state.error).toEqual(error);
  });

  it('clears loadedAt on invalidate', () => {
    const state = ${f.storeName}Reducer({ ...initial${pascal(f.name)}State, loadedAt: 1 }, ${f.storeName}Actions.invalidate());
    expect(state.loadedAt).toBeNull();
  });

  it('tracks the selected id', () => {
    const state = ${f.storeName}Reducer(initial${pascal(f.name)}State, ${f.storeName}Actions.select({ id: 'X-1' }));
    expect(state.selectedId).toBe('X-1');
  });
});
`);
}

// ---------------------------------------------------------------------------------------------
// module + routing
// ---------------------------------------------------------------------------------------------

function moduleFiles(f) {
  const dir = `src/app/features/${f.name}`;
  const comps = f.components;
  const imports = comps.map(c => `import { ${pascal(c.name)}Component } from './components/${c.name}/${c.name}.component';`).join('\n');
  const decl = comps.map(c => pascal(c.name) + 'Component').join(',\n    ');
  const hasStore = !!f.entity;
  write(`${dir}/${f.name}.module.ts`, `
import { NgModule } from '@angular/core';
${hasStore ? "import { EffectsModule } from '@ngrx/effects';\nimport { StoreModule } from '@ngrx/store';\n" : ''}
import { SharedModule } from '../../shared/shared.module';
import { ${pascal(f.name)}RoutingModule } from './${f.name}-routing.module';
${hasStore ? `import { ${pascal(f.name)}Effects } from './store/${f.name}.effects';\nimport { ${f.storeName}FeatureKey, ${f.storeName}Reducer } from './store/${f.name}.reducer';\n` : ''}${imports}

/** ${f.description} */
@NgModule({
  declarations: [
    ${decl}
  ],
  imports: [
    SharedModule,
    ${pascal(f.name)}RoutingModule${hasStore ? `,\n    StoreModule.forFeature(${f.storeName}FeatureKey, ${f.storeName}Reducer),\n    EffectsModule.forFeature([${pascal(f.name)}Effects])` : ''}
  ]
})
export class ${pascal(f.name)}Module {}
`);
  const routes = comps
    .filter(c => c.route !== undefined)
    .map(c => {
      const extras = [];
      if (c.guards) extras.push(`canActivate: [${c.guards.join(', ')}]`);
      if (c.deactivate) extras.push('canDeactivate: [UnsavedChangesGuard]');
      if (c.resolve) extras.push(`resolve: { ${c.resolve} }`);
      if (c.routeData) extras.push(`data: ${c.routeData}`);
      return `  { path: '${c.route}', component: ${pascal(c.name)}Component${extras.length ? ', ' + extras.join(', ') : ''} }`;
    });
  const guardImports = new Set();
  comps.forEach(c => {
    (c.guards || []).forEach(g => guardImports.add(g));
    if (c.deactivate) guardImports.add('UnsavedChangesGuard');
  });
  const resolverImports = new Set();
  comps.forEach(c => {
    if (c.resolve) c.resolve.split(',').forEach(part => resolverImports.add(part.split(':')[1].trim()));
  });
  write(`${dir}/${f.name}-routing.module.ts`, `
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

${guardImports.size ? `import { ${[...guardImports].sort().join(', ')} } from '../../core/guards';\n` : ''}${resolverImports.size ? `import { ${[...resolverImports].sort().join(', ')} } from '../../core/resolvers';\n` : ''}${comps.filter(c => c.route !== undefined).map(c => `import { ${pascal(c.name)}Component } from './components/${c.name}/${c.name}.component';`).join('\n')}

const routes: Routes = [
${routes.join(',\n')}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ${pascal(f.name)}RoutingModule {}
`);
}

// ---------------------------------------------------------------------------------------------

for (const name of targets) {
  const f = SPEC.features[name];
  if (!f) {
    console.error(`no feature "${name}" in feature-spec.json`);
    process.exit(1);
  }
  f.name = name;
  f.storeName = camel(name);
  f.selectorsName = `${camel(name)}Selectors`;
  if (f.entity) storeFiles(f);
  moduleFiles(f);
  for (const c of f.components) {
    c.i18n = c.i18n || `${camel(name)}.${camel(c.name)}`;
    const t = TEMPLATES[c.kind];
    if (!t) throw new Error(`unknown kind ${c.kind} on ${c.name}`);
    const out = t(f, c);
    const dir = `src/app/features/${name}/components/${c.name}`;
    write(`${dir}/${c.name}.component.ts`, out.ts);
    write(`${dir}/${c.name}.component.html`, out.html);
    if (c.spec !== false) write(`${dir}/${c.name}.component.spec.ts`, specTemplate(f, c));
  }
}

console.log(written.length ? written.join('\n') : 'nothing written (use --force to overwrite)');
